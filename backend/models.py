from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import json

db = SQLAlchemy()

BLOOM_LEVELS = [
    "REMEMBER",
    "UNDERSTAND",
    "APPLY",
    "ANALYZE",
    "EVALUATE",
    "CREATE"
]

class User(db.Model):
    __tablename__ = "users"
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'faculty' or 'student'
    department = db.Column(db.String(100), default="Computer Science")
    student_id_number = db.Column(db.String(50), nullable=True)  # For students
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    courses_created = db.relationship("Course", backref="faculty", lazy="dynamic", cascade="all, delete-orphan")
    enrollments = db.relationship("Enrollment", backref="student", lazy="dynamic", cascade="all, delete-orphan")
    attempts = db.relationship("AssessmentAttempt", backref="student", lazy="dynamic", cascade="all, delete-orphan")
    recommendations = db.relationship("PersonalizedRecommendation", backref="student", lazy="dynamic", cascade="all, delete-orphan")
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
        
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "department": self.department,
            "student_id_number": self.student_id_number,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class Course(db.Model):
    __tablename__ = "courses"
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    code = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text, nullable=True)
    department = db.Column(db.String(100), nullable=False)
    semester = db.Column(db.String(30), nullable=False)
    academic_year = db.Column(db.String(30), nullable=False)
    duration = db.Column(db.String(50), default="16 Weeks")
    faculty_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    objectives = db.relationship("LearningObjective", backref="course", lazy="dynamic", cascade="all, delete-orphan")
    materials = db.relationship("CourseMaterial", backref="course", lazy="dynamic", cascade="all, delete-orphan")
    questions = db.relationship("QuestionBank", backref="course", lazy="dynamic", cascade="all, delete-orphan")
    assessments = db.relationship("Assessment", backref="course", lazy="dynamic", cascade="all, delete-orphan")
    enrollments = db.relationship("Enrollment", backref="course", lazy="dynamic", cascade="all, delete-orphan")
    
    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "code": self.code,
            "description": self.description,
            "department": self.department,
            "semester": self.semester,
            "academic_year": self.academic_year,
            "duration": self.duration,
            "faculty_id": self.faculty_id,
            "faculty_name": self.faculty.name if self.faculty else None,
            "enrolled_count": self.enrollments.count(),
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class Enrollment(db.Model):
    __tablename__ = "enrollments"
    
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    enrolled_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default="active")  # 'active', 'completed'
    
    __table_args__ = (db.UniqueConstraint("student_id", "course_id", name="_student_course_uc"),)
    
    def to_dict(self):
        return {
            "id": self.id,
            "student_id": self.student_id,
            "course_id": self.course_id,
            "course": self.course.to_dict() if self.course else None,
            "enrolled_at": self.enrolled_at.isoformat() if self.enrolled_at else None,
            "status": self.status
        }

