export default async function DashboardPage() {
  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Dashboard
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Total Revenue
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            $0.00
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            This month
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Active Invoices
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            0
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            Pending payment
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Total Clients
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            0
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            Active clients
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Time Tracked
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            0h
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            This week
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Activity
          </h2>
        </div>
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-400 text-center py-8">
            No recent activity. Start by creating your first invoice or adding a client.
          </p>
        </div>
      </div>
    </>
  );
}
