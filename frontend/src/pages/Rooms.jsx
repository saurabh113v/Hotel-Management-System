import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { SlidersHorizontal, Map, MapPin } from 'lucide-react';

function Rooms({ onNavigate, roomsFilter, setRoomsFilter }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Local sync variables for filter inputs
  const [type, setType] = useState(roomsFilter.type || 'all');
  const [maxPrice, setMaxPrice] = useState(roomsFilter.maxPrice || '50000');
  const [capacity, setCapacity] = useState(roomsFilter.capacity || '1');
  const [checkIn, setCheckIn] = useState(roomsFilter.checkIn || '');
  const [checkOut, setCheckOut] = useState(roomsFilter.checkOut || '');
  const [location, setLocation] = useState(roomsFilter.location || 'all');

  // Map toggle and refs
  const [showMap, setShowMap] = useState(true);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  const fetchRooms = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (type && type !== 'all') params.type = type;
      if (maxPrice) params.maxPrice = maxPrice;
      if (capacity) params.capacity = capacity;
      if (checkIn) params.checkIn = checkIn;
      if (checkOut) params.checkOut = checkOut;
      if (location && location !== 'all') params.location = location;

      const res = await axios.get('/api/rooms', { params });
      if (res.data.success) {
        setRooms(res.data.data);
      } else {
        setError('Failed to fetch rooms');
      }
    } catch (err) {
      setError('Could not connect to the server to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [type, maxPrice, capacity, checkIn, checkOut, location]);

  const handleClearFilters = () => {
    setType('all');
    setMaxPrice('50000');
    setCapacity('1');
    setCheckIn('');
    setCheckOut('');
    setLocation('all');
    setRoomsFilter({
      type: 'all',
      maxPrice: '50000',
      capacity: '1',
      checkIn: '',
      checkOut: '',
      location: 'all'
    });
  };

  // Sync state to parent filter settings when navigation happens
  const handleBookRedirect = (roomId) => {
    setRoomsFilter({
      type,
      maxPrice,
      capacity,
      checkIn,
      checkOut,
      location,
      selectedRoomId: roomId
    });
    onNavigate('room-details');
  };

  // Leaflet Map Init & Updates
  useEffect(() => {
    if (!showMap || !mapRef.current || !window.L) return;

    // Remove existing map instance if it exists
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    try {
      // Find default center based on rooms, or India center
      let center = [20.5937, 78.9629]; // Center of India
      let zoom = 5;

      const validRooms = rooms.filter(r => r.lat && r.lng);
      if (validRooms.length > 0) {
        if (location !== 'all') {
          center = [validRooms[0].lat, validRooms[0].lng];
          zoom = 8;
        } else if (validRooms.length === 1) {
          center = [validRooms[0].lat, validRooms[0].lng];
          zoom = 8;
        }
      }

      // Initialize map
      const map = window.L.map(mapRef.current).setView(center, zoom);
      mapInstance.current = map;

      // Add OpenStreetMap Tile Layer
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // Add Markers
      validRooms.forEach(room => {
        const marker = window.L.marker([room.lat, room.lng]).addTo(map);
        marker.bindPopup(`
          <div style="color: #000000; font-family: system-ui; min-width: 160px; line-height: 1.4;">
            <img src="${room.image}" style="width: 100%; height: 75px; object-fit: cover; border-radius: 4px; margin-bottom: 6px;" />
            <h4 style="margin: 0 0 2px 0; font-size: 13px; font-weight: 700; color: #1E293B;">${room.name}</h4>
            <p style="margin: 0 0 6px 0; color: #64748B; font-size: 10px;">${room.location}</p>
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #E2E8F0; padding-top: 6px;">
              <span style="font-weight: 800; font-size: 12px; color: #4F46E5;">₹${room.price}</span>
              <span style="font-size: 10px; color: #06B6D4; font-weight: 700; text-decoration: underline;">Available</span>
            </div>
          </div>
        `);
      });
    } catch (err) {
      console.error('Map loading error:', err);
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [rooms, showMap, location]);

  return (
    <div style={{ paddingTop: '120px', paddingBottom: '80px' }}>
      <div className="container">
        
        {/* Page Title & Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '40px' }} className="rooms-header-flex">
          <div>
            <h2 style={{ fontSize: '36px', marginBottom: '8px' }}>
              Explore Our <span className="gradient-text">Accommodations</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Find the perfect room for your trip. Filter by dates to check real-time availability.
            </p>
          </div>
          
          <button 
            onClick={() => setShowMap(!showMap)} 
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px' }}
          >
            <Map size={16} /> {showMap ? 'Hide Interactive Map' : 'Show Interactive Map'}
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '300px 1fr',
          gap: '40px',
          alignItems: 'start'
        }} className="rooms-container-grid">
          
          {/* Filters Sidebar */}
          <aside className="glass" style={{ padding: '28px', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}>
                <SlidersHorizontal size={18} /> Filters
              </div>
              <button 
                type="button" 
                onClick={handleClearFilters}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
              >
                Clear All
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* City Location */}
              <div className="input-group">
                <label className="input-label">Select City/Location</label>
                <select 
                  className="input-field" 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)}
                >
                  <option value="all">All Locations</option>
                  <option value="Agra">Agra</option>
                  <option value="Goa">Goa</option>
                  <option value="Jaipur">Jaipur</option>
                  <option value="Kerala">Kerala (Munnar)</option>
                  <option value="Shimla">Shimla</option>
                  <option value="Udaipur">Udaipur</option>
                </select>
              </div>

              {/* Dates */}
              <div className="input-group">
                <label className="input-label">Check-In Date</label>
                <input 
                  type="date" 
                  className="input-field" 
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Check-Out Date</label>
                <input 
                  type="date" 
                  className="input-field" 
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  min={checkIn || new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Room Type */}
              <div className="input-group">
                <label className="input-label">Room Type</label>
                <select 
                  className="input-field" 
                  value={type} 
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="all">All Rooms</option>
                  <option value="single">Single</option>
                  <option value="couple">Couple</option>
                  <option value="family">Family</option>
                  <option value="suite">Presidential Suite</option>
                </select>
              </div>

              {/* Guest Capacity */}
              <div className="input-group">
                <label className="input-label">Guests Capacity</label>
                <select 
                  className="input-field" 
                  value={capacity} 
                  onChange={(e) => setCapacity(e.target.value)}
                >
                  <option value="1">1 Person</option>
                  <option value="2">2 People</option>
                  <option value="4">4 People</option>
                  <option value="6">6+ People</option>
                </select>
              </div>

              {/* Price Filter */}
              <div className="input-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <label className="input-label">Max Price per Night</label>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--secondary)' }}>₹{maxPrice}</span>
                </div>
                <input 
                  type="range" 
                  min="1000" 
                  max="50000" 
                  step="500"
                  className="input-field" 
                  style={{ padding: '0', background: 'transparent', cursor: 'pointer' }}
                  value={maxPrice} 
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <span>₹1,000</span>
                  <span>₹50,000</span>
                </div>
              </div>

            </div>
          </aside>

          {/* Rooms List & Map Area */}
          <main>
            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid var(--error)',
                color: 'var(--error)',
                padding: '16px',
                borderRadius: 'var(--radius-lg)',
                marginBottom: '24px'
              }}>
                {error}
              </div>
            )}

            {/* Interactive Leaflet Map Container */}
            {showMap && !loading && (
              <div 
                className="glass" 
                style={{ 
                  borderRadius: 'var(--radius-lg)', 
                  overflow: 'hidden', 
                  marginBottom: '40px',
                  boxShadow: 'var(--shadow-neon)'
                }}
              >
                <div 
                  ref={mapRef} 
                  style={{ 
                    height: '380px', 
                    width: '100%',
                    zIndex: 5
                  }}
                />
              </div>
            )}

            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
                Searching for available suites...
              </div>
            ) : rooms.length === 0 ? (
              <div className="glass" style={{ padding: '60px', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>No Rooms Found</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                  Try adjusting your filters or date selectors to see more availability.
                </p>
                <button type="button" className="btn btn-secondary" onClick={handleClearFilters}>
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="room-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                {rooms.map((room) => (
                  <div key={room._id} className="glass-card" style={{ overflow: 'hidden' }}>
                    <div className="room-card-img-wrapper">
                      <img src={room.image} alt={room.name} className="room-card-img" />
                      <div className="room-card-badge gradient-bg">
                        {room.type.toUpperCase()}
                      </div>
                    </div>
                    <div className="room-card-content">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--secondary)', fontSize: '11px', fontWeight: '700' }}>
                          <MapPin size={11} /> {room.location}
                        </div>
                        {room.rating > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#fbbf24', fontWeight: '700' }}>
                            <span>★</span>
                            <span style={{ color: 'white' }}>{room.rating.toFixed(1)}</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '10px', fontWeight: '400' }}>({room.numReviews})</span>
                          </div>
                        )}
                      </div>
                      <h3 className="room-card-title" style={{ fontSize: '18px' }}>{room.name}</h3>
                      <p className="room-card-desc" style={{ fontSize: '13px', marginBottom: '16px' }}>{room.description}</p>
                      
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                        {room.amenities.slice(0, 3).map((amenity, idx) => (
                          <span key={idx} style={{
                            fontSize: '11px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            color: 'var(--text-secondary)'
                          }}>
                            {amenity}
                          </span>
                        ))}
                        {room.amenities.length > 3 && (
                          <span style={{ fontSize: '11px', padding: '4px', color: 'var(--text-muted)' }}>+{room.amenities.length - 3} more</span>
                        )}
                      </div>

                      <div className="room-card-footer">
                        <div className="room-card-price">
                          ₹{room.price} <span>/ night</span>
                        </div>
                        <button 
                          className="btn btn-primary" 
                          style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)' }}
                          onClick={() => handleBookRedirect(room._id)}
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>

        </div>
      </div>
      
      <style>{`
        @media (max-width: 900px) {
          .rooms-container-grid {
            grid-template-columns: 1fr !important;
          }
          .rooms-header-flex {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 16px;
          }
        }
      `}</style>
    </div>
  );
}

export default Rooms;
