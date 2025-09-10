import bcrypt from 'bcryptjs';
import { sequelize, User, Store } from './models.js';
import dotenv from 'dotenv';
dotenv.config();

(async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('DB synced');

    const adminPass = await bcrypt.hash('Admin@123', 10);
    const ownerPass = await bcrypt.hash('Owner@123', 10);
    const userPass = await bcrypt.hash('User@123', 10);

    // --- Admin ---
    let admin = await User.findOne({ where: { email: 'admin@example.com' } });
    if (admin) {
      await admin.update({ name: 'Admin One', password: adminPass, address: 'HQ', role: 'admin' });
    } else {
      admin = await User.create({ name: 'Admin One', email: 'admin@example.com', password: adminPass, address: 'HQ', role: 'admin' });
    }

    // --- Owner ---
    let owner = await User.findOne({ where: { email: 'owner@example.com' } });
    if (owner) {
      await owner.update({ name: 'Store Owner Rahul', password: ownerPass, address: 'Owner Address', role: 'owner' });
    } else {
      owner = await User.create({ name: 'Store Owner Rahul', email: 'owner@example.com', password: ownerPass, address: 'Owner Address', role: 'owner' });
    }

    // --- Normal User ---
    let user = await User.findOne({ where: { email: 'user@example.com' } });
    if (user) {
      await user.update({ name: 'User Tina Kongre', password: userPass, address: 'User Address', role: 'user' });
    } else {
      user = await User.create({ name: 'User Tina Kongre', email: 'user@example.com', password: userPass, address: 'User Address', role: 'user' });
    }

    // --- Stores ---
    const s1 = await Store.findOne({ where: { name: 'Tina Mart' } }) 
      || await Store.create({ name: 'Tina Mart', email: 'tina@mart.com', address: 'Street 1', ownerId: owner.id });

    const s2 = await Store.findOne({ where: { name: 'Coffee Corner' } }) 
      || await Store.create({ name: 'Coffee Corner', email: 'coffee@corner.com', address: 'Street 2', ownerId: owner.id });

    console.log(' Seed complete. Admin: admin@example.com / Admin@123');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
