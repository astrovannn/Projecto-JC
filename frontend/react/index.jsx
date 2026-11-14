// Punto de entrada: monta cada componente de React donde su página tenga el contenedor.
import { createRoot } from "react-dom/client";
import Galeria from "./Galeria";
import Comisiones from "./Comisiones";

const montar = (id, Componente) => {
  const contenedor = document.getElementById(id);
  if (contenedor) createRoot(contenedor).render(<Componente />);
};

montar("react-galeria", Galeria);
montar("react-comisiones", Comisiones);
