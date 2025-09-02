
export interface Link {
    github_url?: string;
    linkedin_url?: string;
    portfolio_url?: string;
  }
  
  export interface Education {
    id: number;
    school: string;
    degree: string;
    start_date: string;
    end_date: string;
  }
  
  export interface WorkExperience {
    id: number;
    company: string;
    position: string;
    description: string;
    start_date: string;
    end_date: string;
  }
  
  export interface Skill {
    id: number;
    name: string;
  }
  
  export interface Project {
    id: number;
    title: string;
    description: string;
    project_url?: string;
    github_url?: string;
    skills?: Skill[];
  }
  
  export interface Profile extends Link {
    id: number;
    name: string;
    email: string;
    projects: Project[];
    skills: Skill[];
    education: Education[];
    work_experience: WorkExperience[];
  }
