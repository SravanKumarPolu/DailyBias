export interface BiasFeedbackEntry {
  biasId: string;
  /** Local calendar date YYYY-MM-DD */
  date: string;
  useful: boolean;
  comment?: string;
}

export type BiasFeedbackStore = Record<string, BiasFeedbackEntry>;
