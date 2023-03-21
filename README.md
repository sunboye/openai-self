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
  console.log(await openai.getModels()) // 获取openai所用可用引擎并打印到控制台

  ```
### 接口说明

[openai api文档官网入口](https://platform.openai.com/docs/api-reference)

调用方法             |   封装接口   |       参数         |   说明
:-------------------| :------------| :-----------------| :--------------
getModels           | /v1/models   | 无                | 获取openai所有可用模型信息
createCustomRequest | any          | 1. url: 类型-string，必填；<br/>2. option：类型-object，非必填，具体参数参考https模块的option参数;<br/> 3. callback：类型-function， 非必填<br/> | 自定义调用接口

### 例子
