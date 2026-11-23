import json
from app import create_app

def run_tests():
    app = create_app()
    client = app.test_client()
    
    print("--- 1. Testing Health Check ---")
    res = client.get("/api/health")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    print("Health check OK:", res.get_json())
    
    print("\n--- 2. Testing Faculty Login ---")
    res = client.post("/api/auth/login", json={
        "email": "faculty@demo.edu",
        "password": "Faculty@123"
    })
    assert res.status_code == 200, f"Faculty login failed: {res.data}"
    fac_data = res.get_json()
    fac_token = fac_data["access_token"]
    fac_headers = {"Authorization": f"Bearer {fac_token}"}
    print("Faculty Login OK. Welcome,", fac_data["user"]["name"])
    
    print("\n--- 3. Testing Course Retrieval ---")
    res = client.get("/api/courses", headers=fac_headers)
    assert res.status_code == 200
    courses = res.get_json()["courses"]
    assert len(courses) >= 1
    course_id = courses[0]["id"]
    print(f"Retrieved {len(courses)} courses. Active course: {courses[0]['title']} ({courses[0]['code']})")
    
    print("\n--- 4. Testing Bloom's Taxonomy Objectives ---")
    res = client.get(f"/api/objectives/course/{course_id}", headers=fac_headers)
    assert res.status_code == 200
    objs = res.get_json()["objectives"]
    bloom_levels = [o["bloom_level"] for o in objs]
    print(f"Retrieved {len(objs)} learning objectives. Bloom's levels represented: {bloom_levels}")
    assert "REMEMBER" in bloom_levels and "CREATE" in bloom_levels, "All 6 Bloom's levels should be present"
    
    print("\n--- 5. Testing Question Bank Retrieval ---")
    res = client.get(f"/api/questions/course/{course_id}", headers=fac_headers)
    assert res.status_code == 200
    questions = res.get_json()["questions"]
    print(f"Retrieved {len(questions)} questions from question bank across Bloom's levels.")
    
    print("\n--- 6. Testing Class Analytics & Radar Chart Data ---")
    res = client.get(f"/api/analytics/faculty/course/{course_id}", headers=fac_headers)
    assert res.status_code == 200
    analytics = res.get_json()["analytics"]
    print("Class Bloom Radar Chart Scores:", analytics["bloom_radar"])
    print("Class Pass Rate:", analytics["pass_rate"], "%")
    
    print("\n--- 7. Testing Student Login ---")
    res = client.post("/api/auth/login", json={
        "email": "student@demo.edu",
        "password": "Student@123"
    })
    assert res.status_code == 200
    stu_data = res.get_json()
    stu_token = stu_data["access_token"]
    stu_headers = {"Authorization": f"Bearer {stu_token}"}
    print("Student Login OK. Welcome,", stu_data["user"]["name"])
    
    print("\n--- 8. Testing Student Cognitive Profile (Bloom's Growth) ---")
    res = client.get("/api/analytics/student/cognitive-profile", headers=stu_headers)
    assert res.status_code == 200
    profile = res.get_json()["profile"]
    print("Student Bloom Cognitive Scores:", profile["bloom_radar"])
    print("Strengths:", profile["strengths"])
    print("Weaknesses:", profile["weaknesses"])
    
    print("\n--- 9. Testing AI Personalized Recommendations ---")
    res = client.get("/api/recommendations/student", headers=stu_headers)
    assert res.status_code == 200
    recs = res.get_json()["recommendations"]
    assert len(recs) >= 1
    print("Retrieved recommendation targeting Bloom level:", recs[0]["primary_weak_bloom"])
    print("Recommendation Summary Preview:", recs[0]["recommendation_summary"][:120], "...")
    print("Actionable Steps:", recs[0]["actionable_steps"])
    
    print("\n>>> ALL BACKEND API & BLOOM'S TAXONOMY ENGINE TESTS PASSED WITH 100% SUCCESS! <<<")

if __name__ == "__main__":
    run_tests()
