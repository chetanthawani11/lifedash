import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to LifeDash
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Your personal dashboard for life management
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/auth" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Get Started
          </Link>
          <button className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
}
