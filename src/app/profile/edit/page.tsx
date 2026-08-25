"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  User,
  ShieldCheck,
  Bike,
  CreditCard,
  Save,
  CheckCircle2,
  Camera,
  ArrowLeft,
  Lock,
  Phone,
  Mail,
  MapPin,
  FileText
} from "lucide-react";

export default function EditProfilePage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("Rider Vikram Singh");
  const [phone, setPhone] = useState("9876543210");
  const [email, setEmail] = useState("vikram.singh@moncradel.com");
  const [emergencyPhone, setEmergencyPhone] = useState("9811122334");

  const [city, setCity] = useState("Mumbai");
  const [vehicleType, setVehicleType] = useState("EV Scooter");
  const [vehicleNumber, setVehicleNumber] = useState("MH-02-EV-9021");
  const [licenseNumber, setLicenseNumber] = useState("MH-02-20230091823");

  const [upiId, setUpiId] = useState("vikram@okicici");
  const [bankAccount, setBankAccount] = useState("9820149021");
  const [ifscCode, setIfscCode] = useState("ICIC0009201");

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedData = localStorage.getItem("moncradel_rider_profile");
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          if (parsed.fullName) setFullName(parsed.fullName);
          if (parsed.phone) setPhone(parsed.phone);
          if (parsed.email) setEmail(parsed.email);
          if (parsed.city) setCity(parsed.city);
          if (parsed.vehicleType) setVehicleType(parsed.vehicleType);
          if (parsed.vehicleNumber) setVehicleNumber(parsed.vehicleNumber);
          if (parsed.licenseNumber) setLicenseNumber(parsed.licenseNumber);
          if (parsed.upiId) setUpiId(parsed.upiId);
          if (parsed.bankAccount) setBankAccount(parsed.bankAccount);
          if (parsed.ifscCode) setIfscCode(parsed.ifscCode);
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const profileData = {
      fullName,
      phone,
      email,
      emergencyPhone,
      city,
      vehicleType,
      vehicleNumber,
      licenseNumber,
      upiId,
      bankAccount,
      ifscCode,
    };

    if (typeof window !== "undefined") {
      localStorage.setItem("moncradel_rider_profile", JSON.stringify(profileData));
    }

    setSaved(true);
    setTimeout(() => {
      router.push("/profile");
    }, 1200);
  };

  return (
    <div className="space-y-4 pb-20 max-w-2xl mx-auto font-sans animate-fadeIn">
      
      {/* Main Edit Profile Form Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-6">
        
        {/* Rider Photo Upload */}
        <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#1E4E70] relative">
              <Image
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
                alt="Rider Vikram"
                width={64}
                height={64}
                className="object-cover w-full h-full"
              />
            </div>
            <button
              onClick={() => alert("Select photo from gallery or take camera photo.")}
              className="absolute bottom-0 right-0 p-1.5 bg-[#1E4E70] text-white rounded-full border border-white cursor-pointer hover:bg-[#153852]"
              title="Change Rider Photo"
            >
              <Camera className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-0.5">
            <h3 className="text-sm font-semibold text-slate-900">Rider Avatar Photo</h3>
            <p className="text-xs text-slate-500 font-normal">
              High resolution photo for customer verification at delivery doorstep.
            </p>
          </div>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSaveProfile} className="space-y-5">
          
          {/* Section 1: Personal Info */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#1E4E70]" />
              <span>Personal Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[10px] font-medium text-slate-500 uppercase">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1E4E70]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-medium text-slate-500 uppercase">
                  Mobile Phone Number
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1E4E70]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-medium text-slate-500 uppercase">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1E4E70]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-medium text-slate-500 uppercase">
                  Emergency Contact Helpline
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  required
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value.replace(/\D/g, ""))}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1E4E70]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Vehicle Credentials */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Bike className="w-3.5 h-3.5 text-[#1E4E70]" />
              <span>Vehicle Credentials & License</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[10px] font-medium text-slate-500 uppercase">
                  Operating City Zone
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1E4E70]"
                >
                  <option value="Mumbai">Mumbai & Suburbs</option>
                  <option value="Delhi NCR">Delhi NCR</option>
                  <option value="Bangalore">Bengaluru</option>
                  <option value="Pune">Pune</option>
                  <option value="Hyderabad">Hyderabad</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-medium text-slate-500 uppercase">
                  Vehicle Type
                </label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1E4E70]"
                >
                  <option value="EV Scooter">Electric EV Scooter</option>
                  <option value="Petrol Bike">Petrol Motorcycle</option>
                  <option value="Bicycle">Bicycle</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-medium text-slate-500 uppercase">
                  Vehicle Registration No.
                </label>
                <input
                  type="text"
                  required
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1E4E70]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-medium text-slate-500 uppercase">
                  Driving License Number
                </label>
                <input
                  type="text"
                  required
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1E4E70]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Instant UPI Payout Account */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-[#1E4E70]" />
              <span>Instant 24x7 UPI Payout Account</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1 sm:col-span-2">
                <label className="block text-[10px] font-medium text-slate-500 uppercase">
                  Registered Instant UPI VPA ID
                </label>
                <input
                  type="text"
                  required
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="vikram@okicici"
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#1E4E70] focus:outline-none focus:ring-1 focus:ring-[#1E4E70]"
                />
              </div>
            </div>
          </div>

          {/* Verification Badges */}
          <div className="pt-2 flex flex-wrap items-center gap-2 text-[10px] font-medium text-emerald-800">
            <span className="bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">Driving License Verified ✓</span>
            <span className="bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">Aadhaar Verified ✓</span>
            <span className="bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">RC Book Verified ✓</span>
          </div>

          {/* Save Button */}
          <div className="pt-2 space-y-2">
            {saved && (
              <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-200 text-center text-xs font-semibold animate-fadeIn flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Profile Updated & Saved! Redirecting...</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#1E4E70] hover:bg-[#153852] text-white font-semibold text-xs py-3.5 rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Save className="w-4 h-4 text-[#A5D8FF]" />
              <span>SAVE & APPLY PROFILE UPDATES</span>
            </button>
          </div>

        </form>

      </div>

    </div>
  );
}
