import requests
import json
import os
from datetime import datetime
from flask import current_app

class GoogleDriveService:
    def __init__(self):
        self.api_base = "https://www.googleapis.com/drive/v3"
        
    @property
    def credentials_path(self):
        return current_app.config.get('GOOGLE_DRIVE_CREDENTIALS')

    def upload_file(self, file_content, filename, folder_id=None):
        """Upload file to Google Drive"""
        # This is a placeholder - in real implementation, you'd use Google Drive API
        # with proper authentication
        return {
            "success": True,
            "file_id": f"drive_file_{datetime.utcnow().timestamp()}",
            "filename": filename,
            "message": "File uploaded successfully (simulated)"
        }
    
    def create_backup(self, data, backup_name):
        """Create backup file in Google Drive"""
        backup_content = json.dumps(data, indent=2, ensure_ascii=False)
        filename = f"backup_{backup_name}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json"
        return self.upload_file(backup_content, filename)

class GoogleSheetsService:
    def __init__(self):
        self.api_base = "https://sheets.googleapis.com/v4/spreadsheets"

    @property
    def credentials_path(self):
        return current_app.config.get('GOOGLE_SHEETS_CREDENTIALS')
        
    def update_sheet(self, spreadsheet_id, range_name, values):
        """Update Google Sheets with data"""
        # This is a placeholder - in real implementation, you'd use Google Sheets API
        return {
            "success": True,
            "spreadsheet_id": spreadsheet_id,
            "updated_range": range_name,
            "updated_rows": len(values),
            "message": "Sheet updated successfully (simulated)"
        }
    
    def sync_data(self, sheet_name, data):
        """Sync data to Google Sheets"""
        # Convert data to sheet format
        if isinstance(data, list) and len(data) > 0:
            if isinstance(data[0], dict):
                # Convert list of dicts to rows
                headers = list(data[0].keys())
                rows = [headers] + [[item.get(key, '') for key in headers] for item in data]
            else:
                rows = [data]
        else:
            rows = [[str(data)]]
        
        return self.update_sheet("simulated_sheet_id", f"{sheet_name}!A1", rows)

class NotionService:
    def __init__(self):
        self.api_base = "https://api.notion.com/v1"

    @property
    def api_key(self):
        return current_app.config.get('NOTION_API_KEY')

    @property
    def headers(self):
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Notion-Version": "2022-06-28",
            "Content-Type": "application/json"
        }
    
    def get_database_pages(self, database_id):
        """Get pages count from Notion database"""
        if not self.api_key:
            return {"error": "Notion API key not configured"}
        
        try:
            # This is a placeholder - in real implementation, you'd make actual API calls
            return {
                "success": True,
                "database_id": database_id,
                "pages_count": 42,  # Simulated count
                "message": "Pages count retrieved successfully (simulated)"
            }
        except Exception as e:
            return {"error": f"Notion API error: {str(e)}"}
    
    def create_page(self, database_id, properties):
        """Create a new page in Notion database"""
        if not self.api_key:
            return {"error": "Notion API key not configured"}
        
        try:
            # Simulated page creation
            return {
                "success": True,
                "page_id": f"notion_page_{datetime.utcnow().timestamp()}",
                "database_id": database_id,
                "message": "Page created successfully (simulated)"
            }
        except Exception as e:
            return {"error": f"Notion API error: {str(e)}"}

class AirtableService:
    def __init__(self):
        self.api_base = "https://api.airtable.com/v0"

    @property
    def api_key(self):
        return current_app.config.get('AIRTABLE_API_KEY')

    @property
    def headers(self):
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    def get_records_count(self, base_id, table_name):
        """Get records count from Airtable"""
        if not self.api_key:
            return {"error": "Airtable API key not configured"}
        
        try:
            # This is a placeholder - in real implementation, you'd make actual API calls
            return {
                "success": True,
                "base_id": base_id,
                "table_name": table_name,
                "records_count": 156,  # Simulated count
                "message": "Records count retrieved successfully (simulated)"
            }
        except Exception as e:
            return {"error": f"Airtable API error: {str(e)}"}
    
    def create_record(self, base_id, table_name, fields):
        """Create a new record in Airtable"""
        if not self.api_key:
            return {"error": "Airtable API key not configured"}
        
        try:
            # Simulated record creation
            return {
                "success": True,
                "record_id": f"airtable_record_{datetime.utcnow().timestamp()}",
                "base_id": base_id,
                "table_name": table_name,
                "message": "Record created successfully (simulated)"
            }
        except Exception as e:
            return {"error": f"Airtable API error: {str(e)}"}

