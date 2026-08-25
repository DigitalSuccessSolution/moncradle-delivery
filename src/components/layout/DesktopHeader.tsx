"use client";

import Link from "next/link";
import Image from "next/image";
import { Bell, Search, Bike } from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { fetchNotifications } from "@/store/slices/notificationSlice";
import { setOnlineStatus } from "@/store/slices/appSlice";

export default function DesktopHeader() {
  const dispatch = useDispatch<AppDispatch>();
  const unreadCount = useSelector((state: RootState) => state.notifications.unreadCount);
  const isOnline = useSelector((state: RootState) => state.app.isOnline);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [fullName, setFullName] = useState("Rider");
  const [avatar, setAvatar] = useState("/delivery_boy_hero.png");

  // Custom Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(true);

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
            if (parsed.name) {
              setFullName(parsed.name);
            }
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

  const handleToggleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPendingStatus(!isOnline);
    setShowConfirmModal(true);
  };

  const confirmToggleStatus = () => {
    const newStatus = pendingStatus;
    dispatch(setOnlineStatus(newStatus));
    setShowConfirmModal(false);
  };

  if (!isLoggedIn) return null;

  return (
    <header className="hidden md:flex sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/60 px-6 lg:px-8 py-3.5 transition-all w-full items-center justify-between">
      {/* Left: Global Search or Context */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search orders, areas, or customers..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-[14px] font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#A5D8FF]/50 transition-all"
          />
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-4">
        {/* Online Toggle */}
        <button 
          onClick={handleToggleClick}
          className={`relative w-11 h-6 rounded-full transition-colors flex items-center px-1 cursor-pointer shadow-inner ${isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`}
        >
          <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${isOnline ? 'translate-x-5 shadow-sm' : 'translate-x-0'}`} />
        </button>

        <Link
          href="/notifications"
          className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors flex items-center justify-center"
          title="View Notifications"
        >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white px-1">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

        <Link href="/profile" className="flex items-center gap-3 hover:bg-slate-50 p-1.5 rounded-xl transition-colors pr-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100">
            <Image
              src={avatar}
              alt="Rider Profile"
              width={40}
              height={40}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="flex flex-col">
            <h2 className="font-semibold text-slate-900 text-[15px] leading-tight truncate max-w-[130px]">
              Hi, {fullName.split(' ')[0]}
            </h2>
            <p className={`text-[12px] font-medium mt-0.5 ${isOnline ? 'text-emerald-600' : 'text-slate-500'}`}>
              {isOnline ? '● Online' : '● Offline'}
            </p>
          </div>
        </Link>
      </div>

      {/* CUSTOM CONFIRMATION MODAL */}
      {showConfirmModal && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-opacity">
          <div 
            className="bg-white rounded-3xl shadow-2xl w-full max-w-[340px] p-6 text-center transform transition-all relative overflow-hidden"
            style={{ animation: 'modal-pop 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            {/* Decorator background shape */}
            <div className={`absolute -top-16 -right-16 w-32 h-32 rounded-full opacity-10 ${pendingStatus ? 'bg-emerald-500' : 'bg-slate-500'}`}></div>

            <div className={`relative w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-5 ${pendingStatus ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-500'}`}>
              <Bike className="w-8 h-8" strokeWidth={2.5} />
            </div>
            
            <h3 className="text-[20px] font-semibold text-slate-900 mb-2.5">
              {pendingStatus ? "You're going Online" : "Going Offline?"}
            </h3>
            
            <p className="text-[14px] font-medium text-slate-500 leading-relaxed mb-7 px-1">
              {pendingStatus 
                ? "Get ready! You will start receiving delivery requests right away." 
                : "You won't receive new delivery requests until you're back."}
            </p>
            
            <div className="flex flex-col gap-3 relative z-10">
              <button 
                onClick={confirmToggleStatus} 
                className={`w-full py-3.5 rounded-2xl text-[15px] font-semibold text-white transition-all active:scale-95 ${pendingStatus ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-slate-800 hover:bg-slate-900'}`}
              >
                {pendingStatus ? "Yes, Go Online" : "Yes, Go Offline"}
              </button>
              
              <button 
                onClick={() => setShowConfirmModal(false)} 
                className="w-full py-3.5 rounded-2xl text-[15px] font-semibold text-slate-600 bg-slate-100/80 hover:bg-slate-200 transition-all active:scale-95"
              >
                Keep Current Status
              </button>
            </div>
          </div>
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes modal-pop {
              0% { opacity: 0; transform: scale(0.9) translateY(15px); }
              100% { opacity: 1; transform: scale(1) translateY(0); }
            }
          `}} />
        </div>,
        document.body
      )}
    </header>
  );
}
