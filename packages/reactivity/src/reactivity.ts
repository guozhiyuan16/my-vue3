import { isObject } from "@vue/shared";
import { mutableHandlers } from "./handlers";

export const enum ReactiveFlags {
    IS_REACTIVE = '_v_isReactive'
}

const reactiveMap = new WeakMap();

export function reactive(target){
    
    // reactive 只能处理对象类型的数据，不是对象不处理
    if(!isObject(target)) return target

    // 缓存可以采用映射表 { {target} -> proxy }
    let existingProxy = reactiveMap.get(target)

    if(existingProxy) return existingProxy // 代理过直接返回

    if(target[ReactiveFlags.IS_REACTIVE]){
        return target
    }

    const proxy = new Proxy(target,mutableHandlers)
        
    reactiveMap.set(target,proxy) 

    // 1） 在vue3.0的时候 会创建一个反向映射表 { 代理的结果 -> 原内容 }
    // 2) 目前不用创建反向映射表， 用的方式是，r如果这个对象被代理过了说明已经被proxy拦截过了
    return proxy
}

// 是不是一个响应式对象
export function isReactive(value){
    return value[ReactiveFlags.IS_REACTIVE]
}