// src/types/mission.ts
import { z } from "zod";

export const MissionOptionSchema = z.object({
  id: z.string().max(10), 
  text: z.string().max(200),
});

export const MissionPhaseSchema = z.object({
  title: z.string().max(100),
  audio: z.string().max(500),
  prompt: z.string().max(500).optional(),
  options: z.array(MissionOptionSchema).max(4),
});

export const MissionSchema = z.object({
  id: z.string().max(50),
  icon: z.string().max(10),
  context: z.array(z.string().max(500)),
  audioContext: z.string().max(1000),
  questionPhase: MissionPhaseSchema,
  twistPhase: MissionPhaseSchema,
  synthesisPhase: MissionPhaseSchema,
});

export type Mission = z.infer<typeof MissionSchema>;
export type MissionOption = z.infer<typeof MissionOptionSchema>;
