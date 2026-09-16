const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 3000;
const JWT_SECRET = "cambia-esto-por-algo-secreto-y-largo";

const db = new Database("quirklessart.db");

db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        creado_en TEXT DEFAULT CURRENT_TIMESTAMP
    )
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS solicitudes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        artista_id INTEGER NOT NULL,
        tipo TEXT NOT NULL,
        personas INTEGER NOT NULL,
        tamano TEXT NOT NULL,
        descripcion TEXT,
        precio INTEGER NOT NULL,
        estado TEXT DEFAULT 'pendiente',
        creado_en TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (artista_id) REFERENCES usuarios(id)
    )
`);

app.use(cors());
app.use(express.json());

function verificarToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No autorizado" });

    const token = authHeader.split(" ")[1];
    try {
        req.usuario = jwt.verify(token, JWT_SECRET);
        next();
    } catch (error) {
        return res.status(401).json({ error: "Token inválido o expirado" });
    }
}

app.post("/api/registro", async (req, res) => {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
        return res.status(400).json({ error: "Faltan datos" });
    }

    const existente = db.prepare("SELECT id FROM usuarios WHERE email = ?").get(email);
    if (existente) {
        return res.status(400).json({ error: "Ese correo ya está registrado" });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const insertar = db.prepare("INSERT INTO usuarios (nombre, email, password_hash) VALUES (?, ?, ?)");
    const resultado = insertar.run(nombre, email, password_hash);

    res.json({ mensaje: "Cuenta creada", id: resultado.lastInsertRowid });
});

app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;

    const usuario = db.prepare("SELECT * FROM usuarios WHERE email = ?").get(email);
    if (!usuario) {
        return res.status(401).json({ error: "Correo o contraseña incorrectos" });
    }

    const coincide = await bcrypt.compare(password, usuario.password_hash);
    if (!coincide) {
        return res.status(401).json({ error: "Correo o contraseña incorrectos" });
    }

    const token = jwt.sign({ id: usuario.id, email: usuario.email }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ mensaje: "Login exitoso", token });
});

app.get("/api/perfil", verificarToken, (req, res) => {
    res.json({ mensaje: `Hola, ${req.usuario.email}` });
});

app.post("/api/comisiones", (req, res) => {
    const { artista_id, tipo, personas, tamano, descripcion, precio } = req.body;

    if (!artista_id) {
        return res.status(400).json({ error: "Falta indicar a qué artista va dirigida la solicitud" });
    }

    const insertar = db.prepare(`
        INSERT INTO solicitudes (artista_id, tipo, personas, tamano, descripcion, precio)
        VALUES (?, ?, ?, ?, ?, ?)
    `);
    const resultado = insertar.run(artista_id, tipo, personas, tamano, descripcion, precio);

    res.json({ mensaje: "Solicitud guardada correctamente", id: resultado.lastInsertRowid });
});

app.get("/api/comisiones", verificarToken, (req, res) => {
    const solicitudes = db.prepare(
        "SELECT * FROM solicitudes WHERE artista_id = ? ORDER BY creado_en DESC"
    ).all(req.usuario.id);

    res.json(solicitudes);
});

app.patch("/api/comisiones/:id/estado", verificarToken, (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    const solicitud = db.prepare("SELECT * FROM solicitudes WHERE id = ?").get(id);

    if (!solicitud) {
        return res.status(404).json({ error: "Solicitud no encontrada" });
    }
    if (solicitud.artista_id !== req.usuario.id) {
        return res.status(403).json({ error: "No puedes modificar solicitudes de otro artista" });
    }

    db.prepare("UPDATE solicitudes SET estado = ? WHERE id = ?").run(estado, id);
    res.json({ mensaje: "Estado actualizado" });
});

// Lista pública de artistas (sin datos sensibles como password_hash)
app.get("/api/artistas", (req, res) => {
    const artistas = db.prepare("SELECT id, nombre FROM usuarios").all();
    res.json(artistas);
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});