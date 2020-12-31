const UA = {
    App: navigator.userAgent.indexOf('naitangApp') >= 0,
    WeiXin: navigator.userAgent.indexOf('MicroMessenger') >= 0,
    Android: navigator.userAgent.indexOf('Android') >= 0,
    iPhone: navigator.userAgent.indexOf('iPhone') >= 0
}
window.timeout = null
function replaceSchema(href) {
    const schema = [['xxx://app/group/', 'http://www.xxx.com/group/']]
    const len = schema.length
    for (let i = 0; i < len; i += 1) {
        href = href.replace(schema[i][0], schema[i][1])
    }
    return href
}
document.querySelector('body').addEventListener(
    'click',
    function (e) {
        let tg = e.target
        while (tg.nodeName.toUpperCase() !== 'BODY') {
            if (tg && tg.nodeName.toUpperCase() === 'A') {
                let href = tg.getAttribute('href')
                if (href.indexOf('xxx://') === 0) {
                    e.preventDefault()
                    if (UA.App) {
                        window.location.href = href
                    } else if (UA.WeiXin) {
                        window.location.href = 'http://a.app.qq.com/o/simple.jsp?pkgname=com.xxx'
                    } else if (UA.Android) {
                        window.location.href = href
                        window.timeout = setTimeout(function () {
                            window.location.href = 'http://a.app.qq.com/o/simple.jsp?pkgname=com.xxx'
                        }, 1000)
                    } else if (UA.iPhone) {
                        window.location.href = href
                        window.timeout = setTimeout(function () {
                            window.location.href = 'itms-apps://itunes.apple.com/cn/app/xxx/id0000000000?mt=8'
                        }, 1000)
                    } else {
                        const pchref = tg.getAttribute('data-pc')
                        href = pchref ? pchref : replaceSchema(href)
                        window.location.href = href
                    }
                }
                break
            } else {
                tg = tg.parentNode
            }
        }
    },
    false
)
function onVisibilityChanged() {
    const hidden = document.hidden || document.webkitHidden
    if (hidden && window.timeout) {
        window.clearTimeout(window.timeout)
    }
}
document.addEventListener('visibilitychange', onVisibilityChanged, false)
