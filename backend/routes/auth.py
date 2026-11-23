from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import db, User

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    name = data.get("name", "").strip()
    role = data.get("role", "student").strip().lower()
    department = data.get("department", "Computer Science").strip()
    student_id_number = data.get("student_id_number", "").strip()
    
    if not email or not password or not name:
        return jsonify({"error": "Name, email, and password are required"}), 400
        
    if role not in ["faculty", "student"]:
        return jsonify({"error": "Role must be either 'faculty' or 'student'"}), 400
        
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "An account with this email already exists"}), 409
        
    user = User(
        name=name,
        email=email,
        role=role,
        department=department,
        student_id_number=student_id_number if role == "student" else None
    )
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    
    token = create_access_token(identity=str(user.id))
    return jsonify({
        "message": f"{role.capitalize()} registered successfully",
        "access_token": token,
        "user": user.to_dict()
    }), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
        
    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid email or password"}), 401
        
    token = create_access_token(identity=str(user.id))
    return jsonify({
        "message": "Login successful",
        "access_token": token,
        "user": user.to_dict()
    }), 200

@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"user": user.to_dict()}), 200

@auth_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    data = request.get_json() or {}
    if "name" in data and data["name"].strip():
        user.name = data["name"].strip()
    if "department" in data and data["department"].strip():
        user.department = data["department"].strip()
    if user.role == "student" and "student_id_number" in data:
        user.student_id_number = data["student_id_number"].strip()
    if "password" in data and data["password"].strip():
        user.set_password(data["password"].strip())
        
    db.session.commit()
    return jsonify({
        "message": "Profile updated successfully",
        "user": user.to_dict()
    }), 200
