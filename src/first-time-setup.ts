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
        dbPath: dbPath
      });
    }
  }
  