class IntegrationManager:
    def __init__(self):
        self.drive_service = GoogleDriveService()
        self.sheets_service = GoogleSheetsService()
        self.notion_service = NotionService()
        self.airtable_service = AirtableService()
    
    def backup_all_data(self):
        """Backup all application data"""
        from ..models import ChatSession, ChatMessage, PromptTemplate, GeneratedTool, User
        
        try:
            # Collect all data
            backup_data = {
                "timestamp": datetime.utcnow().isoformat(),
                "users": [user.to_dict() for user in User.query.all()],
                "chat_sessions": [session.to_dict() for session in ChatSession.query.all()],
                "chat_messages": [message.to_dict() for message in ChatMessage.query.all()],
                "prompt_templates": [prompt.to_dict() for prompt in PromptTemplate.query.all()],
                "generated_tools": [tool.to_dict() for tool in GeneratedTool.query.all()]
            }
            
            # Backup to Google Drive
            result = self.drive_service.create_backup(backup_data, "full_backup")
            
            # Also sync to Google Sheets
            self.sheets_service.sync_data("backup_log", [{
                "timestamp": backup_data["timestamp"],
                "users_count": len(backup_data["users"]),
                "sessions_count": len(backup_data["chat_sessions"]),
                "messages_count": len(backup_data["chat_messages"]),
                "prompts_count": len(backup_data["prompt_templates"]),
                "tools_count": len(backup_data["generated_tools"])
            }])
            
            return result
            
        except Exception as e:
            return {"error": f"Backup failed: {str(e)}"}
    
    def generate_daily_report(self):
        """Generate daily report with stats from all systems"""
        try:
            # Get Notion stats
            notion_stats = self.notion_service.get_database_pages("default_database")
            
            # Get Airtable stats
            airtable_stats = self.airtable_service.get_records_count("default_base", "default_table")
            
            # Get local app stats
            from ..models import ChatSession, ChatMessage, PromptTemplate, GeneratedTool
            
            report_data = {
                "date": datetime.utcnow().strftime("%Y-%m-%d"),
                "timestamp": datetime.utcnow().isoformat(),
                "app_stats": {
                    "chat_sessions": ChatSession.query.count(),
                    "chat_messages": ChatMessage.query.count(),
                    "prompt_templates": PromptTemplate.query.count(),
                    "generated_tools": GeneratedTool.query.count()
                },
                "notion_stats": notion_stats,
                "airtable_stats": airtable_stats
            }
            
            # Sync to Google Sheets
            self.sheets_service.sync_data("daily_reports", [report_data])
            
            return {
                "success": True,
                "report_data": report_data,
                "message": "Daily report generated successfully"
            }
            
        except Exception as e:
            return {"error": f"Report generation failed: {str(e)}"}
    
    def test_all_connections(self):
        """Test all external service connections"""
        results = {
            "google_drive": {"status": "simulated", "message": "Connection OK (simulated)"},
            "google_sheets": {"status": "simulated", "message": "Connection OK (simulated)"},
            "notion": {"status": "simulated" if self.notion_service.api_key else "not_configured", 
                      "message": "API key configured" if self.notion_service.api_key else "API key not configured"},
            "airtable": {"status": "simulated" if self.airtable_service.api_key else "not_configured",
                        "message": "API key configured" if self.airtable_service.api_key else "API key not configured"}
        }
        
        return results

