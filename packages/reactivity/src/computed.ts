import { isFunction } from "@vue/shared";
import { ReactiveEffect, trackEffect, triggerEffect } from "./effect";

class ComputedRefImpl {
    public effect
    public _value
    public _dirty = true
    public dep = new Set()
    public __v_isRef = true // 表示后续我们可以增加拆包的逻辑
    constructor(getter, setter) {
        this.effect = new ReactiveEffect(getter, () => {
            if (!this._dirty) {
                this._dirty = true // 依赖的值发生变化了，会将dirty变为true

                // 当依赖的值发生变化了 也应该触发更新
                triggerEffect(this.dep)
            }
        })
    }
    get value() {
        // 在取值时 要对计算属性也做依赖收集
        // 如果计算属性实在effect重使用的要做依赖收集
        trackEffect(this.dep)

        if (this._dirty) {
            this._value = this.effect.run() // this._effect就是取值后的结果
            this._dirty = false
        }

        return this._value
    }
    set value(newVal) {
        this.setter(newVal)
    }
}

export function computed(getterOrOptions) {
    let getter;
    let setter;

    const isGetter = isFunction(getterOrOptions)
    if (isGetter) {
        getter = getterOrOptions
        setter = () => {
            console.log('warn')
        }
    } else {
        getter = getterOrOptions.get
        setter = getterOrOptions.set
    }

    // 把普通值包装成一个对象
    return new ComputedRefImpl(getter, setter)
}