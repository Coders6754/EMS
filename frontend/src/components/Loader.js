import React from 'react';

const Loader = ({ message = 'Processing...', fullScreen = false, size = 'lg' }) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-20 w-20'
  };

  const containerClass = fullScreen 
    ? 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm'
    : 'flex items-center justify-center p-4';

  return (
    <div className={containerClass}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className={`${sizeClasses[size]} border-4 border-purple-200 rounded-full animate-spin`}></div>
            <div className={`${sizeClasses[size]} border-4 border-t-purple-600 border-r-purple-600 rounded-full animate-spin absolute top-0 left-0`} style={{ animationDuration: '0.8s' }}></div>
            <div className={`${sizeClasses[size]} bg-purple-600 rounded-full absolute top-0 left-0 flex items-center justify-center`}>
              <div className="h-2 w-2 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-gray-800 font-semibold text-lg">{message}</p>
          <p className="text-gray-500 text-sm">Please wait while we process your request...</p>
        </div>
        
        <div className="flex justify-center space-x-1 mt-4">
          <div className="h-2 w-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="h-2 w-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="h-2 w-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export const InlineLoader = ({ size = 'sm' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <div className="inline-flex items-center justify-center">
      <div className={`${sizeClasses[size]} border-2 border-white border-t-transparent rounded-full animate-spin`}></div>
    </div>
  );
};

export const ButtonLoader = () => {
  return (
    <div className="inline-flex items-center space-x-2">
      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      <span>Processing...</span>
    </div>
  );
};

export default Loader;
