import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { snippetStorage } from "@/lib/storage";
import { formatSQL } from "@/lib/sql-formatter";
import { SQLSnippet, CreateSnippetData } from "@/types/snippet";
import { cn, debounce, AUTO_SAVE_DELAY } from "@/lib/utils";
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
  Shield,
  Keyboard,
  Sun,
  Moon,
  X,
  Check,
  Loader2,
  AlertCircle
} from "lucide-react";
import { useTheme } from "next-themes";
import "@/styles/dark-mode.css";

declare global {
  interface Window {
    CodeMirror: any;
  }
}

export default function SQLSnippetManager() {
  const { theme, setTheme } = useTheme();
  const [snippets, setSnippets] = useState<SQLSnippet[]>([]);
  const [currentSnippet, setCurrentSnippet] = useState<SQLSnippet | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [snippetName, setSnippetName] = useState("");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isUnsaved, setIsUnsaved] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<"saved" | "saving" | null>(null);
  
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const codeMirrorRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();

  // Handlers wrapped with useCallback for stability and to prevent stale closures
  const handleSaveSnippet = useCallback(() => {
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
        setAutoSaveStatus("saved");
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
      setAutoSaveStatus("saved");
    }
  }, [currentSnippet, snippetName, toast]);

  const handleFormatSQL = useCallback(() => {
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
  }, [toast]);

  const handleCopySnippet = useCallback(async () => {
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
  }, [toast]);

  const selectSnippet = useCallback((snippet: SQLSnippet) => {
    setCurrentSnippet(snippet);
    setSnippetName(snippet.name);
    setIsUnsaved(false);
    
    if (codeMirrorRef.current) {
      codeMirrorRef.current.setValue(snippet.sql);
      setAutoSaveStatus("saved"); // Set to saved when a new snippet is selected
    }
  }, []);

  const handleCreateSnippet = useCallback(() => {
    const newSnippetData: CreateSnippetData = {
      name: "New Snippet",
      sql: "",
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
  }, [selectSnippet]);

  const handleDeleteSnippet = useCallback(() => {
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
  }, [currentSnippet, selectSnippet, toast]);

  // Load snippets on mount
  useEffect(() => {
    loadSnippets();
  }, []);

  const loadSnippets = useCallback(() => {
    const allSnippets = snippetStorage.getAllSnippets();
    setSnippets(allSnippets);
    
    if (allSnippets.length > 0 && !currentSnippet) {
      selectSnippet(allSnippets[0]);
    }
  }, [currentSnippet, selectSnippet]);

  // Auto-save logic inspired by useAutoSave.ts
  useEffect(() => {
    if (!codeMirrorRef.current) return;

    const debouncedSave = debounce(() => {
      if (isUnsaved && snippetName.trim() && currentSnippet) {
        setAutoSaveStatus("saving");
        handleSaveSnippet();
      }
    }, AUTO_SAVE_DELAY);

    const onChange = () => {
      setIsUnsaved(true);
      setAutoSaveStatus(null); // Reset status when changes are made
      debouncedSave();
    };

    codeMirrorRef.current.on("change", onChange);

    return () => {
      debouncedSave.cancel();
      if (codeMirrorRef.current) {
        codeMirrorRef.current.off("change", onChange);
      }
    };
  }, [isUnsaved, snippetName, currentSnippet, handleSaveSnippet]);

  // Initialize CodeMirror
  useEffect(() => {
    // Load the placeholder addon
    const loadPlaceholderAddon = async () => {
      // Load the JavaScript
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/addon/display/placeholder.min.js';
      script.async = true;
      document.head.appendChild(script);
      
      // Load the CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/addon/display/placeholder.min.css';
      document.head.appendChild(link);

      // Load dark theme
      const themeLink = document.createElement('link');
      themeLink.rel = 'stylesheet';
      themeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/theme/material-darker.min.css';
      document.head.appendChild(themeLink);
      
      return new Promise((resolve) => {
        script.onload = resolve;
      });
    };

    const initCodeMirror = async () => {
      if (editorRef.current && window.CodeMirror && !codeMirrorRef.current) {
        await loadPlaceholderAddon();
        
        codeMirrorRef.current = window.CodeMirror.fromTextArea(editorRef.current, {
          mode: "text/x-sql",
          theme: theme === 'dark' ? "material-darker" : "default",
          lineNumbers: true,
          indentUnit: 2,
          tabSize: 2,
          lineWrapping: true,
          autoCloseBrackets: true,
          matchBrackets: true,
          placeholder: "Enter your SQL query here...",
          viewportMargin: Infinity,
          extraKeys: {
            "Ctrl-S": (cm: any) => {
              handleSaveSnippet();
              return false;
            },
            "Ctrl-Shift-F": (cm: any) => {
              handleFormatSQL();
              return false;
            },
          },
        });

        // Make CodeMirror fill its container
        const wrapper = codeMirrorRef.current.getWrapperElement();
        wrapper.style.height = '100%';
        codeMirrorRef.current.refresh();
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
  }, [theme, handleSaveSnippet, handleFormatSQL]);

  // Update CodeMirror theme when dark mode changes
  useEffect(() => {
    if (codeMirrorRef.current) {
      if (theme === 'dark') {
        codeMirrorRef.current.setOption('theme', 'material-darker');
      } else {
        codeMirrorRef.current.setOption('theme', 'default');
      }
    }
  }, [theme]);

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

      // Handle Ctrl+C (Copy) when editor is focused
      if (event.ctrlKey && event.key === 'c' && event.target === codeMirrorRef.current?.getInputField()) {
        // Let default copy behavior work for selected text, but also copy full snippet if nothing selected
        setTimeout(() => {
          const selectedText = codeMirrorRef.current?.getSelection();
          if (!selectedText) {
            handleCopySnippet();
          }
        }, 0);
        return;
      }

      // Handle Ctrl+N (New snippet)
      if (event.ctrlKey && event.key === 'n') {
        event.preventDefault();
        handleCreateSnippet();
        return;
      }

      // Handle Ctrl+D (Delete snippet) - more reliable than Ctrl+Delete
      if (event.ctrlKey && event.key === 'd' && currentSnippet) {
        event.preventDefault();
        setShowDeleteConfirm(true);
        return;
      }

      // Handle Ctrl+/ (Show keyboard shortcuts) - won't interfere with typing
      if (event.ctrlKey && event.key === '/') {
        event.preventDefault();
        setShowKeyboardHelp(true);
        return;
      }

      // Handle Escape (Close modals)
      if (event.key === 'Escape') {
        if (showKeyboardHelp) {
          setShowKeyboardHelp(false);
        } else if (isImportModalOpen) {
          setIsImportModalOpen(false);
        }
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSaveSnippet, handleFormatSQL, handleCopySnippet, handleCreateSnippet, currentSnippet, showKeyboardHelp, isImportModalOpen]); // Include dependencies so handlers have current state

  // Update filtered snippets when search query changes
  const filteredSnippets = React.useMemo(() => {
    return snippetStorage.searchSnippets(searchQuery);
  }, [snippets, searchQuery]);

  const handleExportSnippets = useCallback(() => {
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
  }, [toast]);

  const handleImportSnippets = useCallback(() => {
    setIsImportModalOpen(true);
  }, []);

  const handleFileSelect = useCallback(() => {
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
  }, [toast]);

  const formatDate = useCallback((date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
  }, []);

  const getEditorStats = useCallback(() => {
    if (!codeMirrorRef.current) return { lines: 0, characters: 0 };
    
    const content = codeMirrorRef.current.getValue();
    return {
      lines: content.split('\n').length,
      characters: content.length,
    };
  }, []);

  const stats = getEditorStats();

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <div className="w-80 bg-slate-800 dark:bg-slate-900 text-white flex flex-col border-r border-slate-700">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-semibold text-white flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-400" />
              SQL Snippets
            </h1>
            <Button
              onClick={handleCreateSnippet}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md transition-colors"
            >
              <Plus className="h-4 w-4 mr-1" />
              New
            </Button>
          </div>
          
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search snippets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-700 dark:bg-slate-800 border-slate-600 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      : "bg-slate-700 dark:bg-slate-800 hover:bg-slate-600 dark:hover:bg-slate-700"
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
        <div className="p-4 border-t border-slate-700">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleExportSnippets}
              className="flex-1 bg-slate-700 dark:bg-slate-800 hover:bg-slate-600 dark:hover:bg-slate-700 border-slate-600 text-white font-medium py-2 px-3 rounded-lg transition-colors"
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button
              variant="outline"
              onClick={handleImportSnippets}
              className="flex-1 bg-slate-700 dark:bg-slate-800 hover:bg-slate-600 dark:hover:bg-slate-700 border-slate-600 text-white font-medium py-2 px-3 rounded-lg transition-colors"
            >
              <Upload className="h-4 w-4 mr-1" />
              Import
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-900">
        {/* Toolbar */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <Input
                type="text"
                placeholder="Enter snippet name..."
                value={snippetName}
                onChange={(e) => {
                  setSnippetName(e.target.value);
                  setIsUnsaved(true);
                }}
                className="max-w-xs text-sm font-medium border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:text-white"
              />
              <Button
                onClick={handleSaveSnippet}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 transition-colors"
                disabled={!snippetName.trim()}
              >
                <Save className="h-4 w-4 mr-1.5" />
                Save{isUnsaved && "*"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleFormatSQL}
                className="border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 py-2 transition-colors"
              >
                <Wand2 className="h-4 w-4 mr-1.5" />
                Format
              </Button>
            </div>
            
            <div className="flex items-center gap-4">
              {currentSnippet && (
                <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                  Last modified: {formatDate(currentSnippet.lastModified)}
                </span>
              )}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopySnippet}
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Copy to clipboard (Ctrl+C)"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowKeyboardHelp(true)}
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Keyboard shortcuts (Ctrl+/)"
                >
                  <Keyboard className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Toggle theme"
                >
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" /> {/* Separator */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                  title="Delete snippet (Ctrl+D)"
                  disabled={!currentSnippet}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 relative flex flex-col min-h-0">
          <textarea
            ref={editorRef}
            className="w-full h-full font-mono text-sm resize-none border-none outline-none p-4 dark:bg-slate-900 dark:text-white"
            defaultValue={currentSnippet?.sql || ""}
            style={{ fontFamily: 'JetBrains Mono, ui-monospace, SFMono-Regular, monospace' }}
          />
        </div>
        
        {/* Status Bar */}
        <div className="bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-4 py-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {isUnsaved && autoSaveStatus !== "saving" && (
                  <div className="flex items-center gap-1">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <span>Unsaved changes</span>
                  </div>
                )}
                {autoSaveStatus === "saving" && (
                  <div className="flex items-center gap-1">
                    <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                    <span>Saving...</span>
                  </div>
                )}
                {!isUnsaved && autoSaveStatus === "saved" && (
                  <div className="flex items-center gap-1">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>All changes saved</span>
                  </div>
                )}
              </div>
              <span>Lines: {codeMirrorRef.current?.lineCount() || 0}</span>
              <span>Characters: {codeMirrorRef.current?.getValue().length || 0}</span>
              <span>SQL</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500 dark:text-green-400" />
              <span className="text-green-600 dark:text-green-400 font-medium">
                All data stored locally in your browser
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent>
          {/* ... existing import modal content ... */}
        </DialogContent>
      </Dialog>

      <Dialog open={showKeyboardHelp} onOpenChange={setShowKeyboardHelp}>
        <DialogContent>
          {/* ... existing keyboard shortcuts content ... */}
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          {/* ... existing delete confirmation content ... */}
        </DialogContent>
      </Dialog>
    </div>
  );
}
