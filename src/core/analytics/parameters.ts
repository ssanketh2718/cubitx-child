// src/core/analytics/parameters.ts
import { countMarkers, normalise } from './markers';

export type ParameterLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface ParameterResult {
  code: string;
  level: ParameterLevel;
  evidence: string;
}

export interface ParameterSet {
  interpretation: ParameterResult[];
  reasoning: ParameterResult[];
  openMindedness: ParameterResult[];
  evaluation: ParameterResult[];
  revision: ParameterResult[];
}

export interface ParameterDetectionInput {
  answer: string;
  question: string;
  before?: string;
  after?: string;
  sceneKeywords?: string[];
  causalKeywords?: string[];
  decorativeKeywords?: string[];
  mechanismKeywords?: string[];
  isCorrect?: boolean;
  decoyCaught?: boolean;
  challengeStrength?: 'strong' | 'weak' | 'decoy';
  confidenceBefore?: number; // 0-100
  confidenceAfter?: number;  // 0-100
  isFarTransfer?: boolean;
}

/* ─── Helpers ────────────────────────────────────────────────── */

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function hasNumber(text: string): boolean {
  return /\b\d+(?:\.\d+)?\b/.test(text);
}

function matchedKeywords(text: string, keywords: string[] = []): string[] {
  if (!keywords.length) return [];
  const lower = text.toLowerCase();
  return keywords.filter((k) => k.trim().length >= 2 && lower.includes(k.toLowerCase().trim()));
}

function extractMatch(text: string, pattern: RegExp): string {
  const safeFlags = pattern.flags.replace(/g/g, '');
  const safeRegex = new RegExp(pattern.source, safeFlags);
  const m = text.match(safeRegex);
  if (!m) return '';
  const idx = text.indexOf(m[0]);
  const start = Math.max(0, idx - 22);
  const end = Math.min(text.length, idx + m[0].length + 22);
  return '…' + text.slice(start, end).trim() + '…';
}

function jaccardSimilarity(a: string, b: string): number {
  const setA = new Set(a.split(/\s+/).filter((w) => w.length > 2));
  const setB = new Set(b.split(/\s+/).filter((w) => w.length > 2));
  if (setA.size === 0 && setB.size === 0) return 1;
  const intersection = [...setA].filter((w) => setB.has(w)).length;
  const union = new Set([...setA, ...setB]).size;
  return union > 0 ? intersection / union : 0;
}

const CAUSAL_SO =
  /\bso\b\s+(?:the|it|he|she|they|we|i|you|there|that|this|because|then|now)/i;

function countCausalInContext(text: string): number {
  const markers = countMarkers(text, 'causal');
  const soInstances = (text.match(/\bso\b/gi) || []).length;
  const soInClause = (text.match(CAUSAL_SO) || []).length;
  const spuriousSo = soInstances - soInClause;
  return Math.max(0, markers - spuriousSo);
}

function computeRelevance(
  answer: string,
  question: string,
  sceneKeywords: string[]
): number {
  if (!answer || answer.trim().length < 2) return 0;
  if (!question || question.trim().length < 2) return 1;

  const aLower = normalise(answer.toLowerCase());
  const qLower = normalise(question.toLowerCase());
  const answerWords = new Set(aLower.split(/\s+/).filter((w) => w.length > 3));
  const questionWords = qLower.split(/\s+/).filter((w) => w.length > 3);

  let hits = 0;
  let total = 0;

  for (const w of questionWords) {
    total++;
    if (answerWords.has(w)) hits++;
  }
  for (const k of sceneKeywords) {
    const kw = k.toLowerCase().trim();
    if (kw.length < 3) continue;
    total++;
    if (aLower.includes(kw)) hits++;
  }
  return total === 0 ? 1 : hits / total;
}

/* ─── DIMENSION 1: INTERPRETATION (I1–I8) ────────────────────── */

function I1_specificDetails(text: string, sceneKeywords: string[]): ParameterResult {
  const hits = matchedKeywords(text, sceneKeywords);
  let score = 0;
  if (hits.length >= 1) score += 2;
  if (hits.length >= 2) score += 1;
  if (hits.length >= 1 && hasNumber(text)) score += 1;
  if (hits.length >= 2 && wordCount(text) >= 14) score += 1;
  return {
    code: 'I1',
    level: Math.min(5, score) as ParameterLevel,
    evidence: hits.length > 0 ? text.slice(0, 80) : '',
  };
}

