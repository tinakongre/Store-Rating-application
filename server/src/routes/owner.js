// // server/src/routes/owner.js
// import express from "express";
// import { Store, Rating, User } from "../models.js";
// import { authMiddleware } from "../middleware/auth.js";

// const router = express.Router();

// // Get all ratings for the stores owned by this owner
// router.get("/dashboard", authMiddleware("owner"), async (req, res) => {
//   try {
//     // Find all stores belonging to the logged-in owner
//     const stores = await Store.findAll({
//       where: { ownerId: req.user.id },
//       include: [{ model: Rating, include: [User] }],
//     });

//     const result = stores.map(store => {
//       const ratings = store.Ratings || [];
//       const avg = ratings.length
//         ? (ratings.reduce((a, r) => a + r.rating, 0) / ratings.length).toFixed(2)
//         : "No ratings";

//       return {
//         storeId: store.id,
//         storeName: store.name,
//         averageRating: avg,
//         ratedBy: ratings.map(r => ({
//           userName: r.User.name,
//           userEmail: r.User.email,
//           rating: r.rating,
//         })),
//       };
//     });

//     res.json(result);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to load owner dashboard" });
//   }
// });

// export default router;


import express from "express";
import { authMiddleware } from "../middleware/auth.js";  // ✅ named import
import { User, Store, Rating } from "../models.js";

const router = express.Router();

// ✅ Owner dashboard route
router.get("/dashboard", authMiddleware("owner"), async (req, res) => {
  try {
    console.log("req.user:", req.user); // debug who is logged in

    // Find stores belonging to the logged-in owner
    const stores = await Store.findAll({
      where: { ownerId: req.user.id }, // correct filter
      include: [{ model: Rating, include: [{ model: User, attributes: ["name"] }],
    },
  ],
    });

    // Format stores with average rating + list of raters
    const result = stores.map(store => {
      const ratings = store.Ratings || [];
      const avg =
        ratings.length > 0
          ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(2)
          : "No ratings yet";

      return {
        id: store.id,
        name: store.name,
        address: store.address,
        avgRating: avg,
        raters: ratings.map(r => ({
          userName: r.User ? r.User.name : "Unknown",
          rating: r.rating
        }))
      };
    });

    res.json(result);
  } catch (err) {
    console.error("Owner dashboard error", err);
    res.status(500).json({ error: err.message }); // show real error for debugging
  }
});


export default router;
