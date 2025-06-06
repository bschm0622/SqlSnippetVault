import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { snippetStorage } from "@/lib/storage";
import { formatSQL } from "@/lib/sql-formatter";
import { SQLSnippet, CreateSnippetData } from "@/types/snippet";
import { debounce, AUTO_SAVE_DELAY } from "@/lib/utils";

export function useSnippetManager() {
  const { toast } = useToast();
  const [snippets, setSnippets] = useState<SQLSnippet[]>([]);
  const [currentSnippet, setCurrentSnippet] = useState<SQLSnippet | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [snippetName, setSnippetName] = useState("");
  const [isUnsaved, setIsUnsaved] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<"saved" | "saving" | "error" | null>(null);
  
  const codeMirrorRef = useRef<any>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const isEditorReady = useRef(false);
  const snippetNameRef = useRef<string>("");
  const currentSnippetRef = useRef<SQLSnippet | null>(null);

  // Update refs whenever values change
  useEffect(() => {
    snippetNameRef.current = snippetName;
  }, [snippetName]);

  useEffect(() => {
    currentSnippetRef.current = currentSnippet;
  }, [currentSnippet]);

  // Load snippets on mount
  useEffect(() => {
    loadSnippets();
  }, []);

  // Update filtered snippets when search query changes
  const filteredSnippets = snippetStorage.searchSnippets(searchQuery);

  const loadSnippets = useCallback(() => {
    const allSnippets = snippetStorage.getAllSnippets();
    setSnippets(allSnippets);
    
    // Only select first snippet if we have snippets
    if (allSnippets.length > 0 && !currentSnippet) {
      const firstSnippet = allSnippets[0];
      setCurrentSnippet(firstSnippet);
      setSnippetName(firstSnippet.name);
      setIsUnsaved(false);
      setAutoSaveStatus(null);
      
      // Wait for editor to be ready before setting content
      const setInitialContent = () => {
        if (codeMirrorRef.current && isEditorReady.current) {
          codeMirrorRef.current.setValue(firstSnippet.sql);
        } else {
          setTimeout(setInitialContent, 100);
        }
      };
      setInitialContent();
    }
  }, [currentSnippet]);

  const selectSnippet = useCallback((snippet: SQLSnippet) => {
    // First update the CodeMirror content without triggering the onChange handler
    if (codeMirrorRef.current && isEditorReady.current) {
      const prevHandler = codeMirrorRef.current._handlers.change[0]; // Store current handler
      codeMirrorRef.current.off("change", prevHandler); // Temporarily remove handler
      codeMirrorRef.current.setValue(snippet.sql || ""); // Set value without triggering change
      codeMirrorRef.current.on("change", prevHandler); // Restore handler
    }
    
    // Then update the state
    setCurrentSnippet(snippet);
    setSnippetName(snippet.name);
    setIsUnsaved(false);
    setAutoSaveStatus(null);
  }, []);

  const handleSaveSnippet = useCallback(() => {
    // Get the current values from refs for stability
    const currentName = snippetNameRef.current?.trim() || "";
    const activeSnippet = currentSnippetRef.current;
    
    if (!currentName) {
      toast({
        title: "Error",
        description: "Snippet name is required",
        variant: "destructive",
      });
      return;
    }

    const sql = codeMirrorRef.current?.getValue() || "";

    if (activeSnippet) {
      // Update existing snippet
      const updated = snippetStorage.updateSnippet(activeSnippet.id, {
        name: currentName,
        sql: sql,
      });
      
      if (updated) {
        setCurrentSnippet(updated);
        setSnippets(snippetStorage.getAllSnippets());
        setIsUnsaved(false);
        setAutoSaveStatus("saved");
        
        toast({
          title: "Success",
          description: "Snippet saved successfully",
        });
      }
    } else {
      // Create new snippet
      const newSnippet = snippetStorage.createSnippet({
        name: currentName,
        sql: sql,
      });
      
      setCurrentSnippet(newSnippet);
      setSnippets(snippetStorage.getAllSnippets());
      setIsUnsaved(false);
      setAutoSaveStatus("saved");
      
      toast({
        title: "Success",
        description: "Snippet created successfully",
      });
    }
  }, [toast]);

  const handleCreateSnippet = useCallback(() => {
    const newSnippetData: CreateSnippetData = {
      name: "New Snippet",
      sql: "",  // Empty string instead of comment
    };

    const newSnippet = snippetStorage.createSnippet(newSnippetData);
    setSnippets(snippetStorage.getAllSnippets());
    
    // Explicitly set states before selecting to prevent auto-save trigger
    setIsUnsaved(false);
    setAutoSaveStatus(null);
    setCurrentSnippet(newSnippet);
    setSnippetName(newSnippet.name);
    
    if (codeMirrorRef.current && isEditorReady.current) {
      // Temporarily remove change handler to prevent auto-save
      const prevHandler = codeMirrorRef.current._handlers?.change?.[0];
      if (prevHandler) {
        codeMirrorRef.current.off("change", prevHandler);
      }
      
      // Clear the editor
      codeMirrorRef.current.setValue("");
      codeMirrorRef.current.clearHistory();
      
      // Restore change handler
      if (prevHandler) {
        codeMirrorRef.current.on("change", prevHandler);
      }
    }
    
    // Focus on name input
    setTimeout(() => {
      const nameInput = document.querySelector('input[placeholder="Enter snippet name..."]') as HTMLInputElement;
      if (nameInput) {
        nameInput.focus();
        nameInput.select();
      }
    }, 100);
  }, []);

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

  const handleFormatSQL = useCallback(() => {
    if (!codeMirrorRef.current) return;

    try {
      const sql = codeMirrorRef.current.getValue();
      const formatted = formatSQL(sql);
      
      // Only trigger save if formatting actually changed the content
      if (formatted !== sql) {
        // Temporarily remove change handler to prevent double trigger
        const prevHandler = codeMirrorRef.current._handlers.change[0];
        codeMirrorRef.current.off("change", prevHandler);
        
        // Update the editor content
        codeMirrorRef.current.setValue(formatted);
        
        // Restore change handler
        codeMirrorRef.current.on("change", prevHandler);
        
        // Manually trigger save state
        setIsUnsaved(true);
        setAutoSaveStatus(null);
        handleSaveSnippet();
      }
      
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
  }, [toast, handleSaveSnippet]);

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

  // Replace auto-save with backup functionality
  useEffect(() => {
    if (!codeMirrorRef.current) return;

    const backupInterval = 30000; // 30 seconds
    let backupTimer: NodeJS.Timeout;

    const createBackup = () => {
      if (isUnsaved && snippetNameRef.current?.trim() && currentSnippetRef.current) {
        const currentValue = codeMirrorRef.current.getValue();
        snippetStorage.createBackup(
          currentSnippetRef.current.id,
          snippetNameRef.current,
          currentValue
        );
      }
    };

    let lastValue = codeMirrorRef.current.getValue();
    
    const onChange = () => {
      const currentValue = codeMirrorRef.current.getValue();
      const currentSnip = currentSnippetRef.current;
      
      // Only proceed if we have a current snippet and the value has actually changed
      if (currentSnip && currentValue !== lastValue) {
        lastValue = currentValue;
        
        // Don't mark as unsaved for default content
        const isDefaultContent = currentValue === "-- Enter your SQL query here...";
        
        if (!isDefaultContent && currentValue !== currentSnip.sql) {
          setIsUnsaved(true);
          
          // Clear existing timer and set new one
          if (backupTimer) clearTimeout(backupTimer);
          backupTimer = setTimeout(createBackup, backupInterval);
        }
      }
    };

    codeMirrorRef.current.on("change", onChange);

    // Create initial backup timer
    backupTimer = setTimeout(createBackup, backupInterval);

    return () => {
      if (backupTimer) clearTimeout(backupTimer);
      if (codeMirrorRef.current) {
        codeMirrorRef.current.off("change", onChange);
      }
    };
  }, [isUnsaved]);

  // Add revert functionality
  const handleRevertChanges = useCallback(() => {
    if (!currentSnippet) return;
    
    if (window.confirm("Are you sure you want to revert your changes? All unsaved changes will be lost.")) {
      // Revert to last saved version
      setSnippetName(currentSnippet.name);
      if (codeMirrorRef.current) {
        const prevHandler = codeMirrorRef.current._handlers.change[0];
        codeMirrorRef.current.off("change", prevHandler);
        codeMirrorRef.current.setValue(currentSnippet.sql);
        codeMirrorRef.current.on("change", prevHandler);
      }
      setIsUnsaved(false);
      snippetStorage.clearBackup(currentSnippet.id);
      
      toast({
        title: "Changes Reverted",
        description: "Your changes have been discarded.",
      });
    }
  }, [currentSnippet, toast]);

  // Check for unsaved changes on component mount and snippet switch
  useEffect(() => {
    if (currentSnippet) {
      const hasChanges = snippetStorage.hasUnsavedChanges(currentSnippet.id);
      if (hasChanges) {
        const backup = snippetStorage.getBackup(currentSnippet.id);
        if (backup) {
          setIsUnsaved(true);
          setSnippetName(backup.name);
          if (codeMirrorRef.current) {
            const prevHandler = codeMirrorRef.current._handlers.change[0];
            codeMirrorRef.current.off("change", prevHandler);
            codeMirrorRef.current.setValue(backup.sql);
            codeMirrorRef.current.on("change", prevHandler);
          }
        }
      }
    }
  }, [currentSnippet]);

  return {
    // State
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
    
    // Refs
    codeMirrorRef,
    editorRef,
    isEditorReady,
    
    // Actions
    selectSnippet,
    handleSaveSnippet,
    handleCreateSnippet,
    handleDeleteSnippet,
    handleFormatSQL,
    handleCopySnippet,
    loadSnippets,
    handleRevertChanges,
  };
}