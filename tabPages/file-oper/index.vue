<template>
	<view class="index-container">
		
		<!-- main content -->
		<view class="func-container">
			<view class="search-container">
				<file-search />
			</view>
			<view class="menu-container"  @tap="showModal" data-target="bottomModal">
				<!-- <cmd-icon type="more-filled" size="lg" color="#000"/> -->
				<text class="text-gray" style="font-size: 50upx;" :class="'cuIcon-roundadd'"></text>
			</view>
		</view>
		<view v-if="hasLogin" class="file-list">
			<!-- <block v-for=""></block> -->
			<file-list-item @itemMoreClick="showItemMenu"  :prefixShow="true" prefixIcon="folder" prefixIconColor="#000" note="描述性文字" :showMore="true" title="禁用状态" />
		</view>
		
		
		<!-- 授权 -->
		<view  v-else class="authorization-container">
			<image class="unauthorization-img" src="../../static/logo.png"  mode="widthFix"></image>
			<text class="unauthorization-description">
				授权失败
			</text>
			<button class="authorization-button" type="primary" size="mini"  @click="wxLogin">点击授权</button>
		</view>
		
		<!-- 底部popupwindow -->
		<view class="cu-modal bottom-modal" :class="modalName=='bottomModal'?'show':''"  @tap="hideModal">
			<view class="cu-dialog text-start">
				<block v-for="(item, index) in menu" :key="index">
					<file-list-item @itemClick="handle(item.actionFunc)" :textPrefixIcon="item.textPrefixIcon" :prefixIcon="item.prefixIcon" :prefixShow="true"  :prefixIconColor="item.color" :title="item.title" />
				</block>
			</view>
		</view>
	</view>
</template>

<script>
	import {mapState} from 'vuex';
	import fileSearch from "@/components/file-search/file-search.vue";
	import fileListItem from "@/components/file-list-item/file-list-item.vue";
	import cmdIcon from "@/components/cmd-icon/cmd-icon.vue";
	// ps: 这里尽量不要用箭头函数，否则this指向杀你
	let _this;
	export default {
		components: {
			fileSearch,
			fileListItem,
			cmdIcon,
		},
		data() {
			return {
				menuShow: false,
				modalName: '',
				menu: [],
				addMenu: [
					{
						title: '上传文件',
						textPrefixIcon: 'add',
						color: '#fff',
						actionFunc: "uploadFile"
					},
					{
						title: '新建文件夹',
						prefixIcon: 'folder',
						color: '#000',
						actionFunc: "createNewFolder"
					},
				],
				itemMenu: []
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
					uni.getUserProfile({
						desc: "授权",
						success: (info) => {
							resolve(info);
						},
						fail: (err) => {
							console.log(err.errMsg);
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
				//  这里需要再判断登录态，如果已经登录，就不能再执行
				if(!_this.hasLogin) {			
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
				
			},
			
			newLogin() {
				uni.getUserProfile({
					desc: "注册",
					success: (res) => {
						console.log(res);
					},
					fail: (err) => {
						console.log(err);
					}
				})
			},
			
			togglePopup() {
				console.log("修改弹窗状态");
				_this.menuShow = !_this.menuShow;
			},
			showModal(e) {
				_this.menu = _this.addMenu;
				_this.modalName = e.currentTarget.dataset.target;
			},
			hideModal(e) {
				_this.modalName = '';
			},
			handle(actionFunc) {
				_this[actionFunc]();
			},
			uploadFile() {
				console.log("文件上传");
			},
			createNewFolder() {
				console.log("新建文件夹");				
			},
			showItemMenu(e) {
				console.log(e);
				_this.menu = _this.itemMenu;
				_this.modalName = e.currentTarget.dataset.target;
			}
			
		},
		onReady() {
			_this = this;
		},
		
	}
</script>

<style lang="scss">
	.index-container {
		
		.func-container {
			box-sizing: border-box;
			display: flex;
			flex-direction: row;
			align-items: center;
			width: 100%;
			padding: 10upx 20rpx 0 20rpx;
			.search-container {
				box-sizing: border-box;
				padding-right: 20rpx;
				flex: 1 1;
			}
			.menu-container {
				width: 40rpx;
				flex: 0 0;
			}
		}
		
		.file-list {
			margin-top: 5upx;
		}
		
		// 视窗高度 - 状态栏 - 导航栏 - 搜索框 - 底导
		.authorization-container {
			height: calc(100vh - 92upx -  118upx - 80upx - var(--status-bar-height))!important;
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
	.text-start {
		text-align: start;
	}
</style>
