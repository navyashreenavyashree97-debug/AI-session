import os
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from models import db, Course, CourseMaterial, Enrollment, User

materials_bp = Blueprint("materials", __name__)

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in current_app.config["ALLOWED_EXTENSIONS"]

@materials_bp.route("/course/<int:course_id>", methods=["GET"])
@jwt_required()
def get_course_materials(course_id):
    user_id = int(get_jwt_identity())
    course = Course.query.get(course_id)
    if not course:
        return jsonify({"error": "Course not found"}), 404
        
    materials = CourseMaterial.query.filter_by(course_id=course_id).order_by(CourseMaterial.uploaded_at.desc()).all()
    return jsonify({"materials": [m.to_dict() for m in materials]}), 200

@materials_bp.route("/upload", methods=["POST"])
@jwt_required()
def upload_material():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user or user.role != "faculty":
        return jsonify({"error": "Only faculty members can upload course materials"}), 403
        
    course_id = request.form.get("course_id")
    title = request.form.get("title", "").strip()
    description = request.form.get("description", "").strip()
    topic = request.form.get("topic", "General").strip()
    
    if not course_id or not title:
        return jsonify({"error": "course_id and title are required"}), 400
        
    course = Course.query.get(int(course_id))
    if not course or course.faculty_id != user.id:
        return jsonify({"error": "Course not found or permission denied"}), 403
        
    file = request.files.get("file")
    if file and file.filename:
        filename = secure_filename(file.filename)
        file_ext = filename.rsplit(".", 1)[1].lower() if "." in filename else "bin"
        unique_name = f"{course_id}_{os.urandom(4).hex()}_{filename}"
        save_path = os.path.join(current_app.config["UPLOAD_FOLDER"], unique_name)
        os.makedirs(current_app.config["UPLOAD_FOLDER"], exist_ok=True)
        file.save(save_path)
        file_size_kb = round(os.path.getsize(save_path) / 1024, 2)
        file_url = f"/api/materials/files/{unique_name}"
    else:
        # Allow creating reading notes / study guides without a physical file
        filename = "LectureNotes.txt"
        file_ext = "notes"
        file_size_kb = 12.5
        file_url = "#"
        
    material = CourseMaterial(
        course_id=int(course_id),
        title=title,
        description=description,
        file_name=filename,
        file_url=file_url,
        file_type=file_ext,
        file_size_kb=file_size_kb,
        topic=topic
    )
    db.session.add(material)
    db.session.commit()
    
    return jsonify({
        "message": "Material uploaded successfully",
        "material": material.to_dict()
    }), 201

@materials_bp.route("/files/<filename>", methods=["GET"])
def download_file(filename):
    return send_from_directory(current_app.config["UPLOAD_FOLDER"], filename)

@materials_bp.route("/<int:material_id>", methods=["DELETE"])
@jwt_required()
def delete_material(material_id):
    user_id = int(get_jwt_identity())
    material = CourseMaterial.query.get(material_id)
    if not material:
        return jsonify({"error": "Material not found"}), 404
        
    course = Course.query.get(material.course_id)
    if course.faculty_id != user_id:
        return jsonify({"error": "Permission denied"}), 403
        
    db.session.delete(material)
    db.session.commit()
    return jsonify({"message": "Material deleted successfully"}), 200
