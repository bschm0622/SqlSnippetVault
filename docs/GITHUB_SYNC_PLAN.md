# SQL Snippet Manager - GitHub Sync Implementation Plan

## Overview
Implement GitHub synchronization using Gists as a backup/sync mechanism for SQL snippets. This provides cloud backup while maintaining the app's simplicity.

## Core Concept
- Use GitHub Gists as snippet storage
- Each snippet becomes a file in a single Gist
- Maintain local-first approach with sync capability
- Optional feature that doesn't break existing functionality

## Authentication

### GitHub OAuth Flow
1. Use GitHub OAuth for authentication
2. Store tokens securely in localStorage
3. Implement token refresh mechanism
4. Scope required: `gist` permission only

### Implementation Options

#### Option 1: GitHub OAuth Direct
```typescript
interface GitHubAuth {
  accessToken: string;
  tokenType: string;
  scope: string;
  expiresAt?: Date;
}
```

#### Option 2: GitHub App Installation
- Create a GitHub App
- Use installation tokens
- More complex but better security

## Sync Implementation

### Data Structure
```typescript
interface GistMetadata {
  gistId: string;
  lastSynced: Date;
  snippetMap: {
    [snippetId: string]: {
      filename: string;
      gistFileId: string;
      lastModified: Date;
    }
  }
}
```

### Sync Flow
1. **Initial Sync**
   - Create new secret Gist
   - Upload all snippets
   - Store Gist ID locally

2. **Incremental Sync**
   - Track local changes
   - Compare timestamps
   - Sync only modified snippets
   - Handle conflicts with user choice

3. **Pull Changes**
   - Fetch Gist content
   - Compare with local state
   - Merge changes intelligently

### Conflict Resolution
- Use "last write wins" by default
- Show diff viewer for conflicts
- Allow manual resolution
- Keep local backup before sync

## UI Integration

### Sync Button
- Add to main toolbar
- Show sync status
- Progress indicator
- Last synced timestamp

### Settings Panel
- GitHub connection status
- Sync frequency options
- Conflict resolution preferences
- Manual sync controls

### Error Handling
- Network issues
- Token expiration
- Rate limiting
- Merge conflicts

## Technical Details

### API Integration
```typescript
interface GitHubAPI {
  createGist(): Promise<string>;
  updateGist(id: string, files: GistFiles): Promise<void>;
  fetchGist(id: string): Promise<GistContent>;
  deleteGist(id: string): Promise<void>;
}
```

### Local Storage Updates
```typescript
interface SyncStorage {
  githubAuth: GitHubAuth;
  gistMetadata: GistMetadata;
  syncPreferences: SyncPreferences;
}
```

### Rate Limiting
- Implement exponential backoff
- Queue sync operations
- Handle GitHub API limits

## Security Considerations

### Token Storage
- Encrypt tokens in localStorage
- Clear on logout
- Refresh flow for expired tokens

### Data Privacy
- Use secret Gists only
- Sanitize sensitive data
- Allow selective sync

## Error Recovery

### Failure Scenarios
- Network timeout
- Token expiration
- Gist deletion
- API rate limits

### Recovery Steps
1. Retry with backoff
2. Recreate Gist if deleted
3. Reauthorize if token expired
4. Local backup before sync

## Implementation Phases

### Phase 1: Basic Sync
- GitHub OAuth implementation
- Basic Gist creation/update
- Manual sync button
- Simple conflict resolution

### Phase 2: Advanced Features
- Auto-sync capability
- Conflict resolution UI
- Diff viewer
- Selective sync

### Phase 3: Polish
- Error recovery
- Progress indicators
- Sync analytics
- User preferences

## Future Extensions

### Potential Features
- Multi-Gist organization
- Team sharing via Gists
- Sync history/versioning
- Branch-like features

### Integration Ideas
- VS Code extension sync
- GitHub Enterprise support
- Custom backup locations
- Collaborative features

## Notes
- Keep UI simple and intuitive
- Maintain offline-first capability
- Handle rate limits gracefully
- Consider enterprise requirements
- Test sync edge cases thoroughly 