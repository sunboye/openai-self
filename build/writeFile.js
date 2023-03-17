import fs from 'fs'

function readPackageJson() {
  var _packageJson = fs.readFileSync('./package.json', 'utf-8')
  return JSON.parse(_packageJson)
}

function copyFileTo(source, target) {
  if (fs.existsSync(source)) {
    fs.copyFileSync(source, target)
  } else {
    console.error(`请注意：${source}文件不存在...`);
  }
}

function creatPackageJson() {
    let jsonData = readPackageJson();
    // delete jsonData.dependencies
    delete jsonData.scripts
    jsonData.private && delete jsonData.private
    jsonData.type && delete jsonData.type
    jsonData.devDependencies && delete jsonData.devDependencies
    jsonData.main = 'openai-self.cjs.js'
    jsonData.module = 'openai-self.esm.js'
    fs.writeFile('./dist/package.json', JSON.stringify(jsonData, null, 4), function (err) {
        if (err) console.error(err);
        console.log('打包完成，请进入dist目录，确认package.json文件信息，然后进行发布！');
    });
}
copyFileTo('./README.md', './dist/README.md')
copyFileTo('./LICENSE', './dist/LICENSE')
creatPackageJson();