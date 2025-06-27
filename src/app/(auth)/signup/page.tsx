'use client';

import { useRouter } from 'next/navigation';
import AuthForm from '@/components/auth/AuthForm';

export default function SignupPage() {
  const router = useRouter();

  const handleSignup = async (data: {
    email: string;
    password: string;
    confirmPassword: string;
    companyName?: string;
  }) => {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Signup failed');
    }

    // Redirect to dashboard on success
    router.push('/');
    router.refresh();
  };

  return (
    <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
      <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
        Create your account
      </h2>
      <AuthForm mode="signup" onSubmit={handleSignup} />
    </div>
  );
}