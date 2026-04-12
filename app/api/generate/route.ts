import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { BLACKLISTED_HASHTAGS, SAFE_HASHTAGS, TRENDING_HASHTAGS } from '@/lib/constants'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { template, context, score, tournament, selectedHashtags } = body

    const safeHashtagList = SAFE_HASHTAGS.slice(0, 20).join(', ')
    const trendingList = TRENDING_HASHTAGS.join(', ')

    const systemPrompt = `You are writing TikTok captions for @braydens.archery — Brayden Castille, an 11-year-old competitive archer. Think "proud dad documenting his son's journey," not a marketing agency. Real, raw, authentic.

BRAND VOICE (match this exactly):
- Humble, work-ethic focused — "putting in the work," not "look how good I am"
- Lead with age: "11 years old" is almost always the hook
- SHORT. 1–2 sentences max. Let the footage speak.
- Journey narrative: "chasing pro dreams," "road to ASA Pro," "future pro shooter"
- Family angle works great — dad scoring, family support, friendly competition
- Raw and unpolished tone, like a real parent filming their kid

CAPTION EXAMPLES TO MATCH (use these as style guides):
- "11 year Old Future Pro Shooter"
- "11 years old with Pro Shooter Dreams"
- "11 years old working on his own bow"
- "180 arrows after school on a Tuesday"
- "Tuesday Afterschool Range Time"
- "Friday Practice!"
- "New Toy!!"
- "Dad's Scores — Cuts me no slack"
- "11 Years Old 270 with 8-12 rings"
- "Nailed 12 Ring!"

CRITICAL HASHTAG RULES:
- NEVER use these (TikTok flags/removes them): bowhunt, bowhunting, hunting, deerhunting, huntinglife, bowhunter, huntin, bowhuntinglife, deerhunter, huntingseason
- ALWAYS use: #A3archery #hoytarchery #mathewsarchery — these are Brayden's actual tags
- Also safe: ${safeHashtagList}
- Trending safe options: ${trendingList}

OUTPUT FORMAT (JSON only, no extra text):
{
  "captions": [
    { "variation": "Short & Punchy", "text": "caption text here", "charCount": 45 },
    { "variation": "Journey Angle", "text": "caption text here", "charCount": 70 },
    { "variation": "Score/Detail", "text": "caption text here", "charCount": 60 }
  ],
  "hashtags": ["#A3archery", "#3darchery"],
  "hook": "First-frame visual hook idea (what should viewer SEE in second 1)",
  "sounds": ["Sound suggestion 1", "Sound suggestion 2"],
  "tips": ["One real posting tip", "One content tip"]
}`

    const userPrompt = `Template: ${template}
${score ? `Score/Achievement: ${score}` : ''}
${tournament ? `Tournament/Event: ${tournament}` : ''}
${context ? `Additional context: ${context}` : ''}
${selectedHashtags?.length ? `Already using: ${selectedHashtags.join(', ')}` : ''}

Write 3 caption variations in Brayden's real voice — short, humble, kid-grinding-hard energy. Age (11) should appear naturally. Use 8–10 safe hashtags including #A3archery. NO hunting hashtags.`

    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1500,
      messages: [{ role: 'user', content: userPrompt }],
      system: systemPrompt,
    })

    const content = message.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response type')

    // Parse JSON from response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Could not parse response')

    const parsed = JSON.parse(jsonMatch[0])

    // Validate hashtags — filter any that slipped through
    if (parsed.hashtags) {
      parsed.hashtags = parsed.hashtags.filter((tag: string) => {
        const clean = tag.replace('#', '').toLowerCase()
        return !BLACKLISTED_HASHTAGS.has(clean)
      })
    }

    return NextResponse.json({ success: true, ...parsed })
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err))
    console.error('Generate error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
