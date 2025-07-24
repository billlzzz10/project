import requests
from flask import current_app

class NotionService:
    def __init__(self):
        self.api_key = current_app.config.get('NOTION_API_KEY')
        self.base_url = "https://api.notion.com/v1"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28"
        }

    def query_database(self, database_id: str, filter_params: dict = None, sorts: list = None):
        """
        Queries a Notion database.
        
        :param database_id: The ID of the Notion database.
        :param filter_params: A dictionary for filtering results.
        :param sorts: A list of dictionaries for sorting results.
        :return: The JSON response from the Notion API.
        """
        if not self.api_key:
            return {"error": "Notion API key not configured"}

        query_url = f"{self.base_url}/databases/{database_id}/query"
        
        payload = {}
        if filter_params:
            payload['filter'] = filter_params
        if sorts:
            payload['sorts'] = sorts

        try:
            response = requests.post(query_url, headers=self.headers, json=payload)
            response.raise_for_status()  # Raise an exception for bad status codes
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"error": f"API request failed: {str(e)}"}

    def get_all_characters(self):
        """Fetches all records from the Characters database."""
        db_id = current_app.config.get('NOTION_CHARACTERS_DB_ID')
        if not db_id:
            return {"error": "NOTION_CHARACTERS_DB_ID is not set in .env"}
        return self.query_database(database_id=db_id)

    def get_all_scenes(self):
        """Fetches all records from the Scenes database."""
        db_id = current_app.config.get('NOTION_SCENES_DB_ID')
        if not db_id:
            return {"error": "NOTION_SCENES_DB_ID is not set in .env"}
        return self.query_database(database_id=db_id)

    def get_all_tasks(self):
        """Fetches all records from the Tasks database."""
        db_id = current_app.config.get('NOTION_TASKS_DB_ID')
        if not db_id:
            return {"error": "NOTION_TASKS_DB_ID is not set in .env"}
        return self.query_database(database_id=db_id)

    # Add more methods here to interact with other databases...
