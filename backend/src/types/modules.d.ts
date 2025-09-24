// Node.js built-in modules type declarations

declare module 'path' {
  interface ParsedPath {
    root: string;
    dir: string;
    base: string;
    ext: string;
    name: string;
  }

  export function normalize(p: string): string;
  export function join(...paths: string[]): string;
  export function resolve(...pathSegments: string[]): string;
  export function isAbsolute(path: string): boolean;
  export function relative(from: string, to: string): string;
  export function dirname(p: string): string;
  export function basename(p: string, ext?: string): string;
  export function extname(p: string): string;
  export function parse(pathString: string): ParsedPath;
  export function format(pathObject: Partial<ParsedPath>): string;
  export const sep: '\\' | '/';
  export const delimiter: ';' | ':';
  export const posix: typeof import('path');
  export const win32: typeof import('path');
}

declare module 'fs' {
  export function readFileSync(path: string, options?: { encoding?: string }): string | Buffer;
  export function writeFileSync(path: string, data: string | Buffer): void;
  export function existsSync(path: string): boolean;
  export function mkdirSync(path: string, options?: { recursive?: boolean }): void;
}

declare module 'os' {
  export function platform(): string;
  export function arch(): string;
  export function homedir(): string;
  export function tmpdir(): string;
}

declare module 'crypto' {
  export function randomBytes(size: number): Buffer;
  export function createHash(algorithm: string): any;
}

declare module 'util' {
  export function promisify<T extends (...args: any[]) => any>(fn: T): (...args: Parameters<T>) => Promise<any>;
}