from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from models import (
    db, Assessment, AssessmentAttempt, StudentAnswer, QuestionBank, 
    Course, Enrollment, User, PersonalizedRecommendation
)
from services.bloom_analyzer import BloomAnalyzer
from services.ai_service import AIService

attempts_bp = Blueprint("attempts", __name__)

@attempts_bp.route("/start/<int:assessment_id>", methods=["POST"])
@jwt_required()
def start_attempt(assessment_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user or user.role != "student":
        return jsonify({"error": "Only students can attempt assessments"}), 403
        
    assessment = Assessment.query.get(assessment_id)
    if not assessment or not assessment.is_published:
        return jsonify({"error": "Assessment is not available or not published"}), 404
        
    enrolled = Enrollment.query.filter_by(student_id=user.id, course_id=assessment.course_id).first()
    if not enrolled:
        return jsonify({"error": "You must be enrolled in this course to take this assessment"}), 403
        
    # Check attempt limit
    completed_attempts = AssessmentAttempt.query.filter_by(
        assessment_id=assessment_id, student_id=user.id, status="completed"
    ).count()
    if completed_attempts >= assessment.attempt_limit:
        return jsonify({"error": f"Attempt limit reached. You can only take this assessment {assessment.attempt_limit} time(s)."}), 400
        
    # Check for existing in_progress attempt
    active_attempt = AssessmentAttempt.query.filter_by(
        assessment_id=assessment_id, student_id=user.id, status="in_progress"
    ).first()
    
    if not active_attempt:
        active_attempt = AssessmentAttempt(
            assessment_id=assessment_id,
            student_id=user.id,
            attempt_number=completed_attempts + 1,
            start_time=datetime.utcnow(),
            total_possible_marks=assessment.total_marks,
            status="in_progress"
        )
        db.session.add(active_attempt)
        db.session.commit()
        
    # Return questions WITHOUT answers for student examination
    questions = [aq.to_dict(include_answer=False) for aq in assessment.assessment_questions.all()]
    
    return jsonify({
        "message": "Assessment attempt started",
        "attempt_id": active_attempt.id,
        "attempt_number": active_attempt.attempt_number,
        "duration_minutes": assessment.duration_minutes,
        "start_time": active_attempt.start_time.isoformat(),
        "total_marks": assessment.total_marks,
        "questions": questions
    }), 200

@attempts_bp.route("/submit/<int:attempt_id>", methods=["POST"])
@jwt_required()
def submit_attempt(attempt_id):
    user_id = int(get_jwt_identity())
    attempt = AssessmentAttempt.query.get(attempt_id)
    if not attempt:
        return jsonify({"error": "Attempt not found"}), 404
    if attempt.student_id != user_id:
        return jsonify({"error": "Permission denied"}), 403
    if attempt.status == "completed":
        return jsonify({"error": "This attempt has already been submitted"}), 400
        
    data = request.get_json() or {}
    answers_submitted = data.get("answers", {})  # { question_id: selected_answer_string }
    
    total_score = 0.0
    assessment = attempt.assessment
    aq_list = assessment.assessment_questions.all()
    
    # Grade answers against question bank
    for aq in aq_list:
        q = aq.question
        if not q:
            continue
        student_ans = str(answers_submitted.get(str(q.id), "")).strip()
        correct_ans = str(q.correct_answer).strip()
        
        is_correct = (student_ans.lower() == correct_ans.lower())
        marks_awarded = float(q.marks) if is_correct else 0.0
        total_score += marks_awarded
        
        student_answer_record = StudentAnswer(
            attempt_id=attempt.id,
            question_id=q.id,
            student_answer=student_ans,
            is_correct=is_correct,
            marks_awarded=marks_awarded,
            feedback=q.explanation if not is_correct else "Correct! Well done."
        )
        db.session.add(student_answer_record)
        
    attempt.submit_time = datetime.utcnow()
    attempt.score = total_score
    attempt.total_possible_marks = assessment.total_marks or 1.0
    percentage = (total_score / attempt.total_possible_marks) * 100.0
    attempt.percentage = percentage
    attempt.passed = (percentage >= float(assessment.passing_marks))
    attempt.status = "completed"
    
    db.session.commit()
    
    # Calculate detailed Bloom's Taxonomy analytics
    bloom_analysis = BloomAnalyzer.calculate_attempt_mastery(attempt.id)
    
    # Generate Personalized Recommendation using AI
    user = User.query.get(user_id)
    course = assessment.course
    rec_data = AIService.generate_recommendations(
        student_name=user.name,
        course_title=course.title,
        bloom_breakdown=bloom_analysis.get("bloom_breakdown", {}),
        weak_topics=bloom_analysis.get("weak_topics", [])
    )
    
    import json
    recommendation = PersonalizedRecommendation(
        student_id=user.id,
        course_id=course.id,
        attempt_id=attempt.id,
        primary_weak_bloom=rec_data.get("primary_weak_bloom", "UNDERSTAND"),
        weak_topics_json=json.dumps(bloom_analysis.get("weak_topics", [])),
        recommendation_summary=rec_data.get("recommendation_summary", ""),
        actionable_steps_json=json.dumps(rec_data.get("actionable_steps", [])),
        suggested_resources_json=json.dumps(rec_data.get("suggested_resources", []))
    )
    db.session.add(recommendation)
    db.session.commit()
    
    return jsonify({
        "message": "Assessment submitted and graded successfully",
        "attempt": attempt.to_dict(),
        "bloom_analysis": bloom_analysis,
        "recommendation": recommendation.to_dict()
    }), 200

@attempts_bp.route("/result/<int:attempt_id>", methods=["GET"])
@jwt_required()
def get_attempt_result(attempt_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    attempt = AssessmentAttempt.query.get(attempt_id)
    if not attempt:
        return jsonify({"error": "Attempt not found"}), 404
        
    is_owner = (attempt.student_id == user.id)
    is_faculty = (user.role == "faculty" and attempt.assessment.course.faculty_id == user.id)
    
    if not (is_owner or is_faculty):
        return jsonify({"error": "Permission denied"}), 403
        
    answers = [a.to_dict() for a in attempt.answers.all()]
    rec = attempt.recommendation.to_dict() if attempt.recommendation else None
    
    return jsonify({
        "attempt": attempt.to_dict(),
        "answers": answers,
        "recommendation": rec
    }), 200

@attempts_bp.route("/student/history", methods=["GET"])
@jwt_required()
def get_student_attempts():
    user_id = int(get_jwt_identity())
    course_id = request.args.get("course_id")
    
    query = AssessmentAttempt.query.filter_by(student_id=user_id, status="completed")
    if course_id:
        query = query.join(Assessment).filter(Assessment.course_id == int(course_id))
        
    attempts = query.order_by(AssessmentAttempt.submit_time.desc()).all()
    return jsonify({"attempts": [a.to_dict() for a in attempts]}), 200
