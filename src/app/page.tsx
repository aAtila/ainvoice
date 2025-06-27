import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function Home() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              AInvoice Dashboard
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {user.email}
              </span>
              <form action="/api/auth/logout" method="POST" className="inline">
                <button
                  type="submit"
                  className="text-sm text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Welcome to AInvoice
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You&apos;re successfully logged in! This is a placeholder dashboard. 
            The full dashboard with invoicing features will be implemented in the next steps.
          </p>
          
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-medium text-gray-900 dark:text-white">
                Your Account Details
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Email: {user.email}
              </p>
              {user.companyName && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Company: {user.companyName}
                </p>
              )}
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-medium text-gray-900 dark:text-white">
                Next Steps
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Main application layout with sidebar navigation</li>
                <li>• Client management system</li>
                <li>• Invoice creation and management</li>
                <li>• Time tracking features</li>
                <li>• Reporting and analytics</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
