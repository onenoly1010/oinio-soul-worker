/**
 * OINIO Soul SDK Logic - Edge Compatible
 * The Hardcoded Conscience for the Sovereign Oracle
 */

// Keywords that indicate constructive/aligned intent
const CONSTRUCTIVE_KEYWORDS = [
  'build', 'align', 'create', 'help', 'sustain', 'support', 'assist',
  'improve', 'grow', 'nurture', 'protect', 'preserve', 'optimize',
  'enhance', 'empower', 'benefit', 'serve', 'collaborate', 'share',
  'transparent', 'fair', 'ethical', 'safe', 'secure', 'reliable',
  'efficient', 'innovate', 'solve', 'deliver', 'value'
];

// Keywords that indicate harmful/misaligned intent
const HARMFUL_KEYWORDS = [
  'harm', 'exploit', 'manipulate', 'drain', 'steal', 'cheat', 'defraud',
  'phish', 'scam', 'rug', 'dump', 'spam', 'attack', 'hack', 'crack',
  'breach', 'leak', 'abuse', 'harass', 'threaten', 'coerce', 'extort',
  'bribe', 'corrupt', 'deceive', 'mislead', 'conceal', 'trap',
  'enslave', 'weaponize', 'extract', 'rugpull', 'sandwich'
];

export interface SoulInput {
  intent: string;
  actor?: string;
  context?: Record<string, unknown>;
}

export interface SoulResult {
  resonanceScore: number;
  alignment: 'aligned' | 'uncertain' | 'misaligned';
  reasoning: string;
  veto: boolean;
}

export async function evaluate(input: SoulInput): Promise<SoulResult> {
  const intentLower = input.intent.toLowerCase();
  
  const hasHarmfulIntent = HARMFUL_KEYWORDS.some(
    keyword => new RegExp(keyword, 'i').test(intentLower)
  );
  
  const isConstructive = CONSTRUCTIVE_KEYWORDS.some(
    keyword => new RegExp(keyword, 'i').test(intentLower)
  );

  let resonanceScore = 0.5;
  if (isConstructive) resonanceScore += 0.3;
  if (hasHarmfulIntent) resonanceScore -= 0.5;

  resonanceScore = Math.max(0, Math.min(1, resonanceScore));

  let alignment: SoulResult['alignment'];
  
  if (resonanceScore >= 0.7) {
    alignment = 'aligned';
  } else if (resonanceScore < 0.4) {
    alignment = 'misaligned';
  } else {
    alignment = 'uncertain';
  }

  const reasoning = alignment === 'aligned'
    ? 'Intent resonates with constructive autonomy. The action aligns with OINIO principles of building, helping, and sustainable value creation.'
    : alignment === 'misaligned'
    ? 'Intent signals potential entropy or misalignment. The action contains patterns that could harm, exploit, or manipulate others.'
    : 'Intent is uncertain. No strong alignment signals detected. Manual review recommended.';

  return {
    resonanceScore,
    alignment,
    reasoning,
    veto: hasHarmfulIntent
  };
}

export async function guardianCheck(
  input: SoulInput
): Promise<{ approved: boolean; reason?: string }> {
  const result = await evaluate(input);
  
  return {
    approved: !result.veto && result.resonanceScore >= 0.4,
    reason: result.reasoning
  };
}

export function resonanceHash(result: SoulResult): string {
  // Web-compatible hash using SubtleCrypto
  const json = JSON.stringify(result);
  let hash = 0;
  for (let i = 0; i < json.length; i++) {
    const char = json.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const hex = Math.abs(hash).toString(16).padStart(16, '0').slice(0, 16);
  return `0x${hex.toUpperCase()}`;
}
