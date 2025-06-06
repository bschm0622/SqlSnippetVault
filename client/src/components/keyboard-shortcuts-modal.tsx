import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Keyboard } from "lucide-react";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm text-slate-700">Save snippet</span>
              <kbd className="px-2 py-1 bg-slate-100 rounded text-xs font-mono">Ctrl + S</kbd>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm text-slate-700">Format SQL</span>
              <kbd className="px-2 py-1 bg-slate-100 rounded text-xs font-mono">Ctrl + Shift + F</kbd>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm text-slate-700">Copy snippet</span>
              <kbd className="px-2 py-1 bg-slate-100 rounded text-xs font-mono">Ctrl + C</kbd>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm text-slate-700">New snippet</span>
              <kbd className="px-2 py-1 bg-slate-100 rounded text-xs font-mono">Ctrl + N</kbd>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm text-slate-700">Delete snippet</span>
              <kbd className="px-2 py-1 bg-slate-100 rounded text-xs font-mono">Ctrl + D</kbd>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm text-slate-700">Show shortcuts</span>
              <kbd className="px-2 py-1 bg-slate-100 rounded text-xs font-mono">Ctrl + /</kbd>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-slate-700">Close modals</span>
              <kbd className="px-2 py-1 bg-slate-100 rounded text-xs font-mono">Escape</kbd>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <div className="text-blue-500 text-sm mt-0.5">💡</div>
              <div>
                <p className="text-sm text-blue-800 font-medium">
                  Pro tip
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Press <kbd className="px-1 py-0.5 bg-white rounded text-xs font-mono">Ctrl + /</kbd> anytime to see these shortcuts. 
                  Most shortcuts work from anywhere in the app.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end mt-6">
          <Button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}