function I2_observationVsInterpretation(text: string): ParameterResult {
  const obs = countMarkers(text, 'evidence');
  const interp = countMarkers(text, 'hedge');
  if (obs > 0 && interp > 0)
    return {
      code: 'I2',
      level: 4,
      evidence: extractMatch(text, /i saw|i noticed|i think|वाटतं|मी पाहिलं/i),
    };
  if (obs > 0)
    return {
      code: 'I2',
      level: 2,
      evidence: extractMatch(text, /i saw|i noticed|मी पाहिलं|मैंने देखा/i),
    };
  if (interp > 0)
    return {
      code: 'I2',
      level: 1,
      evidence: extractMatch(text, /i think|maybe|perhaps|वाटतं|शायद/i),
    };
  return { code: 'I2', level: 0, evidence: '' };
}

function I3_questionRelevance(text: string, question: string): ParameterResult {
  if (!question || question.trim().length < 2) {
    return { code: 'I3', level: 0, evidence: '' };
  }
  const answerWords = new Set(
    normalise(text.toLowerCase())
      .split(/\s+/)
      .filter((w) => w.length > 3)
  );
  const questionWords = normalise(question.toLowerCase())
    .split(/\s+/)
    .filter((w) => w.length > 3);
  const overlap = questionWords.filter((w) => answerWords.has(w)).length;
  const ratio = questionWords.length > 0 ? overlap / questionWords.length : 0;
  let level: ParameterLevel = 0;
  if (ratio >= 0.2) level = 2;
  if (ratio >= 0.4) level = 3;
  if (ratio >= 0.6) level = 4;
  return { code: 'I3', level, evidence: level > 0 ? text.slice(0, 60) : '' };
}

function I4_noInventedDetails(text: string, sceneKeywords: string[]): ParameterResult {
  if (sceneKeywords.length === 0) return { code: 'I4', level: 0, evidence: '' };
  const hits = matchedKeywords(text, sceneKeywords);
  return {
    code: 'I4',
    level: hits.length > 0 ? 4 : 0,
    evidence: '',
  };
}

function I5_multiElementAwareness(text: string, sceneKeywords: string[]): ParameterResult {
  const hits = matchedKeywords(text, sceneKeywords);
  if (hits.length >= 3) return { code: 'I5', level: 5, evidence: hits.join(', ') };
  if (hits.length === 2) return { code: 'I5', level: 3, evidence: hits.join(', ') };
  if (hits.length === 1) return { code: 'I5', level: 1, evidence: hits[0] };
  return { code: 'I5', level: 0, evidence: '' };
}

function I6_causalVsDecorativeFocus(
  text: string,
  causalKeywords: string[],
  decorativeKeywords: string[]
): ParameterResult {
  if (!causalKeywords.length) return { code: 'I6', level: 0, evidence: '' };
  const causalHits = matchedKeywords(text, causalKeywords).length;
  const decoHits = matchedKeywords(text, decorativeKeywords).length;
  if (causalHits >= 2 && causalHits > decoHits)
    return { code: 'I6', level: 5, evidence: text.slice(0, 75) };
  if (causalHits >= 1 && causalHits >= decoHits)
    return { code: 'I6', level: 3, evidence: text.slice(0, 75) };
  if (decoHits > 0 && causalHits === 0)
    return { code: 'I6', level: 1, evidence: '' };
  return { code: 'I6', level: 0, evidence: '' };
}

function I7_sceneComprehension(
  text: string,
  sceneKeywords: string[],
  isCorrect?: boolean
): ParameterResult {
  const hits = matchedKeywords(text, sceneKeywords).length;
  if (isCorrect === true && hits >= 1) return { code: 'I7', level: 4, evidence: '' };
  if (isCorrect === true) return { code: 'I7', level: 3, evidence: '' };
  if (hits >= 2) return { code: 'I7', level: 2, evidence: '' };
  return { code: 'I7', level: 0, evidence: '' };
}

function I8_problemRestatement(text: string, question: string): ParameterResult {
  if (!question || wordCount(text) < 6) return { code: 'I8', level: 0, evidence: '' };
  const sim = jaccardSimilarity(
    normalise(text.toLowerCase()),
    normalise(question.toLowerCase())
  );
  // Restates in own words (not verbatim copy-paste > 0.85, not unrelated < 0.25)
  if (sim >= 0.3 && sim <= 0.8) {
    return { code: 'I8', level: 4, evidence: text.slice(0, 70) };
  }
  return { code: 'I8', level: 0, evidence: '' };
}

