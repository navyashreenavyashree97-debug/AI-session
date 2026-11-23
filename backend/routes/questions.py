from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, QuestionBank, Course, LearningObjective, BLOOM_LEVELS, User
from services.ai_service import AIService

questions_bp = Blueprint("questions", __name__)

@questions_bp.route("/generate-ai", methods=["POST"])
@jwt_required()
def generate_ai_questions():
    """
    Invokes AI (Gemini or expert mock fallback) to generate questions mapped to Bloom's levels.
    """
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user or user.role != "faculty":
        return jsonify({"error": "Only faculty can generate assessment questions"}), 403
        
    data = request.get_json() or {}
    course_id = data.get("course_id")
    topic = data.get("topic", "").strip()
    bloom_level = data.get("bloom_level", "UNDERSTAND").strip().upper()
    count = int(data.get("count", 3))
    difficulty = data.get("difficulty", "Medium").strip()
    objective_id = data.get("objective_id")
    
    if not course_id or not topic:
        return jsonify({"error": "course_id and topic are required"}), 400
        
    course = Course.query.get(course_id)
    if not course or course.faculty_id != user.id:
        return jsonify({"error": "Course not found or permission denied"}), 403
        
    if bloom_level not in BLOOM_LEVELS:
        return jsonify({"error": f"Invalid Bloom level. Must be one of {BLOOM_LEVELS}"}), 400
        
    generated = AIService.generate_questions(
        course_title=course.title,
        topic=topic,
        bloom_level=bloom_level,
        count=min(max(count, 1), 10),
        difficulty=difficulty
    )
    
    # Attach course_id, objective_id, and topic so faculty can review & directly commit
    for q in generated:
        q["course_id"] = course_id
        q["objective_id"] = objective_id
        q["topic"] = topic
        q["is_ai_generated"] = True
        
    return jsonify({
        "message": f"Successfully generated {len(generated)} questions for Bloom's level: {bloom_level}",
        "questions": generated
    }), 200

@questions_bp.route("/course/<int:course_id>", methods=["GET"])
@jwt_required()
def get_questions_by_course(course_id):
    user_id = int(get_jwt_identity())
    course = Course.query.get(course_id)
    if not course:
        return jsonify({"error": "Course not found"}), 404
        
    bloom_filter = request.args.get("bloom_level")
    query = QuestionBank.query.filter_by(course_id=course_id)
    if bloom_filter and bloom_filter.upper() in BLOOM_LEVELS:
        query = query.filter_by(bloom_level=bloom_filter.upper())
        
    questions = query.order_by(QuestionBank.created_at.desc()).all()
    return jsonify({"questions": [q.to_dict(include_answer=True) for q in questions]}), 200

@questions_bp.route("", methods=["POST"])
@jwt_required()
def create_question():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    
    course_id = data.get("course_id")
    objective_id = data.get("objective_id")
    bloom_level = data.get("bloom_level", "UNDERSTAND").strip().upper()
    topic = data.get("topic", "").strip()
    question_text = data.get("question_text", "").strip()
    question_type = data.get("question_type", "mcq")
    options = data.get("options", [])
    correct_answer = data.get("correct_answer", "").strip()
    explanation = data.get("explanation", "").strip()
    marks = int(data.get("marks", 1))
    difficulty = data.get("difficulty", "Medium")
    is_ai_generated = bool(data.get("is_ai_generated", False))
    
    if not course_id or not topic or not question_text or not correct_answer:
        return jsonify({"error": "course_id, topic, question_text, and correct_answer are required"}), 400
        
    course = Course.query.get(course_id)
    if not course or course.faculty_id != user_id:
        return jsonify({"error": "Course not found or permission denied"}), 403
        
    if bloom_level not in BLOOM_LEVELS:
        return jsonify({"error": f"Invalid Bloom level. Must be one of {BLOOM_LEVELS}"}), 400
        
    question = QuestionBank(
        course_id=course_id,
        objective_id=objective_id,
        bloom_level=bloom_level,
        topic=topic,
        question_text=question_text,
        question_type=question_type,
        correct_answer=correct_answer,
        explanation=explanation,
        marks=marks,
        difficulty=difficulty,
        is_ai_generated=is_ai_generated,
        created_by=user_id
    )
    question.set_options(options)
    db.session.add(question)
    db.session.commit()
    
    return jsonify({
        "message": "Question saved to Question Bank successfully",
        "question": question.to_dict(include_answer=True)
    }), 201

@questions_bp.route("/<int:question_id>", methods=["PUT"])
@jwt_required()
def update_question(question_id):
    user_id = int(get_jwt_identity())
    question = QuestionBank.query.get(question_id)
    if not question:
        return jsonify({"error": "Question not found"}), 404
        
    course = Course.query.get(question.course_id)
    if course.faculty_id != user_id:
        return jsonify({"error": "Permission denied"}), 403
        
    data = request.get_json() or {}
    if "question_text" in data:
        question.question_text = data["question_text"].strip()
    if "topic" in data:
        question.topic = data["topic"].strip()
    if "bloom_level" in data and data["bloom_level"].strip().upper() in BLOOM_LEVELS:
        question.bloom_level = data["bloom_level"].strip().upper()
    if "options" in data:
        question.set_options(data["options"])
    if "correct_answer" in data:
        question.correct_answer = data["correct_answer"].strip()
    if "explanation" in data:
        question.explanation = data["explanation"].strip()
    if "marks" in data:
        question.marks = int(data["marks"])
    if "difficulty" in data:
        question.difficulty = data["difficulty"].strip()
    if "objective_id" in data:
        question.objective_id = data["objective_id"]
        
    db.session.commit()
    return jsonify({
        "message": "Question updated successfully",
        "question": question.to_dict(include_answer=True)
    }), 200

@questions_bp.route("/<int:question_id>", methods=["DELETE"])
@jwt_required()
def delete_question(question_id):
    user_id = int(get_jwt_identity())
    question = QuestionBank.query.get(question_id)
    if not question:
        return jsonify({"error": "Question not found"}), 404
        
    course = Course.query.get(question.course_id)
    if course.faculty_id != user_id:
        return jsonify({"error": "Permission denied"}), 403
        
    db.session.delete(question)
    db.session.commit()
    return jsonify({"message": "Question deleted successfully"}), 200
