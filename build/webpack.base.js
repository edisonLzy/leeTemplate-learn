const path = require("path");
const fs = require("fs");
const root = path.resolve(__dirname, "../");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const NavListPlugin = require("../plugin/NavListPlugin");
const devMode = process.env.NODE_ENV !== "production";
// 动态读取 src 下面文件夹，每一个文件夹下面的 index.ts为入口文件
const srcPath = path.resolve(__dirname,"../src");
function makeEntry(root,excludes = [],entry = 'index.ts'){
  if(!root)return;
  const isExist =  fs.existsSync(root);
  if(!isExist) return;
  const data = fs.readdirSync(root);
  const result  = data.filter(i=>!excludes.includes(i));
  return result.reduce((acc,item)=>{
	const key  = item;
	const value = path.resolve(root,item,entry);
	acc[key] = value;
	return acc;
  },{})
}
// 根据入口动态添加 htmlWebpackPlugin
function makeHtmlWebpackPlugin(root,excludes = [],template = 'index.html'){
	if(!root)return;
	const isExist =  fs.existsSync(root);
	if(!isExist) return;
	const data = fs.readdirSync(root);
	const result  = data.filter(i=>!excludes.includes(i));
    return result.reduce((acc,item)=>{
    const op = {
		title:item,
		filename:`${item}/index.html`,
		template:path.resolve(root, item,'index.html'),
		chunks:['utils',item],
		minify: {
			// 清除html中的注释
			removeComments: true,
			// 清理html中的空格、换行符
			collapseWhitespace: true,
			// 删除过剩的属性
			removeRedundantAttributes: true,
			useShortDoctype: true,
			// 清理内容为空的元素
			removeEmptyAttributes: true,
			// 去掉style和link标签的type属性
			removeStyleLinkTypeAttributes: true,

			keepClosingSlash: true,
			// 压缩script中的js代码
			minifyJS: true,
			// 压缩style中的css代码
			minifyCSS: true,
			minifyURLs: true,
		}
	}
	acc.push(new HtmlWebpackPlugin(op))
	return acc;
	},[])
}
module.exports = {
	context: root,
	entry: {
		utils:'./src/utils/index.ts',
		...makeEntry(srcPath,["utils"])
	},
	stats:"errors-only",
	resolve: {
		extensions: [".tsx", ".ts", ".js",".html"],
		alias: {
			"@": path.resolve(__dirname, "../src")
		}
	},
	externals: {},
	module: {
		rules: [
			{
				test: /\.ts(x?)$/,
				use:[{
					loader: "babel-loader",
					options:{
						cacheDirectory: true
					}
				},"ts-loader"],
				exclude: /node_modules/
			},
			// 处理图片
			{
				test: /\.(png)|(gif)|(jpg)$/,
				use: [{
					loader: "url-loader",
					options: {
						// limit: false //不限制任何大小，所有经过loader的文件进行base64编码返回
						limit: 10 * 1024, //只要文件不超过 100*1024 字节，则使用base64编码，否则，交给file-loader进行处理
						name: "imgs/[name].[hash:5].[ext]"
					}
				}]
			},
			{
				test: /\.scss$/,
				use: [
					MiniCssExtractPlugin.loader,
					{
						loader: "css-loader"
					},
					{
						loader: "postcss-loader"
					},
					{
						loader: "sass-loader"
					}
				]

			},
			{
				test:/\.html$/,
				loader:"html-loader"
				
			}
		]
	},
	plugins: [
		new MiniCssExtractPlugin({
			// Options similar to the same options in webpackOptions.output
			// both options are optional
			filename: devMode ? "[name]/css/[name].css" : "[name]/css/[name].[hash].css",
			chunkFilename: devMode ? "[id].css" : "[id].[hash].css",
		}),
		...makeHtmlWebpackPlugin(srcPath,["utils"]),
		new NavListPlugin({
			path:path.resolve(__dirname,'../','public/index.html'),
			name:"index.html"
		})
		// new CopyPlugin({
		// 	patterns: [
		// 		{ from: "./public" }
		// 	]
		// })
	]
};
