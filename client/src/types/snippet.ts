export interface SQLSnippet {
  id: string;
  name: string;
  sql: string;
  lastModified: Date;
  createdAt: Date;
}

export interface CreateSnippetData {
  name: string;
  sql: string;
}

export interface UpdateSnippetData {
  name?: string;
  sql?: string;
}
