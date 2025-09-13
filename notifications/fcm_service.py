import json
import requests
from google.oauth2 import service_account
from google.auth.transport.requests import Request

# Path to service account file
SERVICE_ACCOUNT_FILE = "config/serviceAccountKey.json"
PROJECT_ID = "jobs-academy"  # from your JSON (project_id)

# Scopes required for FCM
SCOPES = ["https://www.googleapis.com/auth/firebase.messaging"]

# Load credentials from the JSON
credentials = service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE, scopes=SCOPES
)

def get_access_token():
    """Generate an OAuth2 access token using the service account."""
    request = Request()
    credentials.refresh(request)
    return credentials.token

def send_fcm_message(device_token, title, body):
    """Send a push notification via FCM v1 API."""
    url = f"https://fcm.googleapis.com/v1/projects/{PROJECT_ID}/messages:send"

    headers = {
        "Authorization": f"Bearer {get_access_token()}",
        "Content-Type": "application/json; UTF-8",
    }

    payload = {
        "message": {
            "token": device_token,  # FCM device registration token from client
            "notification": {
                "title": title,
                "body": body,
            },
        }
    }

    response = requests.post(url, headers=headers, data=json.dumps(payload))
    return response.json()
