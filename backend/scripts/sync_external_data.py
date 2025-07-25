import os
import sys
from datetime import datetime
from pathlib import Path

# Add the parent directory (backend) to the Python path
sys.path.append(str(Path(__file__).parent.parent))

from src.main import create_app
from src.services.notion_service import NotionService
# We will create AirtableService later
# from src.services.airtable_service import AirtableService 
# from src.services.external_integrations import GoogleSheetsService

def run_sync():
    """
    Main function to run the data synchronization process.
    This function is executed by the GitHub Action.
    """
    print(f"Starting data sync at {datetime.utcnow().isoformat()} UTC...")

    # Create a Flask app context to access services and configs
    app = create_app()
    with app.app_context():
        notion_service = getattr(app, "notion_service", None)
        # airtable_service = AirtableService() # To be implemented
        # gsheets_service = GoogleSheetsService() # To be implemented

        # --- 1. Fetch data from Notion ---
        print("Fetching data from Notion...")

        if notion_service is None:
            print("  Error: NotionService is not initialized in the app context.")
            sys.exit(1)

        tasks = notion_service.get_all_tasks()
        if 'error' in tasks:
            print(f"  Error fetching Notion tasks: {tasks['error']}")
            # Decide if we should exit or continue
            # For now, we'll print the error and exit
            sys.exit(1) 
        
        print(f"  Successfully fetched {len(tasks.get('results', []))} tasks from Notion.")

        # --- 2. Sync data to Airtable (Placeholder) ---
        print("\nSyncing data to Airtable (Placeholder)...")
        # To be implemented:
        # for task in tasks.get('results', []):
        #     airtable_service.create_or_update_task(task)
        print("  Airtable sync logic needs to be implemented.")


        # --- 3. Log sync results to Google Sheets (Placeholder) ---
        print("\nLogging sync results to Google Sheets (Placeholder)...")
        # To be implemented:
        # log_data = [{
        #     "timestamp": datetime.utcnow().isoformat(),
        #     "status": "Success",
        #     "notion_tasks_fetched": len(tasks.get('results', [])),
        #     "airtable_records_updated": len(tasks.get('results', []))
        # }]
        # gsheets_service.sync_data("sync_log", log_data)
        print("  Google Sheets logging logic needs to be implemented.")


        print(f"\nData sync finished at {datetime.utcnow().isoformat()} UTC.")


if __name__ == "__main__":
    # This allows the script to be run directly for testing
    # Note: It requires all environment variables to be set locally
    run_sync()
