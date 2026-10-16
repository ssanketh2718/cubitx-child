// src/core/analytics/parameters.ts
import { countMarkers, normalise } from './markers';

export interface ParameterResult {
  code: string;
  level: 0 | 1 | 2 | 3 | 4 | 5;
  evidence: string;
}

export interface ParameterSet {
  interpretation: ParameterResult[];
  reasoning: ParameterResult[];
  openMindedness: ParameterResult[];
  evaluation: ParameterResult[];
  revision: ParameterResult[];
}

/* RELEVANCE GATE */
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

  if (total === 0) return 1;
  return hits / total;
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function hasNumber(text: string): boolean {
  return /\b\d+(?:\.\d+)?\b/.test(text);
}

function mentionsSceneElement(text: string, sceneKeywords: string[] = []): boolean {
  if (sceneKeywords.length === 0) return false;
  const lower = text.toLowerCase();
  return sceneKeywords.some((k) => lower.includes(k.toLowerCase()));
}

function extractMatch(text: string, pattern: RegExp): string {
  const m = text.match(pattern);
  if (!m) return '';
  const idx = text.indexOf(m[0]);
  const start = Math.max(0, idx - 20);
  const end = Math.min(text.length, idx + m[0].length + 20);
  return '…' + text.slice(start, end).trim() + '…';
}

const CAUSAL_SO = /\bso\b\s+(?:the|it|he|she|they|we|i|you|there|that|this|because|then|now)/i;

function countCausalInContext(text: string): number {
  const markers = countMarkers(text, 'causal');
  const soInstances = (text.match(/\bso\b/gi) || []).length;
  const soInClause = (text.match(CAUSAL_SO) || []).length;
  const spuriousSo = soInstances - soInClause;
  return Math.max(0, markers - spuriousSo);
}

/* INTERPRETATION */
function I1_specificDetails(text: string, sceneKeywords: string[]): ParameterResult {
  const wc = wordCount(text);
  const sceneHit = mentionsSceneElement(text, sceneKeywords);
  let score = 0;
  if (sceneHit) score += 2;
  if (sceneHit && hasNumber(text)) score += 1;
  if (sceneHit && wc >= 15) score += 1;
  return {
    code: 'I1',
    level: Math.min(5, score) as ParameterResult['level'],
    evidence: sceneHit ? text.slice(0, 80) : '',
  };
}

function I2_observationVsInterpretation(text: string): ParameterResult {
  const obs = countMarkers(text, 'evidence');
  const interp = countMarkers(text, 'hedge');
  if (obs > 0 && interp > 0)
    return { code: 'I2', level: 4, evidence: extractMatch(text, /i saw|i noticed|i think|i feel/i) };
  if (obs > 0) return { code: 'I2', level: 2, evidence: extractMatch(text, /i saw|i noticed/i) };
  if (interp > 0) return { code: 'I2', level: 1, evidence: extractMatch(text, /i think|maybe|perhaps/i) };
  return { code: 'I2', level: 0, evidence: '' };
}

function I3_questionRelevance(text: string, question: string): ParameterResult {
  if (!question || question.trim().length < 2) {
    return { code: 'I3', level: 0, evidence: '' };
  }
  const answerWords = new Set(normalise(text.toLowerCase()).split(/\s+/).filter((w) => w.length > 3));
  const questionWords = normalise(question.toLowerCase()).split(/\s+/).filter((w) => w.length > 3);
  const overlap = questionWords.filter((w) => answerWords.has(w)).length;
  const ratio = questionWords.length > 0 ? overlap / questionWords.length : 0;
  let level: ParameterResult['level'] = 0;
  if (ratio >= 0.25) level = 2;
  if (ratio >= 0.45) level = 3;
  if (ratio >= 0.65) level = 4;
  return { code: 'I3', level, evidence: level > 0 ? text.slice(0, 60) : '' };
}

function I4_noInventedDetails(text: string, sceneKeywords: string[]): ParameterResult {
  if (sceneKeywords.length === 0) return { code: 'I4', level: 0, evidence: '' };
  const lower = text.toLowerCase();
  const hasSceneRef = sceneKeywords.some((k) => lower.includes(k.toLowerCase()));
  if (hasSceneRef) return { code: 'I4', level: 4, evidence: '' };
  return { code: 'I4', level: 0, evidence: '' };
}

/* REASONING */
function R1_reasonPresence(text: string): ParameterResult {
  const causal = countCausalInContext(text);
  if (causal === 0) return { code: 'R1', level: 0, evidence: '' };
  if (causal === 1) return { code: 'R1', level: 2, evidence: extractMatch(text, /because|since|therefore|कारण|म्हणून/i) };
  return { code: 'R1', level: 4, evidence: extractMatch(text, /because|since|therefore/i) };
}

