/**
 * 和actions 不同，mutations一定是同步的
 */

const mutations = {
	/**
	 * 调用方式: this.$store.commit('add');
	 * store: store状态
	 * payload: 传参载荷 推荐使用传递对象的方式 {name: "yijingtao"}
	 */
	// add(state, payload) {
		
	// }
	updateLoginStatusInfo(state, newLoginStatusInfo) {
		const newStatusInfo =  {...state.loginStatusInfo, ...newLoginStatusInfo}
		uni.setStorageSync("loginStatusInfo",newStatusInfo);
		state.loginStatusInfo = newStatusInfo;
	},

}

export default mutations;