from flask import Flask, render_template, request, redirect, url_for, flash
import firebase_admin
from firebase_admin import credentials, auth, firestore
import os
from werkzeug.security import generate_password_hash, check_password_hash

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
    return render_template('home.html')

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
        
        hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
        try:
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
                return redirect(url_for('home'))
            else:
                flash('Correo o contraseña incorrectos. Verifique sus credenciales.', 'danger')
        except firebase_admin.auth.UserNotFoundError:
            flash('Usuario no encontrado. Verifique su correo electrónico.', 'danger')
        except Exception as e:
            flash(f'Error iniciando sesión: {str(e)}', 'danger')
    return render_template('login.html')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
