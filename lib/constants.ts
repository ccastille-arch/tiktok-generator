export const BLACKLISTED_HASHTAGS = new Set([
  'bowhunt', 'bowhunting', 'hunting', 'deerhunting', 'huntinglife',
  'bowhunter', 'huntin', 'bowhuntinglife', 'archeryseason', 'deerhunter',
  'huntingseason', 'wildlifehunting', 'deerrut', 'buckhunting', 'elkseason',
  'bowhuntingcommunity', 'trophyhunting', 'predatorhunting',
])

// Brayden's actual hashtags + safe additions
export const SAFE_HASHTAGS = [
  // Brayden's real tags (always use these first)
  '#A3archery', '#hoytarchery', '#mathewsarchery', '#dartonarcher',
  // Core safe additions
  '#3darchery', '#asaarchery', '#archerylife', '#youtharchery',
  '#targetarchery', '#youngathlete', '#futureproshooter', '#archeryjourney',
  '#bowtecharchery', '#compoundbow', '#archerynation', '#archer',
  '#competitivearchery', '#archerycompetition', '#youthsports',
  '#statechampion', '#outdoorlife', '#sportslife', '#athletelife',
  '#bowandarrow', '#arrowflight', '#targetpractice', '#eaglepins',
  '#iboarchery', '#trx34', '#archerylove', '#3dlife',
]

// What Brayden's account actually trends with
export const TRENDING_HASHTAGS = [
  '#A3archery', '#hoytarchery', '#mathewsarchery', '#3darchery',
  '#asaarchery', '#futureproshooter', '#archeryjourney', '#youtharchery',
  '#youngathlete', '#archerylife',
]

export const POST_TEMPLATES = [
  {
    id: 'practice-day',
    name: 'Practice Day',
    icon: '🎯',
    description: 'Indoor/outdoor range session — raw, no polish',
    prompt: 'Practice session at the range. Raw footage, no fluff. Kid putting in work after school or on weekends.',
    suggestedSounds: ['Trending audio', 'Chill background beat', 'No sound needed'],
    captionHooks: [
      '[Day] Afterschool Range Time',
      '[X] arrows after school on a [Day]',
      'Friday Practice!',
      'Putting in the work 🏹',
    ],
  },
  {
    id: 'score-callout',
    name: 'Score Callout',
    icon: '📊',
    description: 'Score reveal — lead with the number',
    prompt: 'Showing a score or achievement. Lead with the number and what it means.',
    suggestedSounds: ['Hype moment sound', 'Trending audio'],
    captionHooks: [
      '11 Years Old [SCORE] with [X] 12-rings',
      'Nailed 12 Ring!',
      '[SCORE] out of [MAX] 🏹',
      '11 year old shooting [SCORE]',
    ],
  },
  {
    id: 'tournament-recap',
    name: 'Tournament Day',
    icon: '🏆',
    description: 'Walking the course, competition clips',
    prompt: 'Competition day footage. Walking the course, shooting in competition. Journey feel.',
    suggestedSounds: ['Course walk vibe', 'Ambient outdoor', 'Trending sound'],
    captionHooks: [
      'Competition day 🏹',
      '[Tournament Name] day 1',
      'Road to ASA Pro 🎯',
      '11 years old competing at [Tournament]',
    ],
  },
  {
    id: 'gear-reveal',
    name: 'New Gear',
    icon: '✨',
    description: 'New bow, arrows, or equipment drop',
    prompt: 'Showing off new gear. Excited, short, let the gear speak. Can mention specs briefly.',
    suggestedSounds: ['Unboxing hype', 'Trending audio'],
    captionHooks: [
      'New Toy!! 🏹',
      'New [item] just dropped',
      'Upgraded the setup 👀',
      '11 years old shooting [gear]',
    ],
  },
  {
    id: 'family-dynamic',
    name: 'Dad & Brayden',
    icon: '👨‍👦',
    description: 'Dad scoring, friendly competition, family support',
    prompt: 'Family dynamic content — dad scoring, competing together, family support. Relatable and wholesome.',
    suggestedSounds: ['Feel-good vibe', 'Trending audio', 'Fun upbeat'],
    captionHooks: [
      "Dad's Scores — Cuts me no slack",
      'Dad vs Brayden 👀',
      'Family range day',
      'He says I have to earn it 😅',
    ],
  },
  {
    id: 'milestone',
    name: 'Milestone',
    icon: '🥇',
    description: 'State record, championship, title win',
    prompt: 'Major achievement or milestone. Humble, let the achievement speak. Do NOT over-hype.',
    suggestedSounds: ['Victory moment', 'Calm triumphant', 'Trending audio'],
    captionHooks: [
      '11 years old Future Pro Shooter',
      '11 years old with Pro Shooter Dreams',
      'State Record at 11 years old 🏹',
      'The journey continues 🎯',
    ],
  },
]

export const BEST_POSTING_TIMES = [
  { day: 'Monday', times: ['7–9 AM', '6–8 PM'], note: 'Post-school/work scroll' },
  { day: 'Tuesday', times: ['7–9 AM', '5–7 PM'], note: 'Strong engagement mid-week' },
  { day: 'Wednesday', times: ['11 AM–1 PM', '7–9 PM'], note: 'Midweek peak' },
  { day: 'Thursday', times: ['7–9 PM'], note: 'Pre-weekend warmup' },
  { day: 'Friday', times: ['12–2 PM', '8–10 PM'], note: 'Friday evening prime time' },
  { day: 'Saturday', times: ['9–11 AM', '7–9 PM'], note: 'Weekend morning & evening' },
  { day: 'Sunday', times: ['10 AM–12 PM', '6–8 PM'], note: 'Best day for sports content' },
]

export const BRAYDEN_STATS = {
  handle: '@braydens.archery',
  followers: '5K',
  likes: '34.7K',
  titles: ['State Record Holder', 'State Champion', 'Shooter of the Year'],
  gear: ['A3 Staff', 'TRX34'],
  class: 'Eagle Pins',
  age: 11,
}

export const BRAND_OVERLAYS = [
  { id: 'state-record', label: 'STATE RECORD HOLDER', color: '#f59e0b' },
  { id: 'state-champion', label: 'STATE CHAMPION', color: '#22c55e' },
  { id: 'shooter-of-year', label: 'SHOOTER OF THE YEAR', color: '#f59e0b' },
  { id: 'a3-staff', label: 'A3 STAFF', color: '#22c55e' },
  { id: 'trx34', label: 'SHOOTING TRX34', color: '#86a986' },
  { id: 'eagle-pins', label: 'EAGLE PINS CLASS', color: '#f59e0b' },
]
