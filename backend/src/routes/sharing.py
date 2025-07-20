from flask import Blueprint, request, jsonify, send_file
import os
import json
import uuid
import markdown
import tempfile
from datetime import datetime
from ..models import db, WorkItem, SharedContent
from ..config import Config

sharing_bp = Blueprint('sharing', __name__, url_prefix='/api/sharing')

@sharing_bp.route('/share', methods=['POST'])
def share_content():
    """Share content to various formats"""
    try:
        data = request.get_json()
        content_type = data.get('content_type', 'text')
        content = data.get('content', '')
        title = data.get('title', f'Shared content {datetime.now().strftime("%Y-%m-%d %H:%M")}')
        format = data.get('format', 'md')  # md, html, docx, pdf, url
        user_id = data.get('user_id', 1)
        source_id = data.get('source_id')
        source_type = data.get('source_type', 'chat')
        
        share_id = str(uuid.uuid4())
        
        # This assumes a configured UPLOAD_FOLDER in your app's config
        upload_folder = Config.UPLOAD_FOLDER or tempfile.gettempdir()
        shared_dir = os.path.join(upload_folder, 'shared')
        os.makedirs(shared_dir, exist_ok=True)
        
        file_path = None
        public_url = None
        
        if format == 'md':
            file_path = os.path.join(shared_dir, f"{share_id}.md")
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(f"# {title}\n\n{content}")
                
        elif format == 'html':
            html_content = markdown.markdown(content)
            file_path = os.path.join(shared_dir, f"{share_id}.html")
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(f"<!DOCTYPE html><html><head><title>{title}</title></head><body><h1>{title}</h1>{html_content}</body></html>")
                
        elif format in ['docx', 'pdf']:
            # Placeholder for more complex generation
            file_path = os.path.join(shared_dir, f"{share_id}.txt")
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(f"{title}\n\n{content}")
            
        elif format == 'url':
            public_url = f"/api/sharing/shared/{share_id}"
            file_path = os.path.join(shared_dir, f"{share_id}.json")
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump({'title': title, 'content': content, 'content_type': content_type, 'created_at': datetime.now().isoformat()}, f)
        
        shared_content = SharedContent(
            share_id=share_id, user_id=user_id, title=title, format=format,
            file_path=file_path, public_url=public_url, source_id=source_id, source_type=source_type
        )
        
        db.session.add(shared_content)
        db.session.commit()
        
        return jsonify({'success': True, 'share_id': share_id, 'public_url': public_url, 'format': format}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to share content: {str(e)}'}), 500

@sharing_bp.route('/shared/<share_id>', methods=['GET'])
def get_shared_content(share_id):
    """Get shared content by ID"""
    try:
        shared_content = SharedContent.query.filter_by(share_id=share_id).first_or_404()
        
        if shared_content.format == 'url':
            with open(shared_content.file_path, 'r', encoding='utf-8') as f:
                return jsonify(json.load(f))
        
        if os.path.exists(shared_content.file_path):
            return send_file(shared_content.file_path, as_attachment=True, download_name=f"{shared_content.title}.{shared_content.format}")
        
        return jsonify({'error': 'Shared file not found'}), 404
        
    except Exception as e:
        return jsonify({'error': f'Failed to get shared content: {str(e)}'}), 500

@sharing_bp.route('/list', methods=['GET'])
def list_shared_content():
    """List all shared content for a user"""
    try:
        user_id = request.args.get('user_id', 1, type=int)
        items = SharedContent.query.filter_by(user_id=user_id).order_by(SharedContent.created_at.desc()).all()
        return jsonify({'shared_items': [item.to_dict() for item in items], 'total': len(items)}), 200
    except Exception as e:
        return jsonify({'error': f'Failed to list shared content: {str(e)}'}), 500

@sharing_bp.route('/shared/<share_id>', methods=['DELETE'])
def delete_shared_content(share_id):
    """Delete shared content"""
    try:
        shared_content = SharedContent.query.filter_by(share_id=share_id).first_or_404()
        
        if shared_content.file_path and os.path.exists(shared_content.file_path):
            os.remove(shared_content.file_path)
        
        db.session.delete(shared_content)
        db.session.commit()
        
        return jsonify({'message': 'Shared content deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to delete shared content: {str(e)}'}), 500

@sharing_bp.route('/embed', methods=['POST'])
def create_embed():
    """Create an embeddable version of content"""
    try:
        data = request.get_json()
        content = data.get('content', '')
        title = data.get('title', 'Embedded Content')
        user_id = data.get('user_id', 1)
        
        embed_id = str(uuid.uuid4())
        upload_folder = Config.UPLOAD_FOLDER or tempfile.gettempdir()
        embed_dir = os.path.join(upload_folder, 'embeds')
        os.makedirs(embed_dir, exist_ok=True)
        
        embed_html = f"""
        <!DOCTYPE html><html><head><title>{title}</title>
        <style>body{{font-family:sans-serif;margin:20px;}}pre{{background:#f4f4f4;padding:10px;border-radius:5px;}}</style>
        </head><body><h1>{title}</h1><div>{markdown.markdown(content)}</div></body></html>
        """
        
        file_path = os.path.join(embed_dir, f"{embed_id}.html")
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(embed_html)
        
        embed_url = f"/api/sharing/embed/{embed_id}"
        embed_code = f'<iframe src="{embed_url}" width="100%" height="500" frameborder="0"></iframe>'
        
        shared_content = SharedContent(
            share_id=embed_id, user_id=user_id, title=title, format='embed',
            file_path=file_path, public_url=embed_url
        )
        
        db.session.add(shared_content)
        db.session.commit()
        
        return jsonify({'success': True, 'embed_id': embed_id, 'embed_url': embed_url, 'embed_code': embed_code}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to create embed: {str(e)}'}), 500

@sharing_bp.route('/embed/<embed_id>', methods=['GET'])
def get_embed(embed_id):
    """Get embedded content by ID"""
    try:
        shared_content = SharedContent.query.filter_by(share_id=embed_id, format='embed').first_or_404()
        
        if os.path.exists(shared_content.file_path):
            return send_file(shared_content.file_path)
        
        return jsonify({'error': 'Embedded file not found'}), 404
        
    except Exception as e:
        return jsonify({'error': f'Failed to get embedded content: {str(e)}'}), 500
