// import React, { useState, useEffect } from 'react'
// import { Link, useNavigate } from 'react-router-dom'
// import { useAuth } from '../../contexts/AuthContext'
// import { ButtonLoader } from '../common/LoadingSpinner'
// import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react'

// const GoogleIcon = () => (
//   <svg className="w-5 h-5" viewBox="0 0 24 24">
//     <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
//     <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
//     <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
//     <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
//   </svg>
// )

// const SignupPage = () => {
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//     confirmPassword: ''
//   })
//   const [showPassword, setShowPassword] = useState(false)
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false)
//   const [validationErrors, setValidationErrors] = useState({})
//   const [isSuccess, setIsSuccess] = useState(false)

//   const { signUp, signInWithGoogle, loading, error, clearError, isAuthenticated } = useAuth()
//   const navigate = useNavigate()

//   // Redirect if already authenticated
//   useEffect(() => {
//     if (isAuthenticated) {
//       navigate('/dashboard', { replace: true })
//     }
//   }, [isAuthenticated, navigate])

//   // Clear errors when inputs change
//   useEffect(() => {
//     clearError()
//     setValidationErrors({})
//   }, [formData, clearError])

//   const validateForm = () => {
//     const errors = {}

//     // Email validation
//     if (!formData.email) {
//       errors.email = 'Email is required'
//     } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
//       errors.email = 'Please enter a valid email address'
//     }

//     // Password validation
//     if (!formData.password) {
//       errors.password = 'Password is required'
//     } else if (formData.password.length < 6) {
//       errors.password = 'Password must be at least 6 characters long'
//     }

//     // Confirm password validation
//     if (!formData.confirmPassword) {
//       errors.confirmPassword = 'Please confirm your password'
//     } else if (formData.password !== formData.confirmPassword) {
//       errors.confirmPassword = 'Passwords do not match'
//     }

//     setValidationErrors(errors)
//     return Object.keys(errors).length === 0
//   }

//   const handleInputChange = (e) => {
//     const { name, value } = e.target
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }))
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()

//     if (!validateForm()) {
//       return
//     }

//     const result = await signUp(formData.email, formData.password)

//     if (result.success) {
//       setIsSuccess(true)
//       // Don't navigate immediately, show success message first
//       setTimeout(() => {
//         navigate('/login', {
//           state: {
//             message: 'Please check your email to verify your account before signing in.'
//           }
//         })
//       }, 3000)
//     }
//     // Error handling is managed by AuthContext
//   }

//   const handleGoogleSignIn = async () => {
//     const result = await signInWithGoogle()

//     if (result.success) {
//       // For OAuth, the redirect happens automatically
//       // No need to manually navigate here
//     }
//     // Error handling is managed by AuthContext
//   }

//   // Success state
//   if (isSuccess) {
//     return (
//       <div className="min-h-screen bg-black flex items-center justify-center px-4">
//         <div className="max-w-md w-full text-center space-y-6">
//           <CheckCircle className="h-16 w-16 text-green-400 mx-auto" />
//           <h1 className="text-3xl font-jersey text-white">Account Created!</h1>
//           <p className="text-gray-300 font-normaltext">
//             We've sent you a verification email. Please check your inbox and click the verification link to activate your account.
//           </p>
//           <p className="text-sm text-gray-400 font-normaltext">
//             Redirecting to login page...
//           </p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-black flex items-center justify-center px-4">
//       <div className="max-w-md w-full space-y-8">
//         {/* Header */}
//         <div className="text-center">
//           <h1 className="text-4xl font-jersey text-logocolor mb-2">
//             HorizonAI
//           </h1>
//           <h2 className="text-2xl font-jersey text-white mb-2">
//             Create Account
//           </h2>
//           <p className="text-gray-400 font-normaltext">
//             Join us to start analyzing your data with natural language
//           </p>
//         </div>

//         {/* Signup Form */}
//         <form onSubmit={handleSubmit} className="mt-8 space-y-6">
//           {/* Error Message */}
//           {error && (
//             <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-4 flex items-center space-x-2">
//               <AlertCircle className="h-5 w-5 text-red-400" />
//               <span className="text-red-400 font-normaltext text-sm">{error}</span>
//             </div>
//           )}

//           {/* Email Field */}
//           <div>
//             <label htmlFor="email" className="block text-sm font-normaltext text-gray-300 mb-2">
//               Email Address
//             </label>
//             <div className="relative">
//               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                 <Mail className="h-5 w-5 text-gray-400" />
//               </div>
//               <input
//                 id="email"
//                 name="email"
//                 type="email"
//                 autoComplete="email"
//                 required
//                 value={formData.email}
//                 onChange={handleInputChange}
//                 className={`block w-full pl-10 pr-3 py-3 border rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-logocolor font-normaltext ${
//                   validationErrors.email ? 'border-red-500' : 'border-gray-600 focus:border-logocolor'
//                 }`}
//                 placeholder="Enter your email"
//               />
//             </div>
//             {validationErrors.email && (
//               <p className="mt-1 text-sm text-red-400 font-normaltext">{validationErrors.email}</p>
//             )}
//           </div>

