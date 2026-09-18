import React, { useEffect, useRef, useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { MapPin } from 'lucide-react';
import L from 'leaflet';

export const GpsTrackingMap: React.FC = () => {
  const { customers, collections, loans, agents } = useFinance();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const [filterMode, setFilterMode] = useState<'ALL' | 'CUSTOMERS' | 'COLLECTIONS'>('ALL');

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default center: Hyderabad / Field Region
      const map = L.map(mapContainerRef.current).setView([17.4375, 78.4482], 12);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> & OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
        map.removeLayer(layer);
      }
    });

    // Custom Icon Creators
    const customerIcon = L.divIcon({
      className: 'custom-customer-pin',
      html: `<div style="background-color: #3b82f6; width: 26px; height: 26px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; font-weight: bold;">👤</div>`,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
    });

    const collectionIcon = L.divIcon({
      className: 'custom-collection-pin',
      html: `<div style="background-color: #10b981; width: 28px; height: 28px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 4px 12px rgba(16,185,129,0.6); display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: bold;">₹</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const bounds = L.latLngBounds([]);

    // 1. Plot Customer Locations
    if (filterMode === 'ALL' || filterMode === 'CUSTOMERS') {
      customers.forEach((cust) => {
        if (cust.latitude && cust.longitude) {
          const marker = L.marker([cust.latitude, cust.longitude], { icon: customerIcon }).addTo(map);
          const activeLoan = loans.find((l) => l.customerId === cust.id && (l.status === 'ACTIVE' || l.status === 'OVERDUE'));

          marker.bindPopup(`
            <div style="font-family: sans-serif; padding: 4px;">
              <strong style="color: #10b981; font-size: 13px;">${cust.name}</strong>
              <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${cust.customerCode} • ${cust.mobile}</div>
              <div style="font-size: 11px; color: #334155; margin-top: 4px;">${cust.address}</div>
              ${
                activeLoan
                  ? `<div style="margin-top: 6px; padding: 4px 8px; background: #f0fdf4; border-radius: 6px; font-size: 10px; font-weight: bold; color: #166534;">
                      Active Loan: ${activeLoan.loanCode} (₹${activeLoan.principalOutstanding.toLocaleString()} Prin)
                    </div>`
                  : `<div style="margin-top: 4px; font-size: 10px; color: #94a3b8;">No active loan</div>`
              }
            </div>
          `);

          bounds.extend([cust.latitude, cust.longitude]);
        }
      });
    }

    // 2. Plot Field Collections
    if (filterMode === 'ALL' || filterMode === 'COLLECTIONS') {
      collections.forEach((col) => {
        if (col.latitude && col.longitude) {
          const marker = L.marker([col.latitude, col.longitude], { icon: collectionIcon }).addTo(map);
          const cust = customers.find((c) => c.id === col.customerId);
          const agent = agents.find((a) => a.id === col.agentId);

          marker.bindPopup(`
            <div style="font-family: sans-serif; padding: 4px;">
              <div style="color: #059669; font-weight: bold; font-size: 13px;">₹${col.amount.toLocaleString()} Collected</div>
              <div style="font-size: 10px; color: #64748b;">Receipt: ${col.receiptNumber} (${col.paymentMethod})</div>
              <div style="font-size: 11px; color: #1e293b; margin-top: 4px;"><strong>Customer:</strong> ${cust?.name || 'Customer'}</div>
              <div style="font-size: 11px; color: #1e293b;"><strong>Agent:</strong> ${agent?.name.split(' ')[0] || 'Agent'}</div>
              <div style="margin-top: 4px; font-size: 9px; color: #059669; font-weight: 600;">GPS Accuracy: ±${col.accuracyMeters || 8}m</div>
            </div>
          `);

          bounds.extend([col.latitude, col.longitude]);
        }
      });
    }

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [customers, collections, loans, agents, filterMode]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <MapPin className="w-6 h-6 text-emerald-400" />
            Field Collection GPS & Route Map
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time geospatial verification of collection transactions & customer visit locations
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setFilterMode('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterMode === 'ALL' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Pins
          </button>
          <button
            onClick={() => setFilterMode('CUSTOMERS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterMode === 'CUSTOMERS' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Customers Only
          </button>
          <button
            onClick={() => setFilterMode('COLLECTIONS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterMode === 'COLLECTIONS' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Collections Only
          </button>
        </div>
      </div>

      {/* Map Card */}
      <div className="glass-card rounded-3xl overflow-hidden border border-slate-800 p-2 shadow-2xl">
        <div className="relative w-full h-[540px] rounded-2xl overflow-hidden">
          <div ref={mapContainerRef} className="w-full h-full" />

          {/* Map Legend Overlay */}
          <div className="absolute bottom-4 left-4 z-[400] p-3 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-800 text-xs text-slate-200 shadow-xl space-y-2">
            <div className="font-bold text-white text-[11px] uppercase tracking-wider">
              Map Legend
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500 border border-white"></span>
              <span>Registered Customer Location</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white"></span>
              <span>GPS Verified Collection Point</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
