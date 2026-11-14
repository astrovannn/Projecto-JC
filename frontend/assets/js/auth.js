// Login y registro de usuarios.

function mostrarMensaje(elemento, texto, tipo) {
    if (!elemento) return;
    elemento.textContent = texto;
    elemento.className = "auth-mensaje" + (tipo ? " " + tipo : "");
}

async function enviarJSON(ruta, datos) {
    const respuesta = await fetch(`${API_BASE}/api${ruta}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
    });
    const cuerpo = await respuesta.json().catch(() => ({}));
    return { ok: respuesta.ok, cuerpo };
}

// ---------- LOGIN ----------
const formLogin = document.getElementById("formLogin");

if (formLogin) {
    formLogin.addEventListener("submit", async event => {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const mensaje = document.getElementById("loginError");
        const boton = formLogin.querySelector("button");

        boton.disabled = true;
        mostrarMensaje(mensaje, "Entrando...", "");

        try {
            const { ok, cuerpo } = await enviarJSON("/login", { email, password });

            if (!ok) {
                mostrarMensaje(mensaje, cuerpo.error || "Error al iniciar sesión", "error");
                return;
            }

            localStorage.setItem("token", cuerpo.token);
            window.location.href = "Dashboard.html";
        } catch {
            mostrarMensaje(mensaje, "No se pudo conectar con el servidor.", "error");
        } finally {
            boton.disabled = false;
        }
    });
}

// ---------- REGISTRO ----------
const formRegistro = document.getElementById("formRegistro");

if (formRegistro) {
    formRegistro.addEventListener("submit", async event => {
        event.preventDefault();

        const nombre = document.getElementById("nombre").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const password2 = document.getElementById("password2").value;
        const codigo = document.getElementById("codigo").value.trim();
        const mensaje = document.getElementById("registroMensaje");
        const boton = formRegistro.querySelector("button");

        if (password.length < 6) {
            mostrarMensaje(mensaje, "La contraseña debe tener al menos 6 caracteres.", "error");
            return;
        }
        if (password !== password2) {
            mostrarMensaje(mensaje, "Las contraseñas no coinciden.", "error");
            return;
        }

        boton.disabled = true;
        mostrarMensaje(mensaje, "Creando tu cuenta...", "");

        try {
            // El código de invitación es opcional: solo se envía si lo escribieron
            const datos = { nombre, email, password };
            if (codigo) datos.codigo = codigo;
            const registro = await enviarJSON("/registro", datos);

            if (!registro.ok) {
                mostrarMensaje(mensaje, registro.cuerpo.error || "No se pudo crear la cuenta.", "error");
                return;
            }

            // Cuenta creada: inicia sesión automáticamente
            const login = await enviarJSON("/login", { email, password });

            if (login.ok) {
                localStorage.setItem("token", login.cuerpo.token);
                mostrarMensaje(mensaje, "¡Cuenta creada! Entrando a tu panel...", "ok");
                setTimeout(() => { window.location.href = "Dashboard.html"; }, 900);
            } else {
                mostrarMensaje(mensaje, "Cuenta creada. Ahora inicia sesión.", "ok");
                setTimeout(() => { window.location.href = "Login.html"; }, 1200);
            }
        } catch {
            mostrarMensaje(mensaje, "No se pudo conectar con el servidor.", "error");
        } finally {
            boton.disabled = false;
        }
    });
}
