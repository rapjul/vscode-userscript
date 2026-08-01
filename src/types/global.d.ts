/**
 * Global type declarations for NodeJS process environment extensions.
 */
declare namespace NodeJS {
  /**
   * Process environment variables augmented by Scriptmonkey.
   */
  interface ProcessEnv {
    /** Maximum depth of GMItem nested hierarchy calculated during extension activation */
    GM_ITEMS_DEPTH: string
  }
}
