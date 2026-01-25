const express = require("express");
const router = express.Router();
const { pool } = require("../config/database");

// ========================================
// DOCUMENTOS LEGALES (desde settings_kv)
// /api/legal/privacy
// /api/legal/terms
// ========================================

async function ensureSettingsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS settings_kv (
      \`key\` VARCHAR(100) NOT NULL PRIMARY KEY,
      \`value\` LONGTEXT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
}

async function getKV(keys) {
  if (!keys.length) return {};
  const [rows] = await pool.query(
    `SELECT \`key\`, \`value\`, updated_at FROM settings_kv WHERE \`key\` IN (${keys.map(()=>"?").join(",")})`,
    keys
  );
  const obj = {};
  for (const r of rows) obj[r.key] = r.value;
  // updated_at: tomamos el más reciente de esas keys
  const latest = rows.reduce((acc, r) => (!acc || (r.updated_at && r.updated_at > acc) ? r.updated_at : acc), null);
  obj.__updated_at = latest;
  return obj;
}

router.get("/:slug", async (req, res) => {
  try {
    await ensureSettingsTable();

    const slug = String(req.params.slug || "").toLowerCase();
    if (!["privacy", "terms"].includes(slug)) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    if (slug === "privacy") {
      const data = await getKV(["privacy_title", "privacy_policy_html"]);
      return res.json({
        slug: "privacy",
        title: data.privacy_title || "Política de Privacidad",
        content_html: data.privacy_policy_html || "<p>No hay contenido configurado.</p>",
        updated_at: data.__updated_at || null,
      });
    }

    const data = await getKV(["terms_title", "terms_conditions_html"]);
    return res.json({
      slug: "terms",
      title: data.terms_title || "Términos y Condiciones",
      content_html: data.terms_conditions_html || "<p>No hay contenido configurado.</p>",
      updated_at: data.__updated_at || null,
    });
  } catch (err) {
    console.error("GET /api/legal/:slug error:", err);
    res.status(500).json({ error: "Error cargando documento" });
  }
});

// PUT opcional (si luego quieres editar directo por API)
router.put("/:slug", async (req, res) => {
  try {
    await ensureSettingsTable();

    const slug = String(req.params.slug || "").toLowerCase();
    if (!["privacy", "terms"].includes(slug)) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    const { title, content_html } = req.body || {};

    if (slug === "privacy") {
      if (typeof title !== "undefined") {
        await pool.query(
          `INSERT INTO settings_kv (\`key\`, \`value\`) VALUES ('privacy_title', ?)
           ON DUPLICATE KEY UPDATE \`value\`=VALUES(\`value\`)`,
          [String(title)]
        );
      }
      if (typeof content_html !== "undefined") {
        await pool.query(
          `INSERT INTO settings_kv (\`key\`, \`value\`) VALUES ('privacy_policy_html', ?)
           ON DUPLICATE KEY UPDATE \`value\`=VALUES(\`value\`)`,
          [String(content_html)]
        );
      }
      return res.json({ ok: true });
    }

    if (typeof title !== "undefined") {
      await pool.query(
        `INSERT INTO settings_kv (\`key\`, \`value\`) VALUES ('terms_title', ?)
         ON DUPLICATE KEY UPDATE \`value\`=VALUES(\`value\`)`,
        [String(title)]
      );
    }
    if (typeof content_html !== "undefined") {
      await pool.query(
        `INSERT INTO settings_kv (\`key\`, \`value\`) VALUES ('terms_conditions_html', ?)
         ON DUPLICATE KEY UPDATE \`value\`=VALUES(\`value\`)`,
        [String(content_html)]
      );
    }
    return res.json({ ok: true });
  } catch (err) {
    console.error("PUT /api/legal/:slug error:", err);
    res.status(500).json({ error: "Error guardando documento" });
  }
});

module.exports = router;