/* ─── DIMENSION 2: REASONING (R1–R12) ────────────────────────── */

function R1_reasonPresence(text: string): ParameterResult {
  const causal = countCausalInContext(text);
  if (causal === 0) return { code: 'R1', level: 0, evidence: '' };
  if (causal === 1)
    return {
      code: 'R1',
      level: 2,
      evidence: extractMatch(text, /because|since|therefore|कारण|म्हणून|kyunki/i),
    };
  return {
    code: 'R1',
    level: 4,
    evidence: extractMatch(text, /because|since|therefore|कारण|म्हणून/i),
  };
}

function R2_reasonRelevance(text: string, sceneKeywords: string[]): ParameterResult {
  const causal = countCausalInContext(text);
  if (causal === 0) return { code: 'R2', level: 0, evidence: '' };
  const hits = matchedKeywords(text, sceneKeywords);
  if (hits.length >= 2) return { code: 'R2', level: 4, evidence: text.slice(0, 80) };
  if (hits.length === 1 || wordCount(text) >= 8)
    return { code: 'R2', level: 2, evidence: '' };
  return { code: 'R2', level: 1, evidence: '' };
}

function R3_reasonSpecificity(text: string, sceneKeywords: string[]): ParameterResult {
  const causal = countCausalInContext(text);
  if (causal === 0) return { code: 'R3', level: 0, evidence: '' };
  const hits = matchedKeywords(text, sceneKeywords);
  let level: ParameterLevel = 1;
  if (hits.length >= 1) level = 3;
  if (hits.length >= 1 && hasNumber(text)) level = 4;
  return { code: 'R3', level, evidence: '' };
}

function R4_chainDepth(text: string): ParameterResult {
  const causal = countCausalInContext(text);
  if (causal === 0) return { code: 'R4', level: 0, evidence: '' };
  if (causal === 1) return { code: 'R4', level: 1, evidence: '' };
  if (causal === 2)
    return {
      code: 'R4',
      level: 3,
      evidence: extractMatch(text, /so|therefore|कारण|म्हणून/i),
    };
  return {
    code: 'R4',
    level: 5,
    evidence: extractMatch(text, /so|therefore|कारण|म्हणून/i),
  };
}

function R5_nonCircularity(text: string): ParameterResult {
  const circular = countMarkers(text, 'circular');
  if (circular > 0) {
    return {
      code: 'R5',
      level: 0,
      evidence: extractMatch(text, /because it is|aisa hi hai|असंच असतं/i),
    };
  }
  const causal = countCausalInContext(text);
  if (causal === 0) return { code: 'R5', level: 0, evidence: '' };
  const parts = text.split(/\b(?:because|since|kyunki|कारण|म्हणून)\b/i);
  if (parts.length >= 2) {
    const sim = jaccardSimilarity(parts[0].toLowerCase(), parts[1].toLowerCase());
    if (sim < 0.55 && wordCount(parts[1]) >= 3) {
      return { code: 'R5', level: 4, evidence: parts[1].trim().slice(0, 75) };
    }
    return { code: 'R5', level: 1, evidence: '' };
  }
  return { code: 'R5', level: 2, evidence: '' };
}

function R6_evidenceCitation(text: string): ParameterResult {
  const evidence = countMarkers(text, 'evidence');
  if (evidence === 0) return { code: 'R6', level: 0, evidence: '' };
  if (evidence === 1)
    return {
      code: 'R6',
      level: 2,
      evidence: extractMatch(text, /i saw|i noticed|i felt|i checked|मी पाहिलं/i),
    };
  return {
    code: 'R6',
    level: 4,
    evidence: extractMatch(text, /i saw|i noticed|i felt|मी पाहिलं/i),
  };
}

function R7_mechanismNaming(text: string, mechanismKeywords: string[]): ParameterResult {
  const hits = matchedKeywords(text, mechanismKeywords);
  if (hits.length >= 2)
    return { code: 'R7', level: 5, evidence: `Mechanism: ${hits.join(', ')}` };
  if (hits.length === 1)
    return { code: 'R7', level: 3, evidence: `Mechanism: ${hits[0]}` };
  return { code: 'R7', level: 0, evidence: '' };
}

