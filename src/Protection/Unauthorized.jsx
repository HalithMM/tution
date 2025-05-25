import React from 'react';
import { useNavigate } from 'react-router-dom';

export const Unauthorized = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-5 bg-gradient-to-br from-gray-900 to-gray-800 text-white font-sans text-center">
      {/* Animated Lock Icon */}
      <div className="w-24 h-24 md:w-32 md:h-32 bg-red-500 rounded-full flex items-center justify-center mb-8 animate-bounce">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 md:h-16 md:w-16 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      </div>

      {/* Main Content */}
      <h1 className="text-4xl md:text-5xl font-bold mb-4 text-red-400">401 - Access Denied</h1>
      <p className="text-xl md:text-2xl mb-6 max-w-md">
        <span className="inline-block transform -rotate-3 bg-yellow-400 text-gray-900 px-2 py-1 rounded">
          Top Secret!
        </span>{' '}
        You need proper clearance to view this page.
      </p>

      <div className="bg-gray-800 p-6 rounded-lg border-l-4 border-red-500 max-w-md mb-8">
        <div className="flex items-start mb-3">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center mr-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-medium text-red-400">Authentication Required</h3>
            <p className="mt-1 text-gray-300">
              Please login with valid credentials to access this classified information.
            </p>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button 
      onClick={()=>navigate('/')}
      className="px-6 py-3 bg-red-500 hover:bg-red-600 rounded-full font-medium transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50 flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
            clipRule="evenodd"
          />
        </svg>
        Proceed to Login
      </button>

      {/* Fun Easter Egg */}
      <p className="mt-8 text-xs text-gray-500 animate-pulse">
        * This incident will be reported to the proper authorities *
      </p>
    </div>
  );
};