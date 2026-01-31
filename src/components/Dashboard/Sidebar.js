// import React, { useState, useEffect } from 'react'
// import {
//   Menu,
//   X,
//   User,
//   Upload,
//   MessageSquare,
//   History,
//   LogOut,
//   Settings,
//   Database,
//   Heart
// } from 'lucide-react'
// import { fileAPI } from '../../services/api'
// import FeedbackModal from '../Feedback/FeedbackModal'

// const Sidebar = ({
//   isOpen,
//   onToggle,
//   user,
//   uploadedFiles,
//   currentFile,
//   activeView,
//   onViewChange,
//   onFileSelect,
//   onSignOut
// }) => {
//   const [columnDatatypes, setColumnDatatypes] = useState(null)
//   const [loadingDatatypes, setLoadingDatatypes] = useState(false)
//   const [showFeedbackModal, setShowFeedbackModal] = useState(false)

//   // Load column datatypes when current file changes
//   useEffect(() => {
//     const loadDatatypes = async () => {
//       if (currentFile?.metadata?.id) {
//         setLoadingDatatypes(true)
//         try {
//           const response = await fileAPI.getFileDatatypes(currentFile.metadata.id)
//           if (response.success) {
//             setColumnDatatypes(response.datatypes)
//           }
//         } catch (error) {
//           console.error('Failed to load column datatypes:', error)
//           setColumnDatatypes(null)
//         } finally {
//           setLoadingDatatypes(false)
//         }
//       } else {
//         setColumnDatatypes(null)
//       }
//     }

//     loadDatatypes()
//   }, [currentFile?.metadata?.id])

//   const menuItems = [
//     { id: 'upload', label: 'Upload File', icon: Upload },
//     { id: 'query', label: 'Query Data', icon: MessageSquare },
//     { id: 'history', label: 'Query History', icon: History },
//     { id: 'settings', label: 'Settings', icon: Settings },
//   ]

//   return (
//     <>
//       {/* Mobile backdrop */}
//       {isOpen && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
//           onClick={onToggle}
//         />
//       )}

//       {/* Sidebar */}
//       <div className={`
//         fixed left-0 top-0 h-full bg-gray-900 text-white z-30 transition-all duration-300
//         ${isOpen ? 'w-80' : 'w-16'}
//         border-r border-gray-700
//       `}>
//         {/* Header */}
//         <div className="flex items-center justify-between p-4 border-b border-gray-700">
//           {isOpen && (
//             <h1 className="text-xl font-jersey text-logocolor">
//               HorizonAI
//             </h1>
//           )}
//           <button
//             onClick={onToggle}
//             className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
//           >
//             {isOpen ? <X size={20} /> : <Menu size={20} />}
//           </button>
//         </div>

//         {/* User Profile */}
//         {isOpen && (
//           <div className="p-4 border-b border-gray-700">
//             <div className="flex items-center space-x-3">
//               <div className="w-10 h-10 bg-logocolor rounded-full flex items-center justify-center">
//                 <User size={20} className="text-black" />
//               </div>
//               <div className="flex-1 min-w-0">
//                 <p className="text-sm font-medium text-white truncate">
//                   {user?.email || 'User'}
//                 </p>
//                 <p className="text-xs text-gray-400">
//                   Member since {new Date(user?.created_at || Date.now()).toLocaleDateString()}
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Navigation Menu */}
//         <nav className="flex-1 p-4">
//           <div className="space-y-2">
//             {menuItems.map((item) => {
//               const Icon = item.icon
//               const isActive = activeView === item.id

//               return (
//                 <button
//                   key={item.id}
//                   onClick={() => onViewChange(item.id)}
//                   className={`
//                     w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors
//                     ${isActive
//                       ? 'bg-logocolor text-black'
//                       : 'text-gray-300 hover:bg-gray-800 hover:text-white'
//                     }
//                   `}
//                   title={isOpen ? '' : item.label}
//                 >
//                   <Icon size={20} />
//                   {isOpen && (
//                     <span className="font-normaltext">{item.label}</span>
//                   )}
//                 </button>
//               )
//             })}
//           </div>

//           {/* Column Datatypes */}
//           {isOpen && currentFile && (
//             <div className="mt-8">
//               <div className="flex items-center space-x-2 mb-3">
//                 <Database size={16} className="text-gray-400" />
//                 <h3 className="text-sm font-medium text-gray-400">Column Datatypes</h3>
//               </div>

