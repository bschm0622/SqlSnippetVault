import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { snippetStorage } from "@/lib/storage";
import { formatSQL } from "@/lib/sql-formatter";
import { SQLSnippet, CreateSnippetData } from "@/types/snippet";

export function useSnippetManager() {
  const { toast } = useToast();
  const [snippets, setSnippets] = useState<SQLSnippet[]>([]);
  const [currentSnippet, setCurrentSnippet] = useState<SQLSnippet | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [snippetName, setSnippetName] = useState("");
  const [isUnsaved, setIsUnsaved] = useState(false);
  
  const codeMirrorRef = useRef<any>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const isEditorReady = useRef(false);

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
  }, [snippetName, currentSnippet, toast]);

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