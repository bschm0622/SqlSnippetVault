import { useEffect } from "react";

interface UseKeyboardShortcutsProps {
  onSave: () => void;
  onFormat: () => void;
  onCopy: () => void;
  onNew: () => void;
  onDelete: () => void;
  onShowHelp: () => void;
  onCloseModals: () => void;
  codeMirrorRef: React.RefObject<any>;
  currentSnippet: any;
  showKeyboardHelp: boolean;
  isImportModalOpen: boolean;
}

export function useKeyboardShortcuts({
  onSave,
  onFormat,
  onCopy,
  onNew,
  onDelete,
  onShowHelp,
  onCloseModals,
  codeMirrorRef,
  currentSnippet,
  showKeyboardHelp,
  isImportModalOpen,
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle Ctrl+S (Save)
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        onSave();
        return;
      }

      // Handle Ctrl+Shift+F (Format)
      if (event.ctrlKey && event.shiftKey && event.key === 'F') {
        event.preventDefault();
        onFormat();
        return;
      }

      // Handle Ctrl+C (Copy) when editor is focused
      if (event.ctrlKey && event.key === 'c' && event.target === codeMirrorRef.current?.getInputField()) {
        // Let default copy behavior work for selected text, but also copy full snippet if nothing selected
        setTimeout(() => {
          const selectedText = codeMirrorRef.current?.getSelection();
          if (!selectedText) {
            onCopy();
          }
        }, 0);
        return;
      }

      // Handle Ctrl+N (New snippet)
      if (event.ctrlKey && event.key === 'n') {
        event.preventDefault();
        onNew();
        return;
      }

      // Handle Ctrl+D (Delete snippet) - more reliable than Ctrl+Delete
      if (event.ctrlKey && event.key === 'd' && currentSnippet) {
        event.preventDefault();
        if (confirm(`Are you sure you want to delete "${currentSnippet.name}"?`)) {
          onDelete();
        }
        return;
      }

      // Handle Ctrl+/ (Show keyboard shortcuts) - won't interfere with typing
      if (event.ctrlKey && event.key === '/') {
        event.preventDefault();
        onShowHelp();
        return;
      }

      // Handle Escape (Close modals)
      if (event.key === 'Escape') {
        if (showKeyboardHelp || isImportModalOpen) {
          onCloseModals();
        }
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    onSave,
    onFormat,
    onCopy,
    onNew,
    onDelete,
    onShowHelp,
    onCloseModals,
    codeMirrorRef,
    currentSnippet,
    showKeyboardHelp,
    isImportModalOpen,
  ]);
}