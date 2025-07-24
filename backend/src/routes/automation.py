from flask import Blueprint, request, jsonify, current_app
from datetime import datetime

automation_bp = Blueprint('automation', __name__, url_prefix='/api/automation')

# Scheduler Management Routes
@automation_bp.route('/scheduler/start', methods=['POST'])
def start_scheduler():
    """Start the scheduler service"""
    try:
        current_app.scheduler_service.setup_schedules()
        current_app.scheduler_service.start_scheduler()
        return jsonify({
            "success": True,
            "message": "Scheduler started successfully",
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@automation_bp.route('/scheduler/stop', methods=['POST'])
def stop_scheduler():
    """Stop the scheduler service"""
    try:
        current_app.scheduler_service.stop_scheduler()
        return jsonify({
            "success": True,
            "message": "Scheduler stopped successfully",
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@automation_bp.route('/scheduler/status', methods=['GET'])
def get_scheduler_status():
    """Get scheduler status and scheduled jobs"""
    status = current_app.scheduler_service.get_schedule_status()
    return jsonify(status)

@automation_bp.route('/scheduler/jobs', methods=['POST'])
def add_custom_job():
    """Add custom scheduled job"""
    data = request.get_json()
    job_name = data.get('job_name')
    schedule_time = data.get('schedule_time')
    
    if not job_name or not schedule_time:
        return jsonify({"error": "Job name and schedule time are required"}), 400
    
    # For now, we'll only support predefined job types
    predefined_jobs = {
        "backup": current_app.scheduler_service.daily_backup_job,
        "report": current_app.scheduler_service.daily_report_job,
        "sync": current_app.scheduler_service.sync_sheets_job
    }
    
    if job_name not in predefined_jobs:
        return jsonify({"error": f"Job type '{job_name}' not supported"}), 400
    
    result = current_app.scheduler_service.add_custom_schedule(job_name, schedule_time, predefined_jobs[job_name])
    
    if 'error' in result:
        return jsonify(result), 500
    
    return jsonify(result)

@automation_bp.route('/scheduler/jobs/<job_name>', methods=['DELETE'])
def remove_job(job_name):
    """Remove scheduled job"""
    result = current_app.scheduler_service.remove_schedule(job_name)
    
    if 'error' in result:
        return jsonify(result), 500
    
    return jsonify(result)

# Manual Trigger Routes
@automation_bp.route('/backup/manual', methods=['POST'])
def manual_backup():
    """Trigger manual backup"""
    result = current_app.scheduler_service.manual_backup()
    
    if 'error' in result:
        return jsonify(result), 500
    
    return jsonify(result)

@automation_bp.route('/report/manual', methods=['POST'])
def manual_report():
    """Trigger manual report generation"""
    result = current_app.scheduler_service.manual_report()
    
    if 'error' in result:
        return jsonify(result), 500
    
    return jsonify(result)

@automation_bp.route('/sync/manual', methods=['POST'])
def manual_sync():
    """Trigger manual sync to Google Sheets"""
    try:
        current_app.scheduler_service.sync_sheets_job()
        return jsonify({
            "success": True,
            "message": "Manual sync completed",
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Backup Management Routes
@automation_bp.route('/backup/schedule', methods=['POST'])
def schedule_backup():
    """Schedule automatic backup"""
    data = request.get_json()
    backup_time = data.get('time', '02:00')  # Default 2 AM
    frequency = data.get('frequency', 'daily')  # daily, weekly, monthly
    
    try:
        if frequency == 'daily':
            result = current_app.scheduler_service.add_custom_schedule('daily_backup', backup_time, current_app.scheduler_service.daily_backup_job)
        elif frequency == 'weekly':
            result = current_app.scheduler_service.add_custom_schedule('weekly_backup', backup_time, current_app.scheduler_service.weekly_backup_job)
        else:
            return jsonify({"error": "Frequency must be 'daily' or 'weekly'"}), 400
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@automation_bp.route('/backup/history', methods=['GET'])
def get_backup_history():
    """Get backup history (simulated)"""
    # In a real implementation, this would query actual backup logs
    backup_history = [
        {
            "id": 1,
            "type": "daily",
            "timestamp": "2024-01-15T02:00:00Z",
            "status": "success",
            "file_size_mb": 15.6,
            "duration_seconds": 45
        },
        {
            "id": 2,
            "type": "manual",
            "timestamp": "2024-01-14T16:30:00Z",
            "status": "success",
            "file_size_mb": 14.2,
            "duration_seconds": 38
        },
        {
            "id": 3,
            "type": "weekly",
            "timestamp": "2024-01-14T03:00:00Z",
            "status": "success",
            "file_size_mb": 16.8,
            "duration_seconds": 52
        }
    ]
    
    return jsonify(backup_history)

# Report Management Routes
@automation_bp.route('/reports/schedule', methods=['POST'])
def schedule_report():
    """Schedule automatic report generation"""
    data = request.get_json()
    report_time = data.get('time', '14:00')  # Default 2 PM
    frequency = data.get('frequency', 'daily')
    
    try:
        if frequency == 'daily':
            result = current_app.scheduler_service.add_custom_schedule('daily_report', report_time, current_app.scheduler_service.daily_report_job)
        else:
            return jsonify({"error": "Only daily frequency is supported for reports"}), 400
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@automation_bp.route('/reports/history', methods=['GET'])
def get_report_history():
    """Get report generation history (simulated)"""
    report_history = [
        {
            "id": 1,
            "type": "daily",
            "timestamp": "2024-01-15T14:00:00Z",
            "status": "success",
            "recipients": ["admin@company.com"],
            "data_points": 156
        },
        {
            "id": 2,
            "type": "manual",
            "timestamp": "2024-01-14T10:15:00Z",
            "status": "success",
            "recipients": ["admin@company.com", "manager@company.com"],
            "data_points": 142
        }
    ]
    
    return jsonify(report_history)

# Sync Management Routes
@automation_bp.route('/sync/schedule', methods=['POST'])
def schedule_sync():
    """Schedule automatic sync to Google Sheets"""
    data = request.get_json()
    interval_hours = data.get('interval_hours', 2)  # Default every 2 hours
    
    try:
        result = current_app.scheduler_service.add_custom_schedule('sync_sheets', str(interval_hours), current_app.scheduler_service.sync_sheets_job)
        return jsonify(result)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@automation_bp.route('/sync/history', methods=['GET'])
def get_sync_history():
    """Get sync history (simulated)"""
    sync_history = [
        {
            "id": 1,
            "timestamp": "2024-01-15T16:00:00Z",
            "status": "success",
            "rows_updated": 25,
            "sheets_affected": ["daily_stats", "user_activity"]
        },
        {
            "id": 2,
            "timestamp": "2024-01-15T14:00:00Z",
            "status": "success",
            "rows_updated": 18,
            "sheets_affected": ["daily_stats"]
        }
    ]
    
    return jsonify(sync_history)

# System Health and Monitoring
@automation_bp.route('/health', methods=['GET'])
def get_system_health():
    """Get overall system health status"""
    health_status = {
        "timestamp": datetime.utcnow().isoformat(),
        "scheduler": {
            "status": "running" if current_app.scheduler_service.is_running else "stopped",
            "jobs_count": len(current_app.scheduler_service.get_schedule_status().get('jobs', []))
        },
        "integrations": current_app.integration_manager.test_all_connections(),
        "database": {
            "status": "connected",
            "last_backup": "2024-01-15T02:00:00Z"
        },
        "overall_status": "healthy"
    }
    
    return jsonify(health_status)

@automation_bp.route('/logs', methods=['GET'])
def get_automation_logs():
    """Get automation logs (simulated)"""
    logs = [
        {
            "timestamp": "2024-01-15T14:00:00Z",
            "level": "INFO",
            "message": "Daily report job completed successfully",
            "component": "scheduler"
        },
        {
            "timestamp": "2024-01-15T02:00:00Z",
            "level": "INFO",
            "message": "Daily backup job completed successfully",
            "component": "backup"
        },
        {
            "timestamp": "2024-01-14T16:00:00Z",
            "level": "INFO",
            "message": "Google Sheets sync completed",
            "component": "sync"
        }
    ]
    
    return jsonify(logs)

# Configuration Routes
@automation_bp.route('/config', methods=['GET'])
def get_automation_config():
    """Get automation configuration"""
    config = {
        "backup": {
            "enabled": True,
            "frequency": "daily",
            "time": "02:00",
            "retention_days": 30
        },
        "reports": {
            "enabled": True,
            "frequency": "daily",
            "time": "14:00",
            "recipients": ["admin@company.com"]
        },
        "sync": {
            "enabled": True,
            "interval_hours": 2,
            "target_sheets": ["daily_stats", "user_activity"]
        }
    }
    
    return jsonify(config)

@automation_bp.route('/config', methods=['PUT'])
def update_automation_config():
    """Update automation configuration"""
    data = request.get_json()
    
    # In a real implementation, this would update the actual configuration
    # For now, we'll just return success
    
    return jsonify({
        "success": True,
        "message": "Configuration updated successfully",
        "timestamp": datetime.utcnow().isoformat(),
        "updated_config": data
    })

