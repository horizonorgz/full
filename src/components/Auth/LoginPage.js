// import React, { useState, useEffect } from 'react'
// import { Link, useNavigate, useLocation } from 'react-router-dom'
// import { useAuth } from '../../contexts/AuthContext'
// import { ButtonLoader } from '../common/LoadingSpinner'
// import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react'

// const GoogleIcon = () => (
//   <svg className="w-5 h-5" viewBox="0 0 24 24">
//     <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
//     <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
//     <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
//     <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
//   </svg>
// )

// const LoginPage = () => {
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [showPassword, setShowPassword] = useState(false)
//   const [rememberMe, setRememberMe] = useState(false)

//   const { signIn, signInWithGoogle, loading, error, clearError, isAuthenticated } = useAuth()
//   const navigate = useNavigate()
//   const location = useLocation()

//   // Get the redirect path from state, default to dashboard
//   const from = location.state?.from || '/dashboard'

//   // Redirect if already authenticated
//   useEffect(() => {
//     if (isAuthenticated) {
//       navigate(from, { replace: true })
//     }
//   }, [isAuthenticated, navigate, from])

//   // Clear errors when component mounts or inputs change
//   useEffect(() => {
//     clearError()
//   }, [email, password, clearError])

//   const handleSubmit = async (e) => {
//     e.preventDefault()

//     if (!email || !password) {
//       return
//     }

//     const result = await signIn(email, password)

//     if (result.success) {
//       navigate(from, { replace: true })
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

//   return (
//     <div className="min-h-screen bg-black flex items-center justify-center px-4">
//       <div className="max-w-md w-full space-y-8">
//         {/* Header */}
//         <div className="text-center">
//           <h1 className="text-4xl font-jersey text-logocolor mb-2">
//             HorizonAI
//           </h1>
//           <h2 className="text-2xl font-jersey text-white mb-2">
//             Welcome Back
//           </h2>
//           <p className="text-gray-400 font-normaltext">
//             Sign in to continue your data analysis journey
//           </p>
//         </div>

//         {/* Login Form */}
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
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-logocolor focus:border-logocolor font-normaltext"
//                 placeholder="Enter your email"
//               />
//             </div>
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
//                 autoComplete="current-password"
//                 required
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className="block w-full pl-10 pr-10 py-3 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-logocolor focus:border-logocolor font-normaltext"
//                 placeholder="Enter your password"
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
//           </div>

//           {/* Remember Me & Forgot Password */}
//           <div className="flex items-center justify-between">
//             <div className="flex items-center">
//               <input
//                 id="remember-me"
//                 name="remember-me"
//                 type="checkbox"
//                 checked={rememberMe}
//                 onChange={(e) => setRememberMe(e.target.checked)}
//                 className="h-4 w-4 text-logocolor focus:ring-logocolor border-gray-600 rounded bg-gray-800"
//               />
//               <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300 font-normaltext">
//                 Remember me
//               </label>
//             </div>
//             <Link
//               to="/forgot-password"
//               className="text-sm text-logocolor hover:text-opacity-80 font-normaltext"
//             >
//               Forgot password?
//             </Link>
//           </div>

//           {/* Submit Button */}
//           <button
//             type="submit"
//             disabled={loading || !email || !password}
//             className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-black bg-logocolor hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-logocolor disabled:opacity-50 disabled:cursor-not-allowed font-normaltext"
//           >
//             {loading ? <ButtonLoader /> : 'Sign In'}
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

//           {/* Google Sign In Button */}
//           <button
//             type="button"
//             onClick={handleGoogleSignIn}
//             disabled={loading}
//             className="group relative w-full flex justify-center items-center py-3 px-4 border border-gray-600 text-sm font-medium rounded-lg text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed font-normaltext"
//           >
//             <GoogleIcon />
//             <span className="ml-2">Sign in with Google</span>
//           </button>

//           {/* Sign Up Link */}
//           <div className="text-center">
//             <p className="text-gray-400 font-normaltext">
//               Don't have an account?{' '}
//               <Link
//                 to="/signup"
//                 className="text-logocolor hover:text-opacity-80 font-medium"
//               >
//                 Sign up here
//               </Link>
//             </p>
//           </div>
//         </form>
//       </div>
//     </div>
//   )
// }

// export default LoginPage

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { ButtonLoader } from "../common/LoadingSpinner";
import { Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react";

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

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    signIn,
    signInWithGoogle,
    loading,
    error,
    clearError,
    isAuthenticated,
  } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/dashboard";

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    clearError();
  }, [email, password, clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    const result = await signIn(email, password);
    if (result.success) navigate(from, { replace: true });
  };

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 bg-black relative bg-cover bg-center"
      style={{
        backgroundImage: "url('/images/image.png')",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>

      {/* Login Card */}
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
          <p className="text-gray-300 text-sm ml-4 ">Sign in to continue</p>
        </div>

        {/* Form */}
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-7 pr-3 py-2 bg-transparent border-b border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-logocolor transition"
              placeholder="Email"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-0 top-2.5 h-5 w-5 text-gray-400" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-7 pr-8 py-2 bg-transparent border-b border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-logocolor transition"
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
          </div>

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between text-xs text-gray-400">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-logocolor rounded border border-gray-600 bg-gray-900 focus:ring-logocolor"
              />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-logocolor">
              Forgot password?
            </Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full py-2 rounded-lg bg-logocolor text-black font-semibold hover:opacity-90 transition  disabled:cursor-not-allowed"
          >
            {loading ? <ButtonLoader /> : "Sign In"}
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
            className="w-full flex items-center justify-center py-2 rounded-lg border border-gray-600 text-white hover:bg-gray-800 transition disabled:opacity-50"
          >
            <GoogleIcon />
            <span className="ml-2">Sign in with Google</span>
          </button>
        </form>

        {/* Signup */}
        <div className="mt-6 text-center text-gray-400 text-sm">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="text-logocolor hover:opacity-80">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
