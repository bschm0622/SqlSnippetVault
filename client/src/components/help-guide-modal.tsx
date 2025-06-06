import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Database, Download, Keyboard } from "lucide-react";

interface HelpGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpGuideModal({ isOpen, onClose }: HelpGuideModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">SQL Snippet Manager Guide</DialogTitle>
        </DialogHeader>

        {/* Getting Started */}
        <div className="space-y-6">
          <section className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-500" />
              Getting Started
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              SQL Snippet Manager is a local-first tool for organizing and managing your SQL queries.
              All your snippets are stored securely in your browser's local storage, meaning your data stays on your machine.
            </p>
          </section>

          {/* Key Features */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold">Key Features</h3>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>Create and organize SQL snippets</li>
              <li>Auto-formatting of SQL queries</li>
              <li>Dark mode support</li>
              <li>Local storage for data privacy</li>
              <li>Import/Export functionality for backup and sharing</li>
              <li>Powerful search capabilities</li>
            </ul>
          </section>

          {/* Storage & Backup */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Download className="h-5 w-5 text-green-500" />
              Storage & Backup
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your snippets are automatically saved to your browser's local storage. To prevent data loss:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>Use the Export feature regularly to backup your snippets</li>
              <li>Import snippets that you previously exported</li>
              <li>Importing snippets will overwrite your existing snippets</li>
            </ul>
          </section>

          {/* Keyboard Shortcuts */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Keyboard className="h-5 w-5 text-purple-500" />
              Keyboard Shortcuts
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Press <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">Ctrl + /</kbd> or click the keyboard
              icon in the header to view all available shortcuts.
            </p>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
} 