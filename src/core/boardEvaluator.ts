import { FIXED_ACTIVITIES } from './constants';
import { evaluateParticipantActivities } from './evaluator';
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

  // Sort: Eligible first, then Ineligible; within each group, sort by participant ID ascending
  evaluations.sort((a, b) => {
    // 1. Eligible first (true < false in sorting)
    if (a.isEligible !== b.isEligible) {
      return a.isEligible ? -1 : 1;
    }

    // 2. Sort by participant ID ascending (natural sort e.g. C01, C02 or C1, C2)
    return a.participantId.localeCompare(b.participantId, undefined, { numeric: true });
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
