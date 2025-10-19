class SyncManager {
    // Before making changes, check if database was modified by another device
    checkForExternalChanges(): boolean {
      const lastKnownModified = this.getLastKnownModifiedTime();
      const currentModified = fs.statSync(this.dbPath).mtime.getTime();
      
      return currentModified > lastKnownModified;
    }
    
    // Reload database if external changes detected
    handleExternalChanges() {
      if (this.checkForExternalChanges()) {
        // Close and reopen connection to get fresh data
        this.db.close();
        this.db = new Database(this.dbPath);
        
        // Notify renderer to refresh UI
        mainWindow.webContents.send('database-updated-externally');
      }
    }
    
    // Watch for file changes from cloud sync
    watchDatabaseFile() {
      fs.watch(this.dbPath, (eventType) => {
        if (eventType === 'change') {
          this.handleExternalChanges();
        }
      });
    }
  }
  