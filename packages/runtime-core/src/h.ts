import { isObject } from "@vue/shared";
import { createVNode, isVNode } from "./createVNode";

export function h(type,propsOrChildren?,children?) {
    const l = arguments.length;
    if(l == 2){
        if(isObject(propsOrChildren)&& !Array.isArray(propsOrChildren)){
            if(isVNode(propsOrChildren)){
                // 是儿子的情况
                return createVNode(type,null,[propsOrChildren])
            }
            // 是属性的情况
            return createVNode(type,propsOrChildren)
        }else{
            // 可能是数组 也可能是文本
            return createVNode(type,null,propsOrChildren)
        }
    }else {
         // 参数大于3 前两个之外的都是儿子
        if(l > 3){
            children = Array.from(arguments).slice(2)
        }
        // 等于3的情况，第三个参数虚拟节点，要包装成数组
        if(l === 3 && isVNode(children)){
            children = [children]
        }
        
        return createVNode(type ,propsOrChildren, children)
    }
}