import { isObject } from "@vue/shared"
import { reactive } from "./reactivity"
import { trackEffect, triggerEffect } from "./effect"

export function isRef(value){
    return !!(value && value.__v_isRef)
}

export function toReactive(value){
    return isObject(value) ? reactive(value): value
}

class RefImpl {
    public _value
    public dep = new Set()
    public __v_isRef = true
    constructor(public rawValue){
        // 如果传入的是对象会变为proxy
        this._value = toReactive(rawValue)
    }
    get value(){
        trackEffect(this.dep)
        return this._value
    }
    set value(newVal){
        if(newVal !== this.rawValue){
            this.rawValue = newVal
            this._value = toReactive(newVal)
            triggerEffect(this.dep)
        }
    }
}

export function ref(value){
    return new RefImpl(value)   
}

class ObjectRefImpl {
    public __v_isRef = true
    constructor(private _object, private _key){

    }
    get value(){
        return this._object[this._key]
    }
    set value(newVal){
        this._object[this._key] = newVal
    }
}

export function toRef(object, key){
    return new ObjectRefImpl(object,key)
}

export function toRefs(object){
    let ret = Array.isArray(object) ? new Array(Object.length) : Object.create(null);

    for(let key in object){
       ret[key] = toRef(object,key)
    }

    return ret
}

export function proxyRefs(object){
    return new Proxy(object,{
        get(target,key,receiver){
            let v = Reflect.get(target,key,receiver)

            return isRef(v)? v.value : v
        },
        set(target,key,value,receiver){
            let oldValue =  Reflect.get(target,key,receiver)
            // 如果是给ref赋值 应该给他的.value 赋值
            if(isRef(oldValue)){
                oldValue.value = value
                return true
            }else{
                // 其他情况直接赋值即可
                return Reflect.set(target,key,value,receiver)
            }
        }
    })
}