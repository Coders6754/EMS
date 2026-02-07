const nodemailer = require('nodemailer');

let transporter = null;

// Initialize transporter
try {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    // Verify transporter configuration
    transporter.verify(function (error, success) {
      if (error) {
        console.error('✗ Email service verification failed:', error.message);
        console.warn('Email notifications will not be sent');
      } else {
        console.log('✓ Email service initialized and verified successfully');
        console.log(`   From: ${process.env.EMAIL_USER}`);
      }
    });
  } else {
    console.warn('⚠ Email credentials not found in environment variables');
    console.warn('   EMAIL_USER and EMAIL_PASS must be set in .env file');
    console.warn('   Email notifications will not be sent');
  }
} catch (error) {
  console.error('✗ Email service initialization failed:', error.message);
  console.warn('The application will run without email notifications');
}

// Generic email sender
const sendEmail = async (to, subject, text, html) => {
  if (!transporter || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('📧 Email would be sent to:', to);
    console.log('   Subject:', subject);
    console.log('   (Email service not configured - skipping)');
    console.log('   To enable emails, set EMAIL_USER and EMAIL_PASS in .env file');
    return { success: false, message: 'Email service not configured' };
  }
  
  if (!to) {
    console.warn('⚠ Email recipient not provided');
    return { success: false, message: 'Email recipient not provided' };
  }
  
  try {
    const info = await transporter.sendMail({
      from: `"EMS System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html: html || text
    });
    console.log('✓ Email sent successfully to:', to);
    console.log('   Message ID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('✗ Email sending failed:', error.message);
    console.error('   To:', to);
    console.error('   Subject:', subject);
    if (error.response) {
      console.error('   Error details:', error.response);
    }
    return { success: false, message: error.message };
  }
};


const sendProjectProposalEmail = async (projectData, managerEmail, financeEmail) => {
  const subject = 'New Project Proposal Submitted - Review Required';
  const text = `A new project proposal has been submitted. Please review and approve/reject it.
  
Project Details:
- Project Name: ${projectData.projectName}
- Client Name: ${projectData.clientName}
- Budget: $${projectData.budget}
- Submission Date: ${new Date(projectData.submissionDate).toLocaleDateString()}
- Status: ${projectData.status}

Please log in to the EMS system to review the full details and take action.`;

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #2563eb; margin-top: 0;">New Project Proposal Submitted</h2>
        <p style="color: #666; font-size: 16px;">A new project proposal has been submitted. Please review and approve/reject it.</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #334155; margin-top: 0;">Project Details:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Project Name:</td>
              <td style="padding: 8px 0; color: #1e293b;">${projectData.projectName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Client Name:</td>
              <td style="padding: 8px 0; color: #1e293b;">${projectData.clientName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Budget:</td>
              <td style="padding: 8px 0; color: #1e293b; font-weight: bold;">$${projectData.budget}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Submission Date:</td>
              <td style="padding: 8px 0; color: #1e293b;">${new Date(projectData.submissionDate).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Status:</td>
              <td style="padding: 8px 0;"><span style="background-color: #fef3c7; color: #92400e; padding: 4px 12px; border-radius: 12px; font-size: 14px;">${projectData.status}</span></td>
            </tr>
          </table>
        </div>
        
        <p style="color: #475569; margin-top: 20px;">Please log in to the EMS system to review the full details and take action.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px;">
          <p>This is an automated email from the Employee Management System.</p>
        </div>
      </div>
    </div>
  `;

  // Send to both manager and finance head
  const recipients = [managerEmail, financeEmail].filter(email => email);
  const emailPromises = recipients.map(email => sendEmail(email, subject, text, html));
  
  return await Promise.all(emailPromises);
};


const sendProjectStatusEmail = async (projectData, recipientEmail, oldStatus, newStatus) => {
  const statusEmojis = {
    'Submitted': '📝',
    'Under Review': '🔍',
    'Approved': '✅',
    'Rejected': '❌'
  };

  const statusColors = {
    'Submitted': { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' },
    'Under Review': { bg: '#dbeafe', text: '#1e40af', border: '#3b82f6' },
    'Approved': { bg: '#d1fae5', text: '#065f46', border: '#10b981' },
    'Rejected': { bg: '#fee2e2', text: '#991b1b', border: '#ef4444' }
  };

  const color = statusColors[newStatus] || statusColors['Submitted'];
  const emoji = statusEmojis[newStatus] || '📋';

  const subject = `${emoji} Project Status Updated - ${projectData.projectName} [${newStatus}]`;
  
  const text = `The project "${projectData.projectName}" status has been updated from "${oldStatus}" to "${newStatus}".

Project Details:
- Project Name: ${projectData.projectName}
- Budget: $${projectData.budget}
- Submission Date: ${new Date(projectData.submissionDate).toLocaleDateString()}
- Previous Status: ${oldStatus}
- New Status: ${newStatus}
${projectData.rejectionReason ? `- Rejection Reason: ${projectData.rejectionReason}` : ''}

Please log in to the EMS system to view more details.`;

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h2 style="color: ${color.border}; margin-top: 0;">
          ${emoji} Project Status Updated
        </h2>
        <p style="color: #666; font-size: 16px;">
          The project <strong>"${projectData.projectName}"</strong> status has been updated from 
          <strong>"${oldStatus}"</strong> to <strong>"${newStatus}"</strong>.
        </p>
        
        <div style="background-color: ${color.bg}; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${color.border};">
          <h3 style="color: ${color.text}; margin-top: 0;">Project Details:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Project Name:</td>
              <td style="padding: 8px 0; color: #1e293b; font-weight: bold;">${projectData.projectName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Budget:</td>
              <td style="padding: 8px 0; color: #1e293b; font-weight: bold;">$${projectData.budget}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Submission Date:</td>
              <td style="padding: 8px 0; color: #1e293b;">${new Date(projectData.submissionDate).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Previous Status:</td>
              <td style="padding: 8px 0; color: #64748b;">${oldStatus}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">New Status:</td>
              <td style="padding: 8px 0;">
                <span style="background-color: ${color.bg}; color: ${color.text}; padding: 4px 12px; border-radius: 12px; font-size: 14px; font-weight: bold;">
                  ${newStatus}
                </span>
              </td>
            </tr>
            ${projectData.rejectionReason ? `
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Rejection Reason:</td>
              <td style="padding: 8px 0; color: #dc2626;">${projectData.rejectionReason}</td>
            </tr>
            ` : ''}
          </table>
        </div>
        
        <p style="color: #475569; margin-top: 20px;">Please log in to the EMS system to view more details.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px;">
          <p>This is an automated email from the Employee Management System.</p>
        </div>
      </div>
    </div>
  `;

  return await sendEmail(recipientEmail, subject, text, html);
};


const sendInvoiceEmail = async (invoiceData, clientEmail) => {
  const subject = `Invoice ${invoiceData.invoiceNumber} Generated - ${invoiceData.projectName}`;
  const text = `Your invoice [${invoiceData.invoiceNumber}] for the project [${invoiceData.projectName}] has been generated. Please find the details attached.
  
Invoice Details:
- Invoice Number: ${invoiceData.invoiceNumber}
- Project: ${invoiceData.projectName}
- Amount: $${invoiceData.amount}
- Due Date: ${new Date(invoiceData.dueDate).toLocaleDateString()}
- Status: ${invoiceData.status}

Please ensure payment is made by the due date.`;

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #16a34a; margin-top: 0;">Invoice Generated</h2>
        <p style="color: #666; font-size: 16px;">Your invoice <strong>[${invoiceData.invoiceNumber}]</strong> for the project <strong>[${invoiceData.projectName}]</strong> has been generated. Please find the details attached.</p>
        
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
          <h3 style="color: #166534; margin-top: 0;">Invoice Details:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #15803d; font-weight: 600;">Invoice Number:</td>
              <td style="padding: 8px 0; color: #14532d; font-weight: bold;">${invoiceData.invoiceNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #15803d; font-weight: 600;">Project:</td>
              <td style="padding: 8px 0; color: #14532d;">${invoiceData.projectName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #15803d; font-weight: 600;">Amount:</td>
              <td style="padding: 8px 0; color: #14532d; font-size: 20px; font-weight: bold;">$${invoiceData.amount}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #15803d; font-weight: 600;">Due Date:</td>
              <td style="padding: 8px 0; color: #14532d;">${new Date(invoiceData.dueDate).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #15803d; font-weight: 600;">Status:</td>
              <td style="padding: 8px 0;"><span style="background-color: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 12px; font-size: 14px;">${invoiceData.status}</span></td>
            </tr>
          </table>
        </div>
        
        <p style="color: #475569; margin-top: 20px;">Please ensure payment is made by the due date.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px;">
          <p>This is an automated email from the Employee Management System.</p>
          <p>For any queries, please contact our finance department.</p>
        </div>
      </div>
    </div>
  `;

  return await sendEmail(clientEmail, subject, text, html);
};


const sendInvoiceStatusEmail = async (invoiceData, clientEmail, oldStatus, newStatus) => {
  const statusEmojis = {
    'Pending': '⏳',
    'Paid': '✅',
    'Overdue': '⚠️'
  };

  const statusColors = {
    'Pending': { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' },
    'Paid': { bg: '#d1fae5', text: '#065f46', border: '#10b981' },
    'Overdue': { bg: '#fee2e2', text: '#991b1b', border: '#ef4444' }
  };

  const color = statusColors[newStatus] || statusColors['Pending'];
  const emoji = statusEmojis[newStatus] || '📋';

  const subject = `${emoji} Invoice ${invoiceData.invoiceNumber} Status Updated - ${newStatus}`;
  
  const text = `Your invoice "${invoiceData.invoiceNumber}" status has been updated from "${oldStatus}" to "${newStatus}".

Invoice Details:
- Invoice Number: ${invoiceData.invoiceNumber}
- Client Name: ${invoiceData.clientName}
- Project: ${invoiceData.projectName}
- Amount: $${invoiceData.amount}
- Due Date: ${new Date(invoiceData.dueDate).toLocaleDateString()}
- Previous Status: ${oldStatus}
- New Status: ${newStatus}

${newStatus === 'Paid' ? 'Thank you for your payment!' : newStatus === 'Overdue' ? 'Please make payment as soon as possible to avoid further penalties.' : 'Your invoice is pending payment.'}

Please log in to the EMS system to view more details.`;

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h2 style="color: ${color.border}; margin-top: 0;">
          ${emoji} Invoice Status Updated
        </h2>
        <p style="color: #666; font-size: 16px;">
          Your invoice <strong>"${invoiceData.invoiceNumber}"</strong> status has been updated from 
          <strong>"${oldStatus}"</strong> to <strong>"${newStatus}"</strong>.
        </p>
        
        <div style="background-color: ${color.bg}; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${color.border};">
          <h3 style="color: ${color.text}; margin-top: 0;">Invoice Details:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Invoice Number:</td>
              <td style="padding: 8px 0; color: #1e293b; font-weight: bold;">${invoiceData.invoiceNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Client Name:</td>
              <td style="padding: 8px 0; color: #1e293b;">${invoiceData.clientName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Project:</td>
              <td style="padding: 8px 0; color: #1e293b;">${invoiceData.projectName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Amount:</td>
              <td style="padding: 8px 0; color: #1e293b; font-size: 20px; font-weight: bold;">$${invoiceData.amount?.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Due Date:</td>
              <td style="padding: 8px 0; color: #1e293b;">${new Date(invoiceData.dueDate).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Previous Status:</td>
              <td style="padding: 8px 0; color: #64748b;">${oldStatus}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">New Status:</td>
              <td style="padding: 8px 0;">
                <span style="background-color: ${color.bg}; color: ${color.text}; padding: 4px 12px; border-radius: 12px; font-size: 14px; font-weight: bold;">
                  ${newStatus}
                </span>
              </td>
            </tr>
          </table>
        </div>
        
        ${newStatus === 'Paid' ? `
        <div style="background-color: #d1fae5; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
          <p style="color: #065f46; margin: 0; font-weight: 600;">✅ Thank you for your payment!</p>
        </div>
        ` : newStatus === 'Overdue' ? `
        <div style="background-color: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
          <p style="color: #991b1b; margin: 0; font-weight: 600;">⚠️ Please make payment as soon as possible to avoid further penalties.</p>
        </div>
        ` : `
        <p style="color: #475569; margin-top: 20px;">Your invoice is pending payment. Please ensure payment is made by the due date.</p>
        `}
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px;">
          <p>This is an automated email from the Employee Management System.</p>
          <p>For any queries, please contact our finance department.</p>
        </div>
      </div>
    </div>
  `;

  return await sendEmail(clientEmail, subject, text, html);
};


const sendLeaveRequestEmail = async (leaveData, managerEmail) => {
  const subject = `Leave Request Submitted - ${leaveData.employeeName}`;
  const text = `[${leaveData.employeeName}] has submitted a leave request from [${new Date(leaveData.startDate).toLocaleDateString()}] to [${new Date(leaveData.endDate).toLocaleDateString()}]. Please review and approve/reject it.
  
Leave Request Details:
- Employee: ${leaveData.employeeName}
- Leave Type: ${leaveData.leaveType}
- Start Date: ${new Date(leaveData.startDate).toLocaleDateString()}
- End Date: ${new Date(leaveData.endDate).toLocaleDateString()}
- Duration: ${leaveData.duration} day(s)
- Reason: ${leaveData.reason || 'Not specified'}
- Status: ${leaveData.status}

Please log in to the EMS system to review and take action.`;

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #ea580c; margin-top: 0;">Leave Request Submitted</h2>
        <p style="color: #666; font-size: 16px;"><strong>[${leaveData.employeeName}]</strong> has submitted a leave request from <strong>[${new Date(leaveData.startDate).toLocaleDateString()}]</strong> to <strong>[${new Date(leaveData.endDate).toLocaleDateString()}]</strong>. Please review and approve/reject it.</p>
        
        <div style="background-color: #fff7ed; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ea580c;">
          <h3 style="color: #9a3412; margin-top: 0;">Leave Request Details:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #c2410c; font-weight: 600;">Employee:</td>
              <td style="padding: 8px 0; color: #7c2d12;">${leaveData.employeeName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #c2410c; font-weight: 600;">Leave Type:</td>
              <td style="padding: 8px 0; color: #7c2d12;">${leaveData.leaveType}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #c2410c; font-weight: 600;">Start Date:</td>
              <td style="padding: 8px 0; color: #7c2d12;">${new Date(leaveData.startDate).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #c2410c; font-weight: 600;">End Date:</td>
              <td style="padding: 8px 0; color: #7c2d12;">${new Date(leaveData.endDate).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #c2410c; font-weight: 600;">Duration:</td>
              <td style="padding: 8px 0; color: #7c2d12; font-weight: bold;">${leaveData.duration} day(s)</td>
            </tr>
            ${leaveData.reason ? `
            <tr>
              <td style="padding: 8px 0; color: #c2410c; font-weight: 600;">Reason:</td>
              <td style="padding: 8px 0; color: #7c2d12;">${leaveData.reason}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 8px 0; color: #c2410c; font-weight: 600;">Status:</td>
              <td style="padding: 8px 0;"><span style="background-color: #fef3c7; color: #92400e; padding: 4px 12px; border-radius: 12px; font-size: 14px;">${leaveData.status}</span></td>
            </tr>
          </table>
        </div>
        
        <p style="color: #475569; margin-top: 20px;">Please log in to the EMS system to review and take action.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px;">
          <p>This is an automated email from the Employee Management System.</p>
        </div>
      </div>
    </div>
  `;

  return await sendEmail(managerEmail, subject, text, html);
};

// Leave Request Approval/Rejection Email to Employee
const sendLeaveStatusEmail = async (leaveData, employeeEmail, status) => {
  const isApproved = status === 'Approved';
  const subject = isApproved 
    ? `✅ Leave Request Approved - ${leaveData.leaveType}` 
    : `❌ Leave Request Rejected - ${leaveData.leaveType}`;
  
  const statusColor = isApproved ? '#16a34a' : '#dc2626';
  const statusBgColor = isApproved ? '#f0fdf4' : '#fef2f2';
  const borderColor = isApproved ? '#16a34a' : '#dc2626';
  
  const text = isApproved
    ? `Your leave request has been ${status.toLowerCase()}. 
    
Leave Request Details:
- Leave Type: ${leaveData.leaveType}
- Start Date: ${new Date(leaveData.startDate).toLocaleDateString()}
- End Date: ${new Date(leaveData.endDate).toLocaleDateString()}
- Duration: ${leaveData.duration} day(s)
- Status: ${status}

Your leave balance has been updated accordingly.`
    : `Your leave request has been ${status.toLowerCase()}. 
    
Leave Request Details:
- Leave Type: ${leaveData.leaveType}
- Start Date: ${new Date(leaveData.startDate).toLocaleDateString()}
- End Date: ${new Date(leaveData.endDate).toLocaleDateString()}
- Duration: ${leaveData.duration} day(s)
- Status: ${status}
${leaveData.rejectionReason ? `- Reason: ${leaveData.rejectionReason}` : ''}

Please contact your manager if you have any questions.`;

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h2 style="color: ${statusColor}; margin-top: 0;">
          ${isApproved ? '✅ Leave Request Approved' : '❌ Leave Request Rejected'}
        </h2>
        <p style="color: #666; font-size: 16px;">Your leave request has been <strong>${status.toLowerCase()}</strong>.</p>
        
        <div style="background-color: ${statusBgColor}; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${borderColor};">
          <h3 style="color: ${statusColor}; margin-top: 0;">Leave Request Details:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Leave Type:</td>
              <td style="padding: 8px 0; color: #1e293b; font-weight: bold;">${leaveData.leaveType}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Start Date:</td>
              <td style="padding: 8px 0; color: #1e293b;">${new Date(leaveData.startDate).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">End Date:</td>
              <td style="padding: 8px 0; color: #1e293b;">${new Date(leaveData.endDate).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Duration:</td>
              <td style="padding: 8px 0; color: #1e293b; font-weight: bold;">${leaveData.duration} day(s)</td>
            </tr>
            ${leaveData.reason ? `
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Reason:</td>
              <td style="padding: 8px 0; color: #1e293b;">${leaveData.reason}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Status:</td>
              <td style="padding: 8px 0;">
                <span style="background-color: ${status === 'Approved' ? '#dbeafe' : '#fee2e2'}; color: ${statusColor}; padding: 4px 12px; border-radius: 12px; font-size: 14px; font-weight: bold;">
                  ${status}
                </span>
              </td>
            </tr>
            ${!isApproved && leaveData.rejectionReason ? `
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Rejection Reason:</td>
              <td style="padding: 8px 0; color: #dc2626;">${leaveData.rejectionReason}</td>
            </tr>
            ` : ''}
          </table>
        </div>
        
        ${isApproved ? `
        <p style="color: #16a34a; margin-top: 20px; font-weight: 600;">✅ Your leave balance has been updated accordingly.</p>
        ` : `
        <p style="color: #475569; margin-top: 20px;">Please contact your manager if you have any questions.</p>
        `}
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px;">
          <p>This is an automated email from the Employee Management System.</p>
        </div>
      </div>
    </div>
  `;

  return await sendEmail(employeeEmail, subject, text, html);
};

  
const sendEmployeeCredentialsEmail = async (employeeData, password) => {
  const { email, employeeName, employeeId } = employeeData;
  
  const subject = 'Welcome to Employee Management System - Your Login Credentials';
  
  const text = `Welcome ${employeeName}!

Your employee account has been created in the Employee Management System.

Login Credentials:
- Email: ${email}
- Password: ${password}
- Employee ID: ${employeeId}

Please log in using these credentials and change your password after first login.

Login URL: ${process.env.FRONTEND_URL || 'http://localhost:3000/login'}

If you have any questions, please contact your administrator.

Best regards,
EMS Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #2563eb; margin-top: 0;">Welcome ${employeeName}!</h2>
        <p style="color: #666; font-size: 16px;">Your employee account has been created in the Employee Management System.</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
          <h3 style="color: #334155; margin-top: 0;">Your Login Credentials:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Email:</td>
              <td style="padding: 8px 0; color: #1e293b; font-family: monospace;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Password:</td>
              <td style="padding: 8px 0; color: #1e293b; font-family: monospace; font-weight: bold;">${password}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Employee ID:</td>
              <td style="padding: 8px 0; color: #1e293b; font-family: monospace;">${employeeId}</td>
            </tr>
          </table>
        </div>
        
        <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <p style="color: #92400e; margin: 0; font-weight: 600;">⚠️ Important:</p>
          <p style="color: #78350f; margin: 5px 0 0 0;">Please log in using these credentials and change your password after first login for security.</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000/login'}" 
             style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
            Login to System
          </a>
        </div>
        
        <p style="color: #475569; margin-top: 20px;">If you have any questions, please contact your administrator.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px;">
          <p>This is an automated email from the Employee Management System.</p>
        </div>
      </div>
    </div>
  `;

  return await sendEmail(email, subject, text, html);
};

module.exports = { 
  sendEmail, 
  sendProjectProposalEmail,
  sendProjectStatusEmail,
  sendInvoiceEmail,
  sendInvoiceStatusEmail,
  sendLeaveRequestEmail,
  sendLeaveStatusEmail,
  sendEmployeeCredentialsEmail
};
