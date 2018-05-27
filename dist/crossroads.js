"use strict";var _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},EventEmitter=require("events").EventEmitter,http=require("http"),https=require("https"),util=require("util"),_=require("lodash"),defaults=require("./defaults"),defaultHost=defaults.host,defaultPort=defaults.port,callCrossroads=function(s,r,i){return i||"function"!=typeof r||(i=r,r=""),r||(r=""),new Promise(function(o,n){var e=getProtocolModule(s).request(s,function(e){if(e.setEncoding("utf-8"),200!==e.statusCode)return i&&"function"==typeof i?i(e.statusCode):n(e.statusCode);var t="";e.on("data",function(e){t+=e}),e.on("end",function(){return"yes"===(t=JSON.parse(t)).errors?3010===t.errorCode?s.tokenExpiryHandler({options:s,body:r,callback:i}).then(o).catch(n):i&&"function"==typeof i?i(t):n(t):"no"===t.errors?(delete t.errors,i&&"function"==typeof i?i(null,t):o(t)):void 0})});e.on("error",function(e){if(i&&"function"==typeof i)return i(e);n(e)}),e.write(r),e.end()})};function getProtocol(e){return 443===e.port?"https":"http"}function getProtocolModule(e){return 443===e.port?https:http}function Crossroads(f){var i,n=this,e=this.majorVersion=f.majorVersion?f.majorVersion:0;this.accessToken=f.accessToken,this.refreshToken=f.refreshToken,this.tokenExpiryHandler=function(o){return n.user.tokens().then(function(e){n.accessToken=e.teachPIAccessToken,n.emit("accessTokenUpdated",n.accessToken);var t=o.options;return t.headers.Authorization="Basic "+new Buffer(f.apiKey+":"+n.accessToken).toString("base64"),callCrossroads(t,o.body,o.callback)})},this.defaultOptions={host:f.host||defaultHost,port:f.port||defaultPort,basePath:"/api/v"+e,filesAPIPath:"/files/v"+e,method:"GET",tokenExpiryHandler:f.tokenExpiryHandler?f.tokenExpiryHandler:this.tokenExpiryHandler,headers:{Authorization:"Basic "+new Buffer(f.apiKey).toString("base64"),version:f.version?f.version:"0.2.0"}},this.updateAccessToken=function(e){this.accessToken=e},this.call=function(e,t,o){return callCrossroads(e,t,o)},this.get=function(e,t,o){o||"function"!=typeof t||(o=t);var n={},s="";(t=t||{}).params&&(e+="?",_.forEach(t.params,function(e,t){s+="&"+t+"="+e}),e+=s);var r={path:this.defaultOptions.basePath+e};_.merge(n,this.defaultOptions,r);var i=t.refreshToken||t.accessToken||this.accessToken,a="Basic "+new Buffer(f.apiKey+":"+i).toString("base64");return n.headers.Authorization=a,callCrossroads(n,o)}.bind(this),this.post=function(e,t,o){o||(o=t);var n=void 0;(t=t||{}).body&&(n=JSON.stringify(t.body));var s={},r={method:"POST",path:this.defaultOptions.basePath+e,headers:{"Content-Type":"application/json","Content-Length":Buffer.byteLength(n)}};_.merge(s,this.defaultOptions,r);var i=t.accessToken||this.accessToken,a="Basic "+new Buffer(f.apiKey+":"+i).toString("base64");return s.headers.Authorization=a,callCrossroads(s,n,o)}.bind(this),this.put=function(e,t,o){t||(o=t);var n=void 0;t.body&&(n=JSON.stringify(t.body));var s={},r={method:"PUT",path:this.defaultOptions.basePath+e,headers:{"Content-Type":"application/json","Content-Length":Buffer.byteLength(n)}};return _.merge(s,this.defaultOptions,r),t.accessToken&&(s.headers.Authorization="Basic "+new Buffer(f.apiKey+":"+t.accessToken).toString("base64")),callCrossroads(s,n,o)}.bind(this),this.delete=function(e,t,o){o||(o=t);var n={},s="";t.params&&(e+="?",_.forEach(t.params,function(e,t){s+="&"+t+"="+e}),e+=s);var r={method:"DELETE",path:this.defaultOptions.basePath+e,headers:{"Content-Type":"application/json"}};return _.merge(n,this.defaultOptions,r),t.accessToken&&(n.headers.Authorization="Basic "+new Buffer(f.apiKey+":"+t.accessToken).toString("base64")),callCrossroads(n,o)}.bind(this),this.user=(i=this,{sessions:function(e,n){var s=JSON.stringify(e),r={},t={method:"POST",path:i.defaultOptions.basePath+"/user/sessions",headers:{"Content-Type":"application/json","Content-Length":Buffer.byteLength(s)}};return _.merge(r,i.defaultOptions,t),new Promise(function(o,t){callCrossroads(r,s).then(function(e){var t=e.tokens;return i.accessToken=t.teachPIAccessToken,i.refreshToken=t.teachPIRefreshToken,n&&"function"==typeof n?n(null,e):o(e)}).catch(function(e){return n&&"function"==typeof n?n(e):t(e)})})},tokens:function(e,t){t||"function"!=typeof e||(t=e);var o={},n=e&&e.refreshToken||i.refreshToken,s="Basic "+new Buffer(f.apiKey+":"+n).toString("base64"),r={path:i.defaultOptions.basePath+"/user/tokens",headers:{Authorization:s}};return _.merge(o,i.defaultOptions,r),callCrossroads(o,t)}}),this.search=function(e,t){var o=e.q,n=e.context,s=e.filters,r=JSON.stringify({q:o,context:n,filters:s}),i={headers:{}},a={method:"POST",headers:{"Content-Type":"application/json","Content-Length":Buffer.byteLength(r)},path:this.defaultOptions.basePath+"/search"};_.merge(i,this.defaultOptions,a);var u=e.accessToken||this.accessToken,c="Basic "+new Buffer(f.apiKey+":"+u).toString("base64");return i.headers.Authorization=c,callCrossroads(i,r,t)}.bind(this),this.status=function(e,t){t||(t=e);var o={},n={path:this.defaultOptions.basePath+"/status",headers:{Authorization:"Basic "+new Buffer(f.apiKey).toString("base64")}};return _.merge(o,this.defaultOptions,n),callCrossroads(o,t)}.bind(this),this.files=function(e){var o=e.fileName,t=this.defaultOptions,n=t.host,s=t.port,r=t.filesAPIPath,i=getProtocol({port:s})+"://"+n+":"+s+r+"?fileName="+o,a=e.accessToken||this.accessToken,u={headers:{Authorization:"Basic "+new Buffer(f.apiKey+":"+a).toString("base64")}};"object"===("undefined"==typeof window?"undefined":_typeof(window))&&fetch(i,u).then(function(e){return e.blob()}).then(function(e){return URL.createObjectURL(e)}).then(function(e){var t=document.createElement("a");t.href=e,t.setAttribute("download",o),t.style.display="none",document.body.appendChild(t),setTimeout(function(){t.click(),document.body.removeChild(t)},100)})}.bind(this)}util.inherits(Crossroads,EventEmitter),module.exports=Crossroads;