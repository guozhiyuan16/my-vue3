const { build } = require('esbuild')
const {resolve} = require('path')

// const target = 'reactivity'
const target = 'runtime-dom'

build({
    entryPoints: [resolve(__dirname,`../packages/${target}/src/index.ts`)],
    outfile: resolve(__dirname,`../packages/${target}/dist/${target}.js`),
    bundle: true, // 将依赖的模块全部打包
    sourcemap: true, // 支持调试
    format: 'esm', // 打包出来的模块是es6模块
    platform: 'browser', // 打包的结果给浏览器来使用
    watch:{
        onRebuild(error,result){
            if (error) console.error('watch build failed:', error)
            else console.log('watch build succeeded:', result)
        }
    }
}).then(()=>{
    console.log('watching~~~')
})
