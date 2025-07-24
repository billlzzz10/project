from flask import Blueprint, request, jsonify, current_app

visualization_bp = Blueprint('visualization', __name__, url_prefix='/api/visualizations')

@visualization_bp.route('/board', methods=['POST'])
def create_board():
    """Create a new board"""
    try:
        data = request.get_json()
        user_id = data.get('user_id', 1)
        title = data.get('title')
        description = data.get('description')
        elements = data.get('elements')
        template = data.get('template')
        
        if not title:
            return jsonify({'error': 'Title is required'}), 400
        
        result = current_app.visualization_service.create_board(user_id, title, description, elements, template)
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to create board: {str(e)}'}), 500

@visualization_bp.route('/board/<board_id>', methods=['GET'])
def get_board(board_id):
    """Get a board by ID"""
    try:
        result = current_app.visualization_service.get_board(board_id)
        return jsonify(result), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
        
    except Exception as e:
        return jsonify({'error': f'Failed to get board: {str(e)}'}), 500

@visualization_bp.route('/board/<board_id>', methods=['PUT'])
def update_board(board_id):
    """Update a board"""
    try:
        data = request.get_json()
        title = data.get('title')
        description = data.get('description')
        elements = data.get('elements')
        
        result = current_app.visualization_service.update_board(board_id, title, description, elements)
        return jsonify(result), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
        
    except Exception as e:
        return jsonify({'error': f'Failed to update board: {str(e)}'}), 500

@visualization_bp.route('/board/<board_id>', methods=['DELETE'])
def delete_board(board_id):
    """Delete a board"""
    try:
        result = current_app.visualization_service.delete_board(board_id)
        return jsonify(result), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
        
    except Exception as e:
        return jsonify({'error': f'Failed to delete board: {str(e)}'}), 500

@visualization_bp.route('/boards', methods=['GET'])
def list_boards():
    """List all boards for a user"""
    try:
        user_id = request.args.get('user_id', 1, type=int)
        result = current_app.visualization_service.list_boards(user_id)
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to list boards: {str(e)}'}), 500

@visualization_bp.route('/graph', methods=['POST'])
def create_graph():
    """Create a new graph visualization"""
    try:
        data = request.get_json()
        user_id = data.get('user_id', 1)
        title = data.get('title')
        description = data.get('description')
        nodes = data.get('nodes')
        edges = data.get('edges')
        layout = data.get('layout')
        
        if not title:
            return jsonify({'error': 'Title is required'}), 400
        
        result = current_app.visualization_service.create_graph(user_id, title, description, nodes, edges, layout)
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to create graph: {str(e)}'}), 500

@visualization_bp.route('/graph', methods=['GET'])
def get_graph():
    """Get a graph by ID or the latest graph for a user"""
    try:
        user_id = request.args.get('user_id', 1, type=int)
        graph_id = request.args.get('graph_id')
        
        result = current_app.visualization_service.get_graph(user_id, graph_id)
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get graph: {str(e)}'}), 500

@visualization_bp.route('/mind-map/generate', methods=['POST'])
def generate_mind_map():
    """Generate a mind map from text content"""
    try:
        data = request.get_json()
        user_id = data.get('user_id', 1)
        title = data.get('title')
        content = data.get('content')
        description = data.get('description')
        
        if not title or not content:
            return jsonify({'error': 'Title and content are required'}), 400
        
        result = current_app.visualization_service.generate_mind_map_from_text(user_id, title, content, description)
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to generate mind map: {str(e)}'}), 500

@visualization_bp.route('/graph/generate-from-work', methods=['POST'])
def generate_graph_from_work():
    """Generate a graph visualization from user's work items"""
    try:
        data = request.get_json()
        user_id = data.get('user_id', 1)
        title = data.get('title')
        description = data.get('description')
        
        if not title:
            return jsonify({'error': 'Title is required'}), 400
        
        result = current_app.visualization_service.generate_graph_from_work_items(user_id, title, description)
        return jsonify(result), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
        
    except Exception as e:
        return jsonify({'error': f'Failed to generate graph: {str(e)}'}), 500

