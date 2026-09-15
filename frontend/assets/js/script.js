// --- Elementos (pueden no existir en todas las páginas, por eso se verifican) ---
const formulario = document.getElementById("formComision");
const cotizacionDiv = document.getElementById("cotizacion");
const ticketDiv = document.getElementById("ticket");

const modal = document.getElementById("modal");
const modalImagen = document.getElementById("modalImagen");
const modalTitulo = document.getElementById("modalTitulo");
const modalDescripcion = document.getElementById("modalDescripcion");
const cerrarModal = document.getElementById("cerrarModal");
const imagenes = document.querySelectorAll(".Galeria img");

// --- Precios: arriba y fuera de cualquier función, para que TODOS los listeners los vean ---
const precios = {
    Digital: 50000,
    Acrilico: 100000,
    Oleo: 150000
};

const recargoTamano = {
    Pequeño: 0,
    Mediano: 20000,
    Grande: 50000
};

// Función reutilizable: evita repetir la cuenta del precio dos veces
function calcularPrecio(tipo, personas, tamano) {
    let precio = precios[tipo];
    if (personas > 1) {
        precio += (personas - 1) * 30000;
    }
    precio += recargoTamano[tamano];
    return precio;
}

// --- Formulario de comisiones (solo corre si el formulario existe, o sea en Comisiones.html) ---
if (formulario) {
    formulario.addEventListener("submit", function (event) {
        event.preventDefault();

        const tipo = document.getElementById("tipo").value;
        const personas = Number(document.getElementById("personas").value);
        const tamano = document.getElementById("tamano").value;
        const precio = calcularPrecio(tipo, personas, tamano);

        cotizacionDiv.innerHTML = `
            <h3>Solicitud de comisión</h3>
            <p>Personas: ${personas}</p>
            <p>Precio estimado: <strong>$${precio.toLocaleString("es-CO")} COP</strong></p>
            <button id="confirmar" type="button">Confirmar solicitud</button>
        `;
    });
}

// --- Generar el ticket al hacer clic en "Confirmar" (el botón se crea dinámicamente arriba) ---
document.addEventListener("click", async function (event) {
    if (event.target.id === "confirmar") {

        const tipo = document.getElementById("tipo").value;
        const personas = Number(document.getElementById("personas").value);
        const tamano = document.getElementById("tamano").value;
        const descripcion = document.getElementById("descripcion").value;
        const precio = calcularPrecio(tipo, personas, tamano);

        const solicitud = { tipo, personas, tamano, descripcion, precio };

        try {
            const respuesta = await fetch("http://localhost:3000/api/comisiones", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(solicitud)
            });

            const datos = await respuesta.json();
            console.log("Respuesta del servidor:", datos);

            const numeroSolicitud = Math.floor(Math.random() * 9000) + 1000;

            ticketDiv.innerHTML = `
                <div class="ticket">
                    <h2>Solicitud #${numeroSolicitud}</h2>
                    <p><strong>Tipo:</strong> ${tipo}</p>
                    <p><strong>Personas:</strong> ${personas}</p>
                    <p><strong>Tamaño:</strong> ${tamano}</p>
                    <p><strong>Descripción:</strong> ${descripcion}</p>
                    <hr>
                    <h3>Total estimado: $${precio.toLocaleString("es-CO")} COP</h3>
                    <p>Estado: Solicitud recibida</p>
                </div>
            `;

        } catch (error) {
            console.error("Error al enviar la solicitud:", error);
            ticketDiv.innerHTML = `<p style="color: red;">No se pudo conectar con el servidor. ¿Está corriendo node server.js?</p>`;
        }
    }
});

// --- Modal de galería (corre en cualquier página que tenga #modal e imágenes .Galeria img) ---
if (modal && imagenes.length) {
    imagenes.forEach(function (imagen) {
    imagen.addEventListener("click", function () {
        modal.style.display = "flex";
        modalImagen.src = imagen.src;
        modalDescripcion.textContent =
            imagen.dataset.desc || "Ilustración realizada por Ivan Tuesca.";
    });
});

    // Cerrar con el botón X
    cerrarModal.addEventListener("click", function () {
        modal.style.display = "none";
    });

    // Cerrar haciendo clic fuera de la imagen (en el fondo oscuro)
    modal.addEventListener("click", function (event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });
}