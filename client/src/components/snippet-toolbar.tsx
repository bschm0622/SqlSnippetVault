import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SQLSnippet } from "@/types/snippet";
import { 
  Save, 
  Wand2, 
  Copy, 
  Trash2, 
  Keyboard,
  Check,
  Loader2,
  AlertCircle
} from "lucide-react";

interface SnippetToolbarProps {
  snippetName: string;
  setSnippetName: (name: string) => void;
  onNameChange: () => void;
  isUnsaved: boolean;
  autoSaveStatus?: "saved" | "saving" | "error" | null;
  onSave: () => void;
  onFormat: () => void;
  onCopy: () => void;
  onDelete: () => void;
  onShowHelp: () => void;
  currentSnippet: SQLSnippet | null;
  formatDate: (date: Date) => string;
}

export function SnippetToolbar({
  snippetName,
  setSnippetName,
  onNameChange,
  isUnsaved,
  autoSaveStatus,
  onSave,
  onFormat,
  onCopy,
  onDelete,
  onShowHelp,
  currentSnippet,
  formatDate,
}: SnippetToolbarProps) {
  return (
    <div className="bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <Input
            type="text"
            placeholder="Enter snippet name..."
            value={snippetName}
            onChange={(e) => {
              setSnippetName(e.target.value);
              onNameChange();
            }}
            className="max-w-xs text-sm font-medium border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <Button
            onClick={onSave}
            size="sm"
            className={`px-4 py-2 transition-all duration-200 ${
              autoSaveStatus === "saving" 
                ? "bg-blue-500 hover:bg-blue-600" 
                : autoSaveStatus === "saved"
                ? "bg-green-600 hover:bg-green-700"
                : autoSaveStatus === "error"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white`}
            disabled={!snippetName.trim() || autoSaveStatus === "saving"}
          >
            {autoSaveStatus === "saving" ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : autoSaveStatus === "saved" ? (
              <Check className="h-4 w-4 mr-1.5" />
            ) : autoSaveStatus === "error" ? (
              <AlertCircle className="h-4 w-4 mr-1.5" />
            ) : (
              <Save className="h-4 w-4 mr-1.5" />
            )}
            {autoSaveStatus === "saving" ? "Saving..." : 
             autoSaveStatus === "saved" ? "Saved" :
             autoSaveStatus === "error" ? "Failed" :
             `Save${isUnsaved ? "*" : ""}`}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onFormat}
            className="border-slate-300 dark:border-gray-600 hover:bg-slate-50 dark:hover:bg-gray-800 text-slate-700 dark:text-gray-300 px-3 py-2 transition-colors"
          >
            <Wand2 className="h-4 w-4 mr-1.5" />
            Format
          </Button>
        </div>
        
        <div className="flex items-center gap-4">
          {currentSnippet && (
            <span className="text-xs text-slate-500 dark:text-gray-400 bg-slate-100 dark:bg-gray-800 px-2 py-1 rounded">
              Last modified: {formatDate(currentSnippet.lastModified)}
            </span>
          )}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onShowHelp}
              className="text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800"
              title="Keyboard shortcuts (Ctrl+/)"
            >
              <Keyboard className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCopy}
              className="text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800"
              title="Copy to clipboard (Ctrl+C)"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
              title="Delete snippet (Ctrl+D)"
              disabled={!currentSnippet}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}