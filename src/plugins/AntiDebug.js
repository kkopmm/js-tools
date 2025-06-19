;(function () {
    "use strict"

    // 创建一个命名空间，防止与其他脚本冲突
    window.TampermonkeyUtils = window.TampermonkeyUtils || {}
    window.TampermonkeyUtils.enableAntiDebugger = function () {
        const $setInterval = setInterval
        const $toString = Function.prototype.toString

        // 劫持 setInterval
        setInterval = new Proxy($setInterval, {
            apply: function (target, thisArg, argumentsList) {
                // 检查第一个参数（通常是回调函数）的字符串表示是否包含 "debugger"
                let callbackFunction = argumentsList[0]
                if (typeof callbackFunction === "function") {
                    let s = callbackFunction.toString()
                    if (s.indexOf("debugger") !== -1) {
                        argumentsList[0] = () => {}
                    }
                }
                return Reflect.apply(target, thisArg, argumentsList)
            },
        })

        // 劫持 Function.prototype.toString 以隐藏修改
        Object.defineProperty(Function.prototype, "toString", {
            value: function toString() {
                if (this === Function.prototype.toString) {
                    return "function toString() { [native code] }"
                }
                if (this === setInterval) {
                    return "function setInterval() { [native code] }"
                }
                // 对于其他函数，调用原始的 toString
                return $toString.apply(this, arguments)
            },
            configurable: true,
        })
        console.log("Tampermonkey: Anti-debugger feature has been enabled.")
    }

    // 你也可以在这里添加一个 disableAntiDebugger 函数，用于撤销修改
    // 但撤销对内置函数的劫持通常很复杂且不推荐，因为可能已经有其他代码依赖了被劫持的版本。
})()
