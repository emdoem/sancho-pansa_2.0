const { exec } = require('child_process');

// Function to find and kill process on a specific port
function killPortProcess(port) {
  return new Promise((resolve, reject) => {
    // Windows command to find and kill process on specific port
    const command = `for /f "tokens=5" %a in ('netstat -ano ^| findstr :${port}') do taskkill /f /pid %a`;

    exec(command, (error, stdout, stderr) => {
      if (error && !stderr.includes('not found')) {
        console.log(`No process found on port ${port} or failed to kill it`);
        resolve(false);
      } else {
        console.log(`Successfully killed process on port ${port}`);
        resolve(true);
      }
    });
  });
}

// Kill process on port 5173 before starting dev server
killPortProcess(5173).then(() => {
  console.log('Port 5173 cleared, starting dev server...');
});
