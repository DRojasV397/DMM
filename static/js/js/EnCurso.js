import { getUserLocation } from "../ARCY-imports/getUserLocation.js"
import { rutaIti } from "../ARCY-imports/rutas.js"

import { crearMarcadorEnMapa, crearMarcadorPuntosCercanos, limpiarMarcadoresMapa, lugaresEncontradosEnBusqueda, obtenerCoordenadasPorPlaceId, obtenerUnLugarConId, updateHTML } from "../ARCY-imports/utilidadesMapa.js"

const API_URL = ' https://backend-dev-tfdp.4.us-1.fl0.io/api/lugarItinerario/obtenerLugaresItinerario';
const API_URL_STATEI = 'https://backend-dev-tfdp.4.us-1.fl0.io/api/lugarItinerario/editarEstadoLugarItinerario';

let mapa; 
let directionsService = new google.maps.DirectionsService();
let directionsRenderer = new google.maps.DirectionsRenderer();
  // Crear una solicitud de geocodificación
async function initMap() {
    try {
        const userLocation = await getUserLocation();

        const customStyles = [
            {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }]
            }
        ];

        mapa = new google.maps.Map(document.getElementById("map"), {
            center: userLocation,
            zoom: 12,
            styles: customStyles,
            mapTypeControl: false,
            streetViewControl: false, 
            fullscreenControl: false,
            zoomControl: true 
        });

        directionsRenderer.setMap(mapa);
    } catch (error) {
        console.error('Error al inicializar el mapa:', error);
    }
}


function getTime(originCoords, destCords, mode){
    let directionsService = new google.maps.DirectionsService();
    const request = {
      origin: originCoords,
      destination: destCords,
      travelMode: mode
    }
  
    return new Promise((resolve, reject) => {
      directionsService.route(request, function (response, status) {
        if (status === "OK") {
          const duration = response.routes[0].legs[0].duration.text;
          console.log("La duracion de" + "["+ originCoords.lat + ", " + originCoords.lng + "]" + " a ["+ destCords.lat + ", " + destCords.lng + "]" + " es " + duration);
          resolve(duration);
        } else {
          console.error('Error', status);
        }
      });
    });
  } 

// Función para obtener los lugares Itinerario del usuario
async function fetchItineraryPlaces(id_Itinerario) {
    console.log("fetchItineraryPlaces llamada con idItinerario:", id_Itinerario);
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_Itinerario })
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching LugarItinerario places:', error);
    }
}

async function fetchStateItinerary(IdLugarItinerario){
    console.log("fetchStateItinerary llamada con IdLugarItinerario:",IdLugarItinerario);
    try{
        const response =await fetch(API_URL_STATEI,{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({
                id_Lugar_Itinerario: IdLugarItinerario,
                Estado: 'V'})
        });
        if(!response.ok)throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    }catch(error){
        console.error('Error fetching LugarItinerario:', error);
    }
}

async function updateItineraryState(idItinerario) {
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
        console.error('Error updating itinerary state:', error);
    }
}

async function fetchStateOItinerary(IdLugarItinerario){
    console.log("fetchStateItinerary llamada con IdLugarItinerario:",IdLugarItinerario);
    try{
        const response =await fetch(API_URL_STATEI,{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({
                id_Lugar_Itinerario: IdLugarItinerario,
                Estado: 'O'})
        });
        if(!response.ok)throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    }catch(error){
        console.error('Error fetching LugarItinerario:', error);
    }
}

let miDato = document.cookie.split('; ').find(row => row.startsWith('miDato='));
miDato = miDato ? miDato.split('=')[1] : null;

console.log(miDato);

