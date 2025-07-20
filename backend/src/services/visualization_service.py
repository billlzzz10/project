import json
import os
import uuid
from datetime import datetime
import networkx as nx
from src.models.user import db
from src.models.enhanced_models import Board, GraphNode, GraphEdge, WorkItem
from src.config import Config

class VisualizationService:
    def __init__(self):
        pass
    
    def create_board(self, user_id, title, description=None, elements=None, template=None):
        """Create a new board"""
        try:
            # Generate a unique ID for the board
            board_id = str(uuid.uuid4())
            
            # Create directory for board data if it doesn't exist
            board_dir = os.path.join(Config.UPLOAD_FOLDER, 'boards')
            os.makedirs(board_dir, exist_ok=True)
            
            # Default elements if none provided
            if elements is None:
                elements = []
            
            # Apply template if specified
            if template:
                elements = self._apply_board_template(template, title)
            
            # Save board data to file
            data_path = os.path.join(board_dir, f"{board_id}.json")
            with open(data_path, 'w', encoding='utf-8') as f:
                json.dump({
                    'elements': elements,
                    'title': title,
                    'description': description,
                    'created_at': datetime.now().isoformat(),
                    'updated_at': datetime.now().isoformat()
                }, f)
            
            # Save board record to database
            board = Board(
                board_id=board_id,
                user_id=user_id,
                title=title,
                description=description,
                data_path=data_path,
                template=template
            )
            
            db.session.add(board)
            db.session.commit()
            
            return {
                'board_id': board_id,
                'title': title,
                'description': description,
                'elements': elements,
                'created_at': board.created_at.isoformat() if board.created_at else None
            }
            
        except Exception as e:
            db.session.rollback()
            print(f"Error creating board: {e}")
            raise
    
    def update_board(self, board_id, title=None, description=None, elements=None):
        """Update an existing board"""
        try:
            # Get the board from database
            board = Board.query.filter_by(board_id=board_id).first()
            
            if not board:
                raise ValueError(f"Board with ID {board_id} not found")
            
            # Update board data
            with open(board.data_path, 'r', encoding='utf-8') as f:
                board_data = json.load(f)
            
            if title is not None:
                board.title = title
                board_data['title'] = title
            
            if description is not None:
                board.description = description
                board_data['description'] = description
            
            if elements is not None:
                board_data['elements'] = elements
            
            board_data['updated_at'] = datetime.now().isoformat()
            
            # Save updated data
            with open(board.data_path, 'w', encoding='utf-8') as f:
                json.dump(board_data, f)
            
            board.updated_at = datetime.now()
            db.session.commit()
            
            return {
                'board_id': board_id,
                'title': board.title,
                'description': board.description,
                'elements': board_data['elements'],
                'updated_at': board.updated_at.isoformat() if board.updated_at else None
            }
            
        except Exception as e:
            db.session.rollback()
            print(f"Error updating board: {e}")
            raise
    
    def get_board(self, board_id):
        """Get a board by ID"""
        try:
            # Get the board from database
            board = Board.query.filter_by(board_id=board_id).first()
            
            if not board:
                raise ValueError(f"Board with ID {board_id} not found")
            
            # Read board data
            with open(board.data_path, 'r', encoding='utf-8') as f:
                board_data = json.load(f)
            
            return {
                'board_id': board_id,
                'title': board.title,
                'description': board.description,
                'elements': board_data.get('elements', []),
                'created_at': board.created_at.isoformat() if board.created_at else None,
                'updated_at': board.updated_at.isoformat() if board.updated_at else None
            }
            
        except Exception as e:
            print(f"Error getting board: {e}")
            raise
    
    def delete_board(self, board_id):
        """Delete a board"""
        try:
            # Get the board from database
            board = Board.query.filter_by(board_id=board_id).first()
            
            if not board:
                raise ValueError(f"Board with ID {board_id} not found")
            
            # Delete the data file
            if os.path.exists(board.data_path):
                os.remove(board.data_path)
            
            # Delete the database record
            db.session.delete(board)
            db.session.commit()
            
            return {'success': True}
            
        except Exception as e:
            db.session.rollback()
            print(f"Error deleting board: {e}")
            raise
    
    def list_boards(self, user_id):
        """List all boards for a user"""
        try:
            boards = Board.query.filter_by(user_id=user_id).order_by(Board.created_at.desc()).all()
            
            return {
                'boards': [
                    {
                        'board_id': board.board_id,
                        'title': board.title,
                        'description': board.description,
                        'template': board.template,
                        'created_at': board.created_at.isoformat() if board.created_at else None,
                        'updated_at': board.updated_at.isoformat() if board.updated_at else None
                    }
                    for board in boards
                ],
                'total': len(boards)
            }
            
        except Exception as e:
            print(f"Error listing boards: {e}")
            raise
    
    def create_graph(self, user_id, title, description=None, nodes=None, edges=None, layout=None):
        """Create a new graph visualization"""
        try:
            # Create nodes and edges if not provided
            if nodes is None:
                nodes = []
            
            if edges is None:
                edges = []
            
            # Apply layout if specified
            if layout and nodes:
                nodes = self._apply_graph_layout(nodes, edges, layout)
            
            # Save nodes to database
            db_nodes = []
            for node in nodes:
                graph_node = GraphNode(
                    user_id=user_id,
                    title=node.get('title', ''),
                    node_type=node.get('type', 'default'),
                    content=node.get('content', ''),
                    position_x=node.get('position_x', 0),
                    position_y=node.get('position_y', 0),
                    metadata=node.get('metadata', {})
                )
                db.session.add(graph_node)
                db.session.flush()  # Get the ID without committing
                db_nodes.append(graph_node)
            
            # Save edges to database
            for edge in edges:
                source_idx = edge.get('source', 0)
                target_idx = edge.get('target', 0)
                
                if 0 <= source_idx < len(db_nodes) and 0 <= target_idx < len(db_nodes):
                    graph_edge = GraphEdge(
                        user_id=user_id,
                        source_id=db_nodes[source_idx].id,
                        target_id=db_nodes[target_idx].id,
                        edge_type=edge.get('type', 'default'),
                        label=edge.get('label', ''),
                        metadata=edge.get('metadata', {})
                    )
                    db.session.add(graph_edge)
            
            db.session.commit()
            
            return {
                'title': title,
                'description': description,
                'nodes': [
                    {
                        'id': node.id,
                        'title': node.title,
                        'type': node.node_type,
                        'content': node.content,
                        'position_x': node.position_x,
                        'position_y': node.position_y
                    }
                    for node in db_nodes
                ],
                'edges': [
                    {
                        'id': edge.id,
                        'source': edge.source_id,
                        'target': edge.target_id,
                        'type': edge.edge_type,
                        'label': edge.label
                    }
                    for edge in GraphEdge.query.filter_by(user_id=user_id).all()
                    if edge.source_id in [node.id for node in db_nodes]
                    and edge.target_id in [node.id for node in db_nodes]
                ]
            }
            
        except Exception as e:
            db.session.rollback()
            print(f"Error creating graph: {e}")
            raise
    
    def get_graph(self, user_id, graph_id=None):
        """Get a graph by ID or the latest graph for a user"""
        try:
            # Get nodes
            nodes_query = GraphNode.query.filter_by(user_id=user_id)
            
            if graph_id:
                # Filter by graph ID if provided
                nodes_query = nodes_query.filter_by(graph_id=graph_id)
            
            nodes = nodes_query.all()
            
            if not nodes:
                return {
                    'nodes': [],
                    'edges': []
                }
            
            # Get edges connecting these nodes
            node_ids = [node.id for node in nodes]
            edges = GraphEdge.query.filter(
                GraphEdge.user_id == user_id,
                GraphEdge.source_id.in_(node_ids),
                GraphEdge.target_id.in_(node_ids)
            ).all()
            
            return {
                'nodes': [
                    {
                        'id': node.id,
                        'title': node.title,
                        'type': node.node_type,
                        'content': node.content,
                        'position_x': node.position_x,
                        'position_y': node.position_y
                    }
                    for node in nodes
                ],
                'edges': [
                    {
                        'id': edge.id,
                        'source': edge.source_id,
                        'target': edge.target_id,
                        'type': edge.edge_type,
                        'label': edge.label
                    }
                    for edge in edges
                ]
            }
            
        except Exception as e:
            print(f"Error getting graph: {e}")
            raise
    
    def generate_mind_map_from_text(self, user_id, title, content, description=None):
        """Generate a mind map from text content"""
        try:
            # Simple mind map generation logic
            # In a real implementation, this would use NLP to extract topics and subtopics
            lines = content.strip().split('\n')
            elements = []
            
            # Create central node
            central_node = {
                'id': 'node-0',
                'type': 'central',
                'data': {'label': title},
                'position': {'x': 0, 'y': 0},
                'style': {
                    'width': 180,
                    'height': 60,
                    'backgroundColor': '#4CAF50',
                    'color': 'white',
                    'borderRadius': '30px',
                    'display': 'flex',
                    'justifyContent': 'center',
                    'alignItems': 'center',
                    'fontSize': '16px',
                    'fontWeight': 'bold'
                }
            }
            elements.append(central_node)
            
            # Process lines to create nodes and edges
            node_id = 1
            for i, line in enumerate(lines):
                if not line.strip():
                    continue
                
                # Determine indentation level
                indent = len(line) - len(line.lstrip())
                level = indent // 2 + 1  # Simple heuristic for level
                
                # Create node
                node = {
                    'id': f'node-{node_id}',
                    'type': 'default',
                    'data': {'label': line.strip()},
                    'position': {
                        'x': level * 250 * (1 if i % 2 == 0 else -1),
                        'y': (i % 4) * 100 - 150
                    },
                    'style': {
                        'width': 150,
                        'height': 40,
                        'backgroundColor': '#2196F3',
                        'color': 'white',
                        'borderRadius': '5px',
                        'display': 'flex',
                        'justifyContent': 'center',
                        'alignItems': 'center'
                    }
                }
                elements.append(node)
                
                # Create edge
                edge = {
                    'id': f'edge-{node_id}',
                    'source': 'node-0' if level == 1 else f'node-{max(1, node_id - 1)}',
                    'target': f'node-{node_id}',
                    'type': 'smoothstep',
                    'animated': True,
                    'style': {
                        'stroke': '#888'
                    }
                }
                elements.append(edge)
                
                node_id += 1
            
            # Create the board with the generated elements
            return self.create_board(user_id, title, description, elements, template='mind_map')
            
        except Exception as e:
            print(f"Error generating mind map: {e}")
            raise
    
    def generate_graph_from_work_items(self, user_id, title, description=None):
        """Generate a graph visualization from user's work items"""
        try:
            # Get work items
            work_items = WorkItem.query.filter_by(user_id=user_id).all()
            
            if not work_items:
                raise ValueError("No work items found for this user")
            
            # Create nodes for each work item
            nodes = []
            for i, item in enumerate(work_items):
                # Extract tags
                tags = item.tags if hasattr(item, 'tags') and item.tags else []
                
                node = {
                    'title': item.title,
                    'type': 'work_item',
                    'content': item.description if hasattr(item, 'description') else '',
                    'position_x': 0,  # Will be calculated by layout algorithm
                    'position_y': 0,
                    'metadata': {
                        'id': item.id,
                        'tags': tags,
                        'created_at': item.created_at.isoformat() if hasattr(item, 'created_at') and item.created_at else None
                    }
                }
                nodes.append(node)
            
            # Create edges based on tag similarity
            edges = []
            for i, node1 in enumerate(nodes):
                tags1 = node1['metadata']['tags']
                for j, node2 in enumerate(nodes):
                    if i >= j:
                        continue
                    
                    tags2 = node2['metadata']['tags']
                    # Create edge if there are common tags
                    common_tags = set(tags1) & set(tags2)
                    if common_tags:
                        edge = {
                            'source': i,
                            'target': j,
                            'type': 'tag_relation',
                            'label': ', '.join(common_tags),
                            'metadata': {
                                'common_tags': list(common_tags)
                            }
                        }
                        edges.append(edge)
            
            # Apply force-directed layout
            nodes = self._apply_graph_layout(nodes, edges, 'force_directed')
            
            # Create the graph
            return self.create_graph(user_id, title, description, nodes, edges)
            
        except Exception as e:
            print(f"Error generating graph from work items: {e}")
            raise
    
    def _apply_board_template(self, template, title):
        """Apply a template to create board elements"""
        elements = []
        
        if template == 'mind_map':
            # Create a simple mind map template
            central_node = {
                'id': 'node-0',
                'type': 'central',
                'data': {'label': title},
                'position': {'x': 0, 'y': 0},
                'style': {
                    'width': 180,
                    'height': 60,
                    'backgroundColor': '#4CAF50',
                    'color': 'white',
                    'borderRadius': '30px',
                    'display': 'flex',
                    'justifyContent': 'center',
                    'alignItems': 'center',
                    'fontSize': '16px',
                    'fontWeight': 'bold'
                }
            }
            elements.append(central_node)
            
            # Add some example nodes
            for i in range(1, 5):
                node = {
                    'id': f'node-{i}',
                    'type': 'default',
                    'data': {'label': f'Topic {i}'},
                    'position': {
                        'x': 250 * (1 if i % 2 == 0 else -1),
                        'y': (i % 3) * 100 - 100
                    },
                    'style': {
                        'width': 120,
                        'height': 40,
                        'backgroundColor': '#2196F3',
                        'color': 'white',
                        'borderRadius': '5px',
                        'display': 'flex',
                        'justifyContent': 'center',
                        'alignItems': 'center'
                    }
                }
                elements.append(node)
                
                # Add edge from central node
                edge = {
                    'id': f'edge-{i}',
                    'source': 'node-0',
                    'target': f'node-{i}',
                    'type': 'smoothstep',
                    'animated': True,
                    'style': {
                        'stroke': '#888'
                    }
                }
                elements.append(edge)
            
        elif template == 'kanban':
            # Create a Kanban board template
            columns = ['To Do', 'In Progress', 'Done']
            
            for i, column in enumerate(columns):
                # Add column
                column_node = {
                    'id': f'column-{i}',
                    'type': 'column',
                    'data': {'label': column},
                    'position': {'x': i * 300 - 300, 'y': 0},
                    'style': {
                        'width': 250,
                        'height': 500,
                        'backgroundColor': '#f5f5f5',
                        'borderRadius': '5px',
                        'padding': '10px',
                        'display': 'flex',
                        'flexDirection': 'column',
                        'alignItems': 'center'
                    }
                }
                elements.append(column_node)
                
                # Add some example cards
                for j in range(1, 4):
                    if (i == 0 and j <= 3) or (i == 1 and j <= 2) or (i == 2 and j <= 1):
                        card = {
                            'id': f'card-{i}-{j}',
                            'type': 'card',
                            'data': {'label': f'Task {i+1}.{j}'},
                            'position': {'x': i * 300 - 300, 'y': j * 100},
                            'parentNode': f'column-{i}',
                            'style': {
                                'width': 200,
                                'height': 80,
                                'backgroundColor': 'white',
                                'borderRadius': '3px',
                                'boxShadow': '0 1px 3px rgba(0,0,0,0.12)',
                                'padding': '10px',
                                'margin': '10px 0'
                            }
                        }
                        elements.append(card)
            
        elif template == 'flowchart':
            # Create a simple flowchart template
            node_types = ['start', 'process', 'decision', 'process', 'end']
            node_labels = ['Start', 'Process A', 'Decision?', 'Process B', 'End']
            
            for i, (node_type, label) in enumerate(zip(node_types, node_labels)):
                # Determine node style based on type
                style = {
                    'width': 120,
                    'height': 60,
                    'display': 'flex',
                    'justifyContent': 'center',
                    'alignItems': 'center',
                    'color': 'white'
                }
                
                if node_type == 'start' or node_type == 'end':
                    style.update({
                        'backgroundColor': '#4CAF50',
                        'borderRadius': '30px'
                    })
                elif node_type == 'process':
                    style.update({
                        'backgroundColor': '#2196F3',
                        'borderRadius': '5px'
                    })
                elif node_type == 'decision':
                    style.update({
                        'backgroundColor': '#FFC107',
                        'borderRadius': '5px',
                        'transform': 'rotate(45deg)'
                    })
                
                # Create node
                node = {
                    'id': f'node-{i}',
                    'type': node_type,
                    'data': {'label': label},
                    'position': {'x': 0, 'y': i * 150},
                    'style': style
                }
                elements.append(node)
                
                # Add edge to next node
                if i < len(node_types) - 1:
                    edge_type = 'smoothstep'
                    if node_type == 'decision':
                        # Add two edges from decision node
                        edge1 = {
                            'id': f'edge-{i}-yes',
                            'source': f'node-{i}',
                            'target': f'node-{i+1}',
                            'type': edge_type,
                            'label': 'Yes',
                            'style': {'stroke': '#888'}
                        }
                        elements.append(edge1)
                        
                        # Add a "No" edge that loops back
                        edge2 = {
                            'id': f'edge-{i}-no',
                            'source': f'node-{i}',
                            'target': f'node-{i-1}',
                            'type': edge_type,
                            'label': 'No',
                            'style': {'stroke': '#888'}
                        }
                        elements.append(edge2)
                    else:
                        edge = {
                            'id': f'edge-{i}',
                            'source': f'node-{i}',
                            'target': f'node-{i+1}',
                            'type': edge_type,
                            'style': {'stroke': '#888'}
                        }
                        elements.append(edge)
        
        return elements
    
    def _apply_graph_layout(self, nodes, edges, layout):
        """Apply a layout algorithm to position nodes"""
        try:
            if layout == 'force_directed':
                # Create a NetworkX graph
                G = nx.Graph()
                
                # Add nodes
                for i, node in enumerate(nodes):
                    G.add_node(i, **node)
                
                # Add edges
                for edge in edges:
                    source = edge.get('source', 0)
                    target = edge.get('target', 0)
                    G.add_edge(source, target)
                
                # Apply force-directed layout
                pos = nx.spring_layout(G, k=0.15, iterations=50)
                
                # Update node positions
                for i, node in enumerate(nodes):
                    if i in pos:
                        node['position_x'] = pos[i][0] * 500
                        node['position_y'] = pos[i][1] * 500
            
            elif layout == 'circular':
                # Create a NetworkX graph
                G = nx.Graph()
                
                # Add nodes
                for i, node in enumerate(nodes):
                    G.add_node(i, **node)
                
                # Add edges
                for edge in edges:
                    source = edge.get('source', 0)
                    target = edge.get('target', 0)
                    G.add_edge(source, target)
                
                # Apply circular layout
                pos = nx.circular_layout(G)
                
                # Update node positions
                for i, node in enumerate(nodes):
                    if i in pos:
                        node['position_x'] = pos[i][0] * 500
                        node['position_y'] = pos[i][1] * 500
            
            elif layout == 'hierarchical':
                # Create a NetworkX directed graph
                G = nx.DiGraph()
                
                # Add nodes
                for i, node in enumerate(nodes):
                    G.add_node(i, **node)
                
                # Add edges
                for edge in edges:
                    source = edge.get('source', 0)
                    target = edge.get('target', 0)
                    G.add_edge(source, target)
                
                # Apply hierarchical layout
                pos = nx.nx_agraph.graphviz_layout(G, prog='dot')
                
                # Update node positions
                for i, node in enumerate(nodes):
                    if i in pos:
                        node['position_x'] = pos[i][0] * 0.5
                        node['position_y'] = pos[i][1] * 0.5
            
            return nodes
            
        except Exception as e:
            print(f"Error applying layout: {e}")
            # Return original nodes if layout fails
            return nodes

# Create global instance
visualization_service = VisualizationService()

