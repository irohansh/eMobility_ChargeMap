const nodemailer = require('nodemailer');
require('dotenv').config();

const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

const sendWelcomeEmail = async (userEmail, userName) => {
    try {
        const transporter = createTransporter();
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: 'Welcome to ChargeMap - Your EV Charging Solution',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
                        <h1 style="margin: 0; font-size: 28px;">ChargeMap</h1>
                        <p style="margin: 10px 0 0 0; font-size: 16px;">Your EV Charging Solution</p>
                    </div>
                    
                    <div style="padding: 30px; background-color: #f8f9fa;">
                        <h2 style="color: #333; margin-bottom: 20px;">Welcome, ${userName}!</h2>
                        
                        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                            Thank you for joining ChargeMap! You're now part of a community of EV owners 
                            who are making sustainable transportation accessible and convenient.
                        </p>
                        
                        <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
                            <h3 style="color: #333; margin-top: 0;">What you can do now:</h3>
                            <ul style="color: #666; line-height: 1.8;">
                                <li>Find charging stations near you</li>
                                <li>Book charging sessions in advance</li>
                                <li>Rate and review your charging experiences</li>
                                <li>Track your charging history and statistics</li>
                            </ul>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/stations" 
                               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                      color: white; 
                                      padding: 12px 30px; 
                                      text-decoration: none; 
                                      border-radius: 25px; 
                                      font-weight: bold;
                                      display: inline-block;">
                                Find Charging Stations
                            </a>
                        </div>
                        
                        <p style="color: #666; line-height: 1.6; font-size: 14px;">
                            If you have any questions or need assistance, feel free to reach out to our support team.
                        </p>
                    </div>
                    
                    <div style="background-color: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
                        <p style="margin: 0;">© 2025 ChargeMap. All rights reserved.</p>
                        <p style="margin: 5px 0 0 0;">This email was sent to ${userEmail}</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('Welcome email sent successfully to:', userEmail);
        return true;
    } catch (error) {
        console.error('Error sending welcome email:', error);
        return false;
    }
};

const sendBookingConfirmationEmail = async (userEmail, userName, bookingDetails) => {
    try {
        const transporter = createTransporter();
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: 'Charging Session Confirmed - ChargeMap',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
                        <h1 style="margin: 0; font-size: 28px;">ChargeMap</h1>
                        <p style="margin: 10px 0 0 0; font-size: 16px;">Charging Session Confirmed</p>
                    </div>
                    
                    <div style="padding: 30px; background-color: #f8f9fa;">
                        <h2 style="color: #333; margin-bottom: 20px;">Hello ${userName}! ✅</h2>
                        
                        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                            Your charging session has been successfully booked. Here are the details:
                        </p>
                        
                        <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #333; margin-top: 0;">Booking Details:</h3>
                            <p style="color: #666; margin: 5px 0;"><strong>Station:</strong> ${bookingDetails.stationName}</p>
                            <p style="color: #666; margin: 5px 0;"><strong>Address:</strong> ${bookingDetails.address}</p>
                            <p style="color: #666; margin: 5px 0;"><strong>Start Time:</strong> ${new Date(bookingDetails.startTime).toLocaleString()}</p>
                            <p style="color: #666; margin: 5px 0;"><strong>End Time:</strong> ${new Date(bookingDetails.endTime).toLocaleString()}</p>
                            <p style="color: #666; margin: 5px 0;"><strong>Vehicle:</strong> ${bookingDetails.vehicleInfo || 'Not specified'}</p>
                        </div>
                        
                        <p style="color: #666; line-height: 1.6; font-size: 14px;">
                            Please arrive on time for your charging session. You can manage your bookings in your dashboard.
                        </p>
                    </div>
                    
                    <div style="background-color: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
                        <p style="margin: 0;">© 2025 ChargeMap. All rights reserved.</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('Booking confirmation email sent successfully to:', userEmail);
        return true;
    } catch (error) {
        console.error('Error sending booking confirmation email:', error);
        return false;
    }
};

const sendPaymentConfirmationEmail = async (userEmail, userName, paymentDetails) => {
    try {
        const transporter = createTransporter();
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: 'Payment Confirmed - ChargeMap',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
                        <h1 style="margin: 0; font-size: 28px;">ChargeMap</h1>
                        <p style="margin: 10px 0 0 0; font-size: 16px;">Payment Confirmed</p>
                    </div>
                    
                    <div style="padding: 30px; background-color: #f8f9fa;">
                        <h2 style="color: #333; margin-bottom: 20px;">Hello ${userName}! ✅</h2>
                        
                        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                            Your payment has been successfully processed. Your charging session is now confirmed.
                        </p>
                        
                        <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
                            <h3 style="color: #333; margin-top: 0;">Payment Details:</h3>
                            <p style="color: #666; margin: 5px 0;"><strong>Amount:</strong> $${paymentDetails.amount.toFixed(2)}</p>
                            <p style="color: #666; margin: 5px 0;"><strong>Date:</strong> ${new Date(paymentDetails.paymentDate).toLocaleString()}</p>
                            <p style="color: #666; margin: 5px 0;"><strong>Station:</strong> ${paymentDetails.stationName}</p>
                            <p style="color: #666; margin: 5px 0;"><strong>Booking ID:</strong> ${paymentDetails.bookingId}</p>
                        </div>
                        
                        <p style="color: #666; line-height: 1.6; font-size: 14px;">
                            Thank you for choosing ChargeMap. Your booking is now active and you're all set!
                        </p>
                    </div>
                    
                    <div style="background-color: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
                        <p style="margin: 0;">© 2025 ChargeMap. All rights reserved.</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('Payment confirmation email sent successfully to:', userEmail);
        return true;
    } catch (error) {
        console.error('Error sending payment confirmation email:', error);
        return false;
    }
};

module.exports = {
    sendWelcomeEmail,
    sendBookingConfirmationEmail,
    sendPaymentConfirmationEmail
};
