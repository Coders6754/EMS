const Department = require('../models/Department');

const DEFAULT_DEPARTMENTS = [
  { name: 'General', location: 'Main Office' },
  { name: 'IT', location: 'Main Office' },
  { name: 'HR', location: 'Main Office' },
  { name: 'Finance', location: 'Main Office' },
  { name: 'Operations', location: 'Main Office' }
];

const initializeDefaultDepartments = async () => {
  try {
    console.log('Checking and initializing default departments...');
    
    let createdCount = 0;
    
    for (const deptData of DEFAULT_DEPARTMENTS) {
      const existing = await Department.findOne({ name: deptData.name });
      if (!existing) {
        try {
          const department = new Department(deptData);
          await department.save();
          console.log(`✓ Created default department: ${deptData.name}`);
          createdCount++;
        } catch (error) {
          if (error.code !== 11000) {
            console.error(`✗ Error creating department ${deptData.name}:`, error.message);
          }
        }
      }
    }
    
    const totalDepartments = await Department.countDocuments();
    
    if (createdCount > 0) {
      console.log(`✓ Default departments initialized. Created ${createdCount} new department(s).`);
    } else {
      console.log(`✓ ${totalDepartments} department(s) already exist. No new departments created.`);
    }
    
    if (totalDepartments === 0) {
      console.warn('⚠️ Warning: No departments found after initialization. Creating fallback department...');
      const fallback = new Department({ name: 'General', location: 'Main Office' });
      await fallback.save();
      console.log('✓ Created fallback department: General');
    }
  } catch (error) {
    console.error('✗ Error initializing default departments:', error.message);
  }
};

module.exports = { initializeDefaultDepartments };
