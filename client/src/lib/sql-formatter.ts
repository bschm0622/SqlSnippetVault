declare global {
  interface Window {
    sqlFormatter: {
      format: (sql: string, options?: any) => string;
    };
  }
}

export function formatSQL(sql: string): string {
  try {
    if (typeof window !== "undefined" && window.sqlFormatter) {
      return window.sqlFormatter.format(sql, {
        language: "bigquery",
        indent: "  ",
        uppercase: true,
        linesBetweenQueries: 2,
      });
    }
    return sql;
  } catch (error) {
    console.error("Error formatting SQL:", error);
    throw new Error("Failed to format SQL. Please check your syntax.");
  }
}
