import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { BLACKLISTED_HASHTAGS } from '@/lib/constants'

export const maxDuration = 60

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

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
• "Road to ASA Pro"

RULES:
- 1–2 sentences MAX. Short. Let footage speak.
- Lead with "11 years old" when it fits
- Humble, grind energy. NOT braggy.
- NEVER: bowhunt, bowhunting, hunting, deerhunting, huntinglife, bowhunter
- EXACTLY 5 hashtags. Always include #A3archery #hoytarchery. Fill remaining 3 from: #mathewsarchery #3darchery #asaarchery #archerylife #youtharchery #futureproshooter #youngathlete #archeryjourney`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (body.mode === 'batch') return await handleBatch(body)
    return NextResponse.json({ success: false, error: 'Unknown mode' }, { status: 400 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Generate error:', msg)
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

// Split indices into N roughly-equal chunks
function chunkIndices(indices: number[], n: number): number[][] {
  const size = Math.ceil(indices.length / n)
  const chunks: number[][] = []
  for (let i = 0; i < indices.length; i += size) {
    chunks.push(indices.slice(i, i + size))
  }
  return chunks
}

async function generateOneBatch(
  postNumbers: number[],
  assignedMedia: Record<number, number[]>,
  context: { tournament?: string; scores?: string; notes?: string }
): Promise<unknown[]> {
  const postDescriptions = postNumbers.map(n => {
    const indices = assignedMedia[n] || []
    return `Post ${n}: files [${indices.join(',')}]`
  }).join('\n')

  const prompt = `Write ${postNumbers.length} TikTok posts.
${context.tournament ? `Event: ${context.tournament}` : ''}
${context.scores ? `Scores: ${context.scores}` : ''}
${context.notes ? `Notes: ${context.notes}` : ''}

${postDescriptions}

Respond ONLY with valid JSON, no markdown:
{"posts":[{"postNumber":1,"title":"short title","mediaIndices":[0,3],"caption":"caption here","hashtags":["#A3archery","#hoytarchery","#3darchery","#archerylife","#youtharchery"],"hook":"first frame idea","sound":"sound suggestion","postTime":"best post time","vibe":"practice"}]}`

  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 800,
    system: SYSTEM,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('Bad AI response')
  const parsed = JSON.parse(match[0])
  return parsed.posts ?? []
}

async function handleBatch(body: {
  files: { i: number; kind: string }[]
  postCount: number
  tournament?: string
  scores?: string
  notes?: string
}) {
  const { files, postCount, tournament, scores, notes } = body

  // Distribute media across posts up-front (no AI needed for this)
  const videoIndices = files.filter(f => f.kind === 'video').map(f => f.i)
  const imageIndices = files.filter(f => f.kind === 'image').map(f => f.i)

  // Round-robin assign: videos first (TikTok plays first file as reel), then images
  const postMedia: Record<number, number[]> = {}
  for (let p = 1; p <= postCount; p++) postMedia[p] = []

  // Spread videos across posts (video as first item)
  videoIndices.forEach((vi, idx) => {
    const post = (idx % postCount) + 1
    postMedia[post].unshift(vi)
  })

  // Fill with images
  imageIndices.forEach((ii, idx) => {
    const post = (idx % postCount) + 1
    postMedia[post].push(ii)
  })

  // Split posts into batches of 3 and run in parallel
  const BATCH_SIZE = 3
  const allPostNums = Array.from({ length: postCount }, (_, i) => i + 1)
  const batches: number[][] = []
  for (let i = 0; i < allPostNums.length; i += BATCH_SIZE) {
    batches.push(allPostNums.slice(i, i + BATCH_SIZE))
  }

  const ctx = { tournament, scores, notes }
  const batchResults = await Promise.all(
    batches.map(batch => generateOneBatch(batch, postMedia, ctx))
  )

  const posts = batchResults.flat()

  // Override mediaIndices with our pre-assigned distribution, sanitize hashtags
  for (const post of posts) {
    const p = post as {
      postNumber: number
      mediaIndices: number[]
      hashtags: string[]
    }
    p.mediaIndices = postMedia[p.postNumber] ?? p.mediaIndices ?? []
    if (Array.isArray(p.hashtags)) {
      p.hashtags = p.hashtags
        .filter((tag: string) => !BLACKLISTED_HASHTAGS.has(tag.replace(/^#/, '').toLowerCase()))
        .slice(0, 5)
    }
  }

  // Sort by postNumber
  posts.sort((a, b) => (a as { postNumber: number }).postNumber - (b as { postNumber: number }).postNumber)

  return NextResponse.json({ success: true, posts })
}
