📄 PRODUCT REQUIREMENTS DOCUMENT (PRD)
🧠 Product Name

AI-Based Personalized Recommendation & Student Performance Analysis System

🎯 1. Product Overview

The system is an AI-powered platform designed to:

Recommend personalized learning resources
Generate structured learning roadmaps
Track student performance beyond academics
Provide insights to both students and faculty (HOD)

It bridges the gap between academic evaluation and real-world skill development using AI and data-driven insights.

🎯 2. Problem Statement

Traditional education systems:

Focus mainly on CGPA/marks
Ignore practical skills (coding, projects, consistency)
Lack personalized guidance

👉 Students don’t know:

What to learn next
How to improve
Whether they are industry-ready
🎯 3. Goals & Objectives
Primary Goals
Deliver personalized learning experience
Provide AI-driven roadmap generation
Enable holistic performance evaluation
Secondary Goals
Improve student engagement
Help faculty track real contributions
Encourage skill-based learning
👥 4. Target Users
🧑‍🎓 Students
Engineering students
Learners seeking structured guidance
🧑‍🏫 Faculty / HOD
Monitor student growth
Evaluate beyond marks
⚙️ 5. Core Features
🤖 5.1 AI Chatbot (Interest Detection)
Conversational interface
Identifies:
Interests
Skill level
Career goals

👉 Output:

Structured interest profile
🗺️ 5.2 Personalized Roadmap Generator
Generates 4-week learning plan
Includes:
Daily tasks
Projects
Resources
🎥 5.3 Resource Recommendation Engine
Fetches relevant content dynamically
Sources:
YouTube
Articles
📊 5.4 Student Dashboard
Features:
Profile (Name, Email, CGPA)
Resume upload & analysis
AI-detected interests
Roadmap view
Progress tracking
Performance score
🧑‍🏫 5.5 HOD Dashboard
Features:
Student list overview
Performance scores
Comparative analytics
Top performers ranking
🔗 5.6 External Platform Integration
GitHub → repos, commits
LinkedIn → engagement
LeetCode → problems solved
📈 5.7 Automated Evaluation System
Scoring Logic:
Coding activity → 30%
Projects → 30%
Problem solving → 20%
Consistency → 20%

👉 Output:

Score out of 100
Performance grade
📧 5.8 Notification System
Roadmap reminders
Weekly progress updates
Resource suggestions
🧠 6. User Flow
🧑‍🎓 Student Flow
Login (Name + Email)
Chat with AI chatbot
AI detects interests
Roadmap generated
Dashboard shows:
Tasks
Progress
Recommendations
Student updates progress
Score updates dynamically
🧑‍🏫 HOD Flow
Login
View student list
Analyze:
Scores
Activity
Identify:
Top performers
Weak students
🏗️ 7. System Architecture
Frontend (Next.js + ShadCN UI)
        ↓
Backend (Node.js / Express)
        ↓
Database (MongoDB)

AI Layer:
  - OpenAI API (chatbot + roadmap)

External APIs:
  - YouTube API
  - GitHub API

Automation:
  - n8n (emails, workflows)
🧰 8. Tech Stack
Frontend
Next.js
ShadCN UI
Framer Motion
Backend
Node.js + Express
Database
MongoDB
AI
OpenAI API
Integrations
YouTube API
GitHub API
Automation
n8n
📊 9. Success Metrics
User engagement (chatbot usage)
Roadmap completion rate
Improvement in performance score
Number of active users
⚡ 10. MVP Scope (Hackathon Version)

👉 MUST HAVE:

Login
AI chatbot
Roadmap generation
Student dashboard
Basic scoring system

👉 NICE TO HAVE:

GitHub integration
HOD dashboard
Email automation
⚠️ 11. Constraints
Limited hackathon time
API limitations
Data availability (LinkedIn, LeetCode)
🔮 12. Future Enhancements
AI resume builder
Job recommendations
Peer comparison system
Internship matching
🎤 13. One-Line Pitch (VERY IMPORTANT)

👉 Use this in demo:

“Our system uses AI to personalize learning and evaluate students based on real-world skills, not just marks.”