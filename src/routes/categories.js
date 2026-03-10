const express = require("express");
const router = express.Router();
const { auth, adminAuth } = require("../middleware/auth");
const { pool } = require("../config/database");

// Obtener todas las categorías
router.get("/", async (req, res) => {
  console.log("📥 GET /api/categories hit");
  try {
    const [categories] = await pool.query(
      "SELECT * FROM categories ORDER BY name",
    );

    // Agregar conteo de productos por categoría
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const [count] = await pool.query(
          "SELECT COUNT(*) as count FROM products WHERE category = ? AND (active IS NULL OR active = TRUE)",
          [cat.name],
        );
        return {
          ...cat,
          count: count[0].count,
        };
      }),
    );

    res.json(categoriesWithCount);
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    res.status(500).json({ message: "Error al obtener categorías" });
  }
});

// Obtener categoría específica
router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    const [categories] = await pool.query(
      "SELECT * FROM categories WHERE slug = ?",
      [slug],
    );

    if (categories.length === 0) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }

    const category = categories[0];
    const [count] = await pool.query(
      "SELECT COUNT(*) as count FROM products WHERE category = ? AND (active IS NULL OR active = TRUE)",
      [category.name],
    );

    res.json({
      ...category,
      count: count[0].count,
    });
  } catch (error) {
    console.error("Error al obtener categoría:", error);
    res.status(500).json({ message: "Error al obtener categoría" });
  }
});

// POST /api/categories - Crear
router.post("/", auth, adminAuth, async (req, res) => {
  console.log("📥 POST /api/categories hit", req.body);
  const { name, color, icon } = req.body;
  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const [result] = await pool.query(
    "INSERT INTO categories (name, slug, color, icon) VALUES (?, ?, ?, ?)",
    [name, slug, color || "#4a2f1a", icon || "fa-tag"],
  );
  res.json({ id: result.insertId, name, slug, color, icon });
});

// PUT /api/categories/:id - Editar
router.put("/:id", auth, adminAuth, async (req, res) => {
  console.log(`📥 PUT /api/categories/${req.params.id} hit`, req.body);
  const { name, color, icon } = req.body;
  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  await pool.query(
    "UPDATE categories SET name=?, slug=?, color=?, icon=? WHERE id=?",
    [name, slug, color, icon, req.params.id],
  );
  res.json({ success: true });
});

// DELETE /api/categories/:id - Eliminar
router.delete("/:id", auth, adminAuth, async (req, res) => {
  await pool.query("DELETE FROM categories WHERE id=?", [req.params.id]);
  res.json({ success: true });
});

module.exports = router;
