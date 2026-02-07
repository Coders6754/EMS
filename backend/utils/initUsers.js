const User = require('../models/User');

const FIXED_CREDENTIALS = {
  Admin: {
    email: 'admin@ems.com',
    password: 'admin123'
  },
  Manager: {
    email: 'manager@ems.com',
    password: 'manager123'
  }
};

const initializeFixedUsers = async () => {
  try {
    let admin = await User.findOne({ email: FIXED_CREDENTIALS.Admin.email });
    if (!admin) {
      admin = new User({
        email: FIXED_CREDENTIALS.Admin.email,
        password: FIXED_CREDENTIALS.Admin.password,
        role: 'Admin'
      });
      await admin.save();
      console.log('✓ Fixed Admin account created');
    } else {
      const isPasswordMatch = await admin.comparePassword(FIXED_CREDENTIALS.Admin.password);
      if (!isPasswordMatch) {
        admin.password = FIXED_CREDENTIALS.Admin.password;
        await admin.save();
        console.log('✓ Fixed Admin account password reset');
      }
    }

    let manager = await User.findOne({ email: FIXED_CREDENTIALS.Manager.email });
    if (!manager) {
      manager = new User({
        email: FIXED_CREDENTIALS.Manager.email,
        password: FIXED_CREDENTIALS.Manager.password,
        role: 'Manager'
      });
      await manager.save();
      console.log('✓ Fixed Manager account created');
    } else {
      const isPasswordMatch = await manager.comparePassword(FIXED_CREDENTIALS.Manager.password);
      if (!isPasswordMatch) {
        manager.password = FIXED_CREDENTIALS.Manager.password;
        await manager.save();
        console.log('✓ Fixed Manager account password reset');
      }
    }
  } catch (error) {
    console.error('✗ Error initializing fixed users:', error.message);
  }
};

module.exports = { initializeFixedUsers, FIXED_CREDENTIALS };
