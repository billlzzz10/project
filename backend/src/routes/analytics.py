from flask import Blueprint, request, jsonify, current_app

analytics_bp = Blueprint('analytics', __name__, url_prefix='/api/analytics')

@analytics_bp.route('/chat', methods=['GET'])
def get_chat_analytics():
    """Get chat analytics data"""
    try:
        user_id = request.args.get('user_id', type=int)
        days = request.args.get('days', 30, type=int)
        
        data = current_app.analytics_service.get_chat_analytics(user_id, days)
        
        return jsonify(data), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get chat analytics: {str(e)}'}), 500

@analytics_bp.route('/files', methods=['GET'])
def get_file_analytics():
    """Get file analytics data"""
    try:
        user_id = request.args.get('user_id', type=int)
        
        data = current_app.analytics_service.get_file_analytics(user_id)
        
        return jsonify(data), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get file analytics: {str(e)}'}), 500

@analytics_bp.route('/rag', methods=['GET'])
def get_rag_analytics():
    """Get RAG analytics data"""
    try:
        user_id = request.args.get('user_id', type=int)
        
        data = current_app.analytics_service.get_rag_analytics(user_id)
        
        return jsonify(data), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get RAG analytics: {str(e)}'}), 500

@analytics_bp.route('/system', methods=['GET'])
def get_system_analytics():
    """Get system analytics data"""
    try:
        data = current_app.analytics_service.get_system_analytics()
        
        return jsonify(data), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get system analytics: {str(e)}'}), 500

@analytics_bp.route('/notion', methods=['GET'])
def get_notion_analytics():
    """Get Notion analytics data"""
    try:
        user_id = request.args.get('user_id', type=int)
        
        data = current_app.analytics_service.get_notion_analytics(user_id)
        
        return jsonify(data), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get Notion analytics: {str(e)}'}), 500

@analytics_bp.route('/mock', methods=['GET'])
def get_mock_analytics():
    """Get mock analytics data for demo"""
    try:
        data = current_app.analytics_service.generate_mock_data()
        
        return jsonify(data), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get mock analytics: {str(e)}'}), 500

