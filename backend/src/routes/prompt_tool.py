from flask import Blueprint, request, jsonify
from src.models.chat import PromptTemplate, GeneratedTool, db
from src.services.ai_service import AIService
import json

prompt_tool_bp = Blueprint('prompt_tool', __name__)
ai_service = AIService()

# Prompt Template Routes
@prompt_tool_bp.route('/prompts', methods=['GET'])
def get_prompts():
    """Get all prompt templates"""
    user_id = request.args.get('user_id', 1)
    category = request.args.get('category')
    is_public = request.args.get('is_public')
    
    query = PromptTemplate.query
    
    if category:
        query = query.filter_by(category=category)
    if is_public is not None:
        query = query.filter_by(is_public=is_public.lower() == 'true')
    
    # Show user's own prompts and public prompts
    query = query.filter(
        (PromptTemplate.created_by == user_id) | 
        (PromptTemplate.is_public == True)
    )
    
    prompts = query.order_by(PromptTemplate.created_at.desc()).all()
    return jsonify([prompt.to_dict() for prompt in prompts])

@prompt_tool_bp.route('/prompts', methods=['POST'])
def create_prompt():
    """Create a new prompt template"""
    data = request.get_json()
    
    required_fields = ['name', 'template']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400
    
    prompt = PromptTemplate(
        name=data['name'],
        description=data.get('description', ''),
        template=data['template'],
        category=data.get('category', 'general'),
        tags=json.dumps(data.get('tags', [])),
        created_by=data.get('user_id', 1),
        is_public=data.get('is_public', False)
    )
    
    db.session.add(prompt)
    db.session.commit()
    
    return jsonify(prompt.to_dict()), 201

@prompt_tool_bp.route('/prompts/<int:prompt_id>', methods=['PUT'])
def update_prompt(prompt_id):
    """Update a prompt template"""
    prompt = PromptTemplate.query.get_or_404(prompt_id)
    data = request.get_json()
    
    # Check if user owns the prompt
    user_id = data.get('user_id', 1)
    if prompt.created_by != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    prompt.name = data.get('name', prompt.name)
    prompt.description = data.get('description', prompt.description)
    prompt.template = data.get('template', prompt.template)
    prompt.category = data.get('category', prompt.category)
    prompt.tags = json.dumps(data.get('tags', json.loads(prompt.tags or '[]')))
    prompt.is_public = data.get('is_public', prompt.is_public)
    
    db.session.commit()
    return jsonify(prompt.to_dict())

@prompt_tool_bp.route('/prompts/<int:prompt_id>', methods=['DELETE'])
def delete_prompt(prompt_id):
    """Delete a prompt template"""
    prompt = PromptTemplate.query.get_or_404(prompt_id)
    user_id = request.args.get('user_id', 1)
    
    if prompt.created_by != int(user_id):
        return jsonify({'error': 'Unauthorized'}), 403
    
    db.session.delete(prompt)
    db.session.commit()
    
    return jsonify({'message': 'Prompt deleted successfully'})

@prompt_tool_bp.route('/prompts/generate', methods=['POST'])
def generate_prompt():
    """Generate a prompt using AI"""
    data = request.get_json()
    task_description = data.get('task_description', '')
    examples = data.get('examples', [])
    
    if not task_description:
        return jsonify({'error': 'Task description is required'}), 400
    
    result = ai_service.generate_prompt(task_description, examples)
    
    if 'error' in result:
        return jsonify(result), 500
    
    return jsonify({
        'generated_prompt': result['response'],
        'task_description': task_description,
        'examples': examples
    })

@prompt_tool_bp.route('/prompts/<int:prompt_id>/use', methods=['POST'])
def use_prompt(prompt_id):
    """Use a prompt template and increment usage count"""
    prompt = PromptTemplate.query.get_or_404(prompt_id)
    data = request.get_json()
    variables = data.get('variables', {})
    
    # Replace variables in template
    filled_prompt = prompt.template
    for key, value in variables.items():
        filled_prompt = filled_prompt.replace(f'{{{key}}}', str(value))
    
    # Increment usage count
    prompt.usage_count += 1
    db.session.commit()
    
    return jsonify({
        'filled_prompt': filled_prompt,
        'original_template': prompt.template,
        'variables_used': variables
    })

# Tool Generator Routes
@prompt_tool_bp.route('/tools', methods=['GET'])
def get_tools():
    """Get all generated tools"""
    user_id = request.args.get('user_id', 1)
    category = request.args.get('category')
    language = request.args.get('language')
    
    query = GeneratedTool.query.filter_by(created_by=user_id)
    
    if category:
        query = query.filter_by(category=category)
    if language:
        query = query.filter_by(language=language)
    
    tools = query.order_by(GeneratedTool.created_at.desc()).all()
    return jsonify([tool.to_dict() for tool in tools])

