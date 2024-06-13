export const insertarIconos = () => {
  document.getElementById("card").style.display = "flex";
  document.getElementById('favorito').src = '/static/assets/icons/favoritosIcon.png';
  document.getElementById('favorito1').src = '/static/assets/icons/favoritosIcon.png';
  document.getElementById('flecha').src = '/static/assets/icons/flechaBackAzul.png';
  document.getElementById('itinerario').src = '/static/assets/icons/agregarItinIconV2.png';
  document.getElementById('check').src = '/static/assets/icons/checked.png';
  document.querySelector('.visitado').style.display = 'none';
  document.querySelector('.img-referente1').style.alignSelf = 'auto';
}