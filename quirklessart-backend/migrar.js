// Pasa tus datos de SQLite (quirklessart.db) a MongoDB. Ejecutar UNA vez:
//   node migrar.js
require("dotenv").config();
const Database = require("better-sqlite3");
const conectarDB = require("./database");
const { Usuario, Solicitud } = require("./models");

// SQLite guarda "2026-09-16 17:09:00" (UTC)
const aFecha = s => new Date(String(s).replace(" ", "T") + "Z");

(async () => {
    await conectarDB();
    const sqlite = new Database("quirklessart.db", { readonly: true });
    const mapaIds = {}; // id viejo (número) -> _id nuevo (ObjectId)

    for (const u of sqlite.prepare("SELECT * FROM usuarios").all()) {
        const nuevo = await Usuario.create({
            nombre: u.nombre,
            email: u.email,
            password_hash: u.password_hash, // los hashes bcrypt siguen funcionando
            creado_en: aFecha(u.creado_en)
        });
        mapaIds[u.id] = nuevo._id;
    }

    for (const s of sqlite.prepare("SELECT * FROM solicitudes").all()) {
        await Solicitud.create({
            artista_id: mapaIds[s.artista_id],
            tipo: s.tipo,
            personas: s.personas,
            tamano: s.tamano,
            descripcion: s.descripcion,
            precio: s.precio,
            estado: s.estado,
            creado_en: aFecha(s.creado_en)
        });
    }

    console.log("Migración lista:", Object.keys(mapaIds).length, "usuarios.");
    process.exit(0);
})();
