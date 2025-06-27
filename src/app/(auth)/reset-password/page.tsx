'use client';

import { useState } from 'react';
import AuthForm from '@/components/auth/AuthForm';

export default function ResetPasswordPage() {
  const [success, setSuccess] = useState(false);

  const handleReset = async () => {
    // In a real implementation, this would send a password reset email
    // For now, we'll just simulate success
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
            Check your email
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            If an account exists with that email, we&apos;ve sent password reset instructions.
          </p>
          <a
            href="/login"
            className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Back to sign in
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
      <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
        Reset your password
      </h2>
      <p className="text-sm text-center text-gray-600 dark:text-gray-400 mb-6">
        Enter your email address and we&apos;ll send you a link to reset your password.
      </p>
      <AuthForm mode="reset" onSubmit={handleReset} />
      
      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
        <p className="text-sm text-yellow-800 dark:text-yellow-400">
          <strong>Note:</strong> Password reset functionality requires email service configuration. 
          For now, use the demo credentials to sign in.
        </p>
      </div>
    </div>
  );
}