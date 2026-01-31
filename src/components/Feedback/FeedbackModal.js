// import React, { useState, useEffect } from 'react'
// import { X, MessageSquare, Star } from 'lucide-react'
// import { feedbackAPI } from '../../services/api'
// import { useAuth } from '../../contexts/AuthContext'
// import toast from 'react-hot-toast'

// const FeedbackModal = ({ isOpen, onClose, onSubmit }) => {
//   const { user } = useAuth()
//   const [formData, setFormData] = useState({
//     accuracy_rating: null,
//     speed_rating: null,
//     overall_rating: null,
//     text_feedback: ''
//   })
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [existingFeedback, setExistingFeedback] = useState(null)

//   // Load existing feedback when modal opens
//   useEffect(() => {
//     if (isOpen && user?.id) {
//       loadExistingFeedback()
//     }
//   }, [isOpen, user?.id])

//   const loadExistingFeedback = async () => {
//     try {
//       const response = await feedbackAPI.getUserFeedback(user.id)
//       if (response.feedback) {
//         setExistingFeedback(response.feedback)
//         setFormData({
//           accuracy_rating: response.feedback.accuracy_rating,
//           speed_rating: response.feedback.speed_rating,
//           overall_rating: response.feedback.overall_rating,
//           text_feedback: response.feedback.text_feedback || ''
//         })
//       }
//     } catch (error) {
//       console.error('Failed to load existing feedback:', error)
//     }
//   }

//   const handleRatingClick = (field, rating) => {
//     setFormData(prev => ({ ...prev, [field]: rating }))
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setIsSubmitting(true)

//     try {
//       const response = await feedbackAPI.submitFeedback({
//         user_id: user.id,
//         ...formData
//       })

