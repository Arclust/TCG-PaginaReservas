document.addEventListener("DOMContentLoaded", function() {
    const calendar = document.getElementById("calendar");
    const botonperfil = document.getElementById('BotonVerPerfil');
    const botoncalendario = document.getElementById('BotonVerCalendario');
    const pantallaCalendario = document.getElementById('PantallaCalendario');
    const pantallaPerfil = document.getElementById('PantallaPerfil');
    const daysInMonth = 30;  // Suponiendo un mes de 30 días
    const startDay = 6;      // Suponiendo que el mes comienza en un viernes (0 = lunes, 6 = domingo)
    
    // Rellenar días vacíos antes del primer día del mes
    for (let i = 0; i < startDay; i++) {
        const emptyElement = document.createElement("div");
        emptyElement.className = "day empty";
        calendar.appendChild(emptyElement);
    }

    botonperfil.addEventListener('click', () => {
        // Verificamos si la pantallaPerfil ya está oculta
        if (pantallaPerfil.classList.contains('oculto')) {
            // Si está oculta, la mostramos y ocultamos la otra
            pantallaCalendario.classList.add('oculto');
            pantallaPerfil.classList.remove('oculto');
        } else {
            // Si ya está visible, no hacemos nada (opcional: podrías agregar una animación o mensaje)
            console.log('Ya estás en la pantalla de perfil');
        }
    });

    botoncalendario.addEventListener('click', () => {
        // Verificamos si la pantallaPerfil ya está oculta
        if (pantallaCalendario.classList.contains('oculto')) {
            // Si está oculta, la mostramos y ocultamos la otra
            pantallaPerfil.classList.add('oculto');
            pantallaCalendario.classList.remove('oculto');
        } else {
            // Si ya está visible, no hacemos nada (opcional: podrías agregar una animación o mensaje)
            console.log('Ya estás en la pantalla de perfil');
        }
    });

// Crear los días del calendario
for (let day = 1; day <= daysInMonth; day++) {
    const dayElement = document.createElement("div");
    dayElement.className = "day";
    dayElement.textContent = day;

    dayElement.addEventListener("click", function() {
        // Generar la fecha seleccionada en formato YYYY-MM-DD
        const selectedDate = `2024-09-${day.toString().padStart(2, '0')}`;

        // Hacer la solicitud al servidor para obtener los eventos del día seleccionado
        fetch(`http://localhost:3000/eventos/${selectedDate}`)
            .then(response => response.json())
            .then(data => {
                // Mostrar los eventos en el DOM (aquí solo uso console.log para simplicidad)
                console.log(`Eventos para el día ${selectedDate}:`, data);
                
                // Si quieres mostrar los eventos en la página:
                const eventList = document.getElementById("event-list");
                eventList.innerHTML = '';  // Limpiar eventos previos
                
                if (data.length > 0) {
                    data.forEach(evento => {
                        const eventItem = document.createElement("li");
                        eventItem.textContent = `Evento: ${evento.titulo_evento}, Descripción: ${evento.descripcion_evento}`;
                        eventList.appendChild(eventItem);
                        if(evento.juego_evento === 'Digimon TCG'){
                            eventItem.style.backgroundImage = 'url(DigimonBG.jpg)'; // Cambio fondo a Digimon
                        } else if(evento.juego_evento === 'Dragon Ball TCG'){
                            eventItem.style.backgroundImage = 'url(DragonballBG.jpg)'; // ..., DragonBall
                        } else if(evento.juego_evento === 'Pokemon TCG'){
                            eventItem.style.backgroundImage = 'url(PokemonBG.jpg)'; // ..., Pokemon
                        } else if(evento.juego_evento === 'One Piece TCG'){
                            eventItem.style.backgroundImage = 'url(OnepieceBG.jpg)'; // ...y One Piece
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