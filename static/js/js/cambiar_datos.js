let modal
let idTurista
document.addEventListener("DOMContentLoaded", function () {
    let turista
    $("#togglePassword").css({"display":"none"}); 
    setTimeout(async()=>{
        idTurista = document.getElementById('nombreUsuario').dataset.idTurista;
        //Para cambiar el nombre en "header" de container-data
        //console.log(idTurista)
        turista = await fetchGetUser(idTurista)
        let nombreTurista = `${turista.Nombre} ${turista.Apellido}`
        let nameH = document.getElementById('name')
        nameH.innerHTML=`<b>${nombreTurista}</b>`;
    },100)

    $("#password").val("........"); 

    $('.form-profile').submit(function(event) {
        // Evitar la recarga de la página al enviar el formulario
        event.preventDefault();
    });

    $('#editPassword').click(function(){
        var valorInput = $("#password").val(); //valor original
        $("#togglePassword").css({"display":"flex"});
        $("#editPassword").prop('disabled', true);
        $("#labelPassword").text("Nueva contraseña")
        $("#password").val("")
        $("#password").prop('disabled', false);
        $("#password").prop('required', true);
        $("#password").focus();
        //$("#togglePassword").css({"display":"flex"});
        var htmlPassRE = `<label for="passwordRE" class="label-profile" id="labelPasswordRE">Confirmar Contraseña</label><br id="brPRE">
                            <div class="container-input" id="contInputPasswordRE" style="margin-bottom:0.1rem">
                                <div class="password-container" style="margin-right: 32px;">
                                    <input type="password" id="passwordRE" name="passwordRE" placeholder="Nueva contraseña" class="input-profile" required>
                                    <img src="/public/assets/icons/Boton ojoA.svg" alt="Mostrar contraseña" id="togglePasswordRE" onclick="TTogglePasswordRE()">
                                </div>
                                
                            </div>                           

                            <div class="btn-form-profile" id="buttomsPasswordRE" style="margin-bottom:24px">
                                <button type="button" class="btn-cancel" id="cancelUpdatePassword">
                                    Cancelar
                                </button>
                                <button type="submit" class="btn-save" id="doUpdatePassword">
                                    Aceptar
                                </button>
                            </div>
                            `;

        $("#contInputPassword").css({"margin-bottom":"0.5em"});
        htmlPassRE = htmlPassRE.trim();
        $("#updatePassword").append(htmlPassRE);  
        
        // Si se cancela
        $('#cancelUpdatePassword').click(function(){
            $("#togglePassword").css({"display":"none"});
            $("#labelPassword").text("Contraseña")
            $("#password").val(valorInput); //Regresa al valor original
            $('#contInputPassword').css({"margin-bottom":"1.2em"});
            $("#editPassword").prop('disabled', false);
            $("#password").attr("type", "password");
            $("#password").prop('disabled', true);
            $("#labelPasswordRE").remove();
            $("#brPRE").remove();
            $("#contInputPasswordRE").remove();
            $("#buttomsPasswordRE").remove();
        });
        
        // Si se confirma
        $('#doUpdatePassword').click(async function(){
            $("#togglePassword").css({"display":"none"});
            if(validatePassword()){
                //hacer fetch
                await alertsChangePw(idTurista,$('#password').val())
                $("#labelPassword").text("Contraseña")
                $("#password").val(valorInput); //Regresa al valor original
                $('#contInputPassword').css({"margin-bottom":"1.2em"});
                $("#editPassword").prop('disabled', false);
                $("#password").attr("type", "password");
                $("#password").prop('disabled', true);
                $("#labelPasswordRE").remove();
                $("#brPRE").remove();
                $("#contInputPasswordRE").remove();
                $("#buttomsPasswordRE").remove();
            }
        });    
    });

    $('#editEmail').click(function(){
        var valorInput = $("#email").val();
        //setTimeout(function() {
            $("#editEmail").prop('disabled', true);
        //}, 600);
        $('#contInputEmail').css({"margin-bottom":"0.1em"});
        
        $("#email").prop('disabled', false);
        $("#email").focus();
        
        var htmlPassRE =`<div class="btn-form-profile" id="buttomsEmail">
                            <button type="button" class="btn-cancel" id="cancelUpdateEmail">
                                Cancelar
                            </button>
                            <button type="submit" class="btn-save" id="doUpdateEmail">
                                Aceptar
                            </button>
                        </div>`;

        $("#contInputEmail").css({"margin-bottom":"0.5em"});
        htmlPassRE = htmlPassRE.trim();
        $("#updateEmail").append(htmlPassRE);


        $('#cancelUpdateEmail').click(function(){
            $("#email").val(valorInput); //Regresa al valor original
            $('#contInputEmail').css({"margin-bottom":"1.2em"});
            $('#buttomsEmail').remove();
            $('#cancelUpdateEmail').remove();
            $('#doUpdateEmail').remove();
            $("#editEmail").prop('disabled', false);
            $("#email").prop('disabled', true);
        });

        $('#doUpdateEmail').click(function(){
            if(validateEmail()){
                //hacer fetch
                //si se cambia con exito
                $('#contInputEmail').css({"margin-bottom":"1.2em"});
                //$('#buttomsUsername').css({"display":"none"});
                $("#editEmail").prop('disabled', false);
                $("#email").prop('disabled', true);
                $("#buttomsEmail").remove();
            }
        });
    });
        // Para editar el nombre
        $('#editName').click(function() {
            var valorInput = $("#name").val();
            $("#editName").prop('disabled', true);
            $('#contInputName').css({ "margin-bottom": "0.1em" });

            $("#name").prop('disabled', false);
            $("#name").focus();

            var htmlButtons = `<div class="btn-form-profile" id="buttomsName">
                                    <button type="button" class="btn-cancel" id="cancelUpdateName">
                                        Cancelar
                                    </button>
                                    <button type="submit" class="btn-save" id="doUpdateName">
                                        Aceptar
                                    </button>
                                </div>`;

            $("#contInputName").css({ "margin-bottom": "0.5em" });
            htmlButtons = htmlButtons.trim();
            $("#updateName").append(htmlButtons);

            $('#cancelUpdateName').click(function() {
                $("#name").val(valorInput); // Regresa al valor original
                $('#contInputName').css({ "margin-bottom": "1.2em" });
                $('#buttomsName').remove();
                $("#editName").prop('disabled', false);
                $("#name").prop('disabled', true);
            });

            $('#doUpdateName').click(function() {
                // Validación y lógica de actualización
                $('#contInputName').css({ "margin-bottom": "1.2em" });
                $("#editName").prop('disabled', false);
                $("#name").prop('disabled', true);
                $("#buttomsName").remove();
            });
        });

        // Para editar el apellido
        $('#editApellido').click(function() {
            var valorInput = $("#apellido").val();
            $("#editApellido").prop('disabled', true);
            $('#contInputApellido').css({ "margin-bottom": "0.1em" });

            $("#apellido").prop('disabled', false);
            $("#apellido").focus();

            var htmlButtons = `<div class="btn-form-profile" id="buttomsApellido">
                                    <button type="button" class="btn-cancel" id="cancelUpdateApellido">
                                        Cancelar
                                    </button>
                                    <button type="submit" class="btn-save" id="doUpdateApellido">
                                        Aceptar
                                    </button>
                                </div>`;

            $("#contInputApellido").css({ "margin-bottom": "0.5em" });
            htmlButtons = htmlButtons.trim();
            $("#updateApellido").append(htmlButtons);

            $('#cancelUpdateApellido').click(function() {
                $("#apellido").val(valorInput); // Regresa al valor original
                $('#contInputApellido').css({ "margin-bottom": "1.2em" });
                $('#buttomsApellido').remove();
                $("#editApellido").prop('disabled', false);
                $("#apellido").prop('disabled', true);
            });

            $('#doUpdateApellido').click(function() {
                // Validación y lógica de actualización
                $('#contInputApellido').css({ "margin-bottom": "1.2em" });
                $("#editApellido").prop('disabled', false);
                $("#apellido").prop('disabled', true);
                $("#buttomsApellido").remove();
            });
        });

        // Para editar la fecha de nacimiento
        $('#editBirthdate').click(function() {
            var valorInput = $("#birthdate").val();
            $("#editBirthdate").prop('disabled', true);
            $('#contInputBirthdate').css({ "margin-bottom": "0.1em" });

            $("#birthdate").prop('disabled', false);
            $("#birthdate").focus();

            var htmlButtons = `<div class="btn-form-profile" id="buttomsBirthdate">
                                    <button type="button" class="btn-cancel" id="cancelUpdateBirthdate">
                                        Cancelar
                                    </button>
                                    <button type="submit" class="btn-save" id="doUpdateBirthdate">
                                        Aceptar
                                    </button>
                                </div>`;

            $("#contInputBirthdate").css({ "margin-bottom": "0.5em" });
            htmlButtons = htmlButtons.trim();
            $("#updateBirthdate").append(htmlButtons);

            $('#cancelUpdateBirthdate').click(function() {
                $("#birthdate").val(valorInput); // Regresa al valor original
                $('#contInputBirthdate').css({ "margin-bottom": "1.2em" });
                $('#buttomsBirthdate').remove();
                $("#editBirthdate").prop('disabled', false);
                $("#birthdate").prop('disabled', true);
            });

            $('#doUpdateBirthdate').click(function() {
                // Validación y lógica de actualización
                $('#contInputBirthdate').css({ "margin-bottom": "1.2em" });
                $("#editBirthdate").prop('disabled', false);
                $("#birthdate").prop('disabled', true);
                $("#buttomsBirthdate").remove();
            });
        });

        document.addEventListener('click', function(event) {
            if (event.target && event.target.id === 'doUpdateName') {
                const newName = document.getElementById('name').value;
                const urlParams = new URLSearchParams(window.location.search);
                const userId = urlParams.get('userId');
    
                fetch(`https://backend-dev-tfdp.4.us-1.fl0.io/api/usuarioTurista/identificador/${userId}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Error al obtener datos del usuario');
                    }
                    return response.json();
                })
                .then(usuario => {
                    return fetch(`https://backend-dev-tfdp.4.us-1.fl0.io/api/updateUsuario/nombre/${usuario.id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ Nombre: newName })
                    });
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Error al actualizar el nombre');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Nombre actualizado:', data);
                    alert('Nombre actualizado con éxito');
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Error al actualizar el nombre: ' + error.message);
                });
            }
        });      

        document.addEventListener('click', function(event) {
            if (event.target && event.target.id === 'doUpdateApellido') {
                const newApellido = document.getElementById('apellido').value;
                const urlParams = new URLSearchParams(window.location.search);
                const userId = urlParams.get('userId');
    
                fetch(`https://backend-dev-tfdp.4.us-1.fl0.io/api/usuarioTurista/identificador/${userId}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Error al obtener datos del usuario');
                    }
                    return response.json();
                })
                .then(usuario => {
                    return fetch(`https://backend-dev-tfdp.4.us-1.fl0.io/api/updateUsuario/apellido/${usuario.id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ Apellido: newApellido })
                    });
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Error al actualizar el apellido');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Apellido actualizado:', data);
                    alert('Apellido actualizado con éxito');
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Error al actualizar el apellido: ' + error.message);
                });
            }
        });
        
         document.addEventListener('click', function(event) {
             if (event.target && event.target.id === 'doUpdateEmail') {
                 const newCorreo = document.getElementById('email').value;
                 const urlParams = new URLSearchParams(window.location.search);
                 const userId = urlParams.get('userId');
    
                 fetch(`https://backend-dev-tfdp.4.us-1.fl0.io/api/usuarioTurista/identificador/${userId}`)
                 .then(response => {
                     if (!response.ok) {
                         throw new Error('Error al obtener datos del usuario');
                     }
                     return response.json();
                 })
                 .then(usuario => {
                     return fetch(`https://backend-dev-tfdp.4.us-1.fl0.io/api/updateUsuario/correo/${usuario.id}`, {
                         method: 'PUT',
                         headers: {
                             'Content-Type': 'application/json'
                         },
                         body: JSON.stringify({ Correo: newCorreo })
                     });
                 })
                 .then(response => {
                     if (!response.ok) {
                         throw new Error('Error al actualizar el Correo');
                     }
                     return response.json();
                 })
                 .then(data => {
                     console.log('Correo actualizado:', data);
                     alert('Correo actualizado con éxito');
                 })
                 .catch(error => {
                     console.error('Error:', error);
                     alert('Error al actualizar el correo: ' + error.message);
                 });
             }
         });

         document.addEventListener('click', function(event) {
             if (event.target && event.target.id === 'doUpdateBirthdate') {
                 const newBirthdate = document.getElementById('birthdate').value;
                 const urlParams = new URLSearchParams(window.location.search);
                 const userId = urlParams.get('userId');
    
                 fetch(`https://backend-dev-tfdp.4.us-1.fl0.io/api/usuarioTurista/identificador/${userId}`)
                 .then(response => {
                     if (!response.ok) {
                         throw new Error('Error al obtener datos del usuario');
                     }
                     return response.json();
                 })
                 .then(usuario => {
                     return fetch(`https://backend-dev-tfdp.4.us-1.fl0.io/api/updateUsuario/fechaNacimiento/${usuario.id}`, {
                         method: 'PUT',
                         headers: {
                             'Content-Type': 'application/json'
                         },
                         body: JSON.stringify({ Fecha_Nacimiento: newBirthdate })
                     });
                 })
                 .then(response => {
                     if (!response.ok) {
                         throw new Error('Error al actualizar la fecha de nacimiento');
                     }
                     return response.json();
                 })
                 .then(data => {
                     console.log('Fecha de nacimiento actualizada:', data);
                     alert('Fecha de nacimiento actualizada con éxito');
                 })
                 .catch(error => {
                     console.error('Error:', error);
                     alert('Error al actualizar la fecha de nacimiento: ' + error.message);
                 });
             }
         });

    /**MODAL */
    // Oculta el contenedor modal al principio
    modal = document.getElementById("cModalAlertDelete");
    modal.style.display = "none";

    // Muestra el contenedor modal al hacer clic en el botón trigger
    document.getElementById("btnDeleteAccount").addEventListener("click", function () {
        //Cambia contenido del modal
        let modalContentC = document.getElementById('cModalAlertDelete')
        modalContentC.innerHTML = `<div class="content-modal">
                                        <h2 style="text-align: center;">¿Estas seguro?</h2>
                                        <p style="margin: 0 0 20px 0; text-align: center;">Esta accion borrará todos los datos de tu cuenta</p>
                                        <div class="btn-form-profile" style="display: flex !important;">
                                            <button type="button" class="btn-cancel" id="btnDeleteAccountConfirmed" onclick="doDeleteAcc()">
                                                <b>Estoy seguro</b>
                                            </button>
                                            <button type="button" class="btn-save" id="btnClose" onclick="closeModal()" >
                                                <b>Regresar</b>
                                            </button>
                                        </div>
                                    </div>`;
        modal.style.display = "flex";
        modal.classList.toggle('active');
    });
     
});

