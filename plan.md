# EdTech Platform Full Implementation Plan

## Objective
Build a fully working EdTech platform with:
- Authentication
- Course catalog and video streaming
- Admin and instructor management
- Razorpay payment integration
- Progress tracking and certificates
- Production-ready deployment setup

---

## Current Situation
- Frontend exists in `client/` (React + Vite), partially implemented.
- Two backend folders exist: `backend/` and `server/`.
- Chosen backend stack: **MongoDB-based backend in `backend/`**.
- Main issues: backend instability, missing API wiring, missing dependencies, auth/payment/progress incomplete.

---

## Phase 1: Backend Foundation (Priority: Critical)
### Goals
1. Use `backend/` as the primary backend.
2. Ensure server starts cleanly on one port.
3. Add complete folder structure and base models/controllers/routes.

### Tasks
- Confirm/standardize backend structure:
  - `models/`
  - `controllers/`
  - `routes/`
  - `middleware/`
  - `config/`
  - `uploads/`
- Configure environment variables in `backend/.env`:
  - `MONGODB_URI`
  - `JWT_SECRET`, `JWT_EXPIRE`
  - `PORT`
  - Cloudinary keys
  - Razorpay keys
  - `FRONTEND_URL`
- Ensure `backend/server.js`:
  - Connects to MongoDB
  - Loads middleware (CORS, JSON parsing)
  - Registers all routes
  - Handles 404 and errors

### Completion Check
- `npm start` in `backend/` runs without crash.
- Root health route returns success.
- MongoDB connection logs success.

---

## Phase 2: Authentication System
### Goals
Implement full user auth with JWT and role support.

### Tasks
- User model fields:
  - name, email, password hash, role (`student`, `instructor`, `admin`)
  - subscription/enrollment metadata
- Auth endpoints:
  - `POST /api/auth/signup`
  - `POST /api/auth/login`
  - `POST /api/auth/logout`
  - `GET /api/auth/me`
- Middleware:
  - JWT verification middleware
  - role authorization middleware
- Frontend wiring:
  - update auth service
  - protect routes
  - persist token/session state

### Completion Check
- Signup/login works end-to-end from frontend.
- Protected APIs reject invalid/absent token.

---

## Phase 3: Course and Lesson Management
### Goals
Allow instructors/admins to create courses and upload lessons/videos.

### Tasks
- Add models:
  - Course
  - Lesson
- Course APIs:
  - list/search/filter courses
  - get course details
  - create/update/delete course
  - enroll in course
- Video upload flow:
  - Multer upload
  - Cloudinary upload
  - Save video URL in lessons

### Completion Check
- Admin/instructor can create and publish courses.
- Students can browse and view course details.

---

## Phase 4: Payments (Razorpay)
### Goals
Enable course purchase workflow.

### Tasks
- Payment model and records
- Endpoints:
  - `POST /api/payments/create-order`
  - `POST /api/payments/verify-payment`
  - `GET /api/payments/my-purchases`
- Verify Razorpay signature server-side
- On payment success:
  - mark payment confirmed
  - enroll user in purchased course

### Completion Check
- Test payment succeeds in Razorpay test mode.
- Purchased course appears in user dashboard.

---

## Phase 5: Progress and Certificates
### Goals
Track lesson completion and issue certificates.

### Tasks
- Add models:
  - Progress
  - Certificate
- APIs:
  - mark lesson completed
  - get course progress
  - issue certificate on 100% completion
  - list certificates
- Frontend:
  - update video player to report progress
  - show progress bars and certificate status

### Completion Check
- Completing all lessons triggers certificate issuance.

---

## Phase 6: Admin Dashboard and Role Flows
### Goals
Provide management tools for platform operators.

### Tasks
- Admin pages for:
  - users list and role updates
  - courses moderation
  - payment overview
- Restrict admin endpoints to `admin` role only.
- Instructor-only capabilities for content creation.

### Completion Check
- Admin can manage users/courses.
- Non-admin users cannot access admin APIs.

---

## Phase 7: Frontend Integration and UX Stability
### Goals
Connect all pages to APIs with robust error/loading states.

### Tasks
- Standardize API client (`axios`) and auth headers
- Integrate pages:
  - Home, Login, Signup, Dashboard, Video, Subscription, AdminDashboard
- Improve state handling in context/hooks
- Add loading states, empty states, and user-friendly errors

### Completion Check
- Full user journey works in browser:
  - signup/login -> browse -> pay -> watch -> progress -> certificate

---

## Phase 8: Testing and Deployment Readiness
### Goals
Prepare for both local and production usage.

### Tasks
- Validate key user flows manually
- Add basic automated tests (API smoke tests)
- Security checks:
  - JWT validation
  - role checks
  - payment verification
- Create production env template (`.env.example`)
- Build frontend (`npm run build`) and verify backend deployment readiness

### Completion Check
- Frontend build passes.
- Backend deploys with env vars.
- Critical flows pass QA checklist.

---

## Suggested Execution Order (No Skips)
1. Phase 1 (backend foundation)
2. Phase 2 (auth)
3. Phase 3 (courses + lessons)
4. Phase 4 (payments)
5. Phase 5 (progress + certificates)
6. Phase 6 (admin/instructor control)
7. Phase 7 (frontend stabilization)
8. Phase 8 (testing + deployment)

---

## Immediate Next Actions
1. Start backend and resolve any startup errors.
2. Finalize auth endpoints and frontend auth wiring.
3. Implement course create/list/detail and basic lesson upload.
4. Integrate Razorpay test mode and verify purchases.
