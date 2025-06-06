import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SQLSnippet } from "@/types/snippet";
import { 
  Database, 
  Search, 
  Plus, 
  Download, 
  Upload, 
  ChevronRight 
} from "lucide-react";

interface SnippetSidebarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredSnippets: SQLSnippet[];
  currentSnippet: SQLSnippet | null;
  onSnippetSelect: (snippet: SQLSnippet) => void;
  onCreateSnippet: () => void;
  onExportSnippets: () => void;
  onImportSnippets: () => void;
  formatDate: (date: Date) => string;
}

export function SnippetSidebar({
  searchQuery,
  setSearchQuery,
  filteredSnippets,
  currentSnippet,
  onSnippetSelect,
  onCreateSnippet,
  onExportSnippets,
  onImportSnippets,
  formatDate,
}: SnippetSidebarProps) {
  return (
    <div className="w-80 bg-slate-800 dark:bg-gray-900 text-white flex flex-col border-r border-slate-700 dark:border-gray-700">
      {/* Sidebar Header */}
      <div className="px-5 py-4 border-b border-slate-700 dark:border-gray-700">
        <Button
          onClick={onCreateSnippet}
          size="default"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white mb-4 py-2 transition-all duration-200 hover:shadow-md active:transform active:scale-[0.98]"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Snippet
        </Button>
        
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search snippets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-700 border-slate-600 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Snippet List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 space-y-2">
          {filteredSnippets.length === 0 ? (
            <div className="text-center py-12">
              <Database className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No SQL Snippets</h3>
              <p className="text-slate-400 text-sm">
                {searchQuery ? "No snippets match your search" : "Create your first snippet to get started"}
              </p>
            </div>
          ) : (
            filteredSnippets.map((snippet) => (
              <div
                key={snippet.id}
                onClick={() => onSnippetSelect(snippet)}
                className={`rounded-lg p-3.5 cursor-pointer transition-colors ${
                  currentSnippet?.id === snippet.id
                    ? "bg-blue-600"
                    : "bg-slate-700 hover:bg-slate-600"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white truncate">{snippet.name}</h3>
                    <p className={`text-xs mt-1.5 truncate ${
                      currentSnippet?.id === snippet.id ? "text-blue-100" : "text-slate-400"
                    }`}>
                      {snippet.sql.substring(0, 50)}...
                    </p>
                  </div>
                  <ChevronRight className={`h-4 w-4 ml-3 ${
                    currentSnippet?.id === snippet.id ? "text-blue-200" : "text-slate-400"
                  }`} />
                </div>
                <div className="text-xs text-slate-400 mt-2.5">
                  {formatDate(snippet.lastModified)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-slate-700 dark:border-gray-700">
        <div className="flex items-center justify-between gap-2">
          <Button
            onClick={onExportSnippets}
            variant="outline"
            size="sm"
            className="flex-1 bg-slate-700/50 hover:bg-slate-600 border-slate-600 text-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
          >
            <Download className="h-4 w-4 mr-1.5" />
            Export
          </Button>
          <Button
            onClick={onImportSnippets}
            variant="outline"
            size="sm"
            className="flex-1 bg-slate-700/50 hover:bg-slate-600 border-slate-600 text-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
          >
            <Upload className="h-4 w-4 mr-1.5" />
            Import
          </Button>
        </div>
      </div>
    </div>
  );
}