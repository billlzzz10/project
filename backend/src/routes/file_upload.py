import os
import uuid
from datetime import datetime
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from ..models import db, UploadedFile, RAGDocument

file_upload_bp = Blueprint("file_upload", __name__, url_prefix="/api/files")

# Allowed file extensions
ALLOWED_EXTENSIONS = {
    "pdf",
    "html",
    "csv",
    "docx",
    "doc",
    "md",
    "txt",
    "xlsx",
    "xls",
    "pptx",
    "ppt",
}


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def get_file_type(filename):
    if "." in filename:
        return filename.rsplit(".", 1)[1].lower()
    return "unknown"


@file_upload_bp.route("/upload", methods=["POST"])
def upload_file():
    """Upload and process files for RAG system"""
    try:
        # Check if file is present
        if "file" not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files["file"]
        user_id = request.form.get("user_id", 1)  # Default user_id for demo

        if file.filename == "":
            return jsonify({"error": "No file selected"}), 400

        if not allowed_file(file.filename):
            return jsonify({"error": "File type not allowed"}), 400

        # Create upload directory if it doesn't exist
        upload_dir = os.path.join(current_app.root_path, "uploads")
        os.makedirs(upload_dir, exist_ok=True)

        # Generate unique filename
        original_filename = secure_filename(file.filename)
        file_extension = get_file_type(original_filename)
        unique_filename = f"{uuid.uuid4().hex}.{file_extension}"
        file_path = os.path.join(upload_dir, unique_filename)

        # Save file
        file.save(file_path)
        file_size = os.path.getsize(file_path)

        # Create database record for the uploaded file
        # Maintain backward compatibility: set both file_path and stored_filename if model supports it
        uploaded_file = UploadedFile(
            user_id=user_id,
            original_filename=original_filename,
            file_path=file_path,
            stored_filename=unique_filename,
            file_type=file_extension,
            file_size=file_size,
            is_processed=False,
        )

        db.session.add(uploaded_file)
        db.session.commit()

        # Process file asynchronously (in a real app, this would be a background task)
        success = current_app.rag_service.process_uploaded_file(
            uploaded_file.id, user_id
        )

        if success:
            return (
                jsonify(
                    {
                        "message": "File uploaded and processed successfully",
                        "file_id": uploaded_file.id,
                        "filename": original_filename,
                        "file_type": file_extension,
                        "file_size": file_size,
                        "processed": True,
                    }
                ),
                200,
            )
        else:
            return (
                jsonify(
                    {
                        "message": "File uploaded but processing failed",
                        "file_id": uploaded_file.id,
                        "filename": original_filename,
                        "file_type": file_extension,
                        "file_size": file_size,
                        "processed": False,
                    }
                ),
                200,
            )

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Upload failed: {str(e)}"}), 500


@file_upload_bp.route("/files", methods=["GET"])
def get_uploaded_files():
    """Get list of uploaded files for a user"""
    try:
        user_id = request.args.get("user_id", 1, type=int)
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 20, type=int)

        files = (
            UploadedFile.query.filter_by(user_id=user_id)
            .order_by(UploadedFile.created_at.desc())
            .paginate(page=page, per_page=per_page, error_out=False)
        )

        return (
            jsonify(
                {
                    "files": [file.to_dict() for file in files.items],
                    "total": files.total,
                    "pages": files.pages,
                    "current_page": page,
                    "per_page": per_page,
                }
            ),
            200,
        )

    except Exception as e:
        return jsonify({"error": f"Failed to get files: {str(e)}"}), 500


@file_upload_bp.route("/files/<int:file_id>", methods=["DELETE"])
def delete_file(file_id):
    """Delete an uploaded file"""
    try:
        user_id = request.args.get("user_id", 1, type=int)

        uploaded_file = UploadedFile.query.filter_by(
            id=file_id, user_id=user_id
        ).first()
        if not uploaded_file:
            return jsonify({"error": "File not found"}), 404

        # Delete physical file
        if os.path.exists(uploaded_file.file_path):
            os.remove(uploaded_file.file_path)

        # Delete RAG document if exists
        rag_doc = RAGDocument.query.filter_by(
            user_id=user_id, source_type="file", source_id=str(file_id)
        ).first()
        if rag_doc:
            db.session.delete(rag_doc)

        # Delete database record
        db.session.delete(uploaded_file)
        db.session.commit()

        return jsonify({"message": "File deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to delete file: {str(e)}"}), 500


@file_upload_bp.route("/files/<int:file_id>/reprocess", methods=["POST"])
def reprocess_file(file_id):
    """Reprocess a file for RAG system"""
    try:
        user_id = request.args.get("user_id", 1, type=int)

        uploaded_file = UploadedFile.query.filter_by(
            id=file_id, user_id=user_id
        ).first()
        if not uploaded_file:
            return jsonify({"error": "File not found"}), 404

        # Reprocess file
        success = current_app.rag_service.process_uploaded_file(file_id, user_id)

        if success:
            return jsonify({"message": "File reprocessed successfully"}), 200
        else:
            return jsonify({"error": "Failed to reprocess file"}), 500

    except Exception as e:
        return jsonify({"error": f"Reprocessing failed: {str(e)}"}), 500


@file_upload_bp.route("/search", methods=["POST"])
def search_documents():
    """Search documents using RAG system"""
    try:
        data = request.get_json()
        query = data.get("query", "")
        user_id = data.get("user_id", 1)
        top_k = data.get("top_k", 5)

        if not query:
            return jsonify({"error": "Query is required"}), 400

        # Perform semantic search
        results = current_app.rag_service.semantic_search(query, user_id, top_k)

        return (
            jsonify(
                {"query": query, "results": results, "total_results": len(results)}
            ),
            200,
        )

    except Exception as e:
        return jsonify({"error": f"Search failed: {str(e)}"}), 500


@file_upload_bp.route("/rag/context", methods=["POST"])
def get_rag_context():
    """Get RAG context for chat"""
    try:
        data = request.get_json()
        query = data.get("query", "")
        user_id = data.get("user_id", 1)
        max_length = data.get("max_length", 2000)

        if not query:
            return jsonify({"error": "Query is required"}), 400

        # Get RAG context
        context = current_app.rag_service.get_rag_context(query, user_id, max_length)

        return (
            jsonify(
                {"query": query, "context": context, "context_length": len(context)}
            ),
            200,
        )

    except Exception as e:
        return jsonify({"error": f"Failed to get RAG context: {str(e)}"}), 500
