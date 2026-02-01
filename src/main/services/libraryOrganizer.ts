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

    // 1. Group by semantic identity (Artist + Title + Album)
    const semanticGroups = new Map<string, any[]>();

    for (const track of tracks) {
      const artist = (track.artist || 'Unknown').trim();
      const title = (track.title || 'Unknown').trim();
      const album = (track.album || 'Unknown').trim();

      // Strict rule: If both Artist and Title are Unknown, treat as unique to avoid massive data loss
      if (
        artist.toLowerCase() === 'unknown' &&
        title.toLowerCase() === 'unknown'
      ) {
        const key = `unique_${track.id}`;
        semanticGroups.set(key, [track]);
        continue;
      }

      const key = `${artist.toLowerCase()}|${title.toLowerCase()}|${album.toLowerCase()}`;
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
      const artist = this.sanitize(keeper.artist);
      const album = this.sanitize(keeper.album);
      const title = this.sanitize(keeper.title);
      const trackNoStr = keeper.track_no
        ? `${keeper.track_no.toString().padStart(2, '0')} - `
        : '';
      const ext = path.extname(keeper.file_path);

      const targetDir = path.join(libraryRoot, artist, album);
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
}
