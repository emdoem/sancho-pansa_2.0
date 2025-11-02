import { app, dialog } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

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
    // TODO: Implement creating new library
    console.log('Creating new library:', { dbPath, musicPath, deviceId });
  }

  private saveConfig(config: any): void {
    const userDataPath = app.getPath('userData');
    const configPath = path.join(userDataPath, 'config.json');
    
    // Ensure the directory exists
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }
    
    // Write the config as formatted JSON
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
    console.log('Config saved to:', configPath);
  }
}

export default FirstTimeSetup;
