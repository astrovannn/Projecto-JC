const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");

const app = express();
const PORT = 3000;

// Crea (o abre si ya existe) el archivo de base de datos
const db = new Database("quirklessart.db");

// Crea la tabla si no existe todavía (solo corre una vez, luego no hace nada)
db.exec(`
    CREATE TABLE IF NOT EXISTS solicitudes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tipo TEXT NOT NULL,
        personas INTEGER NOT NULL,
        tamano TEXT NOT NULL,
        descripcion TEXT,
        precio INTEGER NOT NULL,
        estado TEXT DEFAULT 'pendiente',
        creado_en TEXT DEFAULT CURRENT_TIMESTAMP
    )
`);

app.use(cors());
app.use(express.json());

app.post("/api/comisiones", (req, res) => {
    const { tipo, personas, tamano, descripcion, precio } = req.body;

    const insertar = db.prepare(`
        INSERT INTO solicitudes (tipo, personas, tamano, descripcion, precio)
        VALUES (?, ?, ?, ?, ?)
    `);

    const resultado = insertar.run(tipo, personas, tamano, descripcion, precio);

    console.log("Solicitud guardada con id:", resultado.lastInsertRowid);

    res.json({
        mensaje: "Solicitud guardada correctamente",
        id: resultado.lastInsertRowid
    });
});

// Nuevo: ver todas las solicitudes guardadas
app.get("/api/comisiones", (req, res) => {
    const solicitudes = db.prepare("SELECT * FROM solicitudes ORDER BY creado_en DESC").all();
    res.json(solicitudes);
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});