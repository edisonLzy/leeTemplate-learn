const fs = require('fs');
const HtmlContent = Symbol('html');
const ReadTemplateFile = Symbol('readTemplateFile');
const GeneratorTag = Symbol('GeneratorTag')
// 自动根据dist文件下， 不同的chunk输出的文件，生成一个html，里面链接各个chunk
module.exports = class GeneratorHtmlList {
    [HtmlContent];
    constructor(options) {
        // 模版路径
        this.path = options.path;
        // 输出文件名称
        this.name = options.name;
        // 读取模版文件
        this[ReadTemplateFile](this.path)
    }
    [ReadTemplateFile](_path) {
        try {
            this[HtmlContent]  = fs.readFileSync(_path).toString();
        } catch (error) {
            console.log(error)
        }
    }
    //读取同级的所有html文件，并生成a标签
    [GeneratorTag](htmls){
        const a = htmls.reduce((a,filename)=>{
          const name = filename.split('/')[0]
           a += `
           <a href = './${filename}'>${name}</a>
           `;
          return a;
        },'')
        const arr = this[HtmlContent].split("<nav>");
        let startNav = arr[0];
        let endNav = arr[1];
        startNav+='<nav>' + a + '</nav>';
        return startNav + endNav;
    }
    apply(complier) {      
        complier.hooks.emit.tap('GeneratorHtmlList',complation=>{
            // 获取所有的chunk生成的资源
            const assets = complation.assets;
            const htmls = [];
            Object.keys(assets).forEach(item=>{
                if(item.includes('.html')){
                    htmls.push(item)
                }
            })
            let result =  this[GeneratorTag](htmls);
            complation.assets[this.name] = {
              source(){
               return result;
              },
              size(){
               return result.length;
              }
          }
        })
    }
}