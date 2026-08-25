"use client";

import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PrivacyPolicyPage() {
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
          <span className="text-[17px] sm:text-[18px] font-medium text-[#111827]">Privacy Policy</span>
        </button>
      </div>



      {/* Desktop Page Header */}
      <div className="hidden md:flex flex-col mb-4 px-1 lg:mb-8">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm md:text-base lg:text-lg text-gray-500 font-medium">Last updated: August 19, 2026</p>
      </div>

        {/* Content */}
      <div className="space-y-8 mt-2">
        <p className="text-[#1E4E70] text-[15px] sm:text-base leading-relaxed">
          Welcome to Moncradle! We are deeply committed to protecting your privacy and ensuring the security of the personal information you share with us. This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you use the Moncradle Delivery Partner App.
        </p>

        <div>
          <h2 className="text-lg sm:text-xl font-medium text-gray-900 mb-3 tracking-tight">1. Information We Collect</h2>
          <p className="text-gray-600 text-[15px] leading-relaxed mb-3">
            We collect information that you provide directly to us when you register as a delivery partner, go online to accept orders, or communicate with our support team. This includes:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-gray-600 text-[15px]">
            <li><strong>Personal Information:</strong> Your name, email address, phone number, and password.</li>
            <li><strong>Vehicle & Identification Data:</strong> Driver's license, vehicle registration, background check information, and vehicle details.</li>
            <li><strong>Location Data:</strong> We collect precise or approximate location data from your mobile device when the app is running in the foreground or background to enable order dispatching and live tracking for customers.</li>
            <li><strong>Financial Information:</strong> Bank account details for processing your earnings and payouts.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg sm:text-xl font-medium text-gray-900 mb-3 tracking-tight">2. How We Use Your Information</h2>
          <p className="text-gray-600 text-[15px] leading-relaxed mb-3">
            The data we collect is used strictly to provide and improve the delivery experience. Specifically, we use your information to:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-gray-600 text-[15px]">
            <li>Dispatch delivery orders to you efficiently based on your location.</li>
            <li>Allow customers and vendors to track the status of their deliveries in real-time.</li>
            <li>Calculate your earnings, process payments, and provide financial reports.</li>
            <li>Maintain, operate, and secure your account and data.</li>
            <li>Send you important administrative notifications, order updates, and support messages.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg sm:text-xl font-medium text-gray-900 mb-3 tracking-tight">3. Location Tracking</h2>
          <p className="text-gray-600 text-[15px] leading-relaxed">
            Given the nature of the delivery service, real-time location tracking is essential. You can control location permissions through your device settings, but disabling location access will prevent you from receiving and fulfilling orders.
          </p>
        </div>

        <div>
          <h2 className="text-lg sm:text-xl font-medium text-gray-900 mb-3 tracking-tight">4. Data Sharing & Disclosure</h2>
          <p className="text-gray-600 text-[15px] leading-relaxed mb-3">
            We share your information only to facilitate the delivery process:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-gray-600 text-[15px]">
            <li><strong>With Customers and Vendors:</strong> Your first name, photo, vehicle type, and real-time location are shared with the customer and vendor during an active delivery.</li>
            <li><strong>Service Providers:</strong> We use trusted third-party providers (e.g., payment processors, background check agencies) who are bound by strict data processing agreements.</li>
            <li><strong>Legal Requirements:</strong> If required by law, subpoena, or other legal processes.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg sm:text-xl font-medium text-gray-900 mb-3 tracking-tight">5. Data Security</h2>
          <p className="text-gray-600 text-[15px] leading-relaxed">
            We implement robust physical, technical, and administrative security measures to protect your data from unauthorized access, disclosure, or destruction. However, please be aware that no method of transmission over the internet is 100% secure.
          </p>
        </div>

        <div className="pb-8">
          <h2 className="text-lg sm:text-xl font-medium text-gray-900 mb-3 tracking-tight">6. Contact Us</h2>
          <p className="text-gray-600 text-[15px] leading-relaxed">If you have any questions or concerns about this Privacy Policy or how your data is handled, please contact our support team at:</p>
          <a href="mailto:delivery-support@moncradle.com" className="inline-block mt-2 font-medium text-[#1E4E70]">
            delivery-support@moncradle.com
          </a>
        </div>
      </div>
    </div>
  );
}