const MostrarValores = async () => {
    try {
        const lugaresItinerario = await fetchItineraryPlaces(miDato);
        console.log("Adventures info: ",lugaresItinerario)
        
        var i=0;
        while(i<=lugaresItinerario.length){
            let lugarInfoS;
        const lugarInicial = lugaresItinerario.find(lugar => lugar['Posición en itinerario'] === i);
        
 
        if (lugarInicial && lugarInicial['Estado Lugar']==='S') {

            document.getElementById('nombreAventura').textContent = lugarInicial.Itinerario;           

            const placeId = lugarInicial['ID lugar'];
            const lugarInfo = await getInfo(placeId);


            if(i<lugaresItinerario.length-1){
            const lugarSiguiente = lugaresItinerario.find(lugar => lugar['Posición en itinerario'] === i+1);
            const placeIdS = lugarSiguiente['ID lugar'];
            console.log(placeIdS);
            document.getElementById("btnLlegar").textContent = 'He Llegado';
            lugarInfoS = await getInfo(placeIdS);
            }
            else{
                document.getElementById("btnLlegar").textContent = 'Terminar';
            }
  
            const nombreLugarElement = document.getElementById('nombreLugar');
            nombreLugarElement.textContent = lugarInfo.name;
            nombreLugarElement.dataset.latitud = lugarInfo.coordinates.lat;
            nombreLugarElement.dataset.longitud = lugarInfo.coordinates.lng;
            
            const destinoCoords = {
                lat: lugarInfo.coordinates.lat,
                lng: lugarInfo.coordinates.lng
            };
            const travelMode = lugarInicial['Metodo de transporte'];
            if(i==0)
            {
                const NombreLugarOrigen = document.getElementById('nombreLugarOrigen');
                NombreLugarOrigen.textContent = "Tu Ubicacion"
                const coordenadasActualesOrigen = await getUserLocation();
                const duration = await getTime(coordenadasActualesOrigen, destinoCoords, travelMode);
                document.getElementById("length").textContent = duration;
                rutaIti(directionsService, directionsRenderer, coordenadasActualesOrigen, mapa, travelMode);
            }
            else{
                const lugarAnterior = lugaresItinerario.find(lugar => lugar['Posición en itinerario'] === i-1);
                const placeIdA = lugarAnterior['ID lugar'];
                const lugarInfoA = await getInfo(placeIdA);
                const nombreLugarElementA = document.getElementById('nombreLugarOrigen');
                nombreLugarElementA.textContent=lugarInfoA.name;
                nombreLugarElementA.dataset.latitud = lugarInfoA.coordinates.lat;
                nombreLugarElementA.dataset.longitud = lugarInfoA.coordinates.lng;
                console.log(lugarInfoA.name, lugarInfo.name);

                const coordenadasActuales = {
                    lat: lugarInfoA.coordinates.lat,
                    lng: lugarInfoA.coordinates.lng		
                    }; 
                    const duration = await getTime(coordenadasActuales, destinoCoords, travelMode);
                    document.getElementById("length").textContent = duration;
                    rutaIti(directionsService, directionsRenderer, coordenadasActuales, mapa, travelMode);
            }
            
            console.log(lugarInicial['Estado Lugar'], lugarInicial['ID']);
            await ShowDone(lugarInfo.name, lugarInicial['ID'], lugarInfoS && lugarInfoS.name, lugaresItinerario);
            i++;
        } else {
            i++;
        }
    }
    } catch (error) {
        console.error('Error en MostrarValores:', error);
    }
}

document.addEventListener('DOMContentLoaded', async function () {
    console.log("DOMContentLoaded, inicializando pantalla de itinerarios");
    initMap();
    MostrarValores();
    //eliminarCookie('miDato');
});

