import fs from 'fs'
import path from 'path'
import $axios  from 'axios'
import httpsProxyAgent from 'https-proxy-agent'
import { BASE_PATH, sourceSubDir, ResImageType } from './enum.js'
import pkg from '../package.json' assert { type: "json" }

// $axios.interceptors.request.use(function (config) {
//   // 在发送请求之前做些什么
//   return config;
// }, function (error) {
//   // 对请求错误做些什么
//   return Promise.reject(new Error(error));
// });

// 添加响应拦截器
$axios.interceptors.response.use(function (response) {
  // 对响应数据做点什么
  return {
    ...response.data,
    status: response.status,
    message: response.statusText,
    success: response.status === 200
  };
}, function (error) {
  // 对响应错误做点什么
  if (error.response && error.response.data) {
    const errData = error.response.data
    return {
      ...errData.error,
      status: error.response.status,
      success: error.response.status === 200
    }
  } else {
    return {
      code: error.code,
      message: error.message,
      status: 400,
      cause: error.cause,
      success: false
    }
  }
});

const axiosDefault = (config) => {
  $axios.defaults.baseURL = config.BASE_PATH ||  BASE_PATH
  $axios.defaults.headers.common['Authorization'] = `Bearer ${config.apiKey}`
  if (config.organizationId) {
    $axios.defaults.headers.common['OpenAI-Organization'] = config.organizationId
  }
  if (!checkWindow()) {
    $axios.defaults.headers.common['User-Agent'] = `OpenAI/NodeJS/${pkg.author}/${pkg.version}`
    if (config.proxy) {
      $axios.defaults.httpsAgent = new httpsProxyAgent(config.proxy).on('error', err => {
        throw err
      })
    }
  }
}

