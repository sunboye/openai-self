## openai-self

### 背景
  基于openai开放api封装，旨在可以更加简单的调用openai的api接口

### 安装
  `npm i openai-self`

### 开始
```javascript
  const OpenAI = require('openai-self');

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // openai的api_Key：必填，可前往openai官网申请
    // proxyUri: '' // 代理服务器地址：非必填，科学上网时需要。格式：'protocol://agent-ip:port'
    organizationId: '' // 组织机构Id：非必填
  });
  openai.getModels((res) => {console.log(res)}) // 获取openai所用可用引擎并打印到控制台
```
### 接口说明

[openai api文档官网入口](https://platform.openai.com/docs/api-reference)

调用方法             |   封装接口       |       参数         |   说明
:-------------------| :---------------| :-----------------| :--------------
getModels           | /v1/models      | 无                | 获取openai所有可用模型信息
createCustomRequest | any             | 1. url: 类型-string，必填；<br/>2. config：类型-object，非必填，具体参数参考axios的config参数;<br/> 3. callback：类型-function， 回调函数，非必填<br/> | 自定义调用接口
createNomalCompletions | /v1/completions | 1. msg: 类型-string，必填,对话消息；<br/>2. option：类型-object，非必填，具体参数参考openai官网对该接口的支持;<br/> 3. callback：类型-function， 回调函数，非必填<br/>               | 与openai对话，默认模型为‘text-davinci-003’

### 例子

> 使用commonJS规范导入模块时，推荐回调函数式写法，否则可能引起异常；
> 使用ES6规范导入模块时, async/await 和 回调函数接收返回数据都可以；

- getModels()
```javascript
  // 第一种用法
  openai.getModels((res) => {console.log(res)})
  // 第二种用法：仅支持import导入模块时使用
  console.log(await openai.getModels()) // 获取openai所用可用引擎
  
```
- createCustomRequest()
```javascript
  // 第一种使用方法: 通过callback处理数据
  openai.createCustomRequest('/v1/models', (res) => { console.log(res) })
  // 第二种使用方法: async/await
  console.log(await openai.createCustomRequest('/v1/models'))
  // 第三种使用方法：传入config对象，具体参数参照axios的config参数
  const params = {
    model: "text-davinci-003",
    prompt: "Hello"
  }
  console.log(await openai.createCustomRequest({method: 'post', url: '/v1/completions', data: params}))
```


- createNomalCompletions()
```javascript
  // 第一种使用方法: 通过callback处理数据
  openai.createNomalCompletions('你好', (res) => { console.log(res) })
  // 第二种使用方法: async/await
  console.log(await openai.createNomalCompletions('你好'))
  // 第三种使用方法：传入options，具体参数参考openai官网对该接口的支持
  const params = {
    model: "text-davinci-003",
    prompt: "Hello",
    max_tokens： 100
  }
  console.log(await openai.createNomalCompletions('你好', params))
```