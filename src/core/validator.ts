import { FIXED_ACTIVITIES } from './constants';
import { normalizeActivityId } from './normalizer';
import type { Activity, Participant, ValidationError, ValidationErrorCode } from './types';

/**
 * Validates the full list of participant records according to strict requirements:
 *
 * 1. Collects ALL errors across the entire table without early termination.
 * 2. Formats each error using the structured format:
 *    "[ERROR_TYPE] Participant: <id> | Activity: <activity or N/A> | <description>"
 * 3. Orders errors for each participant alphabetically by error type:
 *    - DUPLICATE_PARTICIPANT_ID
 *    - DUPLICATE_PARTICIPATION
 *    - INVALID_PARTICIPANT
 *    - UNKNOWN_ACTIVITY
 * 4. Checks:
 *    - INVALID_PARTICIPANT: Missing/empty ID or blank name.
 *    - DUPLICATE_PARTICIPANT_ID: Multiple participants share the exact same trimmed ID.
 *    - UNKNOWN_ACTIVITY: Activity ID not matching A<number> or not in catalog.
 *    - DUPLICATE_PARTICIPATION: Participant lists the same activity more than once.
 */
export function validateParticipants(
  participants: readonly Participant[],
  catalog: readonly Activity[] = FIXED_ACTIVITIES
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Catalog lookup by canonical ID
  const validCanonicalActivities = new Set<string>(
    catalog.map((a) => a.canonicalId)
  );

  // First pass: identify duplicates among exact trimmed participant IDs
  const participantCountByTrimmed = new Map<string, number>();
  for (const p of participants) {
    const trimmedId = (p.id ?? '').trim();
    if (trimmedId) {
      participantCountByTrimmed.set(
        trimmedId,
        (participantCountByTrimmed.get(trimmedId) ?? 0) + 1
      );
    }
  }

  // Second pass: validate each participant record
  participants.forEach((p, index) => {
    const participantErrors: ValidationError[] = [];
    const trimmedId = (p.id ?? '').trim();
    const displayParticipantId = trimmedId || `Row ${index + 1}`;

    // 1. Participant ID check: must be non-empty and unique
    if (!trimmedId) {
      participantErrors.push(
        createError('INVALID_PARTICIPANT', displayParticipantId, undefined, 'Participant ID is missing or empty')
      );
    } else if ((participantCountByTrimmed.get(trimmedId) ?? 0) > 1) {
      // DUPLICATE_PARTICIPANT_ID: fires only on exact trimmed ID match
      participantErrors.push(
        createError(
          'DUPLICATE_PARTICIPANT_ID',
          displayParticipantId,
          undefined,
          `Participant ID "${displayParticipantId}" is used by multiple participants`
        )
      );
    }

    // 2. Participant Name check
    const trimmedName = (p.name ?? '').trim();
    if (!trimmedName) {
      // Format per Decision 4: "{participant_id} has no valid name"
      participantErrors.push(
        createError(
          'INVALID_PARTICIPANT',
          displayParticipantId,
          undefined,
          `${displayParticipantId} has no valid name`
        )
      );
    }

    // 3. Activity Validation: Unknown Activity & Duplicate Participation
    const seenActivityCanonicals = new Set<string>();

    for (const rawActivityId of p.activityIds) {
      const normA = normalizeActivityId(rawActivityId);
      const activityDisplay = normA.trimmed || 'empty';

      // Check format and existence
      if (!normA.isValidFormat || !normA.canonicalId || !validCanonicalActivities.has(normA.canonicalId)) {
        participantErrors.push(
          createError(
            'UNKNOWN_ACTIVITY',
            displayParticipantId,
            activityDisplay,
            `Activity "${activityDisplay}" does not exist in the fixed activity catalog`
          )
        );
      } else {
        // Known valid activity: check for duplicate participation
        if (seenActivityCanonicals.has(normA.canonicalId)) {
          participantErrors.push(
            createError(
              'DUPLICATE_PARTICIPATION',
              displayParticipantId,
              activityDisplay,
              `Participant ${displayParticipantId} has duplicate participation for activity ${activityDisplay}`
            )
          );
        } else {
          seenActivityCanonicals.add(normA.canonicalId);
        }
      }
    }

    // Sort this participant's errors alphabetically by errorType
    participantErrors.sort((a, b) => a.errorType.localeCompare(b.errorType));

    errors.push(...participantErrors);
  });

  return errors;
}

function createError(
  errorType: ValidationErrorCode,
  participantId: string,
  activityId: string | undefined,
  description: string
): ValidationError {
  const activityPart = activityId ? activityId : 'N/A';
  const formattedMessage = `[${errorType}] Participant: ${participantId} | Activity: ${activityPart} | ${description}`;

  return {
    errorType,
    participantId,
    activityId,
    description,
    formattedMessage,
  };
}
