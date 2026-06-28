import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, Users, Award, Coffee, Eye, ArrowLeft, CheckCircle2, Star } from 'lucide-react';
import PaymentModal from '../components/PaymentModal';

function RoomDetails({ onNavigate, roomId, setRoomsFilter, currentUser, triggerLoginModal }) {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImage, setActiveImage] = useState('');
  
  // Booking Form Fields
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('1');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  // Reviews & Rating System state fields
  const [canReview, setCanReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchRoomDetails = async () => {
    if (!roomId) {
      setError('No room selected');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/rooms/${roomId}`);
      if (res.data.success) {
        setRoom(res.data.data);
        setActiveImage(res.data.data.image);
      } else {
        setError('Room details not found');
      }
    } catch (err) {
      setError('Could not retrieve details for this room');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomDetails();
  }, [roomId]);

  // Check if current user is eligible to write a review
  useEffect(() => {
    const checkReviewEligibility = async () => {
      if (!currentUser || !roomId || !room) {
        setCanReview(false);
        return;
      }
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/bookings/my', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          // Find if user has a confirmed booking for this room
          const hasBookedThisRoom = res.data.data.some(
            booking => booking.room?._id === roomId && booking.status === 'confirmed'
          );
          // Also check if they already reviewed it
          const alreadyReviewedThisRoom = room.reviews?.some(
            r => r.user === currentUser._id || r.user?._id === currentUser._id
          );

          setCanReview(hasBookedThisRoom && !alreadyReviewedThisRoom);
        }
      } catch (err) {
        console.error('Error checking review eligibility:', err);
      }
    };

    checkReviewEligibility();
  }, [currentUser, roomId, room]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');
    setSubmittingReview(true);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`http://localhost:5000/api/rooms/${roomId}/reviews`, {
        rating: reviewRating,
        comment: reviewComment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setReviewSuccess('Thank you! Your review has been posted.');
        setReviewComment('');
        setReviewRating(5);
        // Refresh room details to show new review and update average rating
        fetchRoomDetails();
      }
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit your review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Calculate booking details
  const getDaysCount = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    if (start >= end) return 0;
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysCount = getDaysCount();
  const totalAmount = room ? daysCount * room.price : 0;

  const handleBooking = (e) => {
    e.preventDefault();
    setBookingError('');
    setBookingSuccess(false);

    if (!currentUser) {
      triggerLoginModal();
      return;
    }

    if (daysCount <= 0) {
      setBookingError('Check-out date must be after check-in date');
      return;
    }

    setPaymentModalOpen(true);
  };

  const executeBooking = async (paymentMethod, transactionId) => {
    setPaymentModalOpen(false);
    setBookingLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/bookings', {
        roomId,
        checkIn,
        checkOut,
        guests: Number(guests),
        totalAmount,
        paymentMethod,
        transactionId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setBookingSuccess(true);
        // Clear dates
        setCheckIn('');
        setCheckOut('');
        // Refresh room details to update booked dates calendar immediately
        fetchRoomDetails();
        // Redirect to dashboard after a delay
        setTimeout(() => {
          onNavigate('dashboard');
        }, 2000);
      }
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Booking process failed. Try a different date range.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ paddingTop: '160px', paddingBottom: '80px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading room specifications...
      </div>
    );
  }

  if (error || !room) {
    return (
      <div style={{ paddingTop: '160px', paddingBottom: '80px', textAlign: 'center' }}>
        <div className="glass" style={{ maxWidth: '600px', margin: '0 auto', padding: '40px', borderRadius: 'var(--radius-lg)' }}>
          <h3 style={{ fontSize: '20px', color: 'var(--error)', marginBottom: '16px' }}>{error || 'Room details error'}</h3>
          <button className="btn btn-secondary" onClick={() => onNavigate('rooms')}>
            <ArrowLeft size={16} /> Return to Rooms
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: '120px', paddingBottom: '80px' }}>
      <div className="container">
        <button 
          onClick={() => onNavigate('rooms')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            marginBottom: '32px'
          }}
        >
          <ArrowLeft size={18} /> Back to Rooms List
        </button>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 0.8fr',
          gap: '48px',
          alignItems: 'start'
        }} className="details-container-grid">
          
          {/* Main Info */}
          <div>
            {/* Immersive Photo Gallery */}
            <div style={{ marginBottom: '32px' }}>
              <img 
                src={activeImage || room.image} 
                alt={room.name} 
                style={{
                  width: '100%',
                  height: '460px',
                  objectFit: 'cover',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-glass)',
                  marginBottom: '16px',
                  transition: 'all 0.3s ease-in-out',
                  boxShadow: 'var(--shadow-glass)'
                }}
              />
              
              {/* Thumbnails row */}
              {room.images && room.images.length > 0 && (
                <div style={{ display: 'flex', gap: '16px' }}>
                  {room.images.map((imgUrl, index) => {
                    const labels = ["Cover View", "Bed Comfort", "Luxury Bath"];
                    const label = labels[index] || `View ${index + 1}`;
                    const isSelected = activeImage === imgUrl;
                    return (
                      <div 
                        key={index} 
                        onClick={() => setActiveImage(imgUrl)}
                        style={{ 
                          flex: 1, 
                          cursor: 'pointer',
                          position: 'relative'
                        }}
                      >
                        <img 
                          src={imgUrl} 
                          alt={`${room.name} ${label}`}
                          style={{
                            width: '100%',
                            height: '90px',
                            objectFit: 'cover',
                            borderRadius: 'var(--radius-md)',
                            border: isSelected ? '2px solid var(--accent-gold)' : '1px solid var(--border-glass)',
                            opacity: isSelected ? 1 : 0.6,
                            transition: 'all 0.2s ease',
                            boxShadow: isSelected ? '0 0 10px rgba(212, 175, 55, 0.3)' : 'none'
                          }}
                          onMouseEnter={() => setActiveImage(imgUrl)}
                        />
                        <div style={{
                          fontSize: '11px',
                          color: isSelected ? 'var(--accent-gold)' : 'var(--text-secondary)',
                          fontWeight: isSelected ? '700' : '400',
                          textAlign: 'center',
                          marginTop: '6px',
                          transition: 'color 0.2s'
                        }}>
                          {label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <span className="gradient-bg" style={{ padding: '6px 16px', borderRadius: 'var(--radius-sm)', fontWeight: '700', fontSize: '13px' }}>
                {room.type.toUpperCase()}
              </span>
              <span style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-glass)',
                padding: '6px 16px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Users size={14} /> Up to {room.capacity} Guests
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <h1 style={{ fontSize: '44px', margin: 0 }}>{room.name}</h1>
              {room.rating > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '18px', color: '#fbbf24', fontWeight: '700' }}>
                  <Star size={18} fill="#fbbf24" stroke="#fbbf24" />
                  <span style={{ color: 'white' }}>{room.rating.toFixed(1)}</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '400' }}>
                    ({room.numReviews} {room.numReviews === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              )}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: '1.8', marginBottom: '40px' }}>
              {room.description}
            </p>

            <h3 style={{ fontSize: '22px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px', marginBottom: '20px' }}>
              Premium Amenities
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '40px' }}>
              {room.amenities.map((amenity, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
                  <CheckCircle2 size={18} style={{ color: 'var(--secondary)' }} />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>

            {/* Reviews Section */}
            <div style={{ marginTop: '56px', borderTop: '1px solid var(--border-glass)', paddingTop: '40px' }}>
              <h3 style={{ fontSize: '24px', marginBottom: '24px' }}>Guest Reviews</h3>
              
              {/* Summary Bar */}
              <div style={{
                display: 'flex',
                gap: '40px',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                marginBottom: '32px'
              }} className="reviews-summary-flex">
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', fontWeight: '800', color: 'white', lineHeight: '1' }}>
                    {room.rating > 0 ? room.rating.toFixed(1) : '0.0'}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', color: '#fbbf24', margin: '8px 0 4px' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={16} 
                        fill={i < Math.round(room.rating) ? '#fbbf24' : 'none'} 
                        stroke="#fbbf24" 
                      />
                    ))}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Based on {room.numReviews} {room.numReviews === 1 ? 'review' : 'reviews'}
                  </div>
                </div>

                <div style={{ flex: 1 }}>
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = room.reviews ? room.reviews.filter(r => Math.round(r.rating) === stars).length : 0;
                    const percentage = room.numReviews > 0 ? (count / room.numReviews) * 100 : 0;
                    return (
                      <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', marginBottom: '6px' }}>
                        <span style={{ width: '48px', color: 'var(--text-secondary)' }}>{stars} Star</span>
                        <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${percentage}%`, height: '100%', background: 'var(--secondary)', borderRadius: '3px' }}></div>
                        </div>
                        <span style={{ width: '24px', textAlign: 'right', color: 'var(--text-muted)' }}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reviews List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '48px' }}>
                {room.reviews && room.reviews.length > 0 ? (
                  room.reviews.map((rev) => (
                    <div key={rev._id} className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                        <div>
                          <h5 style={{ fontSize: '15px', fontWeight: '700', color: 'white', margin: '0 0 4px 0' }}>{rev.name}</h5>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {new Date(rev.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '2px', color: '#fbbf24' }}>
                          {[...Array(5)].map((_, idx) => (
                            <Star 
                              key={idx} 
                              size={14} 
                              fill={idx < rev.rating ? '#fbbf24' : 'none'} 
                              stroke="#fbbf24" 
                            />
                          ))}
                        </div>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
                        {rev.comment}
                      </p>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px 0', border: '1px dashed var(--border-glass)', borderRadius: 'var(--radius-lg)' }}>
                    No reviews for this suite yet. Be the first to share your experience!
                  </div>
                )}
              </div>

              {/* Write Review Form */}
              {currentUser ? (
                canReview ? (
                  <div className="glass" style={{ padding: '32px', borderRadius: 'var(--radius-lg)' }}>
                    <h4 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Write a Customer Review</h4>
                    <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      
                      {reviewError && (
                        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--error)', color: 'var(--error)', padding: '12px', borderRadius: 'var(--radius-md)', fontSize: '13px' }}>
                          {reviewError}
                        </div>
                      )}
                      
                      {reviewSuccess && (
                        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', color: 'var(--success)', padding: '12px', borderRadius: 'var(--radius-md)', fontSize: '13px' }}>
                          {reviewSuccess}
                        </div>
                      )}

                      <div className="input-group">
                        <label className="input-label" style={{ marginBottom: '8px' }}>Your Rating</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewRating(star)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#fbbf24' }}
                            >
                              <Star 
                                size={28} 
                                fill={star <= reviewRating ? '#fbbf24' : 'none'} 
                                stroke="#fbbf24" 
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="input-group">
                        <label className="input-label">Comment</label>
                        <textarea
                          rows="4"
                          className="input-field"
                          placeholder="Tell us about your experience staying in this room..."
                          required
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          style={{ resize: 'vertical', fontFamily: 'inherit' }}
                        ></textarea>
                      </div>

                      <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ alignSelf: 'flex-start', padding: '12px 28px' }}
                        disabled={submittingReview}
                      >
                        {submittingReview ? 'Submitting Review...' : 'Submit Review'}
                      </button>
                    </form>
                  </div>
                ) : (
                  room?.reviews?.some(r => r.user === currentUser._id || r.user?._id === currentUser._id) ? (
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-glass)',
                      padding: '20px',
                      borderRadius: 'var(--radius-lg)',
                      textAlign: 'center',
                      color: 'var(--text-secondary)'
                    }}>
                      Thank you for reviewing this room!
                    </div>
                  ) : (
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-glass)',
                      padding: '20px',
                      borderRadius: 'var(--radius-lg)',
                      textAlign: 'center',
                      color: 'var(--text-muted)'
                    }}>
                      Only verified guests who have booked and stayed in this suite can write a review.
                    </div>
                  )
                )
              ) : (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-glass)',
                  padding: '20px',
                  borderRadius: 'var(--radius-lg)',
                  textAlign: 'center',
                  color: 'var(--text-secondary)'
                }}>
                  Please <span style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: '600' }} onClick={triggerLoginModal}>log in</span> to write a review.
                </div>
              )}
            </div>
          </div>

          {/* Booking Panel */}
          <aside className="glass" style={{ padding: '32px', borderRadius: 'var(--radius-lg)', position: 'sticky', top: '120px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '24px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Price</span>
              <div style={{ fontSize: '32px', fontWeight: '800' }}>
                ₹{room.price} <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '400' }}>/ night</span>
              </div>
            </div>

            {bookingSuccess ? (
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid var(--success)',
                color: 'var(--success)',
                padding: '20px',
                borderRadius: 'var(--radius-lg)',
                textAlign: 'center',
                marginBottom: '20px'
              }}>
                <CheckCircle2 size={40} style={{ margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: '18px', marginBottom: '4px' }}>Booking Confirmed!</h4>
                <p style={{ fontSize: '13px' }}>Redirecting to your booking dashboard...</p>
              </div>
            ) : (
              <form onSubmit={handleBooking} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {bookingError && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid var(--error)',
                    color: 'var(--error)',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '13px'
                  }}>
                    {bookingError}
                  </div>
                )}

                <div className="input-group">
                  <label className="input-label">Check-In</label>
                  <input 
                    type="date" 
                    className="input-field" 
                    required
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Check-Out</label>
                  <input 
                    type="date" 
                    className="input-field" 
                    required
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    min={checkIn || new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Guests</label>
                  <select 
                    className="input-field"
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                  >
                    {[...Array(room.capacity).keys()].map(num => (
                      <option key={num + 1} value={num + 1}>{num + 1} {num === 0 ? 'Guest' : 'Guests'}</option>
                    ))}
                  </select>
                </div>

                {daysCount > 0 && (
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    marginTop: '8px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--text-secondary)' }}>
                      <span>₹{room.price} x {daysCount} nights</span>
                      <span>₹{totalAmount}</span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '16px',
                      fontWeight: '700',
                      borderTop: '1px solid var(--border-glass)',
                      paddingTop: '10px'
                    }}>
                      <span>Total Amount</span>
                      <span className="gradient-text">₹{totalAmount}</span>
                    </div>
                  </div>
                )}

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '14px', marginTop: '8px' }}
                  disabled={bookingLoading}
                >
                  {!currentUser 
                    ? 'Log In to Book Room' 
                    : bookingLoading 
                      ? 'Confirming Booking...' 
                      : 'Confirm Booking'}
                </button>
              </form>
            )}
          </aside>

        </div>
      </div>
      
      <style>{`
        @media (max-width: 900px) {
          .details-container-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* Payment Gateway Modal */}
      {room && (
        <PaymentModal 
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          amount={totalAmount}
          roomName={room.name}
          onPaymentSuccess={executeBooking}
        />
      )}
    </div>
  );
}

export default RoomDetails;
