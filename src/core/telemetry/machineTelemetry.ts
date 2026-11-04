/**
 * CRACK THE MACHINE TELEMETRY SERVICE
 * Subordinate to CIX-ASSESS-001 Section 10 & DPDP Act 2023 §9
 * In-memory, allowlisted event collector with cryptographic UUIDs and strict idempotency.
 */

export type MachineEventName =
  | 'mission_started'
  | 'input_activated'
  | 'output_shown'
  | 'candidate_rule_selected'
  | 'probe_selected'
  | 'probe_result_shown'
  | 'position_updated'
  | 'reason_selected'
  | 'hint_used'
  | 'mission_completed'
  | 'mission_exited'
  | 'sync_completed';

export interface MachineEvent {
  readonly event_id: string;
  readonly attempt_id: string;
  readonly mission_id: 'crack_the_machine';
  readonly mission_version: string;
  readonly mechanic_id: 'discovery_machine';
  readonly mechanic_version: string;
  readonly event_name: MachineEventName;
  readonly sequence_no: number;
  readonly client_time: string;
  readonly schema_version: '1';
  readonly payload: Readonly<Record<string, string | number | boolean | null>>;
}

export interface MachineTelemetryOptions {
  readonly attemptId: string;
  readonly missionVersion: string;
  readonly mechanicVersion?: string;
}

type ExpectedType = 'string' | 'number' | 'boolean' | 'null';

interface FieldSpec {
  readonly required: boolean;
  readonly types: readonly ExpectedType[];
}

const EVENT_SCHEMAS: Record<MachineEventName, Record<string, FieldSpec>> = {
  mission_started: {
    level_id: { required: true, types: ['string'] },
  },
  input_activated: {
    input: { required: true, types: ['number'] },
  },
  output_shown: {
    input: { required: true, types: ['number'] },
    output: { required: true, types: ['number'] },
  },
  candidate_rule_selected: {
    rule_id: { required: true, types: ['string'] },
  },
  probe_selected: {
    probe: { required: true, types: ['number'] },
  },
  probe_result_shown: {
    input: { required: true, types: ['number'] },
    output: { required: true, types: ['number'] },
    discriminated: { required: true, types: ['boolean'] },
  },
  position_updated: {
    prior_position: { required: true, types: ['string', 'null'] },
    final_position: { required: true, types: ['string'] },
  },
  reason_selected: {
    reason_id: { required: true, types: ['string'] },
  },
  hint_used: {
    hint_level: { required: true, types: ['number'] },
  },
  mission_completed: {
    completion_state: { required: true, types: ['string'] },
  },
  mission_exited: {
    screen: { required: true, types: ['string'] },
  },
  sync_completed: {
    status: { required: true, types: ['string'] },
  },
};

function generateSecureEventId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  throw new Error('[CIX-ASSESS] Cryptographically secure UUID generation is unavailable.');
}

export class MachineTelemetryService {
  private sequence = 0;
  private readonly events: MachineEvent[] = [];
  private readonly seenEventIds = new Set<string>();
  private readonly attemptId: string;
  private readonly missionVersion: string;
  private readonly mechanicVersion: string;

  constructor(options: MachineTelemetryOptions) {
    if (!options.attemptId || !options.attemptId.trim()) {
      throw new Error('[CIX-ASSESS] attemptId is required.');
    }
    this.attemptId = options.attemptId.trim();
    this.missionVersion = options.missionVersion;
    this.mechanicVersion = options.mechanicVersion ?? '1.0.0';
  }

  public emit(
    eventName: MachineEventName,
    payload: Record<string, string | number | boolean | null> = {}
  ): MachineEvent {
    const schema = EVENT_SCHEMAS[eventName];
    if (!schema) {
      throw new Error(`[CIX-ASSESS] Unregistered event: "${eventName}".`);
    }

    const payloadKeys = Object.keys(payload);
    const allowedKeys = Object.keys(schema);

    // Reject unapproved keys (fail-closed)
    const unexpectedKeys = payloadKeys.filter((k) => !allowedKeys.includes(k));
    if (unexpectedKeys.length > 0) {
      throw new Error(
        `[CIX-ASSESS] Rejection on "${eventName}": Unexpected field(s) [${unexpectedKeys.join(', ')}].`
      );
    }

    // Validate required fields and types
    for (const [field, spec] of Object.entries(schema)) {
      const val = payload[field];
      if (val === undefined) {
        if (spec.required) {
          throw new Error(`[CIX-ASSESS] Missing field "${field}" on "${eventName}".`);
        }
        continue;
      }

      const actualType: ExpectedType = val === null ? 'null' : (typeof val as ExpectedType);
      if (!spec.types.includes(actualType)) {
        throw new Error(
          `[CIX-ASSESS] Field "${field}" on "${eventName}" has invalid type "${actualType}". Expected: [${spec.types.join(' | ')}].`
        );
      }
    }

    const eventId = generateSecureEventId();
    if (this.seenEventIds.has(eventId)) {
      throw new Error(`[CIX-ASSESS] Duplicate eventId detected: "${eventId}".`);
    }

    const event: MachineEvent = Object.freeze({
      event_id: eventId,
      attempt_id: this.attemptId,
      mission_id: 'crack_the_machine',
      mission_version: this.missionVersion,
      mechanic_id: 'discovery_machine',
      mechanic_version: this.mechanicVersion,
      event_name: eventName,
      sequence_no: ++this.sequence,
      client_time: new Date().toISOString(),
      schema_version: '1',
      payload: Object.freeze({ ...payload }),
    });

    this.events.push(event);
    this.seenEventIds.add(eventId);

    return event;
  }

  public getEventHistory(): readonly MachineEvent[] {
    return [...this.events];
  }

  public hasEvent(eventId: string): boolean {
    return this.seenEventIds.has(eventId);
  }
}

export function createMachineTelemetry(options: MachineTelemetryOptions): MachineTelemetryService {
  return new MachineTelemetryService(options);
}
