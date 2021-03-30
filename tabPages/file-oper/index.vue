<template>
	<view class="index-container">
		
		<view class="search-container">
			<file-search />
		</view>
		
		<view v-if="hasLogin" class="file-list">
			
		</view>
		<view  v-else class="authorization-container">
			<image class="unauthorization-img" src="../../static/logo.png"  mode="widthFix"></image>
			<text class="unauthorization-description">
				授权失败
			</text>
			<button class="authorization-button" type="primary" size="mini" open-type="getUserInfo" @getuserinfo="wxLogin">点击授权</button>
		</view>
	</view>
</template>

<script>
	import {mapState} from 'vuex';
	import fileSearch from "@/components/file-search/file-search.vue";
	// ps: 这里尽量不要用箭头函数，否则this指向杀你
	let _this;
	export default {
		components: {
			fileSearch
		},
		data() {
			return {
			}
		},
		computed: {
			...mapState({
				hasLogin: state => state.loginStatusInfo.hasLogin
			})
		},
		methods: {
			 async getLoginCode () {
				return new Promise((resolve, reject) => {
					uni.login({
						success: (res) => {
							console.log("code获取成功！");
							resolve(res.code);
						},
						fail: (err) => {
							console.log("code获取失败！登录失败，请重试");
						}
					})
				})
			},
			
			async getInfo () {
				return new Promise((resolve, reject) => {
					uni.getUserInfo({
						success: (info) => {
							resolve(info);
						},
						fail: (err) => {
							reject(err);
						}
					})
				})
			},
			
			async getAuth () {
				return new Promise((resolve, reject) => {
					uni.getSetting({
						success: (setting) => {
							resolve(setting.authSetting["scope.userInfo"]);
						},
						fail: (err) => {
							reject(err);
						}
					})
				})
			},
			
			async getLoginStatus (code) {
				const res = await _this.$http({
					method: "get",
					url: "/login/code2session",
					needLoading: true,
					data: {
						code
					}
				});
				return res;
			},
			
			async wxLogin () {
				const userInfoAuth = await _this.getAuth();
				
				//  这里需要再判断登录态，如果已经登录，就不能再执行
				if(userInfoAuth && !_this.hasLogin) {			
					const userInfoRes = await _this.getInfo();
					const userInfo = userInfoRes.userInfo
					const code = await _this.getLoginCode();
					const encryptedData = userInfo.encryptedData;
					const iv = userInfo.iv;
					const {data: userSession} = await _this.getLoginStatus(code);
					if(userSession) {
						const hasLogin = true;
						const loginStatusInfo = {
							...userInfo,
							userSession,
							hasLogin
						}

						_this.$store.commit("updateLoginStatusInfo",loginStatusInfo);
						
					}
				console.log("微信授权登录成功");	
				}else if(hasLogin){
					console.log("用户已登录");
				}else {
					console.log("用户未授权");
				}
				
			}
		},
		onReady() {
			_this = this;
		},
		
	}
</script>

<style lang="scss">
	.index-container {
		.search-container {
			box-sizing: border-box;
			width: 100%;
			padding: 10upx 20rpx 0 20rpx;
		}
		
		.file-list {
			
		}
		
		// 视窗高度 - 状态栏 - 导航栏 - 搜索框 - 底导
		.authorization-container {
			height: calc(100vh - 92upx -  118upx - 80upx - var(--status-bar-height));
			display: flex;
			align-items: center;
			justify-content: center;
			flex-direction: column;
			.unauthorization-img {
				width: 250rpx;
				height: $uni-img-size-base;
			}
			.authorization-button {
				margin-top: 20upx;
			}
			.unauthorization-description {
				color: lightgray;
				font-size: 15px;
			}
		}
	}
	
</style>
