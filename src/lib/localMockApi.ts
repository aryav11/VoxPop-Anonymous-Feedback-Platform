type Feedback = {
  text: string;
  category: string;
  sentiment: "Positive" | "Neutral" | "Negative";
  timestamp: string;
  status: "Received" | "Investigating" | "In Progress" | "Resolved";
  isAnonymous: boolean;
  upvotes: number;
  sessionId: string;
  adminNote?: string;
  lastUpdated?: string;
};

type Message = {
  id: string;
  message: string;
  isAdmin: boolean;
  timestamp: string;
};

type CommunityPost = {
  id: string;
  text: string;
  category: string;
  sentiment: Feedback["sentiment"];
  timestamp: string;
  upvotes: number;
  isVisible: boolean;
};

const feedbackKey = "voxpop-demo-feedback";
const messagesKey = "voxpop-demo-messages";
const communityKey = "voxpop-demo-community";

export async function handleLocalApi<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = options.method?.toUpperCase() || "GET";
  const url = new URL(path, "http://local.voxpop");
  const body = await readBody(options.body);

  if (method === "POST" && url.pathname === "/feedback") {
    return submitFeedback(body) as T;
  }

  const sessionMatch = url.pathname.match(/^\/session\/([^/]+)$/);
  if (method === "GET" && sessionMatch) {
    return getSession(sessionMatch[1]) as T;
  }

  const messageMatch = url.pathname.match(/^\/session\/([^/]+)\/message$/);
  if (method === "POST" && messageMatch) {
    return addMessage(messageMatch[1], body) as T;
  }

  if (method === "GET" && url.pathname === "/community") {
    return getCommunity(url.searchParams) as T;
  }

  const upvoteMatch = url.pathname.match(/^\/community\/([^/]+)\/upvote$/);
  if (method === "POST" && upvoteMatch) {
    return upvotePost(upvoteMatch[1]) as T;
  }

  if (method === "GET" && url.pathname === "/progress") {
    return getProgress(url.searchParams) as T;
  }

  if (method === "GET" && url.pathname === "/admin/dashboard") {
    return getDashboard() as T;
  }

  const statusMatch = url.pathname.match(/^\/admin\/feedback\/([^/]+)\/status$/);
  if (method === "PUT" && statusMatch) {
    return updateStatus(statusMatch[1], body) as T;
  }

  throw new Error(`Local demo API route not found: ${method} ${url.pathname}`);
}

async function readBody(body: BodyInit | null | undefined): Promise<Record<string, any>> {
  if (!body) return {};
  if (typeof body === "string") return JSON.parse(body);
  return {};
}

