import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { BLACKLISTED_HASHTAGS } from '@/lib/constants'

export const maxDuration = 60 // Vercel max for Pro plan

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SYSTEM = `You write TikTok content for @braydens.archery — Brayden Castille, 11-year-old competitive archer. State Record Holder, State Champion, Shooter of the Year. Shoots TRX34, A3 Staff, Eagle Pins class.

VOICE — match these real captions exactly:
• "11 year Old Future Pro Shooter"
• "11 years old with Pro Shooter Dreams"
• "180 arrows after school on a Tuesday"
• "Tuesday Afterschool Range Time"
• "Friday Practice!"
• "New Toy!!"
• "Dad's Scores — Cuts me no slack"
• "11 Years Old 270 with 8-12 rings"
• "Nailed 12 Ring!"
• "Road to ASA Pro"

RULES:
- Short. 1 sentence, maybe 2. Let footage speak.
- Lead with age ("11 years old") when it's impressive
- Humble, work-ethic energy — NOT "look how good I am"
- NEVER use: bowhunt, bowhunting, hunting, deerhunting, huntinglife, bowhunter, huntin (TikTok flags these)
- MAX 5 HASHTAGS PER POST — TikTok only allows 5, no exceptions
- Always pick the 5 most relevant from: #A3archery #hoytarchery #mathewsarchery #3darchery #asaarchery #archerylife #youtharchery #futureproshooter #youngathlete #archeryjourney #targetarchery #competitivearchery`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (body.mode === 'batch') {
      return await handleBatch(body)
    }
    return NextResponse.json({ success: false, error: 'Unknown mode' }, { status: 400 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Generate error:', msg)
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

async function handleBatch(body: {
  files: { i: number; name: string; kind: string }[]
  postCount: number
  tournament?: string
  scores?: string
  notes?: string
}) {
  const { files, postCount, tournament, scores, notes } = body

  const fileList = files
    .map(f => `  [${f.i}] ${f.name} (${f.kind})`)
    .join('\n')

  const prompt = `You are planning ${postCount} TikTok posts from ${files.length} media files from a competition/practice day.

FILES AVAILABLE:
${fileList}
${tournament ? `\nEvent: ${tournament}` : ''}
${scores ? `Scores/Results: ${scores}` : ''}
${notes ? `Notes: ${notes}` : ''}

TASK: Create ${postCount} distinct TikTok post plans. Distribute the ${files.length} files across the posts intelligently:
- Videos are great as the first file in a post (TikTok plays first file as the main clip)
- Group related files together when you can infer from filenames (sequential numbers = same moment)
- Each post should have 2–6 files. Don't leave any file unused if possible.
- Make each post feel different (practice vibe, score reveal, competition day, gear, family, etc.)

Respond with ONLY valid JSON, no markdown, no explanation:
{
  "posts": [
    {
      "postNumber": 1,
      "title": "Short internal title",
      "mediaIndices": [0, 3, 7],
      "caption": "Caption in Brayden's real voice — short, humble, age-forward",
      "hashtags": ["#A3archery", "#hoytarchery", "#mathewsarchery", "#3darchery", "#archerylife"],
      "hook": "What should be in the very first frame/second of this post",
      "sound": "Suggested TikTok sound type or genre",
      "postTime": "Best time to post this one",
      "vibe": "practice|competition|score|gear|family|milestone"
    }
  ]
}`

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2500,
    system: SYSTEM,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''

  // Extract JSON — handle both bare JSON and code fenced
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    console.error('No JSON in response:', text)
    throw new Error('AI returned unexpected format')
  }

  const parsed = JSON.parse(jsonMatch[0])

  // Sanitize: remove blacklisted hashtags, hard cap at 5
  for (const post of parsed.posts ?? []) {
    if (Array.isArray(post.hashtags)) {
      post.hashtags = post.hashtags
        .filter((tag: string) => !BLACKLISTED_HASHTAGS.has(tag.replace(/^#/, '').toLowerCase()))
        .slice(0, 5)
    }
    // Clamp mediaIndices to valid range
    if (Array.isArray(post.mediaIndices)) {
      post.mediaIndices = post.mediaIndices.filter((i: number) => i >= 0 && i < files.length)
    }
  }

  return NextResponse.json({ success: true, ...parsed })
}
