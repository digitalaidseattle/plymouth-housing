from dotenv import load_dotenv
import os

load_dotenv()

URL = os.getenv("URL")
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")
VOLUNTEER_USERNAME = os.getenv("VOLUNTEER_USERNAME")
VOLUNTEER_PASSWORD = os.getenv("VOLUNTEER_PASSWORD")