function submitFeedback(body: Record<string, any>) {
  const text = String(body.text || "").trim();
  if (!text) {
    throw new Error("Feedback text is required");
  }

  const sessionId = `session_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
  const analysis = analyzeText(text, body.category);
  const timestamp = new Date().toISOString();
  const feedback: Feedback = {
    text,
    category: analysis.topic,
    sentiment: analysis.sentiment,
    timestamp,
    status: "Received",
    isAnonymous: true,
    upvotes: 0,
    sessionId,
  };

  const feedbackById = loadRecord<Feedback>(feedbackKey);
  const messagesById = loadRecord<Message[]>(messagesKey);
  const communityById = loadRecord<CommunityPost>(communityKey);

  feedbackById[sessionId] = feedback;
  messagesById[sessionId] = [];
  communityById[sessionId] = {
    id: sessionId,
    text,
    category: analysis.topic,
    sentiment: analysis.sentiment,
    timestamp,
    upvotes: 0,
    isVisible: true,
  };

  saveRecord(feedbackKey, feedbackById);
  saveRecord(messagesKey, messagesById);
  saveRecord(communityKey, communityById);

  return {
    sessionId,
    analysis,
  };
}

function getSession(sessionId: string) {
  const feedback = loadRecord<Feedback>(feedbackKey)[sessionId];
  if (!feedback) {
    throw new Error("Session not found");
  }

  return {
    feedback,
    messages: loadRecord<Message[]>(messagesKey)[sessionId] || [],
  };
}

function addMessage(sessionId: string, body: Record<string, any>) {
  const feedback = loadRecord<Feedback>(feedbackKey)[sessionId];
  const message = String(body.message || "").trim();

  if (!feedback) {
    throw new Error("Session not found");
  }

  if (!message) {
    throw new Error("Message is required");
  }

  const messagesById = loadRecord<Message[]>(messagesKey);
  const newMessage: Message = {
    id: `msg_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`,
    message,
    isAdmin: Boolean(body.isAdmin),
    timestamp: new Date().toISOString(),
  };

  messagesById[sessionId] = [...(messagesById[sessionId] || []), newMessage];
  saveRecord(messagesKey, messagesById);

  return { message: newMessage };
}

function getCommunity(searchParams: URLSearchParams) {
  const limit = Number(searchParams.get("limit") || 20);
  const category = searchParams.get("category");
  const posts = Object.values(loadRecord<CommunityPost>(communityKey))
    .filter((post) => post.isVisible)
    .filter((post) => !category || post.category === category)
    .sort((a, b) => b.upvotes - a.upvotes || Date.parse(b.timestamp) - Date.parse(a.timestamp));

  return {
    posts: posts.slice(0, limit),
    total: posts.length,
  };
}

function upvotePost(postId: string) {
  const communityById = loadRecord<CommunityPost>(communityKey);
  const post = communityById[postId];
  if (!post) {
    throw new Error("Post not found");
  }

  post.upvotes = (post.upvotes || 0) + 1;
  communityById[postId] = post;
  saveRecord(communityKey, communityById);

  return { upvotes: post.upvotes };
}

function getProgress(searchParams: URLSearchParams) {
  const category = searchParams.get("category");
  const feedback = Object.values(loadRecord<Feedback>(feedbackKey)).filter(
    (item) => !category || item.category === category
  );
  const issuesByStatus: Record<Feedback["status"], Array<Record<string, any>>> = {
    Received: [],
    Investigating: [],
    "In Progress": [],
    Resolved: [],
  };

  feedback.forEach((item) => {
    issuesByStatus[item.status].push({
      id: item.sessionId,
      text: item.text.length > 100 ? `${item.text.substring(0, 100)}...` : item.text,
      category: item.category,
      timestamp: item.timestamp,
      adminNote: item.adminNote,
      lastUpdated: item.lastUpdated,
    });
  });

  Object.values(issuesByStatus).forEach((issues) => {
    issues.sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
  });

  return {
    issuesByStatus,
    categories: [...new Set(Object.values(loadRecord<Feedback>(feedbackKey)).map((item) => item.category))],
  };
}

function getDashboard() {
  const feedback = Object.values(loadRecord<Feedback>(feedbackKey));
  const sentimentCounts = { Positive: 0, Neutral: 0, Negative: 0 };
  const categoryCounts: Record<string, number> = {};
  const statusCounts = { Received: 0, Investigating: 0, "In Progress": 0, Resolved: 0 };

  feedback.forEach((item) => {
    sentimentCounts[item.sentiment] += 1;
    categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
    statusCounts[item.status] += 1;
  });

  return {
    statistics: {
      totalFeedback: feedback.length,
      sentimentCounts,
      categoryCounts,
      statusCounts,
    },
    recentFeedback: feedback.sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp)).slice(0, 10),
    trends: {},
  };
}

function updateStatus(sessionId: string, body: Record<string, any>) {
  const feedbackById = loadRecord<Feedback>(feedbackKey);
  const feedback = feedbackById[sessionId];
  if (!feedback) {
    throw new Error("Feedback not found");
  }

  feedback.status = body.status;
  if (body.note) {
    feedback.adminNote = String(body.note);
    feedback.lastUpdated = new Date().toISOString();
  }

  feedbackById[sessionId] = feedback;
  saveRecord(feedbackKey, feedbackById);

  return { success: true };
}

function analyzeText(text: string, category?: string): { topic: string; sentiment: Feedback["sentiment"] } {
  const lowercaseText = text.toLowerCase();
  let topic = category || "Other";

  if (!category) {
    if (["class", "professor", "study", "grade"].some((word) => lowercaseText.includes(word))) topic = "Academic";
    else if (["safety", "security", "emergency"].some((word) => lowercaseText.includes(word))) topic = "Campus Safety";
    else if (["food", "dining", "cafeteria", "meal"].some((word) => lowercaseText.includes(word))) topic = "Dining";
    else if (["dorm", "housing", "room", "residence"].some((word) => lowercaseText.includes(word))) topic = "Housing";
    else if (["wifi", "internet", "computer", "technology"].some((word) => lowercaseText.includes(word))) topic = "IT/Technology";
    else if (["stress", "anxiety", "mental", "counseling"].some((word) => lowercaseText.includes(word))) topic = "Mental Health";
    else if (["parking", "bus", "transport", "traffic"].some((word) => lowercaseText.includes(word))) topic = "Transportation";
  }

  const positiveWords = ["good", "great", "excellent", "amazing", "helpful", "love", "like", "happy", "satisfied", "thank"];
  const negativeWords = ["bad", "terrible", "awful", "hate", "frustrated", "angry", "problem", "issue", "broken", "slow"];
  const words = lowercaseText.split(/\s+/);
  const positiveScore = words.filter((word) => positiveWords.some((positive) => word.includes(positive))).length;
  const negativeScore = words.filter((word) => negativeWords.some((negative) => word.includes(negative))).length;

  if (positiveScore > negativeScore) return { topic, sentiment: "Positive" };
  if (negativeScore > positiveScore) return { topic, sentiment: "Negative" };
  return { topic, sentiment: "Neutral" };
}

function loadRecord<T>(key: string): Record<string, T> {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : {};
}

function saveRecord<T>(key: string, value: Record<string, T>) {
  localStorage.setItem(key, JSON.stringify(value));
}
