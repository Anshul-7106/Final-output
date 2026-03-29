import('./server.js').catch(e => {
  const fs = require('fs');
  fs.writeFileSync('server_crash.log', String(e.stack || e.message));
  console.error(e);
});
