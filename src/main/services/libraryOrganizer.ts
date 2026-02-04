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

    // 1. Group by semantic identity (Artist + Title + Album + TrackNo)
    const semanticGroups = new Map<string, any[]>();

    for (const track of tracks) {
      const albumArtist = (
        track.album_artist_name ||
        track.album_artist ||
        ''
      ).trim();
      const artist = (track.artist || 'Unknown').trim();
      const title = (track.title || 'Unknown').trim();
      const album = (track.album_title || track.album || 'Unknown').trim();
      const trackNo = track.track_no || '';

      // Strict rule: If Artist or Title is Unknown, treat as unique unless we have a hash match later
      if (
        artist.toLowerCase() === 'unknown' ||
        title.toLowerCase() === 'unknown'
      ) {
        const key = `unique_${track.id}`;
        semanticGroups.set(key, [track]);
        continue;
      }

      // Group by Album Artist (if available) + Title + Album + TrackNo
      // This helps group tracks with different "feat." artists into the same semantic group
      const mainArtist = albumArtist || artist;
      const key = `${mainArtist.toLowerCase()}|${title.toLowerCase()}|${album.toLowerCase()}|${trackNo}`;
      if (!semanticGroups.has(key)) semanticGroups.set(key, []);
      semanticGroups.get(key)!.push(track);
    }

    // 2. Process each semantic group
    for (const groupTracks of semanticGroups.values()) {
      // Sort by quality score
      groupTracks.sort(
        (a, b) => this.getQualityScore(b) - this.getQualityScore(a)
      );

      const keeper = groupTracks[0];
      const duplicates = groupTracks.slice(1);

      // --- HANDLE KEEPER ---
      // Use Album Artist from the normalized table for the folder structure
      const artistFolder = this.sanitize(
        keeper.album_artist_name || keeper.album_artist || keeper.artist
      );
      const albumFolder = this.sanitize(keeper.album_title || keeper.album);
      const title = this.sanitize(keeper.title);
      const trackNoStr = keeper.track_no
        ? `${keeper.track_no.toString().padStart(2, '0')} - `
        : '';
      const ext = path.extname(keeper.file_path);

      const targetDir = path.join(libraryRoot, artistFolder, albumFolder);
      let targetFileName = `${trackNoStr}${title}${ext}`;
      let targetPath = path.join(targetDir, targetFileName);

      // Collision detection: If different songs end up with the same name
      let suffix = 1;
      while (
        usedTargetPaths.has(targetPath.toLowerCase()) &&
        usedTargetPaths.get(targetPath.toLowerCase()) !== keeper.id
      ) {
        targetFileName = `${trackNoStr}${title} (${suffix})${ext}`;
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
          reason: `Duplicate of higher quality version: ${keeper.format.toUpperCase()} ${keeper.bitrate}kbps`,
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

    return { success: errors.length === 0, errors };
  }
}
