const formLogin = document.getElementById("formLogin");

if (formLogin) {
    formLogin.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const errorEl = document.getElementById("loginError");

        try {
            const respuesta = await fetch("http://localhost:3000/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                errorEl.textContent = datos.error || "Error al iniciar sesión";
                return;
            }

            // Guarda el token en el navegador para usarlo después
            localStorage.setItem("token", datos.token);

            // Redirige al panel
            window.location.href = "Dashboard.html";

        } catch (error) {
            errorEl.textContent = "No se pudo conectar con el servidor.";
        }
    });
}