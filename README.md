# 🎓 Skill-Nest: Campus Peer-to-Peer Learning & Mentorship Hub

Skill-Nest is a feature-rich, modern web application designed to foster collaborative learning, peer-to-peer tutoring, and mentorship within university campuses. The platform connects students (Juniors & Seniors), lecturers, and administrative coordinators through dedicated workspaces, a version-controlled resource hub, smart matching algorithms, and an interactive AI academic assistant.

---

## 🚀 Key Features & Role-Based Dashboards

Skill-Nest implements an elaborate role-based access control system (`junior`, `senior`, `both`, `STUDENT`, `LECTURER`, `ADMIN`) with tailored portals:

### 👤 1. Junior Student Portal (Mentee Workspace)
* **Smart Mentorship Matcher:** View, filter, and connect with optimal senior mentors sorted by a custom affinity matchmaking score.
* **Tutoring Bookings:** Schedule sessions with seniors or lecturers using an interactive calendar picker.
* **Gamification & Badges:** Track gained Experience Points (XP) and view earned academic badges (e.g., *Fast Learner*, *Contributor*).
* **Bookmarks & Quizzes:** Bookmark critical study guides, play academic quizzes, and review personal performance logs.

### 🎖️ 2. Senior Student Portal (Mentor Workspace)
* **Session hosting & "Kuppi" Groups:** Organize, host, and manage peer-learning groups ("Kuppi" sessions) for underclassmen.
* **Mentorship Management:** Accept or reject booking requests, coordinate schedules, and remove students from study groups.
* **Badge Award System:** Award custom achievements and badges to junior peers who demonstrate growth.
* **Resource Publishing:** Upload and share study slides, lecture summaries, and past papers.

### 👩‍🏫 3. Lecturer Portal (Academic Workspace)
* **Session Creation:** Schedule academic tutorial blocks, lab guides, and official lecture sessions.
* **Student Monitoring & Analytics:** Track active session attendees, manage pending join requests, and view completed sessions.
* **Feedback Loops:** Collect student reviews and feedback logs from finished sessions.

### 🔑 4. Administrative Control Center
* **User Management:** Deactivate, reactivate, or block accounts based on platform guidelines.
* **Resource Approval Queue:** Review, vet, and approve/reject materials uploaded to the shared Resource Hub before they go public.
* **Session Monitoring:** Audit platform sessions, feedback ratings, and user logs.

---

## 👥 Deep Dive: Senior-Junior Mentorship & Tactical Request System

The platform's flagship feature is the peer-to-peer mentorship pipeline, designed to structure organic university study groups ("Kuppi" sessions) and facilitate close academic collaboration between Junior and Senior students.

