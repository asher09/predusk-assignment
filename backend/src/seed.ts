import pool from "./db";

interface Project {
  name: string;
  description: string;
  technologies: string[];
}

interface Profile {
  name: string;
  email: string;
  education: string;
  skills: string[];
  work: string;
  projects: Project[];
  links: string[];
}

const seedData: Profile = {
  name: "Aman Sharma",
  email: "sharmaaman0202@gmail.com",
  education: "B.Tech in Data Science and Engineering",
  skills: ["TypeScript", "Node.js", "Express", "Next.js", "Python", "React", "PostgreSQL", "Redis", "Docker", "AWS"],
  work: "Software Engineer at Tech Corp",
  projects: [
    { name: "Personal Portfolio", description: "A site to showcase my work.", technologies: ["React", "TypeScript", "CSS"] },
    { name: "E-commerce API", description: "A RESTful API for an online store.", technologies: ["Node.js", "Express", "TypeScript", "PostgreSQL"] },
    { name: "Task Management App", description: "A simple app to manage daily tasks.", technologies: ["React", "Redux", "Firebase"] }
  ],
  links: ["https://github.com/topics/home-page", "https://in.linkedin.com/"],
};

const seed = async () => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Clear existing data
    await client.query("DELETE FROM Project");
    await client.query("DELETE FROM Profile");
    console.log("Cleared existing data.");

    // Insert new profile
    const profileInsertQuery = `
      INSERT INTO Profile (name, email, education, skills, work, links)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id;
    `;
    const profileValues = [
      seedData.name,
      seedData.email,
      seedData.education,
      seedData.skills,
      seedData.work,
      seedData.links,
    ];
    const profileResult = await client.query(profileInsertQuery, profileValues);
    const profileId = profileResult.rows[0].id;
    console.log("Inserted new profile with ID:", profileId);

    // Insert projects
    for (const project of seedData.projects) {
      const projectInsertQuery = `
        INSERT INTO Project (profile_id, name, description, technologies)
        VALUES ($1, $2, $3, $4);
      `;
      const projectValues = [
        profileId,
        project.name,
        project.description,
        project.technologies,
      ];
      await client.query(projectInsertQuery, projectValues);
    }
    console.log(`Inserted ${seedData.projects.length} projects.`);

    await client.query("COMMIT");
    console.log("Seed data inserted successfully.");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error seeding data:", error);
  } finally {
    client.release();
    pool.end();
  }
};

seed();
