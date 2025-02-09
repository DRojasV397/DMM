document.addEventListener('DOMContentLoaded', function () {
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');

    if (passwordInput && togglePassword) {
        togglePassword.addEventListener('click', function () {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePassword.src = type === 'password' ? '../static/assets/icons/Boton ojoA.svg' : '../static/assets/icons/Boton ojoC.svg';
        });
    }

    const passwordREInput = document.getElementById('passwordRE');
    const togglePasswordRE = document.getElementById('togglePasswordRE');

    if (passwordREInput && togglePasswordRE) {
        togglePasswordRE.addEventListener('click', function () {
            const type = passwordREInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordREInput.setAttribute('type', type);
            togglePasswordRE.src = type === 'password' ? '../static/assets/icons/Boton ojoA.svg' : '../static/assets/icons/Boton ojoC.svg';
        });
    }
});
