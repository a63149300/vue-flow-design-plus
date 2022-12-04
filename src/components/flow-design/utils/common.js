import { Message } from 'ant-design-vue'
import { idType as flowIdType } from '../config/flow.js'

// 获取浏览器类型
export const getBrowserType = function () {
  let userAgent = navigator.userAgent
  let isOpera = userAgent.indexOf('Opera') > -1
  if (isOpera) {
    return 1
  }

  if (userAgent.indexOf('Firefox') > -1) {
    return 2
  }
  if (userAgent.indexOf('Chrome') > -1) {
    return 3
  }
  if (userAgent.indexOf('Safari') > -1) {
    return 4
  }
  if (
    userAgent.indexOf('compatible') > -1 &&
    userAgent.indexOf('MSIE') > -1 &&
    !isOpera
  ) {
    Message.error('IE浏览器支持性较差，推荐使用Firefox或Chrome')
    return 5
  }
  if (userAgent.indexOf('Trident') > -1) {
    Message.error('Edge浏览器支持性较差，推荐使用Firefox或Chrome')
    return 6
  }
}

export let utils = {
  seqNo: 1,
  consoleLog: function (strArr) {
    let log = ''
    for (let i = 0, len = strArr.length; i < len; i++) {
      log += strArr[i] + '\n'
    }
    console.log('%c' + log, 'color: red; font-weight: bold;')
  },
  getId: function () {
    let idType = flowIdType
    if (typeof idType === 'string') {
      if (idType === 'uuid') {
        return this.getUUID()
      } else if (idType === 'time_stamp') {
        return this.getTimeStamp()
      }
    } else if (idType instanceof Array) {
      if (idType[0] === 'sequence') {
        return this.getSequence(idType[1])
      } else if (idType[0] === 'time_stamp_and_sequence') {
        return this.getTimeStampAndSequence(idType[1])
      } else if (idType[0] === 'custom') {
        return idType[1]()
      }
    }
  },
  getUUID: function () {
    let s = []
    let hexDigits = '0123456789abcdef'
    for (let i = 0; i < 36; i++) {
      s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
    }
    s[14] = '4'
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1)
    s[8] = s[13] = s[18] = s[23] = '-'

    let uuid = s.join('')
    return uuid.replace(/-/g, '')
  },
  getTimeStamp: function () {
    return new Date().getTime()
  },
  getSequence: function (seqNoLength) {
    let zeroStr = new Array(seqNoLength).fill('0').join('')
    return (zeroStr + (this.seqNo++)).slice(-seqNoLength)
  },
  getTimeStampAndSequence: function (seqNoLength) {
    return this.getTimeStamp() + this.getSequence(seqNoLength)
  },
  add: function (a, b) {
    let c, d, e
    try {
      c = a.toString().split('.')[1].length
    } catch (f) {
      c = 0
    }
    try {
      d = b.toString().split('.')[1].length
    } catch (f) {
      d = 0
    }
    return e = Math.pow(10, Math.max(c, d)), (this.mul(a, e) + this.mul(b, e)) / e
  },
  sub: function (a, b) {
    let c, d, e
    try {
      c = a.toString().split('.')[1].length
    } catch (f) {
      c = 0
    }
    try {
      d = b.toString().split('.')[1].length
    } catch (f) {
      d = 0
    }
    return e = Math.pow(10, Math.max(c, d)), (this.mul(a, e) - this.mul(b, e)) / e
  },
  mul: function (a, b) {
    let c = 0, d = a.toString(), e = b.toString()
    try {
      c += d.split('.')[1].length
    } catch (f) {}
    try {
      c += e.split('.')[1].length
    } catch (f) {}
    return Number(d.replace('.', '')) * Number(e.replace('.', '')) / Math.pow(10, c)
  },
  div: function (a, b) {
    let c, d, e = 0, f = 0
    try {
      e = a.toString().split('.')[1].length
    } catch (g) {}
    try {
      f = b.toString().split('.')[1].length
    } catch (g) {}
    return c = Number(a.toString().replace('.', '')), d = Number(b.toString().replace('.', '')), this.mul(c / d, Math.pow(10, f - e))
  }
}

// 设置流程配置
export function setFlowConfig (config, settingConfig) {
  // 画布
  config.defaultStyle.containerScale.onceNarrow = settingConfig.containerScale.onceNarrow
  config.defaultStyle.containerScale.onceEnlarge = settingConfig.containerScale.onceEnlarge
  // 连线
  config.jsPlumbInsConfig.Connector[0] = settingConfig.cls.linkType
  config.jsPlumbInsConfig.PaintStyle.stroke = settingConfig.cls.linkColor
  config.jsPlumbInsConfig.PaintStyle.strokeWidth = settingConfig.cls.linkThickness
  // 其它设置
  config.defaultStyle.isOpenAuxiliaryLine = settingConfig.other.isOpenAuxiliaryLine
  config.defaultStyle.alignSpacing.horizontal = settingConfig.other.horizontal
  config.defaultStyle.alignSpacing.vertical = settingConfig.other.vertical
  config.defaultStyle.movePx = settingConfig.other.movePx

  return config
}
