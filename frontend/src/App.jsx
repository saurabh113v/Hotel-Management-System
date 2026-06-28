import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LogOut, User as UserIcon, Menu, X, Landmark, Volume2, VolumeX } from 'lucide-react';
import Home from './pages/Home';
import Rooms from './pages/Rooms';
import RoomDetails from './pages/RoomDetails';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import AuthModal from './components/AuthModal';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Global Ambient Music Player State
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [audio] = useState(() => {
    // Beautiful soothing classical instrument stream fallback
    const track = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3');
    track.loop = true;
    track.volume = 0.25; // soft background volume
    return track;
  });

  useEffect(() => {
    if (musicPlaying) {
      audio.play().catch(err => {
        console.warn("Autoplay blocked by browser. Music will start upon user interaction.", err);
      });
    } else {
      audio.pause();
    }
  }, [musicPlaying, audio]);

  useEffect(() => {
    return () => {
      audio.pause();
    };
  }, [audio]);

  // Global filters share state
  const [roomsFilter, setRoomsFilter] = useState({
    checkIn: '',
    checkOut: '',
    capacity: '1',
    type: 'all',
    maxPrice: '50000',
    location: 'all',
    selectedRoomId: null
  });

  // Auth Modals State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');

  useEffect(() => {
    const checkUserAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await axios.get('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.success) {
            setCurrentUser(res.data.user);
          } else {
            localStorage.removeItem('token');
          }
        } catch (err) {
          localStorage.removeItem('token');
        }
      }
      setAuthLoading(false);
    };
    checkUserAuth();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setCurrentPage('home');
  };

  const handleAuthSuccess = (user, token) => {
    setCurrentUser(user);
  };

  const navigateTo = (page) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {/* Navbar Header */}
      <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container nav-container">
          <div className="logo gradient-text" onClick={() => navigateTo('home')}>
            <Landmark size={26} /> Royal India Stays
          </div>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <ul className="nav-links">
              <li className={`nav-item ${currentPage === 'home' ? 'active' : ''}`} onClick={() => navigateTo('home')}>Home</li>
              <li className={`nav-item ${currentPage === 'rooms' ? 'active' : ''}`} onClick={() => navigateTo('rooms')}>Rooms</li>
              {currentUser && (
                <li className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`} onClick={() => navigateTo('dashboard')}>My Bookings</li>
              )}
              {currentUser && currentUser.role === 'admin' && (
                <li className={`nav-item ${currentPage === 'admin' ? 'active' : ''}`} onClick={() => navigateTo('admin')}>Admin Control</li>
              )}
            </ul>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }} className="nav-actions-container">
              
              {/* Ambient Music Player Toggle */}
              <button 
                onClick={() => setMusicPlaying(!musicPlaying)} 
                className={`ambient-player-btn ${musicPlaying ? 'active' : ''}`}
                style={{ marginRight: '8px' }}
                title={musicPlaying ? "Mute Ambient Sitar" : "Play Ambient Sitar"}
              >
                {musicPlaying ? (
                  <div className="sound-wave">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                ) : (
                  <VolumeX size={18} />
                )}
              </button>

              {authLoading ? (
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Checking Session...</span>
              ) : currentUser ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div 
                    onClick={() => navigateTo('dashboard')}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '600' }}
                  >
                    <UserIcon size={16} /> <span>{currentUser.name.split(' ')[0]}</span>
                  </div>
                  <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <LogOut size={14} /> Log Out
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => { setAuthModalMode('login'); setAuthModalOpen(true); }} 
                  className="nav-auth-btn"
                >
                  Sign In
                </button>
              )}

              {/* Mobile Menu Icon */}
              <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </nav>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div style={{
            position: 'absolute',
            top: scrolled ? '70px' : '80px',
            left: 0,
            right: 0,
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-glass)',
            padding: '24px',
            zIndex: 999,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ cursor: 'pointer', fontWeight: '500', padding: '8px 0' }} onClick={() => navigateTo('home')}>Home</div>
            <div style={{ cursor: 'pointer', fontWeight: '500', padding: '8px 0' }} onClick={() => navigateTo('rooms')}>Rooms</div>
            {currentUser && (
              <div style={{ cursor: 'pointer', fontWeight: '500', padding: '8px 0' }} onClick={() => navigateTo('dashboard')}>My Bookings</div>
            )}
            {currentUser && currentUser.role === 'admin' && (
              <div style={{ cursor: 'pointer', fontWeight: '500', padding: '8px 0' }} onClick={() => navigateTo('admin')}>Admin Control</div>
            )}
          </div>
        )}
      </header>

      {/* Main Pages Switch */}
      <main style={{ flex: 1 }}>
        {currentPage === 'home' && (
          <Home 
            onNavigate={navigateTo} 
            setRoomsFilter={setRoomsFilter} 
          />
        )}
        {currentPage === 'rooms' && (
          <Rooms 
            onNavigate={navigateTo} 
            roomsFilter={roomsFilter} 
            setRoomsFilter={setRoomsFilter} 
          />
        )}
        {currentPage === 'room-details' && (
          <RoomDetails 
            onNavigate={navigateTo} 
            roomId={roomsFilter.selectedRoomId} 
            setRoomsFilter={setRoomsFilter} 
            currentUser={currentUser} 
            triggerLoginModal={() => { setAuthModalMode('login'); setAuthModalOpen(true); }}
          />
        )}
        {currentPage === 'dashboard' && (
          <Dashboard 
            onNavigate={navigateTo} 
            currentUser={currentUser} 
          />
        )}
        {currentPage === 'admin' && (
          <Admin 
            currentUser={currentUser} 
            onNavigate={navigateTo} 
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-glass)',
        padding: '40px 0',
        textAlign: 'center',
        marginTop: '80px',
        color: 'var(--text-secondary)',
        fontSize: '14px'
      }}>
        <div className="container">
          <p style={{ fontWeight: '700', marginBottom: '8px', color: 'white' }}>Royal India Stays MERN App</p>
          <p style={{ marginBottom: '16px' }}>Elegant glassmorphism design built completely from scratch.</p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>&copy; 2026 Royal India Stays. All rights reserved.</p>
        </div>
      </footer>

      {/* Auth Modals */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)}
        mode={authModalMode}
        setMode={setAuthModalMode}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}

export default App;