//           {/* Password Field */}
//           <div>
//             <label htmlFor="password" className="block text-sm font-normaltext text-gray-300 mb-2">
//               Password
//             </label>
//             <div className="relative">
//               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                 <Lock className="h-5 w-5 text-gray-400" />
//               </div>
//               <input
//                 id="password"
//                 name="password"
//                 type={showPassword ? 'text' : 'password'}
//                 autoComplete="new-password"
//                 required
//                 value={formData.password}
//                 onChange={handleInputChange}
//                 className={`block w-full pl-10 pr-10 py-3 border rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-logocolor font-normaltext ${
//                   validationErrors.password ? 'border-red-500' : 'border-gray-600 focus:border-logocolor'
//                 }`}
//                 placeholder="Create a password"
//               />
//               <button
//                 type="button"
//                 className="absolute inset-y-0 right-0 pr-3 flex items-center"
//                 onClick={() => setShowPassword(!showPassword)}
//               >
//                 {showPassword ? (
//                   <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
//                 ) : (
//                   <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
//                 )}
//               </button>
//             </div>
//             {validationErrors.password && (
//               <p className="mt-1 text-sm text-red-400 font-normaltext">{validationErrors.password}</p>
//             )}
//           </div>

//           {/* Confirm Password Field */}
//           <div>
//             <label htmlFor="confirmPassword" className="block text-sm font-normaltext text-gray-300 mb-2">
//               Confirm Password
//             </label>
//             <div className="relative">
//               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                 <Lock className="h-5 w-5 text-gray-400" />
//               </div>
//               <input
//                 id="confirmPassword"
//                 name="confirmPassword"
//                 type={showConfirmPassword ? 'text' : 'password'}
//                 autoComplete="new-password"
//                 required
//                 value={formData.confirmPassword}
//                 onChange={handleInputChange}
//                 className={`block w-full pl-10 pr-10 py-3 border rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-logocolor font-normaltext ${
//                   validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-600 focus:border-logocolor'
//                 }`}
//                 placeholder="Confirm your password"
//               />
//               <button
//                 type="button"
//                 className="absolute inset-y-0 right-0 pr-3 flex items-center"
//                 onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//               >
//                 {showConfirmPassword ? (
//                   <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
//                 ) : (
//                   <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
//                 )}
//               </button>
//             </div>
//             {validationErrors.confirmPassword && (
//               <p className="mt-1 text-sm text-red-400 font-normaltext">{validationErrors.confirmPassword}</p>
//             )}
//           </div>

//           {/* Terms and Privacy */}
//           <div className="text-sm text-gray-400 font-normaltext">
//             By creating an account, you agree to our{' '}
//             <Link to="/terms" className="text-logocolor hover:text-opacity-80">
//               Terms of Service
//             </Link>{' '}
//             and{' '}
//             <Link to="/privacy" className="text-logocolor hover:text-opacity-80">
//               Privacy Policy
//             </Link>
//           </div>

//           {/* Submit Button */}
//           <button
//             type="submit"
//             disabled={loading}
//             className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-black bg-logocolor hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-logocolor disabled:opacity-50 disabled:cursor-not-allowed font-normaltext"
//           >
//             {loading ? <ButtonLoader /> : 'Create Account'}
//           </button>

//           {/* Divider */}
//           <div className="relative">
//             <div className="absolute inset-0 flex items-center">
//               <div className="w-full border-t border-gray-600" />
//             </div>
//             <div className="relative flex justify-center text-sm">
//               <span className="px-2 bg-black text-gray-400 font-normaltext">Or continue with</span>
//             </div>
//           </div>

//           {/* Google Sign Up Button */}
//           <button
//             type="button"
//             onClick={handleGoogleSignIn}
//             disabled={loading}
//             className="group relative w-full flex justify-center items-center py-3 px-4 border border-gray-600 text-sm font-medium rounded-lg text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed font-normaltext"
//           >
//             <GoogleIcon />
//             <span className="ml-2">Sign up with Google</span>
//           </button>

//           {/* Login Link */}
//           <div className="text-center">
//             <p className="text-gray-400 font-normaltext">
//               Already have an account?{' '}
//               <Link
//                 to="/login"
//                 className="text-logocolor hover:text-opacity-80 font-medium"
//               >
//                 Sign in here
//               </Link>
//             </p>
//           </div>
//         </form>
//       </div>
//     </div>
//   )
// }

