import { patchAttr } from "./modules/attr";
import { patchClass } from "./modules/class";
import { patchEvent } from "./modules/event";
import { patchStyle } from "./modules/style";

export function patchProp(el,key,prevVal,nextVal){
    // class style 事件  普通属性 表单属性 true-value
    if(key === 'class'){
        patchClass(el,nextVal)  // 对类名的处理
    }else if(key === 'style'){
        patchStyle(el,prevVal,nextVal)
    }else if(/^on[^a-z]/.test(key)){ // onClick onMousedown
        patchEvent(el,key,nextVal)
    }else{
        patchAttr(el,key,nextVal)
    }


    // 根据prev 和 nextVal 做diff来更新
    // {color:red} {background:red}
    // {color:red} null
}