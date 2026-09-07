export type Category = 'LEARN' | 'BUILD' | 'SHARE';

export interface Activity {
  id: string; // e.g., "A01"
  canonicalId: string; // e.g., "A1"
  name: string;
  category: Category;
  points: number;
}

export interface Participant {
  id: string; // e.g., "C01"
  name: string; // e.g., "Asha"
  activityIds: string[]; // e.g., ["A01", "A02", "A03"]
}

export interface ParticipantActivityEvaluation {
  totalPoints: number;
  coveredCategories: Category[];
  isEligible: boolean;
  failureReasons: string[];
}

export interface ParticipantEvaluation extends ParticipantActivityEvaluation {
  participantId: string;
  participantName: string;
  completedActivityIds: string[];
}

export type ValidationErrorCode =
  | 'INVALID_PARTICIPANT'
  | 'DUPLICATE_PARTICIPANT_ID'
  | 'UNKNOWN_ACTIVITY'
  | 'DUPLICATE_PARTICIPATION';

export interface ValidationError {
  errorType: ValidationErrorCode;
  participantId: string;
  activityId?: string;
  description: string;
  formattedMessage: string;
}

export interface TableEvaluationResult {
  isValid: boolean;
  errors: ValidationError[];
  evaluations: ParticipantEvaluation[];
  summaryCounts: {
    total: number;
    eligible: number;
    ineligible: number;
  };
}
