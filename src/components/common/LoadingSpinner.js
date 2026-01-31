// import React from 'react'

// const LoadingSpinner = ({ size = 'md', color = 'logocolor' }) => {
//   const sizeClasses = {
//     sm: 'h-4 w-4',
//     md: 'h-8 w-8',
//     lg: 'h-12 w-12',
//     xl: 'h-16 w-16'
//   }

//   const colorClasses = {
//     logocolor: 'border-logocolor',
//     white: 'border-white',
//     gray: 'border-gray-300'
//   }

//   return (
//     <div className="flex items-center justify-center">
//       <div
//         className={`animate-spin rounded-full border-2 border-t-transparent ${sizeClasses[size]} ${colorClasses[color]}`}
//       />
//     </div>
//   )
// }

// export const FullPageLoader = ({ message = 'Loading...' }) => {
//   return (
//     <div className="min-h-screen bg-black flex items-center justify-center">
//       <div className="text-center">
//         <LoadingSpinner size="xl" color="logocolor" />
//         <p className="text-white mt-4 font-normaltext">{message}</p>
//       </div>
//     </div>
//   )
// }

// export const ButtonLoader = () => {
//   return <LoadingSpinner size="sm" color="white" />
// }

// export default LoadingSpinner

import React from "react";

// Core Spinner
const LoadingSpinner = ({
  size = "md",
  color = "logocolor",
  thickness = 2,
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  const colorClasses = {
    logocolor: "border-t-logocolor",
    white: "border-t-white",
    gray: "border-t-gray-400",
  };

  return (
    <div className="flex items-center justify-center animate-fadeIn">
      <div
        className={`animate-spin rounded-full ${sizeClasses[size]} border-${thickness} border-gray-200 ${colorClasses[color]}`}
      />
    </div>
  );
};

// Full Page Loader
export const FullPageLoader = ({ message = "Loading..." }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <LoadingSpinner size="xl" color="logocolor" thickness={4} />
        <p className="text-gray-700 text-lg font-normaltext">{message}</p>
      </div>
    </div>
  );
};

// Button Loader
export const ButtonLoader = () => {
  return <LoadingSpinner size="sm" color="white" thickness={2} />;
};

export default LoadingSpinner;
