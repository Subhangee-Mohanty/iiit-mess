IIIT Bhubaneswar Mess Management System (MERN) - b423065

Admin login: roll ADMIN, password Admin@123
Demo students are seeded when SEED_DEMO=true.

Run locally
1. Install Node 18+ and MongoDB, or use a MongoDB Atlas URI
2. cp .env.example .env and set MONGODB_URI
3. npm install --include=dev
4. npm run build
5. npm start  (opens on http://localhost:5000)

Deploy for a public link (free)
1. MongoDB Atlas: create a free M0 cluster, add a database user, allow network access 0.0.0.0/0, copy the connection string
2. Push this folder to a GitHub repository
3. Render: New + > Blueprint, select the repository (render.yaml is included)
4. Set the MONGODB_URI environment variable to the Atlas string, then deploy
5. Share the https://iiit-mess-b423065.onrender.com style URL shown on the service page
