const nodemailer = require('nodemailer');

/**
 * Helper to format date cleanly
 */
const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Sends booking confirmation or cancellation emails with HTML invoices
 */
const sendBookingEmail = async ({ booking, action }) => {
  try {
    let transporter;

    // Check environment config, otherwise fallback to Ethereal test account
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    } else {
      // Auto-generated Ethereal SMTP account
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
    }

    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    const nights = Math.max(1, Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24)));
    
    const totalAmount = booking.totalAmount;
    const subtotal = (totalAmount / 1.18).toFixed(2);
    const tax = ((totalAmount - (totalAmount / 1.18)) / 2).toFixed(2); // CGST and SGST equal splits
    
    const guestName = booking.user?.name || 'Valued Guest';
    const guestEmail = booking.user?.email;
    const roomName = booking.room?.name || 'Luxury Suite';
    const roomType = booking.room?.type || 'Standard';
    const roomRate = booking.room ? booking.room.price : (totalAmount / nights);
    
    const invoiceNo = `RIS-${booking._id.toString().substring(booking._id.toString().length - 8).toUpperCase()}`;
    const formattedCheckIn = formatDate(booking.checkIn);
    const formattedCheckOut = formatDate(booking.checkOut);
    
    if (!guestEmail) {
      console.warn('Cannot send booking email. User email is missing.');
      return;
    }

    // Determine subject and color theme
    const isCreate = action === 'create';
    const subject = isCreate
      ? `Booking Confirmation & Invoice: ${invoiceNo} - Royal India Stays`
      : `Booking Cancellation & Refund Notice: ${invoiceNo} - Royal India Stays`;
      
    const bannerColor = isCreate ? '#6366F1' : '#EF4444';
    const statusText = isCreate ? 'CONFIRMED & PAID' : 'CANCELLED & REFUNDED';
    const statusBadgeColor = isCreate ? '#D1FAE5' : '#FEE2E2';
    const statusTextColor = isCreate ? '#065F46' : '#991B1B';

    // Construct Luxury HTML Email Template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #f3f4f6; color: #1f2937;">
        <div style="max-width: 650px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);">
          
          <!-- Banner -->
          <div style="background: linear-gradient(135deg, ${bannerColor}, #06B6D4); padding: 32px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.02em;">Royal India Stays</h1>
            <p style="margin: 8px 0 0 0; font-size: 15px; opacity: 0.9;">Luxury Heritage Accommodations</p>
          </div>

          <!-- Body -->
          <div style="padding: 40px 32px;">
            <p style="font-size: 16px; line-height: 1.5; margin-top: 0;">Dear <strong>${guestName}</strong>,</p>
            
            <p style="font-size: 15px; line-height: 1.6; color: #4b5563;">
              ${isCreate 
                ? `Thank you for choosing Royal India Stays. Your reservation has been successfully completed and paid. We are delighted to host you soon! Below is your reservation details and tax invoice receipt.`
                : `We are writing to confirm that your booking has been cancelled as requested. If applicable, your refund of the total paid amount is being processed to your original payment mode and should reflect within 5-7 business days.`}
            </p>

            <!-- Status Badge -->
            <div style="display: inline-block; background-color: ${statusBadgeColor}; color: ${statusTextColor}; font-weight: 700; font-size: 13px; padding: 6px 16px; border-radius: 50px; text-transform: uppercase; margin-bottom: 30px; letter-spacing: 0.05em;">
              ${statusText}
            </div>

            <!-- Invoice Details Table -->
            <div style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin-bottom: 30px;">
              <div style="background-color: #f9fafb; padding: 16px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 700; font-size: 14px; text-transform: uppercase; color: #374151; letter-spacing: 0.02em;">Invoice Receipt</span>
                <span style="font-size: 13px; color: #6b7280;"><strong>No:</strong> ${invoiceNo}</span>
              </div>
              <div style="padding: 20px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280; width: 40%;">Guest Name:</td>
                    <td style="padding: 6px 0; font-weight: 600; color: #111827;">${guestName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280;">Email Address:</td>
                    <td style="padding: 6px 0; font-weight: 600; color: #111827;">${guestEmail}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280;">Accommodation:</td>
                    <td style="padding: 6px 0; font-weight: 600; color: #111827;">${roomName} (${roomType})</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280;">Duration:</td>
                    <td style="padding: 6px 0; font-weight: 600; color: #111827;">${formattedCheckIn} to ${formattedCheckOut} (${nights} Night${nights > 1 ? 's' : ''})</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280;">Number of Guests:</td>
                    <td style="padding: 6px 0; font-weight: 600; color: #111827;">${booking.guests} Guest${booking.guests > 1 ? 's' : ''}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280;">Payment Method:</td>
                    <td style="padding: 6px 0; font-weight: 600; color: #111827;">${booking.paymentMethod || 'Not Specified'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280;">Transaction ID:</td>
                    <td style="padding: 6px 0; font-weight: 600; color: #111827; font-family: monospace; font-size: 13px;">${booking.transactionId || 'N/A'}</td>
                  </tr>
                </table>
              </div>
            </div>

            <!-- Ledger Table -->
            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 30px;">
              <thead>
                <tr style="border-bottom: 2px solid #e5e7eb;">
                  <th style="padding: 10px 0; text-align: left; color: #4b5563; font-weight: 600;">Item Description</th>
                  <th style="padding: 10px 0; text-align: center; color: #4b5563; font-weight: 600;">Nights</th>
                  <th style="padding: 10px 0; text-align: right; color: #4b5563; font-weight: 600;">Rate per Night</th>
                  <th style="padding: 10px 0; text-align: right; color: #4b5563; font-weight: 600;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom: 1px solid #f3f4f6;">
                  <td style="padding: 16px 0;">
                    <strong style="color: #111827; display: block;">Room Charges</strong>
                    <span style="font-size: 12px; color: #6b7280;">${roomName}</span>
                  </td>
                  <td style="padding: 16px 0; text-align: center; color: #111827;">${nights}</td>
                  <td style="padding: 16px 0; text-align: right; color: #111827;">₹${Number(roomRate).toFixed(2)}</td>
                  <td style="padding: 16px 0; text-align: right; font-weight: 600; color: #111827;">₹${(roomRate * nights).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            <!-- Pricing Summary Breakdown -->
            <div style="display: flex; flex-direction: column; align-items: flex-end; margin-bottom: 30px;">
              <table style="width: 250px; font-size: 14px; border-collapse: collapse;">
                <tr>
                  <td style="padding: 6px 0; color: #6b7280;">Subtotal (Excl. Tax)</td>
                  <td style="padding: 6px 0; text-align: right; color: #111827;">₹${subtotal}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #6b7280;">CGST (9.0%)</td>
                  <td style="padding: 6px 0; text-align: right; color: #111827;">₹${tax}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #6b7280;">SGST (9.0%)</td>
                  <td style="padding: 6px 0; text-align: right; color: #111827;">₹${tax}</td>
                </tr>
                <tr style="border-top: 1px solid #e5e7eb;">
                  <td style="padding: 12px 0 6px 0; font-weight: 700; color: #111827;">Total Paid</td>
                  <td style="padding: 12px 0 6px 0; font-weight: 700; text-align: right; color: #6366F1; font-size: 16px;">₹${Number(totalAmount).toFixed(2)}</td>
                </tr>
              </table>
            </div>

            <!-- Notes -->
            <div style="background-color: #f9fafb; border-left: 4px solid #06B6D4; padding: 16px; border-radius: 4px; font-size: 13px; color: #4b5563; line-height: 1.5; margin-bottom: 30px;">
              <strong>Guest Guidelines:</strong><br />
              • Check-in time is 2:00 PM; Check-out time is 11:00 AM.<br />
              • Government-approved photo ID is required upon check-in.
            </div>

            <p style="font-size: 15px; color: #4b5563; margin-bottom: 0;">
              Best Regards,<br />
              <strong>Royal India Stays Reservations Team</strong>
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #f9fafb; border-top: 1px solid #e5e7eb; padding: 24px; text-align: center; font-size: 12px; color: #9ca3af;">
            &copy; 2026 Royal India Stays MERN App. All rights reserved.<br />
            101, Marine Drive, Mumbai, Maharashtra, India - 400020
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: '"Royal India Stays" <reservations@royalindiastays.com>',
      to: guestEmail,
      subject: subject,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Notification sent successfully. Message ID: ${info.messageId}`);
    
    // Log preview link if using Ethereal test account
    if (nodemailer.getTestMessageUrl(info)) {
      console.log(`[Email Service] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
  } catch (error) {
    console.error('[Email Service] Failed to send email:', error);
  }
};

module.exports = { sendBookingEmail };
