import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { User, UserStatus } from '../../types';
import { X, UserPlus, KeyRound, MapPin, Target, Sparkles } from 'lucide-react';

interface Props {
  agent?: User | null;
  onClose: () => void;
}

export const AgentModal: React.FC<Props> = ({ agent, onClose }) => {
  const { createAgent, updateAgent } = useFinance();

  const [name, setName] = useState(agent?.name || '');
  const [mobile, setMobile] = useState(agent?.mobile || '');
  const [pinCode, setPinCode] = useState(agent?.pinCode || '');
  const [assignedArea, setAssignedArea] = useState(agent?.assignedArea || 'Kukatpally & KPHB Zone');
  const [targetDailyCollection, setTargetDailyCollection] = useState<number>(
    agent?.targetDailyCollection || 25000
  );
  const [status, setStatus] = useState<UserStatus>(agent?.status || 'ACTIVE');

  const generateRandomPin = () => {
    const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
    setPinCode(randomPin);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (pinCode.length !== 4 || !/^\d+$/.test(pinCode)) {
      alert('PIN must be exactly 4 digits');
      return;
    }

    if (agent) {
      updateAgent(agent.id, {
        name,
        mobile,
        pinCode,
        assignedArea,
        targetDailyCollection,
        status,
      });
    } else {
      createAgent({
        name,
        mobile,
        pinCode,
        assignedArea,
        targetDailyCollection,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {agent ? `Edit Agent: ${agent.name}` : 'Create Field Collection Agent'}
              </h2>
              <p className="text-xs text-slate-400">
                Setup agent credentials, 4-digit quick login PIN & collection quota
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Agent Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Kumar Reddy"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Mobile Number (Username) *
              </label>
              <input
                type="tel"
                required
                placeholder="9876543210"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                  <span>4-Digit Login PIN *</span>
                </label>
                <button
                  type="button"
                  onClick={generateRandomPin}
                  className="text-[10px] text-emerald-400 hover:underline flex items-center gap-0.5"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Generate</span>
                </button>
              </div>
              <input
                type="text"
                required
                maxLength={4}
                placeholder="e.g. 1234"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold tracking-widest text-emerald-400 text-center focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-teal-400" />
                <span>Assigned Field Territory / Area</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Kukatpally West Zone"
                value={assignedArea}
                onChange={(e) => setAssignedArea(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-amber-400" />
                <span>Daily Collection Target (INR)</span>
              </label>
              <input
                type="number"
                step="1000"
                value={targetDailyCollection}
                onChange={(e) => setTargetDailyCollection(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {agent && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Agent Account Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as UserStatus)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
              </select>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20 transition"
            >
              {agent ? 'Update Agent Profile' : 'Create Agent & PIN'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
