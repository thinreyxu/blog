// 存储各种时间格式，方便以后扩展
function makeTime (date = new Date()) {
  return {
    date,
    year: date.getFullYear(),
    month: date.getFullYear() + '/' + (date.getMonth() + 1),
    day: date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate(),
    minute: date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes()
  }
}

module.exports = { makeTime }
