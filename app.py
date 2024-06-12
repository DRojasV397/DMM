from flask import Flask, render_template, request, redirect, url_for, flash
import firebase_admin
from firebase_admin import credentials, auth, firestore
import os

app = Flask(__name__)
app.secret_key = 'your_secret_key'

# Initialize Firebase Admin SDK
cred = credentials.Certificate('serviceAccountKey.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

@app.route('/')
def index():
    return 'Welcome'

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        name = request.form['name']
        lastname = request.form['lastname']
        email = request.form['email']
        password = request.form['password']
        passwordRE = request.form['passwordRE']
        birthdate = request.form['birthdate']
        try:
            user = auth.create_user(
                email=email,
                password=password,
                display_name=name + ' ' + lastname
            )
            # Guardar los datos del usuario en Firestore
            user_data = {
                'name': name,
                'lastname': lastname,
                'email': email,
                'birthdate': birthdate
            }
            db.collection('users').document(user.uid).set(user_data)
            
            # Send email verification
            user = auth.create_user(email=email, password=password)
            # (Aquí deberías enviar este enlace a través de un servicio de correo electrónico como SendGrid o similar)
            flash('Usuario creado exitosamente. Por favor, revisa tu correo electrónico para verificar tu cuenta.', 'success')
            return redirect(url_for('login'))
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
            return redirect(url_for('index'))
        except auth.UserNotFoundError:
            flash('Usuario no encontrado. Verifique su correo electrónico.', 'danger')
        except auth.InvalidPasswordError:
            flash('Contraseña incorrecta. Verifique su contraseña.', 'danger')
        except Exception as e:
            flash(f'Error iniciando sesión: {str(e)}', 'danger')
    return render_template('login.html')

if __name__ == '__main__':
    app.run(debug=True)
