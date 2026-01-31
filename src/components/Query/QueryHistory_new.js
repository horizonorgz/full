import React, { useState } from "react";
import {
  History,
  Clock,
  CheckCircle,
  XCircle,
  Code,
  Download,
} from "lucide-react";

export const QueryHistory = ({ queries, user }) => {
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [filter, setFilter] = useState("all"); // 'all', 'success', 'error'

  // Transform database field names to component expected names
  const transformQuery = (query) => {
    return {
      ...query,
      executionTime: query.execution_time,
      fileName: query.file_name,
      generatedCode: query.generated_code,
      error: query.error_message,
      // Parse result if it's a string
      result:
        typeof query.result === "string"
          ? (() => {
              try {
                const parsed = JSON.parse(query.result);
                // If it's a JSON object that looks like tabular data, convert it
                if (parsed && typeof parsed === "object") {
                  // Check if it has data and columns (dataframe format)
                  if (
                    parsed.data &&
                    Array.isArray(parsed.data) &&
                    parsed.columns
                  ) {
                    return {
                      type: "dataframe",
                      data: parsed.data,
                      columns: parsed.columns,
                      shape: parsed.shape,
                    };
                  }
                  // Check if it's a series format
                  if (
                    parsed.data &&
                    Array.isArray(parsed.data) &&
                    parsed.index
                  ) {
                    return {
                      type: "series",
                      data: parsed.data,
                      index: parsed.index,
                      name: parsed.name,
                    };
                  }
                  // Check if it's an array of objects (common JSON format)
                  if (
                    Array.isArray(parsed) &&
                    parsed.length > 0 &&
                    typeof parsed[0] === "object"
                  ) {
                    const columns = Object.keys(parsed[0]);
                    const data = parsed.map((row) =>
                      columns.map((col) => row[col])
                    );
                    return {
                      type: "dataframe",
                      data: data,
                      columns: columns,
                      shape: [parsed.length, columns.length],
                    };
                  }
                  // Check if it's a single object that should be displayed as key-value pairs
                  if (typeof parsed === "object" && !Array.isArray(parsed)) {
                    const entries = Object.entries(parsed);
                    return {
                      type: "series",
                      data: entries.map(([key, value]) => value),
                      index: entries.map(([key, value]) => key),
                      name: "Value",
                    };
                  }
                }
                return parsed;
              } catch {
                return { type: "text", data: query.result };
              }
            })()
          : query.result,
    };
  };

  const transformedQueries = queries.map(transformQuery);

  const filteredQueries = transformedQueries.filter((query) => {
    if (filter === "success") return query.success && !query.error;
    if (filter === "error") return query.error || !query.success;
    return true;
  });

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
        <h3 className="text-lg font-normaltext text-white mb-2">
          No Query History
        </h3>
        <p className="text-gray-400 font-normaltext">
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
            <label className="text-sm font-medium text-gray-300">Filter:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-logocolor"
            >
              <option value="all">All Queries</option>
              <option value="success">Successful</option>
              <option value="error">Errors</option>
            </select>
          </div>
          <div className="text-sm text-gray-400">
            {filteredQueries.length} of {transformedQueries.length} queries
          </div>
        </div>

        <button
          onClick={exportHistory}
          className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Download size={16} />
          <span className="font-normaltext">Export</span>
        </button>
      </div>

      {/* Query List */}
      <div className="grid gap-4">
        {filteredQueries.map((query, index) => (
          <div
            key={query.id || index}
            className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-gray-600 transition-colors"
          >
            {/* Query Header */}
            <div
              className="p-4 cursor-pointer"
              onClick={() =>
                setSelectedQuery(selectedQuery === query.id ? null : query.id)
              }
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {query.error ? (
                      <XCircle className="h-5 w-5 text-red-400" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    )}
                    <h4 className="text-white font-normaltext font-medium truncate">
                      {query.query}
                    </h4>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Clock size={14} />
                      <span>{formatDate(query.timestamp)}</span>
                    </div>
                    {query.executionTime && (
                      <div>
                        Executed in {formatExecutionTime(query.executionTime)}
                      </div>
                    )}
                    {query.fileName && <div>File: {query.fileName}</div>}
                  </div>
                </div>

                <div className="text-gray-400">
                  {selectedQuery === query.id ? "−" : "+"}
                </div>
              </div>
            </div>

            {/* Expanded Query Details */}
            {selectedQuery === query.id && (
              <div className="border-t border-gray-700">
                {/* Generated Code */}
                {query.generatedCode && (
                  <div className="p-4 border-b border-gray-700">
                    <div className="flex items-center space-x-2 mb-2">
                      <Code className="h-4 w-4 text-gray-400" />
                      <h5 className="text-sm font-medium text-gray-300">
                        Generated Code:
                      </h5>
                    </div>
                    <pre className="bg-gray-900 p-3 rounded text-sm text-green-400 overflow-x-auto">
                      <code>{query.generatedCode}</code>
                    </pre>
                  </div>
                )}

                {/* Result or Error */}
                <div className="p-4">
                  {query.error ? (
                    <div>
                      <h5 className="text-sm font-medium text-red-400 mb-2">
                        Error:
                      </h5>
                      <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded p-3">
                        <p className="text-red-400 text-sm font-normaltext">
                          {query.error}
                        </p>
                      </div>
                    </div>
                  ) : query.result ? (
                    <div>
                      <h5 className="text-sm font-medium text-gray-300 mb-2">
                        Result:
                      </h5>
                      {query.result.type === "dataframe" &&
                      query.result.data &&
                      query.result.columns ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-gray-600">
                                {query.result.columns.map(
                                  (column, colIndex) => (
                                    <th
                                      key={colIndex}
                                      className="text-left py-2 px-3 text-gray-300 font-normaltext"
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
                                    className="border-b border-gray-700"
                                  >
                                    {row.map((cell, cellIndex) => (
                                      <td
                                        key={cellIndex}
                                        className="py-2 px-3 text-gray-400 font-normaltext"
                                      >
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                          {query.result.data.length > 10 && (
                            <p className="text-xs text-gray-500 mt-2 text-center">
                              Showing first 10 rows of{" "}
                              {query.result.data.length} total rows
                            </p>
                          )}
                        </div>
                      ) : query.result.type === "series" &&
                        query.result.data ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-gray-600">
                                <th className="text-left py-2 px-3 text-gray-300 font-normaltext">
                                  Index
                                </th>
                                <th className="text-left py-2 px-3 text-gray-300 font-normaltext">
                                  {query.result.name || "Value"}
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {query.result.data
                                .slice(0, 10)
                                .map((value, index) => (
                                  <tr
                                    key={index}
                                    className="border-b border-gray-700"
                                  >
                                    <td className="py-2 px-3 text-gray-400 font-normaltext">
                                      {query.result.index?.[index] || index}
                                    </td>
                                    <td className="py-2 px-3 text-gray-400 font-normaltext">
                                      {value}
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                          {query.result.data.length > 10 && (
                            <p className="text-xs text-gray-500 mt-2 text-center">
                              Showing first 10 rows of{" "}
                              {query.result.data.length} total rows
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="bg-gray-700 p-3 rounded">
                          <pre className="text-gray-300 text-sm whitespace-pre-wrap">
                            {typeof query.result === "object"
                              ? JSON.stringify(query.result, null, 2)
                              : String(query.result)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-400 text-sm">
                      No result data available
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="p-4 bg-gray-750 border-t border-gray-700">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        // Copy query to clipboard
                        navigator.clipboard.writeText(query.query);
                      }}
                      className="text-xs bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded transition-colors"
                    >
                      Copy Query
                    </button>
                    {query.generatedCode && (
                      <button
                        onClick={() => {
                          // Copy code to clipboard
                          navigator.clipboard.writeText(query.generatedCode);
                        }}
                        className="text-xs bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded transition-colors"
                      >
                        Copy Code
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredQueries.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400 font-normaltext">
            No queries match the selected filter.
          </p>
        </div>
      )}
    </div>
  );
};
