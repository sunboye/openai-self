const initParams = (str, obj, func, key) => {
  // 没传obj
  if (typeof obj === 'function') {
    func = obj
    obj = {}
  }
  // 没传str或者str不为string类型
  if (typeof str === 'object') {
    if (Array.isArray(str)) {
      // 适配/v1/chat/completions接口
      if (!obj) {
        obj = {}
      }
    } else {
      obj = str
      str = obj[key]
    }
  }

  let params = {}
  if (obj !== null && typeof obj === 'object') {
    params = Object.assign(params, obj, {[key]: str})
  } else if (typeof str === 'string') {
    params = Object.assign(params, {[key]: str})
  } else {
    params = Object.assign({}, params, {[key]: str})
  }
  params.callback = func
  return params
}

const getHttpOptions = (enumConf) => {
  const baseOptions = Object.assign({}, enumConf)
  if (enumConf &&  Object.keys(enumConf).length) {
    baseOptions.method = enumConf.method || 'get'
    if (enumConf.url.indexOf('http://') === 0 || enumConf.url.indexOf('https://') === 0) {
      baseOptions.url = enumConf.url
    } else {
      baseOptions.url = `${enumConf.url.indexOf('/') === 0 ? '' : '/'}${enumConf.url}`
    }
    if (enumConf.headers) {
      baseOptions.headers = Object.assign({}, enumConf.headers)
    }
  } else {
    baseOptions.method = 'get'
  }
  return baseOptions

}

const createRequest = (config) => {
  return new Promise((reslove, reject) => {
    $axios.request(config).then((res) =>{
      reslove(res)
    }).catch(e => {
      reslove(e)
    })
  })
}

const readContext = (param) => {
  const keyword = param.context
  try {
    const defaultDir = path.resolve('./source_context')
    if (!fs.existsSync(defaultDir) || !fs.statSync(defaultDir).isDirectory()) {
      fs.mkdirSync(defaultDir)
    }
    const filePath = path.resolve(`${defaultDir}/${keyword}.json`)
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const buf = fs.readFileSync(filePath)
      const json = JSON.parse(buf)
      return Array.isArray(json) ? json.concat(param.messages) : param.messages
    } else {
      return param.messages
    }
  } catch (error) {
    return param.messages
  }
}

const saveContext = (keyword, data) => {
  try {
    const defaultDir = path.resolve('./source_context')
    if (!fs.existsSync(defaultDir) || !fs.statSync(defaultDir).isDirectory()) {
      fs.mkdirSync(defaultDir)
    }
    const filePath = path.resolve(`${defaultDir}/${keyword}.json`)
    fs.writeFileSync(filePath, JSON.stringify(data))
  } catch (error) {
    console.log(new Error('save Context failed !!!'))
  }
}
// const returnResData = (data, call) => {
//   if (call && typeof call === 'function') {
//     call(data)
//   } else {
//     return data
//   }
// }
// 暴露方法
export default {
  initParams,
  getHttpOptions,
  createRequest,
  // returnResData,
  readContext,
  saveContext
}
