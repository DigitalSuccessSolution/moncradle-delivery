"use client";

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const DeliveryMapInner = dynamic(() => import('./DeliveryMapInner'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center bg-gray-100 rounded-xl" style={{ height: '300px', width: '100%' }}>
      <div className="flex flex-col items-center gap-2 text-gray-500">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="text-sm font-medium">Loading Map...</span>
      </div>
    </div>
  )
});

interface DeliveryMapProps {
  pickup: [number, number]; // [lat, lng]
  dropoff: [number, number]; // [lat, lng]
}

export function DeliveryMap(props: DeliveryMapProps) {
  return <DeliveryMapInner {...props} />;
}