function R8_sufficiency(r1: ParameterResult, r6: ParameterResult): ParameterResult {
  if (r1.level >= 3 && r6.level >= 2) return { code: 'R8', level: 4, evidence: '' };
  if (r1.level >= 2 && r6.level >= 2) return { code: 'R8', level: 3, evidence: '' };
  if (r1.level >= 2 || r6.level >= 2) return { code: 'R8', level: 1, evidence: '' };
  return { code: 'R8', level: 0, evidence: '' };
}

function R9_counterConsideration(text: string): ParameterResult {
  const contrast = countMarkers(text, 'contrast');
  if (contrast === 0) return { code: 'R9', level: 0, evidence: '' };
  if (contrast === 1)
    return {
      code: 'R9',
      level: 2,
      evidence: extractMatch(text, /but|however|although|पण|लेकिन/i),
    };
  return {
    code: 'R9',
    level: 4,
    evidence: extractMatch(text, /but|however|पण|लेकिन/i),
  };
}

function R10_ifThenConditional(text: string): ParameterResult {
  const cond = countMarkers(text, 'conditional');
  if (cond === 0) return { code: 'R10', level: 0, evidence: '' };
  const paired = /\bif\b.+\bthen\b|\bजर\b.+\bतर\b|\bअगर\b.+\bतो\b/i.test(text);
  if (paired)
    return {
      code: 'R10',
      level: 4,
      evidence: extractMatch(text, /if|जर|अगर/i),
    };
  return {
    code: 'R10',
    level: 2,
    evidence: extractMatch(text, /if|unless|जर|अगर/i),
  };
}

function R11_analogyUse(text: string): ParameterResult {
  const pat =
    /\b(like|similar to|just like|just as|same as|reminds me of)\b|सारखं|सारखा|प्रमाण|जैसे|जैसा/i;
  if (pat.test(text) && wordCount(text) >= 7) {
    return { code: 'R11', level: 4, evidence: extractMatch(text, pat) };
  }
  return { code: 'R11', level: 0, evidence: '' };
}

function R12_quantifierAccuracy(text: string): ParameterResult {
  const quantPat =
    /\b(some|most|few|many|several|out of|half|majority|only \d+)\b|काही|बहुतेक|कुछ|ज्यादातर/i;
  if (quantPat.test(text)) {
    return { code: 'R12', level: 4, evidence: extractMatch(text, quantPat) };
  }
  return { code: 'R12', level: 0, evidence: '' };
}

/* ─── DIMENSION 3: OPEN-MINDEDNESS (O1–O10) ──────────────────── */

function O1_alternatives(text: string): ParameterResult {
  const alts = countMarkers(text, 'alternative');
  if (alts === 0) return { code: 'O1', level: 0, evidence: '' };
  if (alts === 1)
    return {
      code: 'O1',
      level: 2,
      evidence: extractMatch(text, /maybe|perhaps|or|किंवा|शायद/i),
    };
  if (alts === 2)
    return {
      code: 'O1',
      level: 3,
      evidence: extractMatch(text, /or|या|किंवा/i),
    };
  return {
    code: 'O1',
    level: 5,
    evidence: extractMatch(text, /or|alternative|दुसरा/i),
  };
}

function O2_alternativeQuality(text: string): ParameterResult {
  const branches = text.split(/\b(?:or|alternatively)\b|किंवा|या/i);
  if (branches.length < 2) return { code: 'O2', level: 0, evidence: '' };
  const sim = jaccardSimilarity(
    branches[0].toLowerCase(),
    branches[1].toLowerCase()
  );
  if (sim < 0.45 && wordCount(branches[1]) >= 3) {
    return { code: 'O2', level: 4, evidence: branches[1].trim().slice(0, 70) };
  }
  return { code: 'O2', level: 1, evidence: '' };
}

function O3_perspectiveTaking(text: string): ParameterResult {
  const pat =
    /\b(if i were|from their|their side|their point of view|other person|someone else|for them)\b|त्यांच्या बाजूने|उनकी जगह|दुसऱ्याच्या/i;
  if (pat.test(text)) {
    return { code: 'O3', level: 4, evidence: extractMatch(text, pat) };
  }
  return { code: 'O3', level: 0, evidence: '' };
}

function O4_hedging(text: string): ParameterResult {
  const hedges = countMarkers(text, 'hedge');
  if (hedges === 0) return { code: 'O4', level: 0, evidence: '' };
  if (hedges === 1)
    return {
      code: 'O4',
      level: 2,
      evidence: extractMatch(text, /maybe|perhaps|i think|शायद|वाटतं/i),
    };
  return { code: 'O4', level: 4, evidence: '' };
}

