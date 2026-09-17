import type { SessionSummary } from './reasoning';

export interface Insight {
  kind: 'strength' | 'growth' | 'pattern' | 'action';
  emoji: string;
  title: string;
  body: string;
}

export function generateInsights(sessions: SessionSummary[]): Insight[] {
  const insights: Insight[] = [];
  if (!sessions.length){
    return [{ kind: 'action', emoji: '🌱', title: 'Nothing to analyze yet', body: 'Play a mission to see insights here.' }];
  }

  const recent = sessions.slice(0, 5);

  const fastWrong = recent.filter(s => s.avgSecondsPerRound > 0 && s.avgSecondsPerRound < 8 && s.accuracy < 50);
  if (fastWrong.length >= 2){
    insights.push({ kind: 'growth', emoji: '⚡', title: 'Slow down a little', body: `Your child is finishing rounds in about ${fastWrong[0].avgSecondsPerRound}s but getting many wrong. The pattern suggests guessing rather than thinking. Try: "Before you tap, tell me what you noticed."` });
  }

  const fastRight = recent.filter(s => s.avgSecondsPerRound > 0 && s.avgSecondsPerRound < 12 && s.accuracy >= 70);
  if (fastRight.length >= 2){
    insights.push({ kind: 'strength', emoji: '🎯', title: 'Moving with confidence', body: `Your child is solving rounds in around ${fastRight[0].avgSecondsPerRound}s and getting most right. That's fluency.` });
  }

  const heavyHints = recent.filter(s => s.hintsUsed >= 3);
  if (heavyHints.length >= 2){
    insights.push({ kind: 'growth', emoji: '🛟', title: 'Reaching for hints quickly', body: `In ${heavyHints.length} recent sessions, your child used 3+ hints. Hints are useful, but struggling a bit before asking builds independence.` });
  }

  const independent = recent.filter(s => s.hintsUsed === 0 && s.accuracy >= 70 && s.roundsAttempted >= 3);
  if (independent.length >= 2){
    insights.push({ kind: 'strength', emoji: '💪', title: 'Independent problem solver', body: `Your child solved ${independent[0].roundsAttempted} rounds without asking for a single hint. That's genuine independence.` });
  }

  const sys = recent.filter(s => { const m = s.markers.find(x => x.key === 'systematicity'); return m && Number(m.value) >= 60; });
  if (sys.length >= 2){
    insights.push({ kind: 'strength', emoji: '🔬', title: 'Testing like a scientist', body: `In ${sys.length} sessions, your child tested numbers in order rather than jumping around. That's the habit that separates guesswork from investigation.` });
  }

  const rand = recent.filter(s => { const m = s.markers.find(x => x.key === 'systematicity'); return m && Number(m.value) < 35 && s.roundsAttempted >= 2; });
  if (rand.length >= 2){
    insights.push({ kind: 'growth', emoji: '🧭', title: 'Testing is scattered', body: `Your child often jumps around when testing. Suggest: "Try 1, then 2, then 3. What do you notice?" Testing in order makes patterns visible faster.` });
  }

  const giveUpTotal = recent.reduce((a, s) => { const m = s.markers.find(x => x.key === 'giveUps'); return a + (m ? Number(m.value) : 0); }, 0);
  if (giveUpTotal >= 3){
    insights.push({ kind: 'growth', emoji: '🏔️', title: 'Giving up quickly', body: `Your child pressed "show me the answer" ${giveUpTotal} times recently. Try: "One more try before we see the answer?"` });
  }

  const goodPredictions = recent.filter(s => s.predictionsMade > 0 && s.predictionsCorrect / Math.max(1, s.predictionsMade) >= 0.7);
  if (goodPredictions.length >= 2){
    insights.push({ kind: 'strength', emoji: '🎓', title: 'Strong predictions', body: `When your child forms a theory and predicts, they are usually right. That means they're reasoning, not guessing.` });
  }

  return insights;
}

export function generateConversationStarters(sessions: SessionSummary[]): string[] {
  if (!sessions.length) return [];
  const starters: string[] = [];
  const latest = sessions[0];

  if (latest.accuracy >= 80){
    starters.push(`"You got ${latest.roundsCorrect} out of ${latest.roundsAttempted} right. Which one was easiest to figure out?"`);
  } else if (latest.accuracy < 50){
    starters.push(`"You tried ${latest.roundsAttempted} rounds. Which one was the trickiest? What did you try first?"`);
  }

  if (latest.hypothesesFormed > 0){
    starters.push(`"You wrote down a guess. What made you think that might be the rule?"`);
  }

  if (latest.hintsUsed > 0){
    starters.push(`"You asked for a hint. Did it help you figure it out, or did you already know?"`);
  }

  if (!starters.length){
    starters.push('"What did you notice today that you didn\'t notice before?"');
  }

  return starters.slice(0, 3);
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}
