"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Lock, ArrowRight, Eye, EyeOff, User, Phone, Bike, MapPin, ShieldCheck } from "lucide-react";
import MobileAuthFlow from "@/components/mobile/MobileAuthFlow";

export default function RegisterPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [regStep, setRegStep] = useState<1 | 2>(1);
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);

  const [regEmail, setRegEmail] = useState("");
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regOtp, setRegOtp] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("moncradel_rider_logged_in") === "true";
    if (isLoggedIn) {
      router.push("/");
    }
  }, [router]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors: { [key: string]: string } = {};
    if (!regName) errors.name = "Full Name is required";
    if (!regPhone) {
      errors.phone = "Phone number is required";
    } else if (regPhone.length !== 10 || !/^\d{10}$/.test(regPhone)) {
      errors.phone = "Enter a valid 10-digit number";
    }
    
    if (!regEmail) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail)) {
      errors.email = "Invalid email format";
    }

    if (!regPassword) {
      errors.password = "Password is required";
    } else if (regPassword.length < 6) {
      errors.password = "Must be at least 6 characters";
    }

    if (!regConfirmPassword) {
      errors.confirmPassword = "Confirm password is required";
    } else if (regPassword !== regConfirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsLoading(true);
    setErrorMsg("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${apiUrl}/auth/send-register-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: regEmail }),
      });
      const data = await res.json();

      if (data.success) {
        setRegStep(2);
      } else {
        setErrorMsg(data.message || "Failed to send OTP.");
      }
    } catch (err) {
      console.log("Register error:", err);
      setErrorMsg("Error connecting to server.");
    }

    setIsLoading(false);
  };

  const handleResendOtp = async () => {
    if (!regEmail) return;

    setIsLoading(true);
    setErrorMsg("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${apiUrl}/auth/send-register-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: regEmail }),
      });
      const data = await res.json();

      if (!data.success) {
        setErrorMsg(data.message || "Failed to resend OTP.");
      }
    } catch (err) {
      console.log("Resend OTP error:", err);
      setErrorMsg("Error connecting to server.");
    }

    setIsLoading(false);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regOtp) return;

    setIsLoading(true);
    setErrorMsg("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${apiUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: regEmail,
          name: regName,
          phone: regPhone,
          password: regPassword,
          otp: regOtp,
          role: "delivery"
        }),
      });
      const data = await res.json();

      if (data.success && data.token) {
        router.push("/login");
      } else {
        setErrorMsg(data.message || "Registration failed.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Error connecting to server.");
    }

    setIsLoading(false);
  };

  return (
    <>
      {/* Mobile Fallback: Splash Screen & Mobile Flow */}
      <div className="flex md:hidden min-h-screen w-full bg-[#F8F9FA]">
        <MobileAuthFlow initialMode="register" />
      </div>

      {/* Desktop Register */}
      <div className="hidden md:flex h-screen w-full relative font-sans overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 bg-[#F8F9FA]">
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
          <div className="flex-1 flex flex-col justify-center px-12 lg:px-24 hidden lg:flex">
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

              <h1 className="text-4xl lg:text-5xl font-serif text-slate-800 mb-3 tracking-tight">
                Join <span className="text-[#1E4E70]">Moncradel</span>
              </h1>
              <p className="text-slate-600 font-medium text-[14px] leading-relaxed mb-8">
                Become a verified delivery partner. Enjoy flexible working hours, guaranteed earnings, and be part of a mission delivering care.
              </p>

              <div className="space-y-6 mt-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#1E4E70] flex items-center justify-center shrink-0 shadow-lg shadow-black/10">
                    <Bike className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-medium text-black text-[16px]">Drive on your schedule</h3>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#1E4E70] flex items-center justify-center shrink-0 shadow-lg shadow-black/10">
                    <ShieldCheck className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-medium text-black text-[16px]">Safe and secure</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side Form */}
          <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8">

            <div className="w-full max-w-[500px] bg-white rounded-[24px] p-6 lg:p-8 relative z-10 animate-slide-in-from-right transition-all duration-500" style={{ opacity: 0 }}>

              <div className="mb-4">
                <h2 className="text-[26px] lg:text-[28px] font-serif text-slate-900 mb-1">
                  {regStep === 1 ? "Create Account" : "Verify Email"}
                </h2>
                <p className="text-[14px] lg:text-[15px] font-medium text-slate-500">
                  {regStep === 1
                    ? "Fill in your details to get started"
                    : `Enter the OTP sent to ${regEmail}`}
                </p>
              </div>

              {errorMsg && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-[13px] font-medium p-3 rounded-xl mb-4">
                  {errorMsg}
                </div>
              )}

              {regStep === 1 && (
                <form onSubmit={handleSendOtp} className="space-y-4">

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[14px] font-medium text-slate-800 ml-1">Full Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <User className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                          type="text"
                          required
                          value={regName}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                            setRegName(val);
                          }}
                          className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-slate-900 text-[15px] font-medium focus:outline-none focus:ring-0 transition-all ${
                            fieldErrors.name ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-[#A5D8FF]"
                          }`}
                          placeholder="Enter your full name"
                        />
                      </div>
                      {fieldErrors.name && <p className="text-red-500 text-[12px] font-medium ml-1 mt-1">{fieldErrors.name}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[14px] font-medium text-slate-800 ml-1">Phone Number</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Phone className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                          type="tel"
                          required
                          value={regPhone}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                            setRegPhone(val);
                          }}
                          className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-slate-900 text-[15px] font-medium focus:outline-none focus:ring-0 transition-all ${
                            fieldErrors.phone ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-[#A5D8FF]"
                          }`}
                          placeholder="9876543210"
                        />
                      </div>
                      {fieldErrors.phone && <p className="text-red-500 text-[12px] font-medium ml-1 mt-1">{fieldErrors.phone}</p>}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[14px] font-medium text-slate-800 ml-1">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\s/g, '');
                          setRegEmail(val);
                        }}
                        className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-slate-900 text-[15px] font-medium focus:outline-none focus:ring-0 transition-all ${
                          fieldErrors.email ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-[#A5D8FF]"
                        }`}
                        placeholder="rider@moncradel.com"
                      />
                    </div>
                    {fieldErrors.email && <p className="text-red-500 text-[12px] font-medium ml-1 mt-1">{fieldErrors.email}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[14px] font-medium text-slate-800 ml-1">Password</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Lock className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          className={`w-full pl-10 pr-10 py-3 bg-white border rounded-xl text-slate-900 text-[15px] font-medium focus:outline-none focus:ring-0 transition-all ${
                            fieldErrors.password ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-[#A5D8FF]"
                          }`}
                          placeholder="Password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center cursor-pointer"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4 text-slate-400 hover:text-slate-600 transition-colors" />
                          ) : (
                            <Eye className="w-4 h-4 text-slate-400 hover:text-slate-600 transition-colors" />
                          )}
                        </button>
                      </div>
                      {fieldErrors.password && <p className="text-red-500 text-[12px] font-medium ml-1 mt-1">{fieldErrors.password}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[14px] font-medium text-slate-800 ml-1">Confirm Password</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Lock className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          className={`w-full pl-10 pr-10 py-3 bg-white border rounded-xl text-slate-900 text-[15px] font-medium focus:outline-none focus:ring-0 transition-all ${
                            fieldErrors.confirmPassword ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-[#A5D8FF]"
                          }`}
                          placeholder="Confirm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center cursor-pointer"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4 text-slate-400 hover:text-slate-600 transition-colors" />
                          ) : (
                            <Eye className="w-4 h-4 text-slate-400 hover:text-slate-600 transition-colors" />
                          )}
                        </button>
                      </div>
                    </div>
                    {fieldErrors.password && <p className="text-red-500 text-[12px] font-medium ml-1 mt-1">{fieldErrors.password}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#1E4E70] text-white py-3.5 rounded-xl font-medium text-[16px] shadow-md shadow-[#1E4E70]/10 hover:bg-[#153852] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70 group"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                      <>
                        Create Account
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {regStep === 2 && (
                <form onSubmit={handleRegisterSubmit} className="space-y-6 pt-2">
                  <div className="space-y-3 text-center">
                    <label className="text-[14px] font-semibold text-slate-700 block mb-3">Enter 4-Digit OTP</label>
                    <input
                      type="text"
                      required
                      maxLength={4}
                      value={regOtp}
                      onChange={(e) => setRegOtp(e.target.value.replace(/\D/g, ""))}
                      className="w-full max-w-[200px] mx-auto block px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-2xl font-bold tracking-[0.5em] text-center focus:outline-none focus:ring-0 focus:border-[#A5D8FF]"
                      placeholder="0000"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || regOtp.length !== 4}
                    className="w-full bg-[#1E4E70] text-white py-3.5 rounded-xl font-medium text-[16px] shadow-md shadow-[#1E4E70]/10 hover:bg-[#153852] transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-70 group"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                      <>
                        Verify & Register
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  <div className="text-center mt-4">
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

              <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                <p className="text-[14px] text-slate-600 font-medium">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-[#1E4E70] font-medium hover:underline ml-1 focus:outline-none"
                  >
                    Sign In <ArrowRight className="inline w-3 h-3 mb-0.5 ml-0.5" />
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
