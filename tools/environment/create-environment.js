const fs = require('fs')
const path = require('path')

const basePath = path.join(__dirname, '..', '..')

const folders = [basePath]

const getDirectories = source =>
  fs.readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => path.join(source, dirent.name))


folders.push(
  ...getDirectories(path.join(basePath, 'apps')),
  ...getDirectories(path.join(basePath, 'libs')),
  ...getDirectories(path.join(basePath, 'tools'))
)

function getEnvVariablesFromReadme (folder) {
  const lines = fs.readFileSync(
    path.join(folder, 'README.md'),
    'utf-8'
    ).split('\n')
  let variables = ''

  let saveLine = false
  for (const line of lines) {
    if (line.indexOf('```env') > -1) {
      saveLine = true
      continue
    }

    if (saveLine && line.indexOf('```') > -1) {
      saveLine = false
      continue
    }

    if (saveLine) {
      variables += `${line}\n`
    }
  }

  return variables
}

for (const folder of folders) {
  const exists = fs.existsSync(path.join(folder, 'README.md'))
  if (!exists) {
    continue
  }

  const envContent = getEnvVariablesFromReadme(folder)

  if (envContent) {
    fs.writeFileSync(
      path.join(folder, '.env'),
      envContent
    )
  }
}
