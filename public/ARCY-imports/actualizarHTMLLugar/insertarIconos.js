export const insertarIconos = () => {
  document.getElementById("card").style.display = "flex";
  document.getElementById('favorito').src = '/public/assets/icons/favoritosIcon.png';
  document.getElementById('favorito1').src = '/public/assets/icons/favoritosIcon.png';
  document.getElementById('flecha').src = '/public/assets/icons/flechaBackAzul.png';
  document.getElementById('itinerario').src = '/public/assets/icons/agregarItinIconV2.png';
  document.getElementById('check').src = '/public/assets/icons/checked.png';
  document.querySelector('.visitado').style.display = 'none';
  document.querySelector('.img-referente1').style.alignSelf = 'auto';
}