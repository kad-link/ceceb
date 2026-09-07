/**
 * Normalization utilities for Participant IDs and Activity IDs.
 *
 * Rules:
 * - Participant IDs: Trim leading and trailing whitespace. Must be non-empty.
 *   No required format, no case-folding, no leading-zero equivalence.
 * - Activity IDs: Must strictly follow A<number> (e.g., A01, a01, A1, a1 -> canonical "A1")
 *   and match against the fixed A01–A04 catalog.
 */

export interface NormalizedIdResult {
  raw: string;
  trimmed: string;
  isValidFormat: boolean;
  canonicalId: string | null;
  numericValue: number | null;
}

export function normalizeParticipantId(rawId: string): NormalizedIdResult {
  const trimmed = (rawId ?? '').trim();
  const isValidFormat = trimmed.length > 0;

  return {
    raw: rawId,
    trimmed,
    isValidFormat,
    canonicalId: isValidFormat ? trimmed : null,
    numericValue: null,
  };
}

export function normalizeActivityId(rawId: string): NormalizedIdResult {
  const trimmed = (rawId ?? '').trim();
  const match = trimmed.match(/^[Aa](\d+)$/);

  if (!match) {
    return {
      raw: rawId,
      trimmed,
      isValidFormat: false,
      canonicalId: null,
      numericValue: null,
    };
  }

  const numericValue = parseInt(match[1], 10);
  return {
    raw: rawId,
    trimmed,
    isValidFormat: true,
    canonicalId: `A${numericValue}`,
    numericValue,
  };
}
