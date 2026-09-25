const BAND_WEIGHT = Object.freeze({ NOW: 0, NEXT: 1, BUILD: 2, WATCH: 3, BLOCKED: 4 });

function number(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function classifyOpportunity(o) {
  const evidence = number(o.evidence_tier, 5);
  const ttc = number(o.time_to_cash_days, 9999);
  const gp = number(o.expected_gp, 0);
  const recurring = number(o.recurring_gp, 0);
  const cash = number(o.cash_need, 0);
  const control = String(o.control || 'unknown').toLowerCase();
  const rights = String(o.rights_status || 'unknown').toLowerCase();
  const dataGain = String(o.data_gain || 'low').toLowerCase();

  const reasons = [];
  if (rights === 'blocked' || rights === 'prohibited') return { band: 'BLOCKED', reasons: ['rights/permission block'] };

  if (evidence <= 2) reasons.push('strong evidence');
  else if (evidence === 3) reasons.push('qualified evidence');
  else reasons.push('weak evidence');

  if (ttc <= 14) reasons.push('short time-to-cash');
  else if (ttc <= 30) reasons.push('near-term time-to-cash');
  else reasons.push('longer time-to-cash');

  if (cash <= Math.max(gp * 0.2, 1000)) reasons.push('low working-capital exposure');
  else reasons.push('material working-capital exposure');

  if (recurring > 0) reasons.push('recurring economics');
  if (['high', 'medium'].includes(dataGain)) reasons.push(`${dataGain} proprietary-data gain`);
  if (['protected', 'high'].includes(control)) reasons.push('strong control');

  if (evidence <= 2 && ttc <= 14 && gp > 0 && cash <= Math.max(gp * 0.2, 1000)) return { band: 'NOW', reasons };
  if (evidence <= 3 && ttc <= 30 && gp > 0) return { band: 'NEXT', reasons };
  if ((recurring > 0 || dataGain === 'high') && evidence <= 4) return { band: 'BUILD', reasons };
  return { band: 'WATCH', reasons };
}

export function buildMoneyRadar(opportunities = []) {
  return opportunities
    .map((o) => ({ ...o, priority: classifyOpportunity(o) }))
    .sort((a, b) => {
      const band = BAND_WEIGHT[a.priority.band] - BAND_WEIGHT[b.priority.band];
      if (band !== 0) return band;
      return number(b.expected_gp) - number(a.expected_gp);
    });
}
