import openApi from './src/index.js'
const openai = new openApi({
  apikey: "OPENAI_API_KEY", // openai的api_Key：必填，可前往openai官网申请
  // proxyUri: 'http://127.0.0.1:19180' // 代理服务器地址：非必填，科学上网时需要
  organizationId: '' // 组织机构Id：非必填
});
console.log('---------------正在执行测试程序-获取所有可用引擎-如果超时-请检查网络连接--------------')
console.log(await openai.getModels())