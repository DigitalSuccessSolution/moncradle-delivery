"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Search,
  PackageCheck,
  Navigation,
  Clock,
  PhoneCall,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  X,
  Loader2,
} from "lucide-react";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

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

export default function OrdersPage() {
  const router = useRouter();
  const isOnline = useSelector((state: RootState) => state.app.isOnline);

  const [tasks, setTasks] = useState<DeliveryTask[]>([]);
  const [activeTab, setActiveTab] = useState<
    "ready" | "out_for_delivery" | "delivered"
  >("ready");
  const [isLoading, setIsLoading] = useState(true);

  const handleOfflineGuard = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!isOnline) {
      Swal.fire({
        icon: 'warning',
        title: 'You are offline',
        text: 'Please go online to view and manage orders.',
        confirmButtonColor: '#1E4E70',
        customClass: {
          popup: 'rounded-2xl',
        }
      });
      return false;
    }
    return true;
  };

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("moncradel_rider_token");
      if (!token) return;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        // Map backend orders to frontend DeliveryTask shape
        const mappedOrders = data.data.map((order: any) => ({
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
          mealImage: order.items?.[0]?.mealId?.imageUrl || order.items?.[0]?.productId?.imageUrl || ""
        }));
        setTasks(mappedOrders);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredTasks = tasks.filter((t) => t.status === activeTab);

  const handlePickup = async (id: string, e: React.MouseEvent) => {
    if (!handleOfflineGuard(e)) return;
    try {
      const token = localStorage.getItem("moncradel_rider_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

      const res = await fetch(`${apiUrl}/orders/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "out_for_delivery" }),
      });

      const data = await res.json();
      if (data.success) {
        setTasks(
          tasks.map((t) =>
            t.id === id ? { ...t, status: "out_for_delivery" } : t
          )
        );
      } else {
        alert("Failed to confirm pickup: " + data.message);
      }
    } catch (err) {
      alert("Error confirming pickup. Please try again.");
    }
  };

  const handleCompleteDelivery = (id: string) => {
    router.push(`/orders/${id}`);
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in-up pb-24 max-w-2xl mx-auto lg:max-w-none lg:mx-0 font-sans w-full">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-medium text-slate-900 tracking-tight mb-1">
            Delivery Tasks
          </h1>
          <p className="text-base text-slate-500 font-medium hidden md:block">
            Manage your pickups and active deliveries.
          </p>
        </div>
      </div>

      {/* Tabs Container */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 w-full mt-4 pb-1">
        {/* Ready Tab */}
        <button
          onClick={() => setActiveTab("ready")}
          className={`flex-1 py-2 px-1 sm:px-4 rounded-full text-[11px] xs:text-[12px] sm:text-[14px] font-medium transition-all flex items-center justify-center gap-1 sm:gap-2 ${activeTab === "ready"
              ? "bg-[#1E4E70] text-white border border-[#1E4E70]"
              : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50"
            }`}
        >
          <span className="truncate">Ready</span>
          <span
            className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium shrink-0 ${activeTab === "ready"
                ? "bg-white/20 text-white"
                : "bg-slate-100 text-slate-500"
              }`}
          >
            {tasks.filter((t) => t.status === "ready").length}
          </span>
        </button>

        {/* Out for Delivery Tab */}
        <button
          onClick={() => setActiveTab("out_for_delivery")}
          className={`flex-1 py-2 px-1 sm:px-4 rounded-full text-[11px] xs:text-[12px] sm:text-[14px] font-medium transition-all flex items-center justify-center gap-1 sm:gap-2 ${activeTab === "out_for_delivery"
              ? "bg-[#1E4E70] text-white border border-[#1E4E70]"
              : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50"
            }`}
        >
          <span className="truncate">Active</span>
          <span
            className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium shrink-0 ${activeTab === "out_for_delivery"
                ? "bg-white/20 text-white"
                : "bg-slate-100 text-slate-500"
              }`}
          >
            {tasks.filter((t) => t.status === "out_for_delivery").length}
          </span>
        </button>

        {/* Delivered Tab */}
        <button
          onClick={() => setActiveTab("delivered")}
          className={`flex-1 py-2 px-1 sm:px-4 rounded-full text-[11px] xs:text-[12px] sm:text-[14px] font-medium transition-all flex items-center justify-center gap-1 sm:gap-2 ${activeTab === "delivered"
              ? "bg-[#1E4E70] text-white border border-[#1E4E70]"
              : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50"
            }`}
        >
          <span className="truncate">Completed</span>
          <span
            className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium shrink-0 ${activeTab === "delivered"
                ? "bg-white/20 text-white"
                : "bg-slate-100 text-slate-500"
              }`}
          >
            {tasks.filter((t) => t.status === "delivered").length}
          </span>
        </button>
      </div>

      {/* 3. ORDER CARDS LIST */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-4" />
          <p className="text-slate-500 font-medium">Loading orders...</p>
        </div>
      ) : (
        <div
          className={
            filteredTasks.length === 0
              ? "mt-4"
              : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6"
          }
        >
          {filteredTasks.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-10 flex flex-col items-center justify-center text-center">
              <PackageCheck className="w-12 h-12 text-slate-300 mb-3" />
              <h3 className="text-[16px] font-medium text-slate-800">
                No orders found
              </h3>
              <p className="text-[14px] text-slate-500 mt-1">
                {activeTab === "ready"
                  ? "There are no ready orders at the hub right now."
                  : activeTab === "out_for_delivery"
                    ? "You don't have any active deliveries."
                    : "No completed deliveries yet."}
              </p>
            </div>
          ) : (
            filteredTasks.map((order) => (
              <div
                key={order.id}
                onClick={(e) => {
                  if (!handleOfflineGuard(e)) return;
                  router.push(`/orders/${order.id}`);
                }}
                className="bg-white rounded-xl border border-slate-100 p-4 sm:p-5 hover:border-slate-200 transition-colors flex flex-col gap-3 cursor-pointer"
              >
                {/* Header: Order ID & Distance */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-black text-[15px]">
                      {order.orderNumber}
                    </span>
                  </div>
                  <span className="text-[12px] sm:text-[13px] font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                    {order.distanceKm} km away
                  </span>
                </div>

                {/* Body: Customer & Address */}
                <div className="flex flex-col gap-2">
                  <p className="text-[15px] sm:text-[16px] font-medium text-black truncate">
                    {order.parentName}
                  </p>

                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2.5 text-[13px] sm:text-[14px] text-black/80 font-medium overflow-hidden">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div>
                      <span className="flex-1 truncate">
                        <span className="font-medium text-black">Pickup: </span>{order.kitchenAddress}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 text-[13px] sm:text-[14px] text-black/80 font-medium overflow-hidden">
                      <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></div>
                      <span className="flex-1 truncate">
                        <span className="font-medium text-black">Drop: </span>{order.address}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Meal Items Summary */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-slate-100 flex items-center justify-center">
                      {order.mealImage ? (
                        <img
                          src={order.mealImage}
                          alt="Meal"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.style.display = 'none';
                            const emoji = document.createElement('span');
                            emoji.className = 'text-sm';
                            emoji.textContent = '🥣';
                            target.parentElement?.appendChild(emoji);
                          }}
                        />
                      ) : (
                        <span className="text-sm">🥣</span>
                      )}
                    </div>
                    <p className="text-[13px] sm:text-[14px] font-medium text-black truncate opacity-90">
                      {order.itemSummary}
                    </p>
                  </div>
                  <span className="text-[12px] sm:text-[13px] font-medium text-black opacity-60 shrink-0 ml-2">
                    {order.packCount} items
                  </span>
                </div>

                {/* Action Buttons */}
                {activeTab !== "delivered" && (
                  <div className="pt-2 flex items-center gap-2">
                    {activeTab === "ready" ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePickup(order.id, e);
                        }}
                        className="w-full bg-[#1E4E70] hover:bg-[#153852] text-white font-medium text-[14px] sm:text-[15px] py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        <PackageCheck className="w-5 h-5" />
                        <span>Confirm Pickup</span>
                      </button>
                    ) : (
                      <>
                        {/* <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/map?orderId=${order.id}`);
                          }}
                          className="w-1/2 bg-[#1E4E70] hover:bg-[#153852] text-white font-medium text-[14px] sm:text-[15px] py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                          <Navigation className="w-4 h-4" />
                          <span>Map</span>
                        </button> */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCompleteDelivery(order.id);
                          }}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[14px] sm:text-[15px] py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                          <ShieldCheck className="w-5 h-5" />
                          <span>Deliver</span>
                        </button>
                      </>
                    )}
                  </div>
                )}

                {activeTab === "delivered" && (
                  <div className="pt-2 flex items-center justify-center">
                    <span className="flex items-center gap-1.5 text-emerald-700 font-medium text-[14px]">
                      <CheckCircle2 className="w-4 h-4" /> Delivered Successfully
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
