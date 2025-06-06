import { useEffect } from "react";

interface UseCodeMirrorProps {
  editorRef: React.RefObject<HTMLTextAreaElement>;
  codeMirrorRef: React.MutableRefObject<any>;
  isEditorReady: React.MutableRefObject<boolean>;
  onEditorChange: () => void;
}

export function useCodeMirror({
  editorRef,
  codeMirrorRef,
  isEditorReady,
  onEditorChange,
}: UseCodeMirrorProps) {
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
          placeholder: "-- Enter your SQL query here...",
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

        // Set up change handler without triggering initial save
        const onChange = (cm: any, change: any) => {
          // Only trigger if it's a real user change
          if (change.origin !== 'setValue') {
            onEditorChange();
          }
        };

        codeMirrorRef.current.on("change", onChange);
        isEditorReady.current = true;
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

    // Cleanup
    return () => {
      if (codeMirrorRef.current) {
        codeMirrorRef.current.off("change");
      }
    };
  }, [editorRef, codeMirrorRef, isEditorReady, onEditorChange]);
}