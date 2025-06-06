import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ImportSnippetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File) => void;
}

export function ImportSnippetsModal({ isOpen, onClose, onImport }: ImportSnippetsModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    const file = fileInputRef.current?.files?.[0];
    if (file) {
      onImport(file);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Import Snippets</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Select JSON file
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <div className="text-amber-500 text-sm mt-0.5">⚠️</div>
              <div>
                <p className="text-sm text-amber-800 font-medium">
                  Import will replace all existing snippets
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  Make sure to export your current snippets first if you want to keep them.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleFileSelect}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            disabled={!fileInputRef.current?.files?.[0]}
          >
            Import
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}