const fs = require('fs-extra')
const chokidar = require('chokidar')

const sourceDir = 'pack' // 源文件夹路径
const destinationDir =
  'C:/Users/90732/Desktop/mc/.minecraft/versions/CSCMOE MODPACK/resourcepacks/pack' // 目标文件夹路径

// 启动时拷贝 pack 文件夹至指定文件夹
async function copyDirectory() {
  try {
    await fs.copy(sourceDir, destinationDir)
    console.log(`Copied ${sourceDir} to ${destinationDir}`)
  } catch (err) {
    console.error(`Error copying directory: ${err}`)
  }
}

// 监视文件变动并执行同步拷贝或删除
function watchDirectory() {
  const watcher = chokidar.watch(sourceDir, {
    persistent: true,
    ignoreInitial: true
  })

  watcher
    .on('add', async (path) => {
      const relativePath = path.replace(sourceDir, '')
      const destinationPath = `${destinationDir}${relativePath}`
      await fs.copy(path, destinationPath)
      console.log(`File ${path} has been added. Copied to ${destinationPath}`)
    })
    .on('change', async (path) => {
      const relativePath = path.replace(sourceDir, '')
      const destinationPath = `${destinationDir}${relativePath}`
      console.log('>>>', destinationDir)
      await fs.copy(path, destinationPath, { overwrite: true })
      console.log(`File ${path} has been changed. Copied to ${destinationPath}`)
    })
    .on('unlink', async (path) => {
      const relativePath = path.replace(sourceDir, '')
      const destinationPath = `${destinationDir}${relativePath}`
      await fs.remove(destinationPath)
      console.log(
        `File ${path} has been removed. Deleted from ${destinationPath}`
      )
    })
    .on('error', (error) => console.error(`Watcher error: ${error}`))
}

// 删除整个目录
async function removeDirectory() {
  try {
    await fs.remove(destinationDir)
    console.log(`Removed ${destinationDir}`)
  } catch (err) {
    console.error(`Error removing directory: ${err}`)
  }
}

// 启动脚本
async function start() {
  await copyDirectory()
  watchDirectory()
  process.on('SIGINT', async () => {
    await removeDirectory()
    process.exit()
  })
}

start()
