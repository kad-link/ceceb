import { FIXED_ACTIVITIES, MIN_POINTS_FOR_ELIGIBILITY, REQUIRED_CATEGORIES } from './constants';
import { normalizeActivityId } from './normalizer';
import type { Activity, Category, ParticipantActivityEvaluation } from './types';

/**
 * Evaluates a participant's completed activities.
 *
 * Requirements:
 * - Sums points from completed activities (looked up in the fixed activity catalog).
 * - Derives the unique set of categories covered.
 * - Always checks BOTH category coverage and point threshold (does not short-circuit).
 * - If ineligible, returns failure reasons in the exact contracted order:
 *     1. MISSING_CATEGORY: LEARN
 *     2. MISSING_CATEGORY: BUILD
 *     3. MISSING_CATEGORY: SHARE
 *     4. POINTS_BELOW_6
 * - If eligible, failure reasons is an empty array.
 * - Pure function, easily unit-testable.
 */
export function evaluateParticipantActivities(
  completedActivityIds: readonly string[],
  catalog: readonly Activity[] = FIXED_ACTIVITIES
): ParticipantActivityEvaluation {
  // Build lookup by canonical activity ID (e.g. "A1", "A2", "A3", "A4")
  const catalogByCanonical = new Map<string, Activity>();
  for (const activity of catalog) {
    catalogByCanonical.set(activity.canonicalId, activity);
  }

  let totalPoints = 0;
  const coveredCategorySet = new Set<Category>();
  const seenCanonicalActivities = new Set<string>();

  for (const rawId of completedActivityIds) {
    const { canonicalId } = normalizeActivityId(rawId);
    if (!canonicalId || seenCanonicalActivities.has(canonicalId)) {
      continue;
    }
    seenCanonicalActivities.add(canonicalId);
    const activity = catalogByCanonical.get(canonicalId);
    if (activity) {
      totalPoints += activity.points;
      coveredCategorySet.add(activity.category);
    }
  }

  // Determine covered categories in canonical display order
  const coveredCategories: Category[] = REQUIRED_CATEGORIES.filter((category) =>
    coveredCategorySet.has(category)
  );

  // Check all missing categories in exact contracted order: LEARN, BUILD, SHARE
  const failureReasons: string[] = [];
  for (const category of REQUIRED_CATEGORIES) {
    if (!coveredCategorySet.has(category)) {
      failureReasons.push(`MISSING_CATEGORY: ${category}`);
    }
  }

  // Check point requirement (>= 6) without short-circuiting
  if (totalPoints < MIN_POINTS_FOR_ELIGIBILITY) {
    failureReasons.push('POINTS_BELOW_6');
  }

  const isEligible = failureReasons.length === 0;

  return {
    totalPoints,
    coveredCategories,
    isEligible,
    failureReasons,
  };
}
