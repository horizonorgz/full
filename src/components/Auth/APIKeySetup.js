// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../../contexts/AuthContext';
// import { toast } from 'react-hot-toast';

// const APIKeySetup = ({ onAPIKeySet }) => {
//   const [apiKey, setApiKey] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [isChecking, setIsChecking] = useState(true);
//   const { user, session } = useAuth();

//   useEffect(() => {
//     checkExistingAPIKey();
//   }, [user, session]);

//   const checkExistingAPIKey = async () => {
//     if (!user || !session) {
//       setIsChecking(false);
//       return;
//     }

//     try {
//       // Use token from localStorage as backup if session token is not available
//       const token = session.access_token || localStorage.getItem('token');

//       if (!token) {
//         console.log('No token available for API key check');
//         setIsChecking(false);
//         return;
//       }

//       const response = await fetch('/api/user/api-key/info', {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       try {
//         const text = await response.text();
//         try {
//           const data = JSON.parse(text);
//           if (data.has_api_key) {
//             console.log('User already has API key, proceeding to dashboard');
//             onAPIKeySet(true);
//             return;
//           }
//         } catch (jsonError) {
//           console.error('Failed to parse API key info response as JSON:', text);
//           // Silently handle proxy errors during initial load
//           if (!text.includes('Proxy error')) {
//             toast.error('Failed to load API key information');
//           }
//         }
//       } catch (textError) {
//         console.error('Failed to get API key info response text:', textError);
//       }
//     } catch (error) {
//       console.error('Error checking API key:', error);
//     } finally {
//       setIsChecking(false);
//     }
//   };

//   const handleSaveAPIKey = async (e) => {
//     e.preventDefault();

//     if (!apiKey.trim()) {
//       toast.error('Please enter your Groq API key');
//       return;
//     }

//     if (!apiKey.startsWith('gsk_')) {
//       toast.error('Invalid Groq API key format. It should start with "gsk_"');
//       return;
//     }

//     setIsLoading(true);

//     try {
//       // Use token from session or localStorage as backup
//       const token = session?.access_token || localStorage.getItem('token');
//       console.log('Token from session or localStorage:', token ? 'Present' : 'Missing');

//       if (!token) {
//         toast.error('Authentication required. Please sign in again.');
//         return;
//       }

//       const response = await fetch('/api/user/api-key', {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           api_key: apiKey.trim(),
//           provider: 'groq'
//         })
//       });

//       console.log('Response status:', response.status);

//       // Handle potential proxy error responses
//       let data;
//       try {
//         const text = await response.text();
//         try {
//           data = JSON.parse(text);
//           console.log('Response data:', data);
//         } catch (jsonError) {
//           console.error('Failed to parse response as JSON:', text);
//           // If we get a proxy error, the backend is not running
//           if (text.includes('Proxy error')) {
//             toast.error('Backend server is not running. Please start the backend server.');
//           } else {
//             toast.error(`Invalid response from server: ${text.substring(0, 100)}...`);
//           }
//           return;
//         }
//       } catch (textError) {
//         console.error('Failed to get response text:', textError);
//         toast.error('Failed to process server response');
//         return;
//       }

//       if (data.success) {
//         toast.success('API key saved successfully!');
//         onAPIKeySet(true);
//       } else {
//         toast.error(`Failed to save API key: ${data.message || 'Unknown error'}`);
//       }
//     } catch (error) {
//       console.error('Error saving API key:', error);
//       toast.error(`Failed to save API key: ${error.message}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (isChecking) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Checking your API key...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8">
//         <div className="text-center">
//           <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
//             Setup Your Groq API Key
//           </h2>
//           <p className="mt-2 text-sm text-gray-600">
//             To use the Natural Language to Pandas application, you need to provide your own Groq API key.
//           </p>
//         </div>

//         <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
//           <div className="flex">
//             <div className="flex-shrink-0">
//               <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
//                 <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
//               </svg>
//             </div>
//             <div className="ml-3">
//               <h3 className="text-sm font-medium text-blue-800">
//                 How to get your Groq API key:
//               </h3>
//               <div className="mt-2 text-sm text-blue-700">
//                 <ol className="list-decimal list-inside space-y-1">
//                   <li>Go to <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="underline">console.groq.com</a></li>
//                   <li>Sign up or log in to your account</li>
//                   <li>Navigate to API Keys section</li>
//                   <li>Create a new API key</li>
//                   <li>Copy and paste it below</li>
//                 </ol>
//               </div>
//             </div>
//           </div>
//         </div>

