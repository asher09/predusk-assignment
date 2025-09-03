# PreDusk Assignment

## Architecture

- **Frontend**: React (Vite) app in `frontend/` folder. Calls backend API for profile, projects, skills, and search.
- **Backend**: Node.js + Express in `me-api-project/` folder. Handles REST API endpoints, connects to PostgreSQL.
- **Database**: PostgreSQL. Schema includes `profile`, `projects`, `skills`, and `project_skills` tables.

```
[Frontend (Vite/React)] <----> [Backend (Express/Node.js)] <----> [PostgreSQL]
```

## Local Setup

### Prerequisites
- Node.js (v18+ recommended)
- npm
- PostgreSQL (local or cloud, e.g., Aiven, Railway, Render)

### 1. Clone the repository
```sh
git clone https://github.com/asher09/predusk-assignment.git
cd predusk-assignment
```

### 2. Setup Backend
```sh
cd me-api-project
cp .env.example .env # Edit .env with your DB credentials
npm install
npm run db:setup   # Runs schema and seed scripts
npm run start      # Starts backend on http://localhost:3001
```

### 3. Setup Frontend
```sh
cd ../frontend
npm install
npm run dev        # Starts frontend on http://localhost:5173
```

## Database Schema

- **profile**: id, name, email, about
- **projects**: id, title, description
- **skills**: id, name
- **project_skills**: project_id, skill_id

See `me-api-project/src/db/schema.sql` for full schema.

## Sample API Usage

### Get Profile
```sh
curl http://localhost:3001/profile
```

### Add Project (with skills)
```sh
curl -X POST http://localhost:3001/projects \
	-H "Content-Type: application/json" \
	-d '{"title":"New Project","description":"Desc","skills":["React","Node.js"]}'
```

### Get Top Skills
```sh
curl http://localhost:3001/skills/top
```

### Filter Projects by Skill
```sh
curl http://localhost:3001/projects?skill=React
```

### Search
```sh
curl http://localhost:3001/search?q=react
```

## Postman Collection
- Import the included `postman_collection.json` (if present) or use the above curl commands.

## Known Limitations
- No authentication (all endpoints are public).
- No file uploads or images.
- Backend must be hosted separately from frontend (not serverless).
- No production-grade error handling or validation.
- Seed data is static; no migrations.
- Not optimized for large datasets.

---
For deployment, see comments in this README or ask for step-by-step cloud deployment instructions.
# predusk-assignment