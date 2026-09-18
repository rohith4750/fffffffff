import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { User } from '../../types';
import {
  Users,
  Plus,
  KeyRound,
  Eye,
  EyeOff,
  Edit2,
  CheckCircle,
  Ban,
  MapPin,
} from 'lucide-react';
import { AgentModal } from './AgentModal';

export const AgentManagementView: React.FC = () => {
  const { agents, customers, loans, collections, updateAgent, resetAgentPin } = useFinance();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<User | null>(null);
  const [revealedPins, setRevealedPins] = useState<Record<string, boolean>>({});
  const [resetPinAgent, setResetPinAgent] = useState<User | null>(null);
  const [newPinInput, setNewPinInput] = useState('');

  const toggleRevealPin = (agentId: string) => {
    setRevealedPins((prev) => ({ ...prev, [agentId]: !prev[agentId] }));
  };

  const handleSaveResetPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPinAgent) return;
    if (newPinInput.length !== 4 || !/^\d+$/.test(newPinInput)) {
      alert('PIN must be 4 numeric digits');
      return;
    }
    resetAgentPin(resetPinAgent.id, newPinInput);
    setResetPinAgent(null);
    setNewPinInput('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-emerald-400" />
            Field Agent Management & Quick PIN Controls
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create field agents, configure 4-digit mobile login PINs, territories, and collection targets
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold transition shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Agent</span>
        </button>
      </div>

      {/* Agent Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {agents.map((agent) => {
          const assignedCusts = customers.filter((c) => c.assignedAgentId === agent.id);
          const assignedLoans = loans.filter((l) => l.assignedAgentId === agent.id && (l.status === 'ACTIVE' || l.status === 'OVERDUE'));
          const agentCollections = collections.filter((c) => c.agentId === agent.id);
          const totalCollected = agentCollections.reduce((acc, c) => acc + c.amount, 0);
          const isRevealed = !!revealedPins[agent.id];

          return (
            <div
              key={agent.id}
              className="glass-card rounded-3xl p-5 border border-slate-800 hover:border-slate-700 transition space-y-4 relative overflow-hidden"
            >
              {/* Top Banner & Status */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={agent.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                    alt={agent.name}
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-500/50"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-white">{agent.name}</h3>
                    </div>
                    <div className="text-xs text-slate-400">{agent.mobile}</div>
                    <div className="text-[10px] font-mono text-emerald-400 font-semibold">{agent.id}</div>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    agent.status === 'ACTIVE'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  {agent.status}
                </span>
              </div>

              {/* Territory & Target Info */}
              <div className="space-y-2 p-3 rounded-2xl bg-slate-800/40 border border-slate-800 text-xs text-slate-300">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span className="truncate">{agent.assignedArea || 'Central Zone'}</span>
                </div>
                <div className="flex justify-between items-center pt-1.5 border-t border-slate-800 text-[11px]">
                  <span className="text-slate-400">Daily Target:</span>
                  <span className="font-bold text-white">
                    ₹{agent.targetDailyCollection?.toLocaleString('en-IN') || '25,000'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">Total Collected:</span>
                  <span className="font-bold text-emerald-400">
                    ₹{totalCollected.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* 4-Digit Security PIN Widget */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Mobile App PIN</span>
                    <span className="font-mono text-xs font-bold text-emerald-300 tracking-widest">
                      {isRevealed ? agent.pinCode : '••••'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleRevealPin(agent.id)}
                    title={isRevealed ? 'Hide PIN' : 'Reveal PIN'}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                  >
                    {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => {
                      setResetPinAgent(agent);
                      setNewPinInput(agent.pinCode);
                    }}
                    title="Change PIN"
                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold transition"
                  >
                    Reset PIN
                  </button>
                </div>
              </div>

              {/* Assignments Count & Actions */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <div className="text-[11px] text-slate-400">
                  <strong className="text-white">{assignedCusts.length}</strong> Borrowers •{' '}
                  <strong className="text-emerald-400">{assignedLoans.length}</strong> Active Loans
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setEditingAgent(agent)}
                    title="Edit Profile"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {agent.status === 'ACTIVE' ? (
                    <button
                      onClick={() => updateAgent(agent.id, { status: 'SUSPENDED' })}
                      title="Suspend Agent"
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                    >
                      <Ban className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => updateAgent(agent.id, { status: 'ACTIVE' })}
                      title="Activate Agent"
                      className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Agent Modal */}
      {(showAddModal || editingAgent) && (
        <AgentModal
          agent={editingAgent}
          onClose={() => {
            setShowAddModal(false);
            setEditingAgent(null);
          }}
        />
      )}

      {/* Reset PIN Modal */}
      {resetPinAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-emerald-400" />
              Reset Agent PIN ({resetPinAgent.name.split(' ')[0]})
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Set a new 4-digit quick login security PIN for mobile access.
            </p>

            <form onSubmit={handleSaveResetPin} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  New 4-Digit PIN
                </label>
                <input
                  type="text"
                  required
                  maxLength={4}
                  autoFocus
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 text-lg font-mono font-bold tracking-widest text-emerald-400 text-center focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResetPinAgent(null)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition"
                >
                  Save New PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
