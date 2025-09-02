import pool from './pool';

async function seedDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      DROP TABLE IF EXISTS project_skills;
      DROP TABLE IF EXISTS education;
      DROP TABLE IF EXISTS work_experience;
      DROP TABLE IF EXISTS skills;
      DROP TABLE IF EXISTS projects;
      DROP TABLE IF EXISTS profile;
    `);

    await client.query(`
      CREATE TABLE profile (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100),
        linkedin_url VARCHAR(255),
        github_url VARCHAR(255),
        portfolio_url VARCHAR(255)
      );
      CREATE TABLE projects (
        id SERIAL PRIMARY KEY,
        profile_id INTEGER REFERENCES profile(id) ON DELETE CASCADE,
        title VARCHAR(100),
        description TEXT,
        project_url VARCHAR(255),
        github_url VARCHAR(255)
      );
      CREATE TABLE skills (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL
      );
      CREATE TABLE project_skills (
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
        PRIMARY KEY (project_id, skill_id)
      );
      CREATE TABLE education (
        id SERIAL PRIMARY KEY,
        profile_id INTEGER REFERENCES profile(id) ON DELETE CASCADE,
        school VARCHAR(100),
        degree VARCHAR(100),
        start_date DATE,
        end_date DATE
      );
      CREATE TABLE work_experience (
        id SERIAL PRIMARY KEY,
        profile_id INTEGER REFERENCES profile(id) ON DELETE CASCADE,
        company VARCHAR(100),
        position VARCHAR(100),
        description TEXT,
        start_date DATE,
        end_date DATE
      );
    `);

    const profileResult = await client.query(
      `INSERT INTO profile (name, email, linkedin_url, github_url, portfolio_url)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [
        'Aman Sharma',
        'sharmaaman0202@gmail.com',
        'https://www.linkedin.com/in/amannsharma/',
        'https://github.com/asher09',
        'https://portfolio.com',
      ]
    );
    const profileId = profileResult.rows[0].id;


    // Add a larger set of skills
    const allSkills = [
      'React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Express',
      'Next.js', 'Python', 'Machine Learning', 'TensorFlow',
      'Django', 'Flask', 'MongoDB', 'GraphQL', 'Redux',
      'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP',
      'Sass', 'Tailwind', 'Jest', 'Cypress', 'HTML', 'CSS', 'JavaScript'
    ];
    const skillIds: { [key: string]: number } = {};
    for (const name of allSkills) {
      const skillResult = await client.query(
        'INSERT INTO skills (name) VALUES ($1) ON CONFLICT (name) DO NOTHING RETURNING id',
        [name]
      );
      if (skillResult.rows.length > 0) {
        skillIds[name] = skillResult.rows[0].id;
      } else {
        const existing = await client.query('SELECT id FROM skills WHERE name = $1', [name]);
        skillIds[name] = existing.rows[0].id;
      }
    }


    // Add more projects with various skills
    const projects = [
      // ...existing projects...
      {
        title: 'Me-API Playground',
        description: 'A RESTful API and frontend to showcase my profile.',
        project_url: 'http://weblink.com',
        github_url: 'http://github.com/repo',
        skills: ['React', 'Node.js', 'TypeScript']
      },
      {
        title: 'Next.js Portfolio',
        description: 'A personal portfolio built with Next.js and TypeScript.',
        project_url: 'http://portfolio-next.com',
        github_url: 'http://github.com/nextjs-portfolio',
        skills: ['Next.js', 'React', 'TypeScript', 'Tailwind']
      },
      {
        title: 'ML Image Classifier',
        description: 'A machine learning project for image classification using TensorFlow.',
        project_url: 'http://ml-image-classifier.com',
        github_url: 'http://github.com/ml-image-classifier',
        skills: ['Python', 'Machine Learning', 'TensorFlow']
      },
      {
        title: 'Blog Platform',
        description: 'A full-stack blog platform with authentication and markdown support.',
        project_url: 'http://blogplatform.com',
        github_url: 'http://github.com/blog-platform',
        skills: ['Node.js', 'Express', 'MongoDB', 'React', 'Redux']
      },
      {
        title: 'DevOps Dashboard',
        description: 'A dashboard for monitoring and managing cloud infrastructure.',
        project_url: 'http://devops-dashboard.com',
        github_url: 'http://github.com/devops-dashboard',
        skills: ['Docker', 'Kubernetes', 'AWS', 'React']
      },
      {
        title: 'E-commerce Store',
        description: 'A scalable e-commerce platform with payment integration.',
        project_url: 'http://ecommerce.com',
        github_url: 'http://github.com/ecommerce',
        skills: ['Node.js', 'Express', 'PostgreSQL', 'React', 'Redux', 'Jest']
      },
      {
        title: 'Social Network',
        description: 'A social networking site with real-time chat and notifications.',
        project_url: 'http://socialnetwork.com',
        github_url: 'http://github.com/socialnetwork',
        skills: ['Node.js', 'GraphQL', 'React', 'TypeScript', 'Cypress']
      },
      {
        title: 'Portfolio Website',
        description: 'A personal portfolio with animations and contact form.',
        project_url: 'http://portfolio.com',
        github_url: 'http://github.com/portfolio',
        skills: ['HTML', 'CSS', 'JavaScript', 'Sass']
      },
      {
        title: 'Weather App',
        description: 'A weather forecast app using public APIs.',
        project_url: 'http://weatherapp.com',
        github_url: 'http://github.com/weatherapp',
        skills: ['React', 'TypeScript', 'Tailwind']
      },
      {
        title: 'Finance Tracker',
        description: 'A personal finance and expense tracking tool.',
        project_url: 'http://financetracker.com',
        github_url: 'http://github.com/financetracker',
        skills: ['Node.js', 'Express', 'MongoDB', 'React', 'Jest']
      },
      // New projects for more variety
      {
        title: 'Chatbot Platform',
        description: 'A platform for building and deploying chatbots.',
        project_url: 'http://chatbotplatform.com',
        github_url: 'http://github.com/chatbotplatform',
        skills: ['Node.js', 'Python', 'Machine Learning', 'Express']
      },
      {
        title: 'Online Learning Portal',
        description: 'A portal for online courses and quizzes.',
        project_url: 'http://onlinelearning.com',
        github_url: 'http://github.com/onlinelearning',
        skills: ['React', 'TypeScript', 'GraphQL', 'PostgreSQL']
      },
      {
        title: 'Fitness Tracker',
        description: 'A mobile-friendly app for tracking workouts and nutrition.',
        project_url: 'http://fitnesstracker.com',
        github_url: 'http://github.com/fitnesstracker',
        skills: ['React', 'Redux', 'Node.js', 'MongoDB']
      },
      {
        title: 'Recipe Finder',
        description: 'An app to find and share recipes with nutritional info.',
        project_url: 'http://recipefinder.com',
        github_url: 'http://github.com/recipefinder',
        skills: ['React', 'TypeScript', 'Express', 'MongoDB']
      },
      {
        title: 'Travel Planner',
        description: 'A tool for planning trips and managing itineraries.',
        project_url: 'http://travelplanner.com',
        github_url: 'http://github.com/travelplanner',
        skills: ['Node.js', 'Express', 'PostgreSQL', 'React']
      },
      {
        title: 'Stock Market Analyzer',
        description: 'A data visualization tool for stock market trends.',
        project_url: 'http://stockanalyzer.com',
        github_url: 'http://github.com/stockanalyzer',
        skills: ['Python', 'Machine Learning', 'React', 'Django']
      },
      {
        title: 'Event Manager',
        description: 'A web app for managing and promoting events.',
        project_url: 'http://eventmanager.com',
        github_url: 'http://github.com/eventmanager',
        skills: ['Node.js', 'Express', 'MongoDB', 'React', 'Tailwind']
      },
      {
        title: 'Book Review Site',
        description: 'A community site for book reviews and recommendations.',
        project_url: 'http://bookreview.com',
        github_url: 'http://github.com/bookreview',
        skills: ['React', 'TypeScript', 'GraphQL', 'PostgreSQL', 'Jest']
      }
    ];

    for (const proj of projects) {
      const projectRes = await client.query(
        `INSERT INTO projects (profile_id, title, description, project_url, github_url)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [profileId, proj.title, proj.description, proj.project_url, proj.github_url]
      );
      const projectId = projectRes.rows[0].id;
      for (const skillName of proj.skills) {
        await client.query(
          'INSERT INTO project_skills (project_id, skill_id) VALUES ($1, $2)',
          [projectId, skillIds[skillName]]
        );
      }
    }

    await client.query(
      `INSERT INTO education (profile_id, school, degree, start_date, end_date)
       VALUES ($1, 'University of Example', 'B.S. in Computer Science', '2018-09-01', '2022-05-20')`,
      [profileId]
    );

    await client.query(
      `INSERT INTO work_experience (profile_id, company, position, description, start_date, end_date)
       VALUES ($1, 'Tech Company Inc.', 'Software Engineer', 'Developed and maintained web applications.', '2022-06-01', NULL)`,
      [profileId]
    );

    console.log('Database seeded successfully!');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    client.release();
  }
}

seedDatabase();
