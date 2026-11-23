from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from models import db, Assessment, AssessmentQuestion, QuestionBank, Course, Enrollment, User

assessments_bp = Blueprint("assessments", __name__)

@assessments_bp.route("/course/<int:course_id>", methods=["GET"])
@jwt_required()
def get_assessments_by_course(course_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    course = Course.query.get(course_id)
    if not course:
        return jsonify({"error": "Course not found"}), 404
        
    if user.role == "faculty":
        assessments = Assessment.query.filter_by(course_id=course_id).order_by(Assessment.created_at.desc()).all()
    else:
        # Check enrollment
        enrolled = Enrollment.query.filter_by(student_id=user.id, course_id=course_id).first()
        if not enrolled:
            return jsonify({"error": "You must be enrolled in this course to view assessments"}), 403
        # Students only see published assessments
        assessments = Assessment.query.filter_by(course_id=course_id, is_published=True).order_by(Assessment.created_at.desc()).all()
        
    return jsonify({"assessments": [a.to_dict() for a in assessments]}), 200

@assessments_bp.route("/<int:assessment_id>", methods=["GET"])
@jwt_required()
def get_assessment_detail(assessment_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    assessment = Assessment.query.get(assessment_id)
    if not assessment:
        return jsonify({"error": "Assessment not found"}), 404
        
    is_faculty = (user.role == "faculty" and assessment.course.faculty_id == user.id)
    
    questions = assessment.assessment_questions.all()
    # If student, do not include correct answers in the response while attempting
    include_answers = is_faculty
    
    data = assessment.to_dict()
    data["questions"] = [q.to_dict(include_answer=include_answers) for q in questions]
    return jsonify({"assessment": data}), 200

@assessments_bp.route("", methods=["POST"])
@jwt_required()
def create_assessment():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user or user.role != "faculty":
        return jsonify({"error": "Only faculty can create assessments"}), 403
        
    data = request.get_json() or {}
    course_id = data.get("course_id")
    title = data.get("title", "").strip()
    description = data.get("description", "").strip()
    duration_minutes = int(data.get("duration_minutes", 30))
    passing_marks = int(data.get("passing_marks", 40))
    attempt_limit = int(data.get("attempt_limit", 1))
    is_published = bool(data.get("is_published", False))
    question_ids = data.get("question_ids", [])  # list of question IDs from question bank
    
    start_date_str = data.get("start_date")
    end_date_str = data.get("end_date")
    start_date = datetime.fromisoformat(start_date_str) if start_date_str else None
    end_date = datetime.fromisoformat(end_date_str) if end_date_str else None
    
    if not course_id or not title:
        return jsonify({"error": "course_id and title are required"}), 400
        
    course = Course.query.get(course_id)
    if not course or course.faculty_id != user.id:
        return jsonify({"error": "Course not found or permission denied"}), 403
        
    assessment = Assessment(
        course_id=course_id,
        title=title,
        description=description,
        duration_minutes=duration_minutes,
        passing_marks=passing_marks,
        attempt_limit=attempt_limit,
        is_published=is_published,
        start_date=start_date,
        end_date=end_date,
        created_by=user.id
    )
    db.session.add(assessment)
    db.session.flush()  # to obtain assessment.id
    
    total_marks = 0
    for idx, q_id in enumerate(question_ids):
        q = QuestionBank.query.get(q_id)
        if q and q.course_id == course_id:
            aq = AssessmentQuestion(
                assessment_id=assessment.id,
                question_id=q.id,
                order_index=idx,
                marks=q.marks
            )
            total_marks += q.marks
            db.session.add(aq)
            
    assessment.total_marks = total_marks
    db.session.commit()
    
    return jsonify({
        "message": "Assessment created successfully",
        "assessment": assessment.to_dict()
    }), 201

@assessments_bp.route("/<int:assessment_id>/toggle-publish", methods=["POST"])
@jwt_required()
def toggle_publish(assessment_id):
    user_id = int(get_jwt_identity())
    assessment = Assessment.query.get(assessment_id)
    if not assessment:
        return jsonify({"error": "Assessment not found"}), 404
        
    course = Course.query.get(assessment.course_id)
    if course.faculty_id != user_id:
        return jsonify({"error": "Permission denied"}), 403
        
    assessment.is_published = not assessment.is_published
    db.session.commit()
    
    status_str = "published" if assessment.is_published else "saved as draft"
    return jsonify({
        "message": f"Assessment {status_str}",
        "is_published": assessment.is_published
    }), 200

@assessments_bp.route("/<int:assessment_id>", methods=["DELETE"])
@jwt_required()
def delete_assessment(assessment_id):
    user_id = int(get_jwt_identity())
    assessment = Assessment.query.get(assessment_id)
    if not assessment:
        return jsonify({"error": "Assessment not found"}), 404
        
    course = Course.query.get(assessment.course_id)
    if course.faculty_id != user_id:
        return jsonify({"error": "Permission denied"}), 403
        
    db.session.delete(assessment)
    db.session.commit()
    return jsonify({"message": "Assessment deleted successfully"}), 200
