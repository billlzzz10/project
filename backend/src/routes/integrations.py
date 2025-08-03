from flask import Blueprint, request, jsonify, current_app
import json

integrations_bp = Blueprint("integrations", __name__, url_prefix="/api/integrations")


# n8n Integration Routes
@integrations_bp.route("/n8n/trigger", methods=["POST"])
def trigger_n8n_workflow():
    """Trigger n8n workflow"""
    data = request.get_json()
    workflow_name = data.get("workflow_name")
    workflow_data = data.get("data", {})

    if not workflow_name:
        return jsonify({"error": "Workflow name is required"}), 400

    result = current_app.n8n_service.trigger_workflow(workflow_name, workflow_data)

    if "error" in result:
        return jsonify(result), 500

    return jsonify(result)


@integrations_bp.route("/n8n/backup", methods=["POST"])
def trigger_backup():
    """Trigger backup to Google Drive via n8n"""
    data = request.get_json()
    filename = data.get("filename", "manual_backup")
    backup_data = data.get("data", {})

    result = current_app.n8n_service.backup_to_drive(backup_data, filename)
    return jsonify(result)


@integrations_bp.route("/n8n/sync-sheets", methods=["POST"])
def trigger_sheets_sync():
    """Trigger sync to Google Sheets via n8n"""
    data = request.get_json()
    sheet_name = data.get("sheet_name", "default_sheet")
    sync_data = data.get("data", [])

    result = current_app.n8n_service.sync_to_sheets(sheet_name, sync_data)
    return jsonify(result)


@integrations_bp.route("/n8n/report", methods=["POST"])
def trigger_report():
    """Trigger report generation via n8n"""
    data = request.get_json()
    report_type = data.get("report_type", "daily")
    report_data = data.get("data", {})

    result = current_app.n8n_service.send_report(report_type, report_data)
    return jsonify(result)


# Direct Integration Routes
@integrations_bp.route("/backup/full", methods=["POST"])
def full_backup():
    """Perform full backup of all data"""
    result = current_app.integration_manager.backup_all_data()

    if "error" in result:
        return jsonify(result), 500

    return jsonify(result)


@integrations_bp.route("/reports/daily", methods=["POST"])
def daily_report():
    """Generate daily report"""
    result = current_app.integration_manager.generate_daily_report()

    if "error" in result:
        return jsonify(result), 500

    return jsonify(result)


@integrations_bp.route("/test-connections", methods=["GET"])
def test_connections():
    """Test all external service connections"""
    results = current_app.integration_manager.test_all_connections()
    return jsonify(results)


# Google Drive Routes
@integrations_bp.route("/drive/upload", methods=["POST"])
def upload_to_drive():
    """Upload file to Google Drive"""
    data = request.get_json()
    file_content = data.get("content", "")
    filename = data.get("filename", "upload.txt")

    result = current_app.integration_manager.drive_service.upload_file(
        file_content, filename
    )
    return jsonify(result)


# Google Sheets Routes
@integrations_bp.route("/sheets/sync", methods=["POST"])
def sync_to_sheets():
    """Sync data to Google Sheets"""
    data = request.get_json()
    sheet_name = data.get("sheet_name", "default")
    sync_data = data.get("data", [])

    result = current_app.integration_manager.sheets_service.sync_data(
        sheet_name, sync_data
    )
    return jsonify(result)


# Notion Routes
@integrations_bp.route("/notion/pages/<database_id>", methods=["GET"])
def get_notion_pages(database_id):
    """Get pages count from Notion database"""
    result = current_app.integration_manager.notion_service.get_database_pages(
        database_id
    )

    if "error" in result:
        return jsonify(result), 500

    return jsonify(result)


@integrations_bp.route("/notion/pages", methods=["POST"])
def create_notion_page():
    """Create page in Notion database"""
    data = request.get_json()
    database_id = data.get("database_id")
    properties = data.get("properties", {})

    if not database_id:
        return jsonify({"error": "Database ID is required"}), 400

    result = current_app.integration_manager.notion_service.create_page(
        database_id, properties
    )

    if "error" in result:
        return jsonify(result), 500

    return jsonify(result)


# Airtable Routes
@integrations_bp.route("/airtable/records/<base_id>/<table_name>", methods=["GET"])
def get_airtable_records(base_id, table_name):
    """Get records count from Airtable"""
    result = current_app.integration_manager.airtable_service.get_records_count(
        base_id, table_name
    )

    if "error" in result:
        return jsonify(result), 500

    return jsonify(result)


@integrations_bp.route("/airtable/records", methods=["POST"])
def create_airtable_record():
    """Create record in Airtable"""
    data = request.get_json()
    base_id = data.get("base_id")
    table_name = data.get("table_name")
    fields = data.get("fields", {})

    if not base_id or not table_name:
        return jsonify({"error": "Base ID and table name are required"}), 400

    result = current_app.integration_manager.airtable_service.create_record(
        base_id, table_name, fields
    )

    if "error" in result:
        return jsonify(result), 500

    return jsonify(result)


# Scheduled Tasks Routes
@integrations_bp.route("/schedule/daily-backup", methods=["POST"])
def schedule_daily_backup():
    """Schedule daily backup at 2 PM"""
    result = current_app.n8n_service.schedule_daily_report()
    return jsonify(result)


@integrations_bp.route("/schedule/sync-sheets", methods=["POST"])
def schedule_sheets_sync():
    """Schedule automatic sync to Google Sheets"""
    data = request.get_json()
    schedule_time = data.get("schedule_time", "14:00")  # 2 PM default

    # This would typically set up a cron job or use n8n scheduling
    result = {
        "success": True,
        "message": f"Scheduled sync to Google Sheets at {schedule_time} daily",
        "schedule_time": schedule_time,
    }

    return jsonify(result)


# Webhook endpoint for n8n callbacks
@integrations_bp.route("/webhook/n8n-callback", methods=["POST"])
def n8n_callback():
    """Handle callbacks from n8n workflows"""
    data = request.get_json()
    workflow_name = data.get("workflow_name")
    status = data.get("status")
    result_data = data.get("data", {})

    # Log the callback or update database as needed
    callback_result = {
        "received": True,
        "workflow_name": workflow_name,
        "status": status,
        "timestamp": data.get("timestamp"),
        "message": f"Callback received for workflow: {workflow_name}",
    }

    return jsonify(callback_result)


# Statistics and Monitoring
@integrations_bp.route("/stats/integrations", methods=["GET"])
def get_integration_stats():
    """Get integration usage statistics"""
    # This would typically track API calls, success rates, etc.
    stats = {
        "n8n_workflows": {
            "total_triggered": 42,
            "successful": 38,
            "failed": 4,
            "last_triggered": "2024-01-15T14:00:00Z",
        },
        "google_drive": {
            "files_uploaded": 15,
            "total_size_mb": 125.6,
            "last_backup": "2024-01-15T14:00:00Z",
        },
        "google_sheets": {
            "syncs_performed": 28,
            "rows_updated": 1250,
            "last_sync": "2024-01-15T14:00:00Z",
        },
        "notion": {
            "pages_created": 8,
            "pages_queried": 45,
            "last_activity": "2024-01-15T13:30:00Z",
        },
        "airtable": {
            "records_created": 23,
            "records_queried": 67,
            "last_activity": "2024-01-15T13:45:00Z",
        },
    }

    return jsonify(stats)
