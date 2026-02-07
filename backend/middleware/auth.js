const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error();
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).populate('employeeId');
    
    if (!user) throw new Error();
    
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      
      if (req.user.role === 'Manager' && roles.includes('Admin') && !roles.includes('Manager')) {
        if (req.method === 'DELETE' && req.path.includes('/employees/')) {
          return res.status(403).json({ message: 'Access denied: Only Administrators can delete employees. Managers can create and edit employees but cannot delete them.' });
        }
      }
      return res.status(403).json({ message: 'Access denied: This action requires Administrator privileges. Please contact an Administrator for assistance.' });
    }
    next();
  };
};

module.exports = { auth, authorize };
