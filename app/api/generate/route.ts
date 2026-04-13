import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { BLACKLISTED_HASHTAGS } from '@/lib/constants'

export const maxDuration = 60

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM = `You write TikTok captions for @braydens.archery — Brayden Castille, 11-year-old competitive archer. State Record Holder, State Champion, Shooter of the Year. TRX34, A3 Staff, Eagle Pins class.

VOICE (match exactly):
• "11 year Old Future Pro Shooter"
• "11 years old with Pro Shooter Dreams"
• "180 arrows after school on a Tuesday"
• "Friday Practice!"
• "New Toy!!"
• "Dad's Scores — Cuts me no slack"
• "11 Years Old 270 with 8-12 rings"
• "Nailed 12 Ring!"

RULES:
- 1–2 sentences MAX. Short. Let footage speak.
- Lead with "11 years old" when it fits naturally
- Humble grind energy. NOT braggy.
- NEVER: bowhunt, bowhunting, hunting, deerhunting, huntinglife, bowhunter
- EXACTLY 5 hashtags. Always #A3archery #hoytarchery. Fill 3 from: #mathewsarchery #3darchery #asaarchery #archerylife #youtharchery #futureproshooter #youngathlete #archeryjourney`

async function generatePost(
  postNumber: number,
  mediaIndices: number[],
  context: { tournament?: string; scores?: string; notes?: string }
): Promise<Record<string, unknown>> {
  const prompt = `Write 1 TikTok post for post #${postNumber}.
Files assigned: [${mediaIndices.join(',')}]
${context.tournament ? `Event: ${context.tournament}` : ''}
${context.scores ? `Scores: ${context.scores}` : ''}
${context.notes ? `Notes: ${context.notes}` : ''}

Respond ONLY with this JSON (no markdown):
{"postNumber":${postNumber},"title":"short title","mediaIndices":[${mediaIndices.join(',')}],"caption":"caption here","hashtags":["#A3archery","#hoytarchery","#3darchery","#archerylife","#youtharchery"],"hook":"first frame idea","sound":"sound suggestion","postTime":"best post time","vibe":"practice"}`

  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    system: SYSTEM,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error(`Post ${postNumber}: bad response`)

  const post = JSON.parse(match[0])

  // Sanitize hashtags
  if (Array.isArray(post.hashtags)) {
    post.hashtags = post.hashtags
      .filter((t: string) => !BLACKLISTED_HASHTAGS.has(t.replace(/^#/, '').toLowerCase()))
      .slice(0, 5)
  }
  post.mediaIndices = mediaIndices // always use our pre-assigned indices

  return post
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  const { files, postCount, tournament, scores, notes } = body as {
    files: { i: number; kind: string }[]
    postCount: number
    tournament?: string
    scores?: string
    notes?: string
  }

  // Distribute media across posts client-side
  const videoIdx = files.filter(f => f.kind === 'video').map(f => f.i)
  const imageIdx = files.filter(f => f.kind === 'image').map(f => f.i)

  const postMedia: Record<number, number[]> = {}
  for (let p = 1; p <= postCount; p++) postMedia[p] = []
  videoIdx.forEach((vi, i) => postMedia[(i % postCount) + 1].unshift(vi))
  imageIdx.forEach((ii, i) => postMedia[(i % postCount) + 1].push(ii))

  const ctx = { tournament, scores, notes }
  const encoder = new TextEncoder()

  // Stream: generate each post individually, send as it finishes
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) =>
        controller.enqueue(encoder.encode(JSON.stringify(data) + '\n'))

      // Generate all posts concurrently with Promise.allSettled so one failure doesn't kill all
      const promises = Array.from({ length: postCount }, (_, i) => {
        const postNum = i + 1
        return generatePost(postNum, postMedia[postNum], ctx)
          .then(post => { send({ post }) })
          .catch(err => { send({ error: `Post ${postNum} failed: ${err.message}` }) })
      })

      await Promise.allSettled(promises)
      send({ done: true })
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  })
}