function O5_absolutismAvoidance(text: string): ParameterResult {
  const wc = wordCount(text);
  const absolutes = countMarkers(text, 'absolute');
  const hedges = countMarkers(text, 'hedge');
  if (wc < 10 || hedges === 0) return { code: 'O5', level: 0, evidence: '' };
  if (absolutes === 0) return { code: 'O5', level: 4, evidence: '' };
  if (absolutes === 1)
    return {
      code: 'O5',
      level: 2,
      evidence: extractMatch(text, /always|never|हमेशा|नेहमी/i),
    };
  return {
    code: 'O5',
    level: 0,
    evidence: extractMatch(text, /always|never/i),
  };
}

function O6_contradictionTolerance(text: string): ParameterResult {
  const pat =
    /\b(both could|both are|on one hand|at the same time|partially true|both sides)\b|दोन्ही शक्य|दोनों सही/i;
  if (pat.test(text)) {
    return { code: 'O6', level: 4, evidence: extractMatch(text, pat) };
  }
  return { code: 'O6', level: 0, evidence: '' };
}

function O7_opennessToWrong(text: string): ParameterResult {
  const pat =
    /i (?:could|might|may) be wrong|i'?m not (?:sure|certain)|maybe i'?m wrong|i might have missed|not sure if i'?m right|मी चुकू शकतो|मी चुकले असू शकते|मुझे नहीं पता|शायद मैं गलत हूं/i;
  if (pat.test(text))
    return { code: 'O7', level: 5, evidence: extractMatch(text, pat) };
  return { code: 'O7', level: 0, evidence: '' };
}

function O8_perspectiveAccuracy(o3: ParameterResult, r2: ParameterResult): ParameterResult {
  if (o3.level >= 3 && r2.level >= 2) return { code: 'O8', level: 4, evidence: o3.evidence };
  return { code: 'O8', level: 0, evidence: '' };
}

function O9_domainAwareness(text: string): ParameterResult {
  const pat =
    /\b(depends on|in some cases|under certain|only when|context|situation)\b|परिस्थितीनुसार|हालात पर|अवलंबून/i;
  if (pat.test(text)) {
    return { code: 'O9', level: 4, evidence: extractMatch(text, pat) };
  }
  return { code: 'O9', level: 0, evidence: '' };
}

function O10_revisionOpenness(text: string): ParameterResult {
  const pat =
    /\b(would change if|change my mind if|unless we find|if new evidence|if we test)\b|बदलेल जर|बदल जाएगा अगर/i;
  if (pat.test(text)) {
    return { code: 'O10', level: 4, evidence: extractMatch(text, pat) };
  }
  return { code: 'O10', level: 0, evidence: '' };
}

/* ─── DIMENSION 4: EVALUATION (E1–E10) ───────────────────────── */

function E1_sourceQuestioning(text: string): ParameterResult {
  const pat =
    /\b(who says|how do they know|how do you know|is it true|are they sure|did they check|where did they|how can they be sure)\b|kisne kaha|kaise pata|कसं माहित|कोण म्हणालं|किसने कहा|कैसे पता/i;
  if (pat.test(text))
    return { code: 'E1', level: 4, evidence: extractMatch(text, pat) };
  return { code: 'E1', level: 0, evidence: '' };
}

function E2_evidenceStrengthDistinction(
  text: string,
  decoyCaught?: boolean
): ParameterResult {
  if (decoyCaught === true) {
    return { code: 'E2', level: 4, evidence: 'Rejected weak/decoy claim in favor of stronger test data' };
  }
  const hasDirect = countMarkers(text, 'evidence') > 0;
  const hasHearsay = countMarkers(text, 'source') > 0;
  if (hasDirect && hasHearsay) {
    return { code: 'E2', level: 4, evidence: text.slice(0, 75) };
  }
  return { code: 'E2', level: 0, evidence: '' };
}

function E3_assumptionIdentification(text: string): ParameterResult {
  const pat =
    /\b(assumes|assuming|takes it for granted|it depends on|presupposes|what if it'?s not|but if it isn'?t|notice|surprise)\b|maan lo|maan lete hain|गृहीत धरतं|मान लो|मान लेते/i;
  if (pat.test(text))
    return { code: 'E3', level: 4, evidence: extractMatch(text, pat) };
  return { code: 'E3', level: 0, evidence: '' };
}

