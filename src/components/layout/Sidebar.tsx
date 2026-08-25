"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  Package,
  Navigation as NavIcon,
  Banknote,
  Bell,
  MessageSquareText,
  User,
  HeartPulse,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ShieldCheck,
  FileText,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Orders", href: "/orders", icon: Package },
    { name: "Earnings", href: "/earnings", icon: Banknote },
    { name: "Notifications", href: "/notifications", icon: Bell },
    { name: "Support", href: "/support", icon: MessageSquareText },
    { name: "Profile", href: "/profile", icon: User },
    { name: "Privacy Policy", href: "/privacy", icon: ShieldCheck },
    { name: "Terms of Service", href: "/terms", icon: FileText },
  ];

  const handleLogout = () => {
    localStorage.removeItem("moncradel_rider_logged_in");
    localStorage.removeItem("moncradel_rider_token");
    localStorage.removeItem("moncradel_rider_user");
    localStorage.removeItem("moncradel_rider_splash_seen");
    document.cookie = "moncradel_rider_token=; path=/; max-age=0";
    window.dispatchEvent(new Event("moncradel-logout"));
    window.location.href = "/";
  };

  return (
    <aside
      className={`h-full bg-white border-r border-slate-200/80 flex flex-col transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-[80px]" : "w-[250px]"
      }`}
    >
      {/* ─── Brand Header ─── */}
      <div
        className={`pt-4 pb-3 shrink-0 border-b border-slate-100 flex items-center ${
          isCollapsed
            ? "justify-center px-2"
            : "justify-between pl-3 pr-2"
        }`}
      >
        {!isCollapsed && (
          <Link href="/" className="flex items-center py-1">
            <Image 
              src="/logo.png" 
              alt="Moncradel Logo" 
              width={180} 
              height={50} 
              className="h-12 w-auto object-contain"
              priority
            />
          </Link>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-slate-900 transition-transform duration-200 hover:scale-125 focus:outline-none cursor-pointer"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* ─── Navigation Links ─── */}
      <nav className="flex-1 overflow-y-auto sidebar-scroll px-3 pt-4 pb-3 overflow-x-hidden">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.name : undefined}
                className={`group flex items-center ${
                  isCollapsed ? "justify-center px-0" : "px-3.5 gap-3"
                } py-2.5 rounded-lg text-[13px] transition-all duration-200 ${
                  isActive
                    ? "bg-[#1E4E70] text-white font-medium shadow-sm"
                    : "text-slate-700 font-medium hover:bg-[#A5D8FF]/15 hover:text-[#1E4E70]"
                }`}
              >
                <Icon
                  className={`w-[18px] h-[18px] shrink-0 transition-colors duration-200 ${
                    isActive
                      ? "text-white/90"
                      : "text-slate-500 group-hover:text-[#1E4E70]"
                  }`}
                />
                {!isCollapsed && (
                  <span className="truncate">{item.name}</span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ─── Footer ─── */}
      <div className="shrink-0 px-3 pb-3 space-y-2">
        {/* Logout */}
        <button
          onClick={handleLogout}
          title={isCollapsed ? "Logout" : undefined}
          className={`w-full flex items-center ${
            isCollapsed ? "justify-center px-0" : "px-3.5 gap-3"
          } py-2.5 rounded-lg text-[13px] text-slate-600 font-medium hover:bg-rose-50 hover:text-rose-600 transition-all duration-200 cursor-pointer`}
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>

      </div>
    </aside>
  );
}
