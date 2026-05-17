export interface Message {
  id: string;
  message: string;
  isAdmin: boolean;
  timestamp: string;
}

export interface FeedbackSession {
  text: string;
  category: string;
  sentiment: string;
  timestamp: string;
  status: string;
}

export interface SessionData {
  feedback: FeedbackSession;
  messages: Message[];
}