class LearningObjective(db.Model):
    __tablename__ = "learning_objectives"
    
    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    topic = db.Column(db.String(150), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    bloom_level = db.Column(db.String(30), nullable=False)  # REMEMBER, UNDERSTAND, APPLY, ANALYZE, EVALUATE, CREATE
    expected_outcome = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    questions = db.relationship("QuestionBank", backref="objective", lazy="dynamic", cascade="all, delete-orphan")
    
    def to_dict(self):
        return {
            "id": self.id,
            "course_id": self.course_id,
            "topic": self.topic,
            "title": self.title,
            "description": self.description,
            "bloom_level": self.bloom_level.upper(),
            "expected_outcome": self.expected_outcome,
            "question_count": self.questions.count(),
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class CourseMaterial(db.Model):
    __tablename__ = "course_materials"
    
    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    file_name = db.Column(db.String(255), nullable=False)
    file_url = db.Column(db.String(500), nullable=False)
    file_type = db.Column(db.String(50), default="pdf")
    file_size_kb = db.Column(db.Float, default=0.0)
    topic = db.Column(db.String(150), default="General")
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            "id": self.id,
            "course_id": self.course_id,
            "title": self.title,
            "description": self.description,
            "file_name": self.file_name,
            "file_url": self.file_url,
            "file_type": self.file_type,
            "file_size_kb": self.file_size_kb,
            "topic": self.topic,
            "uploaded_at": self.uploaded_at.isoformat() if self.uploaded_at else None
        }

class QuestionBank(db.Model):
    __tablename__ = "question_bank"
    
    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    objective_id = db.Column(db.Integer, db.ForeignKey("learning_objectives.id", ondelete="SET NULL"), nullable=True)
    bloom_level = db.Column(db.String(30), nullable=False)  # REMEMBER, UNDERSTAND, APPLY, ANALYZE, EVALUATE, CREATE
    topic = db.Column(db.String(150), nullable=False)
    question_text = db.Column(db.Text, nullable=False)
    question_type = db.Column(db.String(30), default="mcq")  # mcq, short_answer
    options_json = db.Column(db.Text, nullable=True)  # JSON array string: ["Option A", "Option B", ...]
    correct_answer = db.Column(db.Text, nullable=False)
    explanation = db.Column(db.Text, nullable=True)
    marks = db.Column(db.Integer, default=1)
    difficulty = db.Column(db.String(20), default="Medium")  # Easy, Medium, Hard
    is_ai_generated = db.Column(db.Boolean, default=False)
    created_by = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def get_options(self):
        if self.options_json:
            try:
                return json.loads(self.options_json)
            except Exception:
                return []
        return []
        
    def set_options(self, options_list):
        self.options_json = json.dumps(options_list)
        
    def to_dict(self, include_answer=True):
        data = {
            "id": self.id,
            "course_id": self.course_id,
            "objective_id": self.objective_id,
            "objective_title": self.objective.title if self.objective else None,
            "bloom_level": self.bloom_level.upper(),
            "topic": self.topic,
            "question_text": self.question_text,
            "question_type": self.question_type,
            "options": self.get_options(),
            "marks": self.marks,
            "difficulty": self.difficulty,
            "is_ai_generated": self.is_ai_generated,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
        if include_answer:
            data["correct_answer"] = self.correct_answer
            data["explanation"] = self.explanation
        return data

class Assessment(db.Model):
    __tablename__ = "assessments"
    
    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    duration_minutes = db.Column(db.Integer, default=30)
    total_marks = db.Column(db.Integer, default=0)
    passing_marks = db.Column(db.Integer, default=40)
    start_date = db.Column(db.DateTime, nullable=True)
    end_date = db.Column(db.DateTime, nullable=True)
    attempt_limit = db.Column(db.Integer, default=1)
    is_published = db.Column(db.Boolean, default=False)
    created_by = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    assessment_questions = db.relationship("AssessmentQuestion", backref="assessment", lazy="dynamic", cascade="all, delete-orphan", order_by="AssessmentQuestion.order_index")
    attempts = db.relationship("AssessmentAttempt", backref="assessment", lazy="dynamic", cascade="all, delete-orphan")
    
    def to_dict(self):
        return {
            "id": self.id,
            "course_id": self.course_id,
            "course_title": self.course.title if self.course else None,
            "course_code": self.course.code if self.course else None,
            "title": self.title,
            "description": self.description,
            "duration_minutes": self.duration_minutes,
            "total_marks": self.total_marks,
            "passing_marks": self.passing_marks,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "attempt_limit": self.attempt_limit,
            "is_published": self.is_published,
            "question_count": self.assessment_questions.count(),
            "attempt_count": self.attempts.count(),
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class AssessmentQuestion(db.Model):
    __tablename__ = "assessment_questions"
    
    id = db.Column(db.Integer, primary_key=True)
    assessment_id = db.Column(db.Integer, db.ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey("question_bank.id", ondelete="CASCADE"), nullable=False)
    order_index = db.Column(db.Integer, default=0)
    marks = db.Column(db.Integer, default=1)
    
    question = db.relationship("QuestionBank", backref="in_assessments")
    
    def to_dict(self, include_answer=True):
        return {
            "id": self.id,
            "assessment_id": self.assessment_id,
            "question_id": self.question_id,
            "order_index": self.order_index,
            "marks": self.marks,
            "question": self.question.to_dict(include_answer=include_answer) if self.question else None
        }

class AssessmentAttempt(db.Model):
    __tablename__ = "assessment_attempts"
    
    id = db.Column(db.Integer, primary_key=True)
    assessment_id = db.Column(db.Integer, db.ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    attempt_number = db.Column(db.Integer, default=1)
    start_time = db.Column(db.DateTime, default=datetime.utcnow)
    submit_time = db.Column(db.DateTime, nullable=True)
    score = db.Column(db.Float, default=0.0)
    total_possible_marks = db.Column(db.Float, default=0.0)
    percentage = db.Column(db.Float, default=0.0)
    passed = db.Column(db.Boolean, default=False)
    status = db.Column(db.String(20), default="in_progress")  # in_progress, completed, timed_out
    bloom_analysis_json = db.Column(db.Text, nullable=True)  # JSON summary of Bloom's performance
    
    answers = db.relationship("StudentAnswer", backref="attempt", lazy="dynamic", cascade="all, delete-orphan")
    recommendation = db.relationship("PersonalizedRecommendation", backref="attempt", uselist=False, cascade="all, delete-orphan")
    
    def get_bloom_analysis(self):
        if self.bloom_analysis_json:
            try:
                return json.loads(self.bloom_analysis_json)
            except Exception:
                return {}
        return {}
        
    def set_bloom_analysis(self, data):
        self.bloom_analysis_json = json.dumps(data)
        
    def to_dict(self):
        return {
            "id": self.id,
            "assessment_id": self.assessment_id,
            "assessment_title": self.assessment.title if self.assessment else None,
            "course_id": self.assessment.course_id if self.assessment else None,
            "course_title": self.assessment.course.title if self.assessment and self.assessment.course else None,
            "student_id": self.student_id,
            "student_name": self.student.name if self.student else None,
            "attempt_number": self.attempt_number,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "submit_time": self.submit_time.isoformat() if self.submit_time else None,
            "score": round(self.score, 1),
            "total_possible_marks": round(self.total_possible_marks, 1),
            "percentage": round(self.percentage, 1),
            "passed": self.passed,
            "status": self.status,
            "bloom_analysis": self.get_bloom_analysis()
        }

class StudentAnswer(db.Model):
    __tablename__ = "student_answers"
    
    id = db.Column(db.Integer, primary_key=True)
    attempt_id = db.Column(db.Integer, db.ForeignKey("assessment_attempts.id", ondelete="CASCADE"), nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey("question_bank.id", ondelete="CASCADE"), nullable=False)
    student_answer = db.Column(db.Text, nullable=True)
    is_correct = db.Column(db.Boolean, default=False)
    marks_awarded = db.Column(db.Float, default=0.0)
    feedback = db.Column(db.Text, nullable=True)
    
    question = db.relationship("QuestionBank")
    
    def to_dict(self):
        return {
            "id": self.id,
            "attempt_id": self.attempt_id,
            "question_id": self.question_id,
            "question": self.question.to_dict(include_answer=True) if self.question else None,
            "student_answer": self.student_answer,
            "is_correct": self.is_correct,
            "marks_awarded": self.marks_awarded,
            "feedback": self.feedback
        }

class PersonalizedRecommendation(db.Model):
    __tablename__ = "personalized_recommendations"
    
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    attempt_id = db.Column(db.Integer, db.ForeignKey("assessment_attempts.id", ondelete="CASCADE"), nullable=True)
    primary_weak_bloom = db.Column(db.String(30), nullable=True)  # Weakest Bloom's level
    weak_topics_json = db.Column(db.Text, nullable=True)
    recommendation_summary = db.Column(db.Text, nullable=False)
    actionable_steps_json = db.Column(db.Text, nullable=True)
    suggested_resources_json = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    course = db.relationship("Course")
    
    def get_weak_topics(self):
        try:
            return json.loads(self.weak_topics_json) if self.weak_topics_json else []
        except Exception:
            return []
            
    def get_actionable_steps(self):
        try:
            return json.loads(self.actionable_steps_json) if self.actionable_steps_json else []
        except Exception:
            return []
            
    def get_suggested_resources(self):
        try:
            return json.loads(self.suggested_resources_json) if self.suggested_resources_json else []
        except Exception:
            return []
            
    def to_dict(self):
        return {
            "id": self.id,
            "student_id": self.student_id,
            "course_id": self.course_id,
            "course_title": self.course.title if self.course else None,
            "attempt_id": self.attempt_id,
            "primary_weak_bloom": self.primary_weak_bloom,
            "weak_topics": self.get_weak_topics(),
            "recommendation_summary": self.recommendation_summary,
            "actionable_steps": self.get_actionable_steps(),
            "suggested_resources": self.get_suggested_resources(),
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
