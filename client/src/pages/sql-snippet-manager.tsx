import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSnippetManager } from "@/hooks/use-snippet-manager";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useCodeMirror } from "@/hooks/use-codemirror";
import { useAuth } from "@/contexts/AuthContext";
import { SnippetSidebar } from "@/components/snippet-sidebar";
import { SnippetToolbar } from "@/components/snippet-toolbar";
import { KeyboardShortcutsModal } from "@/components/keyboard-shortcuts-modal";
import { ImportSnippetsModal } from "@/components/import-snippets-modal";
import { HelpGuideModal } from "@/components/help-guide-modal";
import { GitHubLoginButton } from "@/components/auth/GitHubLoginButton";
import { formatDate, exportSnippets, importSnippets, getEditorStats } from "@/utils/snippet-utils";
import { Shield, Sun, Moon, Check, Loader2, AlertCircle, Clock, Database, Plus, Keyboard, BookOpen, ExternalLink, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import "../styles/codemirror.css";

declare global {
  interface Window {
    CodeMirror: any;
  }
}

export default function SQLSnippetManager() {
  const { user, loading, signOut } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [showHelpGuide, setShowHelpGuide] = useState(false);

  // Use the extracted snippet management hook
  const {
    snippets,
    currentSnippet,
    searchQuery,
    setSearchQuery,
    snippetName,
    setSnippetName,
    isUnsaved,
    setIsUnsaved,
    autoSaveStatus,
    filteredSnippets,
    codeMirrorRef,
    editorRef,
    isEditorReady,
    selectSnippet,
    handleSaveSnippet,
    handleCreateSnippet,
    handleDeleteSnippet,
    handleFormatSQL,
    handleCopySnippet,
    handleRevertChanges,
    loadSnippets,
  } = useSnippetManager();

  // Initialize CodeMirror
  useCodeMirror({
    editorRef,
    codeMirrorRef,
    isEditorReady,
    onEditorChange: () => setIsUnsaved(true),
  });

  // Handle modal state
  const handleCloseModals = () => {
    if (showKeyboardHelp) {
      setShowKeyboardHelp(false);
    } else if (isImportModalOpen) {
      setIsImportModalOpen(false);
    } else if (showHelpGuide) {
      setShowHelpGuide(false);
    }
  };

  // Setup keyboard shortcuts
  useKeyboardShortcuts({
    onSave: handleSaveSnippet,
    onFormat: handleFormatSQL,
    onCopy: handleCopySnippet,
    onNew: handleCreateSnippet,
    onDelete: handleDeleteSnippet,
    onShowHelp: () => setShowKeyboardHelp(true),
    onCloseModals: handleCloseModals,
    codeMirrorRef,
    currentSnippet,
    showKeyboardHelp,
    isImportModalOpen,
  });

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign out. Please try again.",
      });
    }
  };

  // Handle import/export
  const handleExportSnippets = () => {
    try {
      exportSnippets();
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

  const handleFileImport = async (file: File) => {
    try {
      const result = await importSnippets(file);
      
      if (result.success) {
        loadSnippets();
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
        description: "Failed to import snippets",
        variant: "destructive",
      });
    }
  };

  const stats = getEditorStats(codeMirrorRef);

  // If auth is loading, show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <h2 className="text-lg font-semibold mb-2">Loading...</h2>
          <p className="text-sm text-muted-foreground">Please wait while we set up your session.</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, show login screen
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-sm space-y-6 p-6">
          <div className="text-center space-y-2">
            <Database className="h-12 w-12 mx-auto text-primary" />
            <h1 className="text-2xl font-bold">SQL Snippet Manager</h1>
            <p className="text-sm text-muted-foreground">
              Sign in with GitHub to start managing your SQL snippets
            </p>
          </div>
          <GitHubLoginButton />
        </div>
      </div>
    );
  }

  // Main app render
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <SnippetSidebar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredSnippets={filteredSnippets}
        currentSnippet={currentSnippet}
        onSnippetSelect={selectSnippet}
        onCreateSnippet={handleCreateSnippet}
        onExportSnippets={handleExportSnippets}
        onImportSnippets={handleImportSnippets}
        formatDate={formatDate}
      />

      {/* Main Editor */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
        {/* Header with actions */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Database className="h-6 w-6 text-blue-500" />
            <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">SQL Snippet Manager</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center mr-4 gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              {user?.email || user?.user_metadata?.preferred_username || 'User'}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowHelpGuide(true)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              title="Help Guide"
            >
              <BookOpen className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowKeyboardHelp(true)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              title="Keyboard shortcuts (Ctrl+/)"
            >
              <Keyboard className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <SnippetToolbar
          snippetName={snippetName}
          setSnippetName={setSnippetName}
          onNameChange={() => setIsUnsaved(true)}
          isUnsaved={isUnsaved}
          onSave={handleSaveSnippet}
          onRevert={handleRevertChanges}
          onFormat={handleFormatSQL}
          onCopy={handleCopySnippet}
          onDelete={handleDeleteSnippet}
          onShowHelp={() => setShowKeyboardHelp(true)}
          currentSnippet={currentSnippet}
          formatDate={formatDate}
        />

        {/* Code Editor */}
        <div className="flex-1 relative">
          <textarea
            ref={editorRef}
            className="w-full h-full font-mono text-sm resize-none border-none outline-none px-6 py-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            style={{ fontFamily: 'JetBrains Mono, ui-monospace, SFMono-Regular, monospace' }}
            placeholder="Write your SQL query here... (Ctrl+Shift+F to format)"
            defaultValue=""
          />
        </div>
        
        {/* Status Bar */}
        <div className="bg-slate-50 dark:bg-gray-800 border-t border-slate-200 dark:border-gray-700 px-6 py-2.5">
          <div className="flex items-center justify-between text-xs">
            {/* Left: Essential Stats */}
            <div className="flex items-center gap-6 text-slate-600 dark:text-gray-400">
              <div className="flex items-center gap-4">
                <div className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium">
                  SQL
                </div>
                <span>{stats.lines} lines</span>
              </div>
              {currentSnippet && (
                <div className="flex items-center gap-2 text-slate-500 dark:text-gray-400">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Last saved {formatDate(currentSnippet.lastModified)}</span>
                </div>
              )}
            </div>

            {/* Right: Storage Info */}
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <Shield className="h-3.5 w-3.5" />
              <span className="font-medium">Local storage</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-6 py-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <span>Built by</span>
              <a
                href="https://www.beckyschmidt.me?ref=sql-snippet-manager"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                Becky Schmidt
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://tally.so/r/3ErW92"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 flex items-center gap-1"
              >
                Share feedback
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <ImportSnippetsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleFileImport}
      />

      <KeyboardShortcutsModal
        isOpen={showKeyboardHelp}
        onClose={() => setShowKeyboardHelp(false)}
      />

      <HelpGuideModal
        isOpen={showHelpGuide}
        onClose={() => setShowHelpGuide(false)}
      />
    </div>
  );
}