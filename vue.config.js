const path = require('path');
const webpack = require('webpack')

module.exports = {
    lintOnSave: false, // eslint-loader 是否在保存的时候检查
    productionSourceMap: true,
    publicPath:'./',
    outputDir: "dist",
    devServer: {
        public: '192.168.10.119:8080',
        disableHostCheck: true,
        https: true, 
        host:'0.0.0.0',
        proxy: 'https://apidata.yun61.com/',
        overlay: {
            warnings: true,
            errors: true
          },
      
    }, 
 
   
}