export const nodeOps = {
    createElement(element) {
        return document.createElement(element)
    },
    createText(text){
        return document.createTextNode(text)
    },
    // 对元素的插入
    insert(element,container,anchor = null){
        // appendChild(element) = insertBefore(element,null)
        container.insertBefore(element,anchor)
    },
    // 对元素的删除
    remove(child){
        const parent = child.parentNodel
        if(parent){
            parent.removeChild(child)
        }
    },
    // 元素查询
    querySelector(selector){
       return document.querySelector(selector)
    },
    setElementText(element,text){
        element.textContent = text // 设置元素的内容
    },
    setText(textNode,text) {
        textNode.nodeValue = text
    },
    createComment(text){
        return document.createComment(text)
    },
    nextSibling(element){
        return element.nextSibling
    },
    parentNode(element){
        return element.parentNode
    }
}