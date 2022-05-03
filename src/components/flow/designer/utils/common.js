import { Message } from 'ant-design-vue';

// 获取浏览器类型
export const getBrowserType = function() {
  let userAgent = navigator.userAgent;
  let isOpera = userAgent.indexOf("Opera") > -1;
  if (isOpera) {
    return 1;
  }

  if (userAgent.indexOf("Firefox") > -1) {
    return 2;
  }
  if (userAgent.indexOf("Chrome") > -1) {
    return 3;
  }
  if (userAgent.indexOf("Safari") > -1) {
    return 4;
  }
  if (
    userAgent.indexOf("compatible") > -1 &&
    userAgent.indexOf("MSIE") > -1 &&
    !isOpera
  ) {
    Message.error("IE浏览器支持性较差，推荐使用Firefox或Chrome");
    return 5;
  }
  if (userAgent.indexOf("Trident") > -1) {
    Message.error("Edge浏览器支持性较差，推荐使用Firefox或Chrome");
    return 6;
  }
};