//       if (response.success) {
//         toast.success(response.message || 'Feedback submitted successfully!')
//         onSubmit()
//         onClose()
//       } else {
//         toast.error(response.message || 'Failed to submit feedback')
//       }
//     } catch (error) {
//       console.error('Error submitting feedback:', error)
//       toast.error('Failed to submit feedback. Please try again.')
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   const renderStarRating = (field, label, description) => {
//     const currentRating = formData[field]

//     return (
//       <div className="mb-6">
//         <h3 className="text-white text-sm font-medium mb-2">{label}</h3>
//         <p className="text-gray-400 text-xs mb-3">{description}</p>
//         <div className="flex space-x-2">
//           {[1, 2, 3, 4, 5].map((rating) => (
//             <button
//               key={rating}
//               type="button"
//               onClick={() => handleRatingClick(field, rating)}
//               className={`
//                 w-10 h-10 rounded-lg border-2 flex items-center justify-center
//                 transition-all duration-200 hover:scale-105
//                 ${currentRating === rating
//                   ? 'bg-logocolor border-logocolor text-black'
//                   : 'border-gray-600 text-gray-400 hover:border-logocolor hover:text-logocolor'
//                 }
//               `}
//             >
//               <span className="text-sm font-semibold">{rating}</span>
//             </button>
//           ))}
//         </div>
//       </div>
//     )
//   }

//   if (!isOpen) return null

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-gray-900 rounded-lg border border-gray-700 w-full max-w-md max-h-[90vh] overflow-y-auto">
//         {/* Header */}
//         <div className="flex items-center justify-between p-6 border-b border-gray-700">
//           <div className="flex items-center space-x-3">
//             <MessageSquare className="text-logocolor" size={24} />
//             <h2 className="text-xl font-semibold text-white">
//               {existingFeedback ? 'Update Feedback' : 'Share Your Feedback'}
//             </h2>
//           </div>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-white transition-colors"
//           >
//             <X size={24} />
//           </button>
//         </div>

//         {/* Form */}
//         <form onSubmit={handleSubmit} className="p-6">
//           {/* Accuracy Rating */}
//           {renderStarRating(
//             'accuracy_rating',
//             'How accurate is the system?',
//             '1 = Lowest, 5 = Highest'
//           )}

//           {/* Speed Rating */}
//           {renderStarRating(
//             'speed_rating',
//             'How fast is the response?',
//             '1 = Slow, 5 = Very Fast'
//           )}

//           {/* Overall Rating */}
//           {renderStarRating(
//             'overall_rating',
//             'Overall, how would you rate the system?',
//             '1 = Poor, 5 = Excellent'
//           )}

//           {/* Text Feedback */}
//           <div className="mb-6">
//             <label className="block text-white text-sm font-medium mb-2">
//               Additional Comments (Optional)
//             </label>
//             <textarea
//               value={formData.text_feedback}
//               onChange={(e) => setFormData(prev => ({ ...prev, text_feedback: e.target.value }))}
//               placeholder="Tell us more about your experience..."
//               className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-logocolor resize-none"
//               rows={4}
//             />
//           </div>

//           {/* Actions */}
//           <div className="flex space-x-3">
//             <button
//               type="button"
//               onClick={onClose}
//               className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={isSubmitting}
//               className="flex-1 px-4 py-2 bg-logocolor text-black rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {isSubmitting ? 'Submitting...' : existingFeedback ? 'Update Feedback' : 'Submit Feedback'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   )
// }

// export default FeedbackModal

import React, { useState, useEffect } from "react";
import { X, MessageSquare } from "lucide-react";
import { feedbackAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

const FeedbackModal = ({ isOpen, onClose, onSubmit }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    accuracy_rating: null,
    speed_rating: null,
    overall_rating: null,
    text_feedback: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingFeedback, setExistingFeedback] = useState(null);

  // Load existing feedback when modal opens
  useEffect(() => {
    if (isOpen && user?.id) {
      loadExistingFeedback();
    }
  }, [isOpen, user?.id]);

  const loadExistingFeedback = async () => {
    try {
      const response = await feedbackAPI.getUserFeedback(user.id);
      if (response.feedback) {
        setExistingFeedback(response.feedback);
        setFormData({
          accuracy_rating: response.feedback.accuracy_rating,
          speed_rating: response.feedback.speed_rating,
          overall_rating: response.feedback.overall_rating,
          text_feedback: response.feedback.text_feedback || "",
        });
      }
    } catch (error) {
      console.error("Failed to load existing feedback:", error);
    }
  };

  const handleRatingClick = (field, rating) => {
    setFormData((prev) => ({ ...prev, [field]: rating }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await feedbackAPI.submitFeedback({
        user_id: user.id,
        ...formData,
      });

      if (response.success) {
        toast.success(response.message || "Feedback submitted successfully!");
        onSubmit();
        onClose();
      } else {
        toast.error(response.message || "Failed to submit feedback");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderRatingScale = (field, label, description) => {
    const currentRating = formData[field];

    return (
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-800 mb-1">{label}</h3>
        <p className="text-xs text-gray-500 mb-3">{description}</p>
        <div className="flex space-x-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => handleRatingClick(field, rating)}
              className={`w-10 h-10 rounded-md border text-sm font-semibold flex items-center justify-center transition-all duration-200
                ${
                  currentRating === rating
                    ? "bg-yellow-400 border-yellow-400 text-black"
                    : "border-gray-300 text-gray-500 hover:border-yellow-400 hover:text-yellow-500"
                }`}
            >
              {rating}
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg border border-gray-200 w-full max-w-md shadow-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <MessageSquare className="text-yellow-500" size={22} />
            <h2 className="text-lg font-semibold text-gray-900">
              {existingFeedback ? "Update Feedback" : "Share Your Feedback"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5">
          {renderRatingScale(
            "accuracy_rating",
            "How accurate is the system?",
            "1 = Lowest, 5 = Highest"
          )}
          {renderRatingScale(
            "speed_rating",
            "How fast is the response?",
            "1 = Slow, 5 = Very Fast"
          )}
          {renderRatingScale(
            "overall_rating",
            "Overall, how would you rate the system?",
            "1 = Poor, 5 = Excellent"
          )}

          {/* Text Feedback */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Additional Comments (Optional)
            </label>
            <textarea
              value={formData.text_feedback}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  text_feedback: e.target.value,
                }))
              }
              placeholder="Tell us more about your experience..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 resize-none"
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-yellow-400 text-black rounded-md hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? "Submitting..."
                : existingFeedback
                ? "Update Feedback"
                : "Submit Feedback"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;
