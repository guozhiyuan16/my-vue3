// packages/shared/src/index.ts
var isObject = (value) => {
  return value !== null && typeof value === "object";
};
var isFunction = (value) => {
  return typeof value === "function";
};

// packages/reactivity/src/effect.ts
var activeEffect = void 0;
function cleanupEffect(effect2) {
  const { deps } = effect2;
  for (let i = 0; i < deps.length; i++) {
    deps[i].delete(effect2);
  }
  effect2.deps.length = 0;
}
var ReactiveEffect = class {
  constructor(fn, scheduler) {
    this.fn = fn;
    this.scheduler = scheduler;
    this.parent = void 0;
    this.active = true;
    this.deps = [];
  }
  run() {
    if (!this.active) {
      return this.fn();
    }
    try {
      this.parent = activeEffect;
      activeEffect = this;
      cleanupEffect(this);
      return this.fn();
    } finally {
      activeEffect = this.parent;
      this.parent = void 0;
    }
  }
  stop() {
    if (this.active) {
      this.active = false;
      cleanupEffect(this);
    }
  }
};
function effect(fn, options = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler);
  _effect.run();
  const runner = _effect.run.bind(_effect);
  runner.effect = _effect;
  return runner;
}
var targetMap = /* @__PURE__ */ new WeakMap();
function track(target, key) {
  if (activeEffect) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
    }
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(key, dep = /* @__PURE__ */ new Set());
    }
    trackEffect(dep);
  }
}
function trackEffect(dep) {
  let shouldTrack = !dep.has(activeEffect);
  if (shouldTrack) {
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
  }
}
function trigger(target, key, newVal, oldVal) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }
  const dep = depsMap.get(key);
  triggerEffect(dep);
}
function triggerEffect(dep) {
  const effects = [...dep];
  effects && effects.forEach((effect2) => {
    if (effect2 !== activeEffect) {
      if (effect2.scheduler) {
        effect2.scheduler();
      } else {
        effect2.run();
      }
    }
  });
}

// packages/reactivity/src/handlers.ts
var mutableHandlers = {
  get(target, key, receiver) {
    if (key === "_v_isReactive" /* IS_REACTIVE */) {
      return true;
    }
    if (target[key] && target[key].__v_isRef) {
      return target[key].value;
    }
    if (isObject(target[key])) {
      return reactive(target[key]);
    }
    const res = Reflect.get(target, key, receiver);
    track(target, key);
    return res;
  },
  set(target, key, value, receiver) {
    let oldValue = target[key];
    const r = Reflect.set(target, key, value, receiver);
    if (oldValue !== value) {
      trigger(target, key, value, oldValue);
    }
    return r;
  }
};

// packages/reactivity/src/reactivity.ts
var ReactiveFlags = /* @__PURE__ */ ((ReactiveFlags2) => {
  ReactiveFlags2["IS_REACTIVE"] = "_v_isReactive";
  return ReactiveFlags2;
})(ReactiveFlags || {});
var reactiveMap = /* @__PURE__ */ new WeakMap();
function reactive(target) {
  if (!isObject(target))
    return target;
  let existingProxy = reactiveMap.get(target);
  if (existingProxy)
    return existingProxy;
  if (target["_v_isReactive" /* IS_REACTIVE */]) {
    return target;
  }
  const proxy = new Proxy(target, mutableHandlers);
  reactiveMap.set(target, proxy);
  return proxy;
}
function isReactive(value) {
  return value["_v_isReactive" /* IS_REACTIVE */];
}

// packages/reactivity/src/apiWatch.ts
function traverse(value, seen = /* @__PURE__ */ new Set()) {
  if (!isObject(value)) {
    return value;
  }
  if (seen.has(value)) {
    return value;
  }
  seen.add(value);
  for (const key in value) {
    traverse(value[key], seen);
  }
  return value;
}
function watch(source, cb, options) {
  return dowatch(source, cb, options);
}
function watchEffect(source, options) {
  return dowatch(source, null, options);
}
function dowatch(source, cb) {
  let getter;
  if (isReactive(source)) {
    getter = () => traverse(source);
  } else if (isFunction(source)) {
    getter = source;
  }
  let oldVal;
  let clear;
  let onCleanup = (fn) => {
    clear = fn;
  };
  const job = () => {
    if (cb) {
      if (clear)
        clear();
      const newVal = effect2.run();
      cb(newVal, oldVal, onCleanup);
      oldVal = newVal;
    } else {
      effect2.run();
    }
  };
  const effect2 = new ReactiveEffect(getter, job);
  oldVal = effect2.run();
}

// packages/reactivity/src/computed.ts
var ComputedRefImpl = class {
  constructor(getter, setter) {
    this._dirty = true;
    this.dep = /* @__PURE__ */ new Set();
    this.__v_isRef = true;
    this.effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true;
        triggerEffect(this.dep);
      }
    });
  }
  get value() {
    trackEffect(this.dep);
    if (this._dirty) {
      this._value = this.effect.run();
      this._dirty = false;
    }
    return this._value;
  }
  set value(newVal) {
    this.setter(newVal);
  }
};
function computed(getterOrOptions) {
  let getter;
  let setter;
  const isGetter = isFunction(getterOrOptions);
  if (isGetter) {
    getter = getterOrOptions;
    setter = () => {
      console.log("warn");
    };
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }
  return new ComputedRefImpl(getter, setter);
}

// packages/reactivity/src/ref.ts
function toReactive(value) {
  return isObject(value) ? reactive(value) : value;
}
var RefImpl = class {
  constructor(rawValue) {
    this.rawValue = rawValue;
    this.dep = /* @__PURE__ */ new Set();
    this.__v_isRef = true;
    this._value = toReactive(rawValue);
  }
  get value() {
    trackEffect(this.dep);
    return this._value;
  }
  set value(newVal) {
    if (newVal !== this.rawValue) {
      this.rawValue = newVal;
      this._value = toReactive(newVal);
      triggerEffect(this.dep);
    }
  }
};
function ref(value) {
  return new RefImpl(value);
}
export {
  ReactiveEffect,
  ReactiveFlags,
  activeEffect,
  computed,
  dowatch,
  effect,
  isReactive,
  reactive,
  ref,
  toReactive,
  track,
  trackEffect,
  trigger,
  triggerEffect,
  watch,
  watchEffect
};
//# sourceMappingURL=reactivity.js.map