function R3_reasonSpecificity(text: string, sceneKeywords: string[]): ParameterResult {
  const causal = countCausalInContext(text);
  if (causal === 0) return { code: 'R3', level: 0, evidence: '' };
  const sceneHit = mentionsSceneElement(text, sceneKeywords);
  let level: ParameterResult['level'] = 1;
  if (sceneHit) level = 3;
  if (sceneHit && hasNumber(text)) level = 4;
  return { code: 'R3', level, evidence: '' };
}

function R4_chainDepth(text: string): ParameterResult {
  const causal = countCausalInContext(text);
  if (causal === 0) return { code: 'R4', level: 0, evidence: '' };
  if (causal === 1) return { code: 'R4', level: 1, evidence: '' };
  if (causal === 2) return { code: 'R4', level: 3, evidence: extractMatch(text, /so|therefore|कारण|म्हणून/i) };
  return { code: 'R4', level: 4, evidence: extractMatch(text, /so|therefore/i) };
}

function R6_evidenceCitation(text: string): ParameterResult {
  const evidence = countMarkers(text, 'evidence');
  if (evidence === 0) return { code: 'R6', level: 0, evidence: '' };
  if (evidence === 1) return { code: 'R6', level: 2, evidence: extractMatch(text, /i saw|i noticed|i felt|i checked/i) };
  return { code: 'R6', level: 4, evidence: extractMatch(text, /i saw|i noticed|i felt/i) };
}

function R9_counterConsideration(text: string): ParameterResult {
  const contrast = countMarkers(text, 'contrast');
  if (contrast === 0) return { code: 'R9', level: 0, evidence: '' };
  if (contrast === 1) return { code: 'R9', level: 2, evidence: extractMatch(text, /but|however|although|पण|लेकिन/i) };
  return { code: 'R9', level: 4, evidence: extractMatch(text, /but|however/i) };
}

/* OPEN-MINDEDNESS */
function O1_alternatives(text: string): ParameterResult {
  const alts = countMarkers(text, 'alternative');
  if (alts === 0) return { code: 'O1', level: 0, evidence: '' };
  if (alts === 1) return { code: 'O1', level: 2, evidence: extractMatch(text, /maybe|perhaps|or|किंवा|शायद/i) };
  if (alts === 2) return { code: 'O1', level: 3, evidence: extractMatch(text, /or|या|किंवा/i) };
  return { code: 'O1', level: 5, evidence: extractMatch(text, /or|alternative|दुसरा/i) };
}

function O4_hedging(text: string): ParameterResult {
  const hedges = countMarkers(text, 'hedge');
  if (hedges === 0) return { code: 'O4', level: 0, evidence: '' };
  if (hedges === 1) return { code: 'O4', level: 2, evidence: extractMatch(text, /maybe|perhaps|i think|शायद|वाटतं/i) };
  return { code: 'O4', level: 4, evidence: '' };
}

function O5_absolutismAvoidance(text: string): ParameterResult {
  const wc = wordCount(text);
  const absolutes = countMarkers(text, 'absolute');
  const hedges = countMarkers(text, 'hedge');
  if (wc < 12 || hedges === 0) return { code: 'O5', level: 0, evidence: '' };
  if (absolutes === 0) return { code: 'O5', level: 4, evidence: '' };
  if (absolutes === 1) return { code: 'O5', level: 2, evidence: extractMatch(text, /always|never|हमेशा|नहमी/i) };
  return { code: 'O5', level: 0, evidence: extractMatch(text, /always|never/i) };
}

function O7_opennessToWrong(text: string): ParameterResult {
  const patterns = /i (?:could|might|may) be wrong|i'?m not (?:sure|certain)|maybe i'?m wrong|i might have missed|not sure if i'?m right|मी चुकू शकतो|मी चुकले असू शकते|मुझे नहीं पता|शायद मैं गलत हूं/i;
  if (patterns.test(text)) return { code: 'O7', level: 5, evidence: extractMatch(text, patterns) };
  return { code: 'O7', level: 0, evidence: '' };
}

/* EVALUATION */
function E1_sourceQuestioning(text: string): ParameterResult {
  const patterns = /\b(who says|how do they know|how do you know|is it true|are they sure|did they check|where did they|how can they be sure)\b|kisne kaha|kaise pata|कसा माहित|कोण म्हणालं|किसने कहा|कैसे पता/gi;
  if (patterns.test(text)) return { code: 'E1', level: 4, evidence: extractMatch(text, patterns) };
  return { code: 'E1', level: 0, evidence: '' };
}

function E3_assumptionIdentification(text: string): ParameterResult {
  const patterns = /\b(assumes|assuming|takes it for granted|it depends on|presupposes|what if it'?s not|but if it isn'?t)\b|maan lo|maan lete hain|गृहीत धरतं|मान लो|मान लेते/gi;
  if (patterns.test(text)) return { code: 'E3', level: 4, evidence: extractMatch(text, patterns) };
  return { code: 'E3', level: 0, evidence: '' };
}