//funciones para validar nombre de usuario
function validateUsername(){
    const username = document.getElementById('username');
    if(username.value.trim() == '' ){
        showAlert('El nombre de usuario no ha sido llenado')
        highlightInvalidField(username);
        return false;
    } else {
        removeHighlight(username);
    }
    return true;
}

function validatePassword(){
    const password = document.getElementById('password');
    const passwordRE = document.getElementById('passwordRE');
    if(password.value.trim() == '' ){
        showAlert('La nueva contraseña no ha sido llenada')
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
    if (password.value.trim() !== passwordRE.value.trim()) {
        showAlert('Los campos con la nueva contraseña no coinciden.');
        return false;
    }

    return true;
}

function validateEmail(){
    const email = document.getElementById('email');
    if(email.value.trim() == '' ){
        showAlert('El correo electrónico no ha sido llenado')
        highlightInvalidField(email);
        return false;
    } else {
        removeHighlight(email);
    }

    if(!isValidEmail(email.value.trim())){
        showAlert('Correo electrónico mal formado');
        highlightInvalidField(email);
        return false;
    } else {
        removeHighlight(email);
    }
    return true;
}

//Funcion para validar fecha de nacimiento, tomando en cuenta que debe de ser mayor de edad (18 años)
function validateDate(){
    const date = document.getElementById('date');
    if(date.value.trim() == '' ){
        showAlert('La fecha de nacimiento no ha sido llenada')
        highlightInvalidField(date);
        return false;
    } else {
        removeHighlight(date);
    }
    return true;
}

function isValidEmail(email) {
    return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email);
}

