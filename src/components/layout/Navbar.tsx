import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  Bell,
  Cloud,
  Layers,
  RotateCcw,
  Smartphone,
  UserCheck,
  Zap,
  Server,
} from 'lucide-react';
import { CloudinarySettingsModal } from '../common/CloudinarySettingsModal';

export const Navbar: React.FC = () => {
  const {
    currentRole,
    setCurrentRole,
    currentUser,
    agents,
    setCurrentUser,
    notifications,
    markNotificationAsRead,
    resetToSampleData,
    cloudinaryConfig,
    isApiConnected,
    refreshBackendData,
  } = useFinance();

  const [showCloudinaryModal, setShowCloudinaryModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
        {/* Brand & System Mode */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-lg shadow-emerald-500/20">
            <Zap className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white tracking-tight">FinFlow</span>
              <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Finance ERP v2.4
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Weekly & Monthly Microfinance Operations
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Real-time API Connection Pill */}
          <button
            onClick={() => refreshBackendData()}
            title={isApiConnected ? 'Connected to PostgreSQL REST API' : 'Click to reconnect to backend'}
            className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition ${
              isApiConnected
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>{isApiConnected ? 'REST API Online' : 'Hybrid Local Mode'}</span>
            <span
              className={`w-2 h-2 rounded-full ${
                isApiConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            ></span>
          </button>

          {/* Role Switcher Pill */}
          <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700/60 shadow-inner">
            <button
              onClick={() => setCurrentRole('ADMIN')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentRole === 'ADMIN'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </button>
            <button
              onClick={() => setCurrentRole('AGENT')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentRole === 'AGENT'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Agent Mode</span>
            </button>
          </div>

          {/* Active Agent Selector if in Agent Role */}
          {currentRole === 'AGENT' && (
            <select
              value={currentUser.id}
              onChange={(e) => {
                const found = agents.find((a) => a.id === e.target.value);
                if (found) setCurrentUser(found);
              }}
              className="bg-slate-800 border border-emerald-500/30 text-emerald-400 text-xs font-medium rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name.split(' ')[0]} ({agent.id})
                </option>
              ))}
            </select>
          )}

          {/* Cloudinary Integration Button */}
          <button
            onClick={() => setShowCloudinaryModal(true)}
            title="Cloudinary Storage Settings"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs transition"
          >
            <Cloud className={`w-3.5 h-3.5 ${cloudinaryConfig.isConfigured ? 'text-sky-400' : 'text-slate-400'}`} />
            <span className="hidden md:inline">Cloudinary</span>
            {cloudinaryConfig.isConfigured && (
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
            )}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <Bell className="w-4 h-4 text-emerald-400" /> Notifications
                  </h4>
                  <span className="text-xs text-slate-400">{notifications.length} alerts</span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60 my-2">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">No notifications</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationAsRead(n.id)}
                        className={`p-3 rounded-xl transition cursor-pointer ${
                          n.read ? 'opacity-60 bg-transparent' : 'bg-slate-800/40 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              n.type === 'OVERDUE'
                                ? 'bg-rose-500/20 text-rose-400'
                                : n.type === 'DUE_SOON'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-emerald-500/20 text-emerald-400'
                            }`}
                          >
                            {n.type}
                          </span>
                          <span className="text-[10px] text-slate-500">Just now</span>
                        </div>
                        <h5 className="text-xs font-semibold text-white mt-1">{n.title}</h5>
                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Reset Demo Data Button */}
          <button
            onClick={() => {
              if (confirm('Reset system data to initial sample records?')) {
                resetToSampleData();
              }
            }}
            title="Reset to Sample Demo Data"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Current User Badge */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full ring-2 ring-emerald-500/40 object-cover"
            />
            <div className="hidden lg:block text-left">
              <div className="text-xs font-semibold text-white truncate max-w-[130px]">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                <UserCheck className="w-2.5 h-2.5" />
                {currentUser.role}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Cloudinary Modal */}
      {showCloudinaryModal && (
        <CloudinarySettingsModal onClose={() => setShowCloudinaryModal(false)} />
      )}
    </>
  );
};
