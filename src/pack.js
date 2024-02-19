const fs = require('node:fs')
const path = require('path')
const archiver = require('archiver')

const sourceDir = 'pack'
const outDir = 'dist'
const outFileName = 'CSCMOE-MODPACK-Mod-Language-Patch-1.20.1'

const outDirPath = path.resolve(__dirname, '../', outDir)
const outFilePath = path.join(outDirPath, `${outFileName}.zip`)

if (!fs.existsSync(outDirPath)) {
  fs.mkdirSync(outDirPath)
}

const output = fs.createWriteStream(outFilePath)

const archive = archiver('zip', {
  zlib: { level: 0 }
})

archive.pipe(output)

function addFilesToArchive(directory) {
  const files = fs.readdirSync(directory)

  files.forEach((file) => {
    const filePath = path.join(directory, file)

    if (fs.statSync(filePath).isDirectory()) {
      addFilesToArchive(filePath)
    } else {
      console.log('添加', filePath)
      archive.file(filePath, { name: path.relative(sourceDir, filePath) })
    }
  })
}

addFilesToArchive(sourceDir)

archive.finalize()

archive.on('error', (err) => {
  throw err
})

output.on('close', () => {
  const fileSizeInBytes = output.bytesWritten
  const fileSizeInKB = fileSizeInBytes / 1024
  const fileSizeInMB = fileSizeInKB / 1024

  console.log('打包完成！')
  console.log('输出至:', outFilePath)
  console.log('文件大小 (Bytes):', fileSizeInBytes, 'bytes')
  console.log('文件大小 (KB):', fileSizeInKB.toFixed(2), 'KB')
  console.log('文件大小 (MB):', fileSizeInMB.toFixed(2), 'MB')
})
