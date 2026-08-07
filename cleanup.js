const fs = require('fs');
const files = [
  'run-tests.js', 'kill-port.js', 'run-tests.ps1', 'conn-test.ps1',
  'build-output.txt', 'build-output-utf8.txt', 'build-top.txt', 'build-mid.txt',
  'test-results.txt', 'server-stdout.txt', 'server-stderr.txt', 'server-pid.txt',
  'server-log-read.txt', 'server-err-read.txt', 'server-log.txt',
  'port-check.txt', 'pwsh-test.txt', 'conn-test-out.txt', 'round2-done.txt',
];
const base = 'C:\\Users\\Sean xiao\\WorkBuddy\\2026-08-04-09-49-32\\qianfan-website\\';
for (const f of files) {
  try { fs.unlinkSync(base + f); } catch (e) {}
}
console.log('Cleanup done');
