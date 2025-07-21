import json
from datetime import datetime
from ..models import db, Notification
import socketio

# Create Socket.IO server
sio = socketio.Server(cors_allowed_origins='*', async_mode='threading')
sio_app = socketio.WSGIApp(sio)

class NotificationService:
    def __init__(self):
        self.connected_users = {}  # Map of user_id to sid (session ID)
    
    def add_notification(self, user_id, title, message, notification_type='info', action_url=None):
        """Add a new notification to the database"""
        try:
            notification = Notification(
                user_id=user_id,
                title=title,
                message=message,
                type=notification_type,
                action_url=action_url,
                is_read=False,
                created_at=datetime.utcnow()
            )
            
            db.session.add(notification)
            db.session.commit()
            
            # Send real-time notification if user is connected
            self.send_notification_to_user(user_id, notification.to_dict())
            
            return notification.id
        except Exception as e:
            print(f"Error adding notification: {e}")
            db.session.rollback()
            return None
    
    def get_notifications(self, user_id, limit=20, offset=0, include_read=False):
        """Get notifications for a user"""
        try:
            query = Notification.query.filter_by(user_id=user_id)
            
            if not include_read:
                query = query.filter_by(is_read=False)
            
            notifications = query.order_by(Notification.created_at.desc())\
                                .limit(limit)\
                                .offset(offset)\
                                .all()
            
            return [notification.to_dict() for notification in notifications]
        except Exception as e:
            print(f"Error getting notifications: {e}")
            return []
    
    def mark_as_read(self, notification_id, user_id):
        """Mark a notification as read"""
        try:
            notification = Notification.query.filter_by(
                id=notification_id,
                user_id=user_id
            ).first()
            
            if notification:
                notification.is_read = True
                db.session.commit()
                return True
            return False
        except Exception as e:
            print(f"Error marking notification as read: {e}")
            db.session.rollback()
            return False
    
    def mark_all_as_read(self, user_id):
        """Mark all notifications as read for a user"""
        try:
            Notification.query.filter_by(
                user_id=user_id,
                is_read=False
            ).update({'is_read': True})
            
            db.session.commit()
            return True
        except Exception as e:
            print(f"Error marking all notifications as read: {e}")
            db.session.rollback()
            return False
    
    def delete_notification(self, notification_id, user_id):
        """Delete a notification"""
        try:
            notification = Notification.query.filter_by(
                id=notification_id,
                user_id=user_id
            ).first()
            
            if notification:
                db.session.delete(notification)
                db.session.commit()
                return True
            return False
        except Exception as e:
            print(f"Error deleting notification: {e}")
            db.session.rollback()
            return False
    
    def register_user_connection(self, user_id, sid):
        """Register a user's socket connection"""
        self.connected_users[user_id] = sid
        print(f"User {user_id} connected with session {sid}")
    
    def remove_user_connection(self, sid):
        """Remove a user's socket connection"""
        for user_id, session_id in list(self.connected_users.items()):
            if session_id == sid:
                del self.connected_users[user_id]
                print(f"User {user_id} disconnected")
                break
    
    def send_notification_to_user(self, user_id, notification_data):
        """Send a notification to a connected user"""
        if user_id in self.connected_users:
            sid = self.connected_users[user_id]
            sio.emit('notification', notification_data, room=sid)
            print(f"Sent notification to user {user_id}")
    
    def send_task_completion_notification(self, user_id, task_name, result_url=None):
        """Send a task completion notification"""
        title = "งานเสร็จสิ้น"
        message = f"งาน '{task_name}' ดำเนินการเสร็จสิ้นแล้ว"
        return self.add_notification(user_id, title, message, 'success', result_url)
    
    def send_error_notification(self, user_id, task_name, error_message):
        """Send an error notification"""
        title = "เกิดข้อผิดพลาด"
        message = f"เกิดข้อผิดพลาดในงาน '{task_name}': {error_message}"
        return self.add_notification(user_id, title, message, 'error')
    
    def send_info_notification(self, user_id, title, message, action_url=None):
        """Send an info notification"""
        return self.add_notification(user_id, title, message, 'info', action_url)
    
    def send_warning_notification(self, user_id, title, message, action_url=None):
        """Send a warning notification"""
        return self.add_notification(user_id, title, message, 'warning', action_url)

# Setup Socket.IO event handlers
@sio.event
def connect(sid, environ):
    print(f"Client connected: {sid}")

@sio.event
def disconnect(sid):
    notification_service.remove_user_connection(sid)
    print(f"Client disconnected: {sid}")

@sio.event
def register_user(sid, data):
    try:
        user_id = data.get('user_id')
        if user_id:
            notification_service.register_user_connection(user_id, sid)
            return {'status': 'success'}
        return {'status': 'error', 'message': 'User ID is required'}
    except Exception as e:
        print(f"Error registering user: {e}")
        return {'status': 'error', 'message': str(e)}

# Create global instance
notification_service = NotificationService()

