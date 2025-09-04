import { Request, Response } from "express";

// This is a placeholder for the Profile type.
// In a real application, this would be imported from a models file.
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

interface SearchResults {
    projects: Project[];
    skills: string[];
}

// This is a placeholder for a database.
let userProfile: Profile = {
  name: "Aman Sharma",
  email: "sharmaaman0202@gmail.com",
  education: "B.Tech in Data Science and Engineering ",
  skills: ["TypeScript", "Node.js", "Express", "Next.js", "Python", "React", "PostgreSQL", "Redis", "Docker", "AWS", "Java", "Spring Boot", "MySQL", "Git"],
  work: "Software Engineer at Tech Corp",
  projects: [
    { name: "Personal Portfolio", description: "A site to showcase my work.", technologies: ["React", "TypeScript", "CSS"] },
    { name: "E-commerce API", description: "A RESTful API for an online store.", technologies: ["Node.js", "Express", "TypeScript", "PostgreSQL"] },
    { name: "Task Management App", description: "A simple app to manage daily tasks.", technologies: ["React", "Redux", "Firebase"] },
    { name: "Blogging Platform", description: "A full-featured blogging platform.", technologies: ["Java", "Spring Boot", "MySQL"] },
    { name: "Weather App", description: "A simple weather application.", technologies: ["React", "axios"] },
    { name: "URL Shortener", description: "A service to shorten long URLs.", technologies: ["Node.js", "Express", "Redis"] }
  ],
  links: ["https://github.com/topics/home-page", "https://in.linkedin.com/"],
};

export const getProfile = (req: Request, res: Response) => {
  res.json(userProfile);
};

export const updateProfile = (req: Request, res: Response) => {
  const updatedProfile: Profile = req.body;
  // Basic validation
  if (
    !updatedProfile.name ||
    !updatedProfile.email ||
    !updatedProfile.education ||
    !updatedProfile.skills ||
    !updatedProfile.work ||
    !updatedProfile.projects ||
    !updatedProfile.links
  ) {
    return res.status(400).json({ message: "Incomplete profile data" });
  }
  userProfile = updatedProfile;
  res.json(userProfile);
};

export const getProjects = (req: Request<{}, {}, {}, { skill?: string }>, res: Response) => {
    const skill = req.query.skill;
  
    if (!skill) {
      return res.json(userProfile.projects);
    }
  
    const relevantProjects = userProfile.projects.filter(project =>
      project.technologies.map(t => t.toLowerCase()).includes(skill.toLowerCase())
    );
  
    if (relevantProjects.length === 0) {
      return res.status(404).json({ message: `No projects found with skill: ${skill}` });
    }
  
    res.json(relevantProjects);
  };

export const search = (req: Request<{}, {}, {}, { q?: string }>, res: Response) => {
    const query = req.query.q;

    if (!query) {
        return res.status(400).json({ message: "Search query 'q' is required" });
    }

    const lowerCaseQuery = query.toLowerCase();

    const foundSkills = userProfile.skills.filter(skill =>
        skill.toLowerCase().includes(lowerCaseQuery)
    );

    const foundProjects = userProfile.projects.filter(project =>
        project.name.toLowerCase().includes(lowerCaseQuery) ||
        project.description.toLowerCase().includes(lowerCaseQuery) ||
        project.technologies.some(tech => tech.toLowerCase().includes(lowerCaseQuery))
    );

    const results: SearchResults = {
        skills: foundSkills,
        projects: foundProjects,
    };

    if (results.skills.length === 0 && results.projects.length === 0) {
        return res.status(404).json({ message: `No results found for '${query}'` });
    }

    res.json(results);
};

export const healthCheck = (req: Request, res: Response) => {
    res.status(200).json({ status: "UP", message: "Server is healthy" });
};
