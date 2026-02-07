
const validateEmail = (email) => {
  
  if (!email || typeof email !== 'string') {
    return { valid: false, message: 'Email is required' };
  }

  
  email = email.trim().toLowerCase();

  
  if (!email.includes('@')) {
    return { valid: false, message: 'Email must contain @ symbol' };
  }

  
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Invalid email format. Example: user@example.com' };
  }

  
  const [localPart, domainPart] = email.split('@');

  
  if (!localPart || localPart.length < 1) {
    return { valid: false, message: 'Email must have a username before @' };
  }

  if (localPart.length > 64) {
    return { valid: false, message: 'Email username is too long (max 64 characters)' };
  }

  
  if (!domainPart || !domainPart.includes('.')) {
    return { valid: false, message: 'Email must have a valid domain (e.g., gmail.com)' };
  }

  
  const domainParts = domainPart.split('.');
  const extension = domainParts[domainParts.length - 1];
  
  if (extension.length < 2) {
    return { valid: false, message: 'Email domain extension is invalid' };
  }

  
  const validExtensions = [
    'com', 'org', 'net', 'edu', 'gov', 'mil', 'co', 'in', 'io', 'ai',
    'uk', 'us', 'ca', 'au', 'de', 'fr', 'jp', 'cn', 'ru', 'br'
  ];

  
  const commonTypos = {
    'gmai.com': 'gmail.com',
    'gmial.com': 'gmail.com',
    'yahooo.com': 'yahoo.com',
    'hotmial.com': 'hotmail.com',
    'outlok.com': 'outlook.com'
  };

  if (commonTypos[domainPart]) {
    return { 
      valid: false, 
      message: `Did you mean ${localPart}@${commonTypos[domainPart]}?` 
    };
  }

  
  if (domainPart.startsWith('.') || domainPart.endsWith('.')) {
    return { valid: false, message: 'Invalid domain format' };
  }

  if (email.includes('..')) {
    return { valid: false, message: 'Email cannot contain consecutive dots' };
  }

  
  return { valid: true, email: email };
};


const validateEmails = (emails) => {
  if (!emails) {
    return { valid: false, message: 'Emails are required' };
  }

  const emailArray = emails.split(',').map(e => e.trim());
  const invalidEmails = [];

  for (const email of emailArray) {
    const result = validateEmail(email);
    if (!result.valid) {
      invalidEmails.push({ email, error: result.message });
    }
  }

  if (invalidEmails.length > 0) {
    return { 
      valid: false, 
      message: 'Invalid emails found', 
      invalidEmails 
    };
  }

  return { valid: true, emails: emailArray };
};

module.exports = { validateEmail, validateEmails };
