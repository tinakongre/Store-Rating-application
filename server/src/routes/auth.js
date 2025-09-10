import { authMiddleware} from "../middleware/auth.js";
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { User } from '../models.js';
const router = express.Router();
const signupSchema = Joi.object({
  name: Joi.string().min(20).max(60).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(16).pattern(new RegExp('(?=.*[A-Z])(?=.*[!@#$%^&*])')).required(),
  address: Joi.string().max(400).allow('', null)
});
router.post('/signup', async (req,res)=>{
  try{
    const { error, value } = signupSchema.validate(req.body);
    if(error) return res.status(400).json({ error: error.details[0].message });
    const { name,email,password,address } = value;
    const exists = await User.findOne({ where: { email } });
    if(exists) return res.status(400).json({ error: 'Email exists' });
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash, address, role: 'user' });
    res.json({ id: user.id, email: user.email });
  }catch(err){ console.error(err); res.status(500).json({ error:'Server error' }); }
});
router.post('/login', async (req,res)=>{
  try{
    const { email, password } = req.body;
    if(!email || !password) return res.status(400).json({ error:'Missing' });
    const user = await User.findOne({ where: { email } });
    if(!user) return res.status(400).json({ error:'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if(!ok) return res.status(400).json({ error:'Invalid credentials' });
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn:'8h' });
    res.json({ token, role: user.role, name: user.name });
  }catch(err){ console.error(err); res.status(500).json({ error:'Server error' }); }
});
// Update password (protected)
router.post('/update-password', authMiddleware, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) return res.status(400).json({ error: 'Missing fields' });

    // req.user was set by authMiddleware (Sequelize User instance)
    const ok = await bcrypt.compare(oldPassword, req.user.password);
    if (!ok) return res.status(400).json({ error: 'Current password is incorrect' });

    const hash = await bcrypt.hash(newPassword, 10);
    req.user.password = hash;
    await req.user.save();
    res.json({ message: 'Password updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;