@prompt_tool_bp.route('/tools', methods=['POST'])
def create_tool():
    """Create a new tool"""
    data = request.get_json()
    
    required_fields = ['name', 'code']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400
    
    tool = GeneratedTool(
        name=data['name'],
        description=data.get('description', ''),
        code=data['code'],
        language=data.get('language', 'python'),
        category=data.get('category', 'general'),
        created_by=data.get('user_id', 1),
        is_tested=data.get('is_tested', False)
    )
    
    db.session.add(tool)
    db.session.commit()
    
    return jsonify(tool.to_dict()), 201

@prompt_tool_bp.route('/tools/<int:tool_id>', methods=['PUT'])
def update_tool(tool_id):
    """Update a tool"""
    tool = GeneratedTool.query.get_or_404(tool_id)
    data = request.get_json()
    
    # Check if user owns the tool
    user_id = data.get('user_id', 1)
    if tool.created_by != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    tool.name = data.get('name', tool.name)
    tool.description = data.get('description', tool.description)
    tool.code = data.get('code', tool.code)
    tool.language = data.get('language', tool.language)
    tool.category = data.get('category', tool.category)
    tool.is_tested = data.get('is_tested', tool.is_tested)
    
    db.session.commit()
    return jsonify(tool.to_dict())

@prompt_tool_bp.route('/tools/<int:tool_id>', methods=['DELETE'])
def delete_tool(tool_id):
    """Delete a tool"""
    tool = GeneratedTool.query.get_or_404(tool_id)
    user_id = request.args.get('user_id', 1)
    
    if tool.created_by != int(user_id):
        return jsonify({'error': 'Unauthorized'}), 403
    
    db.session.delete(tool)
    db.session.commit()
    
    return jsonify({'message': 'Tool deleted successfully'})

@prompt_tool_bp.route('/tools/generate', methods=['POST'])
def generate_tool():
    """Generate a tool using AI"""
    data = request.get_json()
    tool_description = data.get('tool_description', '')
    language = data.get('language', 'python')
    
    if not tool_description:
        return jsonify({'error': 'Tool description is required'}), 400
    
    result = ai_service.generate_tool_code(tool_description, language)
    
    if 'error' in result:
        return jsonify(result), 500
    
    return jsonify({
        'generated_code': result['response'],
        'tool_description': tool_description,
        'language': language
    })

@prompt_tool_bp.route('/tools/<int:tool_id>/use', methods=['POST'])
def use_tool(tool_id):
    """Use a tool and increment usage count"""
    tool = GeneratedTool.query.get_or_404(tool_id)
    
    # Increment usage count
    tool.usage_count += 1
    db.session.commit()
    
    return jsonify({
        'code': tool.code,
        'language': tool.language,
        'description': tool.description,
        'usage_count': tool.usage_count
    })

# Statistics Routes
@prompt_tool_bp.route('/prompts/stats', methods=['GET'])
def get_prompt_stats():
    """Get prompt statistics"""
    user_id = request.args.get('user_id', 1)
    
    total_prompts = PromptTemplate.query.filter_by(created_by=user_id).count()
    public_prompts = PromptTemplate.query.filter_by(created_by=user_id, is_public=True).count()
    total_usage = db.session.query(db.func.sum(PromptTemplate.usage_count)).filter_by(created_by=user_id).scalar() or 0
    
    categories = db.session.query(
        PromptTemplate.category, 
        db.func.count(PromptTemplate.id)
    ).filter_by(created_by=user_id).group_by(PromptTemplate.category).all()
    
    return jsonify({
        'total_prompts': total_prompts,
        'public_prompts': public_prompts,
        'total_usage': total_usage,
        'categories': [{'name': cat[0], 'count': cat[1]} for cat in categories]
    })

@prompt_tool_bp.route('/tools/stats', methods=['GET'])
def get_tool_stats():
    """Get tool statistics"""
    user_id = request.args.get('user_id', 1)
    
    total_tools = GeneratedTool.query.filter_by(created_by=user_id).count()
    tested_tools = GeneratedTool.query.filter_by(created_by=user_id, is_tested=True).count()
    total_usage = db.session.query(db.func.sum(GeneratedTool.usage_count)).filter_by(created_by=user_id).scalar() or 0
    
    languages = db.session.query(
        GeneratedTool.language, 
        db.func.count(GeneratedTool.id)
    ).filter_by(created_by=user_id).group_by(GeneratedTool.language).all()
    
    categories = db.session.query(
        GeneratedTool.category, 
        db.func.count(GeneratedTool.id)
    ).filter_by(created_by=user_id).group_by(GeneratedTool.category).all()
    
    return jsonify({
        'total_tools': total_tools,
        'tested_tools': tested_tools,
        'total_usage': total_usage,
        'languages': [{'name': lang[0], 'count': lang[1]} for lang in languages],
        'categories': [{'name': cat[0], 'count': cat[1]} for cat in categories]
    })

