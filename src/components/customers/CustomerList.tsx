import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Customer } from '../../types';
import {
  Users,
  Search,
  Plus,
  FileText,
  MapPin,
  Edit2,
  Upload,
  Eye,
  CheckCircle,
  Ban,
} from 'lucide-react';
import { CustomerModal } from './CustomerModal';
import { CustomerDocumentUploadModal } from './CustomerDocumentUploadModal';

interface Props {
  onOpenNewCustomer: () => void;
}

export const CustomerList: React.FC<Props> = ({ onOpenNewCustomer }) => {
  const { customers, agents, loans, updateCustomerStatus } = useFinance();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [agentFilter, setAgentFilter] = useState<string>('ALL');
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [uploadDocCustomer, setUploadDocCustomer] = useState<Customer | null>(null);
  const [selectedCustomerDocs, setSelectedCustomerDocs] = useState<Customer | null>(null);

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.mobile.includes(searchTerm) ||
      c.address.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesAgent = agentFilter === 'ALL' || c.assignedAgentId === agentFilter;

    return matchesSearch && matchesStatus && matchesAgent;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-emerald-400" />
            Customer Management & KYC Directory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Registered borrowers, guarantor details, Aadhaar/PAN verifications, and GPS tags
          </p>
        </div>
        <button
          onClick={onOpenNewCustomer}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold transition shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="glass-card rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name, code, mobile, address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="NEW">New</option>
            <option value="BLOCKED">Blocked</option>
            <option value="CLOSED">Closed</option>
          </select>

          <select
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Agents</option>
            {agents.map((ag) => (
              <option key={ag.id} value={ag.id}>
                {ag.name.split(' ')[0]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Customer Cards / Table Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((customer) => {
          const agent = agents.find((a) => a.id === customer.assignedAgentId);
          const customerLoans = loans.filter((l) => l.customerId === customer.id);
          const activeLoan = customerLoans.find((l) => l.status === 'ACTIVE' || l.status === 'OVERDUE');

          return (
            <div
              key={customer.id}
              className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition space-y-4"
            >
              {/* Top Row: Photo + Code + Status */}
              <div className="flex items-start gap-3">
                <img
                  src={customer.photoUrl}
                  alt={customer.name}
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-500/30"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {customer.customerCode}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        customer.status === 'ACTIVE'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : customer.status === 'BLOCKED'
                          ? 'bg-rose-500/20 text-rose-300'
                          : customer.status === 'NEW'
                          ? 'bg-sky-500/20 text-sky-300'
                          : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      {customer.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-white truncate mt-1">{customer.name}</h3>
                  <div className="text-xs text-slate-400">{customer.mobile}</div>
                </div>
              </div>

              {/* Address & Occupation */}
              <div className="text-xs text-slate-300 space-y-1 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                <div className="flex items-start gap-1.5 text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-relaxed line-clamp-2">{customer.address}</span>
                </div>
                <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800 flex justify-between">
                  <span>Occupation: <strong className="text-slate-200">{customer.occupation || 'Business'}</strong></span>
                  <span>Agent: <strong className="text-emerald-400">{agent?.name?.split(' ')[0] || 'Unassigned'}</strong></span>
                </div>
              </div>

              {/* Loan Status & Guarantor */}
              <div className="flex items-center justify-between text-xs py-1 border-y border-slate-800/60">
                <div>
                  <span className="text-[10px] text-slate-500 block">ACTIVE LOAN</span>
                  {activeLoan ? (
                    <span className="font-bold text-white text-xs">
                      {activeLoan.loanCode} ({activeLoan.loanType})
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-500">No active loan</span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">GUARANTOR</span>
                  <span className="text-xs text-slate-300 font-medium">
                    {customer.guarantorName || 'None'}
                  </span>
                </div>
              </div>

              {/* Documents & Action Buttons */}
              <div className="flex items-center justify-between pt-1 gap-2">
                <button
                  onClick={() => setSelectedCustomerDocs(customer)}
                  className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 bg-sky-500/10 px-2.5 py-1.5 rounded-lg border border-sky-500/20 transition font-medium"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Docs ({customer.documents?.length || 0})</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setUploadDocCustomer(customer)}
                    title="Upload KYC Document"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                  >
                    <Upload className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setEditingCustomer(customer)}
                    title="Edit Customer"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {customer.status === 'ACTIVE' ? (
                    <button
                      onClick={() => updateCustomerStatus(customer.id, 'BLOCKED')}
                      title="Block Customer"
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                    >
                      <Ban className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => updateCustomerStatus(customer.id, 'ACTIVE')}
                      title="Activate Customer"
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

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <CustomerModal customer={editingCustomer} onClose={() => setEditingCustomer(null)} />
      )}

      {/* Upload KYC Document Modal */}
      {uploadDocCustomer && (
        <CustomerDocumentUploadModal
          customer={uploadDocCustomer}
          onClose={() => setUploadDocCustomer(null)}
        />
      )}

      {/* View Customer Documents Modal */}
      {selectedCustomerDocs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                KYC Documents: {selectedCustomerDocs.name}
              </h3>
              <button
                onClick={() => setSelectedCustomerDocs(null)}
                className="text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            <div className="my-4 space-y-3 max-h-80 overflow-y-auto">
              {selectedCustomerDocs.documents?.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">
                  No KYC documents uploaded yet.
                </div>
              ) : (
                selectedCustomerDocs.documents?.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={doc.url}
                        alt={doc.type}
                        className="w-10 h-10 rounded-lg object-cover bg-slate-900 border border-slate-700"
                      />
                      <div>
                        <div className="text-xs font-bold text-white">{doc.type}</div>
                        <div className="text-[10px] text-slate-400">
                          Uploaded on {new Date(doc.uploadedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-[10px] font-bold transition"
                    >
                      View Full
                    </a>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => {
                setUploadDocCustomer(selectedCustomerDocs);
                setSelectedCustomerDocs(null);
              }}
              className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
            >
              + Upload Another KYC Document
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
