import { promises as fs } from 'fs';
import path from 'path';
import MusicLibraryDB from '../database/db';

export interface OrganizeAction {
  type: 'MOVE' | 'DELETE' | 'KEEP';
  sourcePath: string;
  targetPath?: string;
  reason: string;
  qualityInfo?: string;
}

export interface OrganizePlan {
  actions: OrganizeAction[];
  stats: {
    toMove: number;
    toDelete: number;
    toKeep: number;
    totalSizeToRecover: number;
  };
}

export class LibraryOrganizer {
  private db: MusicLibraryDB;

  constructor(db: MusicLibraryDB) {
    this.db = db;
  }

  private getQualityScore(track: any): number {
    let score = 0;
    const format = (track.format || '').toLowerCase();

    // Format scoring
    if (['flac', 'wav', 'alac'].includes(format)) score += 1000;
    else if (['mp3', 'm4a', 'aac'].includes(format)) score += 500;

    // Bitrate scoring
    score += (track.bitrate || 0) / 10;

    return score;
  }

  private getMetadataCompletenessScore(track: any): number {
    let score = 0;
    if (track.title != null) score++;
    if (track.artist != null) score++;
    if (track.album_artist_name != null || track.album_artist != null) score++;
    if (track.album_title != null || track.album != null) score++;
    if (track.track_no != null) score++;
    if (track.tempo != null) score++;
    if (track.length != null) score++;
    if (track.bitrate != null) score++;
    if (track.file_size != null) score++;
    if (track.format != null) score++;
    return score;
  }

