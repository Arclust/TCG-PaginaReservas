document.addEventListener("DOMContentLoaded", function() {
    const calendar = document.getElementById("calendar");
    const calendarTitle = document.getElementById("calendar-title");
    const botonperfil = document.getElementById('BotonVerPerfil');
    const botoncalendario = document.getElementById('BotonVerCalendario');
    const pantallaCalendario = document.getElementById('PantallaCalendario');
    const pantallaPerfil = document.getElementById('PantallaPerfil');
    const eventList = document.getElementById("event-list");
    const botonInscribirEvento = document.getElementById('BotonInscribirEvento');
    const botonCrearEvento = document.getElementById('BotonCrearEvento');
    const botonAdministrarCuentas = document.getElementById('BotonAdministrarCuentas');
    const API_BASE_URL = "https://tcg-paginareservas.onrender.com";

    // Obtener la fecha actual del sistema
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Ignorar horas para comparar solo fechas

    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // Enero es 0, Diciembre es 11
    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio',
        'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    // Actualizar el título del calendario
    calendarTitle.textContent = `${monthNames[currentMonth]} ${currentYear}`;

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate(); // Días del mes
    const startDay = new Date(currentYear, currentMonth, 1).getDay(); // Primer día del mes (0-6)

    // Rellenar días vacíos antes del inicio del mes
    for (let i = 0; i < (startDay === 0 ? 6 : startDay - 1); i++) {
        const emptyElement = document.createElement("div");
        emptyElement.className = "day empty";
        calendar.appendChild(emptyElement);
    }

    // Crear días del mes
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement("div");
        dayElement.className = "day";
        dayElement.textContent = day;

        const selectedDate = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

        // Verificar si hay eventos futuros
        fetch(`${API_BASE_URL}/eventos/${selectedDate}`)
            .then(response => response.json())
            .then(data => {
                const eventosFuturos = data.filter(evento => {
                    const fechaEvento = new Date(evento.fecha_evento);
                    fechaEvento.setHours(0, 0, 0, 0);
                    return fechaEvento >= today;
                });

                if (eventosFuturos.length > 0) {
                    dayElement.classList.add("event-day");
                }
            })
            .catch(err => console.error("Error fetching events:", err));

        // Añadir evento de clic al día
        dayElement.addEventListener("click", () => {
            fetch(`${API_BASE_URL}/eventos/${selectedDate}`)
                .then(response => response.json())
                .then(data => {
                    eventList.innerHTML = ""; // Limpiar lista de eventos

                    const eventosFuturos = data.filter(evento => {
                        const fechaEvento = new Date(evento.fecha_evento);
                        fechaEvento.setHours(0, 0, 0, 0);
                        return fechaEvento >= today;
                    });

                    if (eventosFuturos.length > 0) {
                        eventosFuturos.forEach(evento => {
                            const eventItem = document.createElement("li");
                            eventItem.textContent = evento.titulo_evento;
                            eventList.appendChild(eventItem);
                        });
                    } else {
                        const noEvents = document.createElement("li");
                        noEvents.textContent = "No hay eventos para este día.";
                        eventList.appendChild(noEvents);
                    }
                })
                .catch(err => console.error("Error fetching events:", err));
        });

        calendar.appendChild(dayElement); // Asegurar que los días se agreguen siempre
    }

    // Funcionalidad para el botón "Inscribir a un Evento"
    botonInscribirEvento.addEventListener('click', function() {
        const ID_evento = prompt("Ingrese el ID del evento al que desea inscribir a un usuario:");
        const correo_usuario = prompt("Ingrese el correo del usuario:");

        if (ID_evento && correo_usuario) {
            fetch(`${API_BASE_URL}/inscribir/${ID_evento}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ correo_usuario: correo_usuario, ID_evento: ID_evento }),
            })
            .then(response => response.json())
            .then(data => {
                alert(`Usuario ${correo_usuario} inscrito al evento ${ID_evento} correctamente.`);
            })
            .catch(error => {
                console.error('Error al inscribir al evento:', error);
            });
        }
    });

    // Funcionalidad para el botón "Administrar Cuentas"
    botonAdministrarCuentas.addEventListener('click', function() {
        const action = prompt("Ingrese '1' para crear una cuenta o '2' para eliminar una cuenta:");

        if (action === '1') {
            const nombre_usuario = prompt("Ingrese el nombre de usuario:");
            const correo_usuario = prompt("Ingrese el correo electrónico:");
            const tipo_usuario = prompt("Ingrese el tipo de usuario:")

            if (nombre_usuario && correo_usuario && tipo_usuario) {
                fetch(`${API_BASE_URL}/crear-usuario`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        nombre_usuario: nombre_usuario,
                        correo_usuario: correo_usuario,
                        tipo_usuario: parseInt(tipo_usuario)
                    }),
                })
                .then(response => response.json())
                .then(data => {
                    alert(`Cuenta para ${nombre_usuario} creada correctamente.`);
                })
                .catch(error => {
                    console.error('Error al crear la cuenta:', error);
                });
            }
        } else if (action === '2') {
            const correo_usuario = prompt("Ingrese el correo del usuario a eliminar:");

            if (correo_usuario) {
                fetch(`${API_BASE_URL}/eliminar-usuario/${correo_usuario}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
                .then(response => response.json())
                .then(data => {
                    alert(`Usuario con correo ${correo_usuario} eliminado correctamente.`);
                })
                .catch(error => {
                    console.error('Error al eliminar la cuenta:', error);
                });
            }
        }
    });
});
