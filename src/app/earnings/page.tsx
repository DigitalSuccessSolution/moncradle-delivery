"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Wallet,
  Clock,
  CheckCircle2,
  ChevronRight,
  Landmark,
  FileText,
  Filter,
  ChevronLeft,
  Loader2
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

interface EarningItem {
  _id: string;
  orderId: string;
  amount: number;
  status: 'pending' | 'paid';
  notes: string;
  createdAt: string;
  orderNumber?: string;
}

interface WalletTransaction {
  _id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  status: 'processing' | 'completed' | 'failed' | 'transferred';
  createdAt: string;
}

export default function EarningsPage() {
  const router = useRouter();
  
  const [earnings, setEarnings] = useState<EarningItem[]>([]);
  const [payouts, setPayouts] = useState<WalletTransaction[]>([]);
  
  const [totalEarned, setTotalEarned] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);

  const [filter, setFilter] = useState<"all_time" | "today" | "this_week" | "this_month">("all_time");
  const [activeTab, setActiveTab] = useState<"earnings" | "payouts">("earnings");
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRequestingPayout, setIsRequestingPayout] = useState(false);
  const [payoutRequested, setPayoutRequested] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("moncradel_rider_token");
      if (!token) return;
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      
      // Fetch Earnings
      const earningRes = await fetch(`${API_URL}/earnings?staffRole=delivery`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const earningData = await earningRes.json();
      
      if (earningData.success) {
        setEarnings(earningData.data || []);
        setTotalEarned(earningData.totalEarned || 0);
        setPendingAmount(earningData.pendingAmount || 0);
        setPaidAmount(earningData.paidAmount || 0);
      }

      // Fetch Wallet
      const walletRes = await fetch(`${API_URL}/wallet`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const walletData = await walletRes.json();
      
      if (walletData.success && walletData.data) {
        setWalletBalance(walletData.data.balance || 0);
        const debits = (walletData.data.transactions || []).filter((t: any) => t.type === 'debit');
        setPayouts(debits);
      }

    } catch (err) {
      console.error("Failed to fetch earnings/wallet data", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter logic based on createdAt dates
  const filteredEarnings = earnings.filter((e) => {
    if (filter === "all_time") return true;

    const date = new Date(e.createdAt);
    const today = new Date();
    
    if (filter === "today") {
      return date.toDateString() === today.toDateString();
    }
    if (filter === "this_week") {
      const firstDay = new Date(today.setDate(today.getDate() - today.getDay()));
      return date >= firstDay;
    }
    if (filter === "this_month") {
      return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    }
    return true;
  });

  const filterOptions = {
    all_time: "All Time",
    today: "Today",
    this_week: "This Week",
    this_month: "This Month"
  };

  const handlePayoutRequest = () => {
    Swal.fire({
      title: 'Request Payout?',
      text: `Are you sure you want to request a payout of ₹${walletBalance.toFixed(2)}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#1e3050',
      cancelButtonColor: '#f43f5e',
      confirmButtonText: 'Yes, request it',
      backdrop: 'rgba(15, 23, 42, 0.4)',
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'rounded-lg font-medium',
        container: 'backdrop-blur-sm'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsRequestingPayout(true);
        
        try {
          const token = localStorage.getItem("moncradel_rider_token");
          const riderStr = localStorage.getItem("moncradel_rider_user");
          if (!token || !riderStr) throw new Error("No auth token");
          const rider = JSON.parse(riderStr);
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
          
          const res = await fetch(`${API_URL}/wallet/transaction`, {
            method: 'POST',
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              userId: rider._id,
              type: 'debit',
              amount: walletBalance,
              description: 'Rider requested payout'
            })
          });
          
          const data = await res.json();
          
          if (data.success) {
            setPayoutRequested(true);
            Swal.fire({
              title: 'Request Sent!',
              text: 'Your payout request has been sent to Admin for processing.',
              icon: 'success',
              confirmButtonColor: '#1e3050',
              customClass: {
                popup: 'rounded-2xl',
                confirmButton: 'rounded-lg font-medium',
              }
            });
            fetchData();
          } else {
            throw new Error(data.message || 'Payout failed');
          }
        } catch (error: any) {
          Swal.fire('Error', error.message || 'Failed to request payout', 'error');
        } finally {
          setIsRequestingPayout(false);
        }
      }
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up pb-16 font-sans max-w-5xl mx-auto w-full">
      {/* Header (Hidden on Mobile) */}
      <div className="hidden md:flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 lg:mb-8 pt-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="md:hidden p-2 -ml-2 rounded-full text-black hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-medium text-black tracking-tight mb-1">
              My Earnings
            </h1>
            <p className="text-base text-black/80 font-medium hidden md:block">
              Track your order payouts and wallet balance.
            </p>
          </div>
        </div>
      </div>

      {/* 2. TOP SECTION: WALLET & PAYOUT SIDE-BY-SIDE ON DESKTOP */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">

        {/* WALLET & STATS CARDS */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          
          {/* Total Earnings Card */}
          <div className="col-span-2 sm:col-span-1 bg-blue-100/80 rounded-xl p-5 relative overflow-hidden flex flex-col justify-center min-h-[120px]">
            <div className="relative z-10 w-2/3">
              <span className="text-[13px] text-black font-medium tracking-wide block mb-1">
                Total Earnings
              </span>
              <h2 className="text-[28px] font-medium text-black tracking-tight leading-none">
                ₹ {totalEarned.toFixed(2)}
              </h2>
            </div>
            {/* Money Image */}
            <div className="absolute right-2 bottom-1/2 translate-y-1/2 w-[110px] h-[110px] flex items-center justify-center z-0 opacity-90 pointer-events-none">
              <Image 
                src="/images/money.png" 
                alt="Money" 
                width={110} 
                height={110} 
                className="object-contain w-full h-full"
              />
            </div>
          </div>

          {/* Pending Card */}
          <div className="col-span-1 bg-orange-100/80 rounded-xl p-3 sm:p-4 flex flex-col justify-center min-h-[90px]">
            <span className="text-[12px] sm:text-[13px] text-black font-medium flex items-center gap-1.5 mb-1.5">
              <Clock className="w-4 h-4 text-orange-500" />
              Pending
            </span>
            <span className="text-[20px] sm:text-[24px] font-medium text-black">
              ₹{pendingAmount.toFixed(2)}
            </span>
          </div>

          {/* Settled Card */}
          <div className="col-span-1 bg-emerald-100/80 rounded-xl p-3 sm:p-4 flex flex-col justify-center min-h-[90px]">
            <span className="text-[12px] sm:text-[13px] text-black font-medium flex items-center gap-1.5 mb-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Settled
            </span>
            <span className="text-[20px] sm:text-[24px] font-medium text-black">
              ₹{paidAmount.toFixed(2)}
            </span>
          </div>

        </div>

        {/* PAYOUT REQUEST CARD */}
        <div className="lg:col-span-1">
          <div className="bg-blue-100/80 rounded-xl p-5 h-full flex flex-col justify-center space-y-4 sm:space-y-5">
            <div className="flex items-center gap-3">
              <Landmark className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <h3 className="font-medium text-black text-[16px] leading-tight">
                  Request Payout
                </h3>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 pb-1">
              <span className="text-[13px] text-black font-medium">
                Withdrawable
              </span>
              <span className="font-medium text-black text-[15px]">
                ₹{walletBalance.toFixed(2)}
              </span>
            </div>

            {payoutRequested ? (
              <div className="w-full bg-orange-50 border border-orange-200 text-orange-600 font-medium text-[14px] py-3 rounded-lg flex items-center justify-center gap-2 mt-auto">
                <Clock className="w-4 h-4" />
                Processing by Admin
              </div>
            ) : (
              <button
                onClick={handlePayoutRequest}
                disabled={walletBalance <= 0 || isRequestingPayout}
                className={`w-full font-medium text-[14px] py-3 rounded-lg transition-all flex items-center justify-between px-5 active:scale-[0.98] mt-auto ${walletBalance > 0
                  ? "bg-[#1E4E70] text-white"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  }`}
              >
                <span>{isRequestingPayout ? "Requesting..." : "Request Payout Now"}</span>
                {!isRequestingPayout && <ChevronRight className="w-4 h-4 opacity-80" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. RECENT EARNINGS & PAYOUTS SECTION */}
      <div className="pt-4 space-y-4">

        {/* Header & Standard Native Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('earnings')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[13px] font-medium transition-all ${
                activeTab === 'earnings' 
                  ? 'bg-emerald-100/80 text-black' 
                  : 'bg-white text-black hover:bg-slate-50'
              }`}
            >
              Earnings
            </button>
            <button
              onClick={() => setActiveTab('payouts')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[13px] font-medium transition-all ${
                activeTab === 'payouts' 
                  ? 'bg-emerald-100/80 text-black' 
                  : 'bg-white text-black hover:bg-slate-50'
              }`}
            >
              Payouts
            </button>
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="bg-white border border-slate-200 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[12px] sm:text-[13px] font-semibold text-black focus:outline-none cursor-pointer"
          >
            {Object.entries(filterOptions).map(([key, label]) => (
              <option key={key} value={key} className="font-medium text-black">
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* List */}
        <div className="flex flex-col gap-3">
          {activeTab === 'earnings' ? (
            filteredEarnings.map((earning) => (
              <div
                key={earning._id}
                className="bg-white rounded-xl border border-slate-100 p-4 sm:p-5 hover:border-slate-200 transition-colors group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex flex-col">
                    <span className="font-medium text-black text-[15px]">
                      {earning.orderNumber || (earning.orderId ? `Order #${earning.orderId.toString().substring(0,6)}` : 'Delivery')}
                    </span>
                    <p className="text-[12px] text-black font-medium mt-0.5 opacity-80">
                      {formatDate(earning.createdAt)}
                    </p>
                  </div>
                  <div className="text-[15px] sm:text-[16px] font-medium text-black">
                    +₹{earning.amount.toFixed(2)}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1.5 rounded-md border border-slate-100/50">
                    <FileText className="w-3.5 h-3.5 text-black opacity-60" />
                    <p className="text-[12px] sm:text-[13px] text-black font-medium leading-none opacity-80">
                      {earning.notes || 'Delivery Fee'}
                    </p>
                  </div>

                  <div className="shrink-0">
                    {earning.status === "paid" ? (
                      <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-[#0f9d58] bg-[#f0fdf4] px-2 py-1 rounded-lg uppercase tracking-wider border border-[#dcfce7]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        SETTLED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-[#f59e0b] bg-[#fffbeb] px-2 py-1 rounded-lg uppercase tracking-wider border border-[#fef3c7]">
                        <Clock className="w-3.5 h-3.5" />
                        PENDING
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            payouts.map((payout) => (
              <div
                key={payout._id}
                className="bg-white rounded-xl border border-slate-100 p-4 sm:p-5 hover:border-slate-200 transition-colors group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex flex-col">
                    <span className="font-medium text-black text-[15px]">
                      Payout Withdrawal
                    </span>
                    <p className="text-[12px] text-black font-medium mt-0.5 opacity-80">
                      {formatDate(payout.createdAt)}
                    </p>
                  </div>
                  <div className="text-[15px] sm:text-[16px] font-medium text-red-600">
                    -₹{payout.amount.toFixed(2)}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1.5 rounded-md border border-slate-100/50">
                    <Landmark className="w-3.5 h-3.5 text-black opacity-60" />
                    <p className="text-[12px] sm:text-[13px] text-black font-medium leading-none opacity-80">
                      {payout.description || 'Bank Transfer'}
                    </p>
                  </div>

                  <div className="shrink-0">
                    {payout.status === "completed" || payout.status === "transferred" ? (
                      <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg uppercase tracking-wider border border-blue-100">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        TRANSFERRED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-[#f59e0b] bg-[#fffbeb] px-2 py-1 rounded-lg uppercase tracking-wider border border-[#fef3c7]">
                        <Clock className="w-3.5 h-3.5" />
                        PROCESSING
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}

          {activeTab === 'earnings' && filteredEarnings.length === 0 && (
            <div className="bg-white rounded-lg border border-slate-100 p-10 flex flex-col items-center justify-center text-center animate-fade-in-up mt-2">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3 border border-slate-100">
                <Filter className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-[16px] font-semibold text-black">
                No earnings found
              </h3>
              <p className="text-[14px] text-black mt-1 max-w-[250px]">
                You don't have any transactions for this period.
              </p>
              <button
                onClick={() => setFilter('all_time')}
                className="mt-4 text-[13px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
          
          {activeTab === 'payouts' && payouts.length === 0 && (
            <div className="bg-white rounded-lg border border-slate-100 p-10 flex flex-col items-center justify-center text-center animate-fade-in-up mt-2">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3 border border-slate-100">
                <Wallet className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-[16px] font-semibold text-black">
                No payouts yet
              </h3>
              <p className="text-[14px] text-black mt-1 max-w-[250px]">
                You haven't requested any payouts yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
