from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import PersonalizedRecommendation, User

recommendations_bp = Blueprint("recommendations", __name__)

@recommendations_bp.route("/student", methods=["GET"])
@jwt_required()
def get_student_recommendations():
    user_id = int(get_jwt_identity())
    course_id = request.args.get("course_id")
    
    query = PersonalizedRecommendation.query.filter_by(student_id=user_id)
    if course_id:
        query = query.filter_by(course_id=int(course_id))
        
    recs = query.order_by(PersonalizedRecommendation.created_at.desc()).all()
    return jsonify({"recommendations": [r.to_dict() for r in recs]}), 200

@recommendations_bp.route("/<int:rec_id>", methods=["GET"])
@jwt_required()
def get_recommendation_detail(rec_id):
    user_id = int(get_jwt_identity())
    rec = PersonalizedRecommendation.query.get(rec_id)
    if not rec:
        return jsonify({"error": "Recommendation not found"}), 404
    if rec.student_id != user_id:
        return jsonify({"error": "Permission denied"}), 403
        
    return jsonify({"recommendation": rec.to_dict()}), 200
