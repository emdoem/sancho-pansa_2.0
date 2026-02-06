import path from 'path';
import NodeID3 from 'node-id3';

export interface MetadataUpdate {
  title?: string;
  artist?: string;
  albumArtist?: string;
  album?: string;
  trackNo?: number;
  tempo?: number;
}

export class MetadataWriter {
  /**
   * Write metadata to an audio file based on its extension
   */
  public async writeMetadata(
    filePath: string,
    metadata: MetadataUpdate
  ): Promise<boolean> {
    try {
      const ext = path.extname(filePath).toLowerCase();

      switch (ext) {
        case '.mp3':
          return await this.writeMP3Metadata(filePath, metadata);
        case '.flac':
        case '.m4a':
        case '.mp4':
        case '.aac':
          // FLAC, M4A/MP4 metadata writing not yet implemented
          console.warn(
            `Metadata writing for ${ext} files not yet implemented: ${filePath}`
          );
          return false;
        default:
          console.warn(`Unsupported file format for metadata writing: ${ext}`);
          return false;
      }
    } catch (error) {
      console.error(`Error writing metadata to ${filePath}:`, error);
      return false;
    }
  }

  /**
   * Write ID3 tags to MP3 files
   */
  private async writeMP3Metadata(
    filePath: string,
    metadata: MetadataUpdate
  ): Promise<boolean> {
    const tags: any = {};

    // != null catches both null and undefined
    if (!metadata.title) {
      tags.title = metadata.title;
    }
    if (metadata.artist != null) {
      tags.artist = metadata.artist;
    }
    if (metadata.albumArtist != null) {
      tags.performerInfo = metadata.albumArtist;
    }
    if (metadata.album != null) {
      tags.album = metadata.album;
    }
    if (metadata.trackNo != null) {
      tags.trackNumber = metadata.trackNo.toString();
    }
    if (metadata.tempo != null) {
      tags.bpm = metadata.tempo.toString();
    }

    // Use update instead of write to preserve existing tags
    const result = NodeID3.update(tags, filePath);
    return result === true;
  }
}
