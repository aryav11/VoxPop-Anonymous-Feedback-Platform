import { useState } from "react";
import type { SubmissionResult } from "../types";
import { submitFeedback } from "../services/feedbackService";

export const useFeedback = () => {
  const [feedback, setFeedback] = useState("");
  const [category, setCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!feedback.trim()) {
      setError("Please enter your feedback");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const data = await submitFeedback(feedback, category);
      setSubmissionResult(data);
      setFeedback("");
      setCategory("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    feedback,
    setFeedback,
    category,
    setCategory,
    isSubmitting,
    submissionResult,
    error,
    handleSubmit,
    setSubmissionResult,
    setError
  };
};