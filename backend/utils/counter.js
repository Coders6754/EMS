const Employee = require('../models/Employee');
const Invoice = require('../models/Invoice');

const generateEmployeeId = async () => {
  try {
  
    const lastEmployee = await Employee.findOne().sort({ createdAt: -1 });
    
    if (!lastEmployee || !lastEmployee.employeeId) {
      return 'ER0001'; // First employee
    }
    
    const lastNumber = parseInt(lastEmployee.employeeId.replace('ER', ''));
    
    const nextNumber = lastNumber + 1;
    return `ER${String(nextNumber).padStart(4, '0')}`;
  } catch (error) {
    console.error('Error generating employee ID:', error);
    // Fallback: use timestamp-based unique number
    const timestamp = Date.now().toString().slice(-6);
    return `ER${timestamp}`;
  }
};

const generateInvoiceNumber = async () => {
  try {
    
    const lastInvoice = await Invoice.findOne().sort({ createdAt: -1 });
    
    if (!lastInvoice || !lastInvoice.invoiceNumber) {
      return 'INV001'; // First invoice
    }
    
    
    const lastNumber = parseInt(lastInvoice.invoiceNumber.replace('INV', ''));
    

    const nextNumber = lastNumber + 1;
    return `INV${String(nextNumber).padStart(3, '0')}`;
  } catch (error) {
    console.error('Error generating invoice number:', error);
    
    const timestamp = Date.now().toString().slice(-6);
    return `INV${timestamp}`;
  }
};

module.exports = { generateEmployeeId, generateInvoiceNumber };
