import re

def validar_email(email):
    # Expresión regular para validar emails
    patron = r'^[\w\.-]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,}$'
    
    # Verificar si el email coincide con el patrón
    if re.match(patron, email):
        return True
    else:
        return False

def validar_contrasena(contrasena):
    # Longitud mínima de la contraseña
    longitud_minima = 8
    
    # Verificar si la contraseña tiene al menos longitud_minima caracteres
    if len(contrasena) < longitud_minima:
        return False
    
    # Verificar si la contraseña contiene al menos una letra minúscula
    if not re.search(r'[a-z]', contrasena):
        return False
    
    # Verificar si la contraseña contiene al menos una letra mayúscula
    if not re.search(r'[A-Z]', contrasena):
        return False
    
    # Verificar si la contraseña contiene al menos un dígito
    if not re.search(r'\d', contrasena):
        return False
    
    # Verificar si la contraseña contiene al menos un caracter especial
    if not re.search(r'[\W_]', contrasena):
        return False
    
    # Si pasa todas las verificaciones, la contraseña es válida
    return True
