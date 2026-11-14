import { useState } from "react";

const precios = { Digital: 50000, Acrilico: 100000, Oleo: 150000 };
const recargos = { Pequeño: 0, Mediano: 20000, Grande: 50000 };

function calcularPrecio(tipo, personas, tamano) {
  return (precios[tipo] || 0) + Math.max(0, personas - 1) * 30000 + (recargos[tamano] || 0);
}

const cop = valor => `$${Number(valor).toLocaleString("es-CO")} COP`;

export default function Comisiones() {
  const [tipo, setTipo] = useState("Digital");
  const [personas, setPersonas] = useState(1);
  const [tamano, setTamano] = useState("Pequeño");
  const [descripcion, setDescripcion] = useState("");

  const [cotizacion, setCotizacion] = useState(null); // lo cotizado
  const [ticket, setTicket] = useState(null);         // resultado del envío
  const [enviando, setEnviando] = useState(false);

  function cotizar(event) {
    event.preventDefault();
    const n = Math.min(10, Math.max(1, Number(personas) || 1));
    setCotizacion({ tipo, personas: n, tamano, descripcion: descripcion.trim(), precio: calcularPrecio(tipo, n, tamano) });
    setTicket(null);
  }

  async function confirmar() {
    setEnviando(true);
    try {
      const { tipo, personas, tamano, descripcion, precio } = cotizacion;
      // API_BASE viene de config.js
      const respuesta = await fetch(`${API_BASE}/api/comisiones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo, personas, tamano, descripcion, precio }),
      });
      const datos = await respuesta.json();
      if (!respuesta.ok) throw new Error(datos.error || "No se pudo enviar la solicitud");
      setTicket({ id: datos.id, ...cotizacion });
    } catch (error) {
      setTicket({ error: error.message || "No se pudo conectar con el servidor." });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <form id="formComision" onSubmit={cotizar}>
        <label htmlFor="tipo">Tipo de obra:</label>
        <select id="tipo" value={tipo} onChange={e => setTipo(e.target.value)}>
          <option value="Digital">Ilustración digital</option>
          <option value="Acrilico">Pintura acrílica</option>
          <option value="Oleo">Pintura al óleo</option>
        </select>

        <label htmlFor="personas">Número de personas:</label>
        <input type="number" id="personas" min="1" max="10" value={personas} onChange={e => setPersonas(e.target.value)} />

        <label htmlFor="tamano">Tamaño:</label>
        <select id="tamano" value={tamano} onChange={e => setTamano(e.target.value)}>
          <option value="Pequeño">Pequeño</option>
          <option value="Mediano">Mediano</option>
          <option value="Grande">Grande</option>
        </select>

        <label htmlFor="descripcion">Describe tu idea:</label>
        <textarea id="descripcion" placeholder="Cuéntame qué quieres realizar..." value={descripcion} onChange={e => setDescripcion(e.target.value)} />

        <button type="submit">Solicitar cotización</button>
      </form>

      <div id="cotizacion">
        {cotizacion && (
          <>
            <h3>Solicitud de comisión</h3>
            <p>Personas: {cotizacion.personas}</p>
            <p>Precio estimado: <strong>{cop(cotizacion.precio)}</strong></p>
            <button id="confirmar" type="button" onClick={confirmar} disabled={enviando}>
              {enviando ? "Enviando..." : "Confirmar solicitud"}
            </button>
          </>
        )}
      </div>

      <div id="ticket">
        {ticket && ticket.error && ticket.error}
        {ticket && !ticket.error && (
          <div className="ticket">
            <h2>Solicitud #{ticket.id}</h2>
            <p><strong>Tipo:</strong> {ticket.tipo}</p>
            <p><strong>Personas:</strong> {ticket.personas}</p>
            <p><strong>Tamaño:</strong> {ticket.tamano}</p>
            <p><strong>Descripción:</strong> {ticket.descripcion || "Sin descripción"}</p>
            <h3>Total estimado: {cop(ticket.precio)}</h3>
            <p>Estado: Solicitud recibida</p>
          </div>
        )}
      </div>
    </>
  );
}
