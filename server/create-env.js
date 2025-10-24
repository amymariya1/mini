import { writeFileSync } from 'fs';

const envContent = `PORT=5002
MONGO_URI=mongodb+srv://amy:amy@cluster0.ej3dl6m.mongodb.net/mindmirror?retryWrites=true&w=majority&appName=Cluster0`;

writeFileSync('.env', envContent);
console.log('.env file created successfully');