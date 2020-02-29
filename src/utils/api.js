require('es6-promise').polyfill()
import axios from 'axios'

axios.defaults.withCredentials = true //跨域
axios.defaults.timeout = 10000
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'

//axios请求拦截
// axios.interceptors.request.use(config=>{
//     //为请求头添加对象，添加token验证的Authorization字段
//     config.headers.Authorization=window.sessionStorage.getItem('token');
//     return config;
// })

//get请求
export const requestGet=(url,params={})=>{
  return new Promise((resolve, reject) => {
    axios.get(url, params).then(res => {
      resolve(res)//注意res是axios封装的对象，res.data才是服务端返回的信息
    }).catch(error => {
      reject(error)
    })
  })
}
//get请求不带参数
export const requestQuickGet=(url)=>{
  return new Promise((resolve, reject) => {
    axios.get(url).then(res => {
      resolve(res)
    }).catch(error => {
      reject(error)
    })
  })
}
//post请求
export const requestPostForm=(url,params={})=>{
  return new Promise((resolve, reject) => {
    axios.post(url, params).then(res => {
      resolve(res)
    }).catch(error => {
      reject(error)
    })
  })
}
//post请求
export const requestPostLogin=(url,params={})=>{
  return new Promise((resolve, reject) => {
    let ret = ''
    for (let it in params) {
      ret += encodeURIComponent(it) + '=' + encodeURIComponent(params[it]) + '&'
    }

    axios.post(url, ret, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    }).then(res => {
      resolve(res)
    }).catch(error => {
      reject(error)
    })
  })
}
//put请求
export const requestPut=(url,params={})=>{
  return new Promise((resolve, reject) => {
    axios.put(url, params).then(res => {
      resolve(res)
    }).catch(error => {
      reject(error)
    })
  })
}
//delete请求
export const requestDelete=(url,params={})=>{
  return new Promise((resolve, reject) => {
    axios.delete(url, params).then(res => {
      resolve(res)
    }).catch(error => {
      reject(error)
    })
  })
}
