import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Copy, CheckCircle } from 'lucide-react';
import { useFeedback } from "../hooks/useFeedback";

export function FeedbackSubmission() {
  const {
    feedback,
    setFeedback,
    category,
    setCategory,
    isSubmitting,
    submissionResult,
    error,
    handleSubmit,
    setSubmissionResult,
    setError,
  } = useFeedback();

  const [copied, setCopied] = React.useState(false);

  const categories = [
    'Academic',
    'Campus Safety', 
    'Dining',
    'Housing',
    'IT/Technology',
    'Mental Health',
    'Transportation',
    'Other'
  ];

  const copySessionId = async () => {
    if (submissionResult?.sessionId) {
      await navigator.clipboard.writeText(submissionResult.sessionId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const resetForm = () => {
    setSubmissionResult(null);
    setError('');
  };

  if (submissionResult) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <CardTitle className="text-green-800">Feedback Submitted Successfully!</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <MessageSquare className="h-4 w-4" />
              <AlertDescription>
                Your feedback has been received and analyzed. You can use the session ID below to check for admin responses and continue the conversation anonymously.
              </AlertDescription>
            </Alert>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Your Anonymous Session ID:</p>
              <div className="flex items-center space-x-2">
                <code className="bg-white px-3 py-2 rounded border text-sm font-mono flex-1">
                  {submissionResult.sessionId}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copySessionId}
                  className="flex items-center space-x-1"
                >
                  {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Save this ID to check for admin responses in the "My Sessions" tab.
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Detected Topic:</span>
                <Badge variant="secondary">{submissionResult.analysis.topic}</Badge>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Sentiment:</span>
                <Badge 
                  variant={
                    submissionResult.analysis.sentiment === 'Positive' ? 'default' :
                    submissionResult.analysis.sentiment === 'Negative' ? 'destructive' : 'secondary'
                  }
                >
                  {submissionResult.analysis.sentiment}
                </Badge>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button onClick={resetForm} variant="outline" className="flex-1">
                Submit Another Feedback
              </Button>
              <Button 
                onClick={() => {
                  const sessionTab = document.querySelector('[value="chat"]') as HTMLButtonElement;
                  if (sessionTab) sessionTab.click();
                }}
                className="flex-1"
              >
                Go to My Sessions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Submit Anonymous Feedback</span>
          </CardTitle>
          <p className="text-gray-600">
            Your feedback is completely anonymous. You'll receive a session ID
            to check for admin responses.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Category (Optional)
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category" name="category">
                  <SelectValue placeholder="Select a category or let AI detect it automatically" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" name="category" value={category} />
            </div>

            <div>
              <label
                htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
                Your Feedback *
              </label>
              <Textarea
                id="feedback"
                name="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Describe your experience, concern, or suggestion. Be as detailed as you'd like - this helps us understand and address the issue better."
                rows={6}
                className="resize-none"
              />
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-start space-x-2">
                <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Two-Way Anonymous Communication</p>
                  <p>
                    After submitting, you'll get a session ID. Administrators
                    can respond to your feedback, and you can continue the
                    conversation - all while staying completely anonymous.
                  </p>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || !feedback.trim()}
              className="w-full flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span>{isSubmitting ? "Submitting..." : "Submit Feedback"}</span>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