function E6_sourceReliability(text: string): ParameterResult {
  const patterns = /\b(everyone says|people say|common knowledge|sab kehte|sagle mhantat|सब कहते|सगळे म्हणतात|actually studied|doctors have|researchers|checked by)\b/gi;
  if (patterns.test(text)) return { code: 'E6', level: 3, evidence: extractMatch(text, patterns) };
  return { code: 'E6', level: 0, evidence: '' };
}

/* REVISION */
function M1_revisionOccurrence(before: string, after: string): ParameterResult {
  if (!before || !after) return { code: 'M1', level: 0, evidence: '' };
  const similarity = jaccardSimilarity(
    normalise(before.toLowerCase()),
    normalise(after.toLowerCase())
  );
  if (similarity < 0.4) return { code: 'M1', level: 5, evidence: after.slice(0, 80) };
  if (similarity < 0.65) return { code: 'M1', level: 3, evidence: '' };
  return { code: 'M1', level: 1, evidence: '' };
}

function M2_revisionSpecificity(after: string): ParameterResult {
  const metacog = countMarkers(after, 'metacognition');
  if (metacog === 0) return { code: 'M2', level: 0, evidence: '' };
  if (metacog === 1) return { code: 'M2', level: 2, evidence: extractMatch(after, /i used to think|now i think|at first/i) };
  return { code: 'M2', level: 4, evidence: extractMatch(after, /i used to think|now i think/i) };
}

function M5_uncertaintyNaming(text: string): ParameterResult {
  const uncertainty = countMarkers(text, 'uncertainty');
  if (uncertainty === 0) return { code: 'M5', level: 0, evidence: '' };
  const hasSpecific = /\b(whether|if|how|why|what|which)\b|की|का|काय/.test(text);
  if (hasSpecific) {
    return { code: 'M5', level: 4, evidence: extractMatch(text, /i don'?t know if|not sure whether|शायद|माहित नाही/i) };
  }
  return { code: 'M5', level: 2, evidence: '' };
}

function jaccardSimilarity(a: string, b: string): number {
  const setA = new Set(a.split(/\s+/).filter((w) => w.length > 2));
  const setB = new Set(b.split(/\s+/).filter((w) => w.length > 2));
  if (setA.size === 0 && setB.size === 0) return 1;
  const intersection = [...setA].filter((w) => setB.has(w)).length;
  const union = new Set([...setA, ...setB]).size;
  return union > 0 ? intersection / union : 0;
}

const ZERO_PARAMS: ParameterSet = {
  interpretation: [
    { code: 'I1', level: 0, evidence: '' },
    { code: 'I2', level: 0, evidence: '' },
    { code: 'I3', level: 0, evidence: '' },
    { code: 'I4', level: 0, evidence: '' },
  ],
  reasoning: [
    { code: 'R1', level: 0, evidence: '' },
    { code: 'R3', level: 0, evidence: '' },
    { code: 'R4', level: 0, evidence: '' },
    { code: 'R6', level: 0, evidence: '' },
    { code: 'R9', level: 0, evidence: '' },
  ],
  openMindedness: [
    { code: 'O1', level: 0, evidence: '' },
    { code: 'O4', level: 0, evidence: '' },
    { code: 'O5', level: 0, evidence: '' },
    { code: 'O7', level: 0, evidence: '' },
  ],
  evaluation: [
    { code: 'E1', level: 0, evidence: '' },
    { code: 'E3', level: 0, evidence: '' },
    { code: 'E6', level: 0, evidence: '' },
  ],
  revision: [
    { code: 'M1', level: 0, evidence: '' },
    { code: 'M2', level: 0, evidence: '' },
    { code: 'M5', level: 0, evidence: '' },
  ],
};

export function detectParameters(input: {
  answer: string;
  question: string;
  before?: string;
  after?: string;
  sceneKeywords?: string[];
}): ParameterSet {
  const { answer, question, before, after, sceneKeywords = [] } = input;

  const relevance = computeRelevance(answer, question, sceneKeywords);
  if (question.trim().length > 0 && relevance < 0.05) {
    return ZERO_PARAMS;
  }

  return {
    interpretation: [
      I1_specificDetails(answer, sceneKeywords),
      I2_observationVsInterpretation(answer),
      I3_questionRelevance(answer, question),
      I4_noInventedDetails(answer, sceneKeywords),
    ],
    reasoning: [
      R1_reasonPresence(answer),
      R3_reasonSpecificity(answer, sceneKeywords),
      R4_chainDepth(answer),
      R6_evidenceCitation(answer),
      R9_counterConsideration(answer),
    ],
    openMindedness: [
      O1_alternatives(answer),
      O4_hedging(answer),
      O5_absolutismAvoidance(answer),
      O7_opennessToWrong(answer),
    ],
    evaluation: [
      E1_sourceQuestioning(answer),
      E3_assumptionIdentification(answer),
      E6_sourceReliability(answer),
    ],
    revision: [
      M1_revisionOccurrence(before ?? '', after ?? ''),
      M2_revisionSpecificity(after ?? answer),
      M5_uncertaintyNaming(answer),
    ],
  };
}
