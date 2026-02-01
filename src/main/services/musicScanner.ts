import { promises as fs } from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import * as mm from 'music-metadata';
import MusicLibraryDB from '../database/db';

interface ScanProgress {
  totalFiles: number;
  processedFiles: number;
  currentFile: string;
  errors: string[];
}

export class MusicScanner {
  private db: MusicLibraryDB;
  private supportedFormats = [
    '.mp3',
    '.flac',
    '.wav',
    '.m4a',
    '.aac',
    '.ogg',
    '.wma',
  ];
  private progressCallback?: (progress: ScanProgress) => void;

  constructor(db: MusicLibraryDB) {
    this.db = db;
  }

  public setProgressCallback(callback: (progress: ScanProgress) => void): void {
    this.progressCallback = callback;
  }

  private isMusicFile(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    return this.supportedFormats.includes(ext);
  }

  private async calculateFileHash(filePath: string): Promise<string> {
    try {
      const fileBuffer = await fs.readFile(filePath);
      return createHash('sha256').update(fileBuffer).digest('hex');
    } catch (error) {
      console.warn(`Failed to calculate hash for ${filePath}:`, error);
      return '';
    }
  }

  private async extractMetadata(filePath: string) {
    try {
      const metadata = await mm.parseFile(filePath);
      const stats = await fs.stat(filePath);
      const fileName = path.basename(filePath, path.extname(filePath));
      const parentDir = path.dirname(filePath);
      const grandParentDir = path.dirname(parentDir);

      let artist = metadata.common.artist;
      let title = metadata.common.title;
      let album = metadata.common.album;
      let trackNo = metadata.common.track.no;

      // 1. Try to extract track number from filename (e.g., "01 - Title.mp3")
      if (!trackNo) {
        const trackMatch = fileName.match(/^(\d+)/);
        if (trackMatch) {
          trackNo = parseInt(trackMatch[1], 10);
        }
      }

      // 2. Guess from filename if missing
      if (!artist || !title) {
        // Normalize filename: replace underscores with spaces for easier parsing
        const normalized = fileName.replace(/_/g, ' ');
        // Split by common separators: " - ", " -", "- " or just "-"
        const parts = normalized.split(/\s*-\s*/);

        if (parts.length >= 3) {
          // Likely [TrackNo] - [Artist] - [Title]
          // If the first part is a number, it's the track number
          const firstIsNumber = /^\d+$/.test(parts[0].trim());
          if (firstIsNumber) {
            if (!artist) artist = parts[1].trim();
            if (!title) title = parts[2].trim();
          } else {
            if (!artist) artist = parts[0].trim();
            if (!title) title = parts[1].trim();
          }
        } else if (parts.length === 2) {
          // Likely [Artist] - [Title] or [TrackNo] - [Title]
          const firstIsNumber = /^\d+$/.test(parts[0].trim());
          if (firstIsNumber) {
            if (!title) title = parts[1].trim();
          } else {
            if (!artist) artist = parts[0].trim();
            if (!title) title = parts[1].trim();
          }
        }

        // Final fallback for title if still missing
        if (!title) {
          title = normalized.replace(/^\d+[\s._-]*/, '').trim();
        }
      }

      // 3. Guess from Folder Structure if still missing
      if (!album || album.toLowerCase() === 'unknown') {
        const folderName = path.basename(parentDir);
        if (folderName && folderName !== '.' && folderName !== 'Music') {
          album = folderName;
        }
      }

      if (!artist || artist.toLowerCase() === 'unknown') {
        const folderName = path.basename(grandParentDir);
        if (folderName && folderName !== '.' && folderName !== 'Music') {
          artist = folderName;
        }
      }

      return {
        file_path: filePath,
        file_hash: await this.calculateFileHash(filePath),
        artist: artist || undefined,
        title: title || undefined,
        album: album || undefined,
        track_no: trackNo || undefined,
        tempo: metadata.common.bpm
          ? Math.round(metadata.common.bpm)
          : undefined,
        length: metadata.format.duration
          ? Math.round(metadata.format.duration)
          : undefined,
        file_size: stats.size,
        bitrate: metadata.format.bitrate
          ? Math.round(metadata.format.bitrate)
          : undefined,
        format:
          metadata.format.container || path.extname(filePath).substring(1),
        last_modified: stats.mtimeMs,
      };
    } catch (error) {
      console.warn(`Failed to extract metadata from ${filePath}:`, error);
      throw error;
    }
  }

