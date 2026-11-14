require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const conectarDB = require("./database");
const { Usuario, Solicitud } = require("./models");

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;
const CODIGO_INVITACION = (process.env.CODIGO_INVITACION || "").trim();
// Correo de la cuenta que recibe TODAS las solicitudes de comisión (la tuya)
const ARTISTA_EMAIL = (process.env.ARTISTA_EMAIL || "").toLowerCase().trim();

if (!JWT_SECRET) {
    console.error("Falta JWT_SECRET en las variables de entorno.");
    process.exit(1);
}

// En producción, FRONTEND_URL limita quién puede llamar a la API (ej: https://tusitio.netlify.app)
app.use(cors(process.env.FRONTEND_URL ? { origin: process.env.FRONTEND_URL } : undefined));
app.use(express.json());

function verificarToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No autorizado" });

    const token = authHeader.split(" ")[1];
    try {
        req.usuario = jwt.verify(token, JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({ error: "Token inválido o expirado" });
    }
}

app.post("/api/registro", async (req, res) => {
    const { nombre, email, password, codigo } = req.body;

    // El código de invitación es opcional: se puede registrar sin él.
    // Si la persona escribe uno y hay un código configurado, debe coincidir (evita typos).
    const codigoEscrito = String(codigo || "").trim();
    if (codigoEscrito && CODIGO_INVITACION && codigoEscrito !== CODIGO_INVITACION) {
        return res.status(403).json({ error: "Código de invitación incorrecto" });
    }

    if (!nombre || !email || !password) {
        return res.status(400).json({ error: "Faltan datos" });
    }
    if (String(password).length < 6) {
        return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
    }

    const existente = await Usuario.findOne({ email });
    if (existente) {
        return res.status(400).json({ error: "Ese correo ya está registrado" });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const usuario = await Usuario.create({ nombre, email, password_hash });
    res.json({ mensaje: "Cuenta creada", id: usuario.id });
});

app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;

    const usuario = await Usuario.findOne({ email: String(email || "").toLowerCase() });
    if (!usuario || !(await bcrypt.compare(password, usuario.password_hash))) {
        return res.status(401).json({ error: "Correo o contraseña incorrectos" });
    }

    const token = jwt.sign({ id: usuario.id, email: usuario.email }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ mensaje: "Login exitoso", token });
});

app.get("/api/perfil", verificarToken, (req, res) => {
    res.json({ mensaje: `Hola, ${req.usuario.email}` });
});

app.post("/api/comisiones", async (req, res) => {
    const { tipo, personas, tamano, descripcion, precio } = req.body;

    if (!tipo || !personas || !tamano || precio == null) {
        return res.status(400).json({ error: "Faltan datos de la solicitud" });
    }

    const artista = await Usuario.findOne({ email: ARTISTA_EMAIL });
    if (!artista) {
        console.error("ARTISTA_EMAIL no coincide con ningún usuario:", ARTISTA_EMAIL || "(vacío)");
        return res.status(500).json({ error: "El sitio no está configurado para recibir solicitudes" });
    }

    const solicitud = await Solicitud.create({
        artista_id: artista._id, tipo, personas, tamano, descripcion, precio
    });
    res.json({ mensaje: "Solicitud guardada correctamente", id: solicitud.id });
});

app.get("/api/comisiones", verificarToken, async (req, res) => {
    const solicitudes = await Solicitud.find({ artista_id: req.usuario.id }).sort({ creado_en: -1 });
    res.json(solicitudes);
});

app.patch("/api/comisiones/:id/estado", verificarToken, async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    if (!mongoose.isValidObjectId(id)) {
        return res.status(404).json({ error: "Solicitud no encontrada" });
    }
    const solicitud = await Solicitud.findById(id);
    if (!solicitud) {
        return res.status(404).json({ error: "Solicitud no encontrada" });
    }
    if (solicitud.artista_id.toString() !== req.usuario.id) {
        return res.status(403).json({ error: "No puedes modificar solicitudes de otro artista" });
    }

    solicitud.estado = estado;
    await solicitud.save();
    res.json({ mensaje: "Estado actualizado" });
});

conectarDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
});