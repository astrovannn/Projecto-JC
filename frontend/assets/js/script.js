// Funciones de comisiones y ampliación de imágenes de la galería.
const formulario = document.getElementById("formComision");
const cotizacion = document.getElementById("cotizacion");
const ticket = document.getElementById("ticket");

const precios = { Digital: 50000, Acrilico: 100000, Oleo: 150000 };
const recargos = { Pequeño: 0, Mediano: 20000, Grande: 50000 };

function calcularPrecio(tipo, personas, tamano) {
    return (precios[tipo] || 0) + Math.max(0, personas - 1) * 30000 + (recargos[tamano] || 0);
}


if (formulario) {
    formulario.addEventListener("submit", event => {
        event.preventDefault();
        const tipo = document.getElementById("tipo").value;
        const personas = Number(document.getElementById("personas").value);
        const tamano = document.getElementById("tamano").value;
        const total = calcularPrecio(tipo, personas, tamano);

        cotizacion.innerHTML = `
            <h3>Solicitud de comisión</h3>
            <p>Personas: ${personas}</p>
            <p>Precio estimado: <strong>$${total.toLocaleString("es-CO")} COP</strong></p>
            <button id="confirmar" type="button">Confirmar solicitud</button>
        `;
    });

    cotizacion.addEventListener("click", async event => {
        if (event.target.id !== "confirmar") return;

        const tipo = document.getElementById("tipo").value;
        const personas = Number(document.getElementById("personas").value);
        const tamano = document.getElementById("tamano").value;
        const descripcion = document.getElementById("descripcion").value.trim();
        const precio = calcularPrecio(tipo, personas, tamano);


        try {
            const respuesta = await fetch(`${API_BASE}/api/comisiones`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tipo, personas, tamano, descripcion, precio })
            });
            const datos = await respuesta.json();
            if (!respuesta.ok) throw new Error(datos.error || "No se pudo enviar la solicitud");

            ticket.innerHTML = `
                <div class="ticket">
                    <h2>Solicitud #${datos.id}</h2>
                    <p><strong>Tipo:</strong> ${tipo}</p>
                    <p><strong>Personas:</strong> ${personas}</p>
                    <p><strong>Tamaño:</strong> ${tamano}</p>
                    <p><strong>Descripción:</strong> ${descripcion || "Sin descripción"}</p>
                    <h3>Total estimado: $${precio.toLocaleString("es-CO")} COP</h3>
                    <p>Estado: Solicitud recibida</p>
                </div>`;
        } catch (error) {
            ticket.textContent = error.message || "No se pudo conectar con el servidor.";
        }
    });
}

// Modal de la galería: permite ampliar y cerrar cada ilustración.
const modal = document.getElementById("modal");
if (modal) {
    const imagenModal = document.getElementById("modalImagen");
    const descripcionModal = document.getElementById("modalDescripcion");
    const cerrar = document.getElementById("cerrarModal");

    document.querySelectorAll(".Galeria img").forEach(imagen => {
        imagen.addEventListener("click", () => {
            imagenModal.src = imagen.src;
            imagenModal.alt = imagen.alt;
            descripcionModal.textContent = imagen.dataset.desc || "Ilustración realizada por Ivan Tuesca.";
            modal.style.display = "flex";
        });
    });

    function cerrarModal() { modal.style.display = "none"; }
    if (cerrar) cerrar.addEventListener("click", cerrarModal);
    modal.addEventListener("click", event => {
        if (event.target === modal) cerrarModal();
    });
    document.addEventListener("keydown", event => {
        if (event.key === "Escape") cerrarModal();
    });
}