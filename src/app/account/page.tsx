"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { User, Bell, MessageSquareText, LogOut, ChevronRight, ChevronLeft } from "lucide-react";
import Swal from "sweetalert2";

export default function AccountPage() {
  const router = useRouter();
  
  const [fullName, setFullName] = useState("Rider Vikram Singh");
  const [avatar, setAvatar] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Quick load from cache for immediate UI
    const savedUser = localStorage.getItem("moncradel_rider_user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.name) setFullName(parsed.name);
        if (parsed.avatar) setAvatar(parsed.avatar);
      } catch(e) {}
    }

    // Fetch fresh from backend
    const fetchFreshData = async () => {
      try {
        const token = localStorage.getItem("moncradel_rider_token");
        if (!token) return;
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${API_URL}/users/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.user) {
          if (data.user.name) setFullName(data.user.name);
          if (data.user.avatar) setAvatar(data.user.avatar);
          // Update cache
          localStorage.setItem("moncradel_rider_user", JSON.stringify(data.user));
        }
      } catch (err) {
        console.error("Failed to fetch fresh user data", err);
      }
    };
    
    fetchFreshData();
  }, []);

  const handleLogout = () => {
    Swal.fire({
      title: 'Logout?',
      text: "Are you sure you want to end your session?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1E4E70',
      cancelButtonColor: '#f43f5e',
      confirmButtonText: 'Yes, Logout',
      backdrop: 'rgba(15, 23, 42, 0.4)',
      customClass: {
        popup: 'rounded-3xl',
        confirmButton: 'rounded-xl font-medium shadow-sm',
        cancelButton: 'rounded-xl font-medium',
        container: 'backdrop-blur-sm'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("moncradel_rider_logged_in");
        localStorage.removeItem("moncradel_rider_token");
        localStorage.removeItem("moncradel_rider_user");
        localStorage.removeItem("moncradel_rider_splash_seen");
        document.cookie = "moncradel_rider_token=; path=/; max-age=0";
        window.dispatchEvent(new Event("moncradel-logout"));
        window.location.href = "/";
      }
    });
  };

  const menuItems = [
    { name: "My Profile", href: "/profile", icon: User },
    { name: "Notifications", href: "/notifications", icon: Bell },
    { name: "Help & Support", href: "/support", icon: MessageSquareText },
  ];

  if (!mounted) return null;

  return (
    <div className="md:hidden fixed inset-0 z-50 flex flex-col bg-white animate-fade-in font-sans w-full overflow-hidden">
      
      {/* Top Section with Curved Background */}
      <div className="relative w-full h-[150px] shrink-0 bg-[#1E4E70] rounded-b-[40px] overflow-hidden">
        {/* Abstract shapes for background texture (optional, subtle) */}
        <div className="absolute top-[-50px] right-[-50px] w-[200px] h-[200px] bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-[-50px] left-[-20px] w-[150px] h-[150px] bg-white/5 rounded-full blur-xl"></div>
        
        {/* Header Content */}
        <div className="absolute top-0 left-0 w-full px-5 py-4 flex items-center justify-center">
          <button
            onClick={() => router.back()}
            className="absolute left-5 w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-800 shadow-sm transition-transform active:scale-95"
          >
            <ChevronLeft className="w-5 h-5 -ml-0.5" />
          </button>
          <h1 className="text-xl font-medium text-white tracking-wide">
            Account
          </h1>
        </div>
      </div>

      {/* Profile Details (Overlapping the curve) */}
      <div className="flex flex-col items-center -mt-[60px] px-6 relative z-10 shrink-0">
        <div className="w-[120px] h-[120px] rounded-full overflow-hidden bg-slate-100 shadow-md">
          {avatar ? (
            <Image 
              src={avatar} 
              alt="Profile" 
              width={120} 
              height={120} 
              className="object-cover w-full h-full" 
            />
          ) : (
            <Image
              src="/delivery_boy_hero.png"
              alt="Rider Default"
              width={120}
              height={120}
              className="object-cover w-full h-full"
            />
          )}
        </div>
        
        <h2 className="mt-4 text-[22px] font-medium text-slate-900 tracking-tight">
          {fullName}
        </h2>
      </div>

      {/* Menu Items List */}
      <div className="flex-1 px-5 py-8 flex flex-col space-y-4">
        
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="w-full flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 rounded-[20px] transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className="w-[52px] h-[52px] bg-white rounded-[16px] flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6 text-[#1E4E70]" strokeWidth={2} />
                </div>
                <span className="font-medium text-slate-800 text-[16px]">
                  {item.name}
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 mr-2" />
            </Link>
          );
        })}

        {/* Logout Button (Same style) */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 rounded-[20px] transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-4">
            <div className="w-[52px] h-[52px] bg-white rounded-[16px] flex items-center justify-center shrink-0">
              <LogOut className="w-6 h-6 text-rose-500" strokeWidth={2} />
            </div>
            <span className="font-medium text-slate-800 text-[16px]">
              Logout
            </span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 mr-2" />
        </button>

        {/* Footer Links */}
        <div className="mt-12 mb-6 flex flex-col items-center justify-center gap-3 text-[13px] font-medium text-slate-400">
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-slate-900 transition-colors">Privacy Policy</Link>
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            <Link href="/terms" className="hover:text-slate-900 transition-colors">Terms of Service</Link>
          </div>
          <p>v1.0.0 • © {new Date().getFullYear()} Moncradle</p>
        </div>

      </div>
    </div>
  );
}
