console.log("iniciandodespli");


// Define la URL de la API para obtener lugares favoritos
const API_URL = 'https://backend-dev-tfdp.4.us-1.fl0.io/api/lugarFavorito/obtenerLugaresFavoritos';

// Función para obtener los lugares favoritos del usuario
async function fetchFavoritePlaces(idTurista) {
    console.log("fetchFavoritePlaces llamada con idTurista:", idTurista);
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idTurista })
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching favorite places:', error);
    }
}

// Función para obtener la información de un lugar sin utilizar el mapa
function getInfo(place) {
    console.log("getInfo llamada con place:", place);
    return new Promise((resolve, reject) => {
      const request = {
        placeId: place,
        fields: ["place_id", "name", "formatted_address", "rating", "opening_hours", "formatted_phone_number", "website", "reviews", "photos", "type"],
      };
  
      // Crear un elemento div que no está adjunto al DOM para el servicio Places
      const service = new google.maps.places.PlacesService(document.createElement('div'));
      service.getDetails(request, async (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          const imgWidth = 1000;
          const imgHeight = 1000;
  
          const placeInfo = {
            name: place.name,
            type: place.types,
            placeID: place.place_id,
            address: place.formatted_address,
            rating: place.rating,
            opening_hours: place.opening_hours ? place.opening_hours.weekday_text : null, // Ajuste para opening_hours
            phone_number: place.formatted_phone_number,
            website: place.website,
          };
  
          if (place.reviews) {
            placeInfo.reviews = place.reviews.length > 0 ? place.reviews : null;
          } else {
            placeInfo.reviews = null;
          }
  
          if (place.photos && place.photos.length > 0) {
            const photoUrls = place.photos.map((photo) => {
              return photo.getUrl({ maxWidth: imgWidth, maxHeight: imgHeight });
            });
            placeInfo.photoUrls = photoUrls;
          } else {
            placeInfo.photoUrls = null;
          }
          resolve(JSON.stringify(placeInfo, null, 2));
        } else {
          reject("Error al obtener detalles del lugar");
        }
      });
    });
  }
  

  function createFavoriteCard(placeInfo) {
    // Parse JSON if necessary
    if (typeof placeInfo === 'string') {
        try {
            placeInfo = JSON.parse(placeInfo);
        } catch (error) {
            console.error('Error parsing placeInfo:', error);
            return '';
        }
    }

    // Check for valid object
    if (!placeInfo || typeof placeInfo !== 'object') {
        console.error('placeInfo is not a valid object:', placeInfo);
        return '';
    }

    // Check and round rating
    const rating = typeof placeInfo.rating === 'number' ? Math.round(placeInfo.rating * 2) / 2 : 0;
    const starsHtml = generateStars(rating);

    // Generar el HTML para los detalles del horario de manera dinámica.
    let horariosDetallesHtml = placeInfo.opening_hours ? placeInfo.opening_hours.map((dayHours, index) => {
      // Asume que dayHours sigue el formato "Día de la semana: Horario", p.ej. "Lunes: 9:00 AM - 5:00 PM"
      let dayName = dayHours.split(':')[0].toLowerCase(); // Esto tomará "Lunes" y lo convertirá en "lunes"
      return `<div class="${dayName}" id="${dayName}">${dayHours}</div>`;
  }).join('') : '<div>Horario no especificado</div>';

  // El HTML para la sección de detalles de horario.
  const horarioHtml = `
      <div class="horario-detalles">
          <div class="horario-text" id="horario-text">${placeInfo.opening_hours ? 'Abierto hasta las 10:00 p.m.' : 'Horario no disponible'}</div>
          <!-- Arreglo que muestra detalles del horario de apertura del lugar -->
          <div class="weekend-text" style="display: none;">
              ${horariosDetallesHtml}
          </div>
      </div>
  `;
  
    // HTML generation adjusted to your div structure
    const card = `
    <div class="favorite-card">
    <div class="body-details">
    <div class="img-referente" id="img-referente" style="align-items: center;">
    <img src="${placeInfo.photoUrls ? placeInfo.photoUrls[0] : '/public/assets/icons/Lugarejemplo.PNG'}" 
     width="64px" 
     height="64px"
     style="margin: 0px 4px; 
            border-radius: 10px;
            border: 1px solid #ccc"
    > 
            <div class="place-info">
            <div class="info-add">
                <img src="/public/assets/icons/promocionNegroIcon.png" width="15px" height="15px" style="margin:0px 4px;">
                <div class="info-name" id="info-name" data-placeid="${placeInfo.placeID}">${placeInfo.name || 'Nombre no especificado'}</div>
            </div>
        </div>
        </div>
            <div class="details-score">
                <div id="stars-container">
                    ${starsHtml}
                </div>
                <div class="score-number" id="score-number">${rating}/5</div>
            </div>
            <div class="details-domicilio">
                <img src="/public/assets/icons/ubicacionIcon.png" width="15px" height="15px" style="margin:0px 4px;">
                <div class="domicilio-text" id="details-domicilio">${placeInfo.address}</div>
            </div>
            <div class="details-horario">
                <img src="/public/assets/icons/reloj2.png" width="15px" height="15px" style="margin:0px 4px;">
                ${horarioHtml}
            </div>
            <div class="details-phone">
                <img src="/public/assets/icons/telefonoIcon.png" width="15px" height="15px" style="margin:0px 4px;">
                <div class="phone-text" id="phone-text">${placeInfo.phone || 'No posee'}</div>
            </div>
            <div class="details-site">
                <img src="/public/assets/icons/sitioIcono.png" width="15px" height="15px" style="margin:0px 4px;">
                <div class="site-text" id="site-text">${placeInfo.website || 'Sin sitio web'}</div>
            </div>
        </div>
        <div class="body-button-right"  style="margin-left: 15px;">
          <div class="ckeck-icon" style="align-items: flex;">
            <img src="/public/assets/icons/origenIcon.png" id= "agreIti" width="40px" height="40px" style="margin:0px 4px;">
          </div>
        </div>
        <div class="body-button-right" style="margin-left: 15px;">
            <div class="favorite-icon" style="align-items: center;">
                <img src="/public/assets/icons/eliminarIcon.png" id="tuBotonEliminar" width="35px" height="35px" style="margin:0px 4px;">
            </div>
        </div>
    </div>
    `;

    return card;
}

