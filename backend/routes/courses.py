from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Course, Enrollment

courses_bp = Blueprint("courses", __name__)

@courses_bp.route("", methods=["GET"])
@jwt_required()
def get_courses():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    if user.role == "faculty":
        courses = Course.query.filter_by(faculty_id=user.id).order_by(Course.created_at.desc()).all()
        return jsonify({"courses": [c.to_dict() for c in courses]}), 200
    else:
        # For students: return enrolled courses
        enrollments = Enrollment.query.filter_by(student_id=user.id, status="active").all()
        courses = [e.course.to_dict() for e in enrollments if e.course]
        return jsonify({"courses": courses}), 200

@courses_bp.route("/browse", methods=["GET"])
@jwt_required()
def browse_courses():
    """Returns all courses so students can browse and enroll."""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    all_courses = Course.query.order_by(Course.created_at.desc()).all()
    enrolled_ids = {e.course_id for e in Enrollment.query.filter_by(student_id=user.id).all()}
    
    result = []
    for c in all_courses:
        c_dict = c.to_dict()
        c_dict["is_enrolled"] = c.id in enrolled_ids
        result.append(c_dict)
        
    return jsonify({"courses": result}), 200

@courses_bp.route("/<int:course_id>", methods=["GET"])
@jwt_required()
def get_course_detail(course_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    course = Course.query.get(course_id)
    if not course:
        return jsonify({"error": "Course not found"}), 404
        
    # Check access: Faculty owner or enrolled student
    is_owner = (user.role == "faculty" and course.faculty_id == user.id)
    is_enrolled = Enrollment.query.filter_by(student_id=user.id, course_id=course_id).first() is not None
    
    course_data = course.to_dict()
    course_data["is_owner"] = is_owner
    course_data["is_enrolled"] = is_enrolled
    
    return jsonify({"course": course_data}), 200

@courses_bp.route("", methods=["POST"])
@jwt_required()
def create_course():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user or user.role != "faculty":
        return jsonify({"error": "Only faculty members can create courses"}), 403
        
    data = request.get_json() or {}
    title = data.get("title", "").strip()
    code = data.get("code", "").strip().upper()
    description = data.get("description", "").strip()
    department = data.get("department", user.department).strip()
    semester = data.get("semester", "Fall 2026").strip()
    academic_year = data.get("academic_year", "2026-2027").strip()
    duration = data.get("duration", "16 Weeks").strip()
    
    if not title or not code:
        return jsonify({"error": "Course title and code are required"}), 400
        
    course = Course(
        title=title,
        code=code,
        description=description,
        department=department,
        semester=semester,
        academic_year=academic_year,
        duration=duration,
        faculty_id=user.id
    )
    db.session.add(course)
    db.session.commit()
    
    return jsonify({
        "message": "Course created successfully",
        "course": course.to_dict()
    }), 201

@courses_bp.route("/<int:course_id>", methods=["PUT"])
@jwt_required()
def update_course(course_id):
    user_id = int(get_jwt_identity())
    course = Course.query.get(course_id)
    if not course:
        return jsonify({"error": "Course not found"}), 404
    if course.faculty_id != user_id:
        return jsonify({"error": "You do not have permission to edit this course"}), 403
        
    data = request.get_json() or {}
    if "title" in data and data["title"].strip():
        course.title = data["title"].strip()
    if "code" in data and data["code"].strip():
        course.code = data["code"].strip().upper()
    if "description" in data:
        course.description = data["description"].strip()
    if "department" in data:
        course.department = data["department"].strip()
    if "semester" in data:
        course.semester = data["semester"].strip()
    if "academic_year" in data:
        course.academic_year = data["academic_year"].strip()
    if "duration" in data:
        course.duration = data["duration"].strip()
        
    db.session.commit()
    return jsonify({
        "message": "Course updated successfully",
        "course": course.to_dict()
    }), 200

@courses_bp.route("/<int:course_id>", methods=["DELETE"])
@jwt_required()
def delete_course(course_id):
    user_id = int(get_jwt_identity())
    course = Course.query.get(course_id)
    if not course:
        return jsonify({"error": "Course not found"}), 404
    if course.faculty_id != user_id:
        return jsonify({"error": "You do not have permission to delete this course"}), 403
        
    db.session.delete(course)
    db.session.commit()
    return jsonify({"message": "Course and all associated materials deleted successfully"}), 200

@courses_bp.route("/<int:course_id>/enroll", methods=["POST"])
@jwt_required()
def enroll_course(course_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user or user.role != "student":
        return jsonify({"error": "Only students can enroll in courses"}), 403
        
    course = Course.query.get(course_id)
    if not course:
        return jsonify({"error": "Course not found"}), 404
        
    existing = Enrollment.query.filter_by(student_id=user.id, course_id=course_id).first()
    if existing:
        return jsonify({"message": "Already enrolled in this course", "enrollment": existing.to_dict()}), 200
        
    enrollment = Enrollment(student_id=user.id, course_id=course_id)
    db.session.add(enrollment)
    db.session.commit()
    
    return jsonify({
        "message": "Enrolled successfully",
        "enrollment": enrollment.to_dict()
    }), 201

@courses_bp.route("/<int:course_id>/students", methods=["GET"])
@jwt_required()
def get_enrolled_students(course_id):
    user_id = int(get_jwt_identity())
    course = Course.query.get(course_id)
    if not course:
        return jsonify({"error": "Course not found"}), 404
    if course.faculty_id != user_id:
        return jsonify({"error": "Permission denied"}), 403
        
    enrollments = Enrollment.query.filter_by(course_id=course_id).all()
    students = []
    for e in enrollments:
        if e.student:
            st = e.student.to_dict()
            st["enrolled_at"] = e.enrolled_at.isoformat() if e.enrolled_at else None
            students.append(st)
            
    return jsonify({"students": students}), 200
