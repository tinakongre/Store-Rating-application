import express from "express";
import { authMiddleware } from '../middleware/auth.js';
import { User, Store, Rating } from "../models.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";




const router = express.Router();

// Middleware: only allow admin
function requireAdmin(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: "No token" });
    const data = jwt.verify(header.replace("Bearer ", ""), process.env.JWT_SECRET || "secret");
    if (data.role !== "admin") return res.status(403).json({ error: "Forbidden" });
    req.userId = data.id;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// Dashboard counts
router.get("/dashboard", requireAdmin, async (req, res) => {
  const userCount = await User.count();
  const storeCount = await Store.count();
  const ratingCount = await Rating.count();
  res.json({ userCount, storeCount, ratingCount });
});

// Add new user (normal or admin)
router.post("/users", requireAdmin, async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, address, role });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Add new store
// Add new store
router.post("/stores", requireAdmin, async (req, res) => {
  try {
    const { name, address, ownerId } = req.body;

    if (!ownerId) {
      return res.status(400).json({ error: "Owner is required" });
    }

    const owner = await User.findByPk(ownerId);
    if (!owner || owner.role !== "owner") {
      return res.status(400).json({ error: "Invalid owner" });
    }

    const store = await Store.create({ name, address, ownerId });
    res.json(store);
  } catch (err) {
    console.error("Error creating store:", err);
    res.status(500).json({ error: "Error creating store" });
  }
});

// Get all owners (for dropdown in frontend)
router.get("/owners", requireAdmin, async (req, res) => {
  try {
    const owners = await User.findAll({
      where: { role: "owner" },
      attributes: ["id", "name", "email"]
    });
    res.json(owners);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch owners" });
  }
});



// List all stores with filters
router.get("/stores", requireAdmin, async (req, res) => {
  const q = req.query.q || "";
  const stores = await Store.findAll({
    where: q ? { [Op.or]: [{ name: { [Op.like]: `%${q}%` } }, { address: { [Op.like]: `%${q}%` } }] } : {},
  });
  res.json(stores);
});

// ✅ List all users with filters
router.get("/users", requireAdmin, async (req, res) => {
  try {
    const { name, email, address, role } = req.query;
    let where = {};

    if (name) where.name = { [Op.like]: `%${name}%` };
    if (email) where.email = { [Op.like]: `%${email}%` };
    if (address) where.address = { [Op.like]: `%${address}%` };
    if (role) where.role = role;

    const users = await User.findAll({
      attributes: ["id", "name", "email", "address", "role"],
      where
    });

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// ✅ Get user details by ID (with store-owner ratings if applicable)
router.get("/users/:id", requireAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ["id", "name", "email", "address", "role"],
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    let details = user.toJSON();

    if (user.role === "owner") {
      const stores = await Store.findAll({
        where: { ownerId: user.id },
        include: [{ model: Rating }],
      });

      details.stores = stores.map(s => ({
        id: s.id,
        name: s.name,
        address: s.address,
        avgRating: s.Ratings.length
          ? (s.Ratings.reduce((a, b) => a + b.rating, 0) / s.Ratings.length).toFixed(2)
          : "No ratings"
      }));
    }

    res.json(details);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch user details" });
  }
});



//###########
router.get("/users", requireAdmin, async (req, res)  => {
  try {
    const { name, email, address, role } = req.query;
    let where = {};

    if (name) where.name = { [Op.like]: `%${name}%` };
    if (email) where.email = { [Op.like]: `%${email}%` };
    if (address) where.address = { [Op.like]: `%${address}%` };
    if (role) where.role = role;

    const users = await User.findAll({
      attributes: ["id", "name", "email", "address", "role"],
      where
    });

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// ✅ Get user details by ID (with store-owner ratings if applicable)
router.get("/users/:id", requireAdmin, async (req, res)  => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ["id", "name", "email", "address", "role"],
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    let details = user.toJSON();

    // If user is a store owner → fetch their stores + ratings
    if (user.role === "owner") {
      const stores = await Store.findAll({
        where: { ownerId: user.id },
        include: [{ model: Rating }],
      });

      details.stores = stores.map(s => ({
        id: s.id,
        name: s.name,
        address: s.address,
        avgRating: s.Ratings.length
          ? (s.Ratings.reduce((a, b) => a + b.rating, 0) / s.Ratings.length).toFixed(2)
          : "No ratings"
      }));
    }

    res.json(details);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch user details" });
  }
});


export default router;
