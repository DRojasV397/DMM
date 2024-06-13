        document.addEventListener('DOMContentLoaded', function() {
            const editEmailButton = document.getElementById('editEmail');
            const buttomsEmail = document.getElementById('buttomsEmail');
            const emailInput = document.getElementById('email');
            const cancelUpdateEmail = document.getElementById('cancelUpdateEmail');

            const editPasswordButton = document.getElementById('editPassword');
            const buttomsPassword = document.getElementById('buttomsPassword');
            const passwordInput = document.getElementById('password');
            const cancelUpdatePassword = document.getElementById('cancelUpdatePassword');

            editEmailButton.addEventListener('click', function() {
                emailInput.disabled = false;
                buttomsEmail.classList.remove('hidden');
            });

            cancelUpdateEmail.addEventListener('click', function() {
                emailInput.disabled = true;
                buttomsEmail.classList.add('hidden');
            });

            editPasswordButton.addEventListener('click', function() {
                passwordInput.disabled = false;
                buttomsPassword.classList.remove('hidden');
            });

            cancelUpdatePassword.addEventListener('click', function() {
                passwordInput.disabled = true;
                buttomsPassword.classList.add('hidden');
            });

            const editNameButton = document.getElementById('editName');
            const buttonsName = document.getElementById('buttonsName');
            const nameInput = document.getElementById('nameInput');
            const cancelUpdateName = document.getElementById('cancelUpdateName');

            editNameButton.addEventListener('click', function() {
                nameInput.removeAttribute('disabled');
                buttonsName.classList.remove('hidden');
            });

            cancelUpdateName.addEventListener('click', function() {
                nameInput.setAttribute('disabled', 'disabled');
                buttonsName.classList.add('hidden');
            });

            // Manejar la edición del apellido
            const editLastNameButton = document.getElementById('editLastName');
            const buttonsLastName = document.getElementById('buttonsLastName');
            const lastNameInput = document.getElementById('lastname');
            const cancelUpdateLastName = document.getElementById('cancelUpdateLastName');

            editLastNameButton.addEventListener('click', function() {
                lastNameInput.disabled = false;
                buttonsLastName.classList.remove('hidden');
            });

            cancelUpdateLastName.addEventListener('click', function() {
                lastNameInput.disabled = true;
                buttonsLastName.classList.add('hidden');
            });
        });
