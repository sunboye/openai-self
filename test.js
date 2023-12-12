/*
 * @Author: yangss
 * @Position: 
 * @Date: 2023-03-24 16:55:45
 * @LastEditors: yangss
 * @LastEditTime: 2023-07-21 10:29:34
 * @FilePath: \openai-self\test.js
 */
import openApi from './src/index.js'
const openai = new openApi({
  apiKey: process.env.OPENAI_API_KEY || '', // openai的api_Key：必填，可前往openai官网申请
  proxy: '', // 代理服务器地址：非必填，科学上网时需要
  // sourceDir: '', // 内容缓存地址：非必填，默认值为./openai_cache
  // organizationId: '' // 组织机构Id：非必填
});
console.log(openai)
console.log('---------------正在执行测试程序-如果超时-请检查网络连接--------------')
// console.log(await openai.getModels())

// openai.getModels((res) => {console.log(res.data ? res.data.map(i => i.id) : res)})

// openai.createCustomRequest('/v1/models', (res) => { console.log(res.data ? res.data.map(i => i.id) : res) })

// console.log(await openai.createNomalCompletions('你好', {max_tokens: 400}))
// console.log(await openai.createNomalCompletions('你好'))
// openai.createNomalCompletions('你好',  {max_tokens: 400}, (res) => {console.log(res)})

// console.log(await openai.createChatCompletions('你好').data)


// const chatParams = {
//   context: 'test-key',
//   max_tokens: 500,
//   // max_str: 2000,
//   stream: true,
//   max_arr: 20
// }
// 清理sourceDir/context目录下文件
// openai.clearContext(chatParams.context)

// 清理souceDir目录文件
// openai.clearSourceDir()

// console.dir(await openai.createChatCompletions('hello', chatParams))
// console.dir(await openai.createChatCompletions('请记住，我的名字叫毛蛋', chatParams))
// await openai.createChatCompletions('请问我叫什么名字', chatParams, (res) => {console.log(res)})
// openai.createChatCompletions('请问我叫什么名字', chatParams, (res) => {console.log(res)})

// console.log(await openai.createCustomRequest({method: 'post', url: '/v1/completions', data: {
//   "model": "text-davinci-003",
//   "prompt": "Hello"
// }}))

// const param = {
//   local: true
// }
// openai.generateImage('baby', (res) => { console.log(res) })
// console.log(await openai.generateImage('A cute baby sea otter', param))

// 清理souceDir/image目录文件
// openai.clearSourceDir('image')

// console.log(openai.getSourceDir())
// openai.createInSourceDir('aaaa')

// openai.createTranscription(fs.createReadStream('./openai_source/audio/Nomeolvides.mp3'), (res) => { console.dir(res) })
// console.log(await openai.createTranscription('./openai_source/audio/Nomeolvides.mp3'))

// console.log(await openai.generateImage('A cute baby sea otter', param))