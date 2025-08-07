from flask import Blueprint, request, jsonify, current_app
from ..models import db, ChatSession, ChatMessage
import json

chat_bp = Blueprint("chat", __name__, url_prefix="/api/chat")


@chat_bp.route("/sessions", methods=["GET"])
def get_chat_sessions():
    """Retrieve chat sessions"""
    sessions = ChatSession.query.all()
    return (
        jsonify(
            [
                {
                    "id": session.id,
                    "title": session.title,
                    "created_at": session.created_at,
                }
                for session in sessions
            ]
        ),
        200,
    )


@chat_bp.route("/sessions", methods=["POST"])
def create_chat_session():
    """Create a new chat session"""
    data = request.get_json()
    new_session = ChatSession(title=data["title"])
    db.session.add(new_session)
    db.session.commit()
    return (
        jsonify(
            {
                "id": new_session.id,
                "title": new_session.title,
                "created_at": new_session.created_at,
            }
        ),
        201,
    )


@chat_bp.route("/sessions/<int:session_id>", methods=["DELETE"])
def delete_chat_session(session_id):
    """Delete a chat session"""
    session = ChatSession.query.get(session_id)
    if not session:
        return jsonify({"error": "Session not found"}), 404
    db.session.delete(session)
    db.session.commit()
    return "", 204


@chat_bp.route("/sessions/<int:session_id>/messages", methods=["POST"])
def send_message(session_id):
    """Send a message and get AI response"""
    data = request.get_json()
    user_message = data.get("message")
    use_rag = data.get("use_rag", False)
    user_id = data.get("user_id", 1)  # Default to user_id=1 if not provided

    # Validate input
    if not user_message:
        return jsonify({"error": "Message is required"}), 400

    try:
        # Save user message
        user_msg = ChatMessage(session_id=session_id, content=user_message, role="user")
        db.session.add(user_msg)

        # Generate AI response
        if use_rag:
            context = current_app.rag_service.get_rag_context(
                user_message, user_id=user_id
            )
            prompt = f"ใช้บริบทนี้เพื่อตอบคำถาม:\n---\n{context}\n---\nคำถาม: {user_message}"
            result = current_app.ai_service.generate_with_gemini(prompt)
            ai_response = result.get(
                "response", result.get("error", "เกิดข้อผิดพลาดในการสร้างคำตอบ")
            )
            # For simplicity, we'll just pass the context as sources for now
            sources = json.dumps([{"context": context}])
            confidence = None  # Confidence score might not be directly available
        else:
            result = current_app.ai_service.generate_with_gemini(user_message)
            ai_response = result.get(
                "response",
                result.get("error", "An error occurred while generating the response"),
            )
            sources = None

        # Save AI response
        ai_msg = ChatMessage(
            session_id=session_id,
            content=ai_response,
            role="assistant",
            sources=sources,
            confidence=confidence,
        )
        db.session.add(ai_msg)
        db.session.commit()

        return (
            jsonify(
                {"message": ai_response, "sources": sources, "confidence": confidence}
            ),
            200,
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# The RAG-specific routes might be better in their own blueprint/service file
# For now, we remove them from chat and assume they are handled in file_upload

# @chat_bp.route('/rag/documents', methods=['POST']) ... (removed)
# @chat_bp.route('/rag/documents/batch', methods=['POST']) ... (removed)
# @chat_bp.route('/rag/search', methods=['POST']) ... (removed)
# @chat_bp.route('/rag/stats', methods=['GET']) ... (removed)
# @chat_bp.route('/rag/clear', methods=['POST']) ... (removed)
