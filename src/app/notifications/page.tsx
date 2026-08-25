"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCircle2,
  Trash2,
  X,
  Loader2,
  ChevronLeft
} from "lucide-react";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { fetchNotifications, markAsRead, deleteNotification, NotificationItem } from "@/store/slices/notificationSlice";

export default function NotificationsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { items: notifications, loading } = useSelector((state: RootState) => state.notifications);
  
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);

  useEffect(() => {
    setMounted(true);
    dispatch(fetchNotifications());
  }, [dispatch]);

  useEffect(() => {
    if (selectedNotification) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedNotification]);

  // Helper to format date like parent-pwa
  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days >= 1) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hr${hours > 1 ? 's' : ''} ago`;
    return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
  };

  const handleNotifClick = async (notif: NotificationItem) => {
    setSelectedNotification(notif);
    if (!notif.isRead) {
      dispatch(markAsRead(notif._id));
    }
  };

  const markAllAsReadLocally = async () => {
    const unreadNotifications = notifications.filter(n => !n.isRead);
    if (unreadNotifications.length === 0) return;

    try {
      await Promise.all(unreadNotifications.map(n => 
        dispatch(markAsRead(n._id)).unwrap()
      ));
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      dispatch(fetchNotifications());
    }
  };

  const handleDeleteNotification = (id: string) => {
    Swal.fire({
      title: 'Delete this notification?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1E4E70',
      cancelButtonColor: '#f43f5e',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      backdrop: 'rgba(15, 23, 42, 0.4)',
      customClass: {
        popup: 'rounded-3xl',
        title: 'text-lg font-semibold text-slate-800',
        confirmButton: 'rounded-xl font-medium shadow-sm',
        cancelButton: 'rounded-xl font-medium',
        container: 'backdrop-blur-sm'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await dispatch(deleteNotification(id)).unwrap();
          if (selectedNotification?._id === id) {
             setSelectedNotification(null);
          }
        } catch (error) {
           Swal.fire('Error', 'Failed to delete notification', 'error');
        }
      }
    });
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const allCount = notifications.length;

  const filteredNotifications = notifications.filter(notif =>
    (activeTab === "all" ? true : !notif.isRead)
  );

  // Group by date (like parent-pwa)
  const groupedNotifications = filteredNotifications.reduce((acc, notif) => {
    const date = new Date(notif.createdAt);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    let group = "Older";
    if (date.toDateString() === today.toDateString()) group = "Today";
    else if (date.toDateString() === yesterday.toDateString()) group = "Yesterday";

    if (!acc[group]) acc[group] = [];
    acc[group].push(notif);
    return acc;
  }, {} as Record<string, NotificationItem[]>);

  const groupOrder = ["Today", "Yesterday", "Older"];

  return (
    <div className="md:bg-white min-h-screen font-sans -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-0 md:py-8 pb-24 md:pb-8">
      <div className="max-w-[1200px] mx-auto">
        
        {/* Mobile Sticky Header (Visible only on Mobile) */}
        <div className="md:hidden sticky top-0 z-40 bg-white flex items-center py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 mb-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#111827]"
          >
            <ChevronLeft className="w-6 h-6" />
            <span className="text-[17px] sm:text-[18px] font-medium text-[#111827]">Notifications</span>
          </button>
        </div>



        {/* Desktop Page Header */}
        <div className="hidden md:flex flex-col mb-4 px-1 lg:mb-6">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-900">Notifications</h1>
          <p className="text-sm md:text-base lg:text-lg text-gray-500 font-medium mt-1 lg:mt-2">Real-time updates for your deliveries.</p>
        </div>

        {/* Filters and Mark Read */}
        <div className="flex flex-row items-center justify-between mb-6 md:mb-8">
          <div className="flex gap-2 sm:gap-4">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex items-center gap-2 sm:gap-3 pl-4 sm:pl-5 pr-1 sm:pr-1.5 py-1.5 rounded-full text-sm sm:text-[15px] font-medium transition-all ${activeTab === "all" ? "bg-[#1E4E70]/10 text-[#1E4E70]" : "bg-white md:bg-[#F3F4F6] text-gray-500 border border-gray-200 md:border-0"
                }`}
            >
              All
              <span className={`flex items-center justify-center min-w-[24px] sm:min-w-[28px] h-6 sm:h-7 rounded-full text-[11px] sm:text-xs font-semibold px-2 ${activeTab === "all" ? "bg-[#1E4E70]/70 text-white" : "bg-gray-400/80 text-white"
                }`}>
                {allCount}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("unread")}
              className={`flex items-center gap-2 sm:gap-3 pl-4 sm:pl-5 pr-1 sm:pr-1.5 py-1.5 rounded-full text-sm sm:text-[15px] font-medium transition-all ${activeTab === "unread" ? "bg-[#1E4E70]/10 text-[#1E4E70]" : "bg-white md:bg-[#F3F4F6] text-gray-500 border border-gray-200 md:border-0"
                }`}
            >
              Unread
              <span className={`flex items-center justify-center min-w-[24px] sm:min-w-[28px] h-6 sm:h-7 rounded-full text-[11px] sm:text-xs font-semibold px-2 ${activeTab === "unread" ? "bg-[#1E4E70]/70 text-white" : "bg-gray-400/80 text-white"
                }`}>
                {unreadCount}
              </span>
            </button>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsReadLocally}
              disabled={loading}
              className="text-sm sm:text-[15px] font-medium text-[#1E4E70]/80 hover:text-[#1E4E70] transition-colors whitespace-nowrap"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="md:bg-white md:rounded-2xl md:border md:border-gray-100 md:shadow-sm overflow-hidden">
          {loading ? (
            <div className="px-5 md:px-8 pt-8 animate-pulse">
              <div className="w-24 h-6 bg-gray-200 rounded mb-6"></div>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4 py-4">
                  <div className="w-12 h-12 flex-shrink-0 rounded-full bg-gray-100"></div>
                  <div className="flex-1 min-w-0">
                    <div className="w-1/2 h-5 bg-gray-200 rounded mb-2"></div>
                    <div className="w-3/4 h-4 bg-gray-100 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="py-12 sm:py-16 md:py-20 px-6 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gray-100/60 rounded-full flex items-center justify-center mb-4 sm:mb-5 md:mb-6">
                <Bell className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-400" />
              </div>
              <h3 className="text-base sm:text-[17px] md:text-xl font-semibold text-[#2a2d3a] mb-1.5 md:mb-2">No notifications yet</h3>
              <p className="text-xs sm:text-[14px] md:text-base text-gray-500 max-w-[200px] sm:max-w-[250px] md:max-w-[300px] mx-auto">When you get updates about your deliveries, they'll show up here.</p>
            </div>
          ) : (
            <div className="px-3 sm:px-5 md:px-6 pt-2 sm:pt-4 pb-4">
              {groupOrder.map(group => {
                if (!groupedNotifications[group] || groupedNotifications[group].length === 0) return null;
                return (
                  <div key={group} className="mb-6 sm:mb-8 last:mb-2">
                    <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-[#444a56] mb-3 sm:mb-4 px-1">{group}</h2>
                    <div className="flex flex-col gap-2">
                      {groupedNotifications[group].map((notif) => (
                        <div
                          key={notif._id}
                          onClick={() => handleNotifClick(notif)}
                          className="flex items-center gap-3 sm:gap-4 py-3 sm:py-4 px-1 sm:px-2 cursor-pointer transition-all hover:bg-gray-50 active:scale-[0.98] rounded-xl"
                        >
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex-shrink-0 rounded-full flex items-center justify-center bg-[#1E4E70]/10 text-[#1E4E70]`}>
                            <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>

                          <div className="flex-1 min-w-0 pr-2">
                            <div className="flex justify-between items-start">
                              <h3 className="text-sm sm:text-[15px] md:text-[16px] lg:text-lg font-medium text-[#2a2d3a] truncate pr-2">
                                {notif.title}
                              </h3>
                              {!notif.isRead && (
                                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#1E4E70]/70 rounded-full flex-shrink-0 mt-1 sm:mt-1.5 md:mt-2"></div>
                              )}
                            </div>
                            <div className="flex justify-between items-center mt-0.5 sm:mt-1 md:mt-1.5">
                              <p className="text-xs sm:text-[13px] md:text-[14px] lg:text-base text-gray-500 truncate pr-2 sm:pr-3">
                                {notif.message}
                              </p>
                              <span className="text-[10px] sm:text-[11px] md:text-[12px] lg:text-sm text-gray-400 whitespace-nowrap flex-shrink-0 font-medium">
                                {formatTimeAgo(notif.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Notification Modal / Bottom Sheet */}
      <AnimatePresence>
        {mounted && selectedNotification && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNotification(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 md:inset-0 md:m-auto w-full md:w-[500px] lg:w-[600px] h-fit max-h-[90vh] bg-white rounded-t-3xl md:rounded-3xl p-5 sm:p-6 md:p-8 z-[101] flex flex-col gap-3 md:gap-4 shadow-2xl overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center bg-[#1E4E70]/10 text-[#1E4E70]">
                  <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              <div className="mt-2 sm:mt-3">
                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-black mb-1 sm:mb-2 leading-tight">{selectedNotification.title}</h2>
                <span className="text-xs sm:text-sm md:text-[15px] font-semibold text-gray-500">
                  {new Date(selectedNotification.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
                <p className="mt-3 sm:mt-4 md:mt-5 text-sm sm:text-base md:text-lg leading-relaxed text-gray-700">
                  {selectedNotification.message}
                </p>
              </div>

              <button 
                onClick={() => handleDeleteNotification(selectedNotification._id)}
                className="mt-3 sm:mt-4 md:mt-5 w-full text-center text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl font-medium text-[15px] sm:text-[16px] py-3 sm:py-3.5 transition-colors flex justify-center items-center gap-2 border border-rose-100"
              >
                <Trash2 className="w-5 h-5" /> Delete Notification
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
