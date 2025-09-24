/// <reference types="node" />

// Explicitly declare Node.js globals to ensure they're available
declare global {
  var process: NodeJS.Process;
  var console: Console;
  var __dirname: string;
  var __filename: string;
  var require: NodeRequire;
  var module: NodeModule;
  var exports: any;
  var Buffer: BufferConstructor;
  var global: typeof globalThis;
  
  function setTimeout(callback: (...args: any[]) => void, ms: number, ...args: any[]): NodeJS.Timeout;
  function clearTimeout(timeoutId: NodeJS.Timeout): void;
  function setInterval(callback: (...args: any[]) => void, ms: number, ...args: any[]): NodeJS.Timer;
  function clearInterval(intervalId: NodeJS.Timer): void;
  function setImmediate(callback: (...args: any[]) => void, ...args: any[]): NodeJS.Immediate;
  function clearImmediate(immediateId: NodeJS.Immediate): void;
}

// Declare Node.js built-in modules
declare module 'path' {
  export function join(...paths: string[]): string;
  export function resolve(...pathSegments: string[]): string;
  export function dirname(path: string): string;
  export function basename(path: string, ext?: string): string;
  export function extname(path: string): string;
  export function normalize(path: string): string;
  export function relative(from: string, to: string): string;
  export function isAbsolute(path: string): boolean;
  export const sep: string;
  export const delimiter: string;
  export const posix: any;
  export const win32: any;
}

// Re-export to make this a module
export {};