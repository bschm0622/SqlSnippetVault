# SQL Snippet Manager - Organization & Tabs Implementation Plan

## Overview
Add folder organization and tab management to improve snippet organization and multi-tasking capabilities.

## Folder Structure

### Data Model
```typescript
interface SQLFolder {
  id: string;
  name: string;
  parentId: string | null; // null for root folders
  createdAt: Date;
  lastModified: Date;
}

interface SQLSnippet {
  // Existing fields...
  folderId: string | null; // null for root snippets
  path: string[]; // Cached path array for easy breadcrumb display
}

interface FolderTree {
  folders: { [id: string]: SQLFolder };
  snippets: { [id: string]: SQLSnippet };
  structure: {
    [folderId: string]: {
      folders: string[]; // folder IDs
      snippets: string[]; // snippet IDs
    };
  };
}
```

### Features
- Nested folder support (unlimited depth)
- Drag-and-drop organization
- Folder collapsing/expanding
- Path breadcrumbs
- Folder-specific actions:
  - Create
  - Rename
  - Delete (with content moving options)
  - Export/Import

### UI Components

#### Sidebar Enhancement
```typescript
interface SidebarItem {
  type: 'folder' | 'snippet';
  id: string;
  name: string;
  level: number;
  isExpanded?: boolean;
}
```

- Indentation for hierarchy
- Expand/collapse arrows
- Folder icons
- Drag handles
- Context menus

#### Breadcrumb Navigation
```typescript
interface Breadcrumb {
  id: string;
  name: string;
  type: 'folder' | 'root';
}
```

## Tab Management

### Data Model
```typescript
interface TabState {
  id: string;
  snippetId: string;
  name: string;
  isDirty: boolean;
  cursorPosition?: {
    line: number;
    ch: number;
  };
  scrollPosition?: number;
}

interface TabsState {
  tabs: TabState[];
  activeTabId: string | null;
  history: string[]; // For tab switching (Ctrl+Tab)
}
```

### Features

#### Tab Operations
- Open in new tab
- Close tab
- Close others
- Close all
- Close saved
- Reopen closed (history)
- Reorder tabs (drag-and-drop)

#### Tab Behavior
- Double-click to rename
- Right-click menu
- Unsaved changes indicator
- Tab overflow menu
- Keyboard shortcuts:
  - Ctrl+W: Close tab
  - Ctrl+Tab: Switch tab
  - Ctrl+Shift+Tab: Switch tab reverse
  - Ctrl+1-9: Switch to nth tab

### UI Components

#### Tab Bar
```typescript
interface TabProps {
  tab: TabState;
  isActive: boolean;
  onActivate: () => void;
  onClose: () => void;
  onRename: (newName: string) => void;
}
```

- Horizontal scrolling
- Overflow menu
- New tab button
- Close buttons
- Modified indicator
- Context menu

## Storage Implementation

### Local Storage Schema
```typescript
interface StorageSchema {
  folders: { [id: string]: SQLFolder };
  snippets: { [id: string]: SQLSnippet };
  folderTree: FolderTree;
  tabsState: TabsState;
  recentlyClosedTabs: TabState[];
}
```

### State Management
- Maintain folder tree structure
- Cache folder paths
- Track tab history
- Persist tab state
- Handle storage limits

## Drag and Drop

### Operations
- Move snippets between folders
- Move folders (with contents)
- Reorder within folders
- Reorder tabs
- Handle invalid drops

### Implementation
```typescript
interface DragItem {
  type: 'folder' | 'snippet' | 'tab';
  id: string;
  sourceId: string | null;
}

interface DropTarget {
  type: 'folder' | 'root' | 'tab-bar';
  id: string | null;
  position: 'before' | 'after' | 'inside';
}
```

## Search Enhancement

### Folder-Aware Search
- Search within current folder
- Search all folders
- Filter by folder
- Show folder path in results
- Remember search scope

### Quick Navigation
- Folder shortcuts
- Recent folders
- Favorite folders
- Path-based navigation

## Implementation Phases

### Phase 1: Basic Folders
- Basic folder CRUD
- Snippet organization
- Simple drag-and-drop
- Update storage layer

### Phase 2: Tab Management
- Basic tab operations
- Tab state persistence
- Keyboard shortcuts
- Modified indicators

### Phase 3: Advanced Features
- Enhanced drag-and-drop
- Folder search integration
- Tab history
- Context menus

### Phase 4: Polish
- Animations
- Performance optimization
- Edge case handling
- UX improvements

## Migration

### Data Migration
```typescript
interface MigrationStep {
  version: number;
  migrate: (data: any) => Promise<any>;
}
```

- Convert flat structure to folders
- Generate initial folder tree
- Preserve existing snippets
- Handle migration errors

## Future Considerations

### Potential Extensions
- Folder templates
- Folder sharing
- Folder-specific settings
- Tab groups
- Split view
- Folder statistics

### Performance
- Lazy loading for large folders
- Virtual scrolling
- Tree structure optimization
- Tab state cleanup

## Notes
- Keep folder navigation intuitive
- Maintain keyboard accessibility
- Consider storage limitations
- Handle deep folder structures
- Preserve existing functionality 