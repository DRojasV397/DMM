// Verificar carga del JS
console.log('connect_login.js cargado')

document.addEventListener('DOMContentLoaded', async function () {
  console.log('DOM Cargado')

  const loginForm = document.getElementById('loginForm')

  if (loginForm) {
    loginForm.addEventListener('submit', async function (event) {
      event.preventDefault()

      // Obtener datos de formulario
      const email = document.getElementById('email').value
      const password = document.getElementById('password').value

      // Checar objeto a enviar
      const data = new URLSearchParams({
        Correo: email,
        Contrasena: password
      })

      console.log('Data a enviar:', data)

      try {
        console.log('Realizando la petición...')

        // Petición asíncrona con await
        const response = await fetch('https://backend-dev-tfdp.4.us-1.fl0.io/api/authenticator/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        })

        console.log('Respuesta del servidor recibida')

        // Verificar si la respuesta tiene el formato JSON
        if (response.ok) {
          // Esperar respuesta JSON
          const json = await response.json()
          console.log('Respuesta JSON recibida:', json)

          // Redireccionar si cuenta activa
          if (json.Estado_cuenta === 'Y') {
            console.log('Cuenta activa. Redireccionando...')
            window.location.href = 'inicio.html'
          } else {
            console.log('Credenciales inválidas. Mostrando alerta...')
            alert('Credenciales inválidas')
          }
        } else {
          console.error('Error en la respuesta del servidor. Código:', response.status)
        }
      } catch (error) {
        console.error('Error detectado:', error)
      }
    })
  } else {
    console.error('El formulario no se encontró. Verifica la existencia del elemento con id "loginForm".')
  }
})
