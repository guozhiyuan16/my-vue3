import { ShapeFlags } from "@vue/shared"

export function createRenderer(renderOptions){
    const {
        createElement: hostCreateElement,
        createText:hostCreateText,
        insert:hostInsert,
        remove:hostRemove,
        querySelector:hostQuerySelector,
        setElementText:hostSetElementText,
        setText:hostSetText,
        createComment:hostCreateComment,
        nextSibling: hostNextSibling,
        parentNode:hostParentNode,
        patchProp:hostPatchProp
    } = renderOptions // 这些方法和某个平台无关

    const mountChildren = (children,container) => {
        console.log('children',children)
        children.forEach((child) => {
            console.log('child',child)
            patch(null,child,container)
        })
    }

    const mountElement = (vnode,container) => {
        // 递归遍历虚拟节点将其转换为真实节点
        const { type, props,children,shapeFlag} = vnode
        const el = (vnode.el = hostCreateElement(type))

        if(props){
            for(let key in props){
                hostPatchProp(el,key,null,props[key])
            }
        }

        if(children){
            if(shapeFlag && ShapeFlags.TEXT_CHILDREN){
                hostSetElementText(el,children)
            }else if(shapeFlag && ShapeFlags.ARRAY_CHILDREN){
                mountChildren(children,el)
            }
        }
        hostInsert(el,container)
    }

    const patch = (n1,n2,container) => { 
        // 更新和初次渲染
        if(n1 == null){
            mountElement(n2,container)
        }else{
            // 元素更新了
        }
    }

    const render = (vnode,container) =>{
        // 虚拟节点创建 最终生成真实dom渲染到容器中
        console.log(vnode,container)

        // 1) 卸载 render(null , app)

        // 2) 更新 之前渲染过， 现在在渲染 之前渲染过一次 产生了虚拟节点，再次渲染长生了虚拟节点

        // 3) 初次渲染

        if(vnode == null){
            // 卸载逻辑
        }else{
            patch(container._vnode || null, vnode , container)
        }
        container._vnode = vnode;
    }
    return {
        render
    }
}

// runtime-core中的createRenderer是不基于平台的