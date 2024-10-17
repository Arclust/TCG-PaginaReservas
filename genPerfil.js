document.addEventListener("DOMContentLoaded", function() {
    const correoUsuario = "cpedreros@utem.cl"; // Reemplaza con el correo del usuario actual
    const contenedorCuadrados = document.getElementById("contenedor-cuadrados");
  
    fetch(`http://localhost:3000/credenciales?correo=${correoUsuario}`)
        .then(response => response.json())
        .then(credenciales => {
            credenciales.forEach(() => {
            const cuadrado = document.createElement("div");
            cuadrado.classList.add("cuadrado");
            contenedorCuadrados.appendChild(cuadrado);
            });
        })
        .catch(error => {
            console.error("Error al obtener las credenciales:", error);
    });
});