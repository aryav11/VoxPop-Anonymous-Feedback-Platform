import { useState, useEffect } from "react";
import type { SessionData } from "../types";
import { loadSessionAPI, sendMessageAPI } from "../services/chatService";

export const useChat = () => {
  const [sessionId, setSessionId] = useState("");
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [savedSessions, setSavedSessions] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("voxpop-sessions");
    if (saved) {
      try {
        setSavedSessions(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const saveSessionId = (id: string) => {
    const updated = [...new Set([id, ...savedSessions])].slice(0, 10);
    setSavedSessions(updated);
    localStorage.setItem("voxpop-sessions", JSON.stringify(updated));
  };

  const loadSession = async (id: string) => {
    setIsLoading(true);
    setError("");

    try {
      const data = await loadSessionAPI(id);
      setSessionData(data);
      setSessionId(id);
      saveSessionId(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load session");
      setSessionData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !sessionId) return;

    setIsSending(true);
    try {
      const data = await sendMessageAPI(sessionId, newMessage);

      if (sessionData) {
        setSessionData({
          ...sessionData,
          messages: [...sessionData.messages, data.message],
        });
      }

      setNewMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  return {
    sessionId,
    setSessionId,
    sessionData,
    newMessage,
    setNewMessage,
    isLoading,
    isSending,
    error,
    savedSessions,
    loadSession,
    sendMessage,
  };
};