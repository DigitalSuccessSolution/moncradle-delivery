"use client";

import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function TermsOfServicePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen font-sans pb-24 md:pb-8 pt-0 md:pt-8 max-w-5xl mx-auto">
      {/* Mobile Sticky Header (Visible only on Mobile) */}
      <div className="md:hidden sticky top-0 z-40 bg-white flex items-center py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 mb-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#111827]"
        >
          <ChevronLeft className="w-6 h-6" />
          <span className="text-[17px] sm:text-[18px] font-medium text-[#111827]">Terms of Service</span>
        </button>
      </div>



      {/* Desktop Page Header */}
      <div className="hidden md:flex flex-col mb-4 px-1 lg:mb-8">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-sm md:text-base lg:text-lg text-gray-500 font-medium">Last updated: August 19, 2026</p>
      </div>

        {/* Content */}
      <div className="space-y-8 mt-2">
        <p className="text-[#1E4E70] text-[15px] sm:text-base leading-relaxed">
          Welcome to Moncradle! By accessing or using our Delivery Partner mobile application, website, and related services (collectively, the "Services"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Services.
        </p>

        <div>
          <h2 className="text-lg sm:text-xl font-medium text-gray-900 mb-3 tracking-tight">1. Acceptance of Terms</h2>
          <p className="text-gray-600 text-[15px] leading-relaxed">
            These Terms form a legally binding contract between you and Moncradle. By registering for a delivery partner account or using the app, you represent that you are at least 18 years old, have a valid driver's license (if applicable), and have the legal capacity to agree to these Terms.
          </p>
        </div>

        <div>
          <h2 className="text-lg sm:text-xl font-medium text-gray-900 mb-3 tracking-tight">2. Independent Contractor Status</h2>
          <p className="text-gray-600 text-[15px] leading-relaxed">
            You acknowledge and agree that your relationship with Moncradle is that of an independent contractor. Nothing in these Terms creates an employment, partnership, or agency relationship between you and Moncradle. You have complete discretion over when and how long you use the App to accept delivery requests.
          </p>
        </div>

        <div>
          <h2 className="text-lg sm:text-xl font-medium text-gray-900 mb-3 tracking-tight">3. Service Obligations</h2>
          <p className="text-gray-600 text-[15px] leading-relaxed mb-3">When accepting delivery requests, you agree to:</p>
          <ul className="list-disc pl-5 space-y-2 text-gray-600 text-[15px]">
            <li>Pick up orders promptly and deliver them safely to the customer's specified location.</li>
            <li>Handle all food items with care and maintain appropriate hygiene and safety standards.</li>
            <li>Use a reliable vehicle that is properly registered and insured in accordance with local laws.</li>
            <li>Maintain professional and courteous communication with vendors and customers.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg sm:text-xl font-medium text-gray-900 mb-3 tracking-tight">4. App Usage & Content</h2>
          <p className="text-gray-600 text-[15px] leading-relaxed mb-3">
            Moncradle grants you a personal, non-exclusive, non-transferable, and revocable license to use the Services for the purpose of receiving and fulfilling delivery requests. You agree not to:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-gray-600 text-[15px]">
            <li>Modify, copy, distribute, or reverse engineer the App or any of its contents.</li>
            <li>Use the Services for any illegal or unauthorized purpose.</li>
            <li>Manipulate the GPS location or provide false information regarding delivery statuses.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg sm:text-xl font-medium text-gray-900 mb-3 tracking-tight">5. Payment and Earnings</h2>
          <p className="text-gray-600 text-[15px] leading-relaxed">
            Your earnings are calculated based on the successful completion of deliveries, subject to Moncradle's current payment policies. Payouts are processed on a scheduled basis. Moncradle reserves the right to adjust earnings in the event of fraud, customer complaints, or failure to complete a delivery properly.
          </p>
        </div>

        <div>
          <h2 className="text-lg sm:text-xl font-medium text-gray-900 mb-3 tracking-tight">6. Limitation of Liability</h2>
          <p className="text-gray-600 text-[15px] leading-relaxed">
            To the maximum extent permitted by law, Moncradle and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your access to or use of or inability to access or use the Services.
          </p>
        </div>

        <div>
          <h2 className="text-lg sm:text-xl font-medium text-gray-900 mb-3 tracking-tight">7. Changes to Terms</h2>
          <p className="text-gray-600 text-[15px] leading-relaxed">
            We may modify these Terms at any time. We will provide notice of significant changes by updating the date at the top of this page or by sending you an email notification. Your continued use of the Services after such changes constitutes your acceptance of the new Terms.
          </p>
        </div>

        <div className="pb-8">
          <h2 className="text-lg sm:text-xl font-medium text-gray-900 mb-3 tracking-tight">8. Contact Information</h2>
          <p className="text-gray-600 text-[15px] leading-relaxed">If you have any questions about these Terms, please contact us at:</p>
          <a href="mailto:legal@moncradle.com" className="inline-block mt-2 font-medium text-[#1E4E70]">
            legal@moncradle.com
          </a>
        </div>
      </div>
    </div>
  );
}
