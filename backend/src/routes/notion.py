from flask import Blueprint, jsonify, current_app

notion_bp = Blueprint("notion", __name__, url_prefix="/api/notion")


@notion_bp.route("/characters", methods=["GET"])
def get_characters():
    """
    API endpoint to get all characters from the Notion database.
    """
    try:
        characters_data = current_app.notion_service.get_all_characters()
        if "error" in characters_data:
            return jsonify(characters_data), 500

        # We can add data processing here if needed in the future
        return jsonify(characters_data), 200

    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500


@notion_bp.route("/scenes", methods=["GET"])
def get_scenes():
    """
    API endpoint to get all scenes from the Notion database.
    """
    try:
        scenes_data = current_app.notion_service.get_all_scenes()
        if "error" in scenes_data:
            return jsonify(scenes_data), 500

        return jsonify(scenes_data), 200

    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500


@notion_bp.route("/tasks", methods=["GET"])
def get_tasks():
    """
    API endpoint to get all tasks from the Notion database.
    """
    try:
        tasks_data = current_app.notion_service.get_all_tasks()
        if "error" in tasks_data:
            return jsonify(tasks_data), 500

        return jsonify(tasks_data), 200

    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500
