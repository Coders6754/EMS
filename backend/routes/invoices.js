const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const Project = require('../models/Project');
const { auth, authorize } = require('../middleware/auth');
const { generateInvoiceNumber } = require('../utils/counter');
const { sendInvoiceEmail, sendInvoiceStatusEmail } = require('../utils/email');
const PDFDocument = require('pdfkit');

router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'Employee') {
      const employeeId = req.user.employeeId?._id || req.user.employeeId;
      if (!employeeId) {
        return res.json([]);
      }
      
      const projects = await Project.find({
        $or: [
          { projectManager: employeeId },
          { 'teamMembers.employee': employeeId }
        ]
      }).select('_id');
      const projectIds = projects.map(p => p._id);
      
      if (projectIds.length === 0) {
        return res.json([]);
      }
      
      query = { project: { $in: projectIds } };
    }
    
    const invoices = await Invoice.find(query)
      .populate('project', 'projectName')
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', auth, authorize('Admin', 'Manager'), async (req, res) => {
  try {
    const { clientName, clientEmail, amount, dueDate, project } = req.body;
    
    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be a positive number' });
    }
    
    if (new Date(dueDate) < new Date()) {
      return res.status(400).json({ message: 'Due date cannot be a past date' });
    }
    
    const invoiceNumber = await generateInvoiceNumber();
    
    const invoice = new Invoice({
      invoiceNumber,
      clientName,
      clientEmail, // Save client email to database
      amount,
      dueDate,
      project
    });
    
    await invoice.save();
    await invoice.populate('project', 'projectName');
    
    try {
      const projectData = await Project.findById(project).populate('projectManager', 'email');
      
      const invoiceData = {
        invoiceNumber: invoice.invoiceNumber,
        projectName: projectData?.projectName || 'N/A',
        amount: invoice.amount,
        dueDate: invoice.dueDate,
        status: invoice.status
      };
      
      const emailToSend = invoice.clientEmail || projectData?.projectManager?.email || process.env.DEFAULT_CLIENT_EMAIL;
      
      if (emailToSend) {
        await sendInvoiceEmail(invoiceData, emailToSend);
      }
    } catch (emailError) {
      console.error('Failed to send invoice email:', emailError.message);
      // Don't fail the request if email fails
    }
    
    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id/pdf', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('project', 'projectName');
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    
    const doc = new PDFDocument();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice_${invoice.invoiceNumber}.pdf`);
    
    doc.pipe(res);
    
    doc.fontSize(20).text('INVOICE', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(12);
    doc.text(`Invoice Number: ${invoice.invoiceNumber}`);
    doc.text(`Client Name: ${invoice.clientName}`);
    doc.text(`Project: ${invoice.project?.projectName || 'N/A'}`);
    doc.text(`Amount: $${invoice.amount}`);
    doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`);
    doc.text(`Status: ${invoice.status}`);
    doc.moveDown();
    
    doc.fontSize(10).text('Thank you for your business!', { align: 'center' });
    
    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', auth, authorize('Admin', 'Manager'), async (req, res) => {
  try {
    const currentInvoice = await Invoice.findById(req.params.id);
    if (!currentInvoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    
    const oldStatus = currentInvoice.status;
    
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('project', 'projectName');
    
    if (req.body.status && req.body.status !== oldStatus) {
      try {
        const invoiceData = {
          invoiceNumber: invoice.invoiceNumber,
          clientName: invoice.clientName,
          projectName: invoice.project?.projectName || 'N/A',
          amount: invoice.amount,
          dueDate: invoice.dueDate
        };
        
        if (invoice.clientEmail) {
          await sendInvoiceStatusEmail(invoiceData, invoice.clientEmail, oldStatus, req.body.status);
          console.log(`✓ Invoice status change email sent (${oldStatus} → ${req.body.status}) to ${invoice.clientEmail}`);
        }
      } catch (emailError) {
        console.error('Failed to send invoice status change email:', emailError.message);
      }
    }
    
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', auth, authorize('Admin'), async (req, res) => {
  try {
    await Invoice.findByIdAndDelete(req.params.id);
    res.json({ message: 'Invoice deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
