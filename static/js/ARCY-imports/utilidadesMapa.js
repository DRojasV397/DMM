import { actualizarCalificacion } from "./actualizarHTMLLugar/calificacion.js";
import { actualizarDireccion } from "./actualizarHTMLLugar/direccion.js";
import { actualizarEstado } from "./actualizarHTMLLugar/estado.js";
import { actualizarFotos } from "./actualizarHTMLLugar/fotos.js";
import { actualizarHorario, cerrarHorario } from "./actualizarHTMLLugar/horario.js";
import { actualizarHorarioApertura } from "./actualizarHTMLLugar/horarioApertura.js";
import { insertarIconos } from "./actualizarHTMLLugar/insertarIconos.js";
import { actualizarCoordenadas, actualizarNombreYUbicacion } from "./actualizarHTMLLugar/metadatos.js";
import { actualizarResena } from "./actualizarHTMLLugar/reseñas.js";
import { actualizarSitioWeb } from "./actualizarHTMLLugar/sitioWeb.js";
import { actualizarTelefono } from "./actualizarHTMLLugar/telefono.js";
import { actualizarTipoLugar } from "./actualizarHTMLLugar/tipoLugar.js";
import { comprobarSiLugarEsFavorito } from "./lugarFavorito.js";
import { comprobarSiLugarEstaVisitado } from "./lugarVisitado.js";

export const crearMarcadorEnMapa = (coordenadas) => {
  let marcador = new google.maps.Marker({
    position: coordenadas,
    title: 'Ubicación del turista',
    icon: {
      url: "../../../static/assets/icons/locUserMarker.png",
      scaledSize: new google.maps.Size(32,32)
    }
  });

  return marcador;
}

export const crearMarcadorPuntosCercanos = (lugar, mapa) => {
  // Crear un marcador en el mapa
  const marcador = new google.maps.Marker({
    map: mapa,
    position: lugar.geometry.location,
    title: lugar.name,
    icon: {
      url: lugar.icon || null,
      scaledSize: new google.maps.Size(20, 20),
    }
  });

  google.maps.event.addListener(marcador, 'click',function() {
    // Obtener información detallada del lugar y mostrar en la consola
    getInfo(lugar, mapa)
      .then((info) => updateHTML(info))
      .catch((error) => console.error(error))
  });

  return marcador;
}

export const limpiarMarcadoresMapa = (marcadores) => {
  marcadores.forEach((marker) => {
    marker.setMap(null);
  });

  return []
}

export const lugaresEncontradosEnBusqueda = (lugares, marcadores, mapa) => {
  const bounds = new google.maps.LatLngBounds();
  let Lugar

  lugares.forEach((lugar) => {
    if (!lugar.geometry || !lugar.geometry.location) {
      console.log("Returned lugar contains no geometry");
      return;
    }

    const icon = {
      url: null, //Para poner el marcador con forma alusiva al tipo de lugar
      size: new google.maps.Size(71, 71),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(17, 34),
      scaledSize: new google.maps.Size(25, 25),
    };

    // Create a marker for each lugar.
    marcadores.push(
      new google.maps.Marker({
        map: mapa,
        icon,
        title: lugar.name,
        position: lugar.geometry.location,
      }),
    );
    
    if (lugar.geometry.viewport) {
      // Only geocodes have viewport.
      bounds.union(lugar.geometry.viewport);
      Lugar = lugar;
    } else {
      bounds.extend(lugar.geometry.location);
    }
  });

  mapa.fitBounds(bounds);
  return Lugar
}

export const obtenerCoordenadasPorPlaceId = (placeId) => {
  const geocoder = new google.maps.Geocoder();
  // Crear una solicitud de geocodificación
  var request = {
    placeId: placeId,
  };

  return new Promise((resolve, reject) => {
    geocoder.geocode(request, function (results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        // Obtener las coordenadas del primer resultado
        var coordenadas = {
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng(),
        };
        resolve(coordenadas);
      } else {
        console.error('Error al obtener coordenadas:', status);
      }
    });
  })
}

export const obtenerUnLugarConId = (placeId) => {
  const geocoder = new google.maps.Geocoder();
  // Crear una solicitud de geocodificación
  var request = {
    placeId: placeId,
  };

  return new Promise((resolve, reject) => {
    geocoder.geocode(request, function (results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        resolve(results[0]);
      } else {
        console.error('Error al obtener coordenadas:', status);
      }
    });
  })
}

export const getInfo = (place, mapa) => {
  return new Promise((resolve, reject) => {
    const request = {
      placeId: place.place_id,
      fields: ["place_id", "name", "formatted_address", "rating", "opening_hours", "formatted_phone_number", "website", "reviews", "photos", "type", "geometry"],
    };

    const service = new google.maps.places.PlacesService(mapa);
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
          opening_hours: place.opening_hours,
          phone_number: place.formatted_phone_number,
          website: place.website,
          geometry: place.geometry
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
        resolve(placeInfo);
      } else {
        reject("Error al obtener detalles del lugar");
      }
    });
  });
}

export const updateHTML = (placeInfo) => {
  actualizarCoordenadas(placeInfo)
  actualizarNombreYUbicacion(placeInfo)

  insertarIconos()
  
  actualizarFotos(placeInfo)
  actualizarResena(placeInfo)
  actualizarCalificacion(placeInfo)
  actualizarDireccion(placeInfo)
  actualizarTelefono(placeInfo)  
  actualizarSitioWeb(placeInfo)
  actualizarEstado(placeInfo)
  actualizarHorario(placeInfo)
  actualizarTipoLugar(placeInfo)
  actualizarHorarioApertura(placeInfo)
  
  cerrarHorario()

  comprobarSiLugarEsFavorito(placeInfo.placeID)
  comprobarSiLugarEstaVisitado(placeInfo.placeID)
}
