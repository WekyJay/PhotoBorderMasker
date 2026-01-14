export type ExifDict = Record<string, any>

export const EXIF_FIELDS: string[] = [
  'Make','Model','LensMake','LensModel','Software','Artist','Copyright',
  'DateTimeOriginal','ExposureTime','ShutterSpeedValue','FNumber','ApertureValue',
  'ISO','PhotographicSensitivity','SensitivityType','FocalLength','FocalLengthIn35mmFormat',
  'ExposureBiasValue','ExposureProgram','ExposureMode','MeteringMode','LightSource','WhiteBalance','Flash',
  'ColorSpace','Saturation','Contrast','Sharpness','BrightnessValue','SceneCaptureType','SubjectDistance','DigitalZoomRatio',
  'ImageWidth','ImageHeight','Orientation','GPSLatitude','GPSLongitude','GPSAltitude','GPSLatitudeRef','GPSLongitudeRef'
]

export const EXIF_LABELS: Record<string,string> = {
  Make:'品牌', Model:'型号', LensMake:'镜头品牌', LensModel:'镜头型号', Software:'软件', Artist:'作者', Copyright:'版权',
  DateTimeOriginal:'时间', ExposureTime:'快门', ShutterSpeedValue:'快门值', FNumber:'光圈', ApertureValue:'光圈值',
  ISO:'ISO', PhotographicSensitivity:'感光度', SensitivityType:'感光类型', FocalLength:'焦距', FocalLengthIn35mmFormat:'等效焦距',
  ExposureBiasValue:'曝光补偿', ExposureProgram:'曝光程序', ExposureMode:'曝光模式', MeteringMode:'测光模式', LightSource:'光源', WhiteBalance:'白平衡', Flash:'闪光灯',
  ColorSpace:'色彩空间', Saturation:'饱和度', Contrast:'对比度', Sharpness:'锐度', BrightnessValue:'亮度值', SceneCaptureType:'场景类型', SubjectDistance:'对焦距离', DigitalZoomRatio:'数码变焦',
  ImageWidth:'宽度', ImageHeight:'高度', Orientation:'方向', GPSLatitude:'纬度', GPSLongitude:'经度', GPSAltitude:'海拔', GPSLatitudeRef:'纬度参考', GPSLongitudeRef:'经度参考'
}

const pad = (x: any) => String(x).padStart(2,'0')

export const formatDate = (d: any) => {
  if (!d) return '-'
  const dt = new Date(d)
  if (isNaN(dt.getTime())) return String(d)
  return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`
}

const meteringMap: Record<number,string> = { 1:'平均',2:'中央重点',3:'点测',4:'多点',5:'矩阵',6:'局部',255:'其他' }
const programMap: Record<number,string> = { 1:'手动',2:'程序自动',3:'光圈优先',4:'快门优先',5:'创意',6:'动作',7:'人像',8:'风景' }

export const formatExifField = (key: string, value: any, exif?: ExifDict): string => {
  if (value == null || value === '') return '-'
  switch (key) {
    case 'ExposureTime': {
      const n = Number(value)
      return n >= 1 ? `${n.toFixed(1)}s` : `1/${Math.round(1/n)}`
    }
    case 'FNumber': {
      return `ƒ${Number(value).toFixed(1)}`
    }
    case 'FocalLength': {
      return `${Math.round(Number(value))}mm`
    }
    case 'FocalLengthIn35mmFormat': {
      return `${Math.round(Number(value))}mm`
    }
    case 'DateTimeOriginal': {
      return formatDate(value)
    }
    case 'ExposureBiasValue': {
      const v = Number(value)
      return `${v>0?'+':''}${v.toFixed(1)} EV`
    }
    case 'MeteringMode': {
      const n = Number(value)
      return meteringMap[n] || String(value)
    }
    case 'ExposureProgram': {
      const n = Number(value)
      return programMap[n] || String(value)
    }
    case 'WhiteBalance': {
      const n = Number(value)
      return n===1?'手动':n===0?'自动':String(value)
    }
    case 'Flash': {
      const n = Number(value)
      return (n & 1) ? '已触发' : '未触发'
    }
    case 'ColorSpace': {
      const n = Number(value)
      return n===1?'sRGB':n===65535?'未校准':String(value)
    }
    case 'ImageWidth':
    case 'ImageHeight': {
      return `${Number(value)}px`
    }
    case 'GPSLatitude':
    case 'GPSLongitude': {
      return Array.isArray(value) ? value.map(Number).join(',') : String(value)
    }
    default:
      return String(value)
  }
}

export const buildExifDisplay = (exif: ExifDict): Array<{key:string,label:string,value:string}> => {
  return EXIF_FIELDS.map(k => ({ key: k, label: EXIF_LABELS[k] || k, value: formatExifField(k, exif[k], exif) }))
}
