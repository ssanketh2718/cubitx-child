export type SkillCode = 'A1' | 'A2' | 'B1' | 'B2' | 'B3' | 'C1' | 'C2' | 'C3';

export interface ThinkingSheetEntry {
  key: string;
  skillCode: SkillCode;
  subject: string;
  topicName: string;
  questionTitle: string;
  text: string;
  twistText?: string;
  picked?: number;
  completedAt?: string;
}

export interface ThinkingSheetSummary {
  totalCompleted: number;
  entries: ThinkingSheetEntry[];
  bySkill: Record<SkillCode, ThinkingSheetEntry[]>;
}

export function summarizeThinkingSheets(
  responses: Record<string, any>
): ThinkingSheetSummary {
  const bySkill: Record<SkillCode, ThinkingSheetEntry[]> = {
    A1: [],
    A2: [],
    B1: [],
    B2: [],
    B3: [],
    C1: [],
    C2: [],
    C3: [],
  };

  const entries: ThinkingSheetEntry[] = [];

  for (const [key, val] of Object.entries(responses || {})) {
    if (!key.startsWith('sheet:') || !val) continue;

    const skillCode: SkillCode =
      val.skillCode && val.skillCode in bySkill ? val.skillCode : 'B1';

    const entry: ThinkingSheetEntry = {
      key,
      skillCode,
      subject: val.subject || 'Thinking Sheet',
      topicName: val.topicName || 'Chapter Sheet',
      questionTitle: val.questionTitle || 'Question',
      text: val.text || '',
      twistText: val.twistText || '',
      picked: val.picked,
      completedAt: val.completedAt,
    };

    entries.push(entry);
    bySkill[skillCode].push(entry);
  }

  entries.sort((a, b) =>
    (b.completedAt || '').localeCompare(a.completedAt || '')
  );

  return {
    totalCompleted: entries.length,
    entries,
    bySkill,
  };
}
