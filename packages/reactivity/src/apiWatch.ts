// watch api用很多 常见写法就是监控一个函数的返回值 根据返回值的变化触发对应的函数
// watch 可以传递一个响应式对象 可以监控到对象的变化触发回调

// watch = effect + 包装 watchEffect = effect

import { isFunction, isObject } from "@vue/shared";
import { isReactive } from "./reactivity";
import { ReactiveEffect } from "./effect";

// = 深拷贝 seen防止死循环
function traverse(value,seen = new Set()) {
    if(!isObject(value)){
        return value
    }

    // 如果已经循环了这个对象了，那么再循环会导致死循环
    if(seen.has(value)){
        return value
    }
    seen.add(value)
    for(const key in value){
        traverse(value[key],seen) // 触发属性的getter
    }
    return value
}

export function watch(source,cb,options){
    return dowatch(source,cb,options)
}

export function watchEffect(source,options){
    return dowatch(source,null,options)
}

export function dowatch(source, cb){
    // 1）source 是一个响应式对象
    // 2）source 是一个函数

    // effect() + scheduler
    // effect 应该传递一个函数
    let getter;
    if(isReactive(source)){
        // 如果是响应式对象就需要包装成一个函数
        getter = () => traverse(source)
    }else if(isFunction(source)){
        // 对于传递的本来就是函数而言不需要变化
        getter = source
    }
    let oldVal;
    let clear
    let onCleanup = (fn) => {
        clear = fn
    }
    // 里面的属性就会收集当前的effect
    // 如果数据变化后会执行对应的scheduler方法
    const job = () => {
        if(cb){
            if(clear) clear() // 下次执行得我时候讲上次的执行一下啊
            const newVal = effect.run()
            cb(newVal,oldVal,onCleanup)
            oldVal = newVal
        }else{
            effect.run() // watchEffect只需要运行自身就可以了
        }
    }
    const effect = new ReactiveEffect(getter,job)
    oldVal = effect.run() // 会让属性和effect关联
}

// watch 执行 ，传入的state 是 响应式对象 getter = () => traverse(source)

// 可以变成 effect(()=>{},{scheduler:()=>{}})

// 上述的本质是 const effect = new ReactiveEffect(()=> traverse(source), scheduler)

// 调用effect.run traverse执行去取值，会收集依赖，返回老状态

// state.name 发行改变， 找到name 收集的 effect, effect.scheduler 存在，调用 scheduler