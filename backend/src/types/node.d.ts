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

// Re-export to make this a module
export {};