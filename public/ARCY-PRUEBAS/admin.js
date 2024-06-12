document.addEventListener('DOMContentLoaded', async function () {

  const valorToken = obtenerValorCookie("jwt")

  const res = await fetch('https://backend-dev-tfdp.4.us-1.fl0.io/api/authenticator/usuarioLogueado', {
  method: 'POST',
  headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ token: valorToken })
  });

  const usuario = await res.json();

  const nombreUsuario = document.getElementById("nombreUsuario")
  nombreUsuario.innerHTML = usuario.Nombre  
  nombreUsuario.dataset.idTurista = usuario.id
})


function obtenerValorCookie(name) {

  var nameEQ = name + "="; 
  var ca = document.cookie.split(';');

  for(var i=0;i < ca.length;i++) {

    var c = ca[i];
    while (c.charAt(0)==' ') c = c.substring(1,c.length);
    if (c.indexOf(nameEQ) == 0) {
      return decodeURIComponent( c.substring(nameEQ.length,c.length) );
    }
  }

  return null;

}


document.addEventListener('DOMContentLoaded', async function () {
  document.getElementById('cerrarSesion').addEventListener('click', async (e) => {
    e.preventDefault()

    document.cookie = 'jwt=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'

    window.location.href = "/"
  })
})