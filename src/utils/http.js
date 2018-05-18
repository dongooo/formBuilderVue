/**
 * 数据服务封装
 * 默认读取后台数据，可开启debugger读取本地模拟数据
 * 使用方式：this.http.get("alias",{},fnCallBack)/this.http.post("alias",{},fnCallBack)
 * this.http.get("alias",fnCallBack)/this.http.post("alias",fnCallBack)
 */

import axios from 'axios'

class Http {

  constructor(){
    //this.VERSION = "v1.0.1";
    this.debugger = false;
    this.responseFormat = true;
    this.ENV = {'local':this.debugger};
    this.api = {};
    this.apiConfig = {"domainUrl":"http://127.0.0.1:8080/api/",'contentType':'application/json;charset=utf-8',"header":{}};

    this.hint = Object.freeze({
        400: '1、语义有误，当前请求无法被服务器理解。除非进行修改，否则客户端不应该重复提交这个请求。2、请求参数有误。',
        404: '请求失败，请求所希望得到的资源未被在服务器上发现。',
        405: '请求行中指定的请求方法不能被用于请求相应的资源。',
        413: '服务器拒绝处理当前请求，因为该请求提交的实体数据大小超过了服务器愿意或者能够处理的范围。此种情况下，服务器可以关闭连接以免客户端继续发送此请求。如果这个状况是临时的，服务器应当返回一个 Retry-After 的响应头，以告知客户端可以在多少时间以后重新尝试。',
        414: '请求的URI 长度超过了服务器能够解释的长度，因此服务器拒绝对该请求提供服务。',
        500: '服务器遇到了一个未曾预料的状况，导致了它无法完成对请求的处理。一般来说，这个问题都会在服务器的程序码出错时出现。',
        501: '服务器不支持当前请求所需要的某个功能。当服务器无法识别请求的方法，并且无法支持其对任何资源的请求。',
        502: '作为网关或者代理工作的服务器尝试执行请求时，从上游服务器接收到无效的响应。',
        503: '由于临时的服务器维护或者过载，服务器当前无法处理请求。',
        504: '作为网关或者代理工作的服务器尝试执行请求时，未能及时从上游服务器（URI标识出的服务器，例如HTTP、FTP、LDAP）或者辅助服务器（例如DNS）收到响应。',
        505: '服务器不支持，或者拒绝支持在请求中使用的 HTTP 版本。这暗示着服务器不能或不愿使用与客户端相同的版本。响应中应当包含一个描述了为何版本不被支持以及服务器支持哪些协议的实体。',
        600: '未知错误',
    })
  }

  noop(){}

  setDebugger(_boolean){
    this.debugger = this.ENV['local'] = !!_boolean;
  }

  setContentType(_string=''){
    let vaildContentType = ['application/json;charset=utf-8','application/x-www-form-urlencoded;charset=utf-8'];
    if(vaildContentType[0].toLowerCase()!==_string.toLowerCase()&&_string.toLowerCase() !== vaildContentType[1].toLowerCase()) {
      console.error('设置的contentType无效！可设置如：：'+vaildContentType[0]+'或者'+vaildContentType[1]);
      return !1;
    }
    this.apiConfig['contentType'] = _string;
  }

  setResponseFormat(_boolean){
    this.responseFormat = _boolean;
  }

  getQueryValue(name){
    let reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    let subString = location.href.split('?')[1]||'';
    let r = subString.match(reg);
    if(r!=null)return  decodeURI(r[2]); return null;
  }

  getRootPath(_substring){
      let currentPath=window.document.location.href;
      let pathName=window.document.location.pathname;
      let pos=currentPath.indexOf(pathName);
      let localhostPaht=currentPath.substring(0,pos);
      return(localhostPaht+'/'+_substring+'/');
  }

  getDevice(){
    let u = navigator.userAgent, app = navigator.appVersion;
    let isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1; //android终端或者uc浏览器
    let isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
    let deviceName = 'pc';

    if(isAndroid){
      deviceName = "android";
    }else if(isiOS){
      deviceName = "ios";
    }

    return deviceName;
  }

  error(_errors){
    //为移动端调试准备
    if(this.getDevice() === 'pc'){
      console.error(_errors);
    }else {
      if(typeof _errors === "Object"&&_errors instanceof Object){
        //todo
        console.error(_errors);
        //alert(JSON.stringify(_errors))
      }else{
        console.error(_errors);
       // alert(_errors);
      }
    }
  }

