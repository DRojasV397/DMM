from flask import Flask, render_template, request, redirect, url_for, flash
import firebase_admin
from firebase_admin import credentials, auth, firestore
from utilities.validations import validar_email, validar_contrasena
from werkzeug.security import generate_password_hash, check_password_hash
from flask import make_response


app = Flask(__name__)
app.secret_key = 'your_secret_key'

# Initialize Firebase Admin SDK
cred = credentials.Certificate('serviceAccountKey.json')
firebase_admin.initialize_app(cred)
db = firestore.client()
users_ref = db.collection('users')

@app.route('/')
def index():
    return redirect(url_for('login'))

@app.route('/home', methods=['GET', 'POST'])
def home():
    user_id = request.cookies.get('user_id')
    
    if user_id:
        user_ref = users_ref.document(user_id)
        user_data = user_ref.get().to_dict()
        
        if user_data:
            user_name = user_data.get('name', 'Usuario')  # Obtener el nombre del usuario o establecer un valor por defecto
            return render_template('home.html', user_name=user_name)
        else:
            flash('No se encontraron datos para el usuario.', 'danger')
            return redirect(url_for('login'))
    else:
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

@app.route('/logout')
def logout():
    # Creas una respuesta para redireccionar a la página de login
    response = make_response(redirect(url_for('login')))
    # Borras la cookie 'user_id' estableciéndola como vacía y con una fecha en el pasado
    response.set_cookie('user_id', '', expires=0)
    return response

if __name__ == '__main__':
    # app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
    app.run(debug=True)
