import { snippetStorage } from "@/lib/storage";

export function formatDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
}

export function exportSnippets(): void {
  const exportData = snippetStorage.exportSnippets();
  const blob = new Blob([exportData], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = `sql-snippets-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function importSnippets(file: File): Promise<{ success: boolean; message: string; count?: number }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const result = snippetStorage.importSnippets(content);
        resolve(result);
      } catch (error) {
        resolve({
          success: false,
          message: "Failed to read file",
        });
      }
    };
    reader.readAsText(file);
  });
}

export function getEditorStats(codeMirrorRef: React.RefObject<any>): { lines: number; characters: number } {
  if (!codeMirrorRef.current) return { lines: 0, characters: 0 };
  
  const content = codeMirrorRef.current.getValue();
  return {
    lines: content.split('\n').length,
    characters: content.length,
  };
}