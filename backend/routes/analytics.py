from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Course, AssessmentAttempt, User
from services.bloom_analyzer import BloomAnalyzer

analytics_bp = Blueprint("analytics", __name__)

@analytics_bp.route("/faculty/course/<int:course_id>", methods=["GET"])
@jwt_required()
def get_faculty_course_analytics(course_id):
    """
    Returns class performance and Bloom's Taxonomy breakdown for faculty dashboard.
    """
    user_id = int(get_jwt_identity())
    course = Course.query.get(course_id)
    if not course:
        return jsonify({"error": "Course not found"}), 404
    if course.faculty_id != user_id:
        return jsonify({"error": "Permission denied"}), 403
        
    analytics = BloomAnalyzer.get_class_analytics(course_id)
    return jsonify({"analytics": analytics}), 200

@analytics_bp.route("/student/cognitive-profile", methods=["GET"])
@jwt_required()
def get_student_profile_analytics():
    """
    Returns student's longitudinal Bloom's Taxonomy cognitive radar chart and growth curve.
    """
    user_id = int(get_jwt_identity())
    course_id = request.args.get("course_id")
    course_id = int(course_id) if course_id else None
    
    profile = BloomAnalyzer.get_student_cognitive_profile(user_id, course_id)
    return jsonify({"profile": profile}), 200

@analytics_bp.route("/faculty/student/<int:student_id>/course/<int:course_id>", methods=["GET"])
@jwt_required()
def get_faculty_student_drilldown(student_id, course_id):
    """
    Faculty drilldown into an individual student's cognitive Bloom's performance in their course.
    """
    user_id = int(get_jwt_identity())
    course = Course.query.get(course_id)
    if not course or course.faculty_id != user_id:
        return jsonify({"error": "Permission denied"}), 403
        
    student = User.query.get(student_id)
    if not student:
        return jsonify({"error": "Student not found"}), 404
        
    profile = BloomAnalyzer.get_student_cognitive_profile(student_id, course_id)
    profile["student_name"] = student.name
    profile["student_email"] = student.email
    return jsonify({"profile": profile}), 200