async function ShowDone(nombreLugar, IdLugarItinerario, nombreLugarSig, lugares){  
    return new Promise(async(resolve)=>{
    let Omitir=document.getElementById("btnOmitir");
    let Llegar=document.getElementById("btnLlegar");
    Omitir.addEventListener('click',function(){
        window.location.href="/pages/Aventuras_proximas.html";
        resolve();
    });

Llegar.addEventListener('click',function(){
    if(nombreLugar && nombreLugarSig){
    Swal.fire({
    title: `¿Haz llegado a ${nombreLugar} ?`,
    text: `¿Deseas continuar con el siguiente lugar: ${nombreLugarSig}?`,
    icon:"success",
    showCancelButton: true,
    confirmButtonColor: "#65B2C6",
    cancelButtonColor: "#D63D6C",
    confirmButtonText: "LLegar",
    cancelButtonText: "Omitir"
}).then(async(result) => {
    if (result.isConfirmed) {
        const LugarModifiedV = await fetchStateItinerary(IdLugarItinerario);
        console.log(LugarModifiedV);
        resolve();
    }
    else{
        Swal.fire({
            icon: "info",
            title: `¿Deseas omitir ${nombreLugar} de tu aventura?`, 
            text: `Esta accion omitira este lugar de la aventura y se continuara con ${nombreLugarSig}`,
            showCancelButton: true,
            confirmButtonColor: "#65B2C6",
            cancelButtonColor: "#D63D6C",
            confirmButtonText: "Omitir",
            cancelButtonText: "Cancelar"
        }).then(async(result)=>{
            if(result.isConfirmed){
                const LugarModified = await fetchStateOItinerary(IdLugarItinerario);
                console.log(LugarModified);
                resolve();
            }
        });
    }
});
}
else{
    Swal.fire({
        title: `¿Haz llegado a ${nombreLugar} ?`,
        text: `Este es el ultimo lugar de la aventura`,
        icon:"success",
        showCancelButton: true,
        confirmButtonColor: "#65B2C6",
        cancelButtonColor: "#D63D6C",
        confirmButtonText: "LLegar",
        cancelButtonText: "Omitir"
    }).then(async(result) => {
        if (result.isConfirmed) {
            const LugarModifiedV = await fetchStateItinerary(IdLugarItinerario);
            console.log(LugarModifiedV);
            resolve();
            //console.log("Adventures info: ",lugares)
            var i=0;
    
            console.log(lugares.length);
            
            const lugarDes = lugares.find(lugar => lugar['Posición en itinerario'] === 0);
            const lugarActualizados = await fetchItineraryPlaces(lugarDes['ID itinerario']);


            while(i<=lugares.length-1)
            {

                const lugarAct=lugarActualizados.find(lugar => lugar['Posición en itinerario'] === i);
                console.log("Hola soy: ", i);
                console.log(lugarAct['Estado Lugar']==='V');
                console.log(lugarAct['ID itinerario']);
                if(lugarAct['Estado Lugar']!=='S')
                {
                    if(i===lugarActualizados.length-1)
                    {
                        console.log(lugarAct['ID itinerario']);
                        const StateItinerary = await updateItineraryState(lugarAct['ID itinerario']);
                        console.log(StateItinerary);                       
                        break;
                    }
                }
                else{
                    console.log("Entrando al else");
                    break;
                }
                i++;
            }
            Swal.fire({
                icon: "success",
                title: `Tu Aventura "${lugarDes['Itinerario']}" ha llegado a su fin `, 
                showConfirmButton: true,
                confirmButtonColor: "#65B2C6",
            }).then((result)=>{
                window.location.href="/pages/Aventuras_proximas.html";
            });

            
        }
        else{
            Swal.fire({
                icon: "info",
                title: `¿Deseas omitir ${nombreLugar} de tu aventura?`, 
                text: `Este es el ultimo lugar de la aventura`,
                showCancelButton: true,
                confirmButtonColor: "#65B2C6",
                cancelButtonColor: "#D63D6C",
                confirmButtonText: "Omitir",
                cancelButtonText: "Cancelar"
            }).then(async(result)=>{
                if(result.isConfirmed){
                    const LugarModified = await fetchStateOItinerary(IdLugarItinerario);
                    console.log(LugarModified);
                    resolve();

                    var i=0;
    
                    console.log(lugares.length);
                    
                    const lugarDes = lugares.find(lugar => lugar['Posición en itinerario'] === 0);
                    const lugarActualizados = await fetchItineraryPlaces(lugarDes['ID itinerario']);
                    while(i<=lugares.length-1)
                    {
        
                        const lugarAct=lugarActualizados.find(lugar => lugar['Posición en itinerario'] === i);
                        console.log("Hola soy: ", i);
                        console.log(lugarAct['ID itinerario']);
                        if(lugarAct['Estado Lugar']!=='S')
                        {
                            if(i===lugarActualizados.length-1)
                            {
                                console.log(lugarAct['ID itinerario']);
                                const StateItinerary = await updateItineraryState(lugarAct['ID itinerario']);
                                console.log(StateItinerary);                       
                                
                                break;
                            }
                        }
                        i++;
                    }
                    Swal.fire({
                        icon: "success",
                        title: `Tu Aventura "${lugarDes['Itinerario']}" ha llegado a su fin `, 
                        showConfirmButton: true,
                        confirmButtonColor: "#65B2C6",
                    }).then((result)=>{
                        window.location.href="/pages/Aventuras_proximas.html";
                    });
                }
            });
        }
    });
}
});
});
}



function eliminarCookie(cookieName) {
    document.cookie = cookieName + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
}

function getInfo(placeID) {
    return new Promise((resolve, reject) => {
        const request = {
            placeId: placeID,
            fields: ["name", "geometry"]
        };
        const div = document.getElementById('auxPlaces');
        const service = new google.maps.places.PlacesService(div);

        service.getDetails(request, (place, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                const placeInfo = {
                    name: place.name,
                    coordinates: {
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng()
                    }
                };
                
                resolve(placeInfo);
            } else {
                reject("Error al obtener detalles del lugar: " + status);
            }
        });
    });
}
