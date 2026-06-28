import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, Users, Shield, Compass, Coffee, Waves, ArrowRight } from 'lucide-react';

function Home({ onNavigate, setRoomsFilter }) {
  const [featuredRooms, setFeaturedRooms] = useState([]);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('1');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/rooms');
        if (res.data.success) {
          // Take premium/suite rooms as featured
          setFeaturedRooms(res.data.data.slice(0, 3));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setRoomsFilter({
      checkIn,
      checkOut,
      capacity: guests,
      type: 'all',
      maxPrice: '600'
    });
    onNavigate('rooms');
  };

  const services = [
    { icon: <Waves size={32} />, title: 'Infinity Pool', desc: 'Relax by our climate-controlled outdoor pool overlooking the ocean.' },
    { icon: <Coffee size={32} />, title: 'Gourmet Breakfast', desc: 'Indulge in organic, masterfully prepared local & international cuisines.' },
    { icon: <Compass size={32} />, title: 'Guided Excursions', desc: 'Unlock local secrets with guided boat tours, hiking, and safaris.' },
    { icon: <Shield size={32} />, title: 'Secure Sanctuary', desc: 'Enjoy peace of mind with 24/7 security, butler, and concierge.' }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-sec">
        <div className="container hero-grid">
          <div>
            <h1 className="hero-title serif-heading">
              Discover <br />
              <span className="gold-text">Absolute Luxury</span> <br />
              & Heritage Palace Stays
            </h1>
            <p className="hero-subtitle">
              Escape to India's most majestic palace hotels, heritage villas, and luxury resorts where contemporary glassmorphism meets royal hospitality.
            </p>
            <button className="btn btn-primary" onClick={() => onNavigate('rooms')}>
              Explore All Rooms <ArrowRight size={18} />
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <img 
              src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=600&q=80" 
              alt="Luxury Resort Pool" 
              style={{
                width: '100%',
                maxWidth: '450px',
                height: '400px',
                objectFit: 'cover',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-neon)',
                border: '1px solid var(--border-glass)'
              }}
            />
          </div>
        </div>
      </section>

      {/* Booking Search Panel */}
      <div className="container" style={{ position: 'relative', zIndex: 20 }}>
        <form onSubmit={handleSearch} className="search-panel glass">
          <div className="input-group">
            <label className="input-label">Check-In Date</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="date" 
                className="input-field" 
                style={{ width: '100%' }}
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Check-Out Date</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="date" 
                className="input-field" 
                style={{ width: '100%' }}
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={checkIn || new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Guests</label>
            <div style={{ position: 'relative' }}>
              <select 
                className="input-field" 
                style={{ width: '100%', appearance: 'none' }}
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
              >
                <option value="1">1 Adult</option>
                <option value="2">2 Adults</option>
                <option value="4">4 Guests (Family)</option>
                <option value="6">6 Guests (Presidential)</option>
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ height: '48px', alignSelf: 'end' }}
          >
            Check Availability
          </button>
        </form>
      </div>

      {/* Storytelling Philosophy & Heritage Block */}
      <section style={{ padding: '100px 0 60px 0', position: 'relative' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: '60px', alignItems: 'center' }} className="container details-container-grid">
          <div>
            <span style={{ color: 'var(--accent-gold)', fontSize: '13px', fontWeight: '700', letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: '16px' }}>
              Our Legacy
            </span>
            <h2 className="serif-heading" style={{ fontSize: '44px', lineHeight: '1.2', marginBottom: '24px', color: 'white' }}>
              Preserving the Legends of <span className="gold-text">Royal Indian Splendor</span>
            </h2>
            <div className="quote-card">
              "Atithi Devo Bhava — The guest is equivalent to God. Live the legends of royal India in our heritage sanctuaries."
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.8', marginBottom: '20px' }}>
              For centuries, India's majestic palaces and grand Havelis stood as symbols of architecture, refinement, and legendary hospitality. Royal India Stays restores these architectural treasures, combining centuries-old royal aesthetics with contemporary glassmorphism and modern comforts.
            </p>
            <button className="btn btn-secondary" onClick={() => onNavigate('rooms')} style={{ color: 'var(--accent-gold)', borderColor: 'rgba(212, 175, 55, 0.2)' }}>
              Discover Our Palaces <ArrowRight size={16} style={{ color: 'var(--accent-gold)', marginLeft: '4px' }} />
            </button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            <img 
              src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=400&q=80" 
              alt="Palace Courtyard" 
              style={{ width: '100%', height: '280px', objectFit: 'cover', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-glass)', transform: 'translateY(-20px)' }}
            />
            <img 
              src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80" 
              alt="Heritage Suite" 
              style={{ width: '100%', height: '280px', objectFit: 'cover', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-glass)' }}
            />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section style={{ padding: '80px 0', background: 'rgba(255, 255, 255, 0.02)' }}>
        <div className="container">
          <h2 className="serif-heading" style={{ fontSize: '40px', textAlign: 'center', marginBottom: '12px' }}>
            Exclusive <span className="gold-text">World-Class Services</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '48px', maxWidth: '600px', margin: '0 auto 48px' }}>
            We provide everything you need to experience peace, rejuvenation, and unmatched coastal convenience.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            {services.map((svc, i) => (
              <div key={i} className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
                <div style={{
                  color: 'var(--secondary)',
                  marginBottom: '20px',
                  display: 'inline-flex',
                  padding: '16px',
                  borderRadius: '50%',
                  background: 'rgba(6, 182, 212, 0.08)'
                }}>
                  {svc.icon}
                </div>
                <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>{svc.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{svc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Rooms Section */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '48px' }}>
            <div>
              <h2 className="serif-heading" style={{ fontSize: '40px' }}>Featured <span className="gold-text">Residences</span></h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Hand-picked accommodations featuring spectacular Indian heritage designs.</p>
            </div>
            <button className="btn btn-secondary" onClick={() => onNavigate('rooms')}>
              View All Accommodations
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Loading recommendations...</div>
          ) : (
            <div className="room-grid">
              {featuredRooms.map((room) => (
                <div key={room._id} className="glass-card" style={{ overflow: 'hidden' }}>
                  <div className="room-card-img-wrapper">
                    <img src={room.image} alt={room.name} className="room-card-img" />
                    <div className="room-card-badge gradient-bg">
                      {room.type.toUpperCase()}
                    </div>
                  </div>
                  <div className="room-card-content">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Featured Stay</span>
                      {room.rating > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#fbbf24', fontWeight: '700' }}>
                          <span>★</span>
                          <span style={{ color: 'white' }}>{room.rating.toFixed(1)}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '10px', fontWeight: '400' }}>({room.numReviews})</span>
                        </div>
                      )}
                    </div>
                    <h3 className="room-card-title">{room.name}</h3>
                    <p className="room-card-desc">{room.description}</p>
                    <div className="room-card-footer">
                      <div className="room-card-price">
                        ₹{room.price} <span>/ night</span>
                      </div>
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)' }}
                        onClick={() => {
                          setRoomsFilter(prev => ({ ...prev, selectedRoomId: room._id }));
                          onNavigate('room-details');
                        }}
                      >
                        Book Room
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Home;