const initParams = (str, obj, func, key) => {
  // 没传obj
  if (typeof obj === 'function') {
    func = obj
    obj = {}
  }
  // 没传str或者str不为string类型, isStream适配传入stream情况
  if (typeof str === 'object') {
    if (Array.isArray(str) || isStream(str)) {
      // Array 适配/v1/chat/completions接口
      // isStream 适配/v1/audio/transcriptions接口 传stream情况
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

const checkWindow = () => {
  return typeof window !== 'undefined'
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

const createDir = (dir) => {
  const pathDir = path.join(dir)
  try {
    if (!fs.existsSync(pathDir)) {
      fs.mkdirSync(pathDir)
    } 
  } catch (error) {
    console.log(error)
    throw error
  }
}

const checkSourceDir = (config, dir) => {
  const pathTemp = path.join(config.sourceDir, dir || '')
  if (!fs.existsSync(pathTemp)) {
    const sep = path.sep
    const pathArr = pathTemp.split(sep)
    let curPath = ''
    if (pathArr && pathArr.length) {
      pathArr.forEach(item => {
        curPath = curPath ? path.join(curPath, item) : item
        createDir(curPath)
      })
    }
    return fs.existsSync(path.join(pathTemp))
  }
  return true
}
const getSourceDir = (config) => {
  return path.join(config.sourceDir)
}
const readContext = (config, param) => {
  const keyword = param.context
  if (checkSourceDir(config, sourceSubDir.context)) {
    try {
      const defaultDir = path.join(config.sourceDir, sourceSubDir.context)
      if (!fs.existsSync(defaultDir) || !fs.statSync(defaultDir).isDirectory()) {
        fs.mkdirSync(defaultDir)
      }
      const filePath = path.join(defaultDir, `${keyword}.json`)
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const buf = fs.readFileSync(filePath)
        const json = JSON.parse(buf)
        const paramMessages = Array.isArray(json) ? json.concat(param.messages) : param.messages
        const maxStr = parseInt(param.max_str)
        const maxArr = parseInt(param.max_arr)
        let temp = []
        if (param.max_str && maxStr) {
          if (paramMessages && paramMessages.length > 1) {
            const reverse = paramMessages.reverse()
            let strLen = 0
            reverse.forEach(item => {
              if (item.content && item.content.length) {
                strLen = strLen + item.content.length
                strLen <= maxStr && temp.push(item)
              }
            })
          }
        } else if (param.max_arr && maxArr) {
          temp = paramMessages && (paramMessages.length > maxArr) ? paramMessages.slice(paramMessages.length - maxArr) : paramMessages
        }
        return temp && temp.length ? maxStr ? temp.reverse() : temp : param.messages
      } else {
        return param.messages
      }
    } catch (error) {
      return param.messages
    }   
  } else {
    throw(new Error('create context of sourceDir failed!!!'))
  }
}

const saveContext = (config, keyword, data) => {
  if (checkSourceDir(config, sourceSubDir.context)) {
    try {
      const defaultDir = path.join(config.sourceDir, sourceSubDir.context)
      if (!fs.existsSync(defaultDir) || !fs.statSync(defaultDir).isDirectory()) {
        fs.mkdirSync(defaultDir)
      }
      if (keyword && data) {
        const filePath = path.join(defaultDir, `${keyword}.json`)
        fs.writeFileSync(filePath, JSON.stringify(data))
      }
    } catch (error) {
      console.log(new Error('save Context failed !!!'))
    }
  } else {
    throw(new Error('create context of sourceDir failed!!!'))
  }
}

const clearContext = (config, keyword) => {
  const defaultDir = path.join(config.sourceDir, sourceSubDir.context)
  if (fs.existsSync(defaultDir)) {
    let fileKeys = []
    if (keyword) {
      fileKeys = Array.isArray(keyword) ? keyword.map(k => k + '.json') || [] : [`${keyword}.json`]
    } else {
      fileKeys = fs.readdirSync(defaultDir)
    }
    fileKeys.forEach(f => {
      try {
        const filePath = path.join(defaultDir, f)
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          fs.unlinkSync(filePath)
        } else {
          console.log('context file is no exist!!!')
        }
      } catch (e) {
        console.error(e)
      }
    })
  }
}

const removeSourceDir = (dir) => {
  if (fs.existsSync(path.join(dir))) {
    const fileNames = fs.readdirSync(dir);
    let childPath = null
    fileNames.forEach(item => {
      childPath = path.join(dir, item)
      if (fs.statSync(childPath).isDirectory()) {
        removeSourceDir(childPath)
        fs.rmdirSync(childPath)
      } else {
        fs.unlinkSync(childPath)
      }
    })
  } else {
    console.log(`path ${dir} is not exist`)
  }
}

const clearSourceDir = (config, dir) => {
  const rmDir = dir ? path.join(config.sourceDir, dir) : path.join(config.sourceDir)
  // console.log(rmDir)
  if (fs.existsSync(rmDir)) {
    if (fs.statSync(rmDir).isDirectory()) {
      removeSourceDir(rmDir)
    } else {
      fs.unlinkSync(rmDir)
    }
  }
}

const baseImageSave = (config, base) => {
  if (checkSourceDir(config, sourceSubDir.image)) {
    const baseArr = base.length ? base.map(item => item[ResImageType.b64]) || [] : []
    try {
      const imagePath = []
      baseArr.forEach(item => {
        const binaryData = Buffer.from(item, 'base64');
        const fileName = new Date().getTime() + '.png'
        const filePath = path.resolve(config.sourceDir, sourceSubDir.image, fileName);
        fs.writeFileSync(filePath, binaryData)
        imagePath.push({local_path: filePath})
      })
      return imagePath
    } catch (error) {
      console.log(error)
      console.log('save image Error, return response data')
      return base
    }
  } else {
    throw(new Error('create image of sourceDir failed!!!'))
  }
}

const isStream = (stream) => {
  return stream !== null &&
  typeof stream === "object" &&
  typeof stream.pipe === "function"
}
  
const getFileStream = (value) => {
  if (isStream(value)) {
    return value
  } else {
    const filePath =  path.resolve(value)
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile) {
      return fs.createReadStream(filePath)
    } else {
      return null
    }
  }
}
// 暴露方法
export default {
  axiosDefault,
  checkWindow,
  initParams,
  getHttpOptions,
  createRequest,
  createInSourceDir: checkSourceDir,
  getSourceDir,
  readContext,
  saveContext,
  clearContext,
  clearSourceDir,
  baseImageSave,
  getFileStream
}
