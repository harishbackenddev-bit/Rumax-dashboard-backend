// utils/email-service.ts
import nodemailer from 'nodemailer';

// ============================================
// SEND STATUS UPDATE EMAIL
// ============================================
export const sendStatusUpdateEmail = async (data: {
  candidateEmail: string;
  candidateName: string;
  status: string;
  jobTitle: string;
  oldStatus: string;
  rejectionReason?: string | null;
  interviewDetails?: {
    date: string;
    time: string;
    interviewer: string;
    format: string;
  } | null;
}) => {
  try {
    const { candidateEmail, candidateName, status, jobTitle, oldStatus, rejectionReason, interviewDetails } = data;

    // Get email template
    const { subject, html } = getStatusEmailTemplate({
      candidateName,
      status,
      jobTitle,
      oldStatus,
      rejectionReason,
      interviewDetails
    });

    // Send email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@yourcompany.com',
      to: candidateEmail,
      subject: subject,
      html: html
    });

    console.log(`Status update email sent to ${candidateEmail} for status: ${status}`);
    return { success: true };

  } catch (error: any) {
    console.error("Failed to send status update email:", error);
    throw error;
  }
};

// ============================================
// SEND DOCUMENT REQUEST EMAIL
// ============================================
export const sendDocumentRequestEmail = async (data: {
  candidateEmail: string;
  candidateName: string;
  documents: string[];
  note: string;
  jobTitle: string;
}) => {
  try {
    const { candidateEmail, candidateName, documents, note, jobTitle } = data;

    // Generate document list HTML
    const documentList = documents.map(doc => `
      <li style="padding: 8px 12px; background: #f8f9fa; border-radius: 6px; margin-bottom: 6px; list-style: none;">
        📄 ${doc}
      </li>
    `).join('');

    const subject = `Document Request - ${jobTitle}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff;">
        <div style="background: #0f4c81; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">📄 Document Request</h1>
        </div>
        
        <div style="padding: 24px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
          <h2 style="color: #0f4c81; margin-top: 0;">Dear ${candidateName},</h2>
          
          <p style="color: #333; line-height: 1.6;">
            Thank you for your application for the <strong>${jobTitle}</strong> position.
            We are reviewing your application and require the following documents to proceed:
          </p>
          
          <div style="background: #f8f9fa; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <h3 style="color: #0f4c81; margin-top: 0; font-size: 16px;">Required Documents:</h3>
            <ul style="padding: 0; margin: 0;">
              ${documentList}
            </ul>
          </div>
          
          ${note ? `
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px 16px; border-radius: 4px; margin: 16px 0;">
              <p style="margin: 0; color: #856404;">
                <strong>📌 Note from Recruiter:</strong><br>
                ${note}
              </p>
            </div>
          ` : ''}
          
          <div style="background: #e8f0fe; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <h4 style="margin: 0 0 8px 0; color: #0f4c81;">📤 How to Submit:</h4>
            <p style="margin: 0; color: #333;">
              Please upload the requested documents through your candidate portal or reply to this email with the attachments.
            </p>
          </div>
          
          <p style="color: #333; line-height: 1.6;">
            We appreciate your cooperation and look forward to reviewing your complete application.
          </p>
          
          <p style="color: #333; line-height: 1.6;">
            Best regards,<br>
            <strong style="color: #0f4c81;">Hiring Team</strong>
          </p>
          
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
          
          <p style="color: #666; font-size: 12px; text-align: center;">
            This is an automated notification. Please do not reply to this email.<br>
            If you have any questions, please contact our support team.
          </p>
        </div>
      </div>
    `;

    // Send email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@yourcompany.com',
      to: candidateEmail,
      subject: subject,
      html: html
    });

    console.log(`Document request email sent to ${candidateEmail}`);
    return { success: true };

  } catch (error: any) {
    console.error("Failed to send document request email:", error);
    throw error;
  }
};

