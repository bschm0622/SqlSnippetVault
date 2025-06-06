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
    
    if (allSnippets.length > 0 && !currentSnippet) {
      selectSnippet(allSnippets[0]);
    }
  }, [currentSnippet]);

  const selectSnippet = useCallback((snippet: SQLSnippet) => {
    setCurrentSnippet(snippet);
    setSnippetName(snippet.name);
    setIsUnsaved(false);
    
    if (codeMirrorRef.current && isEditorReady.current) {
      codeMirrorRef.current.setValue(snippet.sql);
    }
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
      sql: "-- Enter your SQL query here...",
    };

    const newSnippet = snippetStorage.createSnippet(newSnippetData);
    setSnippets(snippetStorage.getAllSnippets());
    selectSnippet(newSnippet);
    
    // Focus on name input
    setTimeout(() => {
      const nameInput = document.querySelector('input[placeholder="Enter snippet name..."]') as HTMLInputElement;
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

  // Auto-save functionality
  useEffect(() => {
    if (!codeMirrorRef.current) return;

    const debouncedSave = debounce(() => {
      if (isUnsaved && snippetNameRef.current?.trim() && currentSnippetRef.current) {
        try {
          setAutoSaveStatus("saving");
          handleSaveSnippet();
        } catch (error) {
          console.error('Auto-save failed:', error);
          setAutoSaveStatus("error");
          toast({
            title: "Auto-save failed",
            description: "Your changes were not saved automatically. Please try saving manually.",
            variant: "destructive",
          });
        }
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
  }, [isUnsaved, handleSaveSnippet, toast]);

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
  };
}