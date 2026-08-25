"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  PhoneCall, 
  MapPin, 
  ShieldCheck,
  AlertCircle,
  Camera,
  CheckCircle2,
  Package,
  Loader2,
  ChevronLeft
} from "lucide-react";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const isOnline = useSelector((state: RootState) => state.app.isOnline);
  const resolvedParams = use(params);
  
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [photoCaptured, setPhotoCaptured] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchOrder = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("moncradel_rider_token");
      if (!token) return;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/orders/${resolvedParams.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      if (data.success) {
        setOrder(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch order details:", err);
    } finally {
      setIsLoading(false);
    }
  }, [resolvedParams.id]);

  useEffect(() => {
    if (!isOnline) {
      Swal.fire({
        icon: 'warning',
        title: 'Offline Mode',
        text: 'You must be online to view and manage order details.',
        confirmButtonColor: '#1E4E70',
        customClass: {
          popup: 'rounded-2xl',
        }
      }).then(() => {
        router.push('/orders');
      });
      return;
    }
    fetchOrder();
  }, [fetchOrder, isOnline, router]);

  const handleOfflineGuard = () => {
    if (!isOnline) {
      Swal.fire({
        icon: 'warning',
        title: 'You are offline',
        text: 'Please go online to manage orders.',
        confirmButtonColor: '#1E4E70',
        customClass: {
          popup: 'rounded-2xl',
        }
      });
      return false;
    }
    return true;
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handlePickup = async () => {
    if (!handleOfflineGuard()) return;
    if (!order) return;
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("moncradel_rider_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      
      const res = await fetch(`${apiUrl}/orders/${order._id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "out_for_delivery" }),
      });
      
      const data = await res.json();
      if (data.success) {
        setOrder(data.data);
      } else {
        Swal.fire({
          title: "Error",
          text: "Failed to confirm pickup: " + data.message,
          icon: "error",
          confirmButtonColor: "#1E4E70"
        });
      }
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: "Error confirming pickup. Please try again.",
        icon: "error",
        confirmButtonColor: "#1E4E70"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteDelivery = async () => {
    if (!handleOfflineGuard()) return;
    if (!order) return;
    
    const enteredOtp = otp.join("");
    if (order.isOtpRequired && enteredOtp.length < 4) {
      Swal.fire({
        title: "Incomplete OTP",
        text: "Please enter the 4-digit OTP provided by the customer.",
        icon: "warning",
        confirmButtonColor: "#1E4E70"
      });
      return;
    }
    if (!photoCaptured) {
      Swal.fire({
        title: "Photo Required",
        text: "Please capture a photo as proof of delivery.",
        icon: "warning",
        confirmButtonColor: "#1E4E70"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("moncradel_rider_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      
      const formData = new FormData();
      formData.append("status", "delivered");
      if (order.isOtpRequired) {
        formData.append("otp", enteredOtp);
      }
      if (photoFile) {
        formData.append("proof", photoFile);
      }
      
      const res = await fetch(`${apiUrl}/orders/${order._id}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      
      const data = await res.json();
      if (data.success) {
        setOrder(data.data);
        // Navigate back to orders list after brief delay
        setTimeout(() => {
          router.push("/orders");
        }, 2000);
      } else {
        Swal.fire({
          title: "Error",
          text: "Failed to complete delivery: " + data.message,
          icon: "error",
          confirmButtonColor: "#1E4E70"
        });
      }
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: "Error completing delivery. Please try again.",
        icon: "error",
        confirmButtonColor: "#1E4E70"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full font-sans min-h-screen bg-white flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mb-4" />
        <p className="text-slate-500 font-medium">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="w-full font-sans min-h-screen bg-white flex flex-col items-center justify-center">
        <p className="text-slate-500 font-medium">Order not found.</p>
        <button onClick={() => router.push('/orders')} className="mt-4 text-emerald-600 font-medium">Go Back</button>
      </div>
    );
  }

  const orderNumber = `#${order._id.substring(order._id.length - 6).toUpperCase()}`;
  const parentName = order.parentId?.name || "Customer";
  const babyName = order.babyId?.name ? `Baby ${order.babyId.name}` : "Baby";
  const phone = order.parentId?.phone || "N/A";
  const kitchenAddress = order.kitchenId?.address || "Moncradel Kitchen Hub";
  const address = order.deliveryAddress?.street ? `${order.deliveryAddress.street}, ${order.deliveryAddress.city}` : "Delivery Address";
  const city = order.deliveryAddress?.city || "";
  const distanceKm = order.distanceKm || 2.5;
  const allergies = order.babyId?.allergies || [];

  return (
    <div className="w-full font-sans animate-fade-in-up">
        
        {/* Mobile Sticky Header (Visible only on Mobile) */}
        <div className="md:hidden sticky top-0 z-40 bg-white flex items-center justify-between py-3 -mx-4 px-4 sm:-mx-6 sm:px-6 mb-2">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#111827]"
          >
            <ChevronLeft className="w-6 h-6" />
            <span className="text-[17px] sm:text-[18px] font-medium text-[#111827]">Order Details</span>
          </button>

          <button 
            onClick={() => window.open(`tel:${phone}`)}
            className="w-9 h-9 rounded-full bg-[#1E4E70]/10 hover:bg-[#1E4E70]/20 flex items-center justify-center text-[#1E4E70] transition-colors"
          >
            <PhoneCall className="w-4 h-4" />
          </button>
        </div>

        {/* Desktop Navigation (Visible only on Desktop) */}
        <div className="hidden md:flex items-center justify-end mb-0 -mt-2">
          <button 
            onClick={() => window.open(`tel:${phone}`)}
            className="w-10 h-10 rounded-full bg-[#1E4E70]/10 hover:bg-[#1E4E70]/20 flex items-center justify-center text-[#1E4E70] transition-colors"
          >
            <PhoneCall className="w-4 h-4" />
          </button>
        </div>
      {/* 1. TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <h1 className="text-2xl sm:text-3xl font-medium text-slate-900 tracking-tight">
              Order {orderNumber}
            </h1>
            {order.status === "out_for_delivery" && (
              <span className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-[12px] sm:text-[13px] font-medium px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Out for Delivery
              </span>
            )}
            {order.status === "ready" && (
              <span className="flex items-center gap-1.5 bg-blue-50 border border-blue-200/60 text-blue-700 text-[12px] sm:text-[13px] font-medium px-3 py-1 rounded-full">
                <Package className="w-3.5 h-3.5" />
                Ready at Hub
              </span>
            )}
            {order.status === "delivered" && (
              <span className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-[12px] sm:text-[13px] font-medium px-3 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Delivered
              </span>
            )}
          </div>
          <p className="text-[14px] sm:text-[15px] text-slate-500 font-medium">Delivery to {parentName}</p>
          
          <div className="flex flex-wrap gap-2 mt-2.5">
            <span className="bg-slate-50 text-slate-700 border border-slate-200/60 px-2.5 py-1 rounded-md text-[13px] font-medium flex items-center gap-1.5">
              <span>Order Value: ₹{order.totalAmount}</span>
            </span>
          </div>
        </div>
        

      </div>

      {/* 2. SPECIAL INSTRUCTIONS ALERT */}
      {order.specialInstructions && (
        <div className="bg-amber-50/80 rounded-lg p-5 border border-amber-200/50 flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0 border border-amber-200/50">
            <AlertCircle className="w-6 h-6 text-amber-600" />
          </div>
          <div className="pt-0.5">
            <h3 className="text-[15px] font-medium text-amber-900">Critical Delivery Note</h3>
            <p className="text-[14.5px] text-amber-800/80 mt-1 leading-relaxed max-w-3xl">
              &quot;{order.specialInstructions}&quot;
            </p>
          </div>
        </div>
      )}

      {/* 3. SPLIT LAYOUT FOR MAIN CONTENT */}
      {/* grid items-start ensures that the left and right columns align at the top perfectly without stretching */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* LEFT COLUMN: INFORMATION */}
        <div className="space-y-6">
          
          {/* Locations Timeline Card */}
          <div className="bg-white rounded-lg border border-slate-200/80 p-4 sm:p-6 overflow-hidden relative">

            
            <h2 className="text-[14px] font-medium text-slate-500 uppercase tracking-wider mb-5 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Route Details
            </h2>
            
            {/* Pickup Node */}
            <div className="flex items-start gap-4 mb-1">
              <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center shrink-0 border border-orange-100 z-10">
                <span className="text-[14px] font-medium text-orange-600">K</span>
              </div>
              <div className="flex-1 pb-6 relative">
                <div className="absolute left-[-2.25rem] top-10 bottom-0 w-0.5 bg-slate-200 border-l-[2px] border-dashed border-slate-300"></div>
                <p className="text-[13px] text-slate-500 mb-0.5">Pickup from Kitchen</p>
                <p className="text-[15px] font-medium text-slate-900 leading-tight">{kitchenAddress}</p>

              </div>
            </div>

            {/* Drop Node */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center shrink-0 border border-emerald-100 z-10">
                <MapPin className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-[13px] text-slate-500 mb-0.5">Drop to Customer</p>
                <p className="text-[16px] font-medium text-slate-900 leading-tight">{address}</p>
                <p className="text-[14px] text-slate-500 mt-1">{city} • {distanceKm} km away</p>

              </div>
            </div>
          </div>

          {/* Package Details Card */}
          <div className="bg-white rounded-lg border border-slate-200/80 p-4 sm:p-6">
            <h2 className="text-[14px] font-medium text-slate-500 uppercase tracking-wider mb-5 flex items-center gap-2">
              <Package className="w-4 h-4" /> Package Contents
            </h2>
            
            <div className="space-y-3">
              {order.items?.map((item: any, idx: number) => (
                <div key={item._id || idx} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-slate-100 flex items-center justify-center">
                      {(() => {
                        const imgUrl = item.mealId?.imageUrl || item.mealId?.images?.[0] || item.productId?.imageUrl || item.productId?.images?.[0];
                        return imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={item.mealId?.name || item.productId?.name || "Item"}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.currentTarget;
                              target.style.display = 'none';
                              const emoji = document.createElement('span');
                              emoji.className = 'text-xl';
                              emoji.textContent = item.itemType === 'meal' ? '🥣' : '📦';
                              target.parentElement?.appendChild(emoji);
                            }}
                          />
                        ) : (
                          <span className="text-xl">{item.itemType === 'meal' ? "🥣" : "📦"}</span>
                        );
                      })()}
                    </div>
                    <div>
                      <h3 className="text-[14px] sm:text-[15px] font-medium text-slate-900 leading-tight mb-0.5">
                        {item.mealId?.name || item.productId?.name || "Item"}
                      </h3>
                      <p className="text-[12px] sm:text-[13px] text-slate-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="pt-2 px-1">
                <p className="text-[13px] text-slate-500">For {babyName}</p>
                {allergies.length > 0 && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-[12px] text-rose-600 font-medium bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100 w-fit">
                    <AlertCircle className="w-3 h-3" />
                    Allergy Alert: {allergies.join(", ")}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ACTION/VERIFICATION */}
        {/* sticky top-24 makes it float on scroll, but alignment matches the left column at the top */}
        <div className="bg-white rounded-lg border border-slate-200/80 p-4 sm:p-6 lg:p-8 sticky top-24">
          
          {order.status === "ready" ? (
            <div className="text-center">
              <div className="w-14 h-14 bg-blue-50 text-[#1E4E70] rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
                <Package className="w-7 h-7" />
              </div>
              <h2 className="text-[20px] font-medium text-slate-900">Pickup Order</h2>
              <p className="text-[14px] text-slate-500 mt-1 mb-8">Confirm you have received all packages from the kitchen.</p>
              
              <button 
                onClick={handlePickup}
                disabled={isSubmitting}
                className="w-full bg-[#1E4E70] hover:bg-[#153852] disabled:opacity-70 text-white font-medium text-[16px] py-4 rounded-lg transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-[#A5D8FF]" />
                )}
                Confirm Pickup from Hub
              </button>
            </div>
          ) : order.status === "delivered" ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-[20px] font-medium text-slate-900">Successfully Delivered</h2>
              <p className="text-[14px] text-slate-500 mt-2">This order has been completed and payment is secured.</p>
            </div>
          ) : (
            <div className="w-full">
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h2 className="text-[20px] font-medium text-slate-900">Verify & Complete</h2>
                <p className="text-[14px] text-slate-500 mt-1">Complete these steps to finish delivery</p>
              </div>
              
              <div className="space-y-8">
                
                {/* OTP */}
                {order.isOtpRequired && (
                  <div>
                    <label className="text-[15px] font-medium text-slate-900 mb-3 block">Customer OTP</label>
                    <div className="flex gap-3 justify-between">
                      {otp.map((digit, i) => (
                        <input
                          key={i}
                          id={`otp-${i}`}
                          type="tel"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            handleOtpChange(i, val);
                            if (val && i < otp.length - 1) {
                              document.getElementById(`otp-${i + 1}`)?.focus();
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Backspace' && !digit && i > 0) {
                              document.getElementById(`otp-${i - 1}`)?.focus();
                            }
                          }}
                          className="w-full aspect-square bg-slate-50 border border-slate-200 rounded-xl text-center text-2xl font-semibold text-slate-900 focus:outline-none focus:border-slate-400 transition-all"
                          placeholder=""
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* PHOTO */}
                <div>
                  <label className="text-[15px] font-medium text-slate-900 mb-3 block">Photo Proof</label>
                  {!photoCaptured ? (
                    <div className="relative w-full py-6 bg-slate-50 hover:bg-slate-100 border-2 border-slate-200 border-dashed text-slate-600 rounded-lg transition-all flex flex-col items-center justify-center gap-3 group overflow-hidden cursor-pointer">
                      <input 
                        type="file" 
                        accept="image/*" 
                        capture="environment" 
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setPhotoFile(e.target.files[0]);
                            setPhotoCaptured(true);
                          }
                        }}
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10" 
                      />
                      <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Camera className="w-5 h-5 text-slate-500" />
                      </div>
                      <span className="text-[14px] font-medium">Tap to open camera</span>
                    </div>
                  ) : (
                    <div className="w-full py-6 bg-emerald-50 border-2 border-emerald-200 text-emerald-700 rounded-lg flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-white border border-emerald-200 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                      </div>
                      <span className="text-[14px] font-medium">Photo securely captured</span>
                      <button 
                        onClick={() => {
                          setPhotoCaptured(false);
                          setPhotoFile(null);
                        }}
                        className="text-xs font-medium text-emerald-700 underline mt-1 z-20 relative cursor-pointer"
                      >
                        Retake Photo
                      </button>
                    </div>
                  )}
                </div>

                {/* SUBMIT */}
                <div className="pt-6 space-y-3">
                  <button
                    onClick={handleCompleteDelivery}
                    disabled={isSubmitting}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 text-white font-medium text-[16px] py-4 rounded-lg transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <ShieldCheck className="w-5 h-5 text-emerald-100" />
                    )}
                    Mark as Delivered
                  </button>
                  
                  <button className="w-full bg-white hover:bg-slate-50 text-rose-600 border border-rose-200 font-medium text-[14px] py-3.5 rounded-lg transition-all flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Report Issue / Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
