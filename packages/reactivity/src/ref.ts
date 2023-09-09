import { isObject } from "@vue/shared"
import { reactive } from "./reactivity"
import { trackEffect, triggerEffect } from "./effect"

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