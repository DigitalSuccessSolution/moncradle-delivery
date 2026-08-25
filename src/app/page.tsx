"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Activity,
  Briefcase,
  CheckCircle2,
  Clock,
  Wallet,
  Navigation,
  Headphones,
  Bike,
  User,
  Flag,
  ChevronDown,
  ChevronRight,
  Loader2,
  PackageCheck
} from "lucide-react";
import Swal from "sweetalert2";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { setOnlineStatus } from "@/store/slices/appSlice";

interface DeliveryTask {
  id: string;
  orderNumber: string;
  status: string;
  parentName: string;
  kitchenAddress: string;
  address: string;
  distanceKm: number;
  itemSummary: string;
  packCount: number;
  mealImage: string;
}

export default function Dashboard() {
  const router = useRouter();
  const dispatch = useDispatch();
  const isOnline = useSelector((state: RootState) => state.app.isOnline);
  
  // Custom Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(true);

  // Dashboard Stats State
  const [isLoading, setIsLoading] = useState(true);
  const [earnings, setEarnings] = useState(0);
  const [assignedOrders, setAssignedOrders] = useState(0);
  const [deliveredOrders, setDeliveredOrders] = useState(0);
  
  // Filter State
  const [summaryFilter, setSummaryFilter] = useState("Today");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Recent Order State
  const [recentOrder, setRecentOrder] = useState<DeliveryTask | null>(null);



  const handleOfflineGuard = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!isOnline) {
      Swal.fire({
        icon: 'warning',
        title: 'You are offline',
        text: 'Please go online to manage and accept orders.',
        confirmButtonColor: '#1E4E70',
        customClass: {
          popup: 'rounded-2xl',
        }
      });
      return false;
    }
    return true;
  };


  const handleToggleClick = () => {
    setPendingStatus(!isOnline);
    setShowConfirmModal(true);
  };

  const confirmToggleStatus = () => {
    const newStatus = pendingStatus;
    dispatch(setOnlineStatus(newStatus));
    setShowConfirmModal(false);
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("moncradel_rider_token");
      if (!token) return;

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

      const isDateInRange = (dateString: string) => {
        if (!dateString) return true;
        const date = new Date(dateString);
        const now = new Date();
        
        if (summaryFilter === 'Today') {
          return date.toDateString() === now.toDateString();
        } else if (summaryFilter === 'This Week') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return date >= weekAgo;
        } else if (summaryFilter === 'This Month') {
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        }
        return true;
      };

      // Fetch Earnings
      const earningRes = await fetch(`${API_URL}/earnings?staffRole=delivery`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const earningData = await earningRes.json();
      if (earningData.success) {
        const filteredEarnings = (earningData.data || []).filter((e: any) => 
          isDateInRange(e.createdAt)
        ).reduce((acc: number, curr: any) => acc + curr.amount, 0);
        
        setEarnings(filteredEarnings);
      }

      // Fetch Orders
      const orderRes = await fetch(`${API_URL}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const orderData = await orderRes.json();
      if (orderData.success) {
        const orders = orderData.data || [];
        
        // Filter orders by date for the summary metrics
        const filteredOrders = orders.filter((o: any) => isDateInRange(o.createdAt || o.updatedAt || new Date().toISOString()));
        
        setAssignedOrders(filteredOrders.filter((o: any) => o.status !== 'delivered').length);
        setDeliveredOrders(filteredOrders.filter((o: any) => o.status === 'delivered').length);

        // Fetch recent ready order for the next delivery card (regardless of summary date filter)
        const readyOrders = orders.filter((o: any) => o.status === 'ready');
        if (readyOrders.length > 0) {
          const order = readyOrders[0];
          setRecentOrder({
            id: order._id,
            orderNumber: `#${order._id.substring(order._id.length - 6).toUpperCase()}`,
            status: order.status,
            parentName: order.parentId?.name || "Customer",
            kitchenAddress: order.kitchenId?.address || "Moncradel Kitchen Hub",
            address: order.deliveryAddress?.street
              ? `${order.deliveryAddress.street}, ${order.deliveryAddress.city}`
              : "Delivery Address",
            distanceKm: order.distanceKm || 2.5,
            itemSummary: order.items?.map((i: any) => i.mealId?.name || i.productId?.name || "Item").join(", ") || "No items",
            packCount: order.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0,
            mealImage: order.items?.[0]?.mealId?.imageUrl || "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=800"
          });
        } else {
          setRecentOrder(null);
        }
      }

    } catch (err) {
      console.error("Failed to fetch dashboard stats", err);
    } finally {
      setIsLoading(false);
    }
  }, [summaryFilter]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handlePickup = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!handleOfflineGuard(e)) return;
    try {
      const token = localStorage.getItem("moncradel_rider_token");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

      const res = await fetch(`${API_URL}/orders/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "out_for_delivery" }),
      });

      const data = await res.json();
      if (data.success) {
        fetchDashboardData();
      } else {
        alert("Failed to confirm pickup: " + data.message);
      }
    } catch (err) {
      alert("Error confirming pickup. Please try again.");
    }
  };

  return (
    <div className="space-y-4 pb-20 font-sans text-slate-800 max-w-5xl mx-auto w-full pt-0">
      
      {/* 1. SUMMARY FILTER & METRICS */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <h2 className="font-medium text-[15px] text-slate-900">
              {summaryFilter === 'Today' ? "Today's Summary" : "Performance Summary"}
            </h2>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1 text-[13px] font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 whitespace-nowrap shrink-0"
            >
              {summaryFilter} <ChevronDown className="w-3.5 h-3.5" />
            </button>
            
            {isDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-36 bg-white border border-slate-100 rounded-2xl shadow-lg z-50 py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  {['Today', 'This Week', 'This Month'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => { setSummaryFilter(filter); setIsDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-[13px] font-medium hover:bg-slate-50 transition-colors ${summaryFilter === filter ? 'text-[#1E4E70] bg-slate-50/50' : 'text-slate-600'}`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="flex flex-col justify-between bg-emerald-100/80 rounded-[14px] p-4">
             <div className="flex items-center gap-2 mb-2.5">
                 <Briefcase className="w-5 h-5 stroke-[2.2] text-emerald-600 shrink-0 opacity-90" />
                 <span className="text-[11px] sm:text-[12px] text-emerald-800/90 font-medium leading-tight">Total Orders</span>
             </div>
             <span className="text-[22px] font-medium text-black leading-none px-0.5">
               {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> : deliveredOrders + assignedOrders}
             </span>
          </div>
          
          <div className="flex flex-col justify-between bg-blue-100/80 rounded-[14px] p-4">
             <div className="flex items-center gap-2 mb-2.5">
                 <CheckCircle2 className="w-5 h-5 stroke-[2.2] text-blue-600 shrink-0 opacity-90" />
                 <span className="text-[11px] sm:text-[12px] text-blue-800/90 font-medium leading-tight">Completed</span>
             </div>
             <span className="text-[22px] font-medium text-black leading-none px-0.5">
               {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-blue-400" /> : deliveredOrders}
             </span>
          </div>
          
          <div className="flex flex-col justify-between bg-amber-100/80 rounded-[14px] p-4">
             <div className="flex items-center gap-2 mb-2.5">
                 <Clock className="w-5 h-5 stroke-[2.2] text-amber-600 shrink-0 opacity-90" />
                 <span className="text-[11px] sm:text-[12px] text-amber-800/90 font-medium leading-tight">In Progress</span>
             </div>
             <span className="text-[22px] font-medium text-black leading-none px-0.5">
               {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-amber-400" /> : assignedOrders}
             </span>
          </div>
          
          <div className="flex flex-col justify-between bg-emerald-100/80 rounded-[14px] p-4">
             <div className="flex items-center gap-2 mb-2.5">
                 <Wallet className="w-5 h-5 stroke-[2.2] text-emerald-600 shrink-0 opacity-90" />
                 <span className="text-[11px] sm:text-[12px] text-emerald-800/90 font-medium leading-tight">Earnings</span>
             </div>
             <span className="text-[22px] font-medium text-black leading-none px-0.5">
               {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> : `₹${earnings}`}
             </span>
          </div>
        </div>
      </div>

      {/* 2. ONLINE/OFFLINE TOGGLE CARD */}
      <div className="bg-white rounded-2xl py-3.5 px-4 border border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-[72px] h-[54px] relative shrink-0">
             <Image src="/images/delivery.png" alt="Delivery" fill className="object-contain" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-[15px] font-medium text-slate-900 flex items-center gap-1.5 leading-tight">
              {isOnline ? "You are Online" : "You are Offline"}
              <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
            </h3>
            <p className="text-[12px] text-slate-500 font-medium mt-0.5">
              {isOnline ? "Ready to accept new orders" : "Go online to start earning"}
            </p>
          </div>
        </div>
        
        <button 
          onClick={handleToggleClick}
          className={`relative w-[50px] h-7 rounded-full transition-colors flex items-center px-1 cursor-pointer ${isOnline ? 'bg-emerald-500' : 'bg-slate-200'}`}
        >
          <div className={`w-5 h-5 rounded-full bg-white transition-transform duration-300 shadow-[0_2px_4px_rgba(0,0,0,0.1)] ${isOnline ? 'translate-x-[22px]' : 'translate-x-0'}`} />
        </button>
      </div>

      {/* 3. NEXT DELIVERY CARD (DYNAMIC) */}
      {recentOrder && (
        <div className="mb-2">
          <div className="flex justify-between items-center mb-3 px-1">
            <h2 className="font-medium text-[15px] text-slate-900">Next Delivery</h2>
            <Link href="/orders" className="text-[12px] font-medium text-[#1E4E70] flex items-center gap-0.5">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          
          <div
            onClick={(e) => {
              if (!handleOfflineGuard(e)) return;
              router.push(`/orders/${recentOrder.id}`);
            }}
            className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 hover:border-slate-200 transition-colors flex flex-col gap-3 cursor-pointer"
          >
            {/* Header: Order ID & Distance */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium text-black text-[15px]">
                  {recentOrder.orderNumber}
                </span>
              </div>
              <span className="text-[12px] sm:text-[13px] font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                {recentOrder.distanceKm} km away
              </span>
            </div>

            {/* Body: Customer & Address */}
            <div className="flex flex-col gap-2">
              <p className="text-[15px] sm:text-[16px] font-medium text-black truncate">
                {recentOrder.parentName}
              </p>

              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5 text-[13px] sm:text-[14px] text-black/80 font-medium">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>
                  <span className="leading-snug flex-1">
                    <span className="font-medium text-black">Pickup: </span>{recentOrder.kitchenAddress}
                  </span>
                </div>

                <div className="flex items-start gap-2.5 text-[13px] sm:text-[14px] text-black/80 font-medium">
                  <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0"></div>
                  <span className="leading-snug flex-1">
                    <span className="font-medium text-black">Drop: </span>{recentOrder.address}
                  </span>
                </div>
              </div>
            </div>

            {/* Meal Items Summary */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-3 overflow-hidden">
                <Image
                  src={recentOrder.mealImage}
                  alt="Meal"
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover shrink-0"
                />
                <p className="text-[13px] sm:text-[14px] font-medium text-black truncate opacity-90">
                  {recentOrder.itemSummary}
                </p>
              </div>
              <span className="text-[12px] sm:text-[13px] font-medium text-black opacity-60 shrink-0 ml-2">
                {recentOrder.packCount} items
              </span>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={(e) => handlePickup(recentOrder.id, e)}
                className="w-full bg-[#1E4E70] hover:bg-[#153852] text-white font-medium text-[14px] sm:text-[15px] py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <PackageCheck className="w-5 h-5" />
                <span>Confirm Pickup</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. QUICK ACTIONS */}
      <div className="pt-2">
        <h2 className="text-[15px] font-medium text-slate-900 mb-3 px-1">
          Quick Actions
        </h2>
        <div className="flex items-center justify-between gap-2.5">
          
          <Link href="/orders" className="flex-1 bg-blue-100/80 rounded-[16px] py-4 px-2 flex flex-col items-center justify-center gap-2.5 hover:bg-blue-200/50 transition-colors">
            <Briefcase className="w-7 h-7 stroke-[1.5] text-blue-600" />
            <span className="text-[11px] font-semibold text-blue-900/80 text-center leading-tight">My Orders</span>
          </Link>

          <Link href="/earnings" className="flex-1 bg-amber-100/80 rounded-[16px] py-4 px-2 flex flex-col items-center justify-center gap-2.5 hover:bg-amber-200/50 transition-colors">
            <Wallet className="w-7 h-7 stroke-[1.5] text-amber-600" />
            <span className="text-[11px] font-semibold text-amber-900/80 text-center leading-tight">Earnings</span>
          </Link>

          <Link href="/support" className="flex-1 bg-purple-100/80 rounded-[16px] py-4 px-2 flex flex-col items-center justify-center gap-2.5 hover:bg-purple-200/50 transition-colors">
            <Headphones className="w-7 h-7 stroke-[1.5] text-purple-600" />
            <span className="text-[11px] font-semibold text-purple-900/80 text-center leading-tight">Support</span>
          </Link>

          <Link href="/profile" className="flex-1 bg-emerald-100/80 rounded-[16px] py-4 px-2 flex flex-col items-center justify-center gap-2.5 hover:bg-emerald-200/50 transition-colors">
            <User className="w-7 h-7 stroke-[1.5] text-emerald-600" />
            <span className="text-[11px] font-semibold text-emerald-900/80 text-center leading-tight">Profile</span>
          </Link>

        </div>
      </div>

      {/* CUSTOM CONFIRMATION MODAL */}
      {showConfirmModal && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-opacity">
          <div 
            className="bg-white rounded-3xl w-full max-w-[340px] p-6 text-center transform transition-all relative overflow-hidden"
            style={{ animation: 'modal-pop 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            <div className={`absolute -top-16 -right-16 w-32 h-32 rounded-full opacity-10 ${pendingStatus ? 'bg-emerald-500' : 'bg-slate-500'}`}></div>

            <div className={`relative w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-5 ${pendingStatus ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-500'}`}>
              <Bike className="w-8 h-8" strokeWidth={2.5} />
            </div>
            
            <h3 className="text-[20px] font-medium text-slate-900 mb-2.5">
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
                className={`w-full py-3.5 rounded-2xl text-[15px] font-medium text-white transition-all active:scale-95 ${pendingStatus ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-slate-800 hover:bg-slate-900'}`}
              >
                {pendingStatus ? "Yes, Go Online" : "Yes, Go Offline"}
              </button>
              
              <button 
                onClick={() => setShowConfirmModal(false)} 
                className="w-full py-3.5 rounded-2xl text-[15px] font-medium text-slate-600 bg-slate-100/80 hover:bg-slate-200 transition-all active:scale-95"
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

    </div>
  );
}
