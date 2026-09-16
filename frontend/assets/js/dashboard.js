const token = localStorage.getItem("token");
const listaDiv = document.getElementById("listaSolicitudes");

// Si no hay token guardado, no dejamos ver esta página
if (!token) {
    window.location.href = "Login.html";
}

async function cargarSolicitudes() {
    try {
        const respuesta = await fetch("http://localhost:3000/api/comisiones", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!respuesta.ok) {
            // Token vencido o inválido: manda de vuelta al login
            localStorage.removeItem("token");
            window.location.href = "Login.html";
            return;
        }

        const solicitudes = await respuesta.json();
        renderizarSolicitudes(solicitudes);

    } catch (error) {
        listaDiv.innerHTML = "<p>No se pudo conectar con el servidor.</p>";
    }
}

function renderizarSolicitudes(solicitudes) {
    if (solicitudes.length === 0) {
        listaDiv.innerHTML = "<p>Todavía no tienes solicitudes.</p>";
        return;
    }

    listaDiv.innerHTML = solicitudes.map(function (s) {
        return `
            <div class="solicitud-card">
                <h3>Solicitud #${s.id}</h3>
                <p><strong>Tipo:</strong> ${s.tipo}</p>
                <p><strong>Personas:</strong> ${s.personas}</p>
                <p><strong>Tamaño:</strong> ${s.tamano}</p>
                <p><strong>Descripción:</strong> ${s.descripcion}</p>
                <p><strong>Precio:</strong> $${s.precio.toLocaleString("es-CO")} COP</p>
                <p><strong>Estado actual:</strong> ${s.estado}</p>

                <select data-id="${s.id}" class="selectorEstado">
                    <option value="pendiente" ${s.estado === "pendiente" ? "selected" : ""}>Pendiente</option>
                    <option value="aceptada" ${s.estado === "aceptada" ? "selected" : ""}>Aceptada</option>
                    <option value="pagada" ${s.estado === "pagada" ? "selected" : ""}>Pagada</option>
                    <option value="rechazada" ${s.estado === "rechazada" ? "selected" : ""}>Rechazada</option>
                </select>
            </div>
        `;
    }).join("");
}

// Escucha cambios en cualquier selector de estado (delegación de eventos)
listaDiv.addEventListener("change", async function (event) {
    if (!event.target.classList.contains("selectorEstado")) return;

    const id = event.target.dataset.id;
    const nuevoEstado = event.target.value;

    await fetch(`http://localhost:3000/api/comisiones/${id}/estado`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ estado: nuevoEstado })
    });

    // Nuevo: si se rechaza, oculta la tarjeta de inmediato
    if (nuevoEstado === "rechazada") {
        event.target.closest(".solicitud-card").remove();
    }
});

document.getElementById("btnLogout").addEventListener("click", function () {
    localStorage.removeItem("token");
    window.location.href = "Login.html";
});

cargarSolicitudes();

let todasLasSolicitudes = []; // agrega esto arriba del archivo

async function cargarSolicitudes() {
    try {
        const respuesta = await fetch("http://localhost:3000/api/comisiones", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!respuesta.ok) {
            localStorage.removeItem("token");
            window.location.href = "Login.html";
            return;
        }

        todasLasSolicitudes = await respuesta.json(); // guarda la lista completa
        renderizarSolicitudes(todasLasSolicitudes);

    } catch (error) {
        listaDiv.innerHTML = "<p>No se pudo conectar con el servidor.</p>";
    }
}

// Nuevo: maneja los clics en los botones de filtro
document.querySelectorAll(".filtroBtn").forEach(function (btn) {
    btn.addEventListener("click", function () {
        document.querySelectorAll(".filtroBtn").forEach(b => b.classList.remove("activo"));
        btn.classList.add("activo");

        const filtro = btn.dataset.filtro;
        const filtradas = filtro === "todas"
            ? todasLasSolicitudes
            : todasLasSolicitudes.filter(s => s.estado === filtro);

        renderizarSolicitudes(filtradas);
    });
});