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

    // Obtener la fecha actual del sistema
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // Enero es 0, Diciembre es 11
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    // Actualizar el título del calendario con el mes y año actual
    calendarTitle.textContent = `${monthNames[currentMonth]} ${currentYear}`;

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate(); // Obtiene la cantidad de días del mes actual
    const startDay = new Date(currentYear, currentMonth, 1).getDay(); // Primer día del mes (0 = domingo, 6 = sábado)

    // Rellenar días vacíos antes del primer día del mes
    for (let i = 0; i < (startDay === 0 ? 6 : startDay - 1); i++) {
        const emptyElement = document.createElement("div");
        emptyElement.className = "day empty";
        calendar.appendChild(emptyElement);
    }

    /*botonperfil.addEventListener('click', () => {
        pantallaCalendario.classList.add('oculto');
        pantallaPerfil.classList.remove('oculto');
    });

    botoncalendario.addEventListener('click', () => {
        pantallaPerfil.classList.add('oculto');
        pantallaCalendario.classList.remove('oculto');
    });*/

    // Crear los días del calendario
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement("div");
        dayElement.className = "day";
        dayElement.textContent = day;

        dayElement.addEventListener("click", function() {
            const selectedDate = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

            fetch(`http://localhost:3000/eventos/${selectedDate}`)
                .then(response => response.json())
                .then(data => {
                    eventList.innerHTML = '';  // Limpiar eventos previos
                    
                    if (data.length > 0) {
                        data.forEach(evento => {
                            const eventItem = document.createElement("li");
                            eventItem.textContent = `Evento: ${evento.titulo_evento}, Descripción: ${evento.descripcion_evento}`;
                            eventList.appendChild(eventItem);

                            // Establecer fondo basado en el tipo de evento
                            switch (evento.juego_evento) {
                                case 'Digimon TCG':
                                    eventItem.style.backgroundImage = 'url(assets/DigimonBG.jpg)';
                                    break;
                                case 'Dragon Ball TCG':
                                    eventItem.style.backgroundImage = 'url(assets/DragonballBG.jpg)';
                                    break;
                                case 'Pokemon TCG':
                                    eventItem.style.backgroundImage = 'url(assets/PokemonBG.jpg)';
                                    break;
                                case 'One Piece TCG':
                                    eventItem.style.backgroundImage = 'url(assets/OnepieceBG.jpg)';
                                    break;
                                default:
                                    eventItem.style.backgroundColor = '#f0f0f0'; // Fondo genérico
                                    break;
                            }
                        });
                    } else {
                        const noEvents = document.createElement("li");
                        noEvents.textContent = "No hay eventos para este día.";
                        eventList.appendChild(noEvents);
                    }
                })
                .catch(err => {
                    console.error('Error fetching data:', err);
                });
        });

        calendar.appendChild(dayElement);
    }

    // Funcionalidad para el botón "Inscribir a un Evento"
    botonInscribirEvento.addEventListener('click', function() {
        const ID_evento = prompt("Ingrese el ID del evento al que desea inscribir a un usuario:");
        const correo_usuario = prompt("Ingrese el correo del usuario:");

        if (ID_evento && correo_usuario) {
            fetch(`http://localhost:3000/inscribir/${ID_evento}`, {
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

    // Funcionalidad para el botón "Crear un Evento"
    botonCrearEvento.addEventListener('click', function() {
        var tituloEvento = window.prompt("Ingrese el título del evento:");
        const descripcionEvento = window.prompt("Ingrese una descripción para el evento:");
        const juegoEvento = window.prompt("Ingrese el juego del evento (ej: Digimon TCG, Dragon Ball TCG):");
        const fechaEvento = window.prompt("Ingrese la fecha del evento en formato AAAA-MM-DD:");

        if (tituloEvento && descripcionEvento && juegoEvento && fechaEvento) {
            fetch('http://localhost:3000/crear-evento', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    titulo_evento: tituloEvento,
                    descripcion_evento: descripcionEvento,
                    juego_evento: juegoEvento,
                    fecha_evento: fechaEvento
                }),
            })
            .then(response => response.json())
            .then(data => {
                alert(`Evento "${tituloEvento}" creado correctamente.`);
            })
            .catch(error => {
                console.error('Error al crear el evento:', error);
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
                fetch('http://localhost:3000/crear-usuario', {
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
                fetch(`http://localhost:3000/eliminar-usuario/${correo_usuario}`, {
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
