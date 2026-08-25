"use client";

import { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { getOrderById } from "@/lib/api/orderApi";
import {
  Navigation as NavIcon,
  Phone,
  Info,
  Compass,
  Layers,
  MapPin,
  Clock,
  Volume2,
  VolumeX,
  Loader2
} from "lucide-react";

const InteractiveMap = dynamic(() => import("@/components/features/InteractiveMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-screen bg-slate-100 flex items-center justify-center text-slate-400 font-medium text-xs">
      Loading Live Interactive Navigation Map...
    </div>
  ),
});

// Haversine formula to simulate straight-line distance
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c; // Distance in km
}

function MapContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [navigating, setNavigating] = useState(false);
  const [muted, setMuted] = useState(false);
  const [tileLayerType, setTileLayerType] = useState<"light" | "osm" | "dark">("light");

  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);

  const [distanceKm, setDistanceKm] = useState<string>("--");
  const [etaMins, setEtaMins] = useState<string>("--");
  const [watchId, setWatchId] = useState<number | null>(null);

  // Fetch Order
  useEffect(() => {
    if (!orderId) {
      setIsLoading(false);
      return;
    }
    const fetchOrder = async () => {
      try {
        const data = await getOrderById(orderId);
        setOrder(data);
      } catch (err) {
        console.error("Failed to fetch order", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  // Setup Socket Connection
  useEffect(() => {
    const token = localStorage.getItem('moncradel_rider_token');
    if (!token) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const socketUrl = apiUrl.replace(/\/api\/?$/, '');
    const newSocket = io(socketUrl, {
      auth: { token }
    });

    newSocket.on('connect', () => {
      console.log('Connected to socket for location updates');
    });

    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Handle Navigation and GPS Tracking
  useEffect(() => {
    if (navigating && socket && orderId) {
      if (!("geolocation" in navigator)) {
        alert("Geolocation is not supported by your browser");
        setNavigating(false);
        return;
      }

      const id = navigator.geolocation.watchPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          // Emit to backend
          socket.emit('location_update', {
            orderId,
            latitude: lat,
            longitude: lng
          });
          
          // TODO: Calculate real distance using Mapbox/Google Maps distance matrix
        },
        (error) => {
          console.error("Error watching position:", error);
          alert("Please enable GPS location permissions to navigate.");
          setNavigating(false);
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
      setWatchId(id);
    } else {
      // Stop navigating
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        setWatchId(null);
      }
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [navigating, socket, orderId]);

  const toggleMapStyle = () => {
    setTileLayerType((prev) => (prev === "light" ? "dark" : prev === "dark" ? "osm" : "light"));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-65px)] bg-slate-100">
        <Loader2 className="w-8 h-8 animate-spin text-[#1E4E70] mb-4" />
        <p className="text-slate-500 font-medium">Loading Navigation Data...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-65px)] bg-slate-100 p-6 text-center">
        <p className="text-slate-500 font-medium">No active order selected.</p>
      </div>
    );
  }

  const customerName = order.parentId?.name || "Customer";
  const customerPhone = order.parentId?.phone || "";
  const address = order.deliveryAddress?.street 
    ? `${order.deliveryAddress.street}, ${order.deliveryAddress.city}`
    : "Delivery Address";

  return (
    <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 -my-6 min-h-[calc(100vh-65px)] flex flex-col justify-between overflow-hidden bg-slate-100">
      <div className="absolute inset-0 z-0 w-full h-full">
        <InteractiveMap tileLayerType={tileLayerType} />
      </div>

      <div className="relative z-20 p-4 flex justify-between items-start">
        <button
          onClick={() => setMuted(!muted)}
          className="bg-white/90 backdrop-blur-md px-3 py-2 rounded-2xl shadow-lg border border-slate-200/80 text-xs font-semibold text-[#1E4E70] flex items-center gap-1.5 cursor-pointer"
        >
          {muted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-[#1E4E70]" />}
          <span>{muted ? "Muted" : "Voice Guidance ON"}</span>
        </button>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => alert("Re-centering map on your live GPS position...")}
            className="w-11 h-11 bg-white rounded-2xl shadow-lg flex items-center justify-center text-[#1E4E70] hover:bg-slate-50 transition-transform active:scale-95 border border-slate-200/80 cursor-pointer"
            title="Re-center on My Location"
          >
            <Compass className="w-5 h-5 text-[#1E4E70]" />
          </button>
          <button
            onClick={toggleMapStyle}
            className="w-11 h-11 bg-white rounded-2xl shadow-lg flex items-center justify-center text-[#1E4E70] hover:bg-slate-50 transition-transform active:scale-95 border border-slate-200/80 cursor-pointer"
            title={`Switch Map Theme`}
          >
            <Layers className="w-5 h-5 text-[#1E4E70]" />
          </button>
        </div>
      </div>

      <div className="relative z-20 max-w-lg mx-auto w-full p-4 mb-16 lg:mb-4">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 border border-slate-200/80 shadow-2xl space-y-4 animate-slideUp">
          <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto"></div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-semibold text-[#1E4E70] uppercase tracking-wider block">
                NEXT STOP: DROP-OFF
              </span>
              <h2 className="text-lg font-semibold text-slate-900 tracking-tight mt-0.5 truncate max-w-[200px]">
                {customerName}
              </h2>
            </div>
            {customerPhone && (
              <a
                href={`tel:${customerPhone}`}
                className="w-11 h-11 rounded-full bg-[#A5D8FF]/30 text-[#1E4E70] border border-[#A5D8FF]/60 flex items-center justify-center shadow-xs hover:bg-[#A5D8FF]/50 transition-colors shrink-0"
              >
                <Phone className="w-5 h-5 fill-current text-[#1E4E70]" />
              </a>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-[#FFD1DC]/40 px-3 py-1.5 rounded-full text-xs font-semibold text-[#1E4E70] border border-[#FFD1DC] flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#1E4E70]" />
              <span>{navigating ? distanceKm : (order.distanceKm || "2.5")} km</span>
            </div>
            <div className="bg-[#A5D8FF]/30 px-3 py-1.5 rounded-full text-xs font-semibold text-[#1E4E70] border border-[#A5D8FF]/60 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#1E4E70]" />
              <span>{navigating ? etaMins : "12"} mins</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={() => setNavigating(!navigating)}
              className={`flex-1 font-semibold text-xs py-3.5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                navigating 
                  ? "bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200"
                  : "bg-[#1E4E70] hover:bg-[#153852] text-white border-[#1E4E70]"
              }`}
            >
              <NavIcon className={`w-4 h-4 ${navigating ? "text-rose-500" : "text-[#A5D8FF]"}`} />
              <span>{navigating ? "Stop Navigation" : "Start Navigation"}</span>
            </button>

            <button
              onClick={() => alert(`Address: ${address}\nNotes: ${order.deliveryInstructions || 'None'}`)}
              className="w-12 h-12 bg-[#FFD1DC]/30 hover:bg-[#FFD1DC]/60 text-[#1E4E70] rounded-2xl border border-[#FFD1DC] flex items-center justify-center shrink-0 transition-colors cursor-pointer"
            >
              <Info className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MapPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <MapContent />
    </Suspense>
  );
}
