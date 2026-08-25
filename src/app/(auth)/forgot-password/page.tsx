"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Lock, Eye, EyeOff, ShieldCheck, MapPin } from "lucide-react";
import MobileForgotPassword from "@/components/mobile/MobileForgotPassword";

export default function ForgotPasswordPage() {
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
    <>
      {/* Mobile Fallback: Mobile Flow */}
      <div className="flex md:hidden min-h-screen w-full bg-white">
        <MobileForgotPassword />
      </div>

      {/* Desktop Forgot Password */}
      <div className="hidden md:flex h-screen w-full relative font-sans overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/image.png"
            alt="Delivery Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-white/40"></div>
          <div className="absolute inset-y-0 left-0 w-3/5 bg-gradient-to-r from-white/95 via-white/70 to-transparent"></div>
        </div>

        <div className="relative z-10 w-full flex flex-row h-full">

          {/* Left Side Content */}
          <div className="flex-1 flex flex-col justify-center px-12 lg:px-24">
            <div className="max-w-md animate-slide-in-left" style={{ opacity: 0 }}>
              {/* Logo */}
              <div className="mb-8">
                <Image
                  src="/logo.png"
                  alt="Moncradel Logo"
                  width={200}
                  height={50}
                  className="h-12 w-auto object-contain"
                  priority
                />
              </div>

              {/* Heading */}
              <h1 className="text-4xl lg:text-5xl font-serif text-slate-800 mb-3 tracking-tight">
                Account <span className="text-[#1E4E70]">Recovery</span>
              </h1>
              <p className="text-slate-500 text-lg">
                {step === 1 
                  ? "Enter your email to receive an OTP" 
                  : step === 2 
                    ? "Enter the OTP sent to your email" 
                    : "Create a strong new password"}
              </p>

              {/* Features */}
              <div className="space-y-6 mt-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#1E4E70] flex items-center justify-center shrink-0 shadow-lg shadow-black/10">
                    <ShieldCheck className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-medium text-black text-[16px]">Secure OTP Verification</h3>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#1E4E70] flex items-center justify-center shrink-0 shadow-lg shadow-black/10">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-medium text-black text-[16px]">Get back on the road</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side Form */}
          <div className="flex-[0.8] lg:flex-1 flex items-center justify-center p-8">
            <div className="w-full max-w-[420px] bg-white/95 backdrop-blur-xl rounded-[24px] shadow-2xl border border-white p-8 lg:p-10">
              
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800">
                  {step === 1 ? "Reset Password" : step === 2 ? "Enter OTP" : "New Password"}
                </h2>
                <p className="text-sm text-slate-500 font-medium mt-1">
                  {step === 1 
                    ? "Enter your email to receive an OTP" 
                    : step === 2 
                      ? "Enter the OTP sent to your email" 
                      : "Create a strong new password"}
                </p>
              </div>

              {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-[13px] font-medium p-3 rounded-xl text-center mb-6">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="bg-green-50 border border-green-200 text-green-600 text-[13px] font-medium p-3 rounded-xl text-center mb-6">
                  {successMsg}
                </div>
              )}

              {step === 1 && (
                <form onSubmit={handleRequestOtp} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[14px] font-semibold text-slate-800 ml-1">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-400" strokeWidth={1.5} />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-[15px] font-medium text-slate-900 focus:outline-none focus:ring-0 focus:border-[#A5D8FF] transition-all"
                        placeholder="Enter your registered email"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#1E4E70] text-white rounded-xl py-3.5 text-[15px] font-semibold hover:bg-[#153a54] active:scale-[0.98] transition-all flex items-center justify-center shadow-lg shadow-[#1E4E70]/30 disabled:opacity-70"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset Code"}
                  </button>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={handleVerifyOtp} className="space-y-6 pt-2">
                  <div className="space-y-4 text-center">
                    <label className="text-[14px] font-semibold text-slate-800 block mb-3">Enter 4-Digit OTP</label>
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
                          className="w-14 h-14 bg-white border border-slate-200 rounded-xl text-slate-900 text-2xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-[#A5D8FF] focus:border-[#A5D8FF] transition-all"
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={otp.join('').length !== 4}
                    className="w-full bg-[#1E4E70] text-white rounded-xl py-3.5 text-[15px] font-semibold hover:bg-[#153a54] active:scale-[0.98] transition-all flex items-center justify-center shadow-lg shadow-[#1E4E70]/30 disabled:opacity-70"
                  >
                    Verify OTP
                  </button>

                  <div className="text-center mt-5">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isLoading}
                      className="text-[14px] font-medium text-slate-500 hover:text-[#1E4E70] transition-colors"
                    >
                      Didn't receive the code? <span className="font-semibold text-[#1E4E70]">Resend OTP</span>
                    </button>
                  </div>
                </form>
              )}

              {step === 3 && (
                <form onSubmit={handleResetPassword} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[14px] font-semibold text-slate-800 ml-1">New Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400" strokeWidth={1.5} />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-12 pr-12 py-3.5 bg-white border border-slate-200 rounded-xl text-[15px] font-medium text-slate-900 focus:outline-none focus:ring-0 focus:border-[#A5D8FF] transition-all"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#1E4E70] text-white rounded-xl py-3.5 text-[15px] font-semibold hover:bg-[#153a54] active:scale-[0.98] transition-all flex items-center justify-center shadow-lg shadow-[#1E4E70]/30 disabled:opacity-70"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Reset Password"}
                  </button>
                </form>
              )}

              <div className="mt-8 text-center">
                <p className="text-[14px] text-slate-500 font-medium">
                  Remembered your password?{" "}
                  <Link href="/login" className="text-[#1E4E70] font-bold hover:underline">
                    Back to Login
                  </Link>
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
