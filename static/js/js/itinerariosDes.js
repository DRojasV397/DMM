const API_URL = 'https://backend-dev-tfdp.4.us-1.fl0.io/api/itinerario/obtenerItinerarios';

// Función para obtener los lugares favoritos del usuario
async function fetchItineraryPlaces(id_Turista) {
    console.log("fetchItineraryPlaces llamada con idTurista:", id_Turista);
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_Turista })
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching favorite places:', error);
    }
}

// Función para mostrar los lugares favoritos
// Función modificada para mostrar los lugares favoritos
async function displayFavorites() {
    setTimeout(async () => {
        const nombreUsuario = document.getElementById("nombreUsuario");
        const idTurista = nombreUsuario.getAttribute('data-id-turista');

        const itinerarios = await fetchItineraryPlaces(idTurista);
        const itinerariesContainer = document.getElementById('containerItinerarios');

        if (itinerarios && itinerarios.length > 0) {
            itinerariesContainer.innerHTML = ''; // Limpiar el contenedor

            // Usar forEach para obtener tanto el itinerario como su índice
            itinerarios.forEach(async (itinerario, index) => {
                const zeroItinerario = await fetchFirstPlaceOfItinerary(itinerario.ID);

                // Verifica si el itinerario está vacío
                if (!zeroItinerario || Object.keys(zeroItinerario).length === 0) {
                    console.log(`Itinerario vacío encontrado con ID: ${itinerario.ID}`);
                    const emptyItineraryCard = createEmptyItineraryCard(itinerario);
                    itinerariesContainer.innerHTML += emptyItineraryCard;
                    return;
                }

                var idPlace = zeroItinerario['ID lugar'];
                console.log(idPlace);

                // Obtener información del lugar utilizando el ID del lugar
                try {
                    const placeInfo = await getInfo(idPlace);
                    const itineraryCard = createItineraryCard(itinerario, index, placeInfo.name, placeInfo.photoUrls); // Pasar el nombre del lugar
                    itinerariesContainer.innerHTML += itineraryCard; // Agregar la tarjeta al contenedor
                } catch (error) {
                    console.error('Error obteniendo información del lugar:', error);
                }
            });
        } else {
            itinerariesContainer.innerHTML = `
            <div class="no-favorites-message">
              <p>No hay lugares favoritos agregados aún.</p>
              <button onclick="location.href='/pages/inicio.html'">Ir a agregar</button>
            </div>
          `;
        }
    }, 100);
}



