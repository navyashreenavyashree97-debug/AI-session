from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Course, LearningObjective, BLOOM_LEVELS, User

objectives_bp = Blueprint("objectives", __name__)

@objectives_bp.route("/course/<int:course_id>", methods=["GET"])
@jwt_required()
def get_objectives_by_course(course_id):
    user_id = int(get_jwt_identity())
    course = Course.query.get(course_id)
    if not course:
        return jsonify({"error": "Course not found"}), 404
        
    objectives = LearningObjective.query.filter_by(course_id=course_id).order_by(LearningObjective.id.asc()).all()
    return jsonify({
        "course_id": course_id,
        "objectives": [obj.to_dict() for obj in objectives],
        "bloom_levels": BLOOM_LEVELS
    }), 200

@objectives_bp.route("", methods=["POST"])
@jwt_required()
def create_objective():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    course_id = data.get("course_id")
    topic = data.get("topic", "").strip()
    title = data.get("title", "").strip()
    description = data.get("description", "").strip()
    bloom_level = data.get("bloom_level", "").strip().upper()
    expected_outcome = data.get("expected_outcome", "").strip()
    
    if not course_id or not topic or not title or not bloom_level:
        return jsonify({"error": "course_id, topic, title, and bloom_level are required"}), 400
        
    if bloom_level not in BLOOM_LEVELS:
        return jsonify({"error": f"Invalid Bloom level. Must be one of: {', '.join(BLOOM_LEVELS)}"}), 400
        
    course = Course.query.get(course_id)
    if not course:
        return jsonify({"error": "Course not found"}), 404
    if course.faculty_id != user_id:
        return jsonify({"error": "Only the course owner can add learning objectives"}), 403
        
    objective = LearningObjective(
        course_id=course_id,
        topic=topic,
        title=title,
        description=description,
        bloom_level=bloom_level,
        expected_outcome=expected_outcome
    )
    db.session.add(objective)
    db.session.commit()
    
    return jsonify({
        "message": "Learning objective created successfully",
        "objective": objective.to_dict()
    }), 201

@objectives_bp.route("/<int:objective_id>", methods=["PUT"])
@jwt_required()
def update_objective(objective_id):
    user_id = int(get_jwt_identity())
    objective = LearningObjective.query.get(objective_id)
    if not objective:
        return jsonify({"error": "Objective not found"}), 404
        
    course = Course.query.get(objective.course_id)
    if course.faculty_id != user_id:
        return jsonify({"error": "Permission denied"}), 403
        
    data = request.get_json() or {}
    if "topic" in data:
        objective.topic = data["topic"].strip()
    if "title" in data:
        objective.title = data["title"].strip()
    if "description" in data:
        objective.description = data["description"].strip()
    if "bloom_level" in data:
        level = data["bloom_level"].strip().upper()
        if level in BLOOM_LEVELS:
            objective.bloom_level = level
    if "expected_outcome" in data:
        objective.expected_outcome = data["expected_outcome"].strip()
        
    db.session.commit()
    return jsonify({
        "message": "Learning objective updated successfully",
        "objective": objective.to_dict()
    }), 200

@objectives_bp.route("/<int:objective_id>", methods=["DELETE"])
@jwt_required()
def delete_objective(objective_id):
    user_id = int(get_jwt_identity())
    objective = LearningObjective.query.get(objective_id)
    if not objective:
        return jsonify({"error": "Objective not found"}), 404
        
    course = Course.query.get(objective.course_id)
    if course.faculty_id != user_id:
        return jsonify({"error": "Permission denied"}), 403
        
    db.session.delete(objective)
    db.session.commit()
    return jsonify({"message": "Learning objective deleted successfully"}), 200
