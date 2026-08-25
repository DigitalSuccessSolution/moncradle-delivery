"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ClipboardList,
  Wallet,
  User,
  MapPin,
} from "lucide-react";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkAuth = () => {
        const saved = localStorage.getItem("moncradel_rider_logged_in");
        setIsLoggedIn(saved === "true");
      };
      checkAuth();
      window.addEventListener("moncradel-login", checkAuth);
      window.addEventListener("moncradel-logout", checkAuth);
      return () => {
        window.removeEventListener("moncradel-login", checkAuth);
        window.removeEventListener("moncradel-logout", checkAuth);
      };
    }
  }, []);

  if (!isLoggedIn) return null;

  // Mobile Bottom Navigation — 5 main tabs
  const mobileNavItems = [
    { name: "Home", href: "/", icon: Home, activeBg: "bg-blue-100" },
    { name: "Orders", href: "/orders", icon: ClipboardList, activeBg: "bg-emerald-100" },
    { name: "Earnings", href: "/earnings", icon: Wallet, activeBg: "bg-amber-100" },
    { name: "Account", href: "/account", icon: User, activeBg: "bg-purple-100" },
  ];

  // Only show bottom nav on main 4 tab routes
  const isMainTabRoute = ["/", "/orders", "/earnings", "/account"].includes(pathname);

  if (!isMainTabRoute) {
    return null;
  }

  return (
    <nav className="md:hidden fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-4 right-4 z-40">
      <div className="max-w-md mx-auto bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 flex items-center justify-between px-3 py-2">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-center rounded-full transition-all duration-500 ease-out ${isActive
                  ? `${item.activeBg} text-[#1E4E70] px-5 h-[46px]`
                  : "bg-transparent text-slate-500 hover:bg-slate-50 w-[46px] h-[46px]"
                }`}
            >
              <Icon className={`w-5 h-5 shrink-0 transition-transform duration-500 ${isActive ? "scale-110 stroke-[2]" : "scale-100 stroke-[2]"}`} />
              <span
                className={`text-[13px] font-semibold tracking-wide whitespace-nowrap transition-all duration-500 overflow-hidden ${isActive ? "max-w-[100px] opacity-100 ml-2.5" : "max-w-0 opacity-0 ml-0"
                  }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
