class PathResolver {
  private deviceId: string;
  private musicRootPath: string;

  // Store paths relative to a root folder
  getRelativePath(absolutePath: string): string {
    return path.relative(this.musicRootPath, absolutePath);
  }

  // Resolve relative path to absolute for this device
  resolvePathForDevice(trackId: string): string {
    const track = db
      .prepare('SELECT file_path FROM tracks WHERE id = ?')
      .get(trackId);

    // Check if device-specific path exists
    const devicePath = db
      .prepare(
        'SELECT local_path FROM device_paths WHERE device_id = ? AND track_id = ?'
      )
      .get(this.deviceId, trackId);

    if (devicePath) return devicePath.local_path;

    // Otherwise, combine root path with relative path
    return path.join(this.musicRootPath, track.file_path);
  }

  // Save device-specific path mapping
  savePathMapping(trackId: string, absolutePath: string) {
    db.prepare(
      `
        INSERT OR REPLACE INTO device_paths 
        (device_id, device_name, track_id, local_path, last_synced)
        VALUES (?, ?, ?, ?, ?)
      `
    ).run(this.deviceId, os.hostname(), trackId, absolutePath, Date.now());
  }
}