//         <form className="mt-8 space-y-6" onSubmit={handleSaveAPIKey}>
//           <div>
//             <label htmlFor="api-key" className="block text-sm font-medium text-gray-700">
//               Groq API Key
//             </label>
//             <div className="mt-1">
//               <input
//                 id="api-key"
//                 name="api-key"
//                 type="password"
//                 value={apiKey}
//                 onChange={(e) => setApiKey(e.target.value)}
//                 placeholder="gsk_..."
//                 className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
//                 required
//               />
//             </div>
//             <p className="mt-2 text-sm text-gray-500">
//               Your API key is encrypted and stored securely. Only you can access it.
//             </p>
//           </div>

//           <div>
//             <button
//               type="submit"
//               disabled={isLoading}
//               className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {isLoading ? (
//                 <div className="flex items-center">
//                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                   Saving...
//                 </div>
//               ) : (
//                 'Save API Key & Continue'
//               )}
//             </button>
//           </div>
//         </form>

//         <div className="text-center">
//           <p className="text-xs text-gray-500">
//             Your API key is stored encrypted and is never shared with anyone else.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default APIKeySetup;

import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-hot-toast";

const APIKeySetup = ({ onAPIKeySet }) => {
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const { user, session } = useAuth();

  useEffect(() => {
    checkExistingAPIKey();
  }, [user, session]);

  const checkExistingAPIKey = async () => {
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

      const data = await response.json();
      if (data.has_api_key) {
        onAPIKeySet(true);
        return;
      }
    } catch (error) {
      console.error("Error checking API key:", error);
    } finally {
      setIsChecking(false);
    }
  };

  // useEffect(() => {
  //   checkExistingAPIKey();
  // }, [checkExistingAPIKey]);

  const handleSaveAPIKey = async (e) => {
    e.preventDefault();

    if (!apiKey.trim()) {
      toast.error("Please enter your Groq API key");
      return;
    }

    if (!apiKey.startsWith("gsk_")) {
      toast.error('Invalid Groq API key format. It should start with "gsk_"');
      return;
    }

    setIsLoading(true);

    try {
      const token = session?.access_token;
      if (!token) {
        toast.error("Authentication required. Please sign in again.");
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/user/api-key`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            api_key: apiKey.trim(),
            provider: "groq",
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("API key saved successfully!");
        onAPIKeySet(true);
      } else {
        toast.error(
          `Failed to save API key: ${data.message || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error saving API key:", error);
      toast.error(`Failed to save API key: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking your API key...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 bg-black relative bg-cover bg-center"
      style={{
        backgroundImage: "url('/images/image.png')",
      }}
    >
      {/* // <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"> */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>

      <div className="relative z-10 w-full max-w-md bg-gray-900/3 backdrop-blur-md rounded-xl shadow-lg p-8">
        {/*Heading  */}
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-extrabold text-white">
            Setup Your API Key
          </h2>
          <p className="mt-2 text-sm text-gray-300">
            Enter your Groq API key to continue using the platform.
          </p>
        </div>

        {/* Info Box*/}
        <div className="bg-black-50 border border-blue-200 rounded-md p-4 text-sm text-white mt-6">
          <p className="font-medium text-white">How to get your API key:</p>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>
              Go to{" "}
              <a
                href="https://console.groq.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium text-blue-400"
              >
                console.groq.com
              </a>
            </li>
            <li>Sign up or log in</li>
            <li>
              Go to <span className="font-medium">API Keys</span> section
            </li>
            <li>Create a new API key</li>
            <li>Paste it below</li>
          </ol>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSaveAPIKey}>
          <div>
            <label
              htmlFor="api-key"
              className="block text-sm font-medium text-gray-300"
            >
              Groq API Key
            </label>
            <input
              id="api-key"
              name="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="gsk_..."
              className="mt-1 appearance-none bg-black rounded-md relative block w-full px-3 py-2 border border-blue-200
                placeholder-gray-400 text-gray-300 focus:outline-none focus:ring-0 focus:border-blue-200
                sm:text-sm"
              required
            />
            <p className="mt-4 text-xs text-gray-300">
              Your API key is encrypted and stored securely.
            </p>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent
                text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                "Save & Continue"
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center mt-4">
          <p className="text-xs text-gray-300">
            Your API key is stored encrypted and is never shared with anyone.
          </p>
        </div>
      </div>
    </div>
  );
};

export default APIKeySetup;