function showAlert(message) {
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
        confirmButtonColor: "#65B2C6"
    });
}

function highlightInvalidField(field) {
    field.style.borderColor = 'red';
}

function removeHighlight(field) {
    field.style.borderColor = ''; // Reset to default
}


async function alertsChangePw(idTurista,newPassword){
    const res = await fetchChangePW(idTurista,newPassword)
    if(res['status']===201){
        Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'Se cambio la contraseña correctamente',
            confirmButtonColor: "#65B2C6"
        });
    }else{
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Se perdio comunicaci on con la base de datos.',
            confirmButtonColor: "#65B2C6"
        });
    }
}


// Oculta el contenedor modal al hacer clic en el botón de cerrar/regresar
function closeModal(){
    let modal = document.getElementById("cModalAlertDelete");
    modal.style.display = "none";
    modal.classList.toggle('active');
}

// Mostrar/ocultar contraseña confirmada
function TTogglePasswordRE(){
    const passwordREInput = document.getElementById('passwordRE');
    const togglePasswordRE = document.getElementById('togglePasswordRE');

    if (passwordREInput && togglePasswordRE) {
        const type = passwordREInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordREInput.setAttribute('type', type);

        // Cambia la imagen del botón
        togglePasswordRE.src = type === 'password' ? '/public/assets/icons/Boton ojoA.svg' : '/public/assets/icons/Boton ojoC.svg';
    }
}
