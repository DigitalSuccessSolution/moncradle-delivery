"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Swal from "sweetalert2";
import {
  User, CheckCircle2, MapPin, Camera, Mail, Phone, Edit2, X, Save, Loader2, Bike, ChevronLeft, ShieldCheck, CreditCard, AlertCircle
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Profile States ---
  const [avatar, setAvatar] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // Vehicle & Compliance
  const [vehicleType, setVehicleType] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState("");
  const [aadharNumber, setAadharNumber] = useState("");
  const [insuranceExpiryDate, setInsuranceExpiryDate] = useState("");

  // Bank Details
  const [bankAccountName, setBankAccountName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankIfscCode, setBankIfscCode] = useState("");
  const [bankName, setBankName] = useState("");

  // Emergency Contact
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyRelation, setEmergencyRelation] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem("moncradel_rider_token");
      if (!token) return;
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_URL}/users/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        const { user, profile } = data;

        // Base user fields
        if (user.name) setFullName(user.name);
        if (user.email) setEmail(user.email);
        if (user.phone) setPhone(user.phone);
        if (user.address) setAddress(user.address);
        if (user.avatar) setAvatar(user.avatar);

        // Partner specific fields
        if (profile) {
          if (profile.vehicleType) setVehicleType(profile.vehicleType);
          if (profile.vehicleNumber) setVehicleNumber(profile.vehicleNumber);
          if (profile.drivingLicenseNumber) setDrivingLicenseNumber(profile.drivingLicenseNumber);
          if (profile.aadharNumber) setAadharNumber(profile.aadharNumber);
          if (profile.insuranceExpiryDate) {
            const dateStr = new Date(profile.insuranceExpiryDate).toISOString().split('T')[0];
            setInsuranceExpiryDate(dateStr);
          }
          if (profile.bankDetails) {
            setBankAccountName(profile.bankDetails.accountName || "");
            setBankAccountNumber(profile.bankDetails.accountNumber || "");
            setBankIfscCode(profile.bankDetails.ifscCode || "");
            setBankName(profile.bankDetails.bankName || "");
          }
          if (profile.emergencyContact) {
            setEmergencyName(profile.emergencyContact.name || "");
            setEmergencyRelation(profile.emergencyContact.relation || "");
            setEmergencyPhone(profile.emergencyContact.phone || "");
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch profile", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (isEditModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isEditModalOpen]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Optimistic preview
      const url = URL.createObjectURL(file);
      setAvatar(url);

      try {
        const token = localStorage.getItem("moncradel_rider_token");
        if (!token) throw new Error("No token found");
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

        const formData = new FormData();
        formData.append('avatar', file);

        const fileRes = await fetch(`${API_URL}/users/profile`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        const fileResult = await fileRes.json();
        if (!fileResult.success) throw new Error(fileResult.message || "Failed to upload photo");

        if (fileResult.user) {
          localStorage.setItem("moncradel_rider_user", JSON.stringify(fileResult.user));
          setAvatar(fileResult.user.avatar);
          window.dispatchEvent(new Event("moncradel-profile-updated"));
        }

        const Toast = Swal.mixin({
          toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true
        });
        Toast.fire({ icon: 'success', title: 'Profile Photo Updated!' });

      } catch (err: any) {
        console.error("Upload failed", err);
        Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#1E4E70' });
        fetchProfile(); // Revert on failure
      }
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const token = localStorage.getItem("moncradel_rider_token");
      if (!token) throw new Error("No authentication token found");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

      // 1. Send JSON data for all text fields
      const payload = {
        name: fullName,
        email,
        phone,
        address,
        vehicleType,
        vehicleNumber,
        drivingLicenseNumber,
        aadharNumber,
        insuranceExpiryDate: insuranceExpiryDate || undefined,
        bankDetails: {
          accountName: bankAccountName,
          accountNumber: bankAccountNumber,
          ifscCode: bankIfscCode,
          bankName: bankName
        },
        emergencyContact: {
          name: emergencyName,
          relation: emergencyRelation,
          phone: emergencyPhone
        }
      };

      const jsonRes = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const jsonResult = await jsonRes.json();
      if (!jsonResult.success) throw new Error(jsonResult.message || "Failed to save profile details");

      // Update local user cache with jsonResult
      if (jsonResult.user) {
        localStorage.setItem("moncradel_rider_user", JSON.stringify(jsonResult.user));
        window.dispatchEvent(new Event("moncradel-profile-updated"));
      }

      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        }
      });
      Toast.fire({
        icon: 'success',
        title: 'Profile Saved Successfully!'
      });
      setIsEditModalOpen(false);
      setAvatarFile(null);
    } catch (err: any) {
      console.error("Failed to save profile", err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Failed to save profile. Please try again.',
        confirmButtonColor: '#1E4E70'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEdit = () => {
    setIsEditModalOpen(false);
    setAvatarFile(null);
    fetchProfile(); // Reset fields to backend state
  };

  const inputClass = "w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-[14px] text-black placeholder-black/30 focus:outline-none focus:border-[#1E4E70] transition-colors";
  const labelClass = "text-[13px] font-medium text-black uppercase tracking-wider mb-1.5 block";

  const DetailRow = ({ label, value, fallback = "Not provided" }: { label: string, value: string, fallback?: string }) => (
    <div>
      <p className="text-[13px] font-medium text-black uppercase tracking-wider mb-1.5 block">{label}</p>
      <p className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-4 py-2.5 text-[14px] text-black">{value || <span className="text-black/40 italic">{fallback}</span>}</p>
    </div>
  );

  return (
    <div className="animate-fade-in-up pb-16 pt-0 md:pt-8 font-sans max-w-7xl mx-auto">
      {/* Mobile Sticky Header (Visible only on Mobile) */}
      <div className="md:hidden sticky top-0 z-40 bg-white flex items-center py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 mb-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#111827]"
        >
          <ChevronLeft className="w-6 h-6" />
          <span className="text-[17px] sm:text-[18px] font-medium text-[#111827]">Partner Profile</span>
        </button>
      </div>



      {/* Desktop Page Header */}
      <div className="hidden md:flex flex-col mb-4 px-1 lg:mb-8">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-900">Partner Profile</h1>
        <p className="text-sm md:text-base lg:text-lg text-gray-500 font-medium mt-1 lg:mt-2">Manage your personal details and vehicle credentials.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#1E4E70]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

          {/* Left Column - Avatar Card */}
          <div className="lg:col-span-4 space-y-4 lg:space-y-6">
            <div className="flex flex-col items-center text-center py-2 lg:p-8 lg:bg-white lg:rounded-2xl lg:border lg:border-slate-200 relative overflow-hidden">
              <div className="hidden lg:block absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-[#1E4E70]/10 to-transparent"></div>

              <div className="relative mt-2 mb-3 lg:mt-4 lg:mb-5">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white bg-slate-100 relative">
                  {avatar ? (
                    <Image src={avatar} alt="Profile" width={128} height={128} className="object-cover w-full h-full" />
                  ) : (
                    <Image
                      src="/delivery_boy_hero.png"
                      alt="Rider"
                      width={128}
                      height={128}
                      className="object-cover w-full h-full"
                    />
                  )}
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 w-9 h-9 bg-white border-2 border-slate-100 rounded-full flex items-center justify-center text-slate-600 hover:text-[#1E4E70] transition-all z-10 cursor-pointer"
                  title="Change Photo"
                >
                  <Camera className="w-4 h-4" />
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                />
              </div>

              <h3 className="text-2xl font-medium text-black tracking-tight mb-3">{fullName || "Not provided"}</h3>

              <div className="flex flex-col items-center gap-1.5 w-full">
                <div className="flex items-center gap-2 text-[14px] text-black/70 justify-center">
                  <Mail className="w-4 h-4 text-[#1E4E70] shrink-0" />
                  <span className="font-medium truncate">{email || "Not provided"}</span>
                </div>
                <div className="flex items-center gap-2 text-[14px] text-black/70 justify-center">
                  <Phone className="w-4 h-4 text-[#1E4E70] shrink-0" />
                  <span className="font-medium truncate">{phone || "Not provided"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Details Display */}
          <div className="lg:col-span-8">
            <div className="lg:bg-white lg:rounded-2xl py-6 lg:p-8 lg:border lg:border-slate-200 relative">

              <div className="flex items-center justify-between mb-8 pb-4">
                <h2 className="text-xl font-medium text-black"> Details</h2>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-black text-[14px] font-medium rounded-lg border border-slate-200 transition-colors"
                >
                  <Edit2 className="w-4 h-4 text-[#1E4E70]" />
                  Edit Details
                </button>
              </div>

              <div className="space-y-10">
                {/* Basic Info */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <User className="w-5 h-5 text-black/70" />
                    <h2 className="text-base font-medium text-black">Basic Information</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                    <DetailRow label="Full Name" value={fullName} />
                    <DetailRow label="Full Address" value={address} />
                  </div>
                </div>

                {/* Vehicle & Compliance */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <ShieldCheck className="w-5 h-5 text-black/70" />
                    <h2 className="text-base font-medium text-black">Identity & Compliance</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                    <DetailRow label="Vehicle Type" value={vehicleType} />
                    <DetailRow label="Vehicle Number" value={vehicleNumber} />
                    <DetailRow label="Driving License No." value={drivingLicenseNumber} />
                    <DetailRow label="Aadhar Number" value={aadharNumber} />
                    <DetailRow label="Insurance Expiry" value={insuranceExpiryDate} />
                  </div>
                </div>

                {/* Bank Details */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard className="w-5 h-5 text-black/70" />
                    <h2 className="text-base font-medium text-black">Bank Details</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                    <DetailRow label="Account Name" value={bankAccountName} />
                    <DetailRow label="Bank Name" value={bankName} />
                    <DetailRow label="Account Number" value={bankAccountNumber} />
                    <DetailRow label="IFSC Code" value={bankIfscCode} />
                  </div>
                </div>

                {/* Emergency Contact */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="w-5 h-5 text-black/70" />
                    <h2 className="text-base font-medium text-black">Emergency Contact</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                    <DetailRow label="Contact Name" value={emergencyName} />
                    <DetailRow label="Relation" value={emergencyRelation} />
                    <DetailRow label="Phone Number" value={emergencyPhone} />
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>
      )}

      {/* Edit Profile Modal */}
      {mounted && isEditModalOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex justify-center items-end sm:items-center p-0 sm:p-4 pointer-events-none">
          <div
            className="fixed inset-0 bg-[#0B1727]/70 pointer-events-auto transition-opacity"
            style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
            onClick={cancelEdit}
          />
          <div className="relative bg-white w-full max-w-[100vw] sm:max-w-2xl h-auto max-h-[90vh] overflow-hidden animate-slide-up border border-slate-200 pointer-events-auto flex flex-col rounded-t-xl sm:rounded-2xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 shrink-0 bg-white">
              <h2 className="text-[18px] font-medium text-gray-900">Edit Partner Details</h2>
              <button onClick={cancelEdit} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-white">
              <form id="editProfileForm" onSubmit={handleSaveProfile} className="space-y-10">

                {/* Section 1: Basic Info */}
                <div>
                  <div className="flex items-center gap-2 pb-3 mb-5">
                    <User className="w-5 h-5 text-black/70" />
                    <h2 className="text-base font-medium text-black">Basic Information</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className={labelClass}>Full Name</label>
                      <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} placeholder="Enter full name" required />
                    </div>
                    <div>
                      <label className={labelClass}>Full Address</label>
                      <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} placeholder="e.g. Andheri, Mumbai" required />
                    </div>
                    <div>
                      <label className={labelClass}>Phone Number</label>
                      <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="9876543210" required />
                    </div>
                    <div>
                      <label className={labelClass}>Email Address</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="john@example.com" required />
                    </div>
                  </div>
                </div>

                {/* Section 2: Identity & Compliance */}
                <div>
                  <div className="flex items-center gap-2 pb-3 mb-5">
                    <ShieldCheck className="w-5 h-5 text-black/70" />
                    <h2 className="text-base font-medium text-black">Identity & Compliance</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className={labelClass}>Vehicle Type</label>
                      <input type="text" value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} className={inputClass} placeholder="e.g. EV Scooter, Petrol Bike" />
                    </div>
                    <div>
                      <label className={labelClass}>Vehicle Number</label>
                      <input type="text" value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} className={inputClass} placeholder="e.g. MH-02-AB-1234" />
                    </div>
                    <div>
                      <label className={labelClass}>Driving License No.</label>
                      <input type="text" value={drivingLicenseNumber} onChange={(e) => setDrivingLicenseNumber(e.target.value)} className={inputClass} placeholder="MH04201100" />
                    </div>
                    <div>
                      <label className={labelClass}>Aadhar Number</label>
                      <input type="text" value={aadharNumber} onChange={(e) => setAadharNumber(e.target.value)} className={inputClass} placeholder="1234 5678 9012" />
                    </div>
                    <div>
                      <label className={labelClass}>Insurance Expiry Date</label>
                      <input type="date" value={insuranceExpiryDate} onChange={(e) => setInsuranceExpiryDate(e.target.value)} className={inputClass} />
                    </div>
                  </div>
                </div>

                {/* Section 3: Bank Details */}
                <div>
                  <div className="flex items-center gap-2 pb-3 mb-5">
                    <CreditCard className="w-5 h-5 text-black/70" />
                    <h2 className="text-base font-medium text-black">Bank Details</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className={labelClass}>Account Name</label>
                      <input type="text" value={bankAccountName} onChange={(e) => setBankAccountName(e.target.value)} className={inputClass} placeholder="As per bank" />
                    </div>
                    <div>
                      <label className={labelClass}>Bank Name</label>
                      <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} className={inputClass} placeholder="e.g. HDFC Bank" />
                    </div>
                    <div>
                      <label className={labelClass}>Account Number</label>
                      <input type="text" value={bankAccountNumber} onChange={(e) => setBankAccountNumber(e.target.value)} className={inputClass} placeholder="0000 0000 0000" />
                    </div>
                    <div>
                      <label className={labelClass}>IFSC Code</label>
                      <input type="text" value={bankIfscCode} onChange={(e) => setBankIfscCode(e.target.value)} className={inputClass} placeholder="HDFC0001234" />
                    </div>
                  </div>
                </div>

                {/* Section 4: Emergency Contact */}
                <div>
                  <div className="flex items-center gap-2 pb-3 mb-5">
                    <AlertCircle className="w-5 h-5 text-black/70" />
                    <h2 className="text-base font-medium text-black">Emergency Contact</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className={labelClass}>Contact Name</label>
                      <input type="text" value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)} className={inputClass} placeholder="Rahul Singh" />
                    </div>
                    <div>
                      <label className={labelClass}>Relation</label>
                      <input type="text" value={emergencyRelation} onChange={(e) => setEmergencyRelation(e.target.value)} className={inputClass} placeholder="e.g. Brother" />
                    </div>
                    <div>
                      <label className={labelClass}>Phone Number</label>
                      <input type="tel" value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} className={inputClass} placeholder="9876543210" />
                    </div>
                  </div>
                </div>

              </form>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 flex gap-3 bg-white shrink-0">
              <button type="button" onClick={cancelEdit} className="flex-1 bg-white border border-gray-200 text-gray-700 font-medium text-[15px] py-2.5 rounded-xl hover:bg-gray-50 transition-all cursor-pointer">
                Cancel
              </button>
              <button type="submit" form="editProfileForm" disabled={isSaving} className="flex-1 bg-[#1E4E70] text-white font-medium text-[15px] py-2.5 rounded-xl hover:bg-[#153a55] transition-all cursor-pointer flex items-center justify-center gap-2">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Changes</>}
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
