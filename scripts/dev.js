const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Geofence Alert Development Server...\n');

// Start Vite dev server
const vite = spawn('npm', ['run', 'dev:renderer'], {
  stdio: 'inherit',
  shell: true,
  cwd: path.join(__dirname, '..')
});

// Start Electron main process after a delay
setTimeout(() => {
  console.log('\n⚡ Starting Electron...\n');
  const electron = spawn('npm', ['run', 'dev:main'], {
    stdio: 'inherit',
    shell: true,
    cwd: path.join(__dirname, '..')
  });

  electron.on('close', (code) => {
    console.log(`\n📱 Electron process exited with code ${code}`);
    vite.kill();
    process.exit(code);
  });
}, 3000);

vite.on('close', (code) => {
  console.log(`\n🌐 Vite process exited with code ${code}`);
  process.exit(code);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development server...');
  vite.kill();
  process.exit(0);
});
