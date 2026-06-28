import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LayoutDashboard, BedDouble, CalendarDays, IndianRupee, Plus, Trash2, ShieldX } from 'lucide-react';
import InvoiceModal from '../components/InvoiceModal';

function Admin({ currentUser, onNavigate }) {
  const [activeTab, setActiveTab] = useState('bookings');
  
  // Dashboard metrics
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Add Room Form Fields
  const [newRoom, setNewRoom] = useState({
    name: '',
    type: 'single',
    price: '',
    capacity: '1',
    description: '',
    image: '',
    amenities: ''
  });
  const [addRoomLoading, setAddRoomLoading] = useState(false);
  const [addRoomSuccess, setAddRoomSuccess] = useState(false);
  const [addRoomError, setAddRoomError] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const [roomsRes, bookingsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/rooms'),
        axios.get('http://localhost:5000/api/bookings', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (roomsRes.data.success && bookingsRes.data.success) {
        setRooms(roomsRes.data.data);
        setBookings(bookingsRes.data.data);
      }
    } catch (err) {
      setError('Could not retrieve administrative records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && currentUser.role === 'admin') {
      fetchAdminData();
    }
  }, [currentUser]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`http://localhost:5000/api/bookings/${bookingId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        fetchAdminData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Cancellation failed.');
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Are you sure you want to permanently delete this room?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.delete(`http://localhost:5000/api/rooms/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        fetchAdminData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete room.');
    }
  };

  const handleAddRoomSubmit = async (e) => {
    e.preventDefault();
    setAddRoomError('');
    setAddRoomSuccess(false);
    setAddRoomLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/rooms', {
        ...newRoom,
        price: Number(newRoom.price),
        capacity: Number(newRoom.capacity)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setAddRoomSuccess(true);
        setNewRoom({
          name: '',
          type: 'single',
          price: '',
          capacity: '1',
          description: '',
          image: '',
          amenities: ''
        });
        fetchAdminData();
      }
    } catch (err) {
      setAddRoomError(err.response?.data?.message || 'Failed to create room.');
    } finally {
      setAddRoomLoading(false);
    }
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div style={{ paddingTop: '160px', paddingBottom: '80px', textAlign: 'center' }}>
        <div className="glass" style={{ maxWidth: '600px', margin: '0 auto', padding: '40px', borderRadius: 'var(--radius-lg)' }}>
          <h3 style={{ fontSize: '22px', marginBottom: '12px' }}>Access Prohibited</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Administrative access credentials are required.</p>
          <button className="btn btn-primary" onClick={() => onNavigate('home')}>Return Home</button>
        </div>
      </div>
    );
  }

  // Calculate Metrics
  const activeBookings = bookings.filter(b => b.status === 'confirmed');
  const totalRevenue = activeBookings.reduce((sum, b) => sum + b.totalAmount, 0);

  const metrics = [
    { label: 'Total Revenue', value: `₹${totalRevenue}`, icon: <IndianRupee size={24} />, color: 'var(--success)' },
    { label: 'Total Bookings', value: bookings.length, icon: <CalendarDays size={24} />, color: 'var(--primary)' },
    { label: 'Active Rooms', value: rooms.length, icon: <BedDouble size={24} />, color: 'var(--secondary)' },
    { label: 'Total Users', value: activeBookings.length > 0 ? 'Verified' : 'Active', icon: <LayoutDashboard size={24} />, color: 'var(--warning)' }
  ];

  return (
    <div style={{ paddingTop: '120px', paddingBottom: '80px' }}>
      <div className="container">
        <h2 style={{ fontSize: '36px', marginBottom: '8px' }}>
          Admin <span className="gradient-text">Dashboard</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
          Manage rooms, inspect hotel bookings, and view overall platform metrics.
        </p>

        {/* Metrics Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '24px',
          marginBottom: '40px'
        }}>
          {metrics.map((metric, idx) => (
            <div key={idx} className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{
                color: metric.color,
                background: `${metric.color}15`,
                padding: '14px',
                borderRadius: 'var(--radius-md)'
              }}>
                {metric.icon}
              </div>
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500' }}>{metric.label}</p>
                <h3 style={{ fontSize: '28px', fontWeight: '800', marginTop: '4px' }}>{metric.value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs navigation */}
        <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1px', marginBottom: '32px' }}>
          <button 
            type="button" 
            style={{
              background: 'none',
              border: 'none',
              padding: '12px 24px',
              fontWeight: '600',
              color: activeTab === 'bookings' ? 'white' : 'var(--text-secondary)',
              borderBottom: activeTab === 'bookings' ? '2px solid var(--primary)' : 'none',
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab('bookings')}
          >
            Manage Bookings
          </button>
          <button 
            type="button" 
            style={{
              background: 'none',
              border: 'none',
              padding: '12px 24px',
              fontWeight: '600',
              color: activeTab === 'rooms' ? 'white' : 'var(--text-secondary)',
              borderBottom: activeTab === 'rooms' ? '2px solid var(--primary)' : 'none',
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab('rooms')}
          >
            Manage Rooms
          </button>
          <button 
            type="button" 
            style={{
              background: 'none',
              border: 'none',
              padding: '12px 24px',
              fontWeight: '600',
              color: activeTab === 'add-room' ? 'white' : 'var(--text-secondary)',
              borderBottom: activeTab === 'add-room' ? '2px solid var(--primary)' : 'none',
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab('add-room')}
          >
            Create New Room
          </button>
        </div>

        {/* Tab content */}
        {loading ? (
          <div style={{ color: 'var(--text-secondary)' }}>Loading ledger information...</div>
        ) : (
          <div>
            
            {/* Bookings Table */}
            {activeTab === 'bookings' && (
              <div className="glass" style={{ borderRadius: 'var(--radius-lg)', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                      <th style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>Customer</th>
                      <th style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>Room</th>
                      <th style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>Check-in</th>
                      <th style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>Check-out</th>
                      <th style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>Paid</th>
                      <th style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>Status</th>
                      <th style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <td style={{ padding: '16px 24px', fontWeight: '500' }}>{booking.user?.name || 'User Deleted'}</td>
                        <td style={{ padding: '16px 24px' }}>{booking.room?.name || 'Room Deleted'}</td>
                        <td style={{ padding: '16px 24px', fontSize: '14px' }}>{new Date(booking.checkIn).toLocaleDateString()}</td>
                        <td style={{ padding: '16px 24px', fontSize: '14px' }}>{new Date(booking.checkOut).toLocaleDateString()}</td>
                        <td style={{ padding: '16px 24px', fontWeight: '700' }}>₹{booking.totalAmount}</td>
                        <td style={{ padding: '16px 24px', fontSize: '13px' }}>
                          <span style={{
                            color: booking.status === 'confirmed' ? 'var(--success)' : 'var(--text-muted)',
                            background: booking.status === 'confirmed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontWeight: '600'
                          }}>
                            {booking.status}
                          </span>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              type="button"
                              className="btn btn-secondary" 
                              style={{ padding: '4px 12px', fontSize: '12px', borderRadius: 'var(--radius-sm)' }}
                              onClick={() => setSelectedInvoice(booking)}
                            >
                              Receipt
                            </button>
                            {booking.status === 'confirmed' && (
                              <button 
                                type="button"
                                className="btn btn-danger" 
                                style={{ padding: '4px 12px', fontSize: '12px', borderRadius: 'var(--radius-sm)' }}
                                onClick={() => handleCancelBooking(booking._id)}
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Rooms List */}
            {activeTab === 'rooms' && (
              <div className="glass" style={{ borderRadius: 'var(--radius-lg)', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                      <th style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>Room Image</th>
                      <th style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>Room Name</th>
                      <th style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>Type</th>
                      <th style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>Max Guests</th>
                      <th style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>Price per Night</th>
                      <th style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.map((room) => (
                      <tr key={room._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <td style={{ padding: '12px 24px' }}>
                          <img src={room.image} alt={room.name} style={{ width: '80px', height: '50px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                        </td>
                        <td style={{ padding: '16px 24px', fontWeight: '600' }}>{room.name}</td>
                        <td style={{ padding: '16px 24px', textTransform: 'capitalize' }}>{room.type}</td>
                        <td style={{ padding: '16px 24px' }}>{room.capacity} Adults</td>
                        <td style={{ padding: '16px 24px', fontWeight: '700' }}>₹{room.price}</td>
                        <td style={{ padding: '16px 24px' }}>
                          <button 
                            type="button" 
                            style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}
                            onClick={() => handleDeleteRoom(room._id)}
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Add Room Form */}
            {activeTab === 'add-room' && (
              <div className="glass" style={{ padding: '32px', borderRadius: 'var(--radius-lg)', maxWidth: '680px' }}>
                <h3 style={{ fontSize: '22px', marginBottom: '24px' }}>Configure Room Setup</h3>
                
                {addRoomSuccess && (
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', color: 'var(--success)', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
                    Room created successfully!
                  </div>
                )}
                {addRoomError && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--error)', color: 'var(--error)', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
                    {addRoomError}
                  </div>
                )}

                <form onSubmit={handleAddRoomSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="admin-form-row">
                    <div className="input-group">
                      <label className="input-label">Room Title</label>
                      <input 
                        type="text" 
                        placeholder="Penthouse 504"
                        className="input-field" 
                        required
                        value={newRoom.name}
                        onChange={(e) => setNewRoom(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Room Classification</label>
                      <select 
                        className="input-field"
                        value={newRoom.type}
                        onChange={(e) => setNewRoom(prev => ({ ...prev, type: e.target.value }))}
                      >
                        <option value="single">Single</option>
                        <option value="couple">Couple</option>
                        <option value="family">Family</option>
                        <option value="suite">Presidential Suite</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="admin-form-row">
                    <div className="input-group">
                      <label className="input-label">Price per Night (₹)</label>
                      <input 
                        type="number" 
                        placeholder="250"
                        className="input-field" 
                        required
                        value={newRoom.price}
                        onChange={(e) => setNewRoom(prev => ({ ...prev, price: e.target.value }))}
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Max Guest Capacity</label>
                      <select 
                        className="input-field"
                        value={newRoom.capacity}
                        onChange={(e) => setNewRoom(prev => ({ ...prev, capacity: e.target.value }))}
                      >
                        <option value="1">1 Person</option>
                        <option value="2">2 People</option>
                        <option value="4">4 People</option>
                        <option value="6">6 People</option>
                        <option value="8">8+ People</option>
                      </select>
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Image URL</label>
                    <input 
                      type="url" 
                      placeholder="https://images.unsplash.com/photo-..."
                      className="input-field" 
                      required
                      value={newRoom.image}
                      onChange={(e) => setNewRoom(prev => ({ ...prev, image: e.target.value }))}
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Amenities (Comma Separated)</label>
                    <input 
                      type="text" 
                      placeholder="Free Wi-Fi, Ocean View, Mini Bar, Jacuzzi"
                      className="input-field" 
                      value={newRoom.amenities}
                      onChange={(e) => setNewRoom(prev => ({ ...prev, amenities: e.target.value }))}
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Room Description</label>
                    <textarea 
                      placeholder="Describe the aesthetic and unique aspects of this luxury space..."
                      className="input-field" 
                      style={{ height: '120px', resize: 'vertical' }}
                      required
                      value={newRoom.description}
                      onChange={(e) => setNewRoom(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '14px' }}
                    disabled={addRoomLoading}
                  >
                    {addRoomLoading ? 'Adding Room...' : 'Create Room'}
                  </button>
                </form>
              </div>
            )}

          </div>
        )}
      </div>
      
      <style>{`
        @media (max-width: 600px) {
          .admin-form-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* Invoice Modal Overlay */}
      <InvoiceModal 
        isOpen={!!selectedInvoice} 
        onClose={() => setSelectedInvoice(null)} 
        booking={selectedInvoice}
        currentUser={null}
      />
    </div>
  );
}

export default Admin;
