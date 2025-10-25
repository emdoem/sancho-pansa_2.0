import { dialog } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

class FirstTimeSetup {
  async configure() {
    // Step 1: Choose or create device ID
    const deviceId = this.generateDeviceId();

    // Step 2: Select cloud sync location
    const cloudPath = await this.selectFolder(
      'Select your cloud sync folder (Dropbox, Google Drive, etc.)'
    );

    // Step 3: Select music library location
    const musicPath = await this.selectFolder(
      'Select your music library folder'
    );

    // Step 4: Check if database exists in cloud location
    const dbPath = path.join(cloudPath, 'music-library.db');
    const dbExists = fs.existsSync(dbPath);

    if (dbExists) {
      // Existing library found
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
      // First device setup
      this.createNewLibrary(dbPath, musicPath, deviceId);
    }

    // Step 5: Save configuration
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
    // TODO: Implement creating new library
    console.log('Creating new library:', { dbPath, musicPath, deviceId });
  }

  private saveConfig(config: any): void {
    // TODO: Implement saving configuration
    console.log('Saving config:', config);
  }
}

export default FirstTimeSetup;
