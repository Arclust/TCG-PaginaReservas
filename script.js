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

    const selectedDate = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

    fetch(`http://localhost:3000/eventos/${selectedDate}`)
    .then(response => response.json())
    .then(data => {
        if (data.length > 0) {
            dayElement.classList.add('event-day'); // Añadir clase si hay eventos
        }
    })
    .catch(err => {
        console.error('Error fetching data:', err);
    });

    dayElement.addEventListener("click", function() {
        

        fetch(`http://localhost:3000/eventos/${selectedDate}`)
            .then(response => response.json())
            .then(data => {
                eventList.innerHTML = '';  // Limpiar eventos previos
                
                if (data.length > 0) {
                    data.forEach(evento => {
                        const eventItem = document.createElement("li");
                        eventItem.textContent = `${evento.titulo_evento}`;
                        eventItem.style.paddingLeft = '20px';

                        // Crear botón de ver detalles del evento
                        const button = document.createElement("button");
                        button.className = "verdetalles-evento";
                        button.textContent = "Ver detalles";
                        button.style.float = "right";
                        button.style.marginRight = '2%';
                        button.dataset.idEvento = evento.ID_evento;  // Establecer el ID del evento en el atributo data-id-evento

                        // Agregar evento de clic al botón de inscripción
                        button.addEventListener("click", function() {
                            fetch(`http://localhost:3000/evento/${evento.ID_evento}`, {
                                method: 'get'
                            }) // Obtener datos del usuario autenticado
                                .then(response => {
                                    if (response.ok) {
                                         window.location.href = `http://localhost:3000/evento/${evento.ID_evento}`;
                                    } else {
                                        console.error('Error al realizar la solicitud');
                                    }
                                })
                                .catch(error => {
                                    // Manejar errores de red
                                    console.error('Error de red:', error);
                                });
                                /*.then(user => {
                                    const correo_usuario = user.correo_usuario; // Obtener el correo del usuario autenticado

                                    // Inscribir al usuario
                                    fetch(`http://localhost:3000/inscribir-usuario/${evento.ID_evento}`, {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify({ correo_usuario: correo_usuario }),
                                    })
                                    .then(response => response.json())
                                    .then(data => {
                                        alert(data.message || 'Inscripción realizada con éxito.');
                                    })
                                    .catch(error => {
                                        console.error('Error al inscribir al evento:', error);
                                    });
                                })
                                .catch(error => {
                                    alert('Debes iniciar sesión para inscribirte en un evento.'); // Mensaje de error para no autenticado
                                    console.error(error);
                                });*/
                        });

                        // Agregar el botón de inscripción al elemento del evento
                        eventItem.appendChild(button);

                        // Establecer fondo basado en el tipo de evento
                        /*switch (evento.juego_evento) {
                            case 'Digimon TCG':
                                eventItem.style.backgroundImage = 'url(DigimonBG.jpg)';
                                break;
                            case 'Dragon Ball TCG':
                                eventItem.style.backgroundImage = 'url(DragonballBG.jpg)';
                                break;
                            case 'Pokemon TCG':
                                eventItem.style.backgroundImage = 'url(PokemonBG.jpg)';
                                break;
                            case 'One Piece TCG':
                                eventItem.style.backgroundImage = 'OnepieceBG.jpg)';
                                break;
                            default:
                                eventItem.style.backgroundColor = '#f0f0f0'; // Fondo genérico
                                break;
                        }*/

                        eventList.appendChild(eventItem);
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
   /* botonCrearEvento.addEventListener('click', function() {
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
    });*/

    // Agregar evento de clic a los botones de inscribir evento
  document.querySelectorAll('.inscribir-evento').forEach(function(button) {
    button.addEventListener('click', function() {
      const idEvento = button.dataset.idEvento;
      $.post('/inscribir-usuario/' + idEvento, function(data) {
        if (data.error) {
          console.error('Error al inscribir usuario:', data.error);
        } else {
          console.log('Usuario inscrito correctamente');
        }
      });
    });
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
