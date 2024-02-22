const fs = require('node:fs')
const path = require('node:path')
const archiver = require('archiver')
const crypto = require('node:crypto')
const fse = require('fs-extra')

const sourceDir = 'pack'
const outDir = 'dist'
const outFileName = 'CSCMOE-MODPACK-Mod-Language-Patch-1.20.1'

const outDirPath = path.resolve(__dirname, '../', outDir)
const outFilePath = path.join(outDirPath, `${outFileName}.zip`)
const hashFilePath = path.join(outDirPath, 'hash.txt')

// 在初始时清空dist目录下的所有内容
fse.emptyDirSync(outDirPath)

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

  // 读取文件内容并计算SHA-1值
  const fileContent = fs.readFileSync(outFilePath)
  const sha1Hash = crypto.createHash('sha1').update(fileContent).digest('hex')

  // 输出SHA-1值到hash.txt文件
  fs.writeFileSync(hashFilePath, sha1Hash)

  console.log('打包完成！')
  console.log('输出至:', outFilePath)
  console.log('文件大小:', fileSizeInBytes, 'B', fileSizeInKB.toFixed(2), 'KB')
  console.log('SHA1:', sha1Hash)
})
