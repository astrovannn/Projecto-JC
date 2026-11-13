const mongoose = require("mongoose");

// Las respuestas JSON devuelven "id" (string) en vez de "_id",
// así tu frontend sigue funcionando con solicitud.id y artista.id
const opciones = {
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: (_doc, ret) => {
            delete ret._id;
            delete ret.password_hash;
            return ret;
        }
    }
};

const usuarioSchema = new mongoose.Schema({
    nombre: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password_hash: { type: String, required: true },
    creado_en: { type: Date, default: Date.now }
}, opciones);

const solicitudSchema = new mongoose.Schema({
    artista_id: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
    tipo: { type: String, required: true },
    personas: { type: Number, required: true },
    tamano: { type: String, required: true },
    descripcion: String,
    precio: { type: Number, required: true },
    estado: { type: String, default: "pendiente" },
    creado_en: { type: Date, default: Date.now }
}, opciones);

module.exports = {
    Usuario: mongoose.model("Usuario", usuarioSchema),
    Solicitud: mongoose.model("Solicitud", solicitudSchema)
};
