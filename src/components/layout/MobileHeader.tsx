"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Bell, ArrowLeft, Bike, Phone } from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { fetchNotifications } from "@/store/slices/notificationSlice";
import { setOnlineStatus } from "@/store/slices/appSlice";

export default function MobileHeader() {
  const pathname = usePathname();
  const router = useRouter();

  const dispatch = useDispatch<AppDispatch>();
  const unreadCount = useSelector((state: RootState) => state.notifications.unreadCount);
  const isOnline = useSelector((state: RootState) => state.app.isOnline);

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [fullName, setFullName] = useState("Rider");
  const [avatar, setAvatar] = useState("/delivery_boy_hero.png");
  const [greeting, setGreeting] = useState("Good Morning");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchNotifications());
    }
  }, [dispatch, isLoggedIn]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkAuth = () => {
        const saved = localStorage.getItem("moncradel_rider_logged_in");
        setIsLoggedIn(saved === "true");

        // Load profile data
        const savedUser = localStorage.getItem("moncradel_rider_user");
        if (savedUser) {
          try {
            const parsed = JSON.parse(savedUser);
            if (parsed.name) setFullName(parsed.name);
            if (parsed.avatar) setAvatar(parsed.avatar);
          } catch(e) {}
        }
      };
      
      checkAuth();
      
      const handleStorage = () => {
        checkAuth();
        const status = localStorage.getItem("moncradel_rider_online");
        if (status !== null) {
          dispatch(setOnlineStatus(status === "true"));
        }
      };
      
      window.addEventListener("moncradel-login", checkAuth);
      window.addEventListener("moncradel-logout", checkAuth);
      window.addEventListener("storage", handleStorage);
      window.addEventListener("moncradel-profile-updated", checkAuth);
      
      return () => {
        window.removeEventListener("moncradel-login", checkAuth);
        window.removeEventListener("moncradel-logout", checkAuth);
        window.removeEventListener("storage", handleStorage);
        window.removeEventListener("moncradel-profile-updated", checkAuth);
      };
    }
  }, []);

  if (!isLoggedIn) return null;
  if (pathname === "/account" || pathname === "/profile") return null;

  const isMainTabRoute = ["/", "/orders", "/map", "/earnings", "/profile", "/notifications", "/support"].includes(pathname);

  const getSubpageTitle = (path: string) => {
    if (path.startsWith("/profile/edit")) return "Edit Profile";
    if (path.startsWith("/orders/")) return "Order Details";
    return "Partner Portal";
  };

  // INNER SUBPAGE HEADER: Back Arrow + Page Title (Only visible on mobile md:hidden)
  if (!isMainTabRoute) {
    return (
      <header className="md:hidden sticky top-0 z-30 bg-white px-4 py-3.5 transition-all w-full">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#1E4E70] transition-colors cursor-pointer active:scale-95 flex items-center justify-center"
              title="Go Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-semibold text-slate-900 text-base tracking-tight truncate max-w-[200px]">
              {getSubpageTitle(pathname)}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => alert("Connecting to Support...")}
              className="flex items-center justify-center bg-[#FFD1DC]/30 text-[#1E4E70] hover:bg-[#FFD1DC]/60 px-3 py-1.5 rounded-xl border border-[#FFD1DC] transition-colors shadow-xs"
            >
              <Phone className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>
    );
  }

  // MAIN TAB HEADER (Mobile)
  return (
    <header className="md:hidden sticky top-0 z-30 bg-white px-4 py-3.5 transition-all w-full">
      <div className="flex items-center justify-between">
        
        {/* Left: Profile & Name */}
        <div className="flex items-center gap-3.5">
          <Link href="/profile" className="relative cursor-pointer block active:scale-95 transition-transform shrink-0">
            <div className="w-[46px] h-[46px] rounded-full overflow-hidden bg-slate-100 border border-slate-200">
              <Image
                src={avatar}
                alt="Rider Profile"
                width={46}
                height={46}
                className="object-cover w-full h-full"
              />
            </div>
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
            )}
          </Link>
          <div className="flex flex-col">
            <p className="text-[13px] font-medium text-slate-500 mb-0.5">
              {greeting}, 👋
            </p>
            <h2 className="font-medium text-slate-900 text-[17px] leading-none tracking-tight truncate max-w-[150px]">
              {fullName}
            </h2>
          </div>
        </div>

        {/* Right: Actions */}
        <Link
          href="/notifications"
          className="relative p-2 text-slate-700 hover:bg-slate-50 rounded-full transition-colors flex items-center justify-center cursor-pointer -mr-2"
        >
          <Bell className="w-6 h-6 stroke-[1.5]" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white px-1">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>
        
      </div>
    </header>
  );
}
