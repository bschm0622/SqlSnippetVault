import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SQLSnippet } from "@/types/snippet";
import { 
  Save, 
  Wand2, 
  Copy, 
  Trash2, 
  Keyboard 
} from "lucide-react";

interface SnippetToolbarProps {
  snippetName: string;
  setSnippetName: (name: string) => void;
  onNameChange: () => void;
  isUnsaved: boolean;
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
  onSave,
  onFormat,
  onCopy,
  onDelete,
  onShowHelp,
  currentSnippet,
  formatDate,
}: SnippetToolbarProps) {
  return (
    <div className="bg-white border-b border-slate-200 px-4 py-3">
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
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 transition-colors"
            disabled={!snippetName.trim()}
          >
            <Save className="h-4 w-4 mr-1.5" />
            Save{isUnsaved && "*"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onFormat}
            className="border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-2 transition-colors"
          >
            <Wand2 className="h-4 w-4 mr-1.5" />
            Format
          </Button>
        </div>
        
        <div className="flex items-center gap-4">
          {currentSnippet && (
            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
              Last modified: {formatDate(currentSnippet.lastModified)}
            </span>
          )}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onShowHelp}
              className="text-slate-500 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-100"
              title="Keyboard shortcuts (Ctrl+/)"
            >
              <Keyboard className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCopy}
              className="text-slate-500 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-100"
              title="Copy to clipboard (Ctrl+C)"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50"
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