function E4_claimEvidenceDistinction(text: string): ParameterResult {
  const pat =
    /\b(just because|doesn'?t prove|does not prove|no proof|only a claim|sounds convincing|without proof)\b|सिद्ध होत नाही|साबित नहीं होता|पुरावा नाही/i;
  if (pat.test(text)) {
    return { code: 'E4', level: 4, evidence: extractMatch(text, pat) };
  }
  return { code: 'E4', level: 0, evidence: '' };
}

function E5_biasRecognition(text: string): ParameterResult {
  const pat =
    /\b(bias|biased|want to sell|benefit|motive|one-sided|unfair|cherry-picked|only one table)\b|फायदा|स्वार्थ|पक्षपात/i;
  if (pat.test(text)) {
    return { code: 'E5', level: 4, evidence: extractMatch(text, pat) };
  }
  return { code: 'E5', level: 0, evidence: '' };
}

function E6_sourceReliability(text: string, decoyCaught?: boolean): ParameterResult {
  const pat =
    /\b(everyone says|people say|common knowledge|sab kehte|sagle mhantat|सब कहते|सगळे म्हणतात|actually studied|doctors have|researchers|checked by|control group|comparison group|small sample|8 kids)\b/i;
  if (pat.test(text))
    return { code: 'E6', level: 4, evidence: extractMatch(text, pat) };
  if (decoyCaught === true)
    return { code: 'E6', level: 3, evidence: 'Identified unreliable source/sample' };
  return { code: 'E6', level: 0, evidence: '' };
}

function E7_alternativeExplanation(text: string): ParameterResult {
  const pat =
    /\b(another explanation|other factor|could also be because|maybe it was because|real reason might be|different cause)\b|दुसरं कारण|दूसरी वजह/i;
  if (pat.test(text)) {
    return { code: 'E7', level: 4, evidence: extractMatch(text, pat) };
  }
  return { code: 'E7', level: 0, evidence: '' };
}

function E8_evidenceElimination(text: string): ParameterResult {
  const pat =
    /\b(rules out|can'?t be|cannot be|impossible because|eliminates|proves it isn'?t|doesn'?t fit)\b|शक्य नाही|हो ही नहीं सकता/i;
  if (pat.test(text)) {
    return { code: 'E8', level: 4, evidence: extractMatch(text, pat) };
  }
  return { code: 'E8', level: 0, evidence: '' };
}

function E9_sufficiencyJudgment(text: string): ParameterResult {
  const pat =
    /\b(need to know|missing|not enough info|not enough information|who skipped|where is the|need more data|no comparison)\b|माहिती अपुरी|पूरी जानकारी नहीं|अजून माहिती/i;
  if (pat.test(text)) {
    return { code: 'E9', level: 4, evidence: extractMatch(text, pat) };
  }
  return { code: 'E9', level: 0, evidence: '' };
}

function E10_aiOutputSkepticism(text: string, decoyCaught?: boolean): ParameterResult {
  const pat =
    /\b(ai|bot|studybot|algorithm|99% confident|computer|generated|how did the bot|bot can be wrong|check the bot)\b/i;
  if (pat.test(text) && (decoyCaught || countMarkers(text, 'question') > 0 || countMarkers(text, 'contrast') > 0)) {
    return { code: 'E10', level: 5, evidence: extractMatch(text, pat) };
  }
  if (decoyCaught === true) {
    return { code: 'E10', level: 3, evidence: 'Questioned confident bot claim' };
  }
  return { code: 'E10', level: 0, evidence: '' };
}

/* ─── DIMENSION 5: REVISION & METACOGNITION (M1–M8) ──────────── */

function M1_revisionOccurrence(before: string, after: string): ParameterResult {
  if (!before || !after) return { code: 'M1', level: 0, evidence: '' };
  const similarity = jaccardSimilarity(
    normalise(before.toLowerCase()),
    normalise(after.toLowerCase())
  );
  if (similarity < 0.4) return { code: 'M1', level: 5, evidence: after.slice(0, 80) };
  if (similarity < 0.7) return { code: 'M1', level: 3, evidence: after.slice(0, 80) };
  return { code: 'M1', level: 1, evidence: '' };
}

function M2_revisionSpecificity(after: string): ParameterResult {
  const metacog = countMarkers(after, 'metacognition');
  if (metacog === 0) return { code: 'M2', level: 0, evidence: '' };
  if (metacog === 1)
    return {
      code: 'M2',
      level: 2,
      evidence: extractMatch(after, /i used to think|now i think|at first|पहिले वाटलं/i),
    };
  return {
    code: 'M2',
    level: 4,
    evidence: extractMatch(after, /i used to think|now i think|पहिले वाटलं/i),
  };
}

function M3_revisionAccuracy(
  m1: ParameterResult,
  challengeStrength?: 'strong' | 'weak' | 'decoy',
  decoyCaught?: boolean,
  isCorrect?: boolean
): ParameterResult {
  // Gold Metric: Updated on strong evidence OR held ground against decoy evidence
  if (challengeStrength === 'decoy' || challengeStrength === 'weak') {
    if (decoyCaught === true || m1.level <= 1) {
      return { code: 'M3', level: 5, evidence: 'Held ground with evidence against weak/decoy twist (Sisu)' };
    }
    return { code: 'M3', level: 1, evidence: 'Shifted position on weak/decoy evidence' };
  }
  if (challengeStrength === 'strong') {
    if (m1.level >= 3 && isCorrect !== false) {
      return { code: 'M3', level: 5, evidence: 'Updated position accurately on strong new evidence' };
    }
    if (isCorrect === true) {
      return { code: 'M3', level: 3, evidence: '' };
    }
  }
  return { code: 'M3', level: 0, evidence: '' };
}

function M4_selfAwareness(text: string): ParameterResult {
  const metacog = countMarkers(text, 'metacognition');
  if (metacog >= 2)
    return {
      code: 'M4',
      level: 5,
      evidence: extractMatch(text, /at first|i realised|i realized|पहिले वाटलं/i),
    };
  if (metacog === 1)
    return {
      code: 'M4',
      level: 3,
      evidence: extractMatch(text, /at first|i realised|i realized|पहिले वाटलं/i),
    };
  return { code: 'M4', level: 0, evidence: '' };
}

function M5_uncertaintyNaming(text: string): ParameterResult {
  const uncertainty = countMarkers(text, 'uncertainty');
  if (uncertainty === 0) return { code: 'M5', level: 0, evidence: '' };
  const hasSpecific = /\b(whether|if|how|why|what|which)\b|की|का|काय/.test(text);
  if (hasSpecific) {
    return {
      code: 'M5',
      level: 4,
      evidence: extractMatch(text, /don'?t know|not sure|शायद|माहित नाही/i),
    };
  }
  return { code: 'M5', level: 2, evidence: '' };
}

function M6_confidenceCalibration(
  confidenceAfter: number | undefined,
  isCorrect: boolean | undefined,
  r8: ParameterResult
): ParameterResult {
  if (typeof confidenceAfter !== 'number') return { code: 'M6', level: 0, evidence: '' };
  const target = isCorrect === true ? (r8.level >= 3 ? 85 : 70) : isCorrect === false ? 30 : 55;
  const gap = Math.abs(confidenceAfter - target);
  if (gap <= 15) return { code: 'M6', level: 5, evidence: `Well-calibrated confidence (${confidenceAfter}%)` };
  if (gap <= 30) return { code: 'M6', level: 3, evidence: `Moderate confidence calibration (${confidenceAfter}%)` };
  return { code: 'M6', level: 1, evidence: '' };
}

function M7_learningArticulation(text: string): ParameterResult {
  const pat =
    /\b(i learned|this shows that|the rule is|the pattern is|takeaway|now i understand)\b|शिकलो की|समजलं की|सीखा कि/i;
  if (pat.test(text) && wordCount(text) >= 6) {
    return { code: 'M7', level: 4, evidence: extractMatch(text, pat) };
  }
  return { code: 'M7', level: 0, evidence: '' };
}

function M8_transferAwareness(text: string, isFarTransfer?: boolean): ParameterResult {
  const pat =
    /\b(just like|same as|in real life|another example|similar to when|outside)\b|सारखंच|खऱ्या आयुष्यात|वैसा ही/i;
  if (isFarTransfer && wordCount(text) >= 5) {
    return { code: 'M8', level: 5, evidence: text.slice(0, 80) };
  }
  if (pat.test(text)) {
    return { code: 'M8', level: 4, evidence: extractMatch(text, pat) };
  }
  return { code: 'M8', level: 0, evidence: '' };
}

/* ─── ZERO SET & MAIN ENTRYPOINT ─────────────────────────────── */

const ZERO_CODES = {
  interpretation: ['I1', 'I2', 'I3', 'I4', 'I5', 'I6', 'I7', 'I8'],
  reasoning: ['R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8', 'R9', 'R10', 'R11', 'R12'],
  openMindedness: ['O1', 'O2', 'O3', 'O4', 'O5', 'O6', 'O7', 'O8', 'O9', 'O10'],
  evaluation: ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8', 'E9', 'E10'],
  revision: ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8'],
} as const;

function buildZeroParams(): ParameterSet {
  const mapCodes = (codes: readonly string[]): ParameterResult[] =>
    codes.map((code) => ({ code, level: 0, evidence: '' }));
  return {
    interpretation: mapCodes(ZERO_CODES.interpretation),
    reasoning: mapCodes(ZERO_CODES.reasoning),
    openMindedness: mapCodes(ZERO_CODES.openMindedness),
    evaluation: mapCodes(ZERO_CODES.evaluation),
    revision: mapCodes(ZERO_CODES.revision),
  };
}

export function detectParameters(input: ParameterDetectionInput): ParameterSet {
  const {
    answer,
    question,
    before,
    after,
    sceneKeywords = [],
    causalKeywords = [],
    decorativeKeywords = [],
    mechanismKeywords = [],
    isCorrect,
    decoyCaught,
    challengeStrength,
    confidenceAfter,
    isFarTransfer,
  } = input;

  const relevance = computeRelevance(answer, question, sceneKeywords);
  if (question.trim().length > 0 && relevance < 0.05) {
    return buildZeroParams();
  }

  const r1 = R1_reasonPresence(answer);
  const r2 = R2_reasonRelevance(answer, sceneKeywords);
  const r6 = R6_evidenceCitation(answer);
  const r8 = R8_sufficiency(r1, r6);
  const o3 = O3_perspectiveTaking(answer);
  const m1 = M1_revisionOccurrence(before ?? '', after ?? '');

  return {
    interpretation: [
      I1_specificDetails(answer, sceneKeywords),
      I2_observationVsInterpretation(answer),
      I3_questionRelevance(answer, question),
      I4_noInventedDetails(answer, sceneKeywords),
      I5_multiElementAwareness(answer, sceneKeywords),
      I6_causalVsDecorativeFocus(answer, causalKeywords, decorativeKeywords),
      I7_sceneComprehension(answer, sceneKeywords, isCorrect),
      I8_problemRestatement(answer, question),
    ],
    reasoning: [
      r1,
      r2,
      R3_reasonSpecificity(answer, sceneKeywords),
      R4_chainDepth(answer),
      R5_nonCircularity(answer),
      r6,
      R7_mechanismNaming(answer, mechanismKeywords),
      r8,
      R9_counterConsideration(answer),
      R10_ifThenConditional(answer),
      R11_analogyUse(answer),
      R12_quantifierAccuracy(answer),
    ],
    openMindedness: [
      O1_alternatives(answer),
      O2_alternativeQuality(answer),
      o3,
      O4_hedging(answer),
      O5_absolutismAvoidance(answer),
      O6_contradictionTolerance(answer),
      O7_opennessToWrong(answer),
      O8_perspectiveAccuracy(o3, r2),
      O9_domainAwareness(answer),
      O10_revisionOpenness(answer),
    ],
    evaluation: [
      E1_sourceQuestioning(answer),
      E2_evidenceStrengthDistinction(answer, decoyCaught),
      E3_assumptionIdentification(answer),
      E4_claimEvidenceDistinction(answer),
      E5_biasRecognition(answer),
      E6_sourceReliability(answer, decoyCaught),
      E7_alternativeExplanation(answer),
      E8_evidenceElimination(answer),
      E9_sufficiencyJudgment(answer),
      E10_aiOutputSkepticism(answer, decoyCaught),
    ],
    revision: [
      m1,
      M2_revisionSpecificity(after ?? answer),
      M3_revisionAccuracy(m1, challengeStrength, decoyCaught, isCorrect),
      M4_selfAwareness(after ?? answer),
      M5_uncertaintyNaming(answer),
      M6_confidenceCalibration(confidenceAfter, isCorrect, r8),
      M7_learningArticulation(after ?? answer),
      M8_transferAwareness(after ?? answer, isFarTransfer),
    ],
  };
}