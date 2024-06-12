document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('passwordRecover');
  const password = document.getElementById('password');
  const passwordRE = document.getElementById('passwordRE');
  const valorToken = obtenerValorCookie("rct");

  form.addEventListener('submit', async function (event) {
      event.preventDefault();

      if (validateForm()) {
          try {
              const response = await fetch('https://backend-dev-tfdp.4.us-1.fl0.io/api/authenticator/establecerNuevaContrasena', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                      Contrasena: password.value,
                      Token: valorToken
                  })
              });

              if (!response.ok) {
                  throw new Error('La respuesta de la API no fue exitosa.');
              }

              const resultado = await response.json();

              // Elimina la cookie almacenada con el propósito de recuperar contraseña
              document.cookie = 'rct=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';

              if (resultado.redirect) {
                  showSuccessAlert('Se cambió la contraseña correctamente.');
              } else {
                  showErrorAlert('Hubo un problema al cambiar la contraseña.');
              }
          } catch (error) {
              showErrorAlert(error.message);
          }
      }
  });

  function validateForm() {
      if (password.value.trim() === '') {
          showAlert('La nueva contraseña no ha sido llenada');
          highlightInvalidField(password);
          return false;
      } else {
          removeHighlight(password);
      }

      if (passwordRE.value.trim() === '') {
          showAlert('Confirma tu contraseña');
          highlightInvalidField(passwordRE);
          return false;
      } else {
          removeHighlight(passwordRE);
      }

      if (password.value !== passwordRE.value) {
          showAlert('Las contraseñas no coinciden.');
          highlightInvalidField(password);
          highlightInvalidField(passwordRE);
          return false;
      }

      return true;
  }

  function obtenerValorCookie(name) {
      var nameEQ = name + "="; 
      var ca = document.cookie.split(';');
      for(var i=0; i < ca.length; i++) {
          var c = ca[i];
          while (c.charAt(0)==' ') c = c.substring(1,c.length);
          if (c.indexOf(nameEQ) == 0) {
              return decodeURIComponent(c.substring(nameEQ.length,c.length));
          }
      }
      return null;
  }

  function showAlert(message) {
      Swal.fire({
          icon: 'error',
          title: 'Error',
          text: message,
      });
  }

  function showSuccessAlert(message) {
      Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: message,
          showCancelButton: false,
          confirmButtonText: 'Iniciar Sesión',
      }).then((result) => {
          if (result.isConfirmed) {
              window.location.href = '/';
          }
      });
  }

  function showErrorAlert(message) {
      Swal.fire({
          icon: 'error',
          title: 'Error',
          text: message,
      });
  }

  function highlightInvalidField(field) {
      field.style.borderColor = 'red';
  }

  function removeHighlight(field) {
      field.style.borderColor = ''; // Reset to default
  }
});
