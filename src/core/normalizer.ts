/**
 * Normalization utilities for Participant IDs and Activity IDs.
 *
 * Rules:
 * - Leading and trailing whitespace must be trimmed.
 * - Participant IDs must strictly follow C<number> (e.g., C01, c01, C1, c1 -> canonical "C1").
 * - Activity IDs must strictly follow A<number> (e.g., A01, a01, A1, a1 -> canonical "A1").
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
  const match = trimmed.match(/^[Cc](\d+)$/);

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
    canonicalId: `C${numericValue}`,
    numericValue,
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
