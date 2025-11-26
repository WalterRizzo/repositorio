const fs = require('fs');
const path = require('path');

const dotWrangler = path.join(process.cwd(), '.wrangler', 'deploy');
const cfgFile = path.join(dotWrangler, 'config.json');

const desired = { configPath: '../../wrangler.json', auxiliaryWorkers: [] };

try {
  if (!fs.existsSync(dotWrangler)) {
    fs.mkdirSync(dotWrangler, { recursive: true });
    console.log('Created .wrangler/deploy directory');
  }

  let current = null;
  if (fs.existsSync(cfgFile)) {
    try {
      current = JSON.parse(fs.readFileSync(cfgFile, 'utf8'));
    } catch (e) {
      console.warn('Unable to parse existing .wrangler/deploy/config.json — overwriting.');
    }
  }

  if (!current || current.configPath !== desired.configPath) {
    fs.writeFileSync(cfgFile, JSON.stringify(desired, null, 2));
    console.log('Updated .wrangler/deploy/config.json to use the repository root wrangler.json');
  } else {
    console.log('.wrangler/deploy/config.json already points to repository root wrangler.json');
  }
} catch (err) {
  console.error('Failed to ensure .wrangler/deploy/config.json:', err.message);
  process.exitCode = 2;
}
