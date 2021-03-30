// 上传、下载请求另写
import store from "@/store/index.js";
const defaultConfig = {
	// baseUrl: "https://119.29.4.75/unnetdisk-server",
	baseUrl: "https://localhost:8086/unnetdisk-server",
	timeout: 5000,
	header: {
		userSession: store.state.loginStatusInfo.userSession
	}
};

/**
 * @param {needLoading} 用于配置是否加载异步等待loadIng效果 
 */
const http = (config) => {
	const { url, method, data, needLoading = false } = config;
	// 拼接url
	config.url = defaultConfig.baseUrl + config.url;
	return new Promise((resolve, reject) => {
		needLoading && uni.showLoading({
			title: "loading..."
		});
		uni.request({
			...defaultConfig,
			...config,
			complete: () => {
				console.log("请求完成");
				needLoading && uni.hideLoading();
			},
			success: (data) => {
				resolve(data.data);
			},
			fail: (err) => {
				reject(err);
			}
		})
	})
};


export default http;