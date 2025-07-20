import requests
import json
from datetime import datetime
from src.config import Config

class N8NService:
    def __init__(self):
        self.webhook_url = Config.N8N_WEBHOOK_URL
        self.base_url = "http://localhost:5678"  # Default n8n URL
        
    def trigger_workflow(self, workflow_name, data=None):
        """Trigger n8n workflow via webhook"""
        if not self.webhook_url:
            return {"error": "n8n webhook URL not configured"}
        
        try:
            payload = {
                "workflow": workflow_name,
                "timestamp": datetime.utcnow().isoformat(),
                "data": data or {}
            }
            
            response = requests.post(
                self.webhook_url,
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            if response.status_code == 200:
                return {"success": True, "response": response.json()}
            else:
                return {"error": f"n8n webhook failed with status {response.status_code}"}
                
        except Exception as e:
            return {"error": f"n8n webhook error: {str(e)}"}
    
    def backup_to_drive(self, data, filename):
        """Trigger backup workflow to Google Drive"""
        return self.trigger_workflow("backup_to_drive", {
            "filename": filename,
            "data": data,
            "timestamp": datetime.utcnow().isoformat()
        })
    
    def sync_to_sheets(self, sheet_name, data):
        """Trigger sync workflow to Google Sheets"""
        return self.trigger_workflow("sync_to_sheets", {
            "sheet_name": sheet_name,
            "data": data,
            "timestamp": datetime.utcnow().isoformat()
        })
    
    def send_report(self, report_type, report_data):
        """Trigger report generation workflow"""
        return self.trigger_workflow("generate_report", {
            "report_type": report_type,
            "report_data": report_data,
            "timestamp": datetime.utcnow().isoformat()
        })
    
    def get_notion_pages(self, database_id=None):
        """Trigger workflow to get Notion pages count"""
        return self.trigger_workflow("get_notion_stats", {
            "database_id": database_id,
            "action": "count_pages"
        })
    
    def get_airtable_records(self, base_id=None, table_name=None):
        """Trigger workflow to get Airtable records count"""
        return self.trigger_workflow("get_airtable_stats", {
            "base_id": base_id,
            "table_name": table_name,
            "action": "count_records"
        })
    
    def schedule_daily_report(self):
        """Schedule daily report at 2 PM (14:00)"""
        return self.trigger_workflow("schedule_daily_report", {
            "schedule_time": "14:00",
            "timezone": "Asia/Bangkok"
        })