### 🔄 1. Tactical Join & Request Workflows
* **Discovery & Tactical Requests:** Junior students can search the global dashboard for active study sessions created by Seniors. They submit a **Tactical Join Request** that records defined academic outcomes (what they hope to learn/achieve).
* **Automated Admin & Email Alerts:** Triggers SMTP email alerts using nodemailer to notify the Senior of a pending tactical enrollment request (based on the user's customized communication preferences).
* **Two-Way Approval Flow:** Pending requests enter an approval queue. Seniors possess full control to either **Approve** (instantly granting group admission and awarding the Senior **+150 XP** as a gamification incentive) or **Reject** the student's request with clean status updates.
* **Enrollment Directory Controls:** Group hosts (Seniors) can access student directories, remove students, track performance data, and export rosters with metadata to spreadsheet-ready CSV files.

### 💬 2. Continuous 2-Way Threaded Messaging & Chat
* **Outcome-Focused Messaging:** Built a custom threaded message inbox where Juniors query mentors directly, allowing them to explicitly declare learning objectives and "Defined Outcomes" to pre-align the mentorship session.
* **Full CRUD Threads:** Both mentees and mentors can create, read, update, or delete initial queries and their replies.
* **Read-Status State Machines:** Automatically synchronizes and updates state flags (`readByJunior`, `readBySenior`) upon clicking notification headers to keep the chat interface in real-time sync.

### 🏆 3. Gamified Credential & Badge System
* **Dynamic Credentialing:** Seniors can dynamically award custom certificates/badges (e.g., *React Expert*, *DSA Master*) directly to student profiles inside their directories.
* **Full Credential Lifecycle:** Seniors can edit badge titles or delete awarded badges, automatically synchronizing changes across the user database.
* **Level Progression:** Juniors gain **+250 XP** for class enrollments and **+500 XP** for each earned badge, dynamically recalculating their level and ranking on the global leaderboard.

### 🛡️ 4. Security & Role-Aligned Authentication
* **Role-Claim Enforcement:** Implemented checks in `SignIn.jsx` verifying that the user's database role (`junior`, `senior`, `both`, `STUDENT`, `LECTURER`, `ADMIN`) strictly matches their selected dashboard workspace type (`student`, `lecturer`, `admin`) before completing authentication.
* **Role-Based Email Suggestions:** Persists and suggests up to 8 remembered emails separately grouped by account role type using `localStorage`.
* **Transactional Mail Recovery:** Integrated a secure SMTP mailing sequence (`ForgotPassword.jsx`) connecting to Node.js backend to dispatch cryptographically timed reset links.

---

## 🧠 Core Platforms & Systems

### 🔍 Smart Matchmaking Engine
The matching algorithm (`backend/src/utils/matchingService.js`) calculates affinity scores (0-100%) between mentees and mentors based on:
1. **Skill Overlap (40%):** Comparing a Junior's listed interests with a Senior's skills.
2. **Specialization Match (30%):** Checking matching degree paths, departments, or keyword occurrences in headers.
3. **Language Compatibility (15%):** Finding mutually understood spoken/written languages.
4. **Reputation Bonus (15%):** Promoting mentors with a positive feedback rating (>4 stars).

### 🤖 AI Academic Assistant (Gemini 2.5)
An interactive AI conversational interface (`ResourceAssistant.jsx`) powered by **Google's Gemini 2.5 Flash API** helps students clarify engineering, coding, or theory-based topics on the fly, offering dynamic guidance integrated directly into the resource hub.

### 📁 Shared Resource Hub & Version Control
A collaborative space to upload reference materials featuring:
* **File Versioning:** Upload and store multiple versions of the same resource, tracking revision histories.
* **Interactive Ratings:** Rate, review, and comment on files to establish quality tiers.
* **Cloud Binary Storage:** Scalable storage and retrieval of PDF guides and images via **Cloudinary**.

---

## 🛠️ Technology Stack & Installed Tools

### 💻 Frontend (Client Side)
* **Vite:** Next-generation frontend bundler providing ultra-fast Hot Module Replacement (HMR) and highly optimized roll-up production assets.
* **React 19:** View rendering library utilized for state containment, custom context providers, hooks, and clean components.
* **React Router DOM (v7):** Configures layout routing, nested client routes, parameters tracking, and route redirects.
* **TailwindCSS (v3):** Utility-first CSS styling framework providing fluid responsiveness, grid layouts, and clean flex models.
* **PostCSS & Autoprefixer:** Post-processors translating tailwind stylesheets and resolving browser-specific configurations.
* **Axios:** Promise-based HTTP client to request API routes, configure interceptors, and structure authorization headers.
* **Lucide React & React Icons:** Extensive icons packs providing clean vector icons.

### ⚙️ Backend (Server Side)
* **Node.js & Express (v5):** Server runtime hosting REST API paths, multipart processing, CORS middlewares, and route handlers.
* **MongoDB & Mongoose (v9):** Document-based database utilizing schemas, validators, query-builders, and reference relationships.
* **BcryptJS:** Hashing utility with custom salt rounds ensuring all user credentials are encrypted in the database.
* **JSON Web Token (JWT):** Cryptographically signed access tokens verifying client identity claims in API headers.
* **Nodemailer:** Automated SMTP module dispatching password recovery forms and transactional platform alerts.
* **Cloudinary & Multer Storage:** Middleware handling binary form uploads directly to a CDN repository for file storage.
* **Dotenv:** Environmental configurations parser to secure access credentials and external API tokens.

### 🛠️ Developer Tooling & Integrations
* **Google Gemini API (Gemini 2.5 Flash):** High-speed LLM endpoint used by the interactive academic search assistant.
* **Nodemon:** Backend utility monitoring server code modifications and hot-reloading active port listeners.
* **ESLint:** Code linter checking syntax patterns, imports sorting, and preventing runtime warning blocks.
* **Git & GitHub:** Version-controlled source code repository hosting workspace branch histories.

---

## 📄 Developer Resume / CV Highlights (Ready to Copy)

If you are updating your CV with this project, here are professional, result-oriented bullet points you can copy directly:

* **Full-Stack Mentorship Architecture:** Engineered a real-time Senior-Junior student matchmaking and mentorship booking pipeline using React, Node.js, Express, and MongoDB, facilitating peer tutoring groups (Kuppi sessions).
* **Tactical Request Workflow:** Built a role-restricted multi-state request system allowing students to submit study group join requests with defined outcome parameters; built backend hooks to process approvals, trigger SMTP alerts, and manage dynamic user directories.
* **Real-time Gamification Engine:** Architected a campus leaderboard and progression system utilizing dynamic XP gains (+500 XP on session creations, +150 XP on student approvals) and customizable mentor-awarded student badges (*React Expert*, *DSA Master*), driving active platform engagement.
* **Threaded Messaging & Chat System:** Developed a full CRUD continuous 2-way threaded inbox enabling rich communication between mentors and mentees with automatic read/unread notifications and message updates.
* **Role-Verification Security:** Implemented custom middleware and frontend guards that enforce role-claim alignment during sign-in, preventing cross-role dashboard spoofing while caching remembered emails per role inside local storage.

---

## 📂 Directory Structure

```text
Skill-Nest/
├── backend/
│   ├── src/
│   │   ├── config/          # Database connection, Cloudinary config
│   │   ├── controllers/     # Controller logic (auth, booking, resource, etc.)
│   │   ├── middleware/      # Auth validation, role checks
│   │   ├── models/          # Mongoose Schemas (User, Session, Quiz, Resource, etc.)
│   │   ├── routes/          # Express API route endpoints
│   │   ├── scripts/         # Passwords migration & data cleanup scripts
│   │   └── utils/           # Matchmaking logic, Token generator helpers
│   ├── server.js            # Entry point for backend
│   └── package.json
├── frontend/
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── assets/          # Icons, logos, component styling stylesheets
│   │   ├── components/      # Shared components (Navbar, ResourceAssistant, BookingCalendar)
│   │   ├── pages/           # Pages (Dashboards, ResourceHub, Feedback, Auth)
│   │   ├── utils/           # Client-side matchmaking algorithms
│   │   ├── App.jsx          # Route declarations
│   │   └── main.jsx         # Render mount
│   ├── tailwind.config.js   # Tailwind style setups
│   ├── vite.config.js       # Vite configuration
│   └── package.json
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites
* **Node.js** (v18+ recommended)
* **MongoDB** (Local instance or Atlas URI)
* **Cloudinary Account** (for file uploads)
* **Google Gemini API Key** (for the AI helper)

### 1. Set Up the Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5001
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/skill-nest
   JWT_SECRET=your_jwt_signing_key_here
   
   # Cloudinary Keys (For resources & avatar attachments)
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   
   # Nodemailer SMTP Keys (For password resets & alerts)
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_app_password
   
   # Google Gemini API
   GEMINI_API_KEY=your_gemini_api_key_here
   
   # Optional configurations
   # DNS_SERVERS=8.8.8.8,1.1.1.1   # Split-comma override to resolve local MongoDB connection failures
   # SKIP_DB=true                  # Run the backend server without connecting to MongoDB (Development fallback)
   ```
4. Start the backend in development mode (runs on port 5001):
   ```bash
   npm run dev
   ```

### 2. Set Up the Frontend
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server (runs on port 5173 by default):
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.

---

## 🔧 Database Scripts & Migrations

If updating legacy user records, you can execute the following scripts in the `backend/` directory:

* **Password Migration Script:** Encrypts legacy plain-text passwords into modern secure hashed passwords.
  ```bash
  npm run migrate-passwords
  ```
* **Session Fields Clean-up:** Purges invalid, empty, or outdated schema session properties.
  ```bash
  npm run cleanup-empty-session-fields
  ```

---

## 📝 License
This project is private and distributed under the **ISC License**. For inquiries or collaboration, please contact the repository owners.
