"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

interface InteractiveMapProps {
  tileLayerType: "light" | "osm" | "dark";
  onMapReady?: (map: any) => void;
}

export default function InteractiveMap({ tileLayerType }: InteractiveMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  const riderLocation: [number, number] = [37.7749, -122.4194];
  const kitchenLocation: [number, number] = [37.7833, -122.4167];
  const customerLocation: [number, number] = [37.7651, -122.4241];

  const routePolyline: [number, number][] = [
    kitchenLocation,
    [37.7790, -122.4180],
    riderLocation,
    [37.7700, -122.4210],
    customerLocation,
  ];

  useEffect(() => {
    let mapInstance: any = null;

    async function setupMap() {
      if (!containerRef.current) return;
      const L = (await import("leaflet")).default;

      // Prevent duplicate container initialization
      if (containerRef.current.dataset.initialized === "true") return;
      containerRef.current.dataset.initialized = "true";

      mapInstance = L.map(containerRef.current, {
        center: riderLocation,
        zoom: 14,
        zoomControl: false,
      });

      const tileUrl =
        tileLayerType === "light"
          ? "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          : tileLayerType === "dark"
          ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

      L.tileLayer(tileUrl, {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(mapInstance);

      // Helper function for custom markers
      const createCustomIcon = (bgColor: string, text: string, iconSvg: string) =>
        L.divIcon({
          className: "custom-leaflet-marker",
          html: `<div style="
            background-color: ${bgColor};
            color: white;
            padding: 8px 12px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 11px;
            box-shadow: 0 4px 14px rgba(0,0,0,0.25);
            border: 2px solid white;
            display: flex;
            align-items: center;
            gap: 6px;
            white-space: nowrap;
          ">
            ${iconSvg}
            <span>${text}</span>
          </div>`,
          iconSize: [120, 36],
          iconAnchor: [60, 18],
        });

      // 1. Kitchen Marker
      const kitchenIcon = createCustomIcon(
        "#1E4E70",
        "Kitchen #K-402",
        `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m2 7 10-5 10 5-10 5z"/><path d="M12 22V12"/><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7"/></svg>`
      );
      L.marker(kitchenLocation, { icon: kitchenIcon })
        .addTo(mapInstance)
        .bindPopup("<b>Moncradel Kitchen #K-402</b><br>Pickup Completed");

      // 2. Rider Location Marker
      const riderIcon = createCustomIcon(
        "#2B6CB0",
        "Rider Vikram (You)",
        `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>`
      );
      L.marker(riderLocation, { icon: riderIcon })
        .addTo(mapInstance)
        .bindPopup("<b>Rider Vikram Singh</b><br>Speed: 28 km/h");

      // 3. Customer Destination Marker
      const customerIcon = createCustomIcon(
        "#1C5E37",
        "Priya Mehta (Next Stop)",
        `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`
      );
      L.marker(customerLocation, { icon: customerIcon })
        .addTo(mapInstance)
        .bindPopup("<b>Priya Mehta</b><br>1.2 km away • 8 mins ETA");

      // 4. Route Polyline
      L.polyline(routePolyline, {
        color: "#1E4E70",
        weight: 5,
        opacity: 0.85,
        dashArray: "8, 8",
      }).addTo(mapInstance);

      mapRef.current = mapInstance;
    }

    setupMap();

    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
      if (containerRef.current) {
        containerRef.current.dataset.initialized = "false";
      }
    };
  }, [tileLayerType]);

  return <div ref={containerRef} className="w-full h-full min-h-screen" />;
}
