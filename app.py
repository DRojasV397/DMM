from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
import firebase_admin
from firebase_admin import credentials, auth, firestore
from utilities.validations import validar_email, validar_contrasena
from werkzeug.security import generate_password_hash, check_password_hash
from flask import make_response
import os


app = Flask(__name__)
app.secret_key = 'your_secret_key'

# Initialize Firebase Admin SDK
cred = credentials.Certificate('serviceAccountKey.json')
firebase_admin.initialize_app(cred)
db = firestore.client()
users_ref = db.collection('users')
favs_ref = db.collection('lugarFavorito')
visits_ref = db.collection('lugarVisitado')

@app.route('/')
def index():
    return redirect(url_for('login'))

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        name = request.form['name']
        lastname = request.form['lastname']
        email = request.form['email']
        password = request.form['password']
        passwordRE = request.form['passwordRE']
        birthdate = request.form['birthdate']
        
        if password != passwordRE:
            flash('Las contraseñas no coinciden.', 'danger')
            return redirect(url_for('register'))
        
        if not validar_email(email):
            flash('El correo electronico no es invalido.', 'danger')
            return redirect(url_for('register'))
        
        if not validar_contrasena(password):
            flash('La contraseña debe tener al menos 8 caracteres, una mayuscula, una minuscula, un numero y un caracter especial.', 'danger')
            return redirect(url_for('register'))

        hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
        try:
            query = users_ref.where('email', '==', email)
            results = list(query.stream())
            if results:
                flash('El correo ya ha sido registrado')
                return redirect(url_for('register'))
            
            user = auth.create_user(
                email=email,
                password=password,
                display_name=name + ' ' + lastname
            )
            user_data = {
                'name': name,
                'lastname': lastname,
                'email': email,
                'birthdate': birthdate,
                'password': hashed_password
            }
            users_ref.document(user.uid).set(user_data)
            return redirect(url_for('home'))
        except Exception as e:
            flash(f'Error creando usuario: {str(e)}', 'danger')
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    user_id = request.cookies.get('user_id')
    
    if user_id:
        user_ref = users_ref.document(user_id)
        user_data = user_ref.get().to_dict()
        
        if user_data:
            user_name = user_data.get('name', 'Usuario')
            return render_template('home.html', user_name=user_name)

    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        try:
            user = auth.get_user_by_email(email)
            query = users_ref.where('email', '==', email)
            results = list(query.stream())
            
            if results and check_password_hash(results[0].to_dict()['password'], password):
                # Set cookie with user ID
                response = make_response(redirect(url_for('home')))
                response.set_cookie('user_id', user.uid)
                return response
            else:
                flash('Correo o contraseña incorrectos. Verifique sus credenciales.', 'danger')
        except firebase_admin.auth.UserNotFoundError:
            flash('Usuario no encontrado. Verifique su correo electrónico.', 'danger')
        except Exception as e:
            flash(f'Error iniciando sesión: {str(e)}', 'danger')
    return render_template('login.html')


@app.route('/home', methods=['GET', 'POST'])
def home():
    user_id = request.cookies.get('user_id')
    if user_id:
        user_ref = users_ref.document(user_id)
        user_data = user_ref.get().to_dict()
        if user_data:
            user_name = user_data.get('name', 'Usuario')
            return render_template('home.html', user_name=user_name)
        else:
            return redirect(url_for('login'))
    else:
        return redirect(url_for('login'))

@app.route('/logout')
def logout():
    # Creas una respuesta para redireccionar a la página de login
    response = make_response(redirect(url_for('login')))
    # Borras la cookie 'user_id' estableciéndola como vacía y con una fecha en el pasado
    response.set_cookie('user_id', '', expires=0)
    return response

@app.route('/suggestions', methods=['GET', 'POST'])
def suggestions():
    user_id = request.cookies.get('user_id')
    if user_id:
        user_ref = users_ref.document(user_id)
        user_data = user_ref.get().to_dict()
        if user_data:
            if request.method == 'POST':
                category = request.form.get('category')
                comentario = request.form.get('comentario')
                if category and comentario:
                    queja_ref = db.collection('quejas').add({
                        'user_id': user_id,
                        'categoria': category,
                        'comentario': comentario
                    })
                    flash('¡Comentario enviado exitosamente!', 'success')
                else:
                    flash('Por favor selecciona un tipo de error y escribe un comentario.', 'warning')
            
            return render_template('suggestions.html')
        else:
            return redirect(url_for('login'))
    else:
        return redirect(url_for('login'))

@app.route('/myAccount', methods=['GET', 'POST'])
def myAccount():
    user_id = request.cookies.get('user_id')
    if user_id:
        user_ref = users_ref.document(user_id)
        user_data = user_ref.get().to_dict()
        if user_data:
            user_name = user_data.get('name', 'Usuario')
            user_lastname = user_data.get('lastname', '')
            user_email = user_data.get('email', '')
            return render_template('myAccount.html', user_name=user_name, user_email=user_email, user_lastname=user_lastname)
        else:
            return redirect(url_for('login'))
    else:
        return redirect(url_for('login'))


############################################################
######         Rutas para update y delete             ###### 
############################################################

@app.route('/updateEmail', methods=['POST'])
def updateEmail():
    user_id = request.cookies.get('user_id')
    if not user_id:
        return redirect(url_for('login'))

    new_email = request.form['email']
    if not validar_email(new_email):
        flash('El correo electrónico no es válido.', 'error')
        return redirect(url_for('myAccount'))

    try:
        user_ref = users_ref.document(user_id)
        user_data = user_ref.get().to_dict()
        if user_data:
            # Update Firebase Authentication user
            auth.update_user(user_id, email=new_email)

            # Update Firestore user document
            user_ref.update({'email': new_email})
            flash('Correo electrónico actualizado correctamente.', 'success')
        else:
            flash('Error al actualizar el correo electrónico.', 'error')
    except Exception as e:
        flash(f'Error actualizando correo electrónico: {str(e)}', 'error')

    return redirect(url_for('myAccount'))

