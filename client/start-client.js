const { spawn } = require('child_process');
const path = require('path');

// Start the React client
const client = spawn('npx', ['react-scripts', 'start'], {
  stdio: 'inherit',
  shell: true,
  cwd: path.resolve(__dirname)
});

client.on('close', (code) => {
  console.log(`Client process exited with code ${code}`);
});