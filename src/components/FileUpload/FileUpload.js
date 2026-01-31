import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  X,
  Eye,
  Code,
  EyeOff,
} from "lucide-react";
import LoadingSpinner from "../common/LoadingSpinner";
import { fileAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

export const FileUpload = ({ onFileUpload }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showDataPreview, setShowDataPreview] = useState(true); // Show preview by default
  const [showGeneratedCode, setShowGeneratedCode] = useState(false);
  const { user } = useAuth();

  const onDrop = useCallback(
    async (acceptedFiles, rejectedFiles) => {
      // Clear previous states
      setError(null);
      setPreview(null);

      // Handle rejected files
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        setError(
          `File rejected: ${
            rejection.errors[0]?.message || "Invalid file type"
          }`
        );
        return;
      }

      if (acceptedFiles.length === 0) {
        setError("No valid files selected");
        return;
      }

      const file = acceptedFiles[0];
      setUploading(true);

      try {
        // Upload file to backend
        const uploadResult = await fileAPI.uploadFile(file, user.id);

        if (!uploadResult.success) {
          throw new Error(uploadResult.error || "Upload failed");
        }

        // Create file metadata from backend response
        const metadata = {
          id: uploadResult.file_id,
          name: uploadResult.file_name,
          size: formatFileSize(uploadResult.file_size),
          type: file.type,
          lastModified: new Date(),
          columns: uploadResult.columns,
          rows: uploadResult.shape[0],
          totalRows: uploadResult.preview.totalRows,
          totalColumns: uploadResult.preview.totalColumns,
        };

        setPreview(uploadResult.preview);
        setUploadedFile({ file, metadata });
        setShowDataPreview(true); // Always show preview when file is uploaded

        // Call the parent component's handler
        if (onFileUpload) {
          onFileUpload(file, metadata, uploadResult.preview);
        }
      } catch (err) {
        setError(`Upload failed: ${err.message}`);
        console.error("File upload error:", err);
      } finally {
        setUploading(false);
      }
    },
    [onFileUpload, user]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
    },
    maxFiles: 1,
    maxSize: 500 * 1024 * 1024, // 500MB
  });

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleClear = () => {
    setUploadedFile(null);
    setPreview(null);
    setError(null);
    setShowDataPreview(true); // Reset to show preview by default
    setShowGeneratedCode(false);
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${
            isDragActive
              ? "border-logocolor bg-logocolor bg-opacity-10"
              : "border-gray-600 hover:border-gray-500"
          }
          ${uploading ? "pointer-events-none opacity-50" : ""}
        `}
      >
        <input {...getInputProps()} />

        {uploading ? (
          <div className="space-y-4">
            <LoadingSpinner size="lg" color="logocolor" />
            <p className="text-white font-normaltext">
              Processing your file...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div>
              <p className="text-lg font-normaltext text-gray-500">
                {isDragActive
                  ? "Drop your file here"
                  : "Drag & drop your file here"}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                or <span className="text-logocolor">click to browse</span>
              </p>
            </div>
            <div className="text-xs text-gray-500">
              <p>Supported formats: CSV, XLSX, XLS</p>
              <p>Maximum file size: 10MB</p>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-4 flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <span className="text-red-400 font-normaltext text-sm">{error}</span>
        </div>
      )}

      {/* Success Message & File Preview */}
      {uploadedFile && preview && (
        <div className="space-y-4">
          {/* Success Header */}
          <div className="bg-green-500 bg-opacity-20 border border-green-500 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span className="text-green-400 font-normaltext text-sm">
                File uploaded successfully!
              </span>
            </div>
            <button
              onClick={handleClear}
              className="text-gray-400 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          {/* File Info */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="h-6 w-6 text-logocolor" />
              <div className="flex-1">
                <h3 className="text-white font-normaltext font-medium">
                  {uploadedFile.metadata.name}
                </h3>
                <p className="text-sm text-gray-400">
                  {uploadedFile.metadata.size} • {preview.totalRows} rows •{" "}
                  {preview.totalColumns} columns
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mb-4">
              <button
                onClick={() => setShowDataPreview(!showDataPreview)}
                className="flex items-center space-x-2 bg-logocolor text-black px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors font-normaltext"
              >
                {showDataPreview ? <EyeOff size={16} /> : <Eye size={16} />}
                <span>
                  {showDataPreview ? "Hide Data Preview" : "Show Data Preview"}
                </span>
              </button>

              <button
                onClick={() => setShowGeneratedCode(!showGeneratedCode)}
                className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-colors font-normaltext"
              >
                <Code size={16} />
                <span>
                  {showGeneratedCode ? "Hide Code" : "Show Generated Code"}
                </span>
              </button>
            </div>

            {/* Data Preview - Conditionally Rendered */}
            {showDataPreview && (
              <div className="overflow-x-auto">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-300">
                    Data Preview:
                  </h4>
                  <p className="text-xs text-logocolor">
                    Ready to query your data? Hide this preview and start asking
                    questions!
                  </p>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      {preview.columns.map((column, index) => (
                        <th
                          key={index}
                          className="text-left py-2 px-3 text-gray-300 font-normaltext"
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-b border-gray-700">
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
                {preview.totalRows > 3 && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Showing first 3 rows of {preview.totalRows} total rows
                  </p>
                )}
              </div>
            )}

            {/* Generated Code Section - Conditionally Rendered */}
            {showGeneratedCode && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-300 mb-2">
                  Generated Loading Code:
                </h4>
                <pre className="bg-gray-900 p-3 rounded text-sm text-green-400 overflow-x-auto">
                  <code>{`import pandas as pd

# Load the uploaded file
df = pd.read_${
                    uploadedFile.metadata.name?.endsWith(".csv")
                      ? "csv"
                      : "excel"
                  }('${uploadedFile.metadata.name}')

# Basic info about the dataset
print(f"Dataset shape: {df.shape}")
print(f"Columns: {df.columns.tolist()}")
print(f"Data types:\\n{df.dtypes}")

# Display first few rows
df.head()`}</code>
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
