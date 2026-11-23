# 🎓 Bloom's Taxonomy – Student Learning Ability Analysis & Recommendation System

> **AI-powered educational platform** that maps every assessment question to the six revised Bloom's Taxonomy levels and provides personalized remediation guidance using the Gemini API.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Render-46E3B7?logo=render)](https://bloom-analytics-portal.onrender.com)
[![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python)](https://python.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![Flask](https://img.shields.io/badge/Flask-3.0-black?logo=flask)](https://flask.palletsprojects.com)
[![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38BDF8?logo=tailwindcss)](https://tailwindcss.com)

---

## 📸 Screenshots

| Login | Faculty Dashboard | Student Dashboard |
|-------|-------------------|-------------------|
| ![login](docs/screenshots/login.png) | ![faculty](docs/screenshots/faculty_dashboard.png) | ![student](docs/screenshots/student_dashboard.png) |

---

## ✨ Features

### 👨‍🏫 Faculty Module
| # | Feature |
|---|---------|
| 1 | Registration & login with JWT auth |
| 2 | Create / Edit / Delete courses (title, code, department, semester, academic year) |
| 3 | Define Bloom's Taxonomy learning objectives (Remember → Create) |
| 4 | Upload & manage course study materials |
| 5 | **AI Question Studio** – generate MCQs via Gemini API, review & save to bank |
| 6 | Configure assessments: duration, marks, attempt limit, start/end dates, draft/publish |
| 7 | 12-KPI live analytics dashboard with Radar & Bar charts |
| 8 | Cohort performance drill-down with student-level Bloom's breakdown |

### 🎓 Student Module
| # | Feature |
|---|---------|
| 1 | Registration & login |
| 2 | Browse course catalog & enroll |
| 3 | Classroom viewer: study materials, Bloom's objectives, published assessments |
| 4 | **Timed interactive assessment player** (auto-submit on expiry) |
| 5 | Instant score report with Bloom's Radar & Bar charts |
| 6 | **AI personalized remediation plan** (Gemini-powered) |
| 7 | Longitudinal cognitive mastery history |

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS 3, React Router 6, Chart.js |
| Backend | Python 3.11, Flask 3, Flask-SQLAlchemy, Flask-JWT-Extended |
| Database | PostgreSQL (Render) / SQLite (local dev) |
| AI | Google Gemini API (`gemini-1.5-flash`) + pedagogical fallback |
| Deployment | Render (single web service: Flask serves React build) |

---

## 🚀 Local Development Setup

### Prerequisites
- Python 3.11+
- Node.js 20+
- Git

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/bloom-analytics-portal.git
cd bloom-analytics-portal
```

### 2. Backend setup
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env        # then edit .env with your keys
python seed_data.py          # populate demo data
python app.py                # Flask runs on http://127.0.0.1:5000
```

### 3. Frontend setup (new terminal)
```bash
cd frontend
npm install
npm run dev                  # Vite dev server on http://localhost:3000
```

Open **http://localhost:3000** – the Vite proxy forwards all `/api/*` calls to Flask.

### Demo Accounts (pre-seeded)
| Role | Email | Password |
|------|-------|---------|
| Faculty | `faculty@demo.edu` | `Faculty@123` |
| Student | `student@demo.edu` | `Student@123` |

---

## ☁️ Deploy to Render (one-click)

### Option A – Blueprint (recommended)

1. Fork this repository to your GitHub account.
2. Go to [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**.
3. Connect your forked repo. Render reads `render.yaml` automatically.
4. Add your **GEMINI_API_KEY** in the Render environment variables panel.
5. Click **Apply** – Render will create the PostgreSQL database and web service.
6. First boot seeds the demo accounts automatically.

### Option B – Manual

1. **Create a PostgreSQL** database on Render (free plan) and copy the **Internal Connection String**.
2. **Create a Web Service** on Render:
   - **Runtime:** Python
   - **Build command:**
     ```
     cd frontend && npm install && npm run build && cd ../backend && pip install -r requirements.txt
     ```
   - **Start command:**
     ```
     cd backend && gunicorn "app:create_app()" --workers 2 --bind 0.0.0.0:$PORT --timeout 120
     ```
3. Set environment variables:
   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | Paste internal connection string |
   | `SECRET_KEY` | Generate random 64-char string |
   | `JWT_SECRET_KEY` | Generate random 64-char string |
   | `GEMINI_API_KEY` | Your key from [Google AI Studio](https://aistudio.google.com) |
   | `FLASK_ENV` | `production` |
4. **Deploy** – first boot auto-seeds demo accounts.

---

## 📂 Project Structure

```
bloom-analytics-portal/
├── backend/
│   ├── routes/           # auth, courses, objectives, materials, questions,
│   │   ...               #   assessments, attempts, analytics, recommendations
│   ├── services/
│   │   ├── ai_service.py        # Gemini API + fallback generator
│   │   └── bloom_analyzer.py    # 6-dimension Bloom's score calculator
│   ├── app.py            # Flask application factory
│   ├── config.py         # Config (env vars, DB URL, JWT)
│   ├── models.py         # 10 SQLAlchemy ORM models
│   ├── seed_data.py      # Demo data seeder
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/   # Sidebar, Navbar, BloomBadge, BloomRadarChart, BloomBarChart, Modal
│   │   ├── context/      # AuthContext (JWT + role helpers)
│   │   ├── pages/
│   │   │   ├── faculty/  # Dashboard, CourseManagement, LearningObjectives,
│   │   │   │             #   CourseMaterials, AIQuestionGenerator, QuestionBank,
│   │   │   │             #   AssessmentManager, FacultyAnalytics
│   │   │   └── student/  # Dashboard, BrowseCourses, StudentCourseView,
│   │   │                 #   AssessmentTaker, AssessmentResult, StudentAnalytics
│   │   ├── api.js        # Unified fetch client (JWT injection)
│   │   └── App.jsx       # React Router + protected routes
│   ├── tailwind.config.js
│   └── vite.config.js
├── render.yaml           # Render Blueprint (web service + PostgreSQL)
├── Procfile              # Heroku-compatible process definition
├── runtime.txt           # Python 3.11.9
└── .gitignore
```

---

## 🌿 Bloom's Taxonomy Levels

| Level | Cognitive Skill | Example Verb |
|-------|----------------|-------------|
| 1️⃣ Remember | Recall facts | Define, List, Recall |
| 2️⃣ Understand | Explain concepts | Explain, Summarize |
| 3️⃣ Apply | Use in new situations | Solve, Use, Apply |
| 4️⃣ Analyze | Break down & examine | Compare, Differentiate |
| 5️⃣ Evaluate | Make judgements | Critique, Justify |
| 6️⃣ Create | Produce original work | Design, Construct |

---

## 📄 License

MIT License – free for academic and personal use.

---

## 🙏 Acknowledgements

- [Google Gemini API](https://ai.google.dev/) for AI question generation
- [Bloom's Revised Taxonomy](https://www.bloomstaxonomy.net/) – Anderson & Krathwohl (2001)
- UI inspired by **Green Valley Academy** NextGenTemplates design system
