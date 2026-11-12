// Menú adaptable y selección del menú de inicio.
const botonMenu = document.querySelector(".menu-toggle");
const listaNav = document.querySelector(".nav-links");

if (botonMenu && listaNav) {
    botonMenu.addEventListener("click", () => {
        const abierto = listaNav.classList.toggle("abierto");
        botonMenu.setAttribute("aria-expanded", String(abierto));
    });
}

const menuInicio = document.getElementById("menuP3");

if (menuInicio) {
    const opciones = Array.from(menuInicio.querySelectorAll("li"));
    const descripcion = document.getElementById("pausaDesc");
    let seleccion = Math.max(0, opciones.findIndex(item => item.classList.contains("activo")));

    function seleccionar(indice) {
        seleccion = (indice + opciones.length) % opciones.length;
        opciones.forEach((item, i) => item.classList.toggle("activo", i === seleccion));
        if (descripcion) descripcion.textContent = opciones[seleccion].dataset.desc || "";
    }

    document.addEventListener("keydown", event => {
        const elemento = document.activeElement;
        if (elemento && /^(INPUT|TEXTAREA|SELECT)$/.test(elemento.tagName)) return;
        if (event.key === "ArrowDown" || event.key.toLowerCase() === "s") {
            event.preventDefault();
            seleccionar(seleccion + 1);
        } else if (event.key === "ArrowUp" || event.key.toLowerCase() === "w") {
            event.preventDefault();
            seleccionar(seleccion - 1);
        } else if (event.key === "Enter" && elemento === document.body) {
            opciones[seleccion].querySelector("a").click();
        }
    });

    opciones.forEach((item, indice) => {
        item.addEventListener("mouseenter", () => seleccionar(indice));
        const enlace = item.querySelector("a");
        if (enlace) enlace.addEventListener("focus", () => seleccionar(indice));
    });

    seleccionar(seleccion);
}
