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
    const initCodeMirror = async () => {
      if (editorRef.current && window.CodeMirror && !codeMirrorRef.current) {
        codeMirrorRef.current = window.CodeMirror.fromTextArea(editorRef.current, {
          mode: "text/x-sql",
          theme: document.documentElement.classList.contains('dark') ? "material-darker" : "default",
          lineNumbers: true,
          indentUnit: 2,
          tabSize: 2,
          lineWrapping: true,
          autoCloseBrackets: true,
          matchBrackets: true,
          placeholder: "Enter your SQL query here...",
          viewportMargin: Infinity,
          extraKeys: {
            "Ctrl-S": () => false,
            "Ctrl-Shift-F": () => false,
          },
        });

        // Make CodeMirror fill its container
        const wrapper = codeMirrorRef.current.getWrapperElement();
        wrapper.style.height = '100%';
        wrapper.style.position = 'absolute';
        wrapper.style.left = '0';
        wrapper.style.right = '0';
        wrapper.style.top = '0';
        wrapper.style.bottom = '0';
        
        // Refresh to ensure proper sizing
        setTimeout(() => codeMirrorRef.current.refresh(), 0);

        // Handle changes
        codeMirrorRef.current.on("change", onEditorChange);

        // Handle theme changes
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
              const isDark = document.documentElement.classList.contains('dark');
              codeMirrorRef.current.setOption('theme', isDark ? 'material-darker' : 'default');
            }
          });
        });

        observer.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ['class'],
        });

        isEditorReady.current = true;
      }
    };

    initCodeMirror();

    return () => {
      if (codeMirrorRef.current) {
        codeMirrorRef.current.toTextArea();
        codeMirrorRef.current = null;
        isEditorReady.current = false;
      }
    };
  }, [editorRef, codeMirrorRef, isEditorReady, onEditorChange]);
}