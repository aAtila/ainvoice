'use client';

import { useRouter } from 'next/navigation';
import AuthForm from '@/components/auth/AuthForm';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = async (data: { email: string; password: string }) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Login failed');
    }

    // Redirect to dashboard on success
    router.push('/');
    router.refresh();
  };

  return (
    <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
      <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
        Sign in to your account
      </h2>
      <AuthForm mode="login" onSubmit={handleLogin} />
      
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              Demo credentials
            </span>
          </div>
        </div>
        <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          Email: <span className="font-mono">demo@ainvoice.com</span>
          <br />
          Password: <span className="font-mono">demo123</span>
        </div>
      </div>
    </div>
  );
}