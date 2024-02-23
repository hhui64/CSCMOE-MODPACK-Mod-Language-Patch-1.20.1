const crypto = require('node:crypto')

const generateManifest = (buffer, fileName = '') => {
  const bf = Buffer.from(buffer)
  const fileSizeInBytes = bf.byteLength
  const sha1Hash = crypto.createHash('sha1').update(bf).digest('hex')
  const date = new Date().toISOString()

  return {
    fileName,
    fileSize: fileSizeInBytes,
    hash: {
      sha1: sha1Hash
    },
    time: date
  }
}

module.exports = {
  generateManifest
}
