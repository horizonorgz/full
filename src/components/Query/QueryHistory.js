import React, { useState } from "react";
import {
  History,
  Clock,
  CheckCircle,
  XCircle,
  Code,
  Download,
  ChevronDown,
  ChevronRight,
  FileText,
} from "lucide-react";

export const QueryHistory = ({ queries, user }) => {
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [showGeneratedCode, setShowGeneratedCode] = useState({}); // Track code visibility per query
  const [filter, setFilter] = useState("all"); // 'all', 'success', 'error'
  const [expandedFiles, setExpandedFiles] = useState({}); // Track which files are expanded

  // Helper function to safely parse and transform result data
  const parseResultData = (result) => {
    if (!result) return { type: "text", data: "No result" };

    // Debug logging to understand the data format
    console.log("Parsing result:", result, "Type:", typeof result);

    // If it's already an object, return as-is
    if (typeof result === "object" && !Array.isArray(result)) {
      console.log("Result is already an object:", result);
      return result;
    }

    // If it's a string, try to parse it
    if (typeof result === "string") {
      try {
        let parsed;

        // First, check if it's a Python dict format (with single quotes)
        if (result.includes("'type':") || result.includes("'data':")) {
          console.log("Detected Python dict format, converting to JSON");
          // Convert Python dict format to JSON format
          let jsonString = result
            .replace(/'/g, '"') // Replace single quotes with double quotes
            .replace(/None/g, "null") // Replace Python None with JSON null
            .replace(/True/g, "true") // Replace Python True with JSON true
            .replace(/False/g, "false") // Replace Python False with JSON false
            .replace(/nan/g, "null"); // Replace nan with null

          console.log("Converted to JSON string:", jsonString);
          parsed = JSON.parse(jsonString);
        } else {
          // Try direct JSON parsing
          parsed = JSON.parse(result);
        }

        console.log("Parsed result:", parsed);

        // Check if it's a dataframe-like object
        if (parsed && typeof parsed === "object") {
          if (parsed.type === "dataframe" && parsed.columns && parsed.data) {
            console.log("Detected dataframe format");
            return {
              type: "dataframe",
              columns: parsed.columns,
              data: parsed.data,
              shape: parsed.shape,
            };
          }

          if (parsed.type === "series" && parsed.data && parsed.index) {
            console.log("Detected series format");
            return {
              type: "series",
              data: parsed.data,
              index: parsed.index,
              name: parsed.name,
            };
          }

          // If it's a plain object, convert to series
          if (
            typeof parsed === "object" &&
            !Array.isArray(parsed) &&
            !parsed.type
          ) {
            console.log("Converting plain object to series");
            const entries = Object.entries(parsed);
            return {
              type: "series",
              data: entries.map(([key, value]) => value),
              index: entries.map(([key, value]) => key),
              name: "Value",
            };
          }
        }

        console.log("Returning as formatted text");
        return { type: "text", data: JSON.stringify(parsed, null, 2) };
      } catch (e) {
        console.log("Parsing failed:", e);
        // If parsing fails, try to detect if it's a Python dict and display as text
        if (result.includes("'type':")) {
          console.log("Detected unparseable Python dict, returning as text");
          return { type: "text", data: result };
        }
        return { type: "text", data: result };
      }
    }

    // For other types, convert to text
    console.log("Converting to text");
    return { type: "text", data: String(result) };
  };

  // Transform database field names to component expected names
  const transformQuery = (query) => {
    return {
      ...query,
      executionTime: query.execution_time,
      fileName: query.file_name,
      generatedCode: query.generated_code,
      error: query.error_message,
      // Use the helper function to parse results
      result: parseResultData(query.result),
    };
  };

  const transformedQueries = queries.map(transformQuery);

  const filteredQueries = transformedQueries.filter((query) => {
    if (filter === "success") return query.success && !query.error;
    if (filter === "error") return query.error || !query.success;
    return true;
  });

  // Group queries by file name
  const groupedQueries = filteredQueries.reduce((acc, query) => {
    const fileName = query.fileName || "Unknown File";
    if (!acc[fileName]) {
      acc[fileName] = [];
    }
    acc[fileName].push(query);
    return acc;
  }, {});

  // Sort files by most recent query timestamp
  const sortedFileNames = Object.keys(groupedQueries).sort((a, b) => {
    const aLatest = Math.max(
      ...groupedQueries[a].map((q) => new Date(q.timestamp).getTime())
    );
    const bLatest = Math.max(
      ...groupedQueries[b].map((q) => new Date(q.timestamp).getTime())
    );
    return bLatest - aLatest;
  });

  const toggleFileExpansion = (fileName) => {
    setExpandedFiles((prev) => ({
      ...prev,
      [fileName]: !prev[fileName],
    }));
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  const formatExecutionTime = (time) => {
    return typeof time === "string" ? time : `${time}s`;
  };

  const exportHistory = () => {
    const dataStr = JSON.stringify(transformedQueries, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `query_history_${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (transformedQueries.length === 0) {
    return (
      <div className="text-center py-12">
        <History className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-normaltext text-black mb-2">
          No Query History
        </h3>
        <p className="text-gray-500 font-normaltext">
          Your query history will appear here once you start analyzing data.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with filters and export */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Filter:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-white border border-gray-300 rounded px-3 py-1 text-gray-700 text-sm shadow-sm focus:outline-none focus:ring-0 focus:ring-logocolor"
            >
              <option value="all">All Queries</option>
              <option value="success">Successful</option>
              <option value="error">Errors</option>
            </select>
          </div>
          <div className="text-sm text-gray-700">
            {filteredQueries.length} queries across {sortedFileNames.length}{" "}
            files
          </div>
        </div>

        <button
          onClick={exportHistory}
          className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2 rounded-lg transition-colors"
        >
          <Download size={16} />
          <span className="font-normaltext">Export</span>
        </button>
      </div>

      {/* File-based Query List */}
      <div className="space-y-4">
        {sortedFileNames.map((fileName) => {
          const fileQueries = groupedQueries[fileName];
          const isExpanded = expandedFiles[fileName];
          const successCount = fileQueries.filter(
            (q) => q.success && !q.error
          ).length;
          const errorCount = fileQueries.filter(
            (q) => q.error || !q.success
          ).length;
          const latestQuery = fileQueries.reduce((latest, current) =>
            new Date(current.timestamp) > new Date(latest.timestamp)
              ? current
              : latest
          );

          return (
            <div
              key={fileName}
              className="bg-white rounded-lg border border-gray-200 shadow-sm"
            >
              {/* File Header */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => toggleFileExpansion(fileName)}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {isExpanded ? (
                      <ChevronDown size={16} className="text-gray-400" />
                    ) : (
                      <ChevronRight size={16} className="text-gray-400" />
                    )}
                    <FileText size={16} className="text-logocolor" />
                  </div>

                  <div>
                    <h3 className="text-gray-900 font-normaltext font-medium">
                      {fileName}
                    </h3>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                      <span>{fileQueries.length} queries</span>
                      <span className="text-green-600">
                        {successCount} successful
                      </span>
                      {errorCount > 0 && (
                        <span className="text-red-500">
                          {errorCount} errors
                        </span>
                      )}
                      <span>Last: {formatDate(latestQuery.timestamp)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-gray-400">{fileQueries.length}</div>
              </div>

              {/* Expanded Queries List */}
              {isExpanded && (
                <div className="border-t border-gray-200 bg-gray-100">
                  {fileQueries
                    .sort(
                      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
                    )
                    .map((query, index) => (
                      <div
                        key={query.id || `${fileName}-${index}`}
                        className="border-b border-gray-200 last:border-b-0"
                      >
                        {/* Query Header */}
                        <div
                          className="p-4 cursor-pointer hover:bg-white transition-colors"
                          onClick={() =>
                            setSelectedQuery(
                              selectedQuery === query.id ? null : query.id
                            )
                          }
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                {query.error ? (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                ) : (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                )}
                                <h4 className="text-gray-900 font-normaltext text-sm truncate">
                                  {query.query}
                                </h4>
                              </div>

                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <div className="flex items-center space-x-1">
                                  <Clock size={12} />
                                  <span>{formatDate(query.timestamp)}</span>
                                </div>
                                {query.executionTime && (
                                  <div>
                                    {formatExecutionTime(query.executionTime)}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="text-gray-800 text-sm">
                              {selectedQuery === query.id ? "−" : "+"}
                            </div>
                          </div>
                        </div>

                        {/* Expanded Query Details */}
                        {selectedQuery === query.id && (
                          <div className="border-t border-gray-200 bg-white">
                            {/* Error Message */}
                            {query.error && (
                              <div className="p-4 border-b border-gray-200">
                                <div className="flex items-center space-x-2 mb-2">
                                  <XCircle className="h-4 w-4 text-red-500" />
                                  <h5 className="text-sm font-medium text-red-500">
                                    Error:
                                  </h5>
                                </div>
                                <div className="bg-red-100 bg-opacity-50 border border-red-500 rounded p-3">
                                  <pre className="text-red-500 text-sm whitespace-pre-wrap">
                                    {query.error}
                                  </pre>
                                </div>
                              </div>
                            )}

                            {/* Result Data */}
                            {query.result && !query.error && (
                              <div className="p-4">
                                <h5 className="text-sm font-medium text-gray-900 mb-3">
                                  Result:
                                </h5>

                                {/* DataFrame */}
                                {query.result?.type === "dataframe" &&
                                  query.result.data && (
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-sm border border-gray-200 rounded-lg">
                                        <thead className="bg-gray-100">
                                          <tr>
                                            {query.result.columns?.map(
                                              (column, colIndex) => (
                                                <th
                                                  key={colIndex}
                                                  className="text-left py-2 px-3 text-gray-700 font-normaltext font-medium text-xs border-b border-gray-200"
                                                >
                                                  {column}
                                                </th>
                                              )
                                            )}
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {query.result.data
                                            .slice(0, 10)
                                            .map((row, rowIndex) => (
                                              <tr
                                                key={rowIndex}
                                                className="border-b border-gray-100 hover:bg-gray-50"
                                              >
                                                {row.map((cell, cellIndex) => (
                                                  <td
                                                    key={cellIndex}
                                                    className="py-2 px-3 text-gray-600 font-normaltext text-xs"
                                                  >
                                                    {cell === null ||
                                                    cell === undefined ||
                                                    cell === "nan" ||
                                                    (typeof cell === "number" &&
                                                      isNaN(cell)) ? (
                                                      <span className="text-gray-400 italic">
                                                        —
                                                      </span>
                                                    ) : (
                                                      String(cell)
                                                    )}
                                                  </td>
                                                ))}
                                              </tr>
                                            ))}
                                        </tbody>
                                      </table>
                                      {query.result.shape &&
                                        query.result.data.length > 10 && (
                                          <p className="text-xs text-gray-500 mt-2 text-center">
                                            Showing first 10 rows of{" "}
                                            {query.result.shape[0]} total rows
                                          </p>
                                        )}
                                    </div>
                                  )}

                                {/* Series */}
                                {query.result?.type === "series" &&
                                  query.result.data &&
                                  query.result.index && (
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-sm border border-gray-200 rounded-lg">
                                        <thead className="bg-gray-100">
                                          <tr>
                                            <th className="text-left py-2 px-3 text-gray-700 font-normaltext font-medium text-xs border-b border-gray-200">
                                              Column
                                            </th>
                                            <th className="text-left py-2 px-3 text-gray-700 font-normaltext font-medium text-xs border-b border-gray-200">
                                              {query.result.name ||
                                                "Missing Values Count"}
                                            </th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {query.result.data.map(
                                            (value, index) => (
                                              <tr
                                                key={index}
                                                className="border-b border-gray-100 hover:bg-gray-50"
                                              >
                                                <td className="py-2 px-3 text-gray-600 font-normaltext text-xs font-medium">
                                                  {query.result.index[index] ||
                                                    index}
                                                </td>
                                                <td className="py-2 px-3 text-gray-600 font-normaltext text-xs">
                                                  {value === null ||
                                                  value === undefined ||
                                                  value === "nan" ||
                                                  (typeof value === "number" &&
                                                    isNaN(value)) ? (
                                                    <span className="text-gray-400 italic">
                                                      —
                                                    </span>
                                                  ) : (
                                                    <span
                                                      className={
                                                        value === 0
                                                          ? "text-green-600"
                                                          : "text-yellow-600"
                                                      }
                                                    >
                                                      {String(value)}
                                                    </span>
                                                  )}
                                                </td>
                                              </tr>
                                            )
                                          )}
                                        </tbody>
                                      </table>
                                      <div className="mt-2 text-xs text-gray-500 text-center">
                                        Showing {query.result.data.length}{" "}
                                        columns with their missing value counts
                                      </div>
                                    </div>
                                  )}

                                {/* Scalar / Text */}
                                {(query.result?.type === "scalar" ||
                                  query.result?.type === "text" ||
                                  typeof query.result === "string" ||
                                  typeof query.result === "number") && (
                                  <div className="bg-gray-100 border border-gray-200 rounded p-3 mt-2">
                                    <pre className="text-gray-800 text-sm whitespace-pre-wrap">
                                      {query.result?.data || query.result}
                                    </pre>
                                  </div>
                                )}

                                {/* Fallback for other objects */}
                                {(!query.result?.type ||
                                  (query.result?.type !== "dataframe" &&
                                    query.result?.type !== "series" &&
                                    query.result?.type !== "scalar" &&
                                    query.result?.type !== "text")) &&
                                  typeof query.result === "object" && (
                                    <div className="bg-gray-100 border border-gray-200 rounded p-3 mt-2">
                                      <pre className="text-gray-800 text-sm whitespace-pre-wrap">
                                        {JSON.stringify(query.result, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                              </div>
                            )}

                            {/* Generated Code - Conditionally Rendered */}
                            {query.generatedCode &&
                              showGeneratedCode[
                                query.id || `${fileName}-${index}`
                              ] && (
                                <div className="p-4  border-gray-700">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <Code className="h-4 w-4 text-gray-900" />
                                    <h5 className="text-sm font-medium text-gray-900">
                                      Generated Code:
                                    </h5>
                                  </div>
                                  <pre className="bg-gray-100 p-3 rounded text-sm text-green-400 overflow-x-auto">
                                    <code>{query.generatedCode}</code>
                                  </pre>
                                </div>
                              )}

                            {/* Actions */}
                            <div className="p-4 ">
                              <div className="flex items-center space-x-2 flex-wrap gap-2">
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(query.query);
                                  }}
                                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded transition-colors"
                                >
                                  Copy Query
                                </button>
                                {query.generatedCode && (
                                  <>
                                    <button
                                      onClick={() => {
                                        const queryKey =
                                          query.id || `${fileName}-${index}`;
                                        setShowGeneratedCode((prev) => ({
                                          ...prev,
                                          [queryKey]: !prev[queryKey],
                                        }));
                                      }}
                                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded transition-colors"
                                    >
                                      {showGeneratedCode[
                                        query.id || `${fileName}-${index}`
                                      ]
                                        ? "Hide Code"
                                        : "Show Code"}
                                    </button>
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(
                                          query.generatedCode
                                        );
                                      }}
                                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded transition-colors"
                                    >
                                      Copy Code
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {sortedFileNames.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-900 font-normaltext">
            {filter === "all"
              ? "No query history found."
              : "No queries match the selected filter."}
          </p>
        </div>
      )}
    </div>
  );
};
