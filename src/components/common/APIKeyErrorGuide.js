import React, { useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Mail,
} from "lucide-react";

const APIKeyErrorGuide = ({ error, onClose }) => {
  const [showTroubleshoot, setShowTroubleshoot] = useState(false);

  const troubleshootSteps = [
    {
      step: 1,
      title: "Please try re-entering the API key",
      description:
        "Go to Settings and re-enter your Groq API key. Make sure there are no extra spaces or characters.",
    },
    {
      step: 2,
      title: "Make sure your dataset has right datatypes",
      description:
        "Check that numeric columns like 'salary' have integer/float datatype instead of object/text datatype.",
    },
    {
      step: 3,
      title: "Try reframing your query",
      description:
        "If you get inaccurate results, try reframing your question as sometimes rephrasing may give you the desired output.",
    },
    {
      step: 4,
      title: "Still having issues?",
      description: "Contact our support team for further assistance.",
      contact: "horizonaiwork@gmail.com",
    },
  ];

  return (
    <div className="bg-red-300 bg-opacity-70 border border-red-500 rounded-lg p-4 space-y-3">
      {/* Main Error Message */}
      <div className="flex items-center space-x-2">
        <AlertTriangle className="text-black flex-shrink-0" size={20} />
        <div className="flex-1">
          <p className="text-black font-medium text-sm">
            Wrong/Invalid API key entered, please enter correct API key
          </p>
          {error && (
            <p className="text-black text-xs mt-1 opacity-75">
              Technical details: {error}
            </p>
          )}
        </div>
      </div>

      {/* Troubleshoot Button */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setShowTroubleshoot(!showTroubleshoot)}
          className="flex items-center space-x-2 text-black hover:text-gray-700 transition-colors text-sm"
        >
          <HelpCircle size={16} />
          <span>Troubleshoot</span>
          {showTroubleshoot ? (
            <ChevronUp size={16} />
          ) : (
            <ChevronDown size={16} />
          )}
        </button>

        {onClose && (
          <button
            onClick={onClose}
            className="text-black hover:text-gray-700 transition-colors text-sm"
          >
            ✕
          </button>
        )}
      </div>

      {/* Troubleshooting Guide */}
      {showTroubleshoot && (
        <div className="border-t border-red-400 border-opacity-70 pt-3 space-y-3">
          <h4 className="text-black font-medium text-sm mb-2">
            Troubleshooting Steps:
          </h4>

          {troubleshootSteps.map((item) => (
            <div
              key={item.step}
              className="bg-red-500 bg-opacity-40 rounded-lg p-3"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-red-500 bg-opacity-20 rounded-full flex items-center justify-center text-black text-xs font-medium">
                  {item.step}
                </div>
                <div className="flex-1">
                  <h5 className="text-black font-medium text-sm mb-1">
                    {item.title}
                  </h5>
                  <p className="text-gray-800 text-xs opacity-90">
                    {item.description}
                  </p>
                  {item.contact && (
                    <div className="mt-2 flex items-center space-x-1">
                      <Mail size={12} className="text-black" />
                      <a
                        href={`mailto:${item.contact}`}
                        className="text-black hover:text-red-200 transition-colors text-xs underline"
                      >
                        {item.contact}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default APIKeyErrorGuide;
