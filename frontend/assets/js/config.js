// Dirección del servidor (backend).
// En tu computador usa localhost; publicado usa la URL de Render.
// [EDITAR] Cuando publiques el backend, cambia la URL de abajo por la tuya.
const API_BASE = (
    location.protocol === "file:" ||
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1"
)
    ? "http://localhost:3000"
    : "https://projecto-jc.onrender.com";
