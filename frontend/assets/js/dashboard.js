// Panel privado: consulta solicitudes, permite filtrarlas y cambiar su estado.
const token = localStorage.getItem("token");
const lista = document.getElementById("listaSolicitudes");
const botonSalir = document.getElementById("btnLogout");
let solicitudes = [];

if (!token) {
    window.location.href = "Login.html";
} else {
    cargarSolicitudes();
}

async function cargarSolicitudes() {
    try {
        const respuesta = await fetch(`${API_BASE}/api/comisiones`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!respuesta.ok) {
            localStorage.removeItem("token");
            window.location.href = "Login.html";
            return;
        }
        solicitudes = await respuesta.json();
        renderizarSolicitudes(solicitudes);
    } catch {
        lista.textContent = "No se pudo conectar con el servidor.";
    }
}

function renderizarSolicitudes(datos) {
    if (!datos.length) {
        lista.innerHTML = "<p style='color:white;text-align:center'>No hay solicitudes para mostrar.</p>";
        return;
    }

    lista.innerHTML = datos.map(solicitud => `
        <article class="solicitud-card">
            <h3>Solicitud #${solicitud.id}</h3>
            <p><strong>Tipo:</strong> ${solicitud.tipo}</p>
            <p><strong>Personas:</strong> ${solicitud.personas}</p>
            <p><strong>Tamaño:</strong> ${solicitud.tamano}</p>
            <p><strong>Descripción:</strong> ${solicitud.descripcion || "Sin descripción"}</p>
            <p><strong>Precio:</strong> $${Number(solicitud.precio).toLocaleString("es-CO")} COP</p>
            <p><strong>Estado:</strong> ${solicitud.estado}</p>
            <label>Actualizar estado:
                <select data-id="${solicitud.id}" class="selectorEstado">
                    ${["pendiente", "aceptada", "pagada", "rechazada"].map(estado =>
                        `<option value="${estado}" ${solicitud.estado === estado ? "selected" : ""}>${estado}</option>`
                    ).join("")}
                </select>
            </label>
        </article>
    `).join("");
}

lista.addEventListener("change", async event => {
    if (!event.target.matches(".selectorEstado")) return;
    const id = event.target.dataset.id;
    const estado = event.target.value;

    try {
        const respuesta = await fetch(`${API_BASE}/api/comisiones/${id}/estado`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ estado })
        });
        if (!respuesta.ok) throw new Error("No se pudo actualizar el estado");
        const solicitud = solicitudes.find(item => String(item.id) === String(id));
        if (solicitud) solicitud.estado = estado;
        if (estado === "rechazada") {
            solicitudes = solicitudes.filter(item => String(item.id) !== String(id));
            event.target.closest(".solicitud-card").remove();
        }
    } catch {
        alert("No se pudo actualizar el estado. Inténtalo de nuevo.");
        cargarSolicitudes();
    }
});

document.querySelectorAll(".filtroBtn").forEach(boton => {
    boton.addEventListener("click", () => {
        document.querySelectorAll(".filtroBtn").forEach(item => item.classList.remove("activo"));
        boton.classList.add("activo");
        const filtro = boton.dataset.filtro;
        renderizarSolicitudes(filtro === "todas"
            ? solicitudes
            : solicitudes.filter(item => item.estado === filtro));
    });
});

if (botonSalir) {
    botonSalir.addEventListener("click", () => {
        localStorage.removeItem("token");
        window.location.href = "Login.html";
    });
}
