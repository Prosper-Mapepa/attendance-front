'use client';

import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Logo from '../components/Logo';

export default function PrivacyPolicyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="header-cmu">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Logo size={40} variant="simple" showText={false} className="sm:w-12 sm:h-12" />
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-white">
                  AttendIQ
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => router.push('/')}
                className="btn-cmu-secondary text-sm sm:text-base px-3 sm:px-4 py-1.5 sm:py-2"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-gray-50 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="flex justify-center mb-5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center shadow-md">
              <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8 text-[#8B0000]" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-500">Last updated: December 24, 2025</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 lg:p-10 space-y-5">
          <Section
            title="Information We Collect"
            content={[
              "We collect the following information to provide our attendance tracking services:",
              "• Your name and email address",
              "• Attendance records and class information",
              "• Account information necessary for authentication",
            ]}
          />

          <Section
            title="How We Use Your Information"
            content={[
              "We use your information to:",
              "• Provide attendance tracking services",
              "• Authenticate your account",
              "• Send important notifications",
              "• Improve our services",
            ]}
          />

          <Section
            title="Data Security"
            content={[
              "We take reasonable measures to protect your information. Your data is encrypted and stored securely.",
            ]}
          />

          <Section
            title="Data Sharing"
            content={[
              "We do not sell your personal information. We may share your attendance information with your instructors for academic purposes.",
            ]}
          />

          <Section
            title="Your Rights"
            content={[
              "You can update or delete your account information at any time through the app settings.",
            ]}
          />

          <Section
            title="Contact Us"
            content={[
              "If you have questions about this Privacy Policy, please contact us at mapepapro@gmail.com",
            ]}
          />

          <Section
            title="Changes to This Policy"
            content={[
              "We may update this Privacy Policy from time to time. The last updated date is shown at the top of this page.",
            ]}
          />
        </div>

        {/* Footer Navigation */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-[#8B0000] hover:text-[#A00000] font-medium transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
        </div>
      </div>
    </div>
  );
}

interface SectionProps {
  title: string;
  content: string[];
}

function Section({ title, content }: SectionProps) {
  return (
    <div className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
      <h2 className="text-base sm:text-lg font-bold text-[#8B0000] mb-2.5">{title}</h2>
      <div className="space-y-2">
        {content.map((paragraph, index) => {
          if (paragraph === '') return null;
          return (
            <p 
              key={index} 
              className="text-gray-600 leading-relaxed text-sm sm:text-base"
            >
              {paragraph}
            </p>
          );
        })}
      </div>
    </div>
  );
}

