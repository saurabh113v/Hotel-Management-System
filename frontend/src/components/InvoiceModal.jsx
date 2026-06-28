import React from 'react';
import { X, Printer, Download, Landmark, FileText, CheckCircle2 } from 'lucide-react';

function InvoiceModal({ isOpen, onClose, booking, currentUser }) {
  if (!isOpen || !booking) return null;

  // Format Dates
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const checkInDate = new Date(booking.checkIn);
  const checkOutDate = new Date(booking.checkOut);
  const nights = Math.max(1, Math.round((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)));

  // Currency Formatter
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Calculations (GST Inclusive Breakout)
  const totalAmount = booking.totalAmount;
  const subtotal = totalAmount / 1.18;
  const cgst = subtotal * 0.09;
  const sgst = subtotal * 0.09;
  
  const roomPricePerNight = booking.room ? booking.room.price : (totalAmount / nights);
  
  // Invoice Metadata
  const invoiceNumber = `RIS-${booking._id.substring(booking._id.length - 8).toUpperCase()}`;
  const issueDate = formatDate(booking.createdAt || new Date());
  
  // Customer details resolving
  const customerName = booking.user?.name || currentUser?.name || 'Valued Guest';
  const customerEmail = booking.user?.email || currentUser?.email || 'N/A';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay invoice-modal-overlay no-print" onClick={onClose}>
      <div 
        className="glass invoice-modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'fadeIn 0.3s ease-out' }}
      >
        {/* Close Button */}
        <button className="modal-close no-print" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        {/* Printable/Downloadable Container */}
        <div className="invoice-printable-card">
          
          {/* Invoice Header */}
          <div className="invoice-header">
            <div>
              <div className="logo" style={{ color: 'var(--primary)', marginBottom: '8px', cursor: 'default' }}>
                <Landmark size={28} style={{ color: 'var(--secondary)' }} />
                <span className="gradient-text">Royal India Stays</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                101, Marine Drive, Mumbai<br />
                Maharashtra, India - 400020<br />
                reservations@royalindiastays.com
              </p>
            </div>
            
            <div className="invoice-title">
              <h2 style={{ fontSize: '24px', letterSpacing: '0.05em', marginBottom: '8px', color: 'white' }}>INVOICE</h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                <strong>Invoice No:</strong> {invoiceNumber}<br />
                <strong>Date Issued:</strong> {issueDate}
              </p>
            </div>
          </div>

          {/* Invoice Details Grid */}
          <div className="invoice-details-grid" style={{ marginTop: '24px' }}>
            <div>
              <h4 className="invoice-section-title">Billing From</h4>
              <p style={{ fontSize: '14px', fontWeight: '600' }}>Royal India Stays Ltd.</p>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                GSTIN: 27AAAAA1111A1Z1<br />
                Phone: +91 22 1234 5678
              </p>
            </div>
            <div>
              <h4 className="invoice-section-title">Billing To</h4>
              <p style={{ fontSize: '14px', fontWeight: '600' }}>{customerName}</p>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Email: {customerEmail}<br />
                Guest Status: Verified Member
              </p>
            </div>
          </div>

          {/* Booking Summary Section */}
          <div style={{ marginTop: '24px' }}>
            <h4 className="invoice-section-title">Reservation details</h4>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
              gap: '16px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              marginTop: '8px'
            }}>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Check-In</span>
                <p style={{ fontSize: '14px', fontWeight: '600', marginTop: '2px' }}>{formatDate(booking.checkIn)}</p>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Check-Out</span>
                <p style={{ fontSize: '14px', fontWeight: '600', marginTop: '2px' }}>{formatDate(booking.checkOut)}</p>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Total Nights</span>
                <p style={{ fontSize: '14px', fontWeight: '600', marginTop: '2px' }}>{nights} Night{nights > 1 ? 's' : ''}</p>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Guests</span>
                <p style={{ fontSize: '14px', fontWeight: '600', marginTop: '2px' }}>{booking.guests} Guest{booking.guests > 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>

          {/* Ledger Table */}
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Item & Description</th>
                <th style={{ textAlign: 'center' }}>Nights</th>
                <th style={{ textAlign: 'right' }}>Base Price / Night</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong style={{ display: 'block', fontSize: '15px' }}>{booking.room?.name || 'Luxury Room'}</strong>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                    Type: {booking.room?.type || 'Standard'}
                  </span>
                </td>
                <td style={{ textAlign: 'center' }}>{nights}</td>
                <td style={{ textAlign: 'right' }}>{formatCurrency(roomPricePerNight)}</td>
                <td style={{ textAlign: 'right', fontWeight: '600' }}>{formatCurrency(roomPricePerNight * nights)}</td>
              </tr>
            </tbody>
          </table>

          {/* Pricing Calculation Summary */}
          <div className="invoice-summary">
            <div className="invoice-summary-row">
              <span>Subtotal (Excl. Tax)</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="invoice-summary-row">
              <span>CGST (9.0%)</span>
              <span>{formatCurrency(cgst)}</span>
            </div>
            <div className="invoice-summary-row">
              <span>SGST (9.0%)</span>
              <span>{formatCurrency(sgst)}</span>
            </div>
            
            <div className="invoice-summary-row total">
              <span>Total Paid</span>
              <span className="gradient-text">{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          {/* Booking Status Indicator */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginTop: '32px',
            padding: '12px 16px',
            background: booking.status === 'confirmed' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
            border: `1px solid ${booking.status === 'confirmed' ? 'var(--success)' : 'var(--error)'}`,
            borderRadius: 'var(--radius-md)'
          }}>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payment Status</span>
              <p style={{ 
                fontSize: '15px', 
                fontWeight: '700', 
                color: booking.status === 'confirmed' ? 'var(--success)' : 'var(--error)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '2px'
              }}>
                <CheckCircle2 size={16} /> {booking.status === 'confirmed' ? 'CONFIRMED & PAID' : 'CANCELLED'}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payment Mode</span>
              <p style={{ fontSize: '14px', fontWeight: '600', marginTop: '2px', color: 'white' }}>{booking.paymentMethod || 'Credit Card / Online'}</p>
              {booking.transactionId && booking.transactionId !== 'N/A' && (
                <p style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px', fontFamily: 'monospace' }}>Ref: {booking.transactionId}</p>
              )}
            </div>
          </div>

          {/* Invoice Terms / Footer */}
          <div className="invoice-footer">
            <p style={{ fontWeight: '500', marginBottom: '4px', color: 'var(--text-secondary)' }}>Thank you for choosing Royal India Stays.</p>
            <p style={{ fontSize: '11px' }}>
              Check-in time is 2:00 PM; Check-out time is 11:00 AM. Cancellations and refunds are subject to hotel policy.
            </p>
          </div>

        </div>

        {/* Modal Controls / Action Bar */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginTop: '12px',
          borderTop: '1px solid var(--border-glass)',
          paddingTop: '20px'
        }} className="no-print">
          
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileText size={14} /> Tip: Choose <strong>Save as PDF</strong> in print options to download.
          </span>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
            <button className="btn btn-primary" onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Printer size={16} /> Print / Download PDF
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

export default InvoiceModal;
