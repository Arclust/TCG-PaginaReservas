
document.addEventListener("DOMContentLoaded", function() {
    const calendar = document.getElementById("calendar");
    const calendarTitle = document.getElementById("calendar-title");
    const botonperfil = document.getElementById('BotonVerPerfil');
    const botoncalendario = document.getElementById('BotonVerCalendario');
    const pantallaCalendario = document.getElementById('PantallaCalendario');
    const pantallaPerfil = document.getElementById('PantallaPerfil');
    const eventList = document.getElementById("event-list");

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

    botonperfil.addEventListener('click', () => {
        if (pantallaPerfil.classList.contains('oculto')) {
            pantallaCalendario.classList.add('oculto');
            pantallaPerfil.classList.remove('oculto');
        } else {
            console.log('Ya estás en la pantalla de perfil');
        }
    });

    botoncalendario.addEventListener('click', () => {
        if (pantallaCalendario.classList.contains('oculto')) {
            pantallaPerfil.classList.add('oculto');
            pantallaCalendario.classList.remove('oculto');
        } else {
            console.log('Ya estás en la pantalla de calendario');
        }
    });

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
                            if(evento.juego_evento === 'Digimon TCG'){
                                eventItem.style.backgroundImage = 'url(assets/DigimonBG.jpg)';
                            } else if(evento.juego_evento === 'Dragon Ball TCG'){
                                eventItem.style.backgroundImage = 'url(assets/DragonballBG.jpg)';
                            } else if(evento.juego_evento === 'Pokemon TCG'){
                                eventItem.style.backgroundImage = 'url(assets/PokemonBG.jpg)';
                            } else if(evento.juego_evento === 'One Piece TCG'){
                                eventItem.style.backgroundImage = 'url(assets/OnepieceBG.jpg)';
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
});
