"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Mail, Lock, Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react";

export default function MobileForgotPassword() {
  const router = useRouter();
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [serverOtp, setServerOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 3) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${apiUrl}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMsg(data.message || "OTP sent successfully!");
        if (data.otp) setServerOtp(data.otp);
        setStep(2);
      } else {
        setErrorMsg(data.message || "Failed to send OTP.");
      }
    } catch (err) {
      setErrorMsg("Error connecting to server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) return;

    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${apiUrl}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMsg(data.message || "OTP resent successfully!");
        if (data.otp) setServerOtp(data.otp);
      } else {
        setErrorMsg(data.message || "Failed to resend OTP.");
      }
    } catch (err) {
      setErrorMsg("Error connecting to server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 4) return;
    
    if (serverOtp && enteredOtp !== serverOtp) {
      setErrorMsg("Invalid OTP. Please try again.");
      return;
    }
    
    setErrorMsg("");
    setStep(3);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 4 || !newPassword) return;

    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${apiUrl}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          otp: otpString, 
          password: newPassword,
          confirmPassword: newPassword 
        }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMsg("Password reset successful! Redirecting...");
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } else {
        setErrorMsg(data.message || "Failed to reset password.");
      }
    } catch (err) {
      setErrorMsg("Error connecting to server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-white relative px-4 py-6 overflow-hidden font-sans">
      
      {/* Back Button (Absolute Top Left) */}
      <button 
        onClick={() => step === 2 ? setStep(1) : router.push("/login")}
        className="absolute top-6 left-4 w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors z-20"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="w-full flex flex-col h-full max-w-sm mx-auto relative z-10">
        
        {/* Spacer above logo */}
        <div className="flex-[0.5] min-h-[0.5rem]" />

        {/* Top Section: Logo */}
        <div className="flex-shrink-0 w-full flex items-center justify-center opacity-0 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <Image 
            src="/logo.png" 
            alt="Moncradel Logo" 
            width={200} 
            height={50} 
            className="h-12 w-auto object-contain"
            priority
          />
        </div>

        {/* Spacer between logo and titles */}
        <div className="flex-[0.8] min-h-[1.5rem]" />

        {/* Title Section */}
        <div className="flex-shrink-0 w-full text-center mb-8 space-y-2 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-[26px] font-semibold text-slate-800 tracking-tight">
            {step === 1 ? "Reset Password" : step === 2 ? "Enter OTP" : "New Password"}
          </h2>
          <p className="text-[13px] font-medium text-slate-500">
            {step === 1 
              ? "Enter your email to receive an OTP" 
              : step === 2 
                ? "Enter the OTP sent to your email" 
                : "Create a strong new password"}
          </p>
        </div>

        {/* Form Section */}
        <div className="flex-shrink-0 w-full opacity-0 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-[12px] font-medium p-2 rounded-xl text-center mb-4">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="bg-green-50 border border-green-200 text-green-600 text-[12px] font-medium p-2 rounded-xl text-center mb-4">
              {successMsg}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="flex flex-col space-y-5">
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-slate-700 ml-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400" strokeWidth={2} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 bg-white border border-slate-200 rounded-[14px] text-slate-900 text-[14px] font-medium focus:outline-none focus:ring-0 focus:border-[#A5D8FF] transition-all"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1E4E70] text-white rounded-[14px] py-3.5 text-[15px] font-semibold active:scale-[0.98] transition-transform flex items-center justify-center mt-2 disabled:opacity-70"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send OTP"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="flex flex-col space-y-6 pt-2">
              <div className="space-y-4 text-center">
                <label className="text-[13px] font-medium text-slate-700 block mb-3">Enter 4-Digit OTP</label>
                <div className="flex justify-center gap-3">
                  {[0, 1, 2, 3].map((index) => (
                    <input
                      key={index}
                      ref={otpRefs[index]}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={otp[index]}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-12 bg-white border border-slate-200 rounded-[12px] text-slate-900 text-xl font-semibold text-center focus:outline-none focus:ring-1 focus:ring-[#A5D8FF] focus:border-[#A5D8FF] transition-all"
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={otp.join('').length !== 4}
                className="w-full bg-[#1E4E70] text-white rounded-[14px] py-3.5 text-[15px] font-semibold active:scale-[0.98] transition-transform flex items-center justify-center mt-2 disabled:opacity-70"
              >
                Verify OTP
              </button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isLoading}
                  className="text-[13px] font-medium text-slate-500 hover:text-[#1E4E70] transition-colors"
                >
                  Didn't receive the code? <span className="font-semibold text-[#1E4E70]">Resend OTP</span>
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="flex flex-col space-y-5">
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-slate-700 ml-1">New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" strokeWidth={2} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-white border border-slate-200 rounded-[14px] text-slate-900 text-[14px] font-medium focus:outline-none focus:ring-0 focus:border-[#A5D8FF] transition-all"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1E4E70] text-white rounded-[14px] py-3.5 text-[15px] font-semibold active:scale-[0.98] transition-transform flex items-center justify-center mt-2 disabled:opacity-70"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Reset Password"}
              </button>
            </form>
          )}

        </div>

        {/* Flexible space at bottom */}
        <div className="flex-[1.5]" />

      </div>
    </div>
  );
}
