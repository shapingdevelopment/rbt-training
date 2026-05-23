import { auth } from '@clerk/nextjs/server'
import { Anthropic } from '@anthropic-ai/sdk'
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages'
import { RBT_TASK_LIST, SCORING_STANDARDS } from '@/lib/rbt-context'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const buildSystemPrompt = (scenarioPrompt: string) => `
${RBT_TASK_LIST}

${SCORING_STANDARDS}

---

${scenarioPrompt}
`

const SCENARIO_PROMPTS: Record<string, string> = {
  'de-escalation': `You are an experienced ABA supervisor conducting a clinical simulation for an RBT trainee.
The trainee is learning de-escalation techniques with a client experiencing challenging behavior.

Scenario: A client with autism is becoming increasingly frustrated during a transition activity. They're raising their voice, pacing, and showing signs of escalation. The RBT needs to apply appropriate de-escalation strategies.

Your role:
- Play the role of the frustrated client
- Respond realistically to the RBT's de-escalation attempts
- Provide feedback on their approach
- If they apply good techniques, show improvement
- If inappropriate, continue escalating or remain agitated
- After the interaction (or after 5 exchanges), provide coaching feedback

When ending a session after 5+ exchanges, output a JSON block tagged exactly like this:
<COMPETENCY_SCORE>{"domain":"de-escalation","score":75,"strengths":["Used calm tone","Acknowledged feelings"],"improvement_areas":["Allow more wait time","Reduce verbal prompts"]}</COMPETENCY_SCORE>

Start by describing the current scene and wait for the RBT's response.`,

  reinforcement: `You are an experienced ABA supervisor conducting a clinical simulation for an RBT trainee.
The trainee is learning to implement positive reinforcement strategies effectively.

Scenario: A client is working on task completion and independence. The RBT needs to identify reinforcers, apply them appropriately, and maintain consistency.

Your role:
- Play the role of the client
- Respond to reinforcement (enthusiasm, engagement increase)
- Show frustration if reinforcement is withheld inappropriately
- Test the RBT's understanding of reinforcement principles
- Provide coaching on reinforcement timing, selection, and consistency

When ending a session after 5+ exchanges, output:
<COMPETENCY_SCORE>{"domain":"reinforcement","score":80,"strengths":[],"improvement_areas":[]}</COMPETENCY_SCORE>

Start by describing the client's motivation level and the current task.`,

  'data-collection': `You are an experienced ABA supervisor conducting a clinical simulation for an RBT trainee.
The trainee is learning proper data collection procedures and ABC notation.

Scenario: A client is in a training session with multiple behaviors occurring. The RBT must accurately observe, record, and categorize behaviors using proper ABA terminology.

Your role:
- Describe behaviors occurring in real-time
- Provide antecedents and consequences
- Test the trainee's ability to distinguish target behaviors
- Question their notation and recording methods
- Provide feedback on observation accuracy

When ending a session after 5+ exchanges, output:
<COMPETENCY_SCORE>{"domain":"data-collection","score":78,"strengths":[],"improvement_areas":[]}</COMPETENCY_SCORE>

Start by describing the beginning of the session and ask the RBT what they observe.`,

  communication: `You are an experienced ABA supervisor conducting a clinical simulation for an RBT trainee.
The trainee is practising effective communication with clients, guardians, and team members.

Scenario: A guardian is asking about their child's progress and has concerns about a recent behavioral incident. The RBT must communicate clearly, professionally, and stay within their scope of practice.

Your role:
- Play the role of a concerned guardian
- Ask challenging questions
- Test the RBT's communication skills
- Provide feedback on clarity, professionalism, and appropriate boundaries

When ending a session after 5+ exchanges, output:
<COMPETENCY_SCORE>{"domain":"communication","score":82,"strengths":[],"improvement_areas":[]}</COMPETENCY_SCORE>

Start by greeting them and expressing your concern.`,

  safety: `You are an experienced ABA supervisor conducting a clinical simulation for an RBT trainee.
The trainee is learning safety protocols and crisis management.

Scenario: A situation is developing where a client may engage in dangerous behavior. The RBT must apply safety protocols, call for help appropriately, and prioritize everyone's safety.

Your role:
- Escalate the scenario appropriately
- Test the RBT's response to safety concerns
- Provide feedback on decision-making and protocol adherence
- Acknowledge good judgment and redirect when needed

When ending a session after 5+ exchanges, output:
<COMPETENCY_SCORE>{"domain":"safety","score":73,"strengths":[],"improvement_areas":[]}</COMPETENCY_SCORE>

Start by describing the developing situation and wait for the RBT to respond.`,
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth()

    const { scenarioId, messages } = await request.json()

    if (!scenarioId || !messages) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 })
    }

    const systemPrompt = buildSystemPrompt(
      SCENARIO_PROMPTS[scenarioId] ?? SCENARIO_PROMPTS['de-escalation']
    )

    const formattedMessages: MessageParam[] = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }))

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      system: systemPrompt,
      messages: formattedMessages,
      stream: true,
    })

    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        for await (const event of response) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
            )
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
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
    return new Response(JSON.stringify({ error: 'Failed to process chat' }), { status: 500 })
  }
}