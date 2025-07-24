from flask import Blueprint, request, jsonify, current_app

notification_bp = Blueprint('notification', __name__, url_prefix='/api/notifications')

@notification_bp.route('/', methods=['GET'])
def get_notifications():
    """Get notifications for a user"""
    try:
        user_id = request.args.get('user_id', 1, type=int)
        limit = request.args.get('limit', 20, type=int)
        offset = request.args.get('offset', 0, type=int)
        include_read = request.args.get('include_read', 'false').lower() == 'true'
        
        notifications = current_app.notification_service.get_notifications(
            user_id, limit, offset, include_read
        )
        
        return jsonify({
            'notifications': notifications,
            'count': len(notifications)
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get notifications: {str(e)}'}), 500

@notification_bp.route('/<int:notification_id>/read', methods=['POST'])
def mark_as_read(notification_id):
    """Mark a notification as read"""
    try:
        user_id = request.args.get('user_id', 1, type=int)
        
        success = current_app.notification_service.mark_as_read(notification_id, user_id)
        
        if success:
            return jsonify({'message': 'Notification marked as read'}), 200
        else:
            return jsonify({'error': 'Notification not found'}), 404
            
    except Exception as e:
        return jsonify({'error': f'Failed to mark notification as read: {str(e)}'}), 500

@notification_bp.route('/read-all', methods=['POST'])
def mark_all_as_read():
    """Mark all notifications as read for a user"""
    try:
        user_id = request.args.get('user_id', 1, type=int)
        
        success = current_app.notification_service.mark_all_as_read(user_id)
        
        if success:
            return jsonify({'message': 'All notifications marked as read'}), 200
        else:
            return jsonify({'error': 'Failed to mark notifications as read'}), 500
            
    except Exception as e:
        return jsonify({'error': f'Failed to mark notifications as read: {str(e)}'}), 500

@notification_bp.route('/<int:notification_id>', methods=['DELETE'])
def delete_notification(notification_id):
    """Delete a notification"""
    try:
        user_id = request.args.get('user_id', 1, type=int)
        
        success = current_app.notification_service.delete_notification(notification_id, user_id)
        
        if success:
            return jsonify({'message': 'Notification deleted'}), 200
        else:
            return jsonify({'error': 'Notification not found'}), 404
            
    except Exception as e:
        return jsonify({'error': f'Failed to delete notification: {str(e)}'}), 500

@notification_bp.route('/test', methods=['POST'])
def test_notification():
    """Send a test notification"""
    try:
        data = request.get_json()
        user_id = data.get('user_id', 1)
        title = data.get('title', 'Test Notification')
        message = data.get('message', 'This is a test notification')
        notification_type = data.get('type', 'info')
        action_url = data.get('action_url')
        
        notification_id = current_app.notification_service.add_notification(
            user_id, title, message, notification_type, action_url
        )
        
        if notification_id:
            return jsonify({
                'message': 'Test notification sent',
                'notification_id': notification_id
            }), 200
        else:
            return jsonify({'error': 'Failed to send test notification'}), 500
            
    except Exception as e:
        return jsonify({'error': f'Failed to send test notification: {str(e)}'}), 500

