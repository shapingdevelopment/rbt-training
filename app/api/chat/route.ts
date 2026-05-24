import { auth } from '@clerk/nextjs/server'
import { Anthropic } from '@anthropic-ai/sdk'
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages'
import { supabaseAdmin } from '@/lib/supabase'
import { RBT_TASK_LIST, SCORING_STANDARDS } from '@/lib/rbt-context'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ─────────────────────────────────────────────────────────────────────────────
// buildSystemPrompt
// Injects the full BACB curriculum + scoring standards above every scenario
// prompt. Sent once per session as the `system` field — not on every message —
// so token cost is fixed regardless of conversation length.
// ─────────────────────────────────────────────────────────────────────────────
function buildSystemPrompt(scenarioPrompt: string): string {
  return `
${RBT_TASK_LIST}

${SCORING_STANDARDS}

---

${scenarioPrompt}
`.trim()
}

// ─────────────────────────────────────────────────────────────────────────────
// Fallback prompts — used ONLY if a scenario row has no system_prompt in
// Supabase (e.g. during local dev before the database is populated).
// Production scenarios should always have system_prompt set in the database.
// ─────────────────────────────────────────────────────────────────────────────
const FALLBACK_PROMPTS: Record<string, string> = {
  'de-escalation': `You are an experienced ABA supervisor conducting a clinical simulation for an RBT trainee.
The trainee is practising de-escalation techniques with a client experiencing challenging behavior.

Scenario: A client with autism is becoming increasingly frustrated during a transition activity. They are raising their voice, pacing, and showing signs of escalation. The RBT needs to apply appropriate de-escalation strategies consistent with Section E of the 40-hour curriculum (antecedent interventions, behavior reduction).

Your role:
- Play the role of the frustrated client
- Respond realistically to the RBT's de-escalation attempts
- If they use calm tone, reduced verbal prompts, and wait time — show gradual improvement
- If they increase demands, raise their voice, or overwhelm the client — continue escalating
- After 5+ exchanges, provide coaching feedback referencing specific curriculum areas

When ending the session after 5+ exchanges, output a JSON block tagged exactly like this:
<COMPETENCY_SCORE>{"domain":"de-escalation","score":75,"strengths":["Used calm tone","Acknowledged feelings"],"improvement_areas":["Allow more wait time","Reduce verbal prompts"]}</COMPETENCY_SCORE>

Start by describing the scene in one vivid sentence and wait for the RBT's response.`,

  reinforcement: `You are an experienced ABA supervisor conducting a clinical simulation for an RBT trainee.
The trainee is practising positive reinforcement strategies as covered in Section E of the curriculum.

Scenario: A client is working on task completion with a goal of building independence. The RBT needs to identify effective reinforcers, deliver them contingently and immediately, and maintain a consistent reinforcement schedule.

Your role:
- Play the role of the client — motivated when reinforcement is delivered correctly, disengaged when it is not
- Test the RBT's understanding of reinforcement timing, selection, and schedules (CRF vs. intermittent)
- If reinforcement is delayed, inconsistent, or non-contingent — show decreased engagement
- After 5+ exchanges, provide coaching referencing reinforcement principles

When ending the session after 5+ exchanges, output:
<COMPETENCY_SCORE>{"domain":"reinforcement","score":80,"strengths":[],"improvement_areas":[]}</COMPETENCY_SCORE>

Start by describing the client's current motivation level and the task they are working on.`,

  'data-collection': `You are an experienced ABA supervisor conducting a clinical simulation for an RBT trainee.
The trainee is practising data collection and ABC notation as covered in Section C of the curriculum.

Scenario: A client is in a 30-minute training session. Multiple behaviors are occurring — some target behaviors, some not. The RBT must accurately observe, record using the correct measurement procedure, and categorize behaviors using proper ABA terminology.

Your role:
- Narrate behaviors occurring in the session in real-time (describe antecedent, behavior, consequence)
- Ask the RBT to identify what measurement procedure they are using and why
- Challenge imprecise operational definitions
- Test their ability to distinguish target from non-target behaviors
- After 5+ exchanges, provide feedback on observation accuracy and recording decisions

When ending the session after 5+ exchanges, output:
<COMPETENCY_SCORE>{"domain":"data-collection","score":78,"strengths":[],"improvement_areas":[]}</COMPETENCY_SCORE>

Start by setting the scene and asking the RBT what they observe.`,

  communication: `You are an experienced ABA supervisor conducting a clinical simulation for an RBT trainee.
The trainee is practising professional communication as covered in Sections F and G of the curriculum.

Scenario: A guardian calls to ask about their child's progress and expresses concern about a behavioral incident that occurred yesterday. The RBT must communicate clearly, stay within their scope of practice (refer clinical questions to supervisor), and maintain client confidentiality per Ethics Code 2.08-2.10.

Your role:
- Play the role of a concerned but reasonable guardian
- Ask progressively more specific clinical questions (e.g. "Why does my child do this?", "Should we change the plan?")
- Test whether the RBT appropriately redirects clinical questions to the BCBA
- Note if the RBT shares more information than necessary
- After 5+ exchanges, provide feedback on professionalism, boundaries, and scope of practice

When ending the session after 5+ exchanges, output:
<COMPETENCY_SCORE>{"domain":"communication","score":82,"strengths":[],"improvement_areas":[]}</COMPETENCY_SCORE>

Start by playing the guardian calling with a greeting and an initial concern.`,

  safety: `You are an experienced ABA supervisor conducting a clinical simulation for an RBT trainee.
The trainee is practising safety protocols and crisis management as covered in Section E (crisis intervention) of the curriculum.

Scenario: During a home visit, a client begins showing signs of serious behavioral escalation that may result in self-injury or injury to others. The RBT must apply safety protocols, make a judgment about when to call for help, and prioritize everyone's safety while maintaining a calm professional demeanor.

Your role:
- Narrate the escalating situation in real time
- Respond to the RBT's safety decisions (good decisions de-escalate slightly; poor decisions escalate further)
- Test their knowledge of when to call the supervisor vs. emergency services
- Test their ability to maintain safety without using unauthorized physical intervention
- After 5+ exchanges, provide feedback on decision-making and protocol adherence

When ending the session after 5+ exchanges, output:
<COMPETENCY_SCORE>{"domain":"safety","score":73,"strengths":[],"improvement_areas":[]}</COMPETENCY_SCORE>

Start by describing the developing situation in vivid detail and wait for the RBT to respond.`,
}

