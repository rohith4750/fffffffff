import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  Receipt,
  Download,
  MapPin,
  Search,
} from 'lucide-react';
import { generateCollectionReceiptPDF } from '../../services/receiptGenerator';
import { format } from 'date-fns';

export const CollectionList: React.FC = () => {
  const { collections, customers, loans, agents } = useFinance();

  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');

  const filteredCollections = collections.filter((c) => {
    const customer = customers.find((cu) => cu.id === c.customerId);
    const matchesSearch =
      c.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.loanId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer?.mobile.includes(searchTerm);

    const matchesMethod = methodFilter === 'ALL' || c.paymentMethod === methodFilter;

    return matchesSearch && matchesMethod;
  });

  const handleDownloadPDF = (col: (typeof collections)[0]) => {
    const customer = customers.find((c) => c.id === col.customerId);
    const loan = loans.find((l) => l.id === col.loanId);
    const agent = agents.find((a) => a.id === col.agentId) || agents[0];

    if (!customer || !loan) {
      alert('Missing customer or loan record');
      return;
    }

    const doc = generateCollectionReceiptPDF(col, customer, loan, agent);
    doc.save(`Receipt_${col.receiptNumber}.pdf`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <Receipt className="w-6 h-6 text-emerald-400" />
            Field Collections & Payment Receipts
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time GPS verified collection records, priority allocation & digital receipts
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by receipt #, loan ID, borrower name, mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
        >
          <option value="ALL">All Payment Methods</option>
          <option value="CASH">Cash</option>
          <option value="UPI">UPI / QR Code</option>
          <option value="BANK_TRANSFER">Bank Transfer</option>
        </select>
      </div>

      {/* Collections Grid */}
      <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-700/80">
              <tr>
                <th className="py-3 px-4">Receipt # / Date</th>
                <th className="py-3 px-4">Borrower & Loan</th>
                <th className="py-3 px-4">Amount Collected</th>
                <th className="py-3 px-4">Allocation (Pen &rarr; Int &rarr; Prin)</th>
                <th className="py-3 px-4">Mode / Agent</th>
                <th className="py-3 px-4">GPS Geo-Location</th>
                <th className="py-3 px-4 text-right">Receipt PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredCollections.map((col) => {
                const customer = customers.find((c) => c.id === col.customerId);
                const agent = agents.find((a) => a.id === col.agentId);

                return (
                  <tr key={col.id} className="hover:bg-slate-800/30 transition">
                    {/* Receipt & Date */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-white text-xs">{col.receiptNumber}</div>
                      <div className="text-[10px] text-slate-400">
                        {format(new Date(col.collectedAt), 'dd MMM yyyy, hh:mm a')}
                      </div>
                    </td>

                    {/* Borrower */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-100">{customer?.name || 'Customer'}</div>
                      <div className="text-[10px] font-mono text-emerald-400">{col.loanId}</div>
                    </td>

                    {/* Total Amount */}
                    <td className="py-3.5 px-4">
                      <span className="font-black text-emerald-400 text-sm">
                        ₹{col.amount.toLocaleString('en-IN')}
                      </span>
                    </td>

                    {/* Priority Allocation */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-[11px] space-y-0.5">
                        <div className="text-rose-400">
                          Penalty: ₹{col.paymentDistribution.penaltyPaid}
                        </div>
                        <div className="text-teal-400">
                          Interest: ₹{col.paymentDistribution.interestPaid}
                        </div>
                        <div className="text-emerald-400 font-bold">
                          Principal: ₹{col.paymentDistribution.principalPaid}
                        </div>
                      </div>
                    </td>

                    {/* Mode & Agent */}
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {col.paymentMethod}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1">
                        {agent?.name.split(' ')[0] || 'Agent'}
                      </div>
                    </td>

                    {/* GPS Coordinates */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-[10px] text-slate-300 font-mono">
                        <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>{col.latitude.toFixed(4)}, {col.longitude.toFixed(4)}</span>
                      </div>
                      <div className="text-[9px] text-emerald-400 font-medium">
                        Accuracy: &plusmn;{col.accuracyMeters || 8}m
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDownloadPDF(col)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold transition shadow-sm hover:border-emerald-500/50"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-400" />
                        <span>PDF</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