function generateStars(rating) {
    let starsHtml = '';
    for (let i = 0; i < 5; i++) {
        starsHtml += `<span class="star" style="color: gold;">${i < rating ? '&#9733;' : '&#9734;'}</span>`;
    }
    return starsHtml;
}


async function displayFavorites() {

        setTimeout(async () => {
      
          const nombreUsuario = document.getElementById("nombreUsuario");
          const idTurista = nombreUsuario.getAttribute('data-id-turista');
          
          const favoritePlaces = await fetchFavoritePlaces(idTurista);
          const favoritesContainer = document.getElementById('favodes');
  
  if (favoritePlaces && favoritePlaces.length > 0) {
    favoritesContainer.innerHTML = ''; // Limpiar el contenedor antes de añadir nuevas tarjetas
    for (const place of favoritePlaces) {
        const placeInfo = await getInfo(place["ID LUGAR"]);
        const favoriteCardHtml = createFavoriteCard(placeInfo);
        favoritesContainer.innerHTML += favoriteCardHtml;
      }
  } else {
    favoritesContainer.innerHTML = `
      <div class="no-favorites-message">
        <p>No hay lugares favoritos agregados aún.</p>
        <button onclick="location.href='/pages/inicio.html'">Ir a agregar</button>
      </div>
    `;
  }
          
        }, 100); 
      
}





document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('favodes'); // Asegúrate de usar el ID real de tu contenedor

  container.addEventListener('click', function(event) {
      if (event.target.id === 'tuBotonEliminar') {
          const idTurista = document.getElementById("nombreUsuario").getAttribute('data-id-turista');
          const idLugar = event.target.closest('.favorite-card').querySelector('.info-name').getAttribute('data-placeid');

          
          Swal.fire({
              title: "¿Estás seguro?",
              text: "Esta acción borrará este lugar de Favoritos",
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#65B2C6",
              cancelButtonColor: "#D63D6C",
              confirmButtonText: "Estoy seguro",
              cancelButtonText: "Regresar"
          }).then((result) => {
              if (result.isConfirmed) {
                 
                  removeFavorite(idLugar, idTurista);
              }
          });
      }

      if (event.target.id === 'agreIti') {
          const idLugar = event.target.closest('.favorite-card').querySelector('.info-name').getAttribute('data-placeid');
          window.location.href = `/pages/inicio.html?placeId=${idLugar}`;
      }
  });
});




function removeFavorite(idLugar, idTurista) {
  fetch('https://backend-dev-tfdp.4.us-1.fl0.io/api/lugarFavorito/eliminarLugarFavorito', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
          id_Lugar: idLugar,
          id_Turista: idTurista
      })
  })
  .then(response => response.json())
  .then(data => {
      console.log('Lugar eliminado de favoritos:', data);

      Swal.fire({
          title: "¡Eliminado!",
          text: "El lugar ha sido borrado de Favoritos",
          icon: "success"
      }).then(() => {
          window.location.reload();
      });
  })
  .catch(error => {
      console.error('Error al eliminar lugar de favoritos:', error);
  });
}


// Inicializar la pantalla de favoritos cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded, inicializando pantalla de favoritos");
    displayFavorites();
  });