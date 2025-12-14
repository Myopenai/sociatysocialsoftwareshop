const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\n=== Mirror System Status Check ===');

// Check for running Python processes that might be the mirror system
try {
  console.log('\nChecking for running Python processes...');
  const result = execSync('tasklist /FI "IMAGENAME eq python.exe" /FO CSV /NH').toString();
  const pythonProcesses = result.split('\n')
    .filter(line => line.includes('python.exe'))
    .map(line => line.split(',')[0].replace(/"|\s/g, ''));
  
  console.log('Running Python Processes:', 
    pythonProcesses.length > 0 ? pythonProcesses : 'None');
    
  // Check for mirror system files
  console.log('\nChecking for mirror system files...');
  const mirrorFiles = [
    'src/ci/mirror/mirror-integration.service.ts',
    'src/ci/mirror/mirror.service.ts',
    'src/ci/mirror/mirror.module.ts'
  ];
  
  const filesExist = mirrorFiles.map(file => ({
    file,
    exists: fs.existsSync(path.join(__dirname, file))
  }));
  
  console.log('Mirror System Files:');
  console.table(filesExist);
  
  // Check for mirror directory
  const mirrorDirs = ['mirror', 'source', 'config'];
  const dirsStatus = mirrorDirs.map(dir => ({
    directory: dir,
    exists: fs.existsSync(path.join(__dirname, dir)),
    isDirectory: fs.existsSync(path.join(__dirname, dir)) 
      ? fs.statSync(path.join(__dirname, dir)).isDirectory()
      : false
  }));
  
  console.log('\nDirectory Status:');
  console.table(dirsStatus);
  
  // Check for Python dependencies
  console.log('\nChecking Python dependencies...');
  try {
    const pyDeps = ['watchdog', 'pyyaml'];
    const pipList = execSync('pip list').toString().toLowerCase();
    const depsStatus = pyDeps.map(dep => ({
      package: dep,
      installed: pipList.includes(dep.toLowerCase())
    }));
    console.table(depsStatus);
  } catch (error) {
    console.log('Error checking Python dependencies:', error.message);
  }
  
  // Final status
  console.log('\n=== Mirror System Status ===');
  if (pythonProcesses.length > 0) {
    console.log('STATUS: RUNNING - Mirror system processes detected');
  } else {
    console.log('STATUS: STOPPED - No active mirror system processes found');
  }
  
} catch (error) {
  console.error('Error checking mirror status:', error.message);
  console.log('\nSTATUS: UNKNOWN - Error occurred while checking status');
}