  private sanitize(str: string): string {
    if (!str) return 'Unknown';
    // Remove invalid characters for file systems
    return str.replace(/[<>:"/\\|?*]/g, '_').trim();
  }

  public async generatePlan(libraryRoot: string): Promise<OrganizePlan> {
    const tracks = this.db.getAllTracks();
    const actions: OrganizeAction[] = [];
    const plan: OrganizePlan = {
      actions: [],
      stats: { toMove: 0, toDelete: 0, toKeep: 0, totalSizeToRecover: 0 },
    };

    // Track used paths to avoid collisions
    const usedTargetPaths = new Map<string, string>(); // path -> original_file_id

    // 1. Group by file_hash (bit-identical files are the only true duplicates)
    const hashGroups = new Map<string, any[]>();

    for (const track of tracks) {
      const file_hash = track.file_hash;
      if (!file_hash) {
        // No hash available - treat as unique
        const key = `unique_${track.id}`;
        hashGroups.set(key, [track]);
        continue;
      }

      const key = file_hash;
      if (!hashGroups.has(key)) hashGroups.set(key, []);
      hashGroups.get(key)!.push(track);
    }

    // 2. Process each hash group
    for (const groupTracks of hashGroups.values()) {
      if (groupTracks.length === 1) {
        // Only one file with this hash - it's a unique file
        const track = groupTracks[0];
        const artist = (track.artist || 'Unknown').trim();
        const title = (track.title || 'Unknown').trim();

        // Skip tracks without proper metadata for organization
        if (
          artist.toLowerCase() === 'unknown' ||
          title.toLowerCase() === 'unknown'
        ) {
          actions.push({
            type: 'KEEP',
            sourcePath: track.file_path,
            reason: 'Insufficient metadata for organization',
            qualityInfo: `${track.format.toUpperCase()} ${track.bitrate}kbps`,
          });
          plan.stats.toKeep++;
          continue;
        }

        // Determine target path for unique file
        const artistFolder = this.sanitize(
          track.album_artist_name || track.album_artist || track.artist
        );
        const albumFolder = this.sanitize(track.album_title || track.album);
        const titleField = this.sanitize(track.title);
        const trackNoStr = track.track_no
          ? `${track.track_no.toString().padStart(2, '0')} - `
          : '';
        const ext = path.extname(track.file_path);

        const targetDir = path.join(libraryRoot, artistFolder, albumFolder);
        let targetFileName = `${trackNoStr}${titleField}${ext}`;
        let targetPath = path.join(targetDir, targetFileName);

        // Collision detection
        let suffix = 1;
        while (
          usedTargetPaths.has(targetPath.toLowerCase()) &&
          usedTargetPaths.get(targetPath.toLowerCase()) !== track.id
        ) {
          targetFileName = `${trackNoStr}${titleField} (${suffix})${ext}`;
          targetPath = path.join(targetDir, targetFileName);
          suffix++;
        }
        usedTargetPaths.set(targetPath.toLowerCase(), track.id);

        if (path.normalize(track.file_path) !== path.normalize(targetPath)) {
          actions.push({
            type: 'MOVE',
            sourcePath: track.file_path,
            targetPath: targetPath,
            reason: 'Standardizing folder structure and naming',
            qualityInfo: `${track.format.toUpperCase()} ${track.bitrate}kbps`,
          });
          plan.stats.toMove++;
        } else {
          actions.push({
            type: 'KEEP',
            sourcePath: track.file_path,
            reason: 'Already correctly named and placed',
            qualityInfo: `${track.format.toUpperCase()} ${track.bitrate}kbps`,
          });
          plan.stats.toKeep++;
        }

        continue;
      }

      // Multiple files with same hash - these are duplicates
      // Sort by metadata completeness first, then by quality
      groupTracks.sort((a, b) => {
        const completenessDiff =
          this.getMetadataCompletenessScore(b) -
          this.getMetadataCompletenessScore(a);
        if (completenessDiff !== 0) return completenessDiff;
        return this.getQualityScore(b) - this.getQualityScore(a);
      });

      const keeper = groupTracks[0];
      const duplicates = groupTracks.slice(1);

      // Check if keeper has sufficient metadata
      const artist = (keeper.artist || 'Unknown').trim();
      const title = (keeper.title || 'Unknown').trim();

      if (
        artist.toLowerCase() === 'unknown' ||
        title.toLowerCase() === 'unknown'
      ) {
        // Keeper doesn't have good metadata - keep all and mark separately
        for (const track of groupTracks) {
          actions.push({
            type: 'KEEP',
            sourcePath: track.file_path,
            reason: 'Insufficient metadata, cannot determine duplicates',
            qualityInfo: `${track.format.toUpperCase()} ${track.bitrate}kbps`,
          });
          plan.stats.toKeep++;
        }
        continue;
      }

      // --- HANDLE KEEPER ---
      // Use Album Artist from the normalized table for the folder structure
      const artistFolder = this.sanitize(
        keeper.album_artist_name || keeper.album_artist || keeper.artist
      );
      const albumFolder = this.sanitize(keeper.album_title || keeper.album);
      const titleField = this.sanitize(keeper.title);
      const trackNoStr = keeper.track_no
        ? `${keeper.track_no.toString().padStart(2, '0')} - `
        : '';
      const ext = path.extname(keeper.file_path);

      const targetDir = path.join(libraryRoot, artistFolder, albumFolder);
      let targetFileName = `${trackNoStr}${titleField}${ext}`;
      let targetPath = path.join(targetDir, targetFileName);

      // Collision detection
      let suffix = 1;
      while (
        usedTargetPaths.has(targetPath.toLowerCase()) &&
        usedTargetPaths.get(targetPath.toLowerCase()) !== keeper.id
      ) {
        targetFileName = `${trackNoStr}${titleField} (${suffix})${ext}`;
        targetPath = path.join(targetDir, targetFileName);
        suffix++;
      }
      usedTargetPaths.set(targetPath.toLowerCase(), keeper.id);

      if (path.normalize(keeper.file_path) !== path.normalize(targetPath)) {
        actions.push({
          type: 'MOVE',
          sourcePath: keeper.file_path,
          targetPath: targetPath,
          reason: 'Standardizing folder structure and naming',
          qualityInfo: `${keeper.format.toUpperCase()} ${keeper.bitrate}kbps`,
        });
        plan.stats.toMove++;
      } else {
        actions.push({
          type: 'KEEP',
          sourcePath: keeper.file_path,
          reason: 'Already correctly named and placed',
          qualityInfo: `${keeper.format.toUpperCase()} ${keeper.bitrate}kbps`,
        });
        plan.stats.toKeep++;
      }

      // --- HANDLE DUPLICATES ---
      for (const dup of duplicates) {
        actions.push({
          type: 'DELETE',
          sourcePath: dup.file_path,
          reason: `Duplicate (same hash). Keeper: ${keeper.format.toUpperCase()} ${keeper.bitrate}kbps, ${this.getMetadataCompletenessScore(keeper)}/10 fields populated`,
          qualityInfo: `${dup.format.toUpperCase()} ${dup.bitrate}kbps`,
        });
        plan.stats.toDelete++;
        plan.stats.totalSizeToRecover += dup.file_size || 0;
      }
    }

    plan.actions = actions;
    return plan;
  }

  public async executePlan(
    plan: OrganizePlan,
    libraryRoot: string,
    onProgress?: (progress: {
      total: number;
      current: number;
      action: string;
    }) => void
  ): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = [];
    let processed = 0;
    const actionsToExecute = plan.actions.filter((a) => a.type !== 'KEEP');
    const total = actionsToExecute.length;

    console.log(`Executing ${total} actions...`);

    for (const action of actionsToExecute) {
      processed++;
      if (onProgress) {
        onProgress({
          total,
          current: processed,
          action: `${action.type}: ${path.basename(action.sourcePath)}`,
        });
      }

      try {
        if (action.type === 'DELETE') {
          // Verify file exists before deleting
          try {
            await fs.access(action.sourcePath);
            await fs.unlink(action.sourcePath);
            // We need the track ID to remove from DB. Since action doesn't have it,
            // we'll look it up by path. This assumes path is unique.
            const track = this.db.getTrackByPath(action.sourcePath);
            if (track) {
              this.db.deleteTrack(track.id);
            }
          } catch (e: any) {
            if (e.code !== 'ENOENT') throw e;
            // File already gone, just clean DB
            const track = this.db.getTrackByPath(action.sourcePath);
            if (track) {
              this.db.deleteTrack(track.id);
            }
          }
        } else if (action.type === 'MOVE' && action.targetPath) {
          // 1. Ensure target directory exists
          await fs.mkdir(path.dirname(action.targetPath), { recursive: true });

          // 2. Copy file (safer than rename across partitions/drives)
          await fs.copyFile(action.sourcePath, action.targetPath);

          // 3. Verify copy
          const sourceStats = await fs.stat(action.sourcePath);
          const targetStats = await fs.stat(action.targetPath);

          if (sourceStats.size !== targetStats.size) {
            throw new Error(
              `Copy verification failed for ${action.sourcePath} -> ${action.targetPath}`
            );
          }

          // 4. Delete source
          await fs.unlink(action.sourcePath);

          // 5. Update DB
          const track = this.db.getTrackByPath(action.sourcePath);
          if (track) {
            // We need a way to update file_path directly since updateTrack is for metadata
            // I'll assume I can access the db instance directly for now or add a method
            // Since `private db` is accessible within this class which imports `MusicLibraryDB`,
            // wait, `this.db` is the wrapper class instance.
            // I should add `updateTrackPath` to MusicLibraryDB.
            // For now, I'll cheat and cast to any to access the raw better-sqlite3 db if possible,
            // OR better, add the method to DB class.
            // Let's add `updateTrackPath` to MusicLibraryDB in next step.
            this.db.updateTrackPath(track.id, action.targetPath);
          }
        }
      } catch (error: any) {
        console.error(
          `Action failed: ${action.type} ${action.sourcePath}`,
          error
        );
        errors.push(
          `Failed to ${action.type} ${path.basename(action.sourcePath)}: ${
            error.message
          }`
        );
      }
    }

    // Clean up empty directories
    if (onProgress) {
      onProgress({
        total,
        current: processed,
        action: 'Cleaning up empty directories...',
      });
    }

    try {
      const cleanedDirs = await this.cleanupEmptyDirectories(libraryRoot);
      if (cleanedDirs > 0 && onProgress) {
        onProgress({
          total,
          current: processed,
          action: `Removed ${cleanedDirs} empty directories`,
        });
      }
    } catch (error: any) {
      errors.push(`Directory cleanup failed: ${error.message}`);
    }

    return { success: errors.length === 0, errors };
  }

  /**
   * Recursively find and remove empty directories
   * Returns the number of directories removed
   */
  private async cleanupEmptyDirectories(rootDir: string): Promise<number> {
    let removedCount = 0;
    const visited = new Set<string>();

    const cleanDir = async (dirPath: string): Promise<number> => {
      if (visited.has(dirPath)) return 0; // Avoid infinite loops with symlinks
      visited.add(dirPath);

      try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });

        if (entries.length === 0) {
          await fs.rmdir(dirPath);
          return 1;
        }

        let subDirs: string[] = [];

        for (const entry of entries) {
          if (entry.isDirectory()) {
            subDirs.push(path.join(dirPath, entry.name));
          }
        }

        // Process subdirectories first (bottom-up)
        for (const subDir of subDirs) {
          const subDirCleaned = await cleanDir(subDir);
          removedCount += subDirCleaned;
        }

        // Check if current directory is now empty (after subdirs were cleaned)
        try {
          const newEntries = await fs.readdir(dirPath, { withFileTypes: true });
          if (newEntries.length === 0) {
            await fs.rmdir(dirPath);
            return 1;
          }
        } catch (e: any) {
          if (e.code !== 'ENOENT') throw e;
        }

        return 0;
      } catch (e: any) {
        if (e.code !== 'ENOENT') {
          console.error(`Error cleaning dir ${dirPath}:`, e);
        }
        return 0;
      }
    };

    await cleanDir(rootDir);
    return removedCount;
  }
}
