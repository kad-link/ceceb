import { BUILT_IN_PARTICIPANTS } from './constants';
import type { Participant } from './types';

/**
 * Creates a deep copy of the built-in participant list.
 */
export function getDefaultParticipants(): Participant[] {
  return BUILT_IN_PARTICIPANTS.map((p) => ({
    id: p.id,
    name: p.name,
    activityIds: [...p.activityIds],
  }));
}

/**
 * Suggests the next participant ID in C<number> format based on existing participants.
 */
export function getNextParticipantId(participants: readonly Participant[]): string {
  let maxNum = 0;
  for (const p of participants) {
    const match = (p.id ?? '').trim().match(/\d+/);
    if (match) {
      const num = parseInt(match[0], 10);
      if (num > maxNum) {
        maxNum = num;
      }
    }
  }
  const nextNum = maxNum + 1;
  return nextNum < 10 ? `C0${nextNum}` : `C${nextNum}`;
}

/**
 * Adds a new participant to the roster.
 */
export function addParticipantToRoster(
  participants: readonly Participant[],
  newParticipant?: Partial<Participant>
): Participant[] {
  const nextId = newParticipant?.id ?? getNextParticipantId(participants);
  const participant: Participant = {
    id: nextId,
    name: newParticipant?.name ?? '',
    activityIds: newParticipant?.activityIds ? [...newParticipant.activityIds] : [],
  };
  return [...participants, participant];
}

/**
 * Updates a participant by index.
 */
export function updateParticipantInRoster(
  participants: readonly Participant[],
  index: number,
  updates: Partial<Participant>
): Participant[] {
  if (index < 0 || index >= participants.length) {
    return [...participants];
  }

  return participants.map((p, i) => {
    if (i !== index) return p;
    return {
      ...p,
      ...updates,
      activityIds: updates.activityIds ? [...updates.activityIds] : p.activityIds,
    };
  });
}

/**
 * Removes a participant from the roster by index.
 */
export function removeParticipantFromRoster(
  participants: readonly Participant[],
  index: number
): Participant[] {
  return participants.filter((_, i) => i !== index);
}

/**
 * Adds an activity token to a specific participant.
 */
export function addTokenToParticipant(
  participants: readonly Participant[],
  participantIndex: number,
  token: string
): Participant[] {
  const trimmed = token.trim();
  if (participantIndex < 0 || participantIndex >= participants.length) {
    return [...participants];
  }

  return participants.map((p, i) => {
    if (i !== participantIndex) return p;
    return {
      ...p,
      activityIds: [...p.activityIds, trimmed],
    };
  });
}

/**
 * Removes an activity token by its token index from a participant.
 */
export function removeTokenFromParticipant(
  participants: readonly Participant[],
  participantIndex: number,
  tokenIndex: number
): Participant[] {
  if (participantIndex < 0 || participantIndex >= participants.length) {
    return [...participants];
  }

  return participants.map((p, i) => {
    if (i !== participantIndex) return p;
    return {
      ...p,
      activityIds: p.activityIds.filter((_, tIdx) => tIdx !== tokenIndex),
    };
  });
}

/**
 * Replaces all activity tokens for a participant (e.g. from comma-separated input).
 */
export function setParticipantTokens(
  participants: readonly Participant[],
  participantIndex: number,
  tokens: readonly string[]
): Participant[] {
  if (participantIndex < 0 || participantIndex >= participants.length) {
    return [...participants];
  }

  return participants.map((p, i) => {
    if (i !== participantIndex) return p;
    return {
      ...p,
      activityIds: tokens.map((t) => t.trim()),
    };
  });
}
