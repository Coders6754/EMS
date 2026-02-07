// Frontend Email Validation Utility

export const validateEmail = (email) => {
  // Check if email exists
  if (!email || typeof email !== 'string') {
    return { valid: false, message: 'Email is required' };
  }

  // Trim whitespace
  email = email.trim().toLowerCase();

  // Basic format check: must have @ and domain
  if (!email.includes('@')) {
    return { valid: false, message: 'Email must contain @ symbol' };
  }

  // Comprehensive email regex
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Invalid email format. Example: user@example.com' };
  }

  // Split email into parts
  const [localPart, domainPart] = email.split('@');

  // Validate local part (before @)
  if (!localPart || localPart.length < 1) {
    return { valid: false, message: 'Email must have a username before @' };
  }

  if (localPart.length > 64) {
    return { valid: false, message: 'Email username is too long (max 64 characters)' };
  }

  // Validate domain part (after @)
  if (!domainPart || !domainPart.includes('.')) {
    return { valid: false, message: 'Email must have a valid domain (e.g., gmail.com)' };
  }

  // Check if domain has proper extension (.com, .org, etc.)
  const domainParts = domainPart.split('.');
  const extension = domainParts[domainParts.length - 1];
  
  if (extension.length < 2) {
    return { valid: false, message: 'Email domain extension is invalid' };
  }

  // Check for common typos
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

  // Additional checks
  if (domainPart.startsWith('.') || domainPart.endsWith('.')) {
    return { valid: false, message: 'Invalid domain format' };
  }

  if (email.includes('..')) {
    return { valid: false, message: 'Email cannot contain consecutive dots' };
  }

  return { valid: true, email: email };
};

// Phone number validation
export const validatePhone = (phone) => {
  if (!phone) {
    return { valid: false, message: 'Phone number is required' };
  }

  const phoneStr = phone.toString().trim();
  
  if (!/^\d+$/.test(phoneStr)) {
    return { valid: false, message: 'Phone number must contain only digits' };
  }

  if (phoneStr.length !== 10) {
    return { valid: false, message: 'Phone number must be exactly 10 digits' };
  }

  return { valid: true, phone: phoneStr };
};

// Password validation
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required' };
  }

  const passwordStr = password.trim();

  // Minimum length check
  if (passwordStr.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters long' };
  }

  // Check for at least one capital letter
  if (!/[A-Z]/.test(passwordStr)) {
    return { valid: false, message: 'Password must contain at least one capital letter' };
  }

  // Check for at least one special character
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(passwordStr)) {
    return { valid: false, message: 'Password must contain at least one special character (!@#$%^&* etc.)' };
  }

  return { valid: true, password: passwordStr };
};

// Real-time email validation for form inputs
export const validateEmailOnChange = (email, setError) => {
  if (!email) {
    setError('');
    return;
  }

  const result = validateEmail(email);
  if (!result.valid) {
    setError(result.message);
  } else {
    setError('');
  }
};