@app.route('/updatePassword', methods=['POST'])
def updatePassword():
    user_id = request.cookies.get('user_id')
    if not user_id:
        return redirect(url_for('login'))

    new_password = request.form['password']
    if not validar_contrasena(new_password):
        flash('La contraseña no cumple con los requisitos.', 'error')
        return redirect(url_for('myAccount'))

    try:
        hashed_password = generate_password_hash(new_password, method='pbkdf2:sha256')
        user_ref = users_ref.document(user_id)
        user_data = user_ref.get().to_dict()
        if user_data:
            # Update Firebase Authentication user
            auth.update_user(user_id, password=new_password)

            # Update Firestore user document
            user_ref.update({'password': hashed_password})
            flash('Contraseña actualizada correctamente.', 'success')
        else:
            flash('Error al actualizar la contraseña.', 'error')
    except Exception as e:
        flash(f'Error actualizando contraseña: {str(e)}', 'error')

    return redirect(url_for('myAccount'))

@app.route('/updateName', methods=['POST'])
def updateName():
    user_id = request.cookies.get('user_id')
    if not user_id:
        return redirect(url_for('login'))

    new_name = request.form['name']

    try:
        user_ref = users_ref.document(user_id)
        user_ref.update({'name': new_name})
        flash('Nombre actualizado correctamente.', 'success')
    except Exception as e:
        flash(f'Error actualizando nombre: {str(e)}', 'error')

    return redirect(url_for('myAccount'))

@app.route('/updateLastName', methods=['POST'])
def updateLastName():
    user_id = request.cookies.get('user_id')
    if not user_id:
        return redirect(url_for('login'))

    new_lastname = request.form['lastname']

    try:
        user_ref = users_ref.document(user_id)
        user_ref.update({'lastname': new_lastname})
        flash('Apellido actualizado correctamente.', 'success')
    except Exception as e:
        flash(f'Error actualizando apellido: {str(e)}', 'error')

    return redirect(url_for('myAccount'))

@app.route('/deleteAccount', methods=['POST'])
def deleteAccount():
    user_id = request.cookies.get('user_id')
    if not user_id:
        return redirect(url_for('login'))

    try:
        # Delete from Firebase Authentication
        auth.delete_user(user_id)

        # Delete from Firestore
        users_ref.document(user_id).delete()

        # Clear session and redirect to login
        response = make_response(redirect(url_for('login')))
        response.set_cookie('user_id', '', expires=0)
        flash('Cuenta eliminada correctamente.', 'success')
        return response
    except Exception as e:
        flash(f'Error al eliminar la cuenta: {str(e)}', 'error')
        return redirect(url_for('myAccount'))

@app.route('/crearLugarFavorito', methods=['POST'])
def crearLugarFavorito():
    if request.method == 'POST':
        data = request.json
        id_lugar = data.get('id_Lugar')
        user_id = data.get('user_id')
        query = favs_ref.where('user_id','==',user_id).where('id_Lugar', '==', id_lugar)
        results = list(query.stream())
        if results:
            for doc in results:
                doc.reference.delete()
            response = {
                'message': 'Lugar favorito eliminado con éxito',
                'status': 'success'
            }
        else:
            new_entry = {
                'user_id': user_id,
                'id_Lugar': id_lugar,
                'Nombre': data.get('Nombre') 
            }
            favs_ref.add(new_entry)
            response = {
            'message': 'Lugar favorito creado con éxito',
                'status': 'success'
            }
        return jsonify(response)

@app.route('/comprobarLugarFavorito', methods=['POST'])
def comprobarLugarFavorito():
    if request.method == 'POST':
        data = request.json
        id_lugar = data.get('id_Lugar')
        user_id = data.get('user_id')
        query = favs_ref.where('user_id','==',user_id).where('id_Lugar', '==', id_lugar)
        results = list(query.stream())
        if results:
            response = {
                'message': True,
                'status' : 'success'
            }
            return jsonify(response)
        else:
            response = {
                'message': False,
                'status' : 'success'
            }
            return jsonify(response)

@app.route('/crearLugarVisitado', methods=['POST'])
def crearLugarVisitado():
    if request.method == 'POST':
        data = request.json
        id_lugar = data.get('id_Lugar')
        user_id = data.get('user_id')
        query = visits_ref.where('user_id','==',user_id).where('id_Lugar', '==', id_lugar)
        results = list(query.stream())
        if results:
            for doc in results:
                doc.reference.delete()
            response = {
                'message': 'Lugar visitado eliminado con éxito',
                'status': 'success'
            }
        else:
            new_entry = {
                'user_id': user_id,
                'id_Lugar': id_lugar,
                'Nombre': data.get('Nombre') 
            }
            visits_ref.add(new_entry)
            response = {
            'message': 'Lugar visitado marcado con éxito',
                'status': 'success'
            }
        return jsonify(response)

@app.route('/comprobarLugarVisitado', methods=['POST'])
def comprobarLugarVisitado():
    if request.method == 'POST':
        data = request.json
        id_lugar = data.get('id_Lugar')
        user_id = data.get('user_id')
        query = visits_ref.where('user_id','==',user_id).where('id_Lugar', '==', id_lugar)
        results = list(query.stream())
        if results:
            response = {
                'message': True,
                'status' : 'success'
            }
        else:
            response = {
                'message': False,
                'status' : 'success'
            }
        return jsonify(response)





if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
    # app.run(debug=True)
