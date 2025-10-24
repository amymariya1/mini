const fs = require('fs');

const envContent = 'PORT=5002\nMONGO_URI=mongodb://127.0.0.1:27017/mindmirror\n';

fs.writeFileSync('.env', envContent);
console.log('.env file created successfully');