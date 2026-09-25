import crypto from 'node:crypto';
import { buildRightsMatrix, classifyCommercialUse } from './rights.mjs';

function normalizeText(value) {
  return String(value ?? '').trim();
}

export function contentHash(content) {
  return crypto.createHash('sha256').update(String(content ?? '')).digest('hex');
}

export function normalizeArtifact(input) {
  const required = ['source_namespace', 'source_type'];
  for (const key of required) {
    if (!normalizeText(input[key])) throw new Error(`Missing required artifact field: ${key}`);
  }

  const rights = buildRightsMatrix(input.rights ?? []);
  const artifact = {
    source_namespace: normalizeText(input.source_namespace).toLowerCase(),
    source_type: normalizeText(input.source_type).toLowerCase(),
    external_ref: normalizeText(input.external_ref) || null,
    title: normalizeText(input.title) || null,
    source_at: input.source_at ? new Date(input.source_at).toISOString() : null,
    confidentiality: normalizeText(input.confidentiality || 'internal').toLowerCase(),
    sensitivity: normalizeText(input.sensitivity || 'internal').toLowerCase(),
    evidence_tier: input.evidence_tier ?? null,
    rights,
    content_hash: input.content == null ? null : contentHash(input.content),
    metadata: input.metadata ?? {}
  };

  artifact.commercial_use_status = classifyCommercialUse({
    matrix: rights,
    sensitivity: artifact.sensitivity,
    confidentiality: artifact.confidentiality
  });
  return artifact;
}

export function normalizeObservation({ artifact, observation_type, subject_type, subject_key, predicate, value, unit = null, confidence = null, observed_at = null, valid_to = null }) {
  for (const [key, val] of Object.entries({ observation_type, subject_type, subject_key, predicate })) {
    if (!normalizeText(val)) throw new Error(`Missing required observation field: ${key}`);
  }

  return {
    observation_type: normalizeText(observation_type).toLowerCase(),
    subject_type: normalizeText(subject_type).toLowerCase(),
    subject_key: normalizeText(subject_key),
    predicate: normalizeText(predicate).toLowerCase(),
    value,
    unit,
    observed_at: observed_at ? new Date(observed_at).toISOString() : artifact.source_at,
    valid_to: valid_to ? new Date(valid_to).toISOString() : null,
    evidence_tier: artifact.evidence_tier,
    confidence,
    source_ref: artifact.external_ref,
    source_hash: artifact.content_hash,
    commercial_use_status: artifact.commercial_use_status,
    rights: artifact.rights
  };
}
