
import { EventEmitter } from 'events';

// This is a NodeJS built-in, but works in the browser environment Next.js provides.
// We use this to globally emit and listen for specific, recoverable application errors,
// like Firestore permission errors, without coupling the UI components directly.

export const errorEmitter = new EventEmitter();
