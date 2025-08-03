export interface User {
  id: string;
  username: string;
  userType: 'User' | 'Administrator';
}

export interface Folder {
  id: string;
  name: string;
  parentId?: string;
  icon?: string;
}

export interface Script {
  id: string;
  scriptId: string;
  shortDescription: string;
  folderId: string;
  testEnvironment: 'Online' | 'Batch' | 'Online & Batch';
  testType: 'Positive' | 'Negative';
  purpose: string;
  assumptions: string[];
  expectedResults: string;
  scriptDetails: string;
  screenshots: Screenshot[];
  createdAt: string;
  updatedAt: string;
}

export interface Screenshot {
  id: string;
  filename: string;
  description: string;
  path: string;
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
}

export interface ImportedScript extends Script {
  projectId: string;
  status: 'pending' | 'completed' | 'in-progress' | 'with-issues';
  remarks?: string;
  executionScreenshots: Screenshot[];
  issueIds: string[];
}

export interface Issue {
  id: string;
  issueNumber: number;
  projectId: string;
  scriptId: string;
  title: string;
  description: string;
  status: 'open' | 'fixed' | 'reopened';
  screenshots: Screenshot[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string, userType: string) => boolean;
  logout: () => void;
}