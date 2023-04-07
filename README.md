## openai-self

### 背景
  基于openai开放api封装，旨在可以更加简单的调用openai的api接口

### 开始

> 建议node版本大于16，低版本可能异常报错

`npm install` 安装依赖

`npm run test` 执行测试代码，运行test.js，运行前需要注意填写apiKey、proxy参数

### 打包和发布

`npm run build` 执行打包脚本
打包成功后会得到这样一个提示
> 打包完成，请进入dist目录，确认package.json文件信息，然后进行发布！

### 接口说明

[openai api文档官网入口](https://platform.openai.com/docs/api-reference)

调用方法             |   封装接口       |       参数         |   说明
:-------------------| :---------------| :-----------------| :--------------
getModels           | /v1/models      | 无                | 获取openai所有可用模型信息
createNomalCompletions | /v1/completions | 1. msg: 类型-string，必填,对话消息；<br/>2. option：类型-object，非必填，具体参数参考openai官网对该接口的支持;<br/> 3. callback：类型-function， 回调函数，非必填<br/>               | 与openai对话，默认模型为‘text-davinci-003’，默认最大token数为350
createChatCompletions | /v1/chat/completions | 1. msg: 类型-string 或 array，必填,对话消息；数组类型格式参照官网<br/>2. option：类型-object，非必填，具体参数参考openai官网对该接口的支持;<br/> 3. callback：类型-function， 回调函数，非必填<br/>               | 与openai对话，默认模型为‘gpt-3.5-turbo’，默认最大token数为350
createCustomRequest | any             | 1. url: 类型-string，必填；<br/>2. config：类型-object，非必填，具体参数参考axios的config参数;<br/> 3. callback：类型-function， 回调函数，非必填<br/> | 自定义调用接口

### 工具方法
调用方法             |      参数                  |   说明
:-------------------| :--------------------------| :--------------
clearContext        | context: String类型，非必填 | 清除聊天产生的上下文文件，传参，删除固定context.json文件，不传参，则删除sourceDir/context文件下所有json文件
clearSourceDir      | dir: String类型，非必填     | 清除聊天产生的文件，传参，删除sourceDir/dir目录下的文件，不传参，则删除sourceDir目录下所有文件
### 示例

> 使用commonJS规范导入模块时，推荐回调函数式写法，否则可能引起异常；
> 使用ES6规范导入模块时, async/await 和 回调函数接收返回数据都可以；

- getModels()
```javascript
  // 第一种用法
  openai.getModels((res) => {console.log(res)})
  // 第二种用法：仅支持import导入模块时使用
  console.log(await openai.getModels()) // 获取openai所用可用引擎
  
```

- createNomalCompletions()
```javascript
  // 第一种使用方法: 通过callback处理数据
  openai.createNomalCompletions('你好', (res) => { console.log(res) })
  // 第二种使用方法: async/await
  console.log(await openai.createNomalCompletions('你好'))
  // 第三种使用方法：传入options，具体参数参考openai官网对该接口的支持
  const params = {
    // model: 'text-davinci-003', //默认模型：text-davinci-003
    prompt: 'Hello',
    max_tokens： 100
  }
  console.log(await openai.createNomalCompletions('你好', params))
```

- createChatCompletions()
```javascript
  // 第一种使用方法: 通过callback处理数据
  openai.createChatCompletions('你好', (res) => {console.log(res)})
  // 第二种使用方法: async/await
  console.log(await openai.createChatCompletions('你好'))
  // 第三种使用方法：传入options，具体参数参考openai官网对该接口的支持
  const params = {
    // model: 'gpt-3.5-turbo', //默认模型：gpt-3.5-turbo
    // messages: [{role: "user", "content": "Hello!"}]
    max_tokens： 100
  }
  console.log(await openai.createChatCompletions('你好', params))

  // 关联上下文
  const chatParams = {
    context: 'test-key', // 关联上下文参数，以此字段为文件名存放聊天数据
    max_tokens: 500
  }
  // 需要删除聊天数据需主动调用delectContext
  openai.clearContext(chatParams.context)

  openai.createChatCompletions('你好', chatParams)
  openai.createChatCompletions('请记住，我的名字叫毛蛋', chatParams)
  openai.createChatCompletions('请问我叫什么名字', chatParams, (res) => {console.log(res.content)}) // ==> 您告诉过我您的名字是毛蛋。

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
