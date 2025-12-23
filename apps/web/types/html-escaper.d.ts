/**
 * Type declarations for html-escaper
 *
 * The html-escaper package doesn't include TypeScript types
 * and @types/html-escaper doesn't exist on npm.
 */
declare module 'html-escaper' {
  /**
   * Escapes HTML special characters in a string
   * @param str - The string to escape
   * @returns The escaped string
   */
  export function escape(str: string): string

  /**
   * Unescapes HTML entities in a string
   * @param str - The string to unescape
   * @returns The unescaped string
   */
  export function unescape(str: string): string
}
