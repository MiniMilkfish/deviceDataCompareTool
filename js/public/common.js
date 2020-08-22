/**
 * 获取现在的时间并格式化
 * @param {String} type
 *      a  标准时间格式 2015-10-10 10:10:10 (默认)
 *      b  14位时间格式 20151010101010
 *      c  13 位数时间戳
 *      d  10 位数时间戳
 *      e  2015.10.10
 * 		f  2015-10-10 10:10
 * 		g  8位时间格式 20151010
 *      h  2015-10-10
 *      u  ISO 时间格式 2018-04-08T02:43:12.511Z
 *      ff 小时：分钟， 示例：10:10
 *      默认格式为标准格式
 * @param {String} [date] 10、13位时间戳、UTC时间、ISO时间
 * */
function getFormatDateNew(type, date) {
    if (/^1\d{9}/.test(date) && date.toString().length === 10) date = date * 1000;
    if (/^1\d{9}/.test(date) || /^1\d{12}/.test(date)) {
        date = typeof date === 'number' ? date : parseInt(date, 10);
    }
    let D = date !== void 0 ? new Date(date) : new Date();
    const _ = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09'],
        y = D.getFullYear(),
        m = D.getMonth() + 1,
        d = D.getDate(),
        h = D.getHours(),
        i = D.getMinutes(),
        s = D.getSeconds();
    switch (type) {
        case 'a':
            return [y, _[m] || m, _[d] || d].join('-') + ' ' + [_[h] || h, _[i] || i, _[s] || s].join(':');
        case 'b':
            return [y, _[m] || m, _[d] || d, _[h] || h, _[i] || i, _[s] || s].join('');
        case 'c':
            return Number(D);
        case 'd':
            return Math.floor(Number(D) / 1000);
        case 'e':
            return [y, _[m] || m, _[d] || d].join('.');
        case 'f':
            return [y, _[m] || m, _[d] || d].join('-') + ' ' + [_[h] || h, _[i] || i].join(':');
        case 'g':
            return [y, _[m] || m, _[d] || d].join('');
        case 'h':
            return [y, _[m] || m, _[d] || d].join('-');
        case 'u':
            return D.toISOString();
        case 'ff':
            return [_[h] || h, _[i] || i].join(':');
        default:
            return [y, _[m] || m, _[d] || d].join('-') + ' ' + [_[h] || h, _[i] || i, _[s] || s].join(':');
    }
}