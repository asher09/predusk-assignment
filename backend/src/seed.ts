import { Pool } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const profileData = {
  name: "Aman Sharma",
  email: "sharmaaman0202@gmail.com",
  links: {
    github: "https://github.com/asher09",
    linkedin: "https://linkedin.com/in/amannsharma",
    portfolio: "https://portfolio.dev"
  },
  skills: ["TypeScript", "React", "Node.js", "PostgreSQL", "Docker", "AWS", ""],
  education: [
    {
      institution: "Manipal University",
      degree: "B.Tech in Data Science",
      year: "2022"
    }
  ],
  work: [
    {
      company: "Tech Solutions Inc.",
      position: "Software Engineer",
      duration: "2021 - Present"
    }
  ],
  projects: [
    {
      title: "Portfolio API",
      description: "The API that powers my personal site.",
      skills: ["TypeScript", "Node.js", "PostgreSQL"],
      links: {
        github: "https://github.com/your-username/portfolio-api"
      }
    }
  ]
};

const main = async () => {
  try {
    // Read and execute the schema file
    const schemaPath = path.join(__dirname, 'db-schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schemaSQL);
    console.log('Database schema checked/created successfully.');

    console.log('Starting to seed data...');
    // Clear existing data
    await pool.query('TRUNCATE TABLE profiles RESTART IDENTITY CASCADE;');
    console.log('Cleared existing data from profiles table.');

    // Insert new profile
    const insertQuery = `
      INSERT INTO profiles (name, email, links, skills, education, work, projects)
      VALUES ($1, $2, $3, $4, $5, $6, $7);
    `;
    const values = [
      profileData.name,
      profileData.email,
      JSON.stringify(profileData.links),
      profileData.skills,
      JSON.stringify(profileData.education),
      JSON.stringify(profileData.work),
      JSON.stringify(profileData.projects)
    ];

    await pool.query(insertQuery, values);
    console.log('Seed data inserted successfully.');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await pool.end();
    console.log('Database connection pool closed.');
  }
};

main();

