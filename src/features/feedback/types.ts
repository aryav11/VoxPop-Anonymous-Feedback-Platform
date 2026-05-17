export interface SubmissionResult {
  sessionId: string;
  analysis: {
    topic: string;
    sentiment: string;
  };
}