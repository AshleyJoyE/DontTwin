from django.apps import AppConfig
from dotenv import load_dotenv
import os

class BackendConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'Backend'

    def ready(self):
        # Load environment variables from .env file
        load_dotenv()

        # Ensure the GOOGLE_CLOUD_PROJECT environment variable is set
        if not os.getenv('GOOGLE_CLOUD_PROJECT'):
            raise ValueError("GOOGLE_CLOUD_PROJECT not set in .env file")