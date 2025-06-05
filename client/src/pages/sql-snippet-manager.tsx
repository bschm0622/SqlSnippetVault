import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { snippetStorage } from "@/lib/storage";
import { formatSQL } from "@/lib/sql-formatter";
import { SQLSnippet, CreateSnippetData } from "@/types/snippet";
import { 
  Database, 
  Search, 
  Plus, 
  Download, 
  Upload, 
  Save, 
  Wand2, 
  Copy, 
  Trash2, 
  ChevronRight,
  Shield
} from "lucide-react";

declare global {
  interface Window {
    CodeMirror: any;
  }
}

export default function SQLSnippetManager() {
  const [snippets, setSnippets] = useState<SQLSnippet[]>([]);
  const [currentSnippet, setCurrentSnippet] = useState<SQLSnippet | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [snippetName, setSnippetName] = useState("");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isUnsaved, setIsUnsaved] = useState(false);
  
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const codeMirrorRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();

  // Initialize CodeMirror
  useEffect(() => {
    const initCodeMirror = () => {
      if (editorRef.current && window.CodeMirror && !codeMirrorRef.current) {
        codeMirrorRef.current = window.CodeMirror.fromTextArea(editorRef.current, {
          mode: "text/x-sql",
          theme: "default",
          lineNumbers: true,
          indentUnit: 2,
          tabSize: 2,
          lineWrapping: true,
          autoCloseBrackets: true,
          matchBrackets: true,
          extraKeys: {
            "Ctrl-S": (cm: any) => {
              // Prevent browser default save dialog
              return false;
            },
            "Ctrl-Shift-F": (cm: any) => {
              // Prevent browser default find dialog
              return false;
            },
          },
        });

        codeMirrorRef.current.on("change", () => {
          setIsUnsaved(true);
        });
      }
    };

    // Check if CodeMirror is already loaded
    if (window.CodeMirror) {
      initCodeMirror();
    } else {
      // Wait for CodeMirror to load
      const checkCodeMirror = setInterval(() => {
        if (window.CodeMirror) {
          clearInterval(checkCodeMirror);
          initCodeMirror();
        }
      }, 100);

      return () => clearInterval(checkCodeMirror);
    }
  }, []);

  // Handle keyboard shortcuts globally
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle Ctrl+S (Save)
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        handleSaveSnippet();
        return;
      }

      // Handle Ctrl+Shift+F (Format)
      if (event.ctrlKey && event.shiftKey && event.key === 'F') {
        event.preventDefault();
        handleFormatSQL();
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [snippetName, currentSnippet]); // Include dependencies so handlers have current state

  // Load snippets on mount
  useEffect(() => {
    loadSnippets();
  }, []);

  // Update filtered snippets when search query changes
  const filteredSnippets = React.useMemo(() => {
    return snippetStorage.searchSnippets(searchQuery);
  }, [snippets, searchQuery]);

  const loadSnippets = () => {
    const allSnippets = snippetStorage.getAllSnippets();
    setSnippets(allSnippets);
    
    if (allSnippets.length > 0 && !currentSnippet) {
      selectSnippet(allSnippets[0]);
    }
  };

  const selectSnippet = (snippet: SQLSnippet) => {
    setCurrentSnippet(snippet);
    setSnippetName(snippet.name);
    setIsUnsaved(false);
    
    if (codeMirrorRef.current) {
      codeMirrorRef.current.setValue(snippet.sql);
    }
  };

  const handleCreateSnippet = () => {
    const newSnippetData: CreateSnippetData = {
      name: "New Snippet",
      sql: "-- Enter your SQL query here...",
    };

    const newSnippet = snippetStorage.createSnippet(newSnippetData);
    setSnippets(snippetStorage.getAllSnippets());
    selectSnippet(newSnippet);
    
    // Focus on name input
    setTimeout(() => {
      const nameInput = document.querySelector('input[placeholder="Snippet name..."]') as HTMLInputElement;
      if (nameInput) {
        nameInput.focus();
        nameInput.select();
      }
    }, 100);
  };

  const handleSaveSnippet = () => {
    if (!snippetName.trim()) {
      toast({
        title: "Error",
        description: "Snippet name is required",
        variant: "destructive",
      });
      return;
    }

    const sql = codeMirrorRef.current?.getValue() || "";

    if (currentSnippet) {
      // Update existing snippet
      const updated = snippetStorage.updateSnippet(currentSnippet.id, {
        name: snippetName,
        sql: sql,
      });
      
      if (updated) {
        setCurrentSnippet(updated);
        setSnippets(snippetStorage.getAllSnippets());
        setIsUnsaved(false);
        
        toast({
          title: "Success",
          description: "Snippet saved successfully",
        });
      }
    } else {
      // Create new snippet
      const newSnippet = snippetStorage.createSnippet({
        name: snippetName,
        sql: sql,
      });
      
      setCurrentSnippet(newSnippet);
      setSnippets(snippetStorage.getAllSnippets());
      setIsUnsaved(false);
      
      toast({
        title: "Success",
        description: "Snippet created successfully",
      });
    }
  };

  const handleDeleteSnippet = () => {
    if (!currentSnippet) return;

    const success = snippetStorage.deleteSnippet(currentSnippet.id);
    if (success) {
      const remainingSnippets = snippetStorage.getAllSnippets();
      setSnippets(remainingSnippets);
      
      if (remainingSnippets.length > 0) {
        selectSnippet(remainingSnippets[0]);
      } else {
        setCurrentSnippet(null);
        setSnippetName("");
        if (codeMirrorRef.current) {
          codeMirrorRef.current.setValue("");
        }
      }
      
      toast({
        title: "Success",
        description: "Snippet deleted successfully",
      });
    }
  };

  const handleFormatSQL = () => {
    if (!codeMirrorRef.current) return;

    try {
      const sql = codeMirrorRef.current.getValue();
      const formatted = formatSQL(sql);
      codeMirrorRef.current.setValue(formatted);
      setIsUnsaved(true);
      
      toast({
        title: "Success",
        description: "SQL formatted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to format SQL",
        variant: "destructive",
      });
    }
  };

  const handleCopySnippet = async () => {
    if (!codeMirrorRef.current) return;

    try {
      const sql = codeMirrorRef.current.getValue();
      await navigator.clipboard.writeText(sql);
      
      toast({
        title: "Success",
        description: "Copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleExportSnippets = () => {
    try {
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
      
      toast({
        title: "Success",
        description: "Snippets exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export snippets",
        variant: "destructive",
      });
    }
  };

  const handleImportSnippets = () => {
    setIsImportModalOpen(true);
  };

  const handleFileSelect = () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const result = snippetStorage.importSnippets(content);
        
        if (result.success) {
          setSnippets(snippetStorage.getAllSnippets());
          setIsImportModalOpen(false);
          
          toast({
            title: "Success",
            description: `Successfully imported ${result.count} snippets`,
          });
        } else {
          toast({
            title: "Error",
            description: result.message,
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to read file",
          variant: "destructive",
        });
      }
    };
    
    reader.readAsText(file);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
  };

  const getEditorStats = () => {
    if (!codeMirrorRef.current) return { lines: 0, characters: 0 };
    
    const content = codeMirrorRef.current.getValue();
    return {
      lines: content.split('\n').length,
      characters: content.length,
    };
  };

  const stats = getEditorStats();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 bg-slate-800 text-white flex flex-col border-r border-slate-700">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Database className="h-6 w-6 text-blue-400" />
            SQL Snippets
          </h1>
          
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search snippets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-700 border-slate-600 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Snippet List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-2">
            {filteredSnippets.length === 0 ? (
              <div className="text-center py-12">
                <Database className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No SQL Snippets</h3>
                <p className="text-slate-400 text-sm">
                  {searchQuery ? "No snippets match your search" : "Create your first snippet to get started"}
                </p>
              </div>
            ) : (
              filteredSnippets.map((snippet) => (
                <div
                  key={snippet.id}
                  onClick={() => selectSnippet(snippet)}
                  className={`rounded-lg p-3 cursor-pointer transition-colors ${
                    currentSnippet?.id === snippet.id
                      ? "bg-blue-600"
                      : "bg-slate-700 hover:bg-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white truncate">{snippet.name}</h3>
                      <p className={`text-xs mt-1 truncate ${
                        currentSnippet?.id === snippet.id ? "text-blue-100" : "text-slate-400"
                      }`}>
                        {snippet.sql.substring(0, 50)}...
                      </p>
                    </div>
                    <ChevronRight className={`h-4 w-4 ${
                      currentSnippet?.id === snippet.id ? "text-blue-200" : "text-slate-400"
                    }`} />
                  </div>
                  <div className="text-xs text-slate-400 mt-2">
                    {formatDate(snippet.lastModified)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-700 space-y-3">
          <Button
            onClick={handleCreateSnippet}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Snippet
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleExportSnippets}
              className="flex-1 bg-slate-700 hover:bg-slate-600 border-slate-600 text-white font-medium py-2 px-3 rounded-lg transition-colors"
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button
              variant="outline"
              onClick={handleImportSnippets}
              className="flex-1 bg-slate-700 hover:bg-slate-600 border-slate-600 text-white font-medium py-2 px-3 rounded-lg transition-colors"
            >
              <Upload className="h-4 w-4 mr-1" />
              Import
            </Button>
          </div>
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Editor Header */}
        <div className="bg-white border-b border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <Input
                type="text"
                placeholder="Snippet name..."
                value={snippetName}
                onChange={(e) => {
                  setSnippetName(e.target.value);
                  setIsUnsaved(true);
                }}
                className="text-lg font-semibold bg-transparent border-none shadow-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-2 py-1 flex-1"
              />
              {currentSnippet && (
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded whitespace-nowrap">
                  Last modified: {formatDate(currentSnippet.lastModified)}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopySnippet}
                className="text-slate-500 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-100"
                title="Copy to clipboard"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteSnippet}
                className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50"
                title="Delete snippet"
                disabled={!currentSnippet}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-slate-50 border-b border-slate-200 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                onClick={handleSaveSnippet}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                disabled={!snippetName.trim()}
              >
                <Save className="h-4 w-4 mr-2" />
                Save
                {isUnsaved && <span className="ml-1">*</span>}
              </Button>
              <Button
                variant="outline"
                onClick={handleFormatSQL}
                className="bg-white border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                <Wand2 className="h-4 w-4 mr-2" />
                Format
              </Button>
            </div>
            
            <div className="text-xs text-slate-500 flex items-center gap-4">
              <span>Ctrl+S to save</span>
              <span>Ctrl+Shift+F to format</span>
            </div>
          </div>
        </div>

        {/* Code Editor */}
        <div className="flex-1 relative">
          <textarea
            ref={editorRef}
            className="w-full h-full font-mono text-sm resize-none border-none outline-none p-4"
            defaultValue={currentSnippet?.sql || "-- Enter your SQL query here..."}
            style={{ fontFamily: 'JetBrains Mono, ui-monospace, SFMono-Regular, monospace' }}
          />
        </div>
        
        {/* Status Bar */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span>Lines: {stats.lines}</span>
              <span>Characters: {stats.characters}</span>
              <span>SQL</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              <span className="text-green-600 font-medium">
                All data stored locally in your browser. Nothing is uploaded or shared.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Import Modal */}
      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Import Snippets</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select JSON file
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <div className="text-amber-500 text-sm mt-0.5">⚠️</div>
                <div>
                  <p className="text-sm text-amber-800 font-medium">
                    Import will replace all existing snippets
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    Make sure to export your current snippets first if you want to keep them.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsImportModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleFileSelect}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={!fileInputRef.current?.files?.[0]}
            >
              Import
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