  private async scanDirectory(
    dirPath: string,
    progress: ScanProgress
  ): Promise<string[]> {
    const musicFiles: string[] = [];

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          try {
            const subFiles = await this.scanDirectory(fullPath, progress);
            musicFiles.push(...subFiles);
          } catch (error) {
            console.warn(`Failed to scan directory ${fullPath}:`, error);
            progress.errors.push(`Failed to scan directory: ${fullPath}`);
          }
        } else if (entry.isFile() && this.isMusicFile(fullPath)) {
          musicFiles.push(fullPath);
          progress.totalFiles++;
        }
      }
    } catch (error) {
      console.warn(`Failed to read directory ${dirPath}:`, error);
      progress.errors.push(`Failed to read directory: ${dirPath}`);
    }

    return musicFiles;
  }

  public async scanLibrary(
    libraryPath: string,
    forceRefresh: boolean = false
  ): Promise<ScanProgress> {
    const progress: ScanProgress = {
      totalFiles: 0,
      processedFiles: 0,
      currentFile: '',
      errors: [],
    };

    try {
      console.log(`Starting scan of library: ${libraryPath}`);

      const musicFiles = await this.scanDirectory(libraryPath, progress);
      console.log(`Found ${musicFiles.length} music files`);

      for (const filePath of musicFiles) {
        progress.currentFile = filePath;
        progress.processedFiles++;

        if (this.progressCallback) {
          this.progressCallback({ ...progress });
        }

        try {
          const existingTrack = this.db.getTrackByPath(filePath);
          const stats = await fs.stat(filePath);

          if (
            !forceRefresh &&
            existingTrack &&
            existingTrack.last_modified === stats.mtimeMs
          ) {
            console.log(`Skipping unchanged file: ${filePath}`);
            continue;
          }

          const metadata = await this.extractMetadata(filePath);
          this.db.insertTrack(metadata);
          console.log(
            `Processed: ${metadata.artist || 'Unknown'} - ${metadata.title || path.basename(filePath)}`
          );
        } catch (error) {
          console.error(`Error processing file ${filePath}:`, error);
          progress.errors.push(`Failed to process: ${filePath}`);
        }
      }

      console.log(
        `Scan completed. Processed ${progress.processedFiles} files with ${progress.errors.length} errors.`
      );
    } catch (error) {
      console.error('Library scan failed:', error);
      progress.errors.push(`Scan failed: ${error}`);
    }

    return progress;
  }

  public async incrementalScan(libraryPath: string): Promise<ScanProgress> {
    const existingTracks = this.db.getAllTracks();
    const existingPaths = new Set(
      existingTracks.map((track) => track.file_path)
    );

    const progress: ScanProgress = {
      totalFiles: 0,
      processedFiles: 0,
      currentFile: '',
      errors: [],
    };

    try {
      const musicFiles = await this.scanDirectory(libraryPath, progress);

      // Check for new files
      const newFiles = musicFiles.filter((file) => !existingPaths.has(file));
      console.log(`Found ${newFiles.length} new files to process`);

      for (const filePath of newFiles) {
        progress.currentFile = filePath;
        progress.processedFiles++;

        if (this.progressCallback) {
          this.progressCallback({ ...progress });
        }

        try {
          const metadata = await this.extractMetadata(filePath);
          this.db.insertTrack(metadata);
          console.log(
            `Added new: ${metadata.artist || 'Unknown'} - ${metadata.title || path.basename(filePath)}`
          );
        } catch (error) {
          console.error(`Error processing new file ${filePath}:`, error);
          progress.errors.push(`Failed to process: ${filePath}`);
        }
      }

      // Check for deleted files
      const currentPaths = new Set(musicFiles);
      const deletedFiles = existingTracks.filter(
        (track) => !currentPaths.has(track.file_path)
      );

      for (const track of deletedFiles) {
        this.db.deleteTrack(track.id);
        console.log(
          `Removed deleted: ${track.artist || 'Unknown'} - ${track.title || path.basename(track.file_path)}`
        );
      }

      if (deletedFiles.length > 0) {
        console.log(
          `Removed ${deletedFiles.length} deleted files from database`
        );
      }
    } catch (error) {
      console.error('Incremental scan failed:', error);
      progress.errors.push(`Incremental scan failed: ${error}`);
    }

    return progress;
  }
}
