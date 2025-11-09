import { app, dialog } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import MusicLibraryDB from './database/db';

class FirstTimeSetup {
  async configure() {
    const deviceId = this.generateDeviceId();

    const cloudPath = await this.selectFolder(
      'Select your cloud sync folder (Dropbox, Google Drive, etc.)'
    );

    const musicPath = await this.selectFolder(
      'Select your music library folder'
    );

    const dbPath = path.join(cloudPath, 'music-library.db');
    const dbExists = fs.existsSync(dbPath);

    if (dbExists) {
      console.log('Existing library found');
      const choice = await this.showDialog(
        'Existing library found. Use it or create new?',
        ['Use Existing', 'Create New']
      );

      if (choice === 'Use Existing') {
        this.loadExistingLibrary(dbPath, musicPath, deviceId);
      } else {
        this.createNewLibrary(dbPath, musicPath, deviceId);
      }
    } else {
      console.log('Creating new library');
      this.createNewLibrary(dbPath, musicPath, deviceId);
    }

    this.saveConfig({
      deviceId,
      deviceName: os.hostname(),
      musicRootPath: musicPath,
      dbPath: dbPath,
    });
  }

  private generateDeviceId(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  private async selectFolder(message: string): Promise<string> {
    const result = await dialog.showOpenDialog({
      title: message,
      properties: ['openDirectory'],
    });

    if (result.canceled || result.filePaths.length === 0) {
      throw new Error('No folder selected');
    }

    return result.filePaths[0];
  }

  private async showDialog(
    message: string,
    buttons: string[]
  ): Promise<string> {
    const result = await dialog.showMessageBox({
      message,
      buttons,
      defaultId: 0,
    });

    return buttons[result.response];
  }

  private loadExistingLibrary(
    dbPath: string,
    musicPath: string,
    deviceId: string
  ): void {
    // TODO: Implement loading existing library
    console.log('Loading existing library:', { dbPath, musicPath, deviceId });
  }

  private createNewLibrary(
    dbPath: string,
    musicPath: string,
    deviceId: string
  ): void {
    const cloudSyncPath = path.dirname(dbPath);

    if (!fs.existsSync(cloudSyncPath)) {
      fs.mkdirSync(cloudSyncPath, { recursive: true });
    }

    // If database already exists and user chose to create new, remove it
    // Also remove WAL and SHM files if they exist (from previous SQLite sessions)
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
    const walPath = dbPath + '-wal';
    const shmPath = dbPath + '-shm';
    if (fs.existsSync(walPath)) {
      fs.unlinkSync(walPath);
    }
    if (fs.existsSync(shmPath)) {
      fs.unlinkSync(shmPath);
    }
    console.log('Creating new database instance');
    // Create new database instance (this will create the SQLite file and initialize all tables)
    const db = new MusicLibraryDB(cloudSyncPath, deviceId);

    // Store device name in sync_metadata
    const deviceName = os.hostname();
    db.setMetadata('device_name', deviceName);

    // Store music root path in sync_metadata
    db.setMetadata('music_root_path', musicPath);

    // Close the database connection (this ensures all changes are flushed to disk)
    db.close();

    // Verify the database file was created
    if (!fs.existsSync(dbPath)) {
      throw new Error(`Failed to create database file at ${dbPath}`);
    }

    console.log('New library created successfully:', { dbPath, musicPath, deviceId });
  }

  private saveConfig(config: any): void {
    const userDataPath = app.getPath('userData');
    const configPath = path.join(userDataPath, 'config.json');
    
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }
    
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
    console.log('Config saved to:', configPath);
  }
}

export default FirstTimeSetup;