  setDomainUrl(_preUrl = ""){
    
    this.apiConfig['domainUrl'] = this.ENV['local']&&_preUrl === ''?this.apiConfig['domainUrl']:_preUrl;
  }
  setApi(_id,_url,_domain,_format,mock){
    let _domainUrl,isHasDomain,_d,isLastSlash,isHasFormat,isFormat;
     isHasDomain = (''+_domain)===''||typeof _domain === 'undefined';
     isHasFormat = _format===''||typeof _format === 'undefined';

     if(!isHasFormat&&typeof _format !== 'boolean'){
       this.error('期望别名为<'+_id+'>的接口format属性为Boolean类型，eg:<format:true/false>')
     }

      isFormat = isHasFormat?this.responseFormat:_format;
    if(!isHasDomain){
      _d = ''+_domain;
      isLastSlash = _d.charAt(_d.length-1) === "/";
      _domainUrl = (isLastSlash?_d.substring(0,_d.length-1):_d)+"/";
    }else {
      _domainUrl = "";
    }
    this.api[_id] = {"url":(_domainUrl||this.apiConfig['domainUrl'])+_url,"mock":(_domainUrl||this.apiConfig['domainUrl'])+mock||"","domain":_domain||this.apiConfig['domainUrl'],"format":isFormat};
    return this.api;
  }
  getApi(_id,_target='url'){
    if(typeof _id === 'undefined'){
      return this.api;
    }else if(this.api.hasOwnProperty(_id)&&this.api[_id].hasOwnProperty(_target)){
      return this.api[_id][_target];
    }else{
      this.error(_id+"--->"+"无法找到该别名下的"+_target+"属性，请确认是否配置！");
    }
  }

  getMock(_id){
    if(this.api.hasOwnProperty(_id)&&this.api[_id].hasOwnProperty('mock')){
      return this.api[_id]['mock'];
    }else{
      this.error(_id+"--->"+"找不到该别名下的接口及模拟数据，请确认是否配置！");
    }
  }

  transGetParams(_params){
    //OBEJCT格式处理成get方式所需要的数据格式，统一传递的参数都为JSON对象
    let _resultParams = "";
    let _count = 0;
    for(let _key in _params){
      _resultParams += (_count===0?'':'&')+_key+'='+_params[_key];
      ++_count;
    }
    return _resultParams;
  }

  createMockRequest(){
    let xmlHttp;
    if (window.XMLHttpRequest) {
      xmlHttp = new XMLHttpRequest();
      if (xmlHttp.overrideMimeType)
        xmlHttp.overrideMimeType('text/xml');
    } else if (window.ActiveXObject) {
      try {
        xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
      } catch (e) {
        try {
          xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
        } catch (e) {
        }
      }
    }else {
      console.error('请检查是否禁用了浏览器上的某些功能！');
    }
    return xmlHttp;
  }

  //todo 实现发起一次模拟请求
  doMockRequest(_method,_url,_params,_fnChange){
    let xmlHttp;
      if(_method === 'get'){
        xmlHttp = this.createMockRequest();
        xmlHttp.open("GET", _url, true);// 异步处理返回
        xmlHttp.onreadystatechange = function () {
          //console.log(xmlHttp);
        };
        xmlHttp.setRequestHeader("Content-Type",this.apiConfig['contentType']);
        xmlHttp.send(this.transGetParams(_params));
      }else if(_method === 'post'){
        xmlHttp.open("POST", _url, true);
        xmlHttp.onreadystatechange = _fnChange;
        xmlHttp.setRequestHeader("Content-Type",this.apiConfig['contentType']);
        xmlHttp.send(xml);
      }else if(_method === 'upload'){
        xmlHttp.open("POST", _url, true);
        xmlHttp.onreadystatechange = _fnChange;
        xmlHttp.send(xml);
      }

  }

  setMutiApi(_arr){
    if(_arr instanceof Array){
      for(let i=0,len=_arr.length;i<len;i++){
        if(this.ENV['local']&&_arr[i].hasOwnProperty('mock')){
          this.setApi(_arr[i]['id'],_arr[i]['url'],_arr[i]['domain'],_arr[i]['format'],_arr[i]['mock']);
        }else{
          this.setApi(_arr[i]['id'],_arr[i]['url'],_arr[i]['domain'],_arr[i]['format']);
        }

      }
    } else{
       this.error(JSON.stringify(_arr)+'--->'+'参数必须为数组！期望是::[{},{}...]');
    }
  }