// Función para crear una tarjeta de itinerario
function createItineraryCard(itinerario, index, placeName, photoUrls) {
    let backgroundColor;
    let dynamicButtonHTML = '';
    let editButtonHTML = `<a onclick="crearCookieYedit(${index})" class="cardButton continue">Editar</a>`;
    let finishButtonHTML = `<a href="#" onclick="finalizeItinerary(${index})" class="cardButton finish">Finalizar</a>`;
    let deleteButtonHTML = getDeleteButtonHTML(itinerario.ID);

    switch (itinerario.Estado) {
        case 'F':
            backgroundColor = '#FFB49C'; // Rojo para finalizados
            editButtonHTML = `<a onclick="crearCookieYedit(${index})" class="cardButton continue flex-center">Ver</a>`; // Cambiar texto a "Ver"
            finishButtonHTML = ''; // No mostrar botón de finalizar
            break;
        case 'C':
            backgroundColor = '#C4DCAB'; // Verde para en curso
            dynamicButtonHTML = `<a onclick="crearCookieYRedirigir(${index}, 'Continuar')" id="dynamicButton-${index}" class="DinamicButton">Continuar</a>`;
            break;
        case 'N':
            backgroundColor = '#FFDF8F'; // Amarillo para nuevos
            dynamicButtonHTML = `<a onclick="crearCookieYRedirigir(${index}, 'Comenzar')" id="dynamicButton-${index}" class="DinamicButton">Comenzar</a>`;
            break;
        default:
            backgroundColor = '#FFFFFF'; // Color por defecto
    }

    const fechaFormateada = new Date(itinerario.fecha_creacion).toLocaleDateString();

    // Construir elementos de imagen HTML para cada URL de foto
    let imagesHTML = '';
    const imageStyle = 'object-fit: cover; object-position: center;';
    if (photoUrls && photoUrls.length > 0) {
        // Usar la primera imagen como la imagen grande
        imagesHTML += `<img src="${photoUrls[0]}" alt="Imagen del lugar" class="cardImageLarge" style="${imageStyle}">`;

        // Usar las imágenes restantes como imágenes pequeñas
        imagesHTML += '<div class="cardImagesSmall">';
        for (let i = 1; i < photoUrls.length && i <= 2; i++) { // Limitar a 2 imágenes pequeñas
            imagesHTML += `<img src="${photoUrls[i]}" alt="Imagen del lugar ${i}" class="cardImageSmall" style="${imageStyle}">`;
        }
        imagesHTML += '</div>';
        // Usar las imágenes restantes como imágenes pequeñas 2
        imagesHTML += '<div class="cardImagesSmall2">';
        for (let i = 1; i < photoUrls.length && i <= 2; i++) { // Limitar a 2 imágenes pequeñas
            imagesHTML += `<img src="${photoUrls[i]}" alt="Imagen del lugar ${i}" class="cardImageSmall" style="${imageStyle}">`;
        }
        imagesHTML += '</div>';
    } else {
        // Si no hay URLs de fotos, usa una imagen predeterminada
        imagesHTML = `
            <img src="/public/assets/icons/sin_foto.png" alt="Imagen grande" class="cardImageLarge">
            <div class="cardImagesSmall">
                <img src="/public/assets/icons/sin_foto.png" alt="Imagen pequeña 1" class="cardImageSmall">
                <img src="/public/assets/icons/sin_foto.png" alt="Imagen pequeña 2" class="cardImageSmall">
            </div>
            <div class="cardImagesSmall2">
                <img src="/public/assets/icons/sin_foto.png" alt="Imagen pequeña 3" class="cardImageSmall">
                <img src="/public/assets/icons/sin_foto.png" alt="Imagen pequeña 4" class="cardImageSmall">
            </div>
        `;
    }



    // Construcción del HTML de la tarjeta
    return `
    <div class="cardsAP" style="background-color: ${backgroundColor};">
        <div class="HeaderComplete">
            ${deleteButtonHTML}
            <div class="cardHeader">
                <span id="NombreItinerario-${index}" class="cardName" dataset-NomItim="${itinerario.ID}"><span class="boldTextUbication">${itinerario.Nombre}</span></span>

                <span class="cardDate">Creación: <span class="boldTextUbication">${fechaFormateada}</span></span>
                <div style="display: flex; align-items: center;">
                    <img src="/public/assets/icons/ubicacionIcon.png" alt="Ubicación" class="cardLocationIcon">
                    <span class="cardLocation">Inicio: <span class="boldTextUbication">${placeName || 'Ubicación'}</span></span>
                </div>
            </div>
            <div class="contDinamic">
                ${dynamicButtonHTML}
            </div>
        </div>
        <div class="cardMain">
            <div class="cardImages">
                ${imagesHTML}
            </div>
            <div class="cardButtons">
                ${editButtonHTML}
                ${finishButtonHTML}
            </div>
        </div>
    </div>
    `;
}





// Evento al cargar el documento
document.addEventListener('DOMContentLoaded', async function () {
    console.log("DOMContentLoaded, inicializando pantalla de itinerarios");
    displayFavorites();
});

// Función para crear una cookie y redirigir (Boton editar)

async function crearCookieYRedirigir(index, buttonText) {
    const NomItim = document.getElementById(`NombreItinerario-${index}`);
    const ItID = NomItim.getAttribute("dataset-NomItim");

    if (buttonText === 'Comenzar') {
        await updateItineraryState(ItID);
    }

    // Continuar con la redirección
    document.cookie = "miDato=" + ItID + ";path=/";
    console.log("El Id itinerario es:", ItID);
    window.location.href = '/pages/AventuraEnCurso.html';
}

// Función para crear una cookie y editar
function crearCookieYedit(index) {
    const NomItim = document.getElementById(`NombreItinerario-${index}`);
    const ItID = NomItim.getAttribute("dataset-NomItim");
    document.cookie = "miDato=" + ItID + ";path=/";
    console.log("El Id itinerario es:", ItID);
    window.location.href = '/pages/editarAventura.html';
}

// Función para actualizar el estado del itinerario
async function updateItineraryState(idItinerario) {
    try {
        const response = await fetch('https://backend-dev-tfdp.4.us-1.fl0.io/api/itinerario/editarEstadoItinerario', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_Itinerario: idItinerario, Estado: 'C' })
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        console.log(data.message);
    } catch (error) {
        console.error('Error updating itinerary state:', error);
    }
}

