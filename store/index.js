// vuex的核心 store
import Vuex from 'vuex';
import Vue from 'vue';
import mutations from './mutations.js';
import actions from './actions.js';
Vue.use(Vuex);

const store = new Vuex.Store({
	// 应用层级状态
	// 可以直接读，但不能直接改，需要通过mutations来修改
	state: {
		
		loginStatusInfo: {
			hasLogin: false,
			userSession: "",
			username: '',
			avatarUrl: '',
			userSession: '',
		}
	},
	// state的计算属性
	// this.$store.getters进行访问
	getters: {
		
	},
	mutations,
	actions,	
})

export default store;