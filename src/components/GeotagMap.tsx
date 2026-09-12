import React from 'react';

interface GeotagProps {
  lat: number;
  lng: number;
}

export default function GeotagMap({ lat, lng }: GeotagProps) {
  const mapUrl = `https://www.google.com/maps?q=${lat},${lng}&hl=en&z=15&output=embed`;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-[11px] text-slate-500">
        <span className="font-semibold text-slate-700">GPS Residence Geotag:</span>
        <span className="font-mono text-slate-600">{lat.toFixed(4)}° N, {lng.toFixed(4)}° E</span>
      </div>
      <div className="w-full h-32 rounded-lg overflow-hidden border border-slate-300 relative">
        <iframe
          src={mapUrl}
          title="Candidate Geotag Location"
          className="w-full h-full border-0"
          loading="lazy"
        />
      </div>
    </div>
  );
}