from models import BLOOM_LEVELS, AssessmentAttempt, StudentAnswer, QuestionBank, Assessment, Course, User
from collections import defaultdict
import json

class BloomAnalyzer:
    @staticmethod
    def calculate_attempt_mastery(attempt_id):
        """
        Calculates mastery breakdown per Bloom's Taxonomy level for a single attempt.
        """
        attempt = AssessmentAttempt.query.get(attempt_id)
        if not attempt:
            return None
            
        answers = StudentAnswer.query.filter_by(attempt_id=attempt_id).all()
        
        # Initialize Bloom level counters
        bloom_stats = {
            level: {
                "level": level,
                "total_questions": 0,
                "correct_questions": 0,
                "total_marks": 0.0,
                "scored_marks": 0.0,
                "percentage": 0.0,
                "status": "Not Assessed"
            }
            for level in BLOOM_LEVELS
        }
        
        topic_stats = defaultdict(lambda: {"total": 0, "correct": 0, "marks": 0.0, "scored": 0.0})
        
        for ans in answers:
            q = ans.question
            if not q:
                continue
            level = q.bloom_level.upper() if q.bloom_level else "UNDERSTAND"
            if level not in bloom_stats:
                bloom_stats[level] = {
                    "level": level,
                    "total_questions": 0,
                    "correct_questions": 0,
                    "total_marks": 0.0,
                    "scored_marks": 0.0,
                    "percentage": 0.0,
                    "status": "Not Assessed"
                }
                
            bloom_stats[level]["total_questions"] += 1
            bloom_stats[level]["total_marks"] += float(q.marks)
            bloom_stats[level]["scored_marks"] += float(ans.marks_awarded)
            if ans.is_correct:
                bloom_stats[level]["correct_questions"] += 1
                
            topic = q.topic or "General"
            topic_stats[topic]["total"] += 1
            topic_stats[topic]["marks"] += float(q.marks)
            topic_stats[topic]["scored"] += float(ans.marks_awarded)
            if ans.is_correct:
                topic_stats[topic]["correct"] += 1
                
        # Calculate percentages and mastery classifications
        weak_topics = []
        for topic, stat in topic_stats.items():
            pct = (stat["scored"] / stat["marks"] * 100) if stat["marks"] > 0 else 0
            if pct < 60:
                weak_topics.append(topic)
                
        for level, stat in bloom_stats.items():
            if stat["total_marks"] > 0:
                pct = round((stat["scored_marks"] / stat["total_marks"]) * 100, 1)
                stat["percentage"] = pct
                if pct >= 75:
                    stat["status"] = "Mastered"
                elif pct >= 50:
                    stat["status"] = "Competent"
                else:
                    stat["status"] = "Developing"
            else:
                stat["percentage"] = 0.0
                stat["status"] = "N/A"

        result = {
            "bloom_breakdown": bloom_stats,
            "weak_topics": weak_topics,
            "topic_breakdown": {t: {
                "accuracy": round((s["scored"] / s["marks"] * 100), 1) if s["marks"] > 0 else 0,
                "total": s["total"],
                "correct": s["correct"]
            } for t, s in topic_stats.items()}
        }
        
        # Save analysis to attempt
        attempt.set_bloom_analysis(result)
        return result

    @staticmethod
    def get_class_analytics(course_id):
        """
        Aggregates class-wide performance across all assessments in a course.
        """
        course = Course.query.get(course_id)
        if not course:
            return None
            
        assessments = Assessment.query.filter_by(course_id=course_id).all()
        assessment_ids = [a.id for a in assessments]
        
        attempts = AssessmentAttempt.query.filter(
            AssessmentAttempt.assessment_id.in_(assessment_ids),
            AssessmentAttempt.status == "completed"
        ).all()
        
        total_students = course.enrollments.count()
        total_attempts = len(attempts)
        
        if total_attempts == 0:
            return {
                "course_id": course_id,
                "course_title": course.title,
                "course_code": course.code,
                "total_students": total_students,
                "total_assessments": len(assessments),
                "total_attempts": 0,
                "average_percentage": 0.0,
                "pass_rate": 0.0,
                "bloom_radar": {level: 0 for level in BLOOM_LEVELS},
                "bloom_bar": {level: {"average": 0, "status": "N/A"} for level in BLOOM_LEVELS},
                "difficult_topics": [],
                "student_performance": []
            }
            
        avg_percentage = sum(a.percentage for a in attempts) / total_attempts
        pass_count = sum(1 for a in attempts if a.passed)
        pass_rate = (pass_count / total_attempts) * 100
        
        # Bloom's Taxonomy level totals across cohort
        bloom_level_totals = {level: {"total_marks": 0.0, "scored_marks": 0.0} for level in BLOOM_LEVELS}
        topic_totals = defaultdict(lambda: {"total_marks": 0.0, "scored_marks": 0.0})
        
        # Student-level map
        student_map = defaultdict(lambda: {"attempts": 0, "scores": [], "last_active": None, "name": ""})
        
        for a in attempts:
            st = a.student
            student_name = st.name if st else f"Student #{a.student_id}"
            student_map[a.student_id]["name"] = student_name
            student_map[a.student_id]["attempts"] += 1
            student_map[a.student_id]["scores"].append(a.percentage)
            student_map[a.student_id]["last_active"] = a.submit_time.isoformat() if a.submit_time else None
            
            analysis = a.get_bloom_analysis()
            breakdown = analysis.get("bloom_breakdown", {})
            for level, stats in breakdown.items():
                if level in bloom_level_totals:
                    bloom_level_totals[level]["total_marks"] += stats.get("total_marks", 0)
                    bloom_level_totals[level]["scored_marks"] += stats.get("scored_marks", 0)
                    
            for topic in analysis.get("weak_topics", []):
                topic_totals[topic]["scored_marks"] += 1
                topic_totals[topic]["total_marks"] += 2
                
        bloom_radar = {}
        bloom_bar = {}
        for level in BLOOM_LEVELS:
            tot = bloom_level_totals[level]["total_marks"]
            scored = bloom_level_totals[level]["scored_marks"]
            pct = round((scored / tot * 100), 1) if tot > 0 else 0.0
            bloom_radar[level] = pct
            status = "Mastered" if pct >= 75 else ("Competent" if pct >= 50 else "Developing")
            bloom_bar[level] = {"average": pct, "status": status}
            
        difficult_topics = sorted(topic_totals.keys(), key=lambda t: topic_totals[t]["scored_marks"], reverse=True)[:5]
        
        student_performance = []
        for s_id, s_data in student_map.items():
            avg_s = sum(s_data["scores"]) / len(s_data["scores"]) if s_data["scores"] else 0
            student_performance.append({
                "student_id": s_id,
                "student_name": s_data["name"],
                "attempts_count": s_data["attempts"],
                "average_score": round(avg_s, 1),
                "last_active": s_data["last_active"]
            })
            
        student_performance.sort(key=lambda x: x["average_score"], reverse=True)
        
        return {
            "course_id": course_id,
            "course_title": course.title,
            "course_code": course.code,
            "total_students": total_students,
            "total_assessments": len(assessments),
            "total_attempts": total_attempts,
            "average_percentage": round(avg_percentage, 1),
            "pass_rate": round(pass_rate, 1),
            "bloom_radar": bloom_radar,
            "bloom_bar": bloom_bar,
            "difficult_topics": difficult_topics,
            "student_performance": student_performance
        }

    @staticmethod
    def get_student_cognitive_profile(student_id, course_id=None):
        """
        Retrieves longitudinal Bloom's Taxonomy cognitive mastery profile for a student.
        """
        query = AssessmentAttempt.query.filter_by(student_id=student_id, status="completed")
        if course_id:
            query = query.join(Assessment).filter(Assessment.course_id == course_id)
            
        attempts = query.order_by(AssessmentAttempt.submit_time.asc()).all()
        
        if not attempts:
            return {
                "student_id": student_id,
                "total_completed": 0,
                "overall_average": 0.0,
                "bloom_radar": {level: 0 for level in BLOOM_LEVELS},
                "bloom_summary": {level: {"percentage": 0, "status": "N/A"} for level in BLOOM_LEVELS},
                "progress_timeline": [],
                "strengths": [],
                "weaknesses": []
            }
            
        bloom_aggregates = {level: {"total_marks": 0.0, "scored_marks": 0.0} for level in BLOOM_LEVELS}
        timeline = []
        
        for a in attempts:
            timeline.append({
                "assessment_id": a.assessment_id,
                "title": a.assessment.title if a.assessment else f"Assessment {a.assessment_id}",
                "date": a.submit_time.strftime("%b %d, %Y") if a.submit_time else "",
                "score": a.score,
                "percentage": a.percentage
            })
            
            analysis = a.get_bloom_analysis()
            breakdown = analysis.get("bloom_breakdown", {})
            for level, stat in breakdown.items():
                if level in bloom_aggregates:
                    bloom_aggregates[level]["total_marks"] += stat.get("total_marks", 0)
                    bloom_aggregates[level]["scored_marks"] += stat.get("scored_marks", 0)
                    
        bloom_radar = {}
        bloom_summary = {}
        strengths = []
        weaknesses = []
        
        for level in BLOOM_LEVELS:
            tot = bloom_aggregates[level]["total_marks"]
            scored = bloom_aggregates[level]["scored_marks"]
            pct = round((scored / tot * 100), 1) if tot > 0 else 0.0
            bloom_radar[level] = pct
            
            if pct >= 75:
                status = "Mastered"
                strengths.append(level)
            elif pct >= 50:
                status = "Competent"
            else:
                status = "Developing"
                weaknesses.append(level)
                
            bloom_summary[level] = {
                "percentage": pct,
                "status": status,
                "total_tested_marks": tot
            }
            
        avg_score = sum(a.percentage for a in attempts) / len(attempts)
        
        return {
            "student_id": student_id,
            "total_completed": len(attempts),
            "overall_average": round(avg_score, 1),
            "bloom_radar": bloom_radar,
            "bloom_summary": bloom_summary,
            "progress_timeline": timeline,
            "strengths": strengths,
            "weaknesses": weaknesses
        }
