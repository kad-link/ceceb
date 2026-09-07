import { FIXED_ACTIVITIES } from './constants';
import { evaluateParticipantActivities } from './evaluator';
import { normalizeParticipantId } from './normalizer';
import type { Activity, Participant, ParticipantEvaluation, TableEvaluationResult } from './types';
import { validateParticipants } from './validator';

/**
 * Evaluates the entire board of participants:
 *
 * 1. Validates all records across the table.
 * 2. If any validation errors exist, clears results and summary counts (returns empty lists/zeros).
 * 3. If valid:
 *    - Computes points, covered categories, and failure reasons for each participant.
 *    - Sorts results: Eligible participants first, then Ineligible participants.
 *    - Within each eligibility group, sorts ascending by canonical participant ID (or numeric value).
 *    - Calculates summary counts: total, eligible, ineligible.
 */
export function evaluateBoard(
  participants: readonly Participant[],
  catalog: readonly Activity[] = FIXED_ACTIVITIES
): TableEvaluationResult {
  const errors = validateParticipants(participants, catalog);

  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
      evaluations: [],
      summaryCounts: {
        total: 0,
        eligible: 0,
        ineligible: 0,
      },
    };
  }

  const evaluations: ParticipantEvaluation[] = participants.map((p) => {
    const activityEval = evaluateParticipantActivities(p.activityIds, catalog);
    return {
      participantId: p.id.trim(),
      participantName: p.name.trim(),
      completedActivityIds: p.activityIds,
      ...activityEval,
    };
  });

  // Sort: Eligible first, then Ineligible; within each group, sort by numeric ID ascending
  evaluations.sort((a, b) => {
    // 1. Eligible first (true < false in sorting)
    if (a.isEligible !== b.isEligible) {
      return a.isEligible ? -1 : 1;
    }

    // 2. Sort by participant numeric ID / canonical form ascending
    const normA = normalizeParticipantId(a.participantId);
    const normB = normalizeParticipantId(b.participantId);

    if (normA.numericValue !== null && normB.numericValue !== null) {
      if (normA.numericValue !== normB.numericValue) {
        return normA.numericValue - normB.numericValue;
      }
    }

    return a.participantId.localeCompare(b.participantId);
  });

  const eligibleCount = evaluations.filter((e) => e.isEligible).length;
  const ineligibleCount = evaluations.length - eligibleCount;

  return {
    isValid: true,
    errors: [],
    evaluations,
    summaryCounts: {
      total: evaluations.length,
      eligible: eligibleCount,
      ineligible: ineligibleCount,
    },
  };
}
