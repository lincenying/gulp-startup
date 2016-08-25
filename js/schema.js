/* global navigator, document, window */

var UA = {
    App: navigator.userAgent.indexOf('xxxApp') >= 0,
    WeiXin: navigator.userAgent.indexOf('MicroMessenger') >= 0,
    Android: navigator.userAgent.indexOf('Android') >= 0,
    iPhone: navigator.userAgent.indexOf('iPhone') >= 0
}
var timeout
function replaceSchema(href) {
    var schema = [
        ['xxx://app/question/', 'http://www.xxx.com/question/'],
        ['xxx://app/answer/', 'http://www.xxx.com/answer/'],
        ['xxx://app/topic/', 'http://www.xxx.com/topic/'],
        ['xxx://app/feature/', 'http://www.xxx.com/feature/'],
        ['xxx://app/group/', 'http://www.xxx.com/group/detail/'],
        ['xxx://app/post/', 'http://www.xxx.com/group/post/detail/']
    ]
    var len = schema.length
    for (var i = 0; i < len; i += 1) {
        href = href.replace(schema[i][0], schema[i][1])
    }
    return href
}
document.querySelector('body').addEventListener('click', function(e) {
    if (e.target && e.target.nodeName.toUpperCase() === 'A') {
        var href = e.target.getAttribute('href')
        if (href.indexOf('xxx://') === 0) {
            e.preventDefault()
            if (UA.App) {
                window.location.href = href
            } else if (UA.WeiXin) {
                window.location.href = 'http://a.app.qq.com/o/simple.jsp?pkgname=com.xxx'
            } else if (UA.Android) {
                window.location.href = href
                timeout = setTimeout(function() {
                    window.location.href = 'http://a.app.qq.com/o/simple.jsp?pkgname=com.xxx'
                }, 1000)
            } else if (UA.iPhone) {
                window.location.href = href
                timeout = setTimeout(function() {
                    window.location.href = 'itms-apps://itunes.apple.com/cn/app/xxx-xxx/id00000000?mt=8'
                }, 1000)
            } else {
                href = replaceSchema(href)
                window.location.href = href
            }
        }
    }
}, false)
function onVisibilityChanged() {
    var hidden = document.hidden || document.webkitHidden
    if (hidden && timeout) {
        window.clearTimeout(timeout)
    }
}
document.addEventListener('visibilitychange', onVisibilityChanged, false)