  setRequestHeader(_object){
    if(typeof _object == 'object'){
      if(_object instanceof Object){
        this.apiConfig['header'] = Object.assign(this.apiConfig['header'],_object);
        return _object;
      }else{
        throw Error("参数不可以是Array类型");
      }
    }else{
      throw Error("参数必须为OBJECT类型");
    }
  }

  hasProperties(_obj,_arr){
    let _out = true;
    for(let i=0,len=_arr.length;i<len;i++){
      if(typeof _obj[_arr[i]] === 'undefined'){
        _out = false;
        break;
      }
    }
    return _out;
  }

  jsonpHandle(_id,_url,_params,_fn){
    const that = this;
    window[_id] = function (data) {
      if(_fn) _fn.call(that,data);
    }

    let script=document.createElement('script');
    let target=document.getElementsByTagName('script')[0]||document.head;
    let params=this.transGetParams(_params);
      script.src = _url+'?'+params+'&callback='+encodeURIComponent(_id)+'&_t='+Math.random();
      target.parentNode.insertBefore(script,target);
    //todo 超时

  }

  handle(_id,_method,_data,_callback){
    //console.log(this.arguments)
    let that = this;
    if(typeof _data === "function"){
      _callback = _data;
      _data = {};
    }
    let method = _method;
    let url = this.ENV['local']?this.getMock(_id):this.getApi(_id);
    let isResponseFormat = this.getApi(_id,'format');
    // if(this.ENV['local']){
    //   //todo 模拟后台请求,剥离业务代码与测试代码
    //   //console.log(_callback.callee.arguments);
    //
    //    let promise = new Promise(function (resolve,reject) {
    //      _callback = typeof _callback === 'undefined'?function(_in){return _in}:_callback;
    //
    //       //that.doMockRequest(method,url,_data);
    //      let timer = setTimeout(function () {
    //        let mockData = _callback.call(that,that.getMock(_id));
    //        resolve(mockData);
    //        clearTimeout(timer);
    //      },100+Math.floor(Math.random()*1000));
    //
    //
    //    })
    //   return promise;
    // }
    let requestConfig = {
      url:url,
      method:method,
      headers:this.apiConfig['header']
    }

    if(method === 'jsonp'){
      return that.jsonpHandle(_id,url,_data,_callback);
    }

    method === 'get'?requestConfig["params"] = _data:requestConfig["data"] = _data;

    return axios.request(requestConfig)
      .then(function (response) {
        let resData = response['data'];

        if(!isResponseFormat){
          return _callback.call(that,resData);
        }

        let isRequired = that.hasProperties(resData,['resultCode','data','errMsg']);
        if(!isRequired) return that.error('请返回指定格式的数据！！！期望是::{"resultCode":"","data":"","errMsg":""}');
        if(resData['resultCode'] === 1){
          return _callback.call(that,resData['data']);
        }else {
          that.error('捕获后台运行中异常代码：：'+resData['resultCode']+'异常信息::'+resData['errMsg']);
        }

      })
      .catch(function (error) {
        //todo 异常统一处理，暂时只抛出
          if(error.hasOwnProperty('message')&&!error.hasOwnProperty('response')){
            that.error(error.message);
          }
          if (error.hasOwnProperty('response')&&typeof error.response === 'undefined') {
              that.error(error+'网络异常：您可能断网了,或者存在跨域，请检查！');
          } else if(error.hasOwnProperty('response')&&typeof error.response !== 'undefined') {
              let err = "",statusCode = error.response.status;
              if(that.hint.hasOwnProperty(statusCode)){
                err = that.hint[statusCode]
              }else{
                err = '前端捕获请求前异常：：'+error
              }
              that.error(error.response.status+' --- '+err);
          }

      })


  }

  get(_id,_data,_then){
    return this.handle(_id,'get',_data,_then);
  }

  post(_id,_data,_then){
    return this.handle(_id,'post',_data,_then);
  }

  upload(_id,_data,_then){
    return this.handle(_id,'post',_data,_then);
  }

  jsonp(_id,_data,_then){
    return this.handle(_id,'jsonp',_data,_then);
  }

}

export const http = new Http();



