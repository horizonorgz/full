import React, { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  Key,
  Save,
  Trash2,
  AlertCircle,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const APIKeySettings = () => {
  const { user, session } = useAuth();
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false); // Default to showing API key for testing
  const [loading, setLoading] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [keyInfo, setKeyInfo] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  console.log(
    "APIKeySettings rendered - apiKey:",
    apiKey,
    "hasApiKey:",
    hasApiKey
  );

  useEffect(() => {
    // Load API key info - with user authentication if available
    loadAPIKeyInfo();
  }, [user, session]); // Re-run when user or session changes

  const loadAPIKeyInfo = async () => {
    if (!user || !session) return;

    try {
      const token = session.access_token;

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/user/api-key/info`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        try {
          const text = await response.text();
          try {
            const data = JSON.parse(text);
            setHasApiKey(data.has_api_key);
            setKeyInfo(data);
          } catch (jsonError) {
            console.error(
              "Failed to parse API key info response as JSON:",
              text
            );
            // Silently handle proxy errors during initial load
            if (!text.includes("Proxy error")) {
              setMessage({
                type: "error",
                text: "Failed to load API key information",
              });
            }
          }
        } catch (textError) {
          console.error("Failed to get API key info response text:", textError);
        }
      }
    } catch (error) {
      console.error("Error loading API key info:", error);
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      setMessage({ type: "error", text: "Please enter an API key" });
      return;
    }

    if (!apiKey.startsWith("gsk_")) {
      setMessage({
        type: "error",
        text: 'Groq API keys should start with "gsk_"',
      });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    if (!user || !session) {
      setMessage({
        type: "error",
        text: "Authentication required. Please sign in again.",
      });
      setLoading(false);
      return;
    }

    try {
      const token = session.access_token;

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/user/api-key`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            api_key: apiKey,
            provider: "groq",
          }),
        }
      );

      // Handle potential proxy error responses
      let data;
      try {
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch (jsonError) {
          console.error("Failed to parse response as JSON:", text);
          // If we get a proxy error, the backend is not running
          if (text.includes("Proxy error")) {
            setMessage({
              type: "error",
              text: "Backend server is not running. Please start the backend server.",
            });
          } else {
            setMessage({
              type: "error",
              text: `Invalid response from server: ${text.substring(
                0,
                100
              )}...`,
            });
          }
          return;
        }
      } catch (textError) {
        console.error("Failed to get response text:", textError);
        setMessage({
          type: "error",
          text: "Failed to process server response",
        });
        return;
      }

      if (response.ok && data.success) {
        setMessage({
          type: "success",
          text: "API key saved successfully! You can now query your data.",
        });
        setHasApiKey(true);
        setApiKey("");
        await loadAPIKeyInfo();
        // Trigger a custom event to notify other components
        window.dispatchEvent(
          new CustomEvent("apiKeyUpdated", { detail: { hasApiKey: true } })
        );
      } else {
        setMessage({
          type: "error",
          text: data.message || "Failed to save API key",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Error saving API key. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteApiKey = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete your API key? You will need to enter it again to query data."
      )
    ) {
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    if (!user || !session) {
      setMessage({
        type: "error",
        text: "Authentication required. Please sign in again.",
      });
      setLoading(false);
      return;
    }

    try {
      const token = session.access_token;

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/user/api-key`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Handle potential proxy error responses
      let data;
      try {
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch (jsonError) {
          console.error("Failed to parse response as JSON:", text);
          // If we get a proxy error, the backend is not running
          if (text.includes("Proxy error")) {
            setMessage({
              type: "error",
              text: "Backend server is not running. Please start the backend server.",
            });
          } else {
            setMessage({
              type: "error",
              text: `Invalid response from server: ${text.substring(
                0,
                100
              )}...`,
            });
          }
          return;
        }
      } catch (textError) {
        console.error("Failed to get response text:", textError);
        setMessage({
          type: "error",
          text: "Failed to process server response",
        });
        return;
      }

      if (response.ok && data.success) {
        setMessage({ type: "success", text: "API key deleted successfully!" });
        setHasApiKey(false);
        setKeyInfo(null);
        // Trigger a custom event to notify other components
        window.dispatchEvent(
          new CustomEvent("apiKeyUpdated", { detail: { hasApiKey: false } })
        );
      } else {
        setMessage({
          type: "error",
          text: data.message || "Failed to delete API key",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Error deleting API key. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearMessage = () => {
    setMessage({ type: "", text: "" });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Key className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-800">
          API Key Settings
        </h2>
      </div>

      {/* API Key Status */}
      {hasApiKey && keyInfo && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-800">
              API Key Configured
            </span>
          </div>
          <div className="text-sm text-green-700">
            <p>Provider: {keyInfo.provider}</p>
            <p>
              Last updated: {new Date(keyInfo.updated_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      )}

      {/* API Key Input */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Groq API Key
          </label>
          <div className="relative">
            <input
              type={showApiKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                if (message.text) clearMessage();
              }}
              placeholder={
                hasApiKey
                  ? "Enter new API key to update"
                  : "Enter your Groq API key (starts with gsk_)"
              }
              className="w-full p-3 pr-12 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showApiKey ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Help Text */}
        <div className="text-sm text-gray-600 bg-gray-100 p-4 rounded-lg">
          <p className="font-medium mb-2">How to get your Groq API key:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>
              Visit{" "}
              <a
                href="https://console.groq.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                console.groq.com <ExternalLink size={12} />
              </a>
            </li>
            <li>Create an account or sign in</li>
            <li>Navigate to API Keys section</li>
            <li>Create a new API key</li>
            <li>Copy and paste it here</li>
          </ol>
          <div className="mt-2 p-2 bg-white border border-black-200 rounded text-gary-500">
            <strong>Note:</strong> Your API key is encrypted and stored
            securely. It's only used to process your queries.
          </div>
        </div>

        {/* Message Display */}
        {message.text && (
          <div
            className={`p-3 rounded-lg flex items-start gap-2 ${
              message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span className="text-sm">{message.text}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSaveApiKey}
            disabled={loading || !apiKey.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-green-600 hover:text-white disabled:opacity-80 disabled:cursor-not-allowed transition-colors"
          >
            <Save size={16} />
            {loading
              ? "Saving..."
              : hasApiKey
              ? "Update API Key"
              : "Save API Key"}
          </button>

          {hasApiKey && (
            <button
              onClick={handleDeleteApiKey}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-red-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Trash2 size={16} />
              Delete API Key
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default APIKeySettings;
