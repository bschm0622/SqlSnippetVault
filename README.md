# SQL Snippet Manager

A lightweight, browser-based SQL snippet manager with local storage, syntax highlighting, and formatting capabilities. Built for developers who need a fast, private way to save, organize, and reuse SQL queries without relying on external services.

## ✨ Features

- **Local Storage**: All data stays in your browser - completely private and offline-capable
- **Auto-Save**: Changes are automatically saved after 1 second of inactivity
- **Syntax Highlighting**: Full SQL syntax highlighting powered by CodeMirror
- **SQL Formatting**: One-click BigQuery-style SQL formatting
- **Search & Filter**: Quickly find snippets by name or content
- **Keyboard Shortcuts**: Efficient workflow with comprehensive hotkeys
- **Import/Export**: Backup and restore snippets via JSON files
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **No Backend Required**: Pure frontend application with local persistence

## 🔧 Tech Stack

### Frontend Framework
- **React 18** with TypeScript
- **Vite** for build tooling and development server
- **Wouter** for client-side routing

### UI Components & Styling
- **Tailwind CSS** for styling
- **Shadcn/ui** component library (built on Radix UI primitives)
- **Lucide React** for icons
- **Framer Motion** for animations

### Code Editor & Formatting
- **CodeMirror 5** for SQL syntax highlighting and editing
- **SQL-formatter** library for code formatting (BigQuery dialect)

### State Management & Forms
- **TanStack Query (React Query)** for data management
- **React Hook Form** with Zod validation for forms
- **React localStorage** for data persistence

### Development Tools
- **TypeScript** for type safety
- **ESLint** and **Prettier** for code quality
- **PostCSS** with Tailwind CSS

## 🚀 Quick Start

### Prerequisites

