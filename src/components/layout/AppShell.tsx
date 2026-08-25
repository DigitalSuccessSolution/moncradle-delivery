"use client";

import { useState, useEffect } from "react";
import DesktopHeader from "./DesktopHeader";
import MobileHeader from "./MobileHeader";
import MobileBottomNav from "./MobileBottomNav";
import Sidebar from "./Sidebar";
import { requestForToken, setupMessageListener } from "@/lib/firebase";
import toast, { Toaster } from "react-hot-toast";
import { usePathname } from "next/navigation";
interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const pathname = usePathname();
  const hideMobileHeader = pathname === "/notifications" || pathname === "/support" || pathname === "/profile" || pathname === "/terms" || pathname === "/privacy" || (pathname.startsWith("/orders/") && pathname !== "/orders");

  useEffect(() => {
    setIsMounted(true);
    const checkAuth = () => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("moncradel_rider_logged_in");
        setIsLoggedIn(saved === "true");
      }
    };
    checkAuth();

    window.addEventListener("moncradel-login", checkAuth);
    window.addEventListener("moncradel-logout", checkAuth);
    return () => {
      window.removeEventListener("moncradel-login", checkAuth);
      window.removeEventListener("moncradel-logout", checkAuth);
    };
  }, []);

  useEffect(() => {
    if (isLoggedIn && typeof window !== "undefined" && 'Notification' in window && Notification.permission !== 'denied') {
      requestForToken().then(fcmToken => {
        if (fcmToken) {
          const token = localStorage.getItem("moncradel_rider_token");
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
          if (token) {
            fetch(`${apiUrl}/users/profile`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ fcmToken }),
            }).catch(console.error);
          }
        }
      });
      
      setupMessageListener((payload) => {
        const title = payload?.notification?.title || "New Notification";
        const options = {
          body: payload?.notification?.body || "",
          icon: '/logo.png', // or any appropriate icon path
        };

        // Show native browser notification even when app is open
        if ('Notification' in window && Notification.permission === 'granted') {
          const notification = new Notification(title, options);
          
          notification.onclick = function() {
            window.focus();
            window.location.href = '/notifications';
            this.close();
          };
        }
        
        // We can also trigger a custom event if we want the notification bell to update
        window.dispatchEvent(new Event("moncradel-new-notification"));
      });
    }
  }, [isLoggedIn]);

  if (!isMounted) {
    return null;
  }

  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/forgot-password";

  // UNAUTHENTICATED (Logged Out) OR Auth Pages: Full-width landing layout without sidebar
  if (!isLoggedIn || isAuthPage) {
    return (
      <div className="fixed inset-0 h-[100dvh] w-full bg-white flex flex-col overflow-hidden">
        <main className="w-full h-full flex-1 overflow-hidden">{children}</main>
      </div>
    );
  }

  // AUTHENTICATED (Logged In): Fixed Shell — Sidebar & Header never scroll
  return (
    <>
      <div className="h-[100dvh] flex bg-white text-slate-800 antialiased selection:bg-[#A5D8FF] font-sans overflow-hidden">
        {/* Desktop Navigation Sidebar — Fixed column, never scrolls */}
        <div className="hidden lg:flex shrink-0">
          <Sidebar />
        </div>

        {/* Right Column: Header + Scrollable Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header — Fixed at top of content column */}
          <div className="shrink-0 z-30">
            <DesktopHeader />
            {!hideMobileHeader && <MobileHeader />}
          </div>

          {/* Main Content — ONLY this area scrolls */}
          <main className={`flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pb-24 lg:pb-8 ${hideMobileHeader ? 'py-0' : 'py-6'}`}>
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>

        {/* Mobile & Tablet Bottom Navigation Bar */}
        <MobileBottomNav />
        <Toaster position="top-center" />
      </div>
    </>
  );
}
