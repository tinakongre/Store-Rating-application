// server/src/routes/user.js
import express from 'express';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import { Store, Rating } from '../models.js';

const router = express.Router();

/**
 * GET /user/stores
 * - optional query param q (search by name or address)
 * - optional Authorization header: if present, include user's submitted rating as 'myRating'
 */
router.get('/stores', async (req, res) => {
  try {
    const q = req.query.q || '';
    // try to get user id from token (optional)
    let userId = null;
    const header = req.headers.authorization;
    if (header) {
      try {
        const data = jwt.verify(header.replace('Bearer ', ''), process.env.JWT_SECRET || 'secret');
        userId = data.id;
      } catch (err) {
        // ignore invalid token - treat as anonymous
      }
    }

    // build search filter
    let where = undefined;
    if (q) {
      where = {
        [Op.or]: [
          { name: { [Op.like]: `%${q}%` } },
          { address: { [Op.like]: `%${q}%` } }
        ]
      };
    }

    const stores = await Store.findAll({ where });

    const result = await Promise.all(stores.map(async (s) => {
      const ratings = await Rating.findAll({ where: { storeId: s.id } });
      const avg = ratings.length ? (ratings.reduce((a, b) => a + b.rating, 0) / ratings.length) : 0;

      let myRating = null;
      if (userId) {
        const existing = await Rating.findOne({ where: { storeId: s.id, userId } });
        if (existing) myRating = existing.rating;
      }

      return {
        id: s.id,
        name: s.name,
        address: s.address,
        rating: Number(avg.toFixed(2)),
        myRating
      };
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


router.post('/stores/:id/rate', async (req, res) => {
  try {
    const header = req.headers.authorization;
    if (!header) {
      return res.status(401).json({ error: 'No token provided' });
    }

    let userId;
    try {
      const data = jwt.verify(header.replace('Bearer ', ''), process.env.JWT_SECRET || 'secret');
      userId = data.id;
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const storeId = req.params.id;
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    let existing = await Rating.findOne({ where: { storeId, userId } });

    if (existing) {
      existing.rating = rating;
      await existing.save();
    } else {
      await Rating.create({ storeId, userId, rating });
    }

    res.json({ success: true, message: 'Rating submitted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


export default router;
