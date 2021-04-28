// 上传、下载请求另写
import store from "@/store/index.js";
const defaultConfig = {
	baseUrl: "https://www.unnetdisk.ltd/unnetdisk-server",
	// baseUrl: "https://119.29.4.75/unnetdisk-server",
	// baseUrl: "https://localhost:8086/unnetdisk-server",
	// timeout: 10000,
	header: {	
		userSession: uni.getStorageSync('loginStatusInfo').userSession
	}
}; 

const http = {};
/**
 * @param {needLoading} 用于配置是否加载异步等待loadIng效果 
 */
http.request = (config) => {
	const { url, method, data, needLoading = false, header={} } = config;
	// 拼接url
	config.url = defaultConfig.baseUrl + config.url;
	return new Promise((resolve, reject) => {
		uni.request({
			...defaultConfig,
			...config,
			header: {
				...defaultConfig.header,
				...header
			},
			success: (data) => {
				console.log("成功");
				resolve(data.data);
			},
			fail: (err) => {
				console.log(err);
				reject(err);
			},
		})
	})
};

http.uploadFile = (config) => {
	const {url, header, files, fileType} = config;
	let uploadTask = null;
	const uploadPromise = new Promise((resolve, reject) => {
		console.log("执行");
		uploadTask = uni.uploadFile({
			...config,
			...defaultConfig,
			header: {
				...defaultConfig.header
			},
			url: defaultConfig.baseUrl + url,
			success: (res) => {
				resolve(res);
			},
			fail: (err) => {
				reject(err.errMsg);
			},
			complete: () => {
				console.log("上传"+fileType+"请求完成");
			}
		})
	})
	return {
		uploadTask,
		uploadPromise
	}
}


export default http;