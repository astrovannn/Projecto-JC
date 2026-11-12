
const mongoose = require("mongoose");

async function conectarDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB conectado correctamente");
    } catch (error) {
        console.error("Error al conectar MongoDB:", error);
        process.exit(1);
    }
}

module.exports = conectarDB;
