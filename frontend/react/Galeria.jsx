import { useEffect, useState } from "react";

const obras = [
  ["Autoretrato.jpg", "Autoretrato"],
  ["B1.jpg", "Ilustración B1"],
  ["B2.jpg", "Ilustración B2"],
  ["Elric.jpg", "Los hermanos Elric"],
  ["Griffith.jpg", "Griffith"],
  ["Jhonny.jpg", "Jhonny Joestar"],
  ["Koi.jpg", "Pez koi"],
  ["LI1.jpg", "Laura"],
  ["LI2.jpg", "Laura"],
  ["LI3.jpg", "Laura"],
  ["LI4.jpg", "Laura"],
  ["LI5.jpg", "Laura"],
  ["LI6.jpg", "Laura"],
  ["Mi novia.jpg", "Retrato"],
  ["Monet.jpg", "Pintura de Monet"],
  ["Spiderman.jpg", "Spiderman"],
  ["Starfire.jpg", "Starfire"],
  ["Toph.jpg", "Toph"],
  ["Rogue.jpg", "Rogue"],
  ["Pucci.jpg", "Pucci"],
].map(([archivo, alt]) => ({ src: "../img/" + archivo, alt }));

export default function Galeria() {
  const [abierta, setAbierta] = useState(null); // obra ampliada

  // Escape cierra el modal
  useEffect(() => {
    if (!abierta) return;
    const alPulsar = e => { if (e.key === "Escape") setAbierta(null); };
    document.addEventListener("keydown", alPulsar);
    return () => document.removeEventListener("keydown", alPulsar);
  }, [abierta]);

  return (
    <>
      <section className="Galeria">
        {obras.map(o => (
          <img key={o.src} src={o.src} alt={o.alt} onClick={() => setAbierta(o)} />
        ))}
      </section>

      <div
        id="modal"
        className="modal"
        style={{ display: abierta ? "flex" : "none" }}
        onClick={e => { if (e.target === e.currentTarget) setAbierta(null); }}
      >
        <div className="modal-contenido">
          <button id="cerrarModal" aria-label="Cerrar" onClick={() => setAbierta(null)}>✕</button>
          <div className="modal-texto">
            <h2 id="modalTitulo">Trabajos</h2>
            <p id="modalDescripcion">Ilustración realizada por Ivan Tuesca.</p>
          </div>
          <div className="modal-imagen-wrapper">
            <img id="modalImagen" src={abierta ? abierta.src : ""} alt={abierta ? abierta.alt : ""} />
          </div>
        </div>
      </div>
    </>
  );
}
