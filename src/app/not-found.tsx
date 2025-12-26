import Link from 'next/link';
import Logo from './components/Logo';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        <div className="flex justify-center mb-6">
          <Logo size={64} variant="simple" showText={false} className="sm:w-24 sm:h-24" />
        </div>
        
        <h1 className="text-5xl sm:text-6xl font-bold text-cmu-maroon mb-4">404</h1>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Page Not Found</h2>
        <p className="text-sm sm:text-base text-gray-600 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        
        <Link
          href="/"
          className="btn-cmu-primary inline-flex items-center px-6 py-3 text-sm sm:text-base font-medium"
        >
          Return to AttendIQ
        </Link>
      </div>
    </div>
  );
}
