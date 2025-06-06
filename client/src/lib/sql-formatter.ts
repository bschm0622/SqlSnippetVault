import { format } from "sql-formatter";

declare global {
  interface Window {
    sqlFormatter: {
      format: (sql: string, options?: any) => string;
    };
  }
}

export function formatSQL(sql: string): string {
  try {
    return format(sql, {
      language: "postgresql", // More compatible with complex queries
      keywordCase: "upper",
      indentStyle: "standard",
      linesBetweenQueries: 2,
    });
  } catch (error) {
    console.error("Error formatting SQL:", error);
    throw error; // Throw the original error for better debugging
  }
}
