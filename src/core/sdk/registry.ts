import type { MissionSpec, DomainKey } from './types';

class MissionRegistry {
  private missions = new Map<string, MissionSpec>();

  register(spec: MissionSpec) {
    if (this.missions.has(spec.id)) {
      console.warn(`Mission ${spec.id} already registered — skipping`);
      return;
    }
    this.validate(spec);
    this.missions.set(spec.id, spec);
  }

  get(id: string) {
    return this.missions.get(id);
  }

  all(): MissionSpec[] {
    return [...this.missions.values()];
  }

  byDomain(domain: DomainKey): MissionSpec[] {
    return this.all().filter((m) => m.domain === domain);
  }

  count() {
    return this.missions.size;
  }

  private validate(spec: MissionSpec) {
    const required: (keyof MissionSpec)[] = [
      'id', 'name', 'emoji', 'domain', 'domainName', 'sub', 'measures', 'Component',
    ];
    for (const f of required) {
      if (!spec[f]) throw new Error(`Mission ${spec.id} missing field: ${f}`);
    }
    if (!Array.isArray(spec.measures) || spec.measures.length === 0) {
      throw new Error(`Mission ${spec.id} must declare at least one measure`);
    }
  }
}

export const registry = new MissionRegistry();
