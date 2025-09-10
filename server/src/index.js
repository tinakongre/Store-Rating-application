import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { sequelize } from './models.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import userRoutes from './routes/user.js';
import ownerRoutes from './routes/owner.js';


dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
//app.use("/owner", ownerRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/owner', ownerRoutes);
app.get('/api/health', (req,res)=>res.json({ok:true}));
// const PORT = process.env.PORT || 5001;
// (async ()=>{
//   try{
//     await sequelize.sync({ alter: true });
//     console.log('✅ DB synced');
//     app.listen(PORT, ()=>console.log(`🚀 Server running on http://localhost:${PORT}`));
//   }catch(err){
//     console.error('DB connection error', err);
//   }
// })();
// Start server
const PORT = process.env.PORT || 5001;
sequelize.sync().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});