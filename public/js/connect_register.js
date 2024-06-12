document.getElementById('loginFormRegister').addEventListener('submit', async function (event) {
  event.preventDefault()

  const name = document.getElementById('name').value
  const lastname = document.getElementById('lastname').value
  const email = document.getElementById('email').value
  const password = document.getElementById('password').value
  const confirmPassword = document.getElementById('passwordRE').value
  const birthdate = document.getElementById('birthdate').value

  const formData = {
    name,
    lastname,
    email,
    password,
    confirmPassword,
    birthdate
  }

  try {
    const response = await fetch('https://backend-dev-tfdp.4.us-1.fl0.io/registro/usuarioTurista', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })

    if (!response.ok) {
      throw new Error('Hubo un error')
    }

    const data = await response.json()

    console.log('Éxito:', data)
  } catch (error) {
    console.error('Error:', error)
  }
})
