import { useCallback, useState } from 'react';
import { evaluateBoard } from '../core/boardEvaluator';
import { FIXED_ACTIVITIES } from '../core/constants';
import {
  addParticipantToRoster,
  addTokenToParticipant,
  getDefaultParticipants,
  removeParticipantFromRoster,
  removeTokenFromParticipant,
  setParticipantTokens,
  updateParticipantInRoster,
} from '../core/rosterState';
import type { Activity, Participant, TableEvaluationResult } from '../core/types';

export interface UseEligibilityBoardReturn {
  participants: Participant[];
  activities: readonly Activity[];
  evaluationResult: TableEvaluationResult | null;
  hasEvaluated: boolean;
  evaluate: () => void;
  reset: () => void;
  addParticipant: (newParticipant?: Partial<Participant>) => void;
  updateParticipant: (index: number, updates: Partial<Participant>) => void;
  removeParticipant: (index: number) => void;
  addActivityToken: (participantIndex: number, token: string) => void;
  removeActivityToken: (participantIndex: number, tokenIndex: number) => void;
  setParticipantTokens: (participantIndex: number, tokens: string[]) => void;
}

export function useEligibilityBoard(): UseEligibilityBoardReturn {
  const [participants, setParticipants] = useState<Participant[]>(getDefaultParticipants);
  const [evaluationResult, setEvaluationResult] = useState<TableEvaluationResult | null>(null);
  const [hasEvaluated, setHasEvaluated] = useState<boolean>(false);

  // Clear previous evaluation when roster inputs change so results/errors stay synchronized
  const invalidateEvaluation = useCallback(() => {
    setEvaluationResult(null);
    setHasEvaluated(false);
  }, []);

  const addParticipant = useCallback((newParticipant?: Partial<Participant>) => {
    setParticipants((prev) => addParticipantToRoster(prev, newParticipant));
    invalidateEvaluation();
  }, [invalidateEvaluation]);

  const updateParticipant = useCallback(
    (index: number, updates: Partial<Participant>) => {
      setParticipants((prev) => updateParticipantInRoster(prev, index, updates));
      invalidateEvaluation();
    },
    [invalidateEvaluation]
  );

  const removeParticipant = useCallback(
    (index: number) => {
      setParticipants((prev) => removeParticipantFromRoster(prev, index));
      invalidateEvaluation();
    },
    [invalidateEvaluation]
  );

  const addActivityToken = useCallback(
    (participantIndex: number, token: string) => {
      setParticipants((prev) => addTokenToParticipant(prev, participantIndex, token));
      invalidateEvaluation();
    },
    [invalidateEvaluation]
  );

  const removeActivityToken = useCallback(
    (participantIndex: number, tokenIndex: number) => {
      setParticipants((prev) =>
        removeTokenFromParticipant(prev, participantIndex, tokenIndex)
      );
      invalidateEvaluation();
    },
    [invalidateEvaluation]
  );

  const setTokens = useCallback(
    (participantIndex: number, tokens: string[]) => {
      setParticipants((prev) => setParticipantTokens(prev, participantIndex, tokens));
      invalidateEvaluation();
    },
    [invalidateEvaluation]
  );

  const evaluate = useCallback(() => {
    const result = evaluateBoard(participants, FIXED_ACTIVITIES);
    setEvaluationResult(result);
    setHasEvaluated(true);
  }, [participants]);

  const reset = useCallback(() => {
    setParticipants(getDefaultParticipants());
    setEvaluationResult(null);
    setHasEvaluated(false);
  }, []);

  return {
    participants,
    activities: FIXED_ACTIVITIES,
    evaluationResult,
    hasEvaluated,
    evaluate,
    reset,
    addParticipant,
    updateParticipant,
    removeParticipant,
    addActivityToken,
    removeActivityToken,
    setParticipantTokens: setTokens,
  };
}
