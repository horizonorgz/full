import React, { useState, useEffect } from "react";
import { X, MessageSquare, Clock } from "lucide-react";
import FeedbackModal from "./FeedbackModal";

const FeedbackPopup = ({ user }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);

  useEffect(() => {
    if (!user?.id) return;

    const sessionKey = `feedback_session_${user.id}`;
    const lastFeedbackKey = `last_feedback_${user.id}`;
    const reminderKey = `feedback_reminder_${user.id}`;

    // Check if user has submitted feedback before
    const lastFeedbackTime = localStorage.getItem(lastFeedbackKey);
    const hasSubmittedFeedback = lastFeedbackTime !== null;

    // If user has already submitted feedback, never show popup again
    if (hasSubmittedFeedback) {
      return () => {}; // Return empty cleanup function
    }

    // Get or create session start time - reset if it's a new session (more than 1 hour gap)
    let sessionStart = localStorage.getItem(sessionKey);
    const now = Date.now();

    if (!sessionStart || now - parseInt(sessionStart) > 60 * 60 * 1000) {
      // Reset session if no previous session or if last session was more than 1 hour ago
      sessionStart = now.toString();
      localStorage.setItem(sessionKey, sessionStart);
    }

    // Timer to track time spent
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - parseInt(sessionStart)) / 1000);
      setTimeSpent(elapsed);

      // Re-check reminder status and feedback submission status in real-time
      const currentReminderTime = localStorage.getItem(reminderKey);
      const currentLastFeedbackTime = localStorage.getItem(lastFeedbackKey);
      const hasCurrentlySubmittedFeedback = currentLastFeedbackTime !== null;

      const isCurrentlyInReminderPeriod =
        currentReminderTime &&
        Date.now() - parseInt(currentReminderTime) < 30 * 1000;
      const shouldShowReminderNow =
        currentReminderTime &&
        Date.now() - parseInt(currentReminderTime) >= 30 * 1000;

      // Don't show popup if user has already submitted feedback
      if (hasCurrentlySubmittedFeedback) {
        return;
      }

      // Don't show popup if user is in reminder period (waiting for 30 seconds after clicking remind later)
      if (isCurrentlyInReminderPeriod) {
        return;
      }

      // Show popup after 10 seconds if user hasn't submitted feedback, or after 30 seconds if they clicked remind later
      const shouldShow = elapsed >= 10 || shouldShowReminderNow;

      if (shouldShow) {
        setShowPopup(true);
        if (shouldShowReminderNow) {
          localStorage.removeItem(reminderKey); // Remove reminder flag
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [user?.id]);

  const handleSubmitFeedback = () => {
    setShowModal(true);
  };

  const handleFeedbackSubmitted = () => {
    const lastFeedbackKey = `last_feedback_${user.id}`;
    localStorage.setItem(lastFeedbackKey, Date.now().toString());
    setShowPopup(false);
    setShowModal(false);
  };

  const handleRemindLater = () => {
    const reminderKey = `feedback_reminder_${user.id}`;
    localStorage.setItem(reminderKey, Date.now().toString());
    setShowPopup(false);
  };

  const handleDismiss = () => {
    setShowPopup(false);
  };

  if (!showPopup) return null;

  return (
    <>
      {/* Popup */}
      <div className="fixed bottom-4 right-4 bg-gray-100 border border-gray-100 rounded-lg shadow-2xl p-6 w-80 z-40 transform transition-all duration-300 ease-out animate-slide-up">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gray-500 p-2 rounded-lg animate-pulse">
              <MessageSquare className="text-white" size={20} />
            </div>
            <div>
              <h3 className="text-black font-semibold">How are we doing?</h3>
              <p className="text-gray-800 text-sm">
                Share your feedback with us
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-700 hover:text-gray-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-gray-700 text-sm mb-4">
          Help us improve HorizonAI by sharing your experience. Your feedback is
          valuable to us!
        </p>

        <div className="flex items-center space-x-2 mb-4 text-xs text-gray-500">
          <Clock size={14} />
          <span>
            You've been using the app for {Math.floor(timeSpent / 60)} minutes
          </span>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleRemindLater}
            className="flex-1 px-3 py-2 border border-gray-300 text-gray-800 rounded-md hover:bg-gray-300 transition-colors  text-sm"
          >
            Remind me later
          </button>
          <button
            onClick={handleSubmitFeedback}
            className="flex-1 px-3 py-2 border border-gray-300 text-gray-800 text-black rounded-lg hover:bg-yellow-400 hover:border-yellow-400 transition-colors text-sm font-medium"
          >
            Give Feedback
          </button>
        </div>
      </div>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleFeedbackSubmitted}
      />
    </>
  );
};

export default FeedbackPopup;
