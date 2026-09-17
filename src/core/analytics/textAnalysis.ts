export interface TextSignal {
  key: string;
  label: string;
  count: number;
  examples: string[];
}

export interface TextNuance {
  kind: 'strength' | 'growth' | 'pattern';
  emoji: string;
  title: string;
  body: string;
}

export interface TextAnalysis {
  wordCount: number;
  sentenceCount: number;
  avgWordsPerSentence: number;
  signals: TextSignal[];
  nuances: TextNuance[];
  conversationStarters: string[];
  overallScore: number;
}

const SIGNAL_DEFS: { key: string; label: string; patterns: RegExp[] }[] = [
  { key: 'evidence', label: 'Supported with reasons', patterns: [/\bbecause\b/gi, /\bsince\b/gi, /\bthe reason is\b/gi, /\bevidence\b/gi, /\bshowed\b/gi, /\bsaw that\b/gi, /\bproof\b/gi] },
  { key: 'counter', label: 'Considered other side', patterns: [/\bbut\b/gi, /\bhowever\b/gi, /\bon the other hand\b/gi, /\bthough\b/gi, /\balthough\b/gi, /\bbut maybe\b/gi] },
  { key: 'curiosity', label: 'Asked questions', patterns: [/\bwhat if\b/gi, /\bwhy\b/gi, /\bhow\b/gi, /\bi wonder\b/gi] },
  { key: 'hedge', label: 'Showed humility', patterns: [/\bi think\b/gi, /\bmaybe\b/gi, /\bprobably\b/gi, /\bmight\b/gi, /\bcould be\b/gi, /\bnot sure\b/gi, /\bperhaps\b/gi] },
  { key: 'absolutist', label: 'Used absolutist words', patterns: [/\balways\b/gi, /\bnever\b/gi, /\bdefinitely\b/gi, /\bobviously\b/gi, /\beveryone\b/gi, /\bnobody\b/gi] },
  { key: 'causal', label: 'Linked causes to effects', patterns: [/\bso\b/gi, /\btherefore\b/gi, /\bthat's why\b/gi, /\bbecause of this\b/gi, /\bhence\b/gi] },
  { key: 'comparison', label: 'Made comparisons', patterns: [/\blike\b/gi, /\bsimilar\b/gi, /\bdifferent\b/gi, /\bmore than\b/gi, /\bless than\b/gi] },
  { key: 'perspective', label: 'Weighed multiple views', patterns: [/\bboth\b/gi, /\beither\b/gi, /\bneither\b/gi, /\bone side\b/gi, /\banother way\b/gi, /\bdepends\b/gi] },
  { key: 'personal', label: 'Owned the reasoning', patterns: [/\bi think\b/gi, /\bin my opinion\b/gi, /\bi feel\b/gi, /\bi believe\b/gi] },
];

export const SIGNAL_IS_POSITIVE: Record<string, boolean> = {
  evidence: true, counter: true, curiosity: true, hedge: true,
  absolutist: false, causal: true, comparison: true,
  perspective: true, personal: true,
};

export function analyzeText(raw: string): TextAnalysis {
  const text = (raw || '').trim();

  if (!text) {
    return {
      wordCount: 0, sentenceCount: 0, avgWordsPerSentence: 0,
      signals: [],
      nuances: [{ kind: 'growth', emoji: '✍️', title: 'No response yet', body: 'Ask your child: "What do you think about this?"' }],
      conversationStarters: [],
      overallScore: 0,
    };
  }

  const words = text.split(/\s+/).filter(Boolean);
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
  const wordCount = words.length;
  const sentenceCount = sentences.length || 1;
  const avgWordsPerSentence = Math.round((wordCount / sentenceCount) * 10) / 10;

  const signals: TextSignal[] = [];
  for (const def of SIGNAL_DEFS) {
    let count = 0;
    const examples: string[] = [];
    for (const pat of def.patterns) {
      const matches = text.match(pat);
      if (matches) {
        count += matches.length;
        for (const m of matches) {
          if (examples.length < 2 && !examples.includes(m.toLowerCase())) examples.push(m.toLowerCase());
        }
      }
    }
    if (count > 0) signals.push({ key: def.key, label: def.label, count, examples });
  }

  const nuances: TextNuance[] = [];
  const get = (key: string) => signals.find(s => s.key === key)?.count || 0;
  const evidenceCount = get('evidence');
  const counterCount = get('counter');
  const curiosityCount = get('curiosity');
  const hedgeCount = get('hedge');
  const absolutistCount = get('absolutist');
  const causalCount = get('causal');
  const perspectiveCount = get('perspective');

  if (wordCount < 8) {
    nuances.push({ kind: 'growth', emoji: '✍️', title: 'Kept the answer very short', body: `Your child wrote only ${wordCount} word${wordCount === 1 ? '' : 's'}. Try: "Tell me one more sentence — what made you think that?"` });
  }

  const positives = (evidenceCount > 0 ? 1 : 0) + (counterCount > 0 ? 1 : 0) + (curiosityCount > 0 ? 1 : 0) + (causalCount > 0 ? 1 : 0) + (perspectiveCount > 0 ? 1 : 0);
  if (positives >= 3 && wordCount >= 20) {
    nuances.push({ kind: 'strength', emoji: '🧠', title: 'Rich reasoning', body: `Your child used ${positives} different thinking moves. That's a strong, layered answer.` });
  }

  if (evidenceCount >= 2) {
    nuances.push({ kind: 'strength', emoji: '🔬', title: 'Backed up the answer', body: `Your child used "${signals.find(s => s.key === 'evidence')?.examples[0] || 'because'}" ${evidenceCount} times to support what they said.` });
  } else if (evidenceCount === 0 && wordCount >= 15) {
    nuances.push({ kind: 'growth', emoji: '🎯', title: 'Stated without reasons', body: `Your child shared what they think but didn't say why. Ask: "What made you think that?"` });
  }

  if (counterCount >= 1) {
    nuances.push({ kind: 'strength', emoji: '⚖️', title: 'Saw another side', body: `Your child used "${signals.find(s => s.key === 'counter')?.examples[0]}" — a thinking move that shows they're not just defending one view.` });
  }

  if (curiosityCount >= 1) {
    nuances.push({ kind: 'strength', emoji: '💭', title: 'Asked a question', body: `Your child questioned the situation instead of just answering.` });
  }

  if (hedgeCount >= 2) {
    nuances.push({ kind: 'strength', emoji: '🤔', title: 'Showed thinking out loud', body: `Your child used words like "${signals.find(s => s.key === 'hedge')?.examples[0]}" — language of someone who knows they might not be 100% sure.` });
  }

  if (absolutistCount >= 2) {
    nuances.push({ kind: 'growth', emoji: '⚠️', title: 'Certain about everything', body: `Your child used words like "${signals.find(s => s.key === 'absolutist')?.examples[0]}". Ask: "Is that true every single time?"` });
  }

  if (causalCount >= 2) {
    nuances.push({ kind: 'strength', emoji: '🔗', title: 'Connected cause to effect', body: `Your child linked events. That's the same skill real scientists use.` });
  }

  if (perspectiveCount >= 1) {
    nuances.push({ kind: 'strength', emoji: '👁️', title: 'Considered multiple views', body: `Your child weighed more than one perspective.` });
  }

  if (wordCount >= 60 && avgWordsPerSentence >= 8) {
    nuances.push({ kind: 'strength', emoji: '📝', title: 'Wrote with depth', body: `${wordCount} words across ${sentenceCount} sentences. That's genuine investment.` });
  }

  const starters: string[] = [];
  if (evidenceCount === 0 && wordCount >= 10) starters.push('"What made you think that? Give me one reason."');
  if (absolutistCount >= 1) starters.push('"Can you think of a time when that is NOT true?"');
  if (counterCount === 0 && wordCount >= 15) starters.push('"What would someone who disagrees say?"');
  if (hedgeCount === 0 && wordCount >= 20) starters.push('"How sure are you? What would make you less sure?"');
  if (starters.length === 0) starters.push('"What did you enjoy thinking about most in that question?"');

  let score = 0;
  score += Math.min(40, evidenceCount * 12);
  score += Math.min(20, counterCount * 10);
  score += Math.min(10, curiosityCount * 6);
  score += Math.min(15, causalCount * 8);
  score += Math.min(10, perspectiveCount * 8);
  score -= Math.min(15, absolutistCount * 5);
  if (wordCount >= 30) score += 5;
  if (wordCount >= 60) score += 5;
  score = Math.max(0, Math.min(100, score));

  return { wordCount, sentenceCount, avgWordsPerSentence, signals, nuances, conversationStarters: starters.slice(0, 3), overallScore: score };
}