// ============================================
// STATUS EMAIL TEMPLATE GENERATOR
// ============================================
const getStatusEmailTemplate = (data: {
  candidateName: string;
  status: string;
  jobTitle: string;
  oldStatus: string;
  rejectionReason?: string | null;
  interviewDetails?: {
    date: string;
    time: string;
    interviewer: string;
    format: string;
  } | null;
}) => {
  const { candidateName, status, jobTitle, oldStatus, rejectionReason, interviewDetails } = data;

  let subject = '';
  let html = '';
  let title = '';
  let color = '#0f4c81';

  switch (status) {
    case 'Document Requested':
      subject = `Document Request - ${jobTitle}`;
      title = '📄 Documents Required';
      color = '#0f4c81';
      html = `
        <p>Dear ${candidateName},</p>
        <p>We are reviewing your application for <strong>${jobTitle}</strong>.</p>
        <p>We need some additional documents to proceed with your application.</p>
        <p>Please check your email for the detailed document request.</p>
        <p>We appreciate your cooperation.</p>
      `;
      break;

    case 'Pending':
      subject = `Application Received - ${jobTitle}`;
      title = '✅ Application Received';
      color = '#0f4c81';
      html = `
        <p>Dear ${candidateName},</p>
        <p>We have received your application for <strong>${jobTitle}</strong>.</p>
        <p>Our team will review your application and contact you soon.</p>
        <p>Thank you for your interest.</p>
      `;
      break;

    case 'In Review':
      subject = `Application Under Review - ${jobTitle}`;
      title = '📋 Application Under Review';
      color = '#7c3aed';
      html = `
        <p>Dear ${candidateName},</p>
        <p>Your application for <strong>${jobTitle}</strong> is now under review.</p>
        <p>Our hiring team is carefully evaluating your qualifications.</p>
        <p>We will contact you with further updates soon.</p>
      `;
      break;

    case 'Interview Scheduled':
      subject = `Interview Scheduled for ${jobTitle}`;
      title = '📅 Interview Scheduled';
      color = '#059669';
      html = `
        <p>Dear ${candidateName},</p>
        <p>Your interview for <strong>${jobTitle}</strong> has been scheduled.</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p><strong>Date:</strong> ${interviewDetails?.date || 'TBD'}</p>
          <p><strong>Time:</strong> ${interviewDetails?.time || 'TBD'}</p>
          <p><strong>Interviewer:</strong> ${interviewDetails?.interviewer || 'TBD'}</p>
          <p><strong>Format:</strong> ${interviewDetails?.format || 'Video Call (Teams)'}</p>
        </div>
        <p>Please ensure you are prepared and available.</p>
        <p>Good luck!</p>
      `;
      break;

    case 'Offer Sent':
      subject = `Job Offer - ${jobTitle}`;
      title = '🎉 Job Offer';
      color = '#7c3aed';
      html = `
        <p>Dear ${candidateName},</p>
        <p>We are pleased to offer you the position of <strong>${jobTitle}</strong>.</p>
        <p>Please check your email for the official offer letter.</p>
        <p>We look forward to your positive response.</p>
      `;
      break;

    case 'Hired':
      subject = `Welcome to the Team! - ${jobTitle}`;
      title = '🌟 Welcome Aboard!';
      color = '#16a34a';
      html = `
        <p>Dear ${candidateName},</p>
        <p>Welcome as our new <strong>${jobTitle}</strong>!</p>
        <p>You will receive onboarding details shortly.</p>
        <p>Welcome aboard!</p>
      `;
      break;

    case 'Rejected':
      subject = `Application Status - ${jobTitle}`;
      title = '❌ Application Status';
      color = '#dc2626';
      html = `
        <p>Dear ${candidateName},</p>
        <p>Thank you for your interest in <strong>${jobTitle}</strong>.</p>
        <p>After careful consideration, your application has not been successful.</p>
        ${rejectionReason ? `<p><strong>Reason:</strong> ${rejectionReason}</p>` : ''}
        <p>We wish you the best in your future endeavors.</p>
      `;
      break;

    case 'Standby':
      subject = `Application on Standby - ${jobTitle}`;
      title = '⏳ Application on Standby';
      color = '#b45309';
      html = `
        <p>Dear ${candidateName},</p>
        <p>Your application for <strong>${jobTitle}</strong> has been placed on standby.</p>
        <p>We will contact you when there are further updates.</p>
        <p>Thank you for your patience.</p>
      `;
      break;

    default:
      subject = `Application Status Update - ${jobTitle}`;
      title = '📋 Status Update';
      color = '#0f4c81';
      html = `
        <p>Dear ${candidateName},</p>
        <p>Your application for <strong>${jobTitle}</strong> has been updated to <strong>${status}</strong>.</p>
        <p>We will contact you with further updates.</p>
      `;
      break;
  }

  // Wrap with template
  const fullHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff;">
      <div style="background: ${color}; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${title}</h1>
      </div>
      
      <div style="padding: 24px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
        ${html}
        
        <p style="color: #333; line-height: 1.6; margin-top: 16px;">
          Best regards,<br>
          <strong style="color: ${color};">Hiring Team</strong>
        </p>
        
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        
        <p style="color: #666; font-size: 12px; text-align: center;">
          This is an automated notification. Please do not reply to this email.
        </p>
      </div>
    </div>
  `;

  return { subject, html: fullHtml };
};