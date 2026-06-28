import React, { useState, useEffect } from 'react';
import { X, CreditCard, QrCode, Building, Lock, ShieldCheck, Check } from 'lucide-react';

function PaymentModal({ isOpen, onClose, amount, roomName, onPaymentSuccess }) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form states
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState('');

  // Auto-format card number: "XXXX XXXX XXXX XXXX"
  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    val = val.substring(0, 16);
    let formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    setCardNumber(formatted);
  };

  // Auto-format expiry date: "MM/YY"
  const handleCardExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    val = val.substring(0, 4);
    if (val.length >= 2) {
      val = val.substring(0, 2) + '/' + val.substring(2);
    }
    setCardExpiry(val);
  };

  const handleCardCvvChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    setCardCvv(val.substring(0, 3));
  };

  // Currency Formatter
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Start Simulated Payment Gateway Processing
  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setProcessingStep(1); // Contacts gateway
  };

  // Timeline handler for simulated banking response
  useEffect(() => {
    if (!isProcessing) return;

    let timer;
    if (processingStep === 1) {
      timer = setTimeout(() => setProcessingStep(2), 1200); // Validating
    } else if (processingStep === 2) {
      timer = setTimeout(() => setProcessingStep(3), 1200); // Authorizing
    } else if (processingStep === 3) {
      timer = setTimeout(() => {
        setProcessingStep(4);
        setIsSuccess(true);
      }, 1500); // Complete
    } else if (processingStep === 4) {
      // Return success data back to booking flow
      timer = setTimeout(() => {
        let paymentMethodStr = 'Credit Card';
        if (activeTab === 'upi') {
          paymentMethodStr = upiId ? `UPI: ${upiId}` : 'UPI (QR Scan)';
        } else if (activeTab === 'netbanking') {
          paymentMethodStr = `Net Banking: ${selectedBank}`;
        } else {
          paymentMethodStr = `Card (ending in ${cardNumber.substring(cardNumber.length - 4)})`;
        }
        
        const generatedTxnId = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
        onPaymentSuccess(paymentMethodStr, generatedTxnId);
      }, 1800);
    }

    return () => clearTimeout(timer);
  }, [isProcessing, processingStep]);

  return (
    <div className="modal-overlay" style={{ zIndex: 3000 }} onClick={onClose}>
      <div 
        className="glass" 
        style={{ 
          width: '100%', 
          maxWidth: '520px', 
          borderRadius: 'var(--radius-lg)', 
          padding: '32px', 
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          animation: 'fadeIn 0.3s ease-out',
          color: 'var(--text-primary)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        {!isProcessing && (
          <button className="modal-close" onClick={onClose} aria-label="Cancel transaction">
            <X size={20} />
          </button>
        )}

        {/* Processing State Overlay */}
        {isProcessing && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            zIndex: 10,
            textAlign: 'center'
          }}>
            {!isSuccess ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                {/* Visual loading ring */}
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  border: '4px solid rgba(99, 102, 241, 0.1)',
                  borderTop: '4px solid var(--secondary)',
                  animation: 'spin 1s linear infinite'
                }} />
                
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
                    {processingStep === 1 && 'Initiating Secure Transaction...'}
                    {processingStep === 2 && 'Verifying Credentials...'}
                    {processingStep === 3 && 'Awaiting Bank Authorization...'}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                    Please do not close this window or reload the page.
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', animation: 'scaleUp 0.4s ease-out' }}>
                <div style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: 'var(--success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
                }}>
                  <Check size={36} strokeWidth={3} />
                </div>
                <div>
                  <h3 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--success)', marginBottom: '6px' }}>Payment Successful</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                    Securing your reservation at Royal India Stays...
                  </p>
                </div>
              </div>
            )}
            
            <div style={{ 
              position: 'absolute', 
              bottom: '24px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              fontSize: '11px', 
              color: 'var(--text-muted)' 
            }}>
              <ShieldCheck size={14} /> Secured by MERN Payment Gateway (PCI-DSS)
            </div>
          </div>
        )}

        {/* Regular Wizard Content */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', borderBottom: '1px solid var(--border-glass)', paddingBottom: '16px' }}>
          <Lock size={20} style={{ color: 'var(--secondary)' }} />
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'white' }}>Gateway Payment</h3>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>
              Booking: <span style={{ color: 'var(--secondary)', fontWeight: '700' }}>{roomName}</span>
            </p>
          </div>
        </div>

        {/* Payment Summary Indicator */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-glass)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 18px'
        }}>
          <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Amount Payable:</span>
          <span style={{ fontSize: '24px', fontWeight: '800', color: 'white' }} className="gradient-text">
            {formatCurrency(amount)}
          </span>
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1px' }}>
          <button
            type="button"
            style={{
              background: activeTab === 'card' ? 'rgba(99, 102, 241, 0.1)' : 'none',
              border: 'none',
              borderBottom: activeTab === 'card' ? '2px solid var(--primary)' : 'none',
              color: activeTab === 'card' ? 'white' : 'var(--text-secondary)',
              padding: '10px',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
            onClick={() => setActiveTab('card')}
          >
            <CreditCard size={14} /> Card
          </button>
          
          <button
            type="button"
            style={{
              background: activeTab === 'upi' ? 'rgba(99, 102, 241, 0.1)' : 'none',
              border: 'none',
              borderBottom: activeTab === 'upi' ? '2px solid var(--primary)' : 'none',
              color: activeTab === 'upi' ? 'white' : 'var(--text-secondary)',
              padding: '10px',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
            onClick={() => setActiveTab('upi')}
          >
            <QrCode size={14} /> UPI / QR
          </button>

          <button
            type="button"
            style={{
              background: activeTab === 'netbanking' ? 'rgba(99, 102, 241, 0.1)' : 'none',
              border: 'none',
              borderBottom: activeTab === 'netbanking' ? '2px solid var(--primary)' : 'none',
              color: activeTab === 'netbanking' ? 'white' : 'var(--text-secondary)',
              padding: '10px',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
            onClick={() => setActiveTab('netbanking')}
          >
            <Building size={14} /> Net Banking
          </button>
        </div>

        {/* Tab Form Contents */}
        <form onSubmit={handlePaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Card Form */}
          {activeTab === 'card' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="input-group">
                <label className="input-label">Cardholder Name</label>
                <input 
                  type="text" 
                  placeholder="John Doe" 
                  className="input-field" 
                  required
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Card Number</label>
                <input 
                  type="text" 
                  placeholder="4111 2222 3333 4444" 
                  className="input-field" 
                  required
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="input-group">
                  <label className="input-label">Expiry Date</label>
                  <input 
                    type="text" 
                    placeholder="MM/YY" 
                    className="input-field" 
                    required
                    value={cardExpiry}
                    onChange={handleCardExpiryChange}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">CVV</label>
                  <input 
                    type="password" 
                    placeholder="***" 
                    className="input-field" 
                    required
                    value={cardCvv}
                    onChange={handleCardCvvChange}
                  />
                </div>
              </div>
            </div>
          )}

          {/* UPI Form */}
          {activeTab === 'upi' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="input-group">
                <label className="input-label">Enter UPI ID</label>
                <input 
                  type="text" 
                  placeholder="john@okaxis" 
                  className="input-field"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  required={!upiId && !isProcessing}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Pay using Google Pay, PhonePe, Paytm, or BHIM.</span>
              </div>

              <div style={{ 
                borderTop: '1px dashed var(--border-glass)', 
                paddingTop: '14px', 
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>OR Scan Mock QR Code</span>
                <div style={{
                  padding: '16px',
                  background: 'white',
                  borderRadius: 'var(--radius-md)',
                  width: '140px',
                  height: '140px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}>
                  {/* Mock QR Layout */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#111' }}>
                    <QrCode size={90} />
                    <span style={{ fontSize: '9px', fontWeight: '700', marginTop: '6px', color: 'var(--primary)' }}>BHIM UPI QR</span>
                  </div>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Click scan code and hit Pay below to verify instantly.</span>
              </div>
            </div>
          )}

          {/* Net Banking Form */}
          {activeTab === 'netbanking' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <label className="input-label">Select Your Bank</label>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '10px' 
              }}>
                {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Bank'].map((bank) => (
                  <label 
                    key={bank}
                    style={{
                      border: '1px solid var(--border-glass)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '600',
                      background: selectedBank === bank ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255, 255, 255, 0.01)',
                      borderColor: selectedBank === bank ? 'var(--primary)' : 'var(--border-glass)',
                      color: selectedBank === bank ? 'white' : 'var(--text-secondary)',
                      transition: 'all 0.2s'
                    }}
                  >
                    <input 
                      type="radio" 
                      name="bank" 
                      value={bank} 
                      checked={selectedBank === bank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      style={{ display: 'none' }}
                    />
                    <Building size={14} />
                    <span>{bank}</span>
                  </label>
                ))}
              </div>
              
              {selectedBank && (
                <div style={{ fontSize: '12px', color: 'var(--secondary)', fontWeight: '600', marginTop: '4px', textAlign: 'center' }}>
                  You will be securely redirected to {selectedBank}'s gateway portal.
                </div>
              )}
            </div>
          )}

          {/* Footer Submit Button */}
          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            disabled={activeTab === 'netbanking' && !selectedBank}
          >
            <ShieldCheck size={18} />
            Pay {formatCurrency(amount)} Securely
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
          <Lock size={12} /> 256-Bit SSL Encrypted Transaction
        </p>

      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes scaleUp {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default PaymentModal;
