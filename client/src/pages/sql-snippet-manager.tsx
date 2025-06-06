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
  Shield,
  Keyboard,
  Sun,
  Moon,
  X
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
  
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const codeMirrorRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();

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
      // Wait for both CodeMirror and the placeholder addon to load
      if (editorRef.current && window.CodeMirror && !codeMirrorRef.current) {
        await loadPlaceholderAddon();
        
        codeMirrorRef.current = window.CodeMirror.fromTextArea(editorRef.current, {
          mode: "text/x-sql",
          theme: "default",
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
              // Prevent browser default save dialog
              return false;
            },
            "Ctrl-Shift-F": (cm: any) => {
              // Prevent browser default find dialog
              return false;
            },
          },
        });

        // Make CodeMirror fill its container
        const wrapper = codeMirrorRef.current.getWrapperElement();
        wrapper.style.height = '100%';
        codeMirrorRef.current.refresh();

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
  }, [snippetName, currentSnippet, showKeyboardHelp, isImportModalOpen]); // Include dependencies so handlers have current state

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

      {/* Main Editor */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-900">
        {/* Compact Toolbar */}
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

        {/* Code Editor */}
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
              <span>Lines: {stats.lines}</span>
              <span>Characters: {stats.characters}</span>
              <span>SQL</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500 dark:text-green-400" />
              <span className="text-green-600 dark:text-green-400 font-medium">
                All data stored locally in your browser. Nothing is uploaded or shared.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Import Modal */}
      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent className="max-w-md dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="dark:text-slate-100">Import Snippets</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Select JSON file
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="block w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-900/20 dark:file:text-blue-400 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/30"
              />
            </div>
            
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <div className="text-amber-500 dark:text-amber-400 text-sm mt-0.5">⚠️</div>
                <div>
                  <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
                    Import will replace all existing snippets
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
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
              className="flex-1 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleFileSelect}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-400 dark:disabled:bg-blue-900"
              disabled={!fileInputRef.current?.files?.[0]}
            >
              Import
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Keyboard Shortcuts Help Modal */}
      <Dialog open={showKeyboardHelp} onOpenChange={setShowKeyboardHelp}>
        <DialogContent className="max-w-lg dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 dark:text-slate-100">
              <Keyboard className="h-5 w-5" />
              Keyboard Shortcuts
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-sm text-slate-700 dark:text-slate-300">Save snippet</span>
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono dark:text-slate-300">Ctrl + S</kbd>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-sm text-slate-700 dark:text-slate-300">Format SQL</span>
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono dark:text-slate-300">Ctrl + Shift + F</kbd>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-sm text-slate-700 dark:text-slate-300">Copy snippet</span>
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono dark:text-slate-300">Ctrl + C</kbd>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-sm text-slate-700 dark:text-slate-300">New snippet</span>
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono dark:text-slate-300">Ctrl + N</kbd>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-sm text-slate-700 dark:text-slate-300">Delete snippet</span>
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono dark:text-slate-300">Ctrl + D</kbd>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-sm text-slate-700 dark:text-slate-300">Show shortcuts</span>
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono dark:text-slate-300">Ctrl + /</kbd>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-slate-700 dark:text-slate-300">Close modals</span>
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono dark:text-slate-300">Escape</kbd>
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <div className="text-blue-500 dark:text-blue-400 text-sm mt-0.5">💡</div>
                <div>
                  <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                    Pro tip
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                    Press <kbd className="px-1 py-0.5 bg-white dark:bg-slate-800 rounded text-xs font-mono dark:text-slate-300">Ctrl + /</kbd> anytime to see these shortcuts. 
                    Most shortcuts work from anywhere in the app.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-6">
            <Button
              onClick={() => setShowKeyboardHelp(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-500">
              <Trash2 className="h-5 w-5" />
              Delete Snippet
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Are you sure you want to delete <span className="font-medium text-slate-900 dark:text-slate-100">"{currentSnippet?.name}"</span>?
            </p>
            <p className="mt-2 text-sm text-red-600 dark:text-red-500">
              This action cannot be undone.
            </p>
          </div>
          
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              className="dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                handleDeleteSnippet();
                setShowDeleteConfirm(false);
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
