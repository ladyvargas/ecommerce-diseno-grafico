const express = require("express");
const router = express.Router();
const { pool } = require("../config/database");
const { auth, adminAuth } = require("../middleware/auth");

/**
 * GET /api/export/db (admin)
 * Exporta tablas principales en JSON descargable
 */
router.get("/db", auth, adminAuth, async (req, res) => {
  try {
    const tables = [
      "users",
      "categories",
      "products",
      "orders",
      "order_items",
      "coupons",
      "promotions",
      "about_page",
      "about_team",
      "settings"
    ];

    const exportData = {};

    for (const t of tables) {
      const [rows] = await pool.query(`SELECT * FROM ${t}`);
      exportData[t] = rows;
    }

    const filename = `backup_${new Date().toISOString().slice(0, 10)}.json`;

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    res.send(JSON.stringify(exportData, null, 2));
  } catch (err) {
    console.error("Export DB error:", err);
    res.status(500).json({ error: "Error exportando base de datos" });
  }
});

module.exports = router;
