function createInvoker(nextVal){
    const fn = (e) => {fn.value(e)}
    fn.value = nextVal // 真实的方法，后续球盖方法只需要修改fn.value 属性即可
    return fn 
}

export function patchEvent(el,rawName,nextVal){
    // vue event invoker
    const invokers = el._vei || (el._vei = {}) // 缓存列表

    let eventName = rawName.slice(2).toLowerCase()

    const existingInvoker = invokers[eventName]

    if(nextVal && existingInvoker){ // 有新值并且绑定过事件 ，需要换绑操作
        existingInvoker.value = nextVal
    }else{
        // 这里意味着不存在绑定过
        if(nextVal){
            // 有没有新的事件
            const invoker =  (invokers[eventName] = createInvoker(nextVal))
            el.addEventListener(eventName,invoker)
        }else if(existingInvoker){ // 没有新值，但是之前绑定过事件了
            // 没有新的事件
            el.removeEventListener(eventName, existingInvoker)
            invokers[eventName] = null
        }
    }
    // remove add
    // const fn = () => {fn.value()}
    // fn.value = fn2 => 巧妙解决换绑问题
    // el.addEventListener(key.slice(2).toLowerCase,fn)
}