//               {loadingDatatypes ? (
//                 <div className="px-3 py-2 text-xs text-gray-400 bg-gray-800 rounded-lg">
//                   Loading datatypes...
//                 </div>
//               ) : columnDatatypes ? (
//                 <div className="max-h-60 overflow-y-auto space-y-1" style={{
//                   scrollbarWidth: 'thin',
//                   scrollbarColor: '#4b5563 #1f2937'
//                 }}>
//                   {Object.entries(columnDatatypes).map(([columnName, datatype], index) => (
//                     <div
//                       key={columnName}
//                       className="px-3 py-2 text-xs bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
//                     >
//                       <div className="flex justify-between items-start">
//                         <p className="text-gray-300 font-medium truncate flex-1 mr-2">
//                           {columnName}
//                         </p>
//                         <span className={`
//                           px-2 py-1 rounded text-xs font-medium
//                           ${datatype.type === 'Integer' ? 'bg-blue-900 text-blue-300' :
//                             datatype.type === 'Float' ? 'bg-green-900 text-green-300' :
//                             datatype.type === 'Text' ? 'bg-purple-900 text-purple-300' :
//                             datatype.type === 'DateTime' ? 'bg-orange-900 text-orange-300' :
//                             datatype.type === 'Boolean' ? 'bg-red-900 text-red-300' :
//                             'bg-gray-700 text-gray-300'
//                           }
//                         `}>
//                           {datatype.type}
//                         </span>
//                       </div>
//                       <p className="text-gray-500 mt-1 text-xs">
//                         {datatype.non_null_count} values
//                         {datatype.null_count > 0 && `, ${datatype.null_count} null`}
//                       </p>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="px-3 py-2 text-xs text-gray-500 bg-gray-800 rounded-lg">
//                   No datatype information available
//                 </div>
//               )}
//             </div>
//           )}
//         </nav>

//         {/* Footer */}
//         <div className="p-4 border-t border-gray-700">
//           {isOpen ? (
//             <div className="space-y-2">
//               <button
//                 onClick={() => setShowFeedbackModal(true)}
//                 className="w-full flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-logocolor hover:text-black rounded-lg transition-colors"
//               >
//                 <Heart size={20} />
//                 <span className="font-normaltext">Feedback</span>
//               </button>
//               <button className="w-full flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors">
//                 <Settings size={20} />
//                 <span className="font-normaltext">Settings</span>
//               </button>
//               <button
//                 onClick={onSignOut}
//                 className="w-full flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-red-600 rounded-lg transition-colors"
//               >
//                 <LogOut size={20} />
//                 <span className="font-normaltext">Sign Out</span>
//               </button>
//             </div>
//           ) : (
//             <div className="space-y-2">
//               <button
//                 onClick={() => setShowFeedbackModal(true)}
//                 className="w-full p-2 text-gray-300 hover:bg-logocolor hover:text-black rounded-lg transition-colors"
//                 title="Feedback"
//               >
//                 <Heart size={20} />
//               </button>
//               <button
//                 className="w-full p-2 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
//                 title="Settings"
//               >
//                 <Settings size={20} />
//               </button>
//               <button
//                 onClick={onSignOut}
//                 className="w-full p-2 text-gray-300 hover:bg-red-600 rounded-lg transition-colors"
//                 title="Sign Out"
//               >
//                 <LogOut size={20} />
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Feedback Modal */}
//       <FeedbackModal
//         isOpen={showFeedbackModal}
//         onClose={() => setShowFeedbackModal(false)}
//         onSubmit={() => setShowFeedbackModal(false)}
//       />
//     </>
//   )
// }

// export default Sidebar

import React, { useState, useRef, useEffect } from "react";
import {
  Menu,
  X,
  User,
  Upload,
  MessageSquare,
  History,
  LogOut,
  Settings,
  Database,
  Heart,
} from "lucide-react";
import { fileAPI } from "../../services/api";
import FeedbackModal from "../Feedback/FeedbackModal";

