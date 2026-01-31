import React, { useState, useEffect } from "react";
import { Key, AlertCircle, ArrowRight } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import APIKeySettings from "./APIKeySettings";

const APIKeyCheck = ({ onAPIKeyVerified }) => {
  const { user, session } = useAuth();
  const [hasApiKey, setHasApiKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (user && session) {
      checkAPIKey();
    }

    // Listen for API key updates
    const handleAPIKeyUpdate = (event) => {
      const { hasApiKey: newHasApiKey } = event.detail;
      setHasApiKey(newHasApiKey);
      if (newHasApiKey && onAPIKeyVerified) {
        onAPIKeyVerified();
      }
    };

    window.addEventListener("apiKeyUpdated", handleAPIKeyUpdate);
    return () =>
      window.removeEventListener("apiKeyUpdated", handleAPIKeyUpdate);
  }, [user, session, onAPIKeyVerified]);

  const checkAPIKey = async () => {
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
            if (data.has_api_key && onAPIKeyVerified) {
              onAPIKeyVerified();
            }
          } catch (jsonError) {
            console.error(
              "Failed to parse API key info response as JSON:",
              text
            );
            // Silently handle proxy errors during initial load
            if (!text.includes("Proxy error")) {
              console.error("Failed to load API key information");
            }
          }
        } catch (textError) {
          console.error("Failed to get API key info response text:", textError);
        }
      }
    } catch (error) {
      console.error("Error checking API key:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetupAPIKey = () => {
    setShowSettings(true);
  };

  const handleContinue = () => {
    if (onAPIKeyVerified) {
      onAPIKeyVerified();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking your settings...</p>
        </div>
      </div>
    );
  }

  if (hasApiKey && !showSettings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Key className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Ready to Go!
          </h2>
          <p className="text-gray-600 mb-6">
            Your API key is configured. You can now start uploading and querying
            your data.
          </p>
          <button
            onClick={handleContinue}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue to App
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  if (showSettings) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Setup Your API Key
            </h1>
            <p className="text-gray-600">
              Configure your Groq API key to start querying your data
            </p>
          </div>
          <APIKeySettings />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Key className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          API Key Required
        </h2>
        <p className="text-gray-600 mb-6">
          To start querying your data, you'll need to provide your own Groq API
          key. This ensures you have full control over your usage and costs.
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Why do I need my own API key?</p>
              <ul className="mt-1 list-disc list-inside space-y-1">
                <li>You control your usage and costs</li>
                <li>Your data queries are private to you</li>
                <li>No rate limiting from shared usage</li>
                <li>Full access to Groq's latest models</li>
              </ul>
            </div>
          </div>
        </div>

        <button
          onClick={handleSetupAPIKey}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Setup API Key
          <ArrowRight size={16} />
        </button>

        <p className="text-xs text-gray-500 mt-4">
          Get your free API key at{" "}
          <a
            href="https://console.groq.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            console.groq.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default APIKeyCheck;
