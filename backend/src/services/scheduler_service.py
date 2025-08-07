import schedule
import time
import threading
from datetime import datetime, timedelta
import json
import logging
from ..services.external_integrations import IntegrationManager
from ..services.n8n_service import N8NService

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class SchedulerService:
    def __init__(self):
        self.integration_manager = IntegrationManager()
        self.n8n_service = N8NService()
        self.is_running = False
        self.scheduler_thread = None

    def start_scheduler(self):
        """Start the scheduler in a separate thread"""
        if self.is_running:
            logger.info("Scheduler is already running")
            return

        self.is_running = True
        self.scheduler_thread = threading.Thread(
            target=self._run_scheduler, daemon=True
        )
        self.scheduler_thread.start()
        logger.info("Scheduler started successfully")

    def stop_scheduler(self):
        """Stop the scheduler"""
        self.is_running = False
        if self.scheduler_thread:
            self.scheduler_thread.join(timeout=5)
        logger.info("Scheduler stopped")

    def _run_scheduler(self):
        """Run the scheduler loop"""
        while self.is_running:
            schedule.run_pending()
            time.sleep(60)  # Check every minute

    def setup_schedules(self):
        """Setup all scheduled tasks"""
        # Daily backup at 2:00 AM
        schedule.every().day.at("02:00").do(self.daily_backup_job)

        # Daily report at 2:00 PM (14:00)
        schedule.every().day.at("14:00").do(self.daily_report_job)

        # Sync to Google Sheets every 2 hours
        schedule.every(2).hours.do(self.sync_sheets_job)

        # Weekly full backup on Sunday at 3:00 AM
        schedule.every().sunday.at("03:00").do(self.weekly_backup_job)

        # Monthly cleanup on 1st day at 4:00 AM
        schedule.every().month.do(self.monthly_cleanup_job)

        logger.info("All scheduled tasks have been set up")

    def daily_backup_job(self):
        """Daily backup job"""
        try:
            logger.info("Starting daily backup job")
            result = self.integration_manager.backup_all_data()

            if result.get("success"):
                logger.info(
                    f"Daily backup completed successfully: {result.get('message')}"
                )

                # Trigger n8n workflow for backup notification
                self.n8n_service.trigger_workflow(
                    "backup_notification",
                    {
                        "type": "daily_backup",
                        "status": "success",
                        "timestamp": datetime.utcnow().isoformat(),
                        "result": result,
                    },
                )
            else:
                logger.error(f"Daily backup failed: {result.get('error')}")

                # Trigger n8n workflow for backup failure notification
                self.n8n_service.trigger_workflow(
                    "backup_notification",
                    {
                        "type": "daily_backup",
                        "status": "failed",
                        "timestamp": datetime.utcnow().isoformat(),
                        "error": result.get("error"),
                    },
                )

        except Exception as e:
            logger.error(f"Daily backup job failed with exception: {str(e)}")

    def daily_report_job(self):
        """Daily report job at 2 PM"""
        try:
            logger.info("Starting daily report job")
            result = self.integration_manager.generate_daily_report()

            if result.get("success"):
                logger.info(f"Daily report generated successfully")

                # Trigger n8n workflow for report distribution
                self.n8n_service.trigger_workflow(
                    "distribute_report",
                    {
                        "type": "daily_report",
                        "timestamp": datetime.utcnow().isoformat(),
                        "report_data": result.get("report_data"),
                    },
                )
            else:
                logger.error(f"Daily report generation failed: {result.get('error')}")

        except Exception as e:
            logger.error(f"Daily report job failed with exception: {str(e)}")

    def sync_sheets_job(self):
        """Sync data to Google Sheets every 2 hours"""
        try:
            logger.info("Starting Google Sheets sync job")

            # Get current stats
            from ..models import ChatSession, ChatMessage, PromptTemplate, GeneratedTool

            current_stats = {
                "timestamp": datetime.utcnow().isoformat(),
                "chat_sessions": ChatSession.query.count(),
                "chat_messages": ChatMessage.query.count(),
                "prompt_templates": PromptTemplate.query.count(),
                "generated_tools": GeneratedTool.query.count(),
            }

            # Sync to Google Sheets
            result = self.integration_manager.sheets_service.sync_data(
                "hourly_stats", [current_stats]
            )

            if result.get("success"):
                logger.info("Google Sheets sync completed successfully")
            else:
                logger.error(f"Google Sheets sync failed: {result}")

        except Exception as e:
            logger.error(f"Google Sheets sync job failed with exception: {str(e)}")

    def weekly_backup_job(self):
        """Weekly full backup job"""
        try:
            logger.info("Starting weekly backup job")

            # Perform full backup with additional metadata
            result = self.integration_manager.backup_all_data()

            if result.get("success"):
                logger.info("Weekly backup completed successfully")

                # Trigger n8n workflow for weekly backup notification
                self.n8n_service.trigger_workflow(
                    "weekly_backup_notification",
                    {
                        "type": "weekly_backup",
                        "status": "success",
                        "timestamp": datetime.utcnow().isoformat(),
                        "result": result,
                    },
                )
            else:
                logger.error(f"Weekly backup failed: {result.get('error')}")

        except Exception as e:
            logger.error(f"Weekly backup job failed with exception: {str(e)}")

    def monthly_cleanup_job(self):
        """Monthly cleanup job"""
        try:
            logger.info("Starting monthly cleanup job")

            # Clean up old chat messages (older than 6 months)
            from ..models import ChatMessage, db

            six_months_ago = datetime.utcnow() - timedelta(days=180)
            old_messages = ChatMessage.query.filter(
                ChatMessage.timestamp < six_months_ago
            ).all()

            cleanup_stats = {
                "old_messages_count": len(old_messages),
                "cleanup_date": datetime.utcnow().isoformat(),
            }

            # Delete old messages
            for message in old_messages:
                db.session.delete(message)

            db.session.commit()

            logger.info(
                f"Monthly cleanup completed: removed {len(old_messages)} old messages"
            )

            # Trigger n8n workflow for cleanup notification
            self.n8n_service.trigger_workflow(
                "cleanup_notification",
                {
                    "type": "monthly_cleanup",
                    "timestamp": datetime.utcnow().isoformat(),
                    "stats": cleanup_stats,
                },
            )

        except Exception as e:
            logger.error(f"Monthly cleanup job failed with exception: {str(e)}")

    def manual_backup(self):
        """Trigger manual backup"""
        try:
            logger.info("Starting manual backup")
            result = self.integration_manager.backup_all_data()
            return result
        except Exception as e:
            logger.error(f"Manual backup failed: {str(e)}")
            return {"error": str(e)}

    def manual_report(self):
        """Trigger manual report generation"""
        try:
            logger.info("Starting manual report generation")
            result = self.integration_manager.generate_daily_report()
            return result
        except Exception as e:
            logger.error(f"Manual report generation failed: {str(e)}")
            return {"error": str(e)}

    def get_schedule_status(self):
        """Get current schedule status"""
        jobs = []
        for job in schedule.jobs:
            jobs.append(
                {
                    "job": str(job.job_func.__name__),
                    "next_run": job.next_run.isoformat() if job.next_run else None,
                    "interval": str(job.interval),
                    "unit": job.unit,
                }
            )

        return {
            "is_running": self.is_running,
            "jobs_count": len(schedule.jobs),
            "jobs": jobs,
            "last_check": datetime.utcnow().isoformat(),
        }

    def add_custom_schedule(self, job_name, schedule_time, job_function):
        """Add custom scheduled job"""
        try:
            if schedule_time.endswith(":00"):
                # Daily schedule
                schedule.every().day.at(schedule_time).do(job_function)
            else:
                # Interval schedule (in hours)
                interval = int(schedule_time)
                schedule.every(interval).hours.do(job_function)

            logger.info(f"Custom schedule added: {job_name} at {schedule_time}")
            return {"success": True, "message": f"Schedule added for {job_name}"}

        except Exception as e:
            logger.error(f"Failed to add custom schedule: {str(e)}")
            return {"error": str(e)}

    def remove_schedule(self, job_name):
        """Remove scheduled job"""
        try:
            # Find and remove job by function name
            jobs_to_remove = [
                job for job in schedule.jobs if job.job_func.__name__ == job_name
            ]

            for job in jobs_to_remove:
                schedule.cancel_job(job)

            logger.info(f"Removed {len(jobs_to_remove)} jobs for {job_name}")
            return {"success": True, "message": f"Removed {len(jobs_to_remove)} jobs"}

        except Exception as e:
            logger.error(f"Failed to remove schedule: {str(e)}")
            return {"error": str(e)}


# Global scheduler instance
scheduler_service = SchedulerService()
