import openApi from './src/index.js'
const openai = new openApi({
  apikey: process.env.OPENAI_API_KEY || '', // openai的api_Key：必填，可前往openai官网申请
  // proxy: 'http://127.0.0.1:19180', // 代理服务器地址：非必填，科学上网时需要
  organizationId: '' // 组织机构Id：非必填
});
console.log(openai)
console.log('---------------正在执行测试程序-如果超时-请检查网络连接--------------')
// console.log(await openai.getModels())
// await openai.getModels()
// openai.createCustomRequest('/v1/models', (res) => { console.log(res.data ? res.data.map(i => i.id) : res) })

// console.log(await openai.createNomalCompletions('你好', {max_tokens: 400}))
// console.log(await openai.createNomalCompletions('你好'))
// openai.createNomalCompletions('你好',  {max_tokens: 400}, (res) => {console.log(res)})

// console.log(await openai.createChatCompletions('你好'))

// 关联上下文
// const messages = [
//   {role: 'user', content: '请记住，我的名字叫毛蛋'}
// ]
// const resMsg = await openai.createChatCompletions(messages, {max_tokens: 500})
// console.log(resMsg)
// messages.push({role: 'assistant', content: resMsg})
// messages.push({role: 'user', content: '请问我叫什么名字'})
// console.dir(messages)
// console.log(await openai.createChatCompletions(messages))

// openai.createChatCompletions('你好', (res) => {console.log(res)})

// console.log(await openai.createCustomRequest({method: 'post', url: '/v1/completions', data: {
//   "model": "text-davinci-003",
//   "prompt": "Hello"
// }}))