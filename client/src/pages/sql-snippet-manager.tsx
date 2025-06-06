import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSnippetManager } from "@/hooks/use-snippet-manager";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useCodeMirror } from "@/hooks/use-codemirror";
import { SnippetSidebar } from "@/components/snippet-sidebar";
import { SnippetToolbar } from "@/components/snippet-toolbar";
import { KeyboardShortcutsModal } from "@/components/keyboard-shortcuts-modal";
import { ImportSnippetsModal } from "@/components/import-snippets-modal";
import { formatDate, exportSnippets, importSnippets, getEditorStats } from "@/utils/snippet-utils";
import { Shield } from "lucide-react";

declare global {
  interface Window {
    CodeMirror: any;
  }
}

export default function SQLSnippetManager() {
  const { toast } = useToast();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

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
    loadSnippets,
  } = useSnippetManager();

  // Initialize CodeMirror
  useCodeMirror({
    editorRef,
    codeMirrorRef,
    isEditorReady,
    onEditorChange: () => setIsUnsaved(true),
  });

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

  // Handle modal state
  const handleCloseModals = () => {
    if (showKeyboardHelp) {
      setShowKeyboardHelp(false);
    } else if (isImportModalOpen) {
      setIsImportModalOpen(false);
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

  const stats = getEditorStats(codeMirrorRef);

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
      <div className="flex-1 flex flex-col bg-white">
        {/* Toolbar */}
        <SnippetToolbar
          snippetName={snippetName}
          setSnippetName={setSnippetName}
          onNameChange={() => setIsUnsaved(true)}
          isUnsaved={isUnsaved}
          onSave={handleSaveSnippet}
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
    </div>
  );
}