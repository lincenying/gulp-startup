/* global navigator, document, window */

var UA = {
    App: navigator.userAgent.indexOf('naitangApp') >= 0,
    WeiXin: navigator.userAgent.indexOf('MicroMessenger') >= 0,
    Android: navigator.userAgent.indexOf('Android') >= 0,
    iPhone: navigator.userAgent.indexOf('iPhone') >= 0
}
var timeout
function replaceSchema(href) {
    var schema = [
        ['naitang://app/question/', 'http://www.naitang.com/question/'],
        ['naitang://app/answer/', 'http://www.naitang.com/answer/'],
        ['naitang://app/topic/', 'http://www.naitang.com/topic/'],
        ['naitang://app/feature/', 'http://www.naitang.com/feature/'],
        ['naitang://app/group/', 'http://www.naitang.com/group/detail/'],
        ['naitang://app/post/', 'http://www.naitang.com/group/post/detail/'],
        ['naitang://app/openHome', 'http://www.naitang.com/app']
    ]
    var len = schema.length
    for (var i = 0; i < len; i += 1) {
        href = href.replace(schema[i][0], schema[i][1])
    }
    return href
}
document.querySelector('body').addEventListener('click', function(e) {
    var tg = (window.event) ? e.srcElement : e.target
    while (tg.nodeName.toUpperCase() !== 'BODY') {
        if (tg && tg.nodeName.toUpperCase() === 'A') {
            var href = tg.getAttribute('href')
            if (href.indexOf('naitang://') === 0) {
                e.preventDefault()
                if (UA.App) {
                    window.location.href = href
                } else if (UA.WeiXin) {
                    window.location.href = 'http://a.app.qq.com/o/simple.jsp?pkgname=com.naitang'
                } else if (UA.Android) {
                    window.location.href = href
                    timeout = setTimeout(function() {
                        window.location.href = 'http://a.app.qq.com/o/simple.jsp?pkgname=com.naitang'
                    }, 1000)
                } else if (UA.iPhone) {
                    window.location.href = href
                    timeout = setTimeout(function() {
                        window.location.href = 'itms-apps://itunes.apple.com/cn/app/nai-tang/id1031435011?mt=8'
                    }, 1000)
                } else {
                    var pchref = tg.getAttribute('data-pc')
                    href = pchref ? pchref : replaceSchema(href)
                    window.location.href = href
                }
            }
            break
        } else {
            tg = tg.parentNode
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