const DEFAULT_FALLBACK_ID = 'de-escalation'

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/chat
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    // Auth check — Clerk v6 requires await
    const { userId } = await auth()

    const body = await request.json()
    const { scenarioId, messages } = body as {
      scenarioId: string
      messages: { role: string; content: string }[]
    }

    if (!scenarioId || !messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: scenarioId and messages are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // ── Resolve scenario prompt ──────────────────────────────────────────────
    // 1. Try Supabase first (production path — prompt stored in database)
    // 2. Fall back to hardcoded prompts (dev/demo path)
    let rawScenarioPrompt: string | null = null

    try {
      const { data: scenario, error } = await supabaseAdmin
        .from('scenarios')
        .select('system_prompt, title')
        .eq('id', scenarioId)
        .single()

      if (!error && scenario?.system_prompt) {
        rawScenarioPrompt = scenario.system_prompt
      }
    } catch {
      // Supabase unavailable — fall through to fallback
    }

    if (!rawScenarioPrompt) {
      rawScenarioPrompt =
        FALLBACK_PROMPTS[scenarioId] ??
        FALLBACK_PROMPTS[DEFAULT_FALLBACK_ID]
    }

    // ── Build the full system prompt ─────────────────────────────────────────
    // Prepends RBT_TASK_LIST (curriculum + clinical definitions) and
    // SCORING_STANDARDS (mastery thresholds + COMPETENCY_SCORE tag format)
    const systemPrompt = buildSystemPrompt(rawScenarioPrompt)

    // ── Format messages for Anthropic ────────────────────────────────────────
    const formattedMessages: MessageParam[] = messages.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }))

    // ── Call Claude with streaming ───────────────────────────────────────────
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      system: systemPrompt,
      messages: formattedMessages,
      stream: true,
    })

    // ── Stream response back to client ───────────────────────────────────────
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
                encoder.encode(
                  `data: ${JSON.stringify({ text: event.delta.text })}\n\n`
                )
              )
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (streamError) {
          console.error('Stream error:', streamError)
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
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}