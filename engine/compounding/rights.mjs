export const RIGHTS_SCOPES = Object.freeze([
  'raw_internal',
  'derived_internal',
  'derived_external',
  'raw_external',
  'api_distribution',
  'model_use'
]);

export const RIGHTS_STATUSES = Object.freeze(['allowed', 'restricted', 'prohibited', 'unknown']);

export function buildRightsMatrix(rules = []) {
  const matrix = Object.fromEntries(RIGHTS_SCOPES.map((scope) => [scope, 'unknown']));
  for (const rule of rules) {
    if (!RIGHTS_SCOPES.includes(rule.scope)) throw new Error(`Unknown rights scope: ${rule.scope}`);
    if (!RIGHTS_STATUSES.includes(rule.status)) throw new Error(`Unknown rights status: ${rule.status}`);
    matrix[rule.scope] = rule.status;
  }
  return matrix;
}

export function canUse(matrix, scope) {
  if (!RIGHTS_SCOPES.includes(scope)) throw new Error(`Unknown rights scope: ${scope}`);
  return matrix[scope] === 'allowed';
}

export function classifyCommercialUse({ matrix, sensitivity = 'internal', confidentiality = 'internal' }) {
  const sensitive = new Set(['personal', 'secret', 'regulated', 'credential', 'counterparty_confidential']);
  const isSensitive = sensitive.has(String(sensitivity).toLowerCase()) || String(confidentiality).toLowerCase() === 'confidential';

  if (matrix.derived_external === 'allowed' && !isSensitive) return 'external_permitted';
  if (matrix.derived_external === 'allowed' && isSensitive) return 'derived_external_with_review';
  if (matrix.derived_internal === 'allowed' || matrix.raw_internal === 'allowed') return 'internal_only';
  if (matrix.raw_internal === 'prohibited' && matrix.derived_internal === 'prohibited') return 'prohibited';
  return 'rights_unknown';
}

export function assertNoExternalLeak({ matrix, fields = [], commercialUseStatus }) {
  const protectedFields = fields.filter((f) => ['personal', 'secret', 'counterparty_confidential', 'credential'].includes(f.sensitivity));
  if (protectedFields.length && ['external_permitted', 'derived_external_with_review'].includes(commercialUseStatus)) {
    if (matrix.derived_external !== 'allowed') {
      throw new Error('Protected data cannot reach an external surface without explicit derived_external permission.');
    }
  }
  return true;
}