- **Node.js** (version 18 or higher)
- **npm** or **yarn** package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sql-snippet-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5000` (or the port shown in your terminal)

### Production Build

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

## 📁 Project Structure

```
sql-snippet-manager/
├── client/                     # Frontend application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── ui/            # Shadcn/ui components
│   │   │   ├── snippet-sidebar.tsx    # Left sidebar with snippet list and search
│   │   │   ├── snippet-toolbar.tsx    # Top toolbar with name input and actions
│   │   │   ├── keyboard-shortcuts-modal.tsx  # Help modal for shortcuts
│   │   │   └── import-snippets-modal.tsx    # Import dialog
│   │   ├── hooks/             # Custom React hooks
│   │   │   ├── use-snippet-manager.ts   # Core snippet state management
│   │   │   ├── use-keyboard-shortcuts.ts # Keyboard shortcut handling
│   │   │   └── use-codemirror.ts        # CodeMirror setup
│   │   ├── lib/               # Utility libraries
│   │   │   ├── queryClient.ts # TanStack Query configuration
│   │   │   ├── sql-formatter.ts # SQL formatting utilities
│   │   │   ├── storage.ts     # LocalStorage management
│   │   │   └── utils.ts       # General utilities
│   │   ├── pages/             # Page components
│   │   │   └── sql-snippet-manager.tsx # Main orchestration component
│   │   ├── utils/             # Helper functions
│   │   │   └── snippet-utils.ts  # Snippet-related utilities
│   │   ├── types/             # TypeScript type definitions
│   │   │   └── snippet.ts     # Snippet-related types
│   │   ├── App.tsx           # Main app component with routing
│   │   ├── main.tsx          # Application entry point
│   │   └── index.css         # Global styles and Tailwind imports
│   └── index.html            # HTML template
├── server/                   # Express server (for development)
│   ├── index.ts             # Server entry point
│   ├── routes.ts            # API routes (minimal, mainly for template)
│   ├── storage.ts           # Server-side storage interface
│   └── vite.ts              # Vite integration
├── shared/                  # Shared types and schemas
│   └── schema.ts           # Database schemas (Drizzle ORM)
├── components.json         # Shadcn/ui configuration
├── package.json           # Dependencies and scripts
├── tailwind.config.ts     # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── vite.config.ts        # Vite configuration
```

## 📐 Code Organization & Architecture

The application follows a modular architecture with clear separation of concerns:

### Core Components
- **Snippet Manager**: Main orchestration component (152 lines) that coordinates the application's features
- **Sidebar**: Self-contained component for snippet list and search functionality
- **Toolbar**: Handles current snippet actions and name input
- **Modal Components**: Separate components for keyboard shortcuts and import functionality

### Custom Hooks
- **use-snippet-manager**: Core state management and CRUD operations for snippets
- **use-keyboard-shortcuts**: Centralized keyboard shortcut handling
- **use-codemirror**: CodeMirror editor initialization and configuration

### Utilities
- **snippet-utils**: Helper functions for date formatting, import/export, and editor statistics
- All utility functions are pure, making them easy to test and maintain

This modular architecture provides several benefits:
- 🎯 **Single Responsibility**: Each file has a focused purpose
- 🔄 **Reusability**: Components and hooks can be reused across the application
- 🧪 **Testability**: Business logic is isolated in custom hooks
- 📦 **Maintainability**: Easy to locate and modify specific functionality

## 🎮 Usage

### Creating Snippets
1. Click the **"New"** button in the sidebar header
2. Enter a descriptive name for your snippet
3. Write or paste your SQL code in the editor
4. Press **Ctrl+S** to save

### Managing Snippets
- **Edit**: Click any snippet in the sidebar to load it
- **Search**: Use the search bar to filter snippets by name or content
- **Delete**: Click the trash icon or press **Ctrl+D**
- **Copy**: Click the copy icon or press **Ctrl+C** when in the editor

### Formatting SQL
- Click the **"Format"** button or press **Ctrl+Shift+F**
- Uses BigQuery SQL formatting standards
- Handles complex queries with proper indentation and keyword capitalization

### Backup & Restore
- **Export**: Click "Export" to download all snippets as JSON
- **Import**: Click "Import" to restore snippets from a JSON file
- Import replaces all existing snippets (export first to backup)

## ⌨️ Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Save snippet | `Ctrl + S` |
| Format SQL | `Ctrl + Shift + F` |
| Copy snippet | `Ctrl + C` |
| Create new snippet | `Ctrl + N` |
| Delete snippet | `Ctrl + D` |
| Show shortcuts | `Ctrl + /` |
| Close modals | `Escape` |

## 🏗️ Key Implementation Details

### Local Storage Architecture
- All snippets stored in browser's `localStorage` under the key `"sql-snippets"`
- Automatic serialization/deserialization of Date objects
- Fallback handling for storage errors and quota limits

### Data Model
```typescript
interface SQLSnippet {
  id: string;
  name: string;
  sql: string;
  lastModified: Date;
  createdAt: Date;
}
```

### CodeMirror Integration
- Custom initialization with SQL mode and BigQuery dialect
- Keyboard shortcut integration at the editor level
- Change detection for unsaved state indicators

### Error Handling
- Graceful degradation when localStorage is unavailable
- JSON validation for import operations
- User-friendly error messages with toast notifications

## 🔒 Privacy & Security

- **No data transmission**: All data remains in your browser
- **No tracking**: No analytics or external service calls
- **Offline capable**: Works without internet connection after initial load
- **Local only**: Snippets never leave your device unless explicitly exported

## 🌟 Browser Compatibility

- **Chrome/Edge**: Full support (recommended)
- **Firefox**: Full support
- **Safari**: Full support
- **Mobile browsers**: Responsive design with touch support

## 🚫 Environment Variables

This project requires **no environment variables** for basic operation since it uses local storage exclusively.

For development customization:
- `VITE_APP_TITLE`: Custom app title (optional)
- `NODE_ENV`: Set to `development` or `production`

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Follow the existing code style and TypeScript patterns
5. Add tests for new functionality
6. Commit with descriptive messages: `git commit -m 'Add amazing feature'`
7. Push to your branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Code Style Guidelines
- Use TypeScript for all new code
- Follow the existing Prettier and ESLint configuration
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Maintain responsive design principles

### Testing
```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Build to verify everything works
npm run build
```

## 🐛 Known Issues & Limitations

- **Browser storage limits**: Limited by localStorage quota (typically 5-10MB)
- **No real-time sync**: Changes are local to each browser/device
- **No collaboration**: Single-user application by design
- **CodeMirror 5**: Using older version for stability (v6 upgrade planned)

## 🗺️ Roadmap

- [ ] Dark mode toggle
- [ ] Snippet categories/tags
- [ ] Advanced search with regex support
- [ ] Multiple SQL dialect support
- [ ] Snippet templates
- [ ] Keyboard shortcut customization
- [ ] Cloud backup integration (optional)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **CodeMirror** for the excellent code editor
- **Shadcn/ui** for the beautiful component library
- **SQL-formatter** for SQL beautification
- **Tailwind CSS** for the styling system
- **Lucide** for the icon set

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) page for existing solutions
2. Create a new issue with detailed reproduction steps
3. Include browser version and any console errors

---

**Built with ❤️ for developers who love clean, efficient SQL workflows.**