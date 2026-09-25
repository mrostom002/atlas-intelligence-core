function stable(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  return `{${Object.keys(value).sort().map((k) => `${JSON.stringify(k)}:${stable(value[k])}`).join(',')}}`;
}

export function observationKey(o) {
  return `${o.subject_type}::${o.subject_key}::${o.predicate}`;
}

export function buildDailyDelta(previous = [], current = [], now = new Date()) {
  const prev = new Map(previous.map((o) => [observationKey(o), o]));
  const curr = new Map(current.map((o) => [observationKey(o), o]));
  const added = [];
  const changed = [];
  const stale = [];

  for (const [key, value] of curr) {
    if (!prev.has(key)) {
      added.push(value);
      continue;
    }
    const old = prev.get(key);
    if (stable(old.value) !== stable(value.value) || old.unit !== value.unit || old.evidence_tier !== value.evidence_tier) {
      changed.push({ before: old, after: value });
    }
    if (value.valid_to && new Date(value.valid_to) < now) stale.push(value);
  }

  for (const value of curr.values()) {
    if (value.valid_to && new Date(value.valid_to) < now && !stale.includes(value)) stale.push(value);
  }

  return {
    generated_at: now.toISOString(),
    added,
    changed,
    stale,
    meaningful_change_count: added.length + changed.length + stale.length
  };
}
