import { SQLSnippet, CreateSnippetData, UpdateSnippetData } from "@/types/snippet";

const STORAGE_KEY = "sql-snippets";

export class SnippetStorage {
  private getSnippets(): SQLSnippet[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      
      const snippets = JSON.parse(stored);
      return snippets.map((snippet: any) => ({
        ...snippet,
        lastModified: new Date(snippet.lastModified),
        createdAt: new Date(snippet.createdAt),
      }));
    } catch (error) {
      console.error("Error loading snippets from localStorage:", error);
      return [];
    }
  }

  private saveSnippets(snippets: SQLSnippet[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snippets));
    } catch (error) {
      console.error("Error saving snippets to localStorage:", error);
      throw new Error("Failed to save snippets to local storage");
    }
  }

  getAllSnippets(): SQLSnippet[] {
    return this.getSnippets().sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
  }

  getSnippetById(id: string): SQLSnippet | undefined {
    return this.getSnippets().find(snippet => snippet.id === id);
  }

  createSnippet(data: CreateSnippetData): SQLSnippet {
    const snippets = this.getSnippets();
    const now = new Date();
    
    const newSnippet: SQLSnippet = {
      id: `snippet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: data.name,
      sql: data.sql,
      createdAt: now,
      lastModified: now,
    };

    snippets.push(newSnippet);
    this.saveSnippets(snippets);
    return newSnippet;
  }

  updateSnippet(id: string, data: UpdateSnippetData): SQLSnippet | null {
    const snippets = this.getSnippets();
    const index = snippets.findIndex(snippet => snippet.id === id);
    
    if (index === -1) return null;

    const updatedSnippet = {
      ...snippets[index],
      ...data,
      lastModified: new Date(),
    };

    snippets[index] = updatedSnippet;
    this.saveSnippets(snippets);
    return updatedSnippet;
  }

  deleteSnippet(id: string): boolean {
    const snippets = this.getSnippets();
    const filteredSnippets = snippets.filter(snippet => snippet.id !== id);
    
    if (filteredSnippets.length === snippets.length) return false;
    
    this.saveSnippets(filteredSnippets);
    return true;
  }

  exportSnippets(): string {
    const snippets = this.getSnippets();
    return JSON.stringify(snippets, null, 2);
  }

  importSnippets(jsonData: string): { success: boolean; message: string; count?: number } {
    try {
      const importedData = JSON.parse(jsonData);
      
      if (!Array.isArray(importedData)) {
        return { success: false, message: "Invalid format: Expected an array of snippets" };
      }

      const validSnippets: SQLSnippet[] = [];
      
      for (const item of importedData) {
        if (!item || typeof item !== "object") {
          return { success: false, message: "Invalid format: Each item must be an object" };
        }
        
        if (!item.name || typeof item.name !== "string") {
          return { success: false, message: "Invalid format: Each snippet must have a 'name' field" };
        }
        
        if (!item.sql || typeof item.sql !== "string") {
          return { success: false, message: "Invalid format: Each snippet must have a 'sql' field" };
        }

        const now = new Date();
        const snippet: SQLSnippet = {
          id: item.id || `snippet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: item.name,
          sql: item.sql,
          createdAt: item.createdAt ? new Date(item.createdAt) : now,
          lastModified: item.lastModified ? new Date(item.lastModified) : now,
        };

        validSnippets.push(snippet);
      }

      this.saveSnippets(validSnippets);
      return { success: true, message: "Snippets imported successfully", count: validSnippets.length };
    } catch (error) {
      return { success: false, message: "Invalid JSON format" };
    }
  }

  searchSnippets(query: string): SQLSnippet[] {
    if (!query.trim()) return this.getAllSnippets();
    
    const lowerQuery = query.toLowerCase();
    return this.getSnippets()
      .filter(snippet => 
        snippet.name.toLowerCase().includes(lowerQuery) || 
        snippet.sql.toLowerCase().includes(lowerQuery)
      )
      .sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
  }
}

export const snippetStorage = new SnippetStorage();
