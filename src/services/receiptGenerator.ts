import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Collection, Customer, Loan, User } from '../types';
import { format } from 'date-fns';

export function generateCollectionReceiptPDF(
  collection: Collection,
  customer: Customer,
  loan: Loan,
  agent: User
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [105, 160], // Thermal / Slip format
  });

  // Header
  doc.setFillColor(15, 23, 42); // Navy 900
  doc.rect(0, 0, 105, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('FINFLOW MICROFINANCE', 52.5, 10, { align: 'center' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('OFFICIAL PAYMENT RECEIPT', 52.5, 16, { align: 'center' });
  doc.text('GPS VERIFIED TRANSACTION', 52.5, 20, { align: 'center' });

  // Receipt meta
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(8);
  doc.text(`Receipt #: ${collection.receiptNumber}`, 8, 30);
  doc.text(`Date: ${format(new Date(collection.collectedAt), 'dd MMM yyyy, hh:mm a')}`, 8, 35);
  doc.text(`Loan Code: ${loan.loanCode} (${loan.loanType})`, 8, 40);
  doc.text(`Payment Mode: ${collection.paymentMethod}`, 8, 45);

  // Divider
  doc.setDrawColor(203, 213, 225);
  doc.line(8, 48, 97, 48);

  // Customer & Agent info
  doc.setFont('helvetica', 'bold');
  doc.text('Customer Details:', 8, 54);
  doc.setFont('helvetica', 'normal');
  doc.text(`${customer.name} (${customer.customerCode})`, 8, 59);
  doc.text(`Mobile: ${customer.mobile}`, 8, 64);
  doc.text(`Address: ${customer.address.slice(0, 40)}`, 8, 69);

  doc.setFont('helvetica', 'bold');
  doc.text('Collected By Agent:', 8, 76);
  doc.setFont('helvetica', 'normal');
  doc.text(`${agent.name} (Agent ID: ${agent.id})`, 8, 81);

  // Amount Breakdown Table
  const tableData = [
    ['Penalty Paid', `INR ${collection.paymentDistribution.penaltyPaid.toLocaleString('en-IN')}`],
    ['Interest Paid', `INR ${collection.paymentDistribution.interestPaid.toLocaleString('en-IN')}`],
    ['Principal Paid', `INR ${collection.paymentDistribution.principalPaid.toLocaleString('en-IN')}`],
    ['TOTAL RECEIVED', `INR ${collection.amount.toLocaleString('en-IN')}`],
  ];

  autoTable(doc, {
    startY: 85,
    head: [['Item', 'Amount']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 35, halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: 8, right: 8 },
  });

  // Outstanding Summary
  // @ts-expect-error autoTable adds lastAutoTable to doc
  const finalY = doc.lastAutoTable.finalY + 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text(`Remaining Principal: INR ${loan.principalOutstanding.toLocaleString('en-IN')}`, 8, finalY);
  doc.text(`Remaining Interest: INR ${loan.interestOutstanding.toLocaleString('en-IN')}`, 8, finalY + 4);
  doc.text(`Remaining Penalty: INR ${loan.penaltyOutstanding.toLocaleString('en-IN')}`, 8, finalY + 8);

  // GPS Verification stamp
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(0.3);
  doc.rect(8, finalY + 12, 89, 14);

  doc.setFontSize(6.5);
  doc.setTextColor(5, 150, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('GPS GEO-VERIFICATION STAMP', 52.5, finalY + 16, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text(`Lat: ${collection.latitude}, Lng: ${collection.longitude} (Accuracy: ±${collection.accuracyMeters || 10}m)`, 52.5, finalY + 20, { align: 'center' });
  doc.text(`Device: ${collection.deviceInfo}`, 52.5, finalY + 23, { align: 'center' });

  // Footer Note
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text('This is a computer-generated proof of microfinance collection.', 52.5, finalY + 30, { align: 'center' });

  return doc;
}
