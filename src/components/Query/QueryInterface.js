import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  RotateCcw,
  Lightbulb,
  Code,
  EyeOff,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import LoadingSpinner from "../common/LoadingSpinner";
import APIKeyErrorGuide from "../common/APIKeyErrorGuide";
import { queryAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

export const QueryInterface = ({
  currentFile,
  onNewQuery,
  user,
  sessionResults = [],
  currentQuery = "",
  onQueryChange,
}) => {
  // Remove local query state - using props instead
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [isRateLimitError, setIsRateLimitError] = useState(false);
  const [isAPIKeyError, setIsAPIKeyError] = useState(false);
  const [showGeneratedCode, setShowGeneratedCode] = useState(false); // Default to hidden
  const [visibleResultsCount, setVisibleResultsCount] = useState(5); // Show first 5 results
  const [showSampleQueries, setShowSampleQueries] = useState(false); // Control sample queries dropdown
  const textareaRef = useRef(null);
  const { user: authUser } = useAuth();

  // Sample queries based on the current file
  const sampleQueries = [
    "Show me the first 10 rows",
    "What are the column names?",
    "Calculate the mean of all numeric columns",
    "Show me summary statistics",
    "Find missing values in the dataset",
    "Group by the first column and count records",
  ];

  useEffect(() => {
    // Auto-resize textarea
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    }
  }, [currentQuery]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentQuery.trim() || isProcessing) return;

    // Check if we have a current file
    if (!currentFile || !currentFile.metadata?.id) {
      setError("No file selected. Please upload a file first.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setIsAPIKeyError(false);
    setIsRateLimitError(false);

    const startTime = performance.now();

    try {
      // Process query using real backend
      const result = await queryAPI.processQuery(
        currentQuery.trim(),
        currentFile.metadata.id,
        authUser.id
      );

      console.log("API result received:", result);
      console.log("Generated code field:", result.generated_code);
      console.log("Available fields:", Object.keys(result));

      if (!result.success) {
        console.log("Query failed, result details:", result);

        // Get the actual error message from the result, or provide a helpful default
        let errorMessage = result.error || "Query processing failed";

        // Check for rate limit errors in the result before throwing
        if (
          errorMessage.includes("RATE_LIMIT_EXCEEDED") ||
          errorMessage.toLowerCase().includes("rate limit") ||
          errorMessage.toLowerCase().includes("too many requests")
        ) {
          console.log("Rate limit error detected in result:", errorMessage);
          setError(
            "Rate limit reached. Please wait 3-4 seconds and try again."
          );
          setIsAPIKeyError(false);
          setIsRateLimitError(true);
          return;
        }

        // If no specific error message, provide more helpful guidance
        if (!result.error) {
          errorMessage =
            "Query processing failed. This could be due to:\n• Invalid or missing API key\n• File not found\n• Query processing error\n\nPlease check your API key in Settings and ensure you have uploaded a file.";
        }

        throw new Error(errorMessage);
      }

      // Create result object
      console.log("Creating queryResult with:");
      console.log("- result.generated_code:", result.generated_code);
      console.log("- result.code:", result.code); // Check if it's under a different field
      console.log("- All result fields:", result);

      const queryResult = {
        query: currentQuery,
        generatedCode:
          result.generated_code || result.code || "No code generated",
        result: result.result,
        executionTime: `${result.execution_time?.toFixed(2)}s` || "Unknown",
        timestamp: new Date(),
        queryId: result.query_id,
      };

      console.log("Final queryResult:", queryResult);

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // Notify parent component to add to session results
      if (onNewQuery) {
        onNewQuery(currentQuery, queryResult, executionTime);
      }

      // Keep the query in the input field - don't clear it
      // setQuery('') // Commented out to preserve query text
    } catch (err) {
      console.error("Query processing error:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);

      // Check if it's a rate limit error (detected by API interceptor)
      if (err.isRateLimitError) {
        setError(
          err.rateLimitMessage ||
            "Rate limit reached. Please wait 3-4 seconds and try again."
        );
        setIsAPIKeyError(false);
        setIsRateLimitError(true);
        return;
      }

      // Check if it's an API key related error
      const errorMessage = err.message || "Failed to process query";
      const errorResponse =
        err.response?.data?.detail || err.response?.data?.message || "";
      const statusCode = err.response?.status;

      console.log("Error analysis:", {
        message: errorMessage,
        response: errorResponse,
        status: statusCode,
      });

      // Fallback check for rate limit errors (in case interceptor didn't catch it)
      const isRateLimitError =
        statusCode === 429 ||
        errorMessage.includes("RATE_LIMIT_EXCEEDED") ||
        errorMessage.toLowerCase().includes("rate limit") ||
        errorMessage.toLowerCase().includes("too many requests") ||
        errorResponse.toLowerCase().includes("rate limit") ||
        errorResponse.toLowerCase().includes("too many requests");

      if (isRateLimitError) {
        setError("Rate limit reached. Please wait 3-4 seconds and try again.");
        setIsAPIKeyError(false);
        setIsRateLimitError(true);
        return;
      }

      // Check for timeout errors
      const isTimeoutError =
        errorMessage.includes("TIMEOUT") ||
        errorMessage.toLowerCase().includes("timeout") ||
        errorMessage.toLowerCase().includes("timed out") ||
        errorResponse.toLowerCase().includes("timeout");

      if (isTimeoutError) {
        setError(
          "Request timed out. Please check your internet connection and try again."
        );
        setIsAPIKeyError(false);
        setIsRateLimitError(false);
        return;
      }

      // More specific detection for API key errors
      const isAPIKeyIssue =
        // Specific status codes that often indicate auth issues
        statusCode === 401 ||
        // Specific API key related messages
        errorMessage.toLowerCase().includes("api key") ||
        errorMessage.toLowerCase().includes("invalid key") ||
        errorMessage.toLowerCase().includes("groq api key") ||
        errorResponse.toLowerCase().includes("api key") ||
        errorResponse.toLowerCase().includes("groq") ||
        errorResponse.toLowerCase().includes("authentication") ||
        errorResponse.toLowerCase().includes("unauthorized") ||
        // Check for common API key error patterns
        (statusCode === 400 &&
          (errorMessage.toLowerCase().includes("api key") ||
            errorResponse.toLowerCase().includes("api key") ||
            errorResponse.toLowerCase().includes("groq") ||
            (errorMessage.includes("Request failed with status code 400") &&
              (errorResponse.toLowerCase().includes("key") ||
                errorResponse.toLowerCase().includes("auth"))))) ||
        // If we get a generic "Query processing failed" with no other details,
        // it's likely an API key issue (most common cause)
        errorMessage ===
          "Query processing failed. This could be due to:\n• Invalid or missing API key\n• File not found\n• Query processing error\n\nPlease check your API key in Settings and ensure you have uploaded a file." ||
        errorMessage.includes("Invalid or missing API key");

      console.log("Is API key issue:", isAPIKeyIssue);

      setIsAPIKeyError(isAPIKeyIssue);
      setIsRateLimitError(false);
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSampleQuery = (sampleQuery) => {
    if (onQueryChange) {
      onQueryChange(sampleQuery);
    }
    textareaRef.current?.focus();
  };

  const handleClear = () => {
    setError(null);
    setIsAPIKeyError(false);
    setIsRateLimitError(false);
    // Note: We don't clear sessionResults here as they're managed by parent
  };

  const handleLoadMore = () => {
    setVisibleResultsCount((prev) => prev + 5);
  };

  // Get visible results based on the count
  const visibleResults = sessionResults.slice(0, visibleResultsCount);

  return (
    <div className="space-y-6">
      {/* Sample Queries - Collapsible */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
        <button
          onClick={() => setShowSampleQueries(!showSampleQueries)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-gray-900" />
            <h3 className="text-gray-800 font-normaltext font-medium">
              Sample Queries
            </h3>
          </div>
          {showSampleQueries ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>

        {showSampleQueries && (
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {sampleQueries.map((sampleQuery, index) => (
              <button
                key={index}
                onClick={() => handleSampleQuery(sampleQuery)}
                className="text-left p-2 bg-gray-100 hover:bg-gray-200 rounded text-sm text-gray-700 transition-colors"
              >
                {sampleQuery}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Query Input */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="query"
              className="block text-sm font-medium text-gray-700"
            >
              Ask a question about your data:
            </label>
            {sessionResults.length > 0 && (
              <div className="text-xs text-gray-800">
                {sessionResults.length} queries in current session
              </div>
            )}
          </div>
          <div className="flex space-x-2">
            <textarea
              ref={textareaRef}
              id="query"
              value={currentQuery}
              onChange={(e) => onQueryChange && onQueryChange(e.target.value)}
              placeholder="e.g., 'Show me the average sales by region' or 'Find all customers with age > 30'. Your queries and results will be preserved in this session."
              // className="flex-1 min-h-[60px] max-h-[200px] p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-logocolor focus:border-logocolor resize-none font-normaltext"

              className="flex-1 min-h-[60px] max-h-[200px] p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-0 focus:ring-logocolor  resize-none font-normaltext"
              disabled={isProcessing}
            />
            <div className="flex flex-col space-y-2">
              <button
                type="submit"
                disabled={!currentQuery.trim() || isProcessing}
                className="bg-black text-white p-3 rounded-lg focus:outline-none focus:ring-0 focus:ring-logocolor disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? (
                  <LoadingSpinner size="sm" color="white" />
                ) : (
                  <Send size={20} />
                )}
              </button>
              {sessionResults.length > 0 && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="bg-black text-white p-3 rounded-lg  focus:outline-none focus:ring-2 focus:ring-logocolor disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Clear error messages"
                >
                  <RotateCcw size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <>
          {isAPIKeyError ? (
            <APIKeyErrorGuide
              error={error}
              onClose={() => {
                setError(null);
                setIsAPIKeyError(false);
                setIsRateLimitError(false);
              }}
            />
          ) : isRateLimitError ? (
            <div className="bg-white border border-red-500 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-gray-800 font-medium text-sm">{error}</p>
              </div>
              <div className="mt-2 ml-7">
                <button
                  onClick={() => handleSubmit({ preventDefault: () => {} })}
                  className="text-xs text-red-500 underline hover:text-yellow-400"
                >
                  Try again
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-4">
              <p className="text-red-400 font-normaltext text-sm">{error}</p>
            </div>
          )}
        </>
      )}

      {/* Results */}
      {sessionResults.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-jersey text-gray-800">
              Query Results ({sessionResults.length} total)
            </h3>
            <button
              onClick={() => setShowGeneratedCode(!showGeneratedCode)}
              className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-normaltext"
            >
              {showGeneratedCode ? <EyeOff size={16} /> : <Code size={16} />}
              <span>
                {showGeneratedCode ? "Hide Code" : "Show Generated Code"}
              </span>
            </button>
          </div>

          {visibleResults.map((result, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
            >
              {/* Result Header */}
              <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-gray-800 font-normaltext font-medium">
                    Query: {result.query}
                  </h4>
                  <div className="text-sm text-gray-500">
                    {result.executionTime} •{" "}
                    {result.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>

              {/* Generated Code - Conditionally Rendered */}
              {showGeneratedCode && (
                <div className="p-4 border-b border-gray-200">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">
                    Generated Code:
                  </h5>
                  <pre className="bg-gray-100 p-3 rounded text-sm text-green-700 overflow-x-auto">
                    <code>
                      {result.generatedCode || "No generated code available"}
                    </code>
                  </pre>
                </div>
              )}

              {/* Result Data */}
              <div className="p-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">
                  Result:
                </h5>
                {result.result?.type === "dataframe" && result.result.data && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr className="border-b border-gray-200">
                          {result.result.columns?.map((column, colIndex) => (
                            <th
                              key={colIndex}
                              className="text-left py-2 px-3 text-gray-700 font-normaltext font-semibold"
                            >
                              {column}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {result.result.data.map((row, rowIndex) => (
                          <tr
                            key={rowIndex}
                            className="border-b border-gray-100"
                          >
                            {row.map((cell, cellIndex) => (
                              <td
                                key={cellIndex}
                                className="py-2 px-3 text-gray-600 font-normaltext"
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {result.result.shape && (
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        Showing first {Math.min(result.result.data.length, 100)}{" "}
                        rows of {result.result.shape[0]} total rows
                      </p>
                    )}
                  </div>
                )}

                {result.result?.type === "series" && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 px-3 text-gray-700 font-normaltext font-semibold">
                            Index
                          </th>
                          <th className="text-left py-2 px-3 text-gray-700 font-normaltext font-semibold">
                            {result.result.name || "Value"}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.result.data.map((value, index) => (
                          <tr key={index} className="border-b border-gray-100">
                            <td className="py-2 px-3 text-gray-600 font-normaltext">
                              {result.result.index?.[index] || index}
                            </td>
                            <td className="py-2 px-3 text-gray-600 font-normaltext">
                              {value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {result.result?.type === "scalar" && (
                  <div className="bg-gray-50 border border-gray-200 p-3 rounded">
                    <pre className="text-gray-700 text-sm whitespace-pre-wrap">
                      {result.result.data}
                    </pre>
                  </div>
                )}

                {!result.result && (
                  <div className="text-gray-500 text-sm">
                    No result data available
                  </div>
                )}
              </div>
            </div>
          ))}
          {/* Load More Button */}
          {sessionResults.length > visibleResultsCount && (
            <div className="text-center">
              <button
                onClick={handleLoadMore}
                className="bg-gray-100 text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-normaltext"
              >
                Load More Results ({sessionResults.length - visibleResultsCount}{" "}
                remaining)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
