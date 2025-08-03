import { Folder, Script, Project, ImportedScript, Issue } from '@/types';

const STORAGE_KEYS = {
  FOLDERS: 'regression_folders',
  SCRIPTS: 'regression_scripts',
  PROJECTS: 'regression_projects',
  IMPORTED_SCRIPTS: 'regression_imported_scripts',
  ISSUES: 'regression_issues',
  COUNTERS: 'regression_counters'
};

export class StorageService {
  // Folders
  static getFolders(): Folder[] {
    const data = localStorage.getItem(STORAGE_KEYS.FOLDERS);
    return data ? JSON.parse(data) : [];
  }

  static saveFolders(folders: Folder[]): void {
    localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(folders));
  }

  static addFolder(folder: Folder): void {
    const folders = this.getFolders();
    folders.push(folder);
    this.saveFolders(folders);
  }

  static updateFolder(folderId: string, updates: Partial<Folder>): void {
    const folders = this.getFolders();
    const index = folders.findIndex(f => f.id === folderId);
    if (index !== -1) {
      folders[index] = { ...folders[index], ...updates };
      this.saveFolders(folders);
    }
  }

  static deleteFolder(folderId: string): void {
    const folders = this.getFolders();
    const filtered = folders.filter(f => f.id !== folderId && f.parentId !== folderId);
    this.saveFolders(filtered);
  }

  // Scripts
  static getScripts(): Script[] {
    const data = localStorage.getItem(STORAGE_KEYS.SCRIPTS);
    return data ? JSON.parse(data) : [];
  }

  static saveScripts(scripts: Script[]): void {
    localStorage.setItem(STORAGE_KEYS.SCRIPTS, JSON.stringify(scripts));
  }

  static addScript(script: Script): void {
    const scripts = this.getScripts();
    scripts.push(script);
    this.saveScripts(scripts);
  }

  static updateScript(scriptId: string, updates: Partial<Script>): void {
    const scripts = this.getScripts();
    const index = scripts.findIndex(s => s.id === scriptId);
    if (index !== -1) {
      scripts[index] = { ...scripts[index], ...updates };
      this.saveScripts(scripts);
    }
  }

  static deleteScript(scriptId: string): void {
    const scripts = this.getScripts();
    const filtered = scripts.filter(s => s.id !== scriptId);
    this.saveScripts(filtered);
  }

  // Projects
  static getProjects(): Project[] {
    const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    return data ? JSON.parse(data) : [];
  }

  static saveProjects(projects: Project[]): void {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }

  static addProject(project: Project): void {
    const projects = this.getProjects();
    projects.push(project);
    this.saveProjects(projects);
  }

  // Imported Scripts
  static getImportedScripts(): ImportedScript[] {
    const data = localStorage.getItem(STORAGE_KEYS.IMPORTED_SCRIPTS);
    return data ? JSON.parse(data) : [];
  }

  static saveImportedScripts(scripts: ImportedScript[]): void {
    localStorage.setItem(STORAGE_KEYS.IMPORTED_SCRIPTS, JSON.stringify(scripts));
  }

  static addImportedScript(script: ImportedScript): void {
    const scripts = this.getImportedScripts();
    scripts.push(script);
    this.saveImportedScripts(scripts);
  }

  static updateImportedScript(scriptId: string, updates: Partial<ImportedScript>): void {
    const scripts = this.getImportedScripts();
    const index = scripts.findIndex(s => s.id === scriptId);
    if (index !== -1) {
      scripts[index] = { ...scripts[index], ...updates };
      this.saveImportedScripts(scripts);
    }
  }

  // Issues
  static getIssues(): Issue[] {
    const data = localStorage.getItem(STORAGE_KEYS.ISSUES);
    return data ? JSON.parse(data) : [];
  }

  static saveIssues(issues: Issue[]): void {
    localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(issues));
  }

  static addIssue(issue: Issue): void {
    const issues = this.getIssues();
    issues.push(issue);
    this.saveIssues(issues);
  }

  static updateIssue(issueId: string, updates: Partial<Issue>): void {
    const issues = this.getIssues();
    const index = issues.findIndex(i => i.id === issueId);
    if (index !== -1) {
      issues[index] = { ...issues[index], ...updates };
      this.saveIssues(issues);
    }
  }

  // Counters for auto-incrementing IDs
  static getNextIssueNumber(projectId: string): number {
    const counters = this.getCounters();
    const currentCount = counters[`issue_${projectId}`] || 0;
    const nextNumber = currentCount + 1;
    counters[`issue_${projectId}`] = nextNumber;
    this.saveCounters(counters);
    return nextNumber;
  }

  private static getCounters(): Record<string, number> {
    const data = localStorage.getItem(STORAGE_KEYS.COUNTERS);
    return data ? JSON.parse(data) : {};
  }

  private static saveCounters(counters: Record<string, number>): void {
    localStorage.setItem(STORAGE_KEYS.COUNTERS, JSON.stringify(counters));
  }
}