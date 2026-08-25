"use client";

import { WifiOff, RefreshCcw } from "lucide-react";

export default function OfflineFallback() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-[#1E4E70]/10 p-6 rounded-full mb-6 animate-pulse">
        <WifiOff className="w-16 h-16 text-[#1E4E70]" />
      </div>
      
      <h2 className="text-2xl font-bold text-slate-800 mb-3">
        You're Offline
      </h2>
      <p className="text-slate-600 max-w-md mb-8">
        It looks like you've lost your internet connection. We cannot assign you new deliveries until you reconnect.
      </p>
      
      <button 
        onClick={() => window.location.reload()}
        className="flex items-center gap-2 bg-[#1E4E70] hover:bg-[#153852] text-white px-6 py-3 rounded-xl font-medium transition-colors"
      >
        <RefreshCcw className="w-4 h-4" />
        Retry Connection
      </button>
    </div>
  );
}
