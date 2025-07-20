from flask import Blueprint, request, jsonify
from ..models import db, UserProfile, WorkItem # Assuming these models exist in models.py

profile_bp = Blueprint('profile', __name__, url_prefix='/api/profile')

@profile_bp.route('/', methods=['GET'])
def get_profile():
    """Get user profile"""
    try:
        user_id = request.args.get('user_id', 1, type=int)
        
        profile = UserProfile.query.filter_by(user_id=user_id).first()
        
        if not profile:
            return jsonify({'error': 'Profile not found'}), 404
        
        return jsonify(profile.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get profile: {str(e)}'}), 500

@profile_bp.route('/', methods=['POST', 'PUT'])
def create_or_update_profile():
    """Create or update user profile"""
    try:
        data = request.get_json()
        user_id = data.get('user_id', 1)
        
        profile = UserProfile.query.filter_by(user_id=user_id).first()
        
        if profile:
            # Update existing profile
            for key, value in data.items():
                if key != 'user_id' and hasattr(profile, key):
                    setattr(profile, key, value)
        else:
            # Create new profile
            profile = UserProfile(
                user_id=user_id,
                display_name=data.get('display_name', ''),
                email=data.get('email', ''),
                bio=data.get('bio', ''),
                avatar_url=data.get('avatar_url', ''),
                preferences=data.get('preferences', {})
            )
            db.session.add(profile)
        
        db.session.commit()
        
        return jsonify(profile.to_dict()), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to create/update profile: {str(e)}'}), 500

@profile_bp.route('/work-items', methods=['GET'])
def get_work_items():
    """Get user work items"""
    try:
        user_id = request.args.get('user_id', 1, type=int)
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        work_items = WorkItem.query.filter_by(user_id=user_id)\
                               .order_by(WorkItem.created_at.desc())\
                               .paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'work_items': [item.to_dict() for item in work_items.items],
            'total': work_items.total,
            'pages': work_items.pages,
            'current_page': page,
            'per_page': per_page
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get work items: {str(e)}'}), 500

@profile_bp.route('/work-items', methods=['POST'])
def create_work_item():
    """Create a new work item"""
    try:
        data = request.get_json()
        user_id = data.get('user_id', 1)
        
        work_item = WorkItem(
            user_id=user_id,
            title=data.get('title', ''),
            description=data.get('description', ''),
            content=data.get('content', ''),
            content_type=data.get('content_type', 'text'),
            tags=data.get('tags', []),
            metadata=data.get('metadata', {})
        )
        
        db.session.add(work_item)
        db.session.commit()
        
        return jsonify(work_item.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to create work item: {str(e)}'}), 500

@profile_bp.route('/work-items/<int:item_id>', methods=['GET'])
def get_work_item(item_id):
    """Get a specific work item"""
    try:
        user_id = request.args.get('user_id', 1, type=int)
        
        work_item = WorkItem.query.filter_by(id=item_id, user_id=user_id).first()
        
        if not work_item:
            return jsonify({'error': 'Work item not found'}), 404
        
        return jsonify(work_item.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get work item: {str(e)}'}), 500

@profile_bp.route('/work-items/<int:item_id>', methods=['PUT'])
def update_work_item(item_id):
    """Update a work item"""
    try:
        data = request.get_json()
        user_id = data.get('user_id', 1)
        
        work_item = WorkItem.query.filter_by(id=item_id, user_id=user_id).first()
        
        if not work_item:
            return jsonify({'error': 'Work item not found'}), 404
        
        # Update fields
        for key, value in data.items():
            if key not in ['id', 'user_id', 'created_at'] and hasattr(work_item, key):
                setattr(work_item, key, value)
        
        db.session.commit()
        
        return jsonify(work_item.to_dict()), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update work item: {str(e)}'}), 500

@profile_bp.route('/work-items/<int:item_id>', methods=['DELETE'])
def delete_work_item(item_id):
    """Delete a work item"""
    try:
        user_id = request.args.get('user_id', 1, type=int)
        
        work_item = WorkItem.query.filter_by(id=item_id, user_id=user_id).first()
        
        if not work_item:
            return jsonify({'error': 'Work item not found'}), 404
        
        db.session.delete(work_item)
        db.session.commit()
        
        return jsonify({'message': 'Work item deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to delete work item: {str(e)}'}), 500

@profile_bp.route('/work-items/search', methods=['GET'])
def search_work_items():
    """Search work items"""
    try:
        user_id = request.args.get('user_id', 1, type=int)
        query = request.args.get('q', '')
        
        if not query:
            return jsonify({'error': 'Search query is required'}), 400
        
        # Simple search implementation
        work_items = WorkItem.query.filter(
            WorkItem.user_id == user_id,
            (
                WorkItem.title.ilike(f'%{query}%') |
                WorkItem.description.ilike(f'%{query}%') |
                WorkItem.content.ilike(f'%{query}%')
            )
        ).order_by(WorkItem.created_at.desc()).all()
        
        return jsonify({
            'work_items': [item.to_dict() for item in work_items],
            'total': len(work_items),
            'query': query
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to search work items: {str(e)}'}), 500
