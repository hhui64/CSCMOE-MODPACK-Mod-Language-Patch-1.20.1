const fs = require('fs-extra')
const path = require('node:path')
const { rootDir } = require('../api')

// 接收参数
const args = process.argv.slice(2)
const oldJsonPath = args[0]
const newJsonPath = args[1]

// 检查参数是否提供
if (!oldJsonPath || !newJsonPath) {
  console.error('Please provide paths for both old and new JSON files.')
  process.exit(1)
}

// 读取 JSON 文件
async function readJson(jsonPath) {
  try {
    const data = await fs.readFile(jsonPath)
    return JSON.parse(data)
  } catch (error) {
    console.error(`Error reading JSON file ${jsonPath}: ${error}`)
    process.exit(1)
  }
}

// 比较两个 JSON 文件的差异
async function compareJson() {
  const oldJson = await readJson(oldJsonPath)
  const newJson = await readJson(newJsonPath)

  const diff = {
    missingKeys: [],
    differentValues: {}
  }

  // 查找旧 JSON 中缺少的键值对
  for (const key in newJson) {
    if (!(key in oldJson)) {
      diff.missingKeys.push(key)
    } else if (oldJson[key] !== newJson[key]) {
      diff.differentValues[key] = {
        old: oldJson[key],
        new: newJson[key]
      }
    }
  }

  return diff
}

// 保存差异到文件
async function saveDiffToFile(diff) {
  const cacheDir = path.resolve(rootDir, '.cache')
  const diffFilePath = `${cacheDir}/diff.json`

  try {
    await fs.ensureDir(cacheDir)
    await fs.writeJson(diffFilePath, diff, { spaces: 2 })
    console.log(`Diff saved to ${diffFilePath}`)
  } catch (error) {
    console.error(`Error saving diff to file: ${error}`)
    process.exit(1)
  }
}

// 主函数
async function main() {
  const diff = await compareJson()
  await saveDiffToFile(diff)
}

main()
