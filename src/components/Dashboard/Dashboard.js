import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import Sidebar from "./Sidebar";
import MainContent from "./MainContent";
import LoadingSpinner from "../common/LoadingSpinner";
import APIKeySetup from "../Auth/APIKeySetup";
// import FeedbackPopup from "../Feedback/FeedbackPopup";
// import PerformanceMonitor from "../common/PerformanceMonitor";
// import AccessibilityEnhancer from "../common/AccessibilityEnhancer";
import { fileAPI, queryAPI } from "../../services/api";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentFile, setCurrentFile] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [queryHistory, setQueryHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAPIKeyCheck, setShowAPIKeyCheck] = useState(true);
  const [hasAPIKey, setHasAPIKey] = useState(false);
  // const [performanceMetrics, setPerformanceMetrics] = useState({
  //   queryExecutionTime: null,
  //   memoryUsage: null,
  // });

  // Dashboard state management
  const [activeView, setActiveView] = useState("upload"); // 'upload', 'query', 'history', 'settings'

  useEffect(() => {
    // Load user's files and query history when component mounts
    loadUserData();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadUserData = async () => {
    // setLoading(true)
    try {
      if (user?.id) {
        // Load uploaded files
        const filesResponse = await fileAPI.getUserFiles(user.id);
        setUploadedFiles(filesResponse.files || []);

        // Load query history
        const historyResponse = await queryAPI.getQueryHistory(user.id);
        setQueryHistory(historyResponse.queries || []);

        console.log("Loaded user data for:", user?.email);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (file, metadata, preview) => {
    setCurrentFile({ file, metadata, preview });
    setUploadedFiles((prev) => [
      ...prev,
      { file, metadata, preview, uploadDate: new Date() },
    ]);
    setActiveView("query"); // Switch to query view after upload
  };

  const handleNewQuery = async (query, result, executionTime) => {
    // Add the query locally for immediate feedback
    const newQuery = {
      id: Date.now(),
      query,
      result,
      timestamp: new Date(),
      fileName: currentFile?.metadata?.name,
    };
    setQueryHistory((prev) => [newQuery, ...prev]);

    // Update performance metrics
    // setPerformanceMetrics({
    //   queryExecutionTime: executionTime,
    //   memoryUsage: performance.memory?.usedJSHeapSize || null,
    // });

    // Refresh query history from server to get the persisted data
    try {
      if (user?.id) {
        const historyResponse = await queryAPI.getQueryHistory(user.id);
        setQueryHistory(historyResponse.queries || []);
      }
    } catch (error) {
      console.error("Error refreshing query history:", error);
    }
  };

  const handleAPIKeyVerified = () => {
    setShowAPIKeyCheck(false);
    setHasAPIKey(true);
    setActiveView("upload"); // Start with upload view after API key is set
  };

  const handleSignOut = async () => {
    const result = await signOut();
    if (result.success) {
      // Navigation will be handled by AuthContext
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner size="xl" color="logocolor" />
      </div>
    );
  }

  // Show API key setup for new users or users without API key
  if (showAPIKeyCheck) {
    return <APIKeySetup onAPIKeySet={handleAPIKeyVerified} />;
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        user={user}
        uploadedFiles={uploadedFiles}
        currentFile={currentFile}
        activeView={activeView}
        onViewChange={setActiveView}
        onFileSelect={setCurrentFile}
        onSignOut={handleSignOut}
      />

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-16"
        }`}
      >
        <MainContent
          activeView={activeView}
          currentFile={currentFile}
          onFileUpload={handleFileUpload}
          onNewQuery={handleNewQuery}
          queryHistory={queryHistory}
          user={user}
        />
      </div>

      {/* Automatic Feedback Popup */}
      {/* <FeedbackPopup user={user} /> */}

      {/* Performance Monitor */}
      {/* <PerformanceMonitor
        queryExecutionTime={performanceMetrics.queryExecutionTime}
        memoryUsage={performanceMetrics.memoryUsage}
        isVisible={true}
      /> */}

      {/* Accessibility Enhancer */}
    </div>
  );
};

export default Dashboard;
