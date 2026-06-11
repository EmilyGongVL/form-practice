const crypto = require('crypto');

function generateIdentifier(dbId, userId) {
  const timestamp = Math.floor(Date.now() / 1000);
  const hash = crypto.createHash('md5').update(String(userId)).digest('hex');
  return `${dbId}-FB-${timestamp}-${hash}`;
}

module.exports = { generateIdentifier };