async function finalizeItineraryState(idItinerario) {
    try {
        const response = await fetch('https://backend-dev-tfdp.4.us-1.fl0.io/api/itinerario/editarEstadoItinerario', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_Itinerario: idItinerario, Estado: 'F' })
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        console.log(data.message);
    } catch (error) {
        console.error('Error finalizing itinerary state:', error);
    }
}


async function finalizeItinerary(index) {
    const NomItim = document.getElementById(`NombreItinerario-${index}`);
    const ItID = NomItim.getAttribute("dataset-NomItim");
    await finalizeItineraryState(ItID);
    // Aquí puedes agregar cualquier lógica adicional después de finalizar el itinerario
    displayFavorites();
}


async function deleteItinerary(idItinerario) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "¡No podrás revertir esto!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'No, cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            // El usuario confirmó la eliminación
            performDeletion(idItinerario);
        }
    });
}

async function performDeletion(idItinerario) {
    try {
        const response = await fetch('https://backend-dev-tfdp.4.us-1.fl0.io/api/itinerario/eliminarItinerario', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_Itinerario: idItinerario })
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        console.log(data.message);

        // Mostrar mensaje de éxito
        Swal.fire(
            'Eliminado!',
            'El itinerario ha sido eliminado.',
            'success'
        );

        // Recargar los itinerarios después de la eliminación
        displayFavorites();
    } catch (error) {
        console.error('Error deleting itinerary:', error);
        Swal.fire(
            'Error',
            'Hubo un problema al eliminar el itinerario.',
            'error'
        );
    }
}


async function fetchFirstPlaceOfItinerary(idItinerario) {
    try {
        const response = await fetch('https://backend-dev-tfdp.4.us-1.fl0.io/api/lugarItinerario/obtenerLugaresItinerario', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_Itinerario: idItinerario })
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const lugares = await response.json();
        return lugares.find(lugar => lugar['Posición en itinerario'] === 0);
    } catch (error) {
        console.error('Error fetching first place of itinerary:', error);
    }
}



function getInfo(place) {
    console.log("getInfo llamada con place:", place);
    return new Promise((resolve, reject) => {
        const request = {
            placeId: place,
            fields: ["place_id", "name", "photos"],
        };

        // Crear un elemento div que no está adjunto al DOM para el servicio Places
        const service = new google.maps.places.PlacesService(document.createElement('div'));
        service.getDetails(request, async (place, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                const imgWidth = 1000;
                const imgHeight = 1000;

                const placeInfo = {
                    name: place.name,
                    placeID: place.place_id,
                };

                console.log("Nombre del lugar:", placeInfo.name);

                // Agregando URLs de fotos si están disponibles
                if (place.photos && place.photos.length > 0) {
                    const photoUrls = place.photos.map((photo) => {
                        return photo.getUrl({ maxWidth: imgWidth, maxHeight: imgHeight });
                    });
                    placeInfo.photoUrls = photoUrls;
                    console.log("URLs de fotos:", photoUrls);
                    placeInfo.photoUrls = photoUrls;
                } else {
                    placeInfo.photoUrls = null;
                }

                // Devolver el objeto con el nombre del lugar y las URLs de las fotos
                resolve(placeInfo);
            } else {
                reject("Error al obtener detalles del lugar");
            }
        });
    });
}

function createEmptyItineraryCard(itinerario) {
    let deleteButtonHTML = getDeleteButtonHTML(itinerario.ID);
    // Aquí puedes personalizar el aspecto de la tarjeta para un itinerario vacío
    return `
    <div class="cardsAP" style="background-color: #C0CBCD; border: 1px solid black;">
        <div class="cardHeader">
            ${deleteButtonHTML}
            <span class="cardName">${itinerario.Nombre}</span>
            <span class="cardDate">Creación: ${new Date(itinerario.fecha_creacion).toLocaleDateString()}</span>
        </div>
        <div class="cardMain">
            <div class="boldTextUbication ">Este itinerario está vacío.</div>
        </div>
    </div>
    `;
}

function getDeleteButtonHTML(idItinerario) {
    return `<img src="/public/assets/icons/eliminarIcon.png" alt="Eliminar" class="deleteIcon" onclick="deleteItinerary('${idItinerario}')">`;
}