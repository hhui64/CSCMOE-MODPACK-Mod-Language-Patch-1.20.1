const fs = require('node:fs')
const path = require('node:path')
const archiver = require('archiver')
const crypto = require('node:crypto')
const fse = require('fs-extra')
const api = require('./api')

const sourceDir = 'pack'
const outDir = 'dist'
const outFileName = 'CSCMOE-MODPACK-Mod-Language-Patch-1.20.1'
const resourcepackName = `${outFileName}.zip`

const outDirPath = path.resolve(__dirname, '../', outDir)
const outFilePath = path.join(outDirPath, resourcepackName)
const manifestFilePath = path.join(outDirPath, 'manifest.json')
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
  const fileContent = fs.readFileSync(outFilePath)

  const manifest = api.generateManifest(fileContent, resourcepackName)

  console.log('打包完成！')
  console.log('输出至:', outFilePath)
  console.log(
    '文件大小:',
    manifest.fileSize,
    'B',
    (manifest.fileSize / 1024).toFixed(2),
    'KB'
  )
  console.log('SHA1:', manifest.hash.sha1)

  fs.writeFileSync(manifestFilePath, JSON.stringify(manifest, undefined, 2))
  fs.writeFileSync(hashFilePath, manifest.hash.sha1)
})
