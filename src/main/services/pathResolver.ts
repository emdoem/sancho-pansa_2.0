import path from 'path';

/**
 * Centralized path resolution utility for multi-device sync.
 * All paths stored in the database are relative to the music root.
 * Absolute paths are resolved at runtime per-device.
 */
export class PathResolver {
  private musicRootPath: string;

  constructor(musicRootPath: string) {
    this.musicRootPath = musicRootPath;
  }

  /**
   * Convert an absolute file path to a relative path from the music root.
   * Throws if the file is outside the music root.
   */
  public toRelative(absolutePath: string): string {
    const relative = path.relative(this.musicRootPath, absolutePath);

    // If path.relative returns something starting with '..', the file is outside the root
    if (relative.startsWith('..')) {
      throw new Error(
        `File must be inside the music library root. ` +
          `File: ${absolutePath}, Root: ${this.musicRootPath}`
      );
    }

    // Normalize to forward slashes for cross-platform consistency in DB
    return this.normalizeSeparators(relative);
  }

  /**
   * Convert a relative path (from DB) to an absolute path for this device.
   */
  public toAbsolute(relativePath: string): string {
    // Handle paths that might already be absolute (legacy data or different device)
    if (path.isAbsolute(relativePath)) {
      return relativePath;
    }

    // Convert forward slashes back to platform-specific separators
    const platformPath = this.toPlatformSeparators(relativePath);
    return path.resolve(this.musicRootPath, platformPath);
  }

  /**
   * Normalize path separators to forward slashes for storage.
   * This ensures consistency across Windows and Unix-like systems.
   */
  public normalizeSeparators(filePath: string): string {
    return filePath.replace(/\\/g, '/');
  }

  /**
   * Convert forward slashes to platform-specific separators.
   */
  public toPlatformSeparators(filePath: string): string {
    if (path.sep === '/') {
      return filePath;
    }
    return filePath.replace(/\//g, path.sep);
  }

  /**
   * Check if a path is relative (not absolute).
   */
  public isRelative(filePath: string): boolean {
    return !path.isAbsolute(filePath);
  }

  /**
   * Get the music root path.
   */
  public getMusicRootPath(): string {
    return this.musicRootPath;
  }
}

/**
 * Singleton-like resolver that can be updated when config changes.
 */
let globalResolver: PathResolver | null = null;

export function setGlobalPathResolver(musicRootPath: string): void {
  globalResolver = new PathResolver(musicRootPath);
}

export function getGlobalPathResolver(): PathResolver {
  if (!globalResolver) {
    throw new Error(
      'PathResolver not initialized. Call setGlobalPathResolver first.'
    );
  }
  return globalResolver;
}

export function clearGlobalPathResolver(): void {
  globalResolver = null;
}
