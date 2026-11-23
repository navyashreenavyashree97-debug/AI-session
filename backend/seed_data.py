import os
import json
from datetime import datetime, timedelta
from app import create_app
from models import (
    db, User, Course, Enrollment, LearningObjective, 
    CourseMaterial, QuestionBank, Assessment, AssessmentQuestion,
    AssessmentAttempt, StudentAnswer, PersonalizedRecommendation
)

def seed():
    app = create_app()
    with app.app_context():
        # Clear existing tables
        db.drop_all()
        db.create_all()
        
        print("Creating users...")
        # 1. Faculty
        faculty = User(
            name="Dr. Alan Turing",
            email="faculty@demo.edu",
            role="faculty",
            department="Computer Science & Engineering"
        )
        faculty.set_password("Faculty@123")
        db.session.add(faculty)
        
        # 2. Students
        student1 = User(
            name="Ada Lovelace",
            email="student@demo.edu",
            role="student",
            department="Computer Science & Engineering",
            student_id_number="CS-2026-001"
        )
        student1.set_password("Student@123")
        db.session.add(student1)
        
        student2 = User(
            name="Grace Hopper",
            email="student2@demo.edu",
            role="student",
            department="Computer Science & Engineering",
            student_id_number="CS-2026-002"
        )
        student2.set_password("Student@123")
        db.session.add(student2)
        
        db.session.commit()
        
        print("Creating courses...")
        # Course 1: DBMS
        course_dbms = Course(
            title="Database Management Systems",
            code="CS301",
            description="Comprehensive study of relational models, SQL query processing, normalization theory (1NF to BCNF), indexing, concurrency control, and database design.",
            department="Computer Science & Engineering",
            semester="Fall 2026",
            academic_year="2026-2027",
            duration="16 Weeks",
            faculty_id=faculty.id
        )
        
        # Course 2: Algorithms
        course_algo = Course(
            title="Design & Analysis of Algorithms",
            code="CS402",
            description="Asymptotic analysis, divide-and-conquer, greedy techniques, dynamic programming, graph algorithms, and intractability.",
            department="Computer Science & Engineering",
            semester="Fall 2026",
            academic_year="2026-2027",
            duration="16 Weeks",
            faculty_id=faculty.id
        )
        db.session.add_all([course_dbms, course_algo])
        db.session.commit()
        
        # Enroll students
        e1 = Enrollment(student_id=student1.id, course_id=course_dbms.id)
        e2 = Enrollment(student_id=student1.id, course_id=course_algo.id)
        e3 = Enrollment(student_id=student2.id, course_id=course_dbms.id)
        db.session.add_all([e1, e2, e3])
        db.session.commit()
        
        print("Creating Bloom's Taxonomy Learning Objectives...")
        objectives_data = [
            {
                "topic": "Relational Concepts",
                "title": "Recall Relational Fundamentals",
                "bloom_level": "REMEMBER",
                "description": "Recall core database terminology including relation, tuple, domain, candidate keys, and foreign key constraints.",
                "expected_outcome": "Students will state the definition of relational schemas and list relational integrity constraints."
            },
            {
                "topic": "Normalization",
                "title": "Explain Database Normalization",
                "bloom_level": "UNDERSTAND",
                "description": "Explain the motivation behind normalization, anomalous states (insertion, deletion, update), and functional dependencies.",
                "expected_outcome": "Students will articulate how 2NF, 3NF, and BCNF eliminate unwanted data redundancies."
            },
            {
                "topic": "SQL & Transactions",
                "title": "Apply SQL & Query Constructs",
                "bloom_level": "APPLY",
                "description": "Formulate multi-table JOINs, GROUP BY aggregations, and transactional statements using standardized SQL.",
                "expected_outcome": "Students will solve business data retrieval requirements using optimized SQL queries."
            },
            {
                "topic": "Indexing & Performance",
                "title": "Analyze Query Execution Plans",
                "bloom_level": "ANALYZE",
                "description": "Examine B+ tree indexing structures, evaluate table scans versus index lookups, and identify execution bottlenecks.",
                "expected_outcome": "Students will deconstruct query execution plans to isolate cost drivers."
            },
            {
                "topic": "Storage Architectures",
                "title": "Evaluate Database Architectural Paradigms",
                "bloom_level": "EVALUATE",
                "description": "Appraise and justify the choice between relational ACID databases and distributed NoSQL systems under CAP theorem trade-offs.",
                "expected_outcome": "Students will defend database architecture decisions based on consistency and latency criteria."
            },
            {
                "topic": "System Design",
                "title": "Design Enterprise Database Schemas",
                "bloom_level": "CREATE",
                "description": "Design an end-to-end normalized relational schema for real-world scenarios incorporating audit trails and partition strategies.",
                "expected_outcome": "Students will produce complete ER diagrams and DDL deployment scripts for high-load systems."
            }
        ]
        
        created_objs = []
        for obj in objectives_data:
            lo = LearningObjective(
                course_id=course_dbms.id,
                topic=obj["topic"],
                title=obj["title"],
                bloom_level=obj["bloom_level"],
                description=obj["description"],
                expected_outcome=obj["expected_outcome"]
            )
            db.session.add(lo)
            created_objs.append(lo)
        db.session.commit()
        
        print("Creating Course Materials...")
        m1 = CourseMaterial(
            course_id=course_dbms.id,
            title="Unit 1: Relational Model & SQL Fundamentals",
            description="Comprehensive lecture notes covering relational algebra, key constraints, and SQL syntax.",
            file_name="Unit1_Relational_Model.pdf",
            file_url="/api/materials/files/sample_unit1.pdf",
            file_type="pdf",
            file_size_kb=340.5,
            topic="Relational Concepts"
        )
        m2 = CourseMaterial(
            course_id=course_dbms.id,
            title="Unit 2: Normalization Theory & Functional Dependencies",
            description="In-depth guide to 1NF, 2NF, 3NF, BCNF decomposition and dependency preservation.",
            file_name="Unit2_Normalization.pdf",
            file_url="/api/materials/files/sample_unit2.pdf",
            file_type="pdf",
            file_size_kb=512.0,
            topic="Normalization"
        )
        m3 = CourseMaterial(
            course_id=course_dbms.id,
            title="Unit 3: Indexing, B-Trees & Query Optimization",
            description="Detailed lecture slides on clustered vs unclustered indexing and query cost models.",
            file_name="Unit3_Indexing_Optimization.pdf",
            file_url="/api/materials/files/sample_unit3.pdf",
            file_type="pdf",
            file_size_kb=680.0,
            topic="Indexing & Performance"
        )
        db.session.add_all([m1, m2, m3])
        db.session.commit()
        
        print("Creating Question Bank mapped to Bloom's levels...")
        questions_data = [
            # 1. REMEMBER
            {
                "obj_idx": 0,
                "bloom_level": "REMEMBER",
                "topic": "Relational Concepts",
                "text": "Which of the following properties guarantees that database transactions are processed reliably in the presence of system crashes?",
                "options": ["ACID Properties", "CAP Theorem", "Two-Phase Commit Protocol", "BASE Properties"],
                "correct": "ACID Properties",
                "explanation": "ACID (Atomicity, Consistency, Isolation, Durability) represents the foundational property ensuring reliable transactional processing.",
                "marks": 1,
                "difficulty": "Easy"
            },
            {
                "obj_idx": 0,
                "bloom_level": "REMEMBER",
                "topic": "Relational Concepts",
                "text": "What term defines a minimal set of attributes that uniquely identifies each tuple in a relation?",
                "options": ["Candidate Key", "Super Key", "Foreign Key", "Secondary Index"],
                "correct": "Candidate Key",
                "explanation": "A Candidate Key is by definition a minimal superkey containing no extraneous attributes.",
                "marks": 1,
                "difficulty": "Easy"
            },
            # 2. UNDERSTAND
            {
                "obj_idx": 1,
                "bloom_level": "UNDERSTAND",
                "topic": "Normalization",
                "text": "Why does Boyce-Codd Normal Form (BCNF) enforce stricter constraints than Third Normal Form (3NF)?",
                "options": [
                    "BCNF mandates that for every functional dependency X -> Y, X must be a superkey, eliminating non-prime to prime transitivities",
                    "BCNF allows multi-valued dependencies while 3NF disallows them entirely",
                    "BCNF strictly requires all tables to contain fewer than 5 attributes",
                    "BCNF guarantees dependency preservation in all polynomial decompositions"
                ],
                "correct": "BCNF mandates that for every functional dependency X -> Y, X must be a superkey, eliminating non-prime to prime transitivities",
                "explanation": "BCNF removes the exception present in 3NF where Y is permitted to be a prime attribute, closing subtle redundancy anomalies.",
                "marks": 2,
                "difficulty": "Medium"
            },
            {
                "obj_idx": 1,
                "bloom_level": "UNDERSTAND",
                "topic": "Normalization",
                "text": "Which anomalous condition occurs when deleting an entity inadvertently erases unrelated data from the database?",
                "options": ["Deletion Anomaly", "Insertion Anomaly", "Phantom Read", "Cascading Rollback"],
                "correct": "Deletion Anomaly",
                "explanation": "A deletion anomaly arises when loss of one entity unintentionally removes attributes of another entity due to inadequate normalization.",
                "marks": 1,
                "difficulty": "Easy"
            },
            # 3. APPLY
            {
                "obj_idx": 2,
                "bloom_level": "APPLY",
                "topic": "SQL & Transactions",
                "text": "Given tables Employees(id, dept_id, salary) and Departments(id, name), which SQL query correctly retrieves the department names where the average salary exceeds $80,000?",
                "options": [
                    "SELECT d.name FROM Departments d JOIN Employees e ON d.id = e.dept_id GROUP BY d.id, d.name HAVING AVG(e.salary) > 80000",
                    "SELECT d.name FROM Departments d WHERE AVG(d.salary) > 80000 GROUP BY d.name",
                    "SELECT d.name FROM Departments d JOIN Employees e ON d.id = e.dept_id WHERE AVG(e.salary) > 80000",
                    "SELECT d.name FROM Departments d, Employees e WHERE e.salary > 80000"
                ],
                "correct": "SELECT d.name FROM Departments d JOIN Employees e ON d.id = e.dept_id GROUP BY d.id, d.name HAVING AVG(e.salary) > 80000",
                "explanation": "Applying SQL requires utilizing the HAVING clause for aggregated filters following GROUP BY.",
                "marks": 2,
                "difficulty": "Medium"
            },
            # 4. ANALYZE
            {
                "obj_idx": 3,
                "bloom_level": "ANALYZE",
                "topic": "Indexing & Performance",
                "text": "An engineering team observes that query execution time on a 50-million-row table drops from 12 seconds to 4 milliseconds after adding a composite index on (country, status, created_at). Why does a query filtering ONLY on 'created_at' still take 12 seconds?",
                "options": [
                    "The query planner cannot perform an index range scan because the leading columns of the composite index are omitted",
                    "Composite indexes are automatically disabled if table size exceeds 10 million rows",
                    "The operating system file buffer caches only the first column of any compound index",
                    "B+ tree leaf nodes only store pointers for the leftmost column"
                ],
                "correct": "The query planner cannot perform an index range scan because the leading columns of the composite index are omitted",
                "explanation": "B+ tree composite indexes follow the leftmost prefix rule. Omitting leading columns forces an index scan or full table scan.",
                "marks": 2,
                "difficulty": "Hard"
            },
            # 5. EVALUATE
            {
                "obj_idx": 4,
                "bloom_level": "EVALUATE",
                "topic": "Storage Architectures",
                "text": "Evaluate the architectural suitability of Cassandra (Eventual Consistency) vs PostgreSQL (Strict Serializable ACID) for a banking core ledger requiring zero double-spending.",
                "options": [
                    "PostgreSQL is superior because Serializable ACID transactions prevent concurrent balance race conditions and double-spending",
                    "Cassandra is superior because eventual consistency guarantees immediate atomic balance deductions across continents",
                    "Both provide identical linearizable guarantees under network partitions",
                    "Cassandra should be chosen because banking ledgers never require strict consistency"
                ],
                "correct": "PostgreSQL is superior because Serializable ACID transactions prevent concurrent balance race conditions and double-spending",
                "explanation": "Evaluating architectural fitness necessitates prioritizing strong consistency and serializability over high write availability for financial ledgers.",
                "marks": 2,
                "difficulty": "Hard"
            },
            # 6. CREATE
            {
                "obj_idx": 5,
                "bloom_level": "CREATE",
                "topic": "System Design",
                "text": "Design a resilient schema and write strategy for an international e-commerce platform during flash sales (50,000 checkout attempts/sec). Which design provides maximum throughput while preventing inventory overselling?",
                "options": [
                    "Pre-allocated inventory token buckets in Redis with atomic Lua scripts, backed by asynchronous outbox events syncing to PostgreSQL",
                    "Single monolithic table with row-level pessimistic locks held across entire 10-step checkout workflows",
                    "Raw CSV file append operations with periodic cron job reconciliations",
                    "Distributed database with read-uncommitted isolation level and zero locking"
                ],
                "correct": "Pre-allocated inventory token buckets in Redis with atomic Lua scripts, backed by asynchronous outbox events syncing to PostgreSQL",
                "explanation": "Synthesizes multi-tier caching, atomic reservations, and reliable event-driven relational persistence to solve extreme throughput requirements.",
                "marks": 3,
                "difficulty": "Hard"
            }
        ]
        
        saved_questions = []
        for q in questions_data:
            qb = QuestionBank(
                course_id=course_dbms.id,
                objective_id=created_objs[q["obj_idx"]].id,
                bloom_level=q["bloom_level"],
                topic=q["topic"],
                question_text=q["text"],
                question_type="mcq",
                correct_answer=q["correct"],
                explanation=q["explanation"],
                marks=q["marks"],
                difficulty=q["difficulty"],
                is_ai_generated=False,
                created_by=faculty.id
            )
            qb.set_options(q["options"])
            db.session.add(qb)
            saved_questions.append(qb)
        db.session.commit()
        
        print("Creating Assessment...")
        now = datetime.utcnow()
        assessment = Assessment(
            course_id=course_dbms.id,
            title="Mid-Term Assessment: Bloom's Comprehensive Evaluation",
            description="Comprehensive assessment measuring all six cognitive levels of Bloom's Taxonomy in Database Management Systems.",
            duration_minutes=45,
            total_marks=sum(q.marks for q in saved_questions),
            passing_marks=50,
            start_date=now - timedelta(days=2),
            end_date=now + timedelta(days=14),
            attempt_limit=2,
            is_published=True,
            created_by=faculty.id
        )
        db.session.add(assessment)
        db.session.flush()
        
        for idx, q in enumerate(saved_questions):
            aq = AssessmentQuestion(
                assessment_id=assessment.id,
                question_id=q.id,
                order_index=idx,
                marks=q.marks
            )
            db.session.add(aq)
        db.session.commit()
        
        print("Simulating sample student attempt for Ada Lovelace...")
        attempt = AssessmentAttempt(
            assessment_id=assessment.id,
            student_id=student1.id,
            attempt_number=1,
            start_time=now - timedelta(hours=2),
            submit_time=now - timedelta(hours=1, minutes=20),
            total_possible_marks=assessment.total_marks,
            status="completed"
        )
        db.session.add(attempt)
        db.session.flush()
        
        # Ada gets REMEMBER, UNDERSTAND, and APPLY correct, but misses ANALYZE & CREATE
        answers_map = {
            "REMEMBER": True,
            "UNDERSTAND": True,
            "APPLY": True,
            "ANALYZE": False,
            "EVALUATE": True,
            "CREATE": False
        }
        
        total_score = 0.0
        for q in saved_questions:
            should_be_correct = answers_map.get(q.bloom_level, True)
            opts = q.get_options()
            if should_be_correct:
                ans_str = q.correct_answer
                awarded = float(q.marks)
            else:
                wrong_opts = [o for o in opts if o != q.correct_answer]
                ans_str = wrong_opts[0] if wrong_opts else "Incorrect choice"
                awarded = 0.0
                
            total_score += awarded
            sa = StudentAnswer(
                attempt_id=attempt.id,
                question_id=q.id,
                student_answer=ans_str,
                is_correct=should_be_correct,
                marks_awarded=awarded,
                feedback="Correct! Well done." if should_be_correct else q.explanation
            )
            db.session.add(sa)
            
        attempt.score = total_score
        attempt.percentage = round((total_score / assessment.total_marks) * 100.0, 1)
        attempt.passed = (attempt.percentage >= assessment.passing_marks)
        db.session.commit()
        
        # Run Bloom's analysis
        from services.bloom_analyzer import BloomAnalyzer
        bloom_analysis = BloomAnalyzer.calculate_attempt_mastery(attempt.id)
        
        # Generate personalized recommendation
        from services.ai_service import AIService
        rec_data = AIService.generate_recommendations(
            student_name=student1.name,
            course_title=course_dbms.title,
            bloom_breakdown=bloom_analysis.get("bloom_breakdown", {}),
            weak_topics=bloom_analysis.get("weak_topics", [])
        )
        
        rec = PersonalizedRecommendation(
            student_id=student1.id,
            course_id=course_dbms.id,
            attempt_id=attempt.id,
            primary_weak_bloom=rec_data.get("primary_weak_bloom", "ANALYZE"),
            weak_topics_json=json.dumps(bloom_analysis.get("weak_topics", [])),
            recommendation_summary=rec_data.get("recommendation_summary", ""),
            actionable_steps_json=json.dumps(rec_data.get("actionable_steps", [])),
            suggested_resources_json=json.dumps(rec_data.get("suggested_resources", []))
        )
        db.session.add(rec)
        db.session.commit()
        
        print("SEEDING COMPLETE!")
        print("Faculty Account: faculty@demo.edu / Faculty@123")
        print("Student Account: student@demo.edu / Student@123")
        print("Student 2:       student2@demo.edu / Student@123")

if __name__ == "__main__":
    seed()