// Footer with dropup user profile (old style)
const SidebarUserFooter = ({ isOpen, user, onSignOut, onFeedback }) => {
  const [dropupOpen, setDropupOpen] = useState(false);
  const dropupRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropupRef.current && !dropupRef.current.contains(event.target)) {
        setDropupOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="fixed left-0 w-64 bottom-0 z-40 border-t border-gray-100 p-2">
      <div ref={dropupRef} className="relative">
        <button
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none"
          onClick={() => setDropupOpen((v) => !v)}
        >
          <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
            <User size={20} className="text-white" />
          </div>
          {isOpen && (
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.email || "User"}
              </p>
              <p className="text-xs text-gray-500">
                Member since{" "}
                {new Date(user?.created_at || Date.now()).toLocaleDateString()}
              </p>
            </div>
          )}
        </button>

        {dropupOpen && (
          <div className="absolute bottom-14 left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg py-2 p-2 animate-fadeInUp">
            <button
              className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-200 hover:text-gray-900 rounded-lg transition-colors"
              onClick={() => {
                setDropupOpen(false);
                onFeedback();
              }}
            >
              <Heart size={18} />
              <span className="font-normaltext">Feedback</span>
            </button>
            {/* <button
              className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
              onClick={() => setDropupOpen(false)}
            >
              <Settings size={18} />
              <span className="font-normaltext">Settings</span>
            </button> */}
            <button
              className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors"
              onClick={() => {
                setDropupOpen(false);
                onSignOut();
              }}
            >
              <LogOut size={18} />
              <span className="font-normaltext">Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const Sidebar = ({
  isOpen,
  onToggle,
  user,
  currentFile,
  activeView,
  onViewChange,
  onSignOut,
}) => {
  const [columnDatatypes, setColumnDatatypes] = useState(null);
  const [loadingDatatypes, setLoadingDatatypes] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  useEffect(() => {
    const loadDatatypes = async () => {
      if (currentFile?.metadata?.id) {
        setLoadingDatatypes(true);
        try {
          const response = await fileAPI.getFileDatatypes(
            currentFile.metadata.id
          );
          if (response.success) {
            setColumnDatatypes(response.datatypes);
          }
        } catch (error) {
          console.error("Failed to load column datatypes:", error);
          setColumnDatatypes(null);
        } finally {
          setLoadingDatatypes(false);
        }
      } else {
        setColumnDatatypes(null);
      }
    };
    loadDatatypes();
  }, [currentFile?.metadata?.id]);

  const menuItems = [
    { id: "upload", label: "New File", icon: Upload },
    { id: "query", label: "Query Data", icon: MessageSquare },
    { id: "history", label: "Query History", icon: History },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-white text-gray-900 z-30 transition-all duration-300 shadow-md ${
          isOpen ? "w-64" : "w-16"
        } border-r border-gray-200 overflow-y-auto`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          {isOpen && (
            <h2 id="horizon" className="text-1xl text-black flex items-center">
              <span>
                <img
                  src="images/logoyashraj1black.svg"
                  alt="Logo"
                  className="w-10 h-10 object-cover"
                />
              </span>
              Horizon
            </h2>
          )}
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle sidebar"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center py-2 rounded-lg transition-colors ${
                    isActive
                      ? "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  } ${
                    isOpen
                      ? "w-full px-3 py-2 space-x-3 justify-start"
                      : "w-full h-12 justify-center"
                  }`}
                  title={isOpen ? "" : item.label}
                >
                  <Icon size={20} />
                  {isOpen && (
                    <span className="font-normaltext">{item.label}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Column Datatypes */}
          {isOpen && currentFile && (
            <div className="mt-6">
              <div className="flex items-center space-x-2 mb-3">
                <Database size={16} className="text-gray-400" />
                <h3 className="text-sm font-medium text-gray-400">
                  Column Datatypes
                </h3>
              </div>

              {loadingDatatypes ? (
                <div className="px-3 py-2 text-xs text-gray-400 bg-gray-800 rounded-lg">
                  Loading datatypes...
                </div>
              ) : columnDatatypes ? (
                <div className="max-h-60 overflow-y-auto space-y-1 pr-2">
                  {Object.entries(columnDatatypes).map(
                    ([columnName, datatype]) => (
                      <div
                        key={columnName}
                        className="px-3 py-2 text-xs bg-gray-200 rounded-lg transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <p className="text-gray-900 font-medium truncate flex-1 mr-2">
                            {columnName}
                          </p>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              datatype.type === "Integer"
                                ? " border border-gray-700 text-gray-700"
                                : datatype.type === "Float"
                                ? "border border-gray-700 text-gray-700"
                                : datatype.type === "Text"
                                ? "border border-gray-700 text-gray-700"
                                : datatype.type === "DateTime"
                                ? "border border-gray-700 text-gray-700"
                                : datatype.type === "Boolean"
                                ? "border border-gray-700 text-gray-700"
                                : "border border-gray-700 text-gray-700"
                            }`}
                          >
                            {datatype.type}
                          </span>
                        </div>
                        <p className="text-gray-500 mt-1 text-xs">
                          {datatype.non_null_count} values
                          {datatype.null_count > 0 &&
                            `, ${datatype.null_count} null`}
                        </p>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="px-3 py-2 text-xs text-gray-500 bg-gray-800 rounded-lg">
                  No datatype information available
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Footer */}
        {isOpen ? (
          <SidebarUserFooter
            isOpen={isOpen}
            user={user}
            onSignOut={onSignOut}
            onFeedback={() => setShowFeedbackModal(true)}
          />
        ) : (
          <div className="fixed left-0 w-14 bottom-0 z-40 border-t border-gray-100 p-4 flex flex-col items-center">
            <div
              className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center cursor-pointer"
              onClick={() => setShowFeedbackModal(true)}
              title="Feedback"
            >
              <Heart size={20} className="text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        onSubmit={() => setShowFeedbackModal(false)}
      />
    </>
  );
};

export default Sidebar;