// export default SignupPage

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { ButtonLoader } from "../common/LoadingSpinner";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const SignupPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    signUp,
    signInWithGoogle,
    loading,
    error,
    clearError,
    isAuthenticated,
  } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Clear errors when inputs change
  useEffect(() => {
    clearError();
    setValidationErrors({});
  }, [formData, clearError]);

  const validateForm = () => {
    const errors = {};

    // Email validation
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters long";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const result = await signUp(formData.email, formData.password);

    if (result.success) {
      setIsSuccess(true);
      // Don't navigate immediately, show success message first
      setTimeout(() => {
        navigate("/login", {
          state: {
            message:
              "Please check your email to verify your account before signing in.",
          },
        });
      }, 3000);
    }
    // Error handling is managed by AuthContext
  };

  const handleGoogleSignIn = async () => {
    const result = await signInWithGoogle();

    if (result.success) {
      // For OAuth, the redirect happens automatically
      // No need to manually navigate here
    }
    // Error handling is managed by AuthContext
  };

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <CheckCircle className="h-16 w-16 text-green-400 mx-auto" />
          <h1 className="text-3xl font-jersey text-white">Account Created!</h1>
          <p className="text-gray-300 font-normaltext">
            We've sent you a verification email. Please check your inbox and
            click the verification link to activate your account.
          </p>
          <p className="text-sm text-gray-400 font-normaltext">
            Redirecting to login page...
          </p>
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
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>

      <div className="relative z-10 w-full max-w-md bg-gray-900/3 backdrop-blur-md rounded-xl shadow-lg p-8">
        {/* Header */}
        <div className=" mb-8 text-center flex flex-col gap-2 items-center">
          <h2 id="horizon" className="text-2xl text-white flex items-center">
            <span>
              <img
                src="images\logoyashraj1white.svg"
                alt="Logo"
                className="w-16 h-10 object-cover"
              />
            </span>
            Horizon
          </h2>
          <p className="text-gray-300 text-sm ml-4 ">Sign up to continue</p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error */}
          {error && (
            <div className="flex items-center space-x-2 text-red-400 text-sm">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-0 top-2.5 h-5 w-5 text-gray-400" />
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full pl-7 pr-3 py-2
                 bg-transparent
                 border-b border-gray-600
                 text-white placeholder-gray-400
                 focus:outline-none focus:ring-0 focus:border-logocolor
                 transition"
              placeholder="Email"
            />
            {validationErrors.email && (
              <p className="mt-1 text-sm text-red-400">
                {validationErrors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-0 top-2.5 h-5 w-5 text-gray-400" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full pl-7 pr-8 py-2
                 bg-transparent
                 border-b border-gray-600
                 text-white placeholder-gray-400
                 focus:outline-none focus:ring-0 focus:border-logocolor
                 transition"
              placeholder="Password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-2.5 text-gray-400 hover:text-gray-200"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
            {validationErrors.password && (
              <p className="mt-1 text-sm text-red-400">
                {validationErrors.password}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <Lock className="absolute left-0 top-2.5 h-5 w-5 text-gray-400" />
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full pl-7 pr-8 py-2
                 bg-transparent
                 border-b border-gray-600
                 text-white placeholder-gray-400
                 focus:outline-none focus:ring-0 focus:border-logocolor
                 transition"
              placeholder="Confirm Password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-0 top-2.5 text-gray-400 hover:text-gray-200"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
            {validationErrors.confirmPassword && (
              <p className="mt-1 text-sm text-red-400">
                {validationErrors.confirmPassword}
              </p>
            )}
          </div>

          {/* Terms */}
          <div className="text-xs text-gray-400">
            By creating an account, you agree to our{" "}
            <Link to="/terms" className="text-logocolor hover:text-opacity-80">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              to="/privacy"
              className="text-logocolor hover:text-opacity-80"
            >
              Privacy Policy
            </Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-logocolor text-black font-semibold
               hover:opacity-90 transition
               disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <ButtonLoader /> : "Create Account"}
          </button>

          {/* Divider */}
          <div className="flex items-center my-4">
            <div className="flex-grow h-px bg-gray-600"></div>
            <span className="px-3 text-gray-400 text-sm">or</span>
            <div className="flex-grow h-px bg-gray-600"></div>
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center py-2 rounded-lg
               border border-gray-600 text-white
               hover:bg-gray-800 transition
               disabled:opacity-50"
          >
            <GoogleIcon />
            <span className="ml-2">Sign up with Google</span>
          </button>

          {/* Login Redirect */}
          <div className="text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link to="/login" className="text-logocolor hover:text-opacity-80">
              Sign in here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
