import jwt from 'jsonwebtoken';
import { User } from '../models.js';
export const authMiddleware = async (req,res,next)=>{
  const header = req.headers.authorization;
  if(!header) return res.status(401).json({error:'Missing auth'});
  const token = header.replace('Bearer ','').trim();
  try{
    const data = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findByPk(data.id);
    if(!user) return res.status(401).json({error:'User not found'});
    req.user = user;
    next();
  }catch(err){ return res.status(401).json({error:'Invalid token'}); }
};
export const roleCheck = (roles)=> (req,res,next)=>{
  if(!roles.includes(req.user.role)) return res.status(403).json({error:'Forbidden'});
  next();
};
