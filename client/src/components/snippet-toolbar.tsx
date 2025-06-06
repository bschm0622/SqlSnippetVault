import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SQLSnippet } from "@/types/snippet";
import { 
  Save, 
  Wand2, 
  Copy, 
  Trash2, 
  Keyboard,
  RotateCcw,
  Clock
} from "lucide-react";

interface SnippetToolbarProps {
  snippetName: string;
  setSnippetName: (name: string) => void;
  onNameChange: () => void;
  isUnsaved: boolean;
  onSave: () => void;
  onRevert: () => void;
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
  onRevert,
  onFormat,
  onCopy,
  onDelete,
  onShowHelp,
  currentSnippet,
  formatDate,
}: SnippetToolbarProps) {
  return (
    <div className="bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-gray-700 px-6 py-3">
      <div className="flex items-center gap-6">
        {/* Left Section: Primary Editing Controls */}
        <div className="flex items-center gap-3 flex-1">
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="Enter snippet name..."
              value={snippetName}
              onChange={(e) => {
                setSnippetName(e.target.value);
                onNameChange();
              }}
              className="w-full text-sm font-medium border-slate-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {/* Backup status indicator */}
            {isUnsaved && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-amber-500" />
              </div>
            )}
          </div>
          <Button
            onClick={onSave}
            size="sm"
            className="min-w-[90px] bg-blue-600 hover:bg-blue-700 text-white"
            disabled={!snippetName.trim()}
          >
            <Save className="h-4 w-4 mr-1.5" />
            {isUnsaved ? "Save*" : "Save"}
          </Button>
          {isUnsaved && (
            <Button
              onClick={onRevert}
              size="sm"
              variant="outline"
              className="border-slate-300 dark:border-gray-600 hover:bg-slate-50 dark:hover:bg-gray-800 text-slate-700 dark:text-gray-300"
            >
              <RotateCcw className="h-4 w-4 mr-1.5" />
              Revert
            </Button>
          )}
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onFormat}
            className="border-slate-300 dark:border-gray-600 hover:bg-slate-50 dark:hover:bg-gray-800 text-slate-700 dark:text-gray-300"
          >
            <Wand2 className="h-4 w-4 mr-1.5" />
            Format
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onCopy}
            className="border-slate-300 dark:border-gray-600 hover:bg-slate-50 dark:hover:bg-gray-800 text-slate-700 dark:text-gray-300"
          >
            <Copy className="h-4 w-4 mr-1.5" />
            Copy
          </Button>
          <div className="w-px h-6 bg-slate-200 dark:bg-gray-700 mx-1" />
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
            title="Delete snippet (Ctrl+D)"
            disabled={!currentSnippet}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}