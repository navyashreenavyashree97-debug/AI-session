import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from models import db

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
    
    # Initialize DB & JWT
    db.init_app(app)
    jwt = JWTManager(app)
    
    # Ensure upload folder exists
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
    
    # Register blueprints
    from routes.auth import auth_bp
    from routes.courses import courses_bp
    from routes.objectives import objectives_bp
    from routes.materials import materials_bp
    from routes.questions import questions_bp
    from routes.assessments import assessments_bp
    from routes.attempts import attempts_bp
    from routes.analytics import analytics_bp
    from routes.recommendations import recommendations_bp
    
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(courses_bp, url_prefix="/api/courses")
    app.register_blueprint(objectives_bp, url_prefix="/api/objectives")
    app.register_blueprint(materials_bp, url_prefix="/api/materials")
    app.register_blueprint(questions_bp, url_prefix="/api/questions")
    app.register_blueprint(assessments_bp, url_prefix="/api/assessments")
    app.register_blueprint(attempts_bp, url_prefix="/api/attempts")
    app.register_blueprint(analytics_bp, url_prefix="/api/analytics")
    app.register_blueprint(recommendations_bp, url_prefix="/api/recommendations")
    
    @app.route("/api/health", methods=["GET"])
    def health_check():
        return jsonify({
            "status": "healthy",
            "service": "Bloom's Taxonomy Student Learning Ability & Recommendation API",
            "version": "1.0.0"
        }), 200

    # Serve React Frontend Build in Production
    frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
    
    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serve_frontend(path):
        if path.startswith("api/"):
            return jsonify({"error": "Endpoint not found"}), 404
        if os.path.exists(os.path.join(frontend_dist, path)) and path != "":
            from flask import send_from_directory
            return send_from_directory(frontend_dist, path)
        from flask import send_from_directory
        if os.path.exists(os.path.join(frontend_dist, "index.html")):
            return send_from_directory(frontend_dist, "index.html")
        return jsonify({"message": "BloomAnalytics API Server Running. Build frontend with 'npm run build' to serve UI."}), 200

    with app.app_context():
        db.create_all()
        # Auto-seed demo data on first run (production & local)
        _auto_seed(app)

    return app


def _auto_seed(app):
    """Seed demo data only if the users table is empty."""
    try:
        from models import User
        with app.app_context():
            if User.query.count() == 0:
                import subprocess, sys, os
                seed_path = os.path.join(os.path.dirname(__file__), "seed_data.py")
                subprocess.run([sys.executable, seed_path], check=False)
                print("✅ Demo seed data loaded successfully.")
    except Exception as e:
        print(f"⚠️  Seed skipped: {e}")

if __name__ == "__main__":
    app = create_app()
    port = int(os.environ.get("PORT", 5000))
    print(f"Starting Bloom's Taxonomy Educational Server on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=True)
