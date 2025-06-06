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
    <div className="w-80 bg-slate-800 text-white flex flex-col border-r border-slate-700">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold text-white flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-400" />
            SQL Snippets
          </h1>
          <Button
            onClick={onCreateSnippet}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md transition-colors"
          >
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        </div>
        
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search snippets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-700 border-slate-600 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Snippet List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-2">
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
                className={`rounded-lg p-3 cursor-pointer transition-colors ${
                  currentSnippet?.id === snippet.id
                    ? "bg-blue-600"
                    : "bg-slate-700 hover:bg-slate-600"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white truncate">{snippet.name}</h3>
                    <p className={`text-xs mt-1 truncate ${
                      currentSnippet?.id === snippet.id ? "text-blue-100" : "text-slate-400"
                    }`}>
                      {snippet.sql.substring(0, 50)}...
                    </p>
                  </div>
                  <ChevronRight className={`h-4 w-4 ${
                    currentSnippet?.id === snippet.id ? "text-blue-200" : "text-slate-400"
                  }`} />
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  {formatDate(snippet.lastModified)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onExportSnippets}
            className="flex-1 bg-slate-700 hover:bg-slate-600 border-slate-600 text-white font-medium py-2 px-3 rounded-lg transition-colors"
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button
            variant="outline"
            onClick={onImportSnippets}
            className="flex-1 bg-slate-700 hover:bg-slate-600 border-slate-600 text-white font-medium py-2 px-3 rounded-lg transition-colors"
          >
            <Upload className="h-4 w-4 mr-1" />
            Import
          </Button>
        </div>
      </div>
    </div>
  );
}