import firebase_admin
from firebase_admin import credentials, firestore
import os
from dotenv import load_dotenv
from pathlib import Path

load_dotenv()

# Construir la ruta absoluta del archivo de credenciales
credentials_filename = os.getenv("FIREBASE_CREDENTIALS", "serviceAccountKey.json")

# Obtener ruta base del proyecto (directorio padre de app)
app_dir = Path(__file__).parent
credentials_path = app_dir / credentials_filename

cred = credentials.Certificate(str(credentials_path))
firebase_admin.initialize_app(cred)
db = firestore.client()
