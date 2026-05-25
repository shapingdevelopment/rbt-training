import { auth } from '@clerk/nextjs/server'
import { Anthropic } from '@anthropic-ai/sdk'
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages'
import { getAdminClient } from '@/lib/supabase'
import { RBT_TASK_LIST, SCORING_STANDARDS } from '@/lib/rbt-context'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Appended to every scenario prompt
const FORMATTING_RULES = `

FORMATTING RULES — follow strictly at all times:
- Write in plain conversational prose. No markdown whatsoever.
- No asterisks, no bold, no italics, no bullet points, no headers, no backticks.
- Write actions and scene-setting in parentheses e.g. (The client looks away) not *The client looks away*
- Keep each response to 2-4 sentences per turn unless scoring feedback requires more.
`

// Builds the full system prompt:
// 1. BACB curriculum context (RBT_TASK_LIST)
// 2. Scoring standards (COMPETENCY_SCORE format)
// 3. The scenario-specific prompt from Supabase
// 4. Formatting rules
function buildSystemPrompt(scenarioPrompt: string): string {
  return [
    RBT_TASK_LIST,
    SCORING_STANDARDS,
    '---',
    scenarioPrompt,
    FORMATTING_RULES,
  ].join('\n\n').trim()
}

// Minimal fallback only used if the scenario ID is not found in Supabase at all
const FALLBACK_PROMPT = `You are an ABA clinical supervisor running a practice simulation for an RBT trainee.
Greet the trainee, describe a realistic clinical scenario involving a client with challenging behavior, and wait for their response.
After 5+ exchanges output:
<COMPETENCY_SCORE>{"domain":"general","score":0,"strengths":[],"improvement_areas":[]}</COMPETENCY_SCORE>`

export async function POST(request: Request) {
  try {
    const { userId } = await auth()

    const { scenarioId, messages } = await request.json()

    if (!scenarioId || !messages) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: scenarioId and messages' }),
        { status: 400 }
      )
    }

    // ── Fetch scenario prompt from Supabase ──────────────────────────────────
    let scenarioPrompt = FALLBACK_PROMPT
    try {
      const admin = getAdminClient()
      const { data, error } = await admin
        .from('scenarios')
        .select('system_prompt, title')
        .eq('id', scenarioId)
        .single()

      if (error) {
        console.warn(`[chat] Scenario not found in DB: ${scenarioId} — ${error.message}`)
      } else if (data?.system_prompt) {
        scenarioPrompt = data.system_prompt
      }
    } catch (e: any) {
      console.error('[chat] Supabase lookup failed:', e.message)
    }

    const systemPrompt = buildSystemPrompt(scenarioPrompt)

    // ── Format messages ──────────────────────────────────────────────────────
    // __START_SESSION__ → ask Claude to open the scenario with a greeting
    const isStart = messages.length === 1 && messages[0].content === '__START_SESSION__'
    const formattedMessages: MessageParam[] = isStart
      ? [{
          role: 'user',
          content: 'Begin the scenario now. Set the scene, introduce the situation, and wait for my first response. Use plain prose only — no markdown.',
        }]
      : messages.map((msg: { role: string; content: string }) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }))

    // ── Stream response from Claude ──────────────────────────────────────────
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      system: systemPrompt,
      messages: formattedMessages,
      stream: true,
    })

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of response) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
              )
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (streamError) {
          console.error('[chat] Stream error:', streamError)
          controller.error(streamError)
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error: any) {
    console.error('[chat] API error:', error.message)
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }),
      { status: 500 }
    )
  }
}
