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

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "cambia-esto-por-algo-secreto-y-largo"; // en producción esto va aparte, no en el código

// Tabla de usuarios
db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        creado_en TEXT DEFAULT CURRENT_TIMESTAMP
    )
`);

// Registro de un nuevo artista
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

    const insertar = db.prepare(
        "INSERT INTO usuarios (nombre, email, password_hash) VALUES (?, ?, ?)"
    );
    const resultado = insertar.run(nombre, email, password_hash);

    res.json({ mensaje: "Cuenta creada", id: resultado.lastInsertRowid });
});

// Login
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

    const token = jwt.sign(
        { id: usuario.id, email: usuario.email },
        JWT_SECRET,
        { expiresIn: "7d" }
    );

    res.json({ mensaje: "Login exitoso", token });
});

// "Guardia": verifica el token antes de dejar pasar a rutas protegidas
function verificarToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No autorizado" });

    const token = authHeader.split(" ")[1]; // formato: "Bearer eltoken"
    try {
        req.usuario = jwt.verify(token, JWT_SECRET);
        next(); // deja continuar a la ruta real
    } catch (error) {
        return res.status(401).json({ error: "Token inválido o expirado" });
    }
}

// Ruta de prueba, protegida
app.get("/api/perfil", verificarToken, (req, res) => {
    res.json({ mensaje: `Hola, ${req.usuario.email}` });
});