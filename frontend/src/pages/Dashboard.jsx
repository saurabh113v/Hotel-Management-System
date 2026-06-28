import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, User, Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import InvoiceModal from '../components/InvoiceModal';

function Dashboard({ onNavigate, currentUser }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelLoadingId, setCancelLoadingId] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const fetchMyBookings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/bookings/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      setError('Could not load your bookings list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchMyBookings();
    }
  }, [currentUser]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      return;
    }
    setCancelLoadingId(bookingId);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`http://localhost:5000/api/bookings/${bookingId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        // Refresh
        fetchMyBookings();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Cancellation failed.');
    } finally {
      setCancelLoadingId(null);
    }
  };

  if (!currentUser) {
    return (
      <div style={{ paddingTop: '160px', paddingBottom: '80px', textAlign: 'center' }}>
        <div className="glass" style={{ maxWidth: '600px', margin: '0 auto', padding: '40px', borderRadius: 'var(--radius-lg)' }}>
          <h3 style={{ fontSize: '22px', marginBottom: '12px' }}>Access Denied</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Please sign in to view your bookings dashboard.</p>
          <button className="btn btn-primary" onClick={() => onNavigate('home')}>Go Home</button>
        </div>
      </div>
    );
  }

  const activeBookings = bookings.filter(b => b.status === 'confirmed');
  const pastBookings = bookings.filter(b => b.status === 'cancelled');

  return (
    <div style={{ paddingTop: '120px', paddingBottom: '80px' }}>
      <div className="container">
        
        {/* User Summary Card */}
        <div className="glass" style={{ padding: '32px', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }} className="user-profile-summary">
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: '800',
              color: 'white'
            }}>
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '26px' }}>{currentUser.name}</h2>
                {currentUser.role === 'admin' && (
                  <span style={{ background: 'rgba(6, 182, 212, 0.15)', border: '1px solid var(--secondary)', color: 'var(--secondary)', fontSize: '11px', padding: '2px 8px', borderRadius: '12px', fontWeight: '700' }}>
                    ADMIN
                  </span>
                )}
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{currentUser.email}</p>
            </div>
          </div>
          {currentUser.role === 'admin' && (
            <button className="btn btn-secondary" onClick={() => onNavigate('admin')}>
              Open Admin Control Panel
            </button>
          )}
        </div>

        <h3 style={{ fontSize: '24px', marginBottom: '20px' }}>Your Room Bookings</h3>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--error)', color: 'var(--error)', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ color: 'var(--text-secondary)' }}>Retrieving booking history...</div>
        ) : bookings.length === 0 ? (
          <div className="glass" style={{ padding: '60px', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
            <h4 style={{ fontSize: '18px', marginBottom: '8px' }}>No Bookings Yet</h4>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>You haven't booked any rooms at Royal India Stays yet.</p>
            <button className="btn btn-primary" onClick={() => onNavigate('rooms')}>Browse Available Rooms</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {bookings.map((booking) => {
              const checkInDate = new Date(booking.checkIn).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
              const checkOutDate = new Date(booking.checkOut).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
              const isConfirmed = booking.status === 'confirmed';

              return (
                <div key={booking._id} className="glass" style={{
                  padding: '24px',
                  borderRadius: 'var(--radius-lg)',
                  display: 'grid',
                  gridTemplateColumns: '150px 1fr 200px',
                  gap: '24px',
                  alignItems: 'center'
                }} className="booking-list-item">
                  
                  {/* Room Thumbnail */}
                  <img 
                    src={booking.room?.image || 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=400&q=80'} 
                    alt={booking.room?.name || 'Room'} 
                    style={{
                      width: '100%',
                      height: '100px',
                      objectFit: 'cover',
                      borderRadius: 'var(--radius-md)'
                    }}
                  />

                  {/* Booking Details */}
                  <div>
                    <h4 style={{ fontSize: '20px', marginBottom: '8px' }}>{booking.room?.name || 'Unknown Room'}</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} /> {checkInDate} to {checkOutDate}
                      </span>
                      <span>•</span>
                      <span>{booking.guests} Guests</span>
                    </div>
                  </div>

                  {/* Status & Cancel Control */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '700' }}>
                      {isConfirmed ? (
                        <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle size={16} /> Confirmed
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <XCircle size={16} /> Cancelled
                        </span>
                      )}
                    </div>
                    
                    <div style={{ fontSize: '18px', fontWeight: '800' }}>
                      Total: ₹{booking.totalAmount}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        style={{ padding: '6px 14px', fontSize: '13px', borderRadius: 'var(--radius-sm)' }}
                        onClick={() => setSelectedInvoice(booking)}
                      >
                        Invoice
                      </button>
                      
                      {isConfirmed && (
                        <button 
                          type="button" 
                          className="btn btn-danger" 
                          style={{ padding: '6px 14px', fontSize: '13px', borderRadius: 'var(--radius-sm)' }}
                          onClick={() => handleCancelBooking(booking._id)}
                          disabled={cancelLoadingId === booking._id}
                        >
                          {cancelLoadingId === booking._id ? 'Cancelling...' : 'Cancel Booking'}
                        </button>
                      )}
                    </div>
                  </div>
                  
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <style>{`
        @media (max-width: 768px) {
          .user-profile-summary {
            flex-direction: column;
            gap: 20px;
            align-items: flex-start !important;
          }
          .booking-list-item {
            grid-template-columns: 1fr !important;
            text-align: center;
          }
          .booking-list-item img {
            height: 180px !important;
          }
          .booking-list-item div {
            align-items: center !important;
            justify-content: center !important;
          }
        }
      `}</style>

      {/* Invoice Modal Overlay */}
      <InvoiceModal 
        isOpen={!!selectedInvoice} 
        onClose={() => setSelectedInvoice(null)} 
        booking={selectedInvoice}
        currentUser={currentUser}
      />
    </div>
  );
}

export default Dashboard;
