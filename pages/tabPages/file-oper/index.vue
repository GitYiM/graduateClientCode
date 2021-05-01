<template>
	<view class="index-container">
		
		<!-- main content -->
		<view v-if="hasLogin"  class="func-container">
			<view  class="search-container">
				<file-search @onClick="toSearchPage" />
			</view>
			<view class="menu-container"  @tap="showModal" data-target="bottomModal">
				<!-- <cmd-icon type="more-filled" size="lg" color="#000"/> -->
				<text class="text-gray" style="font-size: 50upx;" :class="'cuIcon-roundadd'"></text>
			</view>
		</view>
		<view v-if="hasLogin" class="file-list">
			<!-- 文件列表渲染 -->
			<block v-for="(item, index) in fileList">
				<!-- <file-list-item v-if="item.type === 'Directory'" @itemMoreClick="showItemMenu"  :prefixShow="true" prefixIcon="folder" prefixIconColor="#000" :note="item.createTime" :title="item.fileName" /> -->
				<file-list-item :thumb="item.thumbnail" @itemClick="handleItemClick(item)" :type="item.type" @itemMoreClick="showItemMenu($event, item)"  :prefixShow="true" prefixIcon="folder" prefixIconColor="#000" :note="item.createTime.replace('T', ' ')+ '   ' +(item.type === 'Directory' ? '':convertBytes(item.size))" :showMore="true" :title="item.fileName" />				
			</block>
		</view>
		
		
		<!-- 授权 -->
		<view  v-else class="authorization-container">
			<image class="unauthorization-img" src="../../../static/authenError.png"  mode="widthFix"></image>
			<text class="unauthorization-description">
				授权失败
			</text>
			<button class="authorization-button" type="primary" size="mini"  @click="wxLogin">点击授权</button>
		</view>
		
		<!-- 底部popupwindow -->
<!-- 		<view class="cu-modal bottom-modal" :class="modalName=='bottomModal'?'show':''"  @tap="hideModal">
			<view class="cu-dialog text-start">
				<block v-for="(item, index) in menu" :key="index">
					<file-list-item @itemClick="handle(item)" :textPrefixIcon="item.textPrefixIcon" :prefixIcon="item.prefixIcon" :prefixShow="true"  :prefixIconColor="item.color" :title="item.title" />
				</block>
			</view>
		</view> -->
		
		<!-- 加号、more点击底部弹窗 -->
		<GridModal :showModal="showAddGridModal" @hideModal="hideAddModal" :cuIconList="gridList" @handleAction="actionHandle"></GridModal>
		
		<!-- 新建文件夹模态框 -->
		<DialogModal modalTitle="创建文件夹" :showModal="showMkDirModal" @hideAction="hideMkdirModal" @confirmAction="createNewFolder">
			<view class="padding-xl">
				<input class="bg-gray" v-model="dirName" placeholder="请输入文件名" />
			</view>
		</DialogModal>
		
		<!-- 重命名模态框 -->
		<DialogModal modalTitle="重命名" :showModal="showRenameModal" @hideAction="hideRenameModal" @confirmAction="renameFile">
			<view class="padding-xl">
				<input class="bg-gray" v-model="fileNewName" placeholder="请输入文件名" />
			</view>
		</DialogModal>
		
		
		<!-- 图片压缩所需canvas -->
		<canvas :style="{ 'width': cWidth + 'px', 'height': cHeight + 'px', 'position': 'absolute', 'z-index': -1, 'left': '-10000rpx', 'top': '-10000rpx' }" canvas-id="canvas"></canvas>
	</view>
</template>

<script>
	import {mapState} from 'vuex';
	import fileSearch from "@/components/file-search/file-search.vue";
	import fileListItem from "@/components/file-list-item/file-list-item.vue";
	import cmdIcon from "@/components/cmd-icon/cmd-icon.vue";
	import conversionUtils from "@/utils/conversionUtils/conversionUtils.js";
	import imageUtils from '@/utils/compressImages/compressImages.js';
	import {FileType} from '@/common/const/index.js';
	import {timeFormat} from "@/utils/timeUtils/index.js";
	import DialogModal from "@/components/DialogModal/DialogModal.vue";
	import GridModal from "@/components/GridModal/GridModal.vue";
	// ps: 这里尽量不要用箭头函数，否则this指向杀你
	let _this;
	export default {
		components: {
			fileSearch,
			fileListItem,
			cmdIcon,
			DialogModal,
			GridModal
		},
		props: {
			curPath: {
				type: String,
				default: ''
			}
		},
		data() {
			return {
				activeOperItem: {},
				cWidth: 480, // 最大宽
				cHeight: 640, // 最大高
				// 当前路径
				// curPath: '',
				fileNewName: '',
				showRenameModal: false,
				menuShow: false,
				modalName: '',
				mkdirModalName: '',
				menu: [],
				dirName: "",
				showMkDirModal: false,
				showAddGridModal: false,
				gridList: [],
				addGridList: [
					{
						cuIcon: 'picfill',
						name: "图片上传",
						color: 'yellow',
						clickAction: "uploadImage"
					},
					{
						cuIcon: 'recordfill',
						color: 'orange',
						name: '视频上传',
						clickAction:  "uploadFile"
					},
					{
						cuIcon: 'weixin',
						color: 'green',
						name: '上传微信文件',
						clickAction:  "uploadFile"
					},
					{
						cuIcon: 'pay',
						color: 'blue',
						name: '新建文件夹',
						clickAction: "showMkdirModalAction"
					}
						
				],
				moreGridList: [
					{
						cuIcon: 'weixin',
						color: 'green',
						name: '分享',
						clickAction: "shareFile"
					},
					{
						cuIcon: 'edit',
						color: 'blue',
						name: '重命名',
						clickAction: "changeName"
					},
					{
						cuIcon: 'delete',
						color: 'red',
						name: '删除',
						clickAction: "deleteFile"
					}
				],
				fileList: []
			}
		},
		computed: {
			...mapState({
				hasLogin: state => state.loginStatusInfo.hasLogin,
				userSession: state => state.loginStatusInfo.userSession
			})
		},
		watch: {
			curPath:async (val, oldVal) => {
				console.log("operwatch", val);
				await _this.getFileList(val);
				if(oldVal.length > val.length) {
					const pathArray = _this.curPath.split('/');
					_this.changeTitle(pathArray[pathArray.length-2] || "首页");
				}	
			},
			showRenameModal: () => {
				if(!_this.showRenameModal){
					setTimeout(function() {
						_this.fileNewName = '';
					}, 400);
				}
			},
			hasLogin: async (val) => {
				if(_this.hasLogin) {
					await _this.getFileList();
				}
			}
		},
		methods: {
			toSearchPage() {
				uni.navigateTo({
					url: "/pages/searchPage/searchPage",
					animationType:"pop-in",
					success: () => {
						console.log("进入搜索页");
					},
					fail: (err) => {
						console.log(err);
					}
				})
			},
			hideAddModal() {
				_this.showAddGridModal = false;
			},
			hideRenameModal() {
				_this.showRenameModal = false;
			},
			async renameFile() {
				const newName = _this.fileNewName;
				const res = await _this.$http.request({
					url: "/storage/fileRename",
					method: "POST",
					header: {
						'content-type': 'application/x-www-form-urlencoded',
						userSession: _this.userSession
					},
					data: {
						newFileName: newName,
						path: _this.activeOperItem.path
					}
				})
				_this.showRenameModal = false;
				await _this.getFileList();
			},
			async changeFilePath(item) {
				await _this.$emit("changeFilePath", item);
			},
			convertBytes(size) {
				return conversionUtils.convertBytes(size);
			},
			async getCompressedImages(images) {
				const res = await imageUtils.compressionIamge(_this, images[0].path);
				return res;
			},
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
			
			
			async getLoginStatus (code, encryptedData, iv) {
				const res = await _this.$http.request({
					method: "GET",
					url: "/login/code2session",
					// needLoading: true,
					data: {
						code,
						encryptedData,
						iv
					}
				});
				return res;
			},
			
			async wxLogin () {
				//  这里需要再判断登录态，如果已经登录，就不能再执行
				if(!_this.hasLogin) {			
					const userInfoRes = await _this.getInfo();
					const userInfo = userInfoRes.userInfo;
					const code = await _this.getLoginCode();
					const encryptedData = userInfoRes.encryptedData;
					const iv = userInfoRes.iv;
					const {data: userSession} = await _this.getLoginStatus(code, encryptedData, iv);
					console.log("session", userSession);
					if(userSession) {
						const hasLogin = true;
						const loginStatusInfo = {
							...userInfo,
							userSession,
							hasLogin
						}
						_this.$store.commit("updateLoginStatusInfo",loginStatusInfo);					
						console.log("微信授权登录成功");
					}
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
				_this.gridList = _this.addGridList;
				_this.showAddGridModal = true;
			},
			hideModal(e) {
				_this.modalName = '';
			},
			hideMkdirModal() {
				console.log("隐藏");
				_this.showMkDirModal = false;
				_this.dirName = '';
			},
			showMkdirModal() {
				_this.showMkDirModal = true;
			},
			actionHandle(actionKey){
				_this[actionKey]();
			},
			handle(item) {
				_this[item.actionFunc]();
			},
			async changeName () {
				_this.showRenameModal = true;
				const curOperItem = _this.activeOperItem;
				_this.fileNewName = curOperItem.fileName;
			},
			async deleteFile() {
				const curOperItem = _this.activeOperItem;
				let res = null;
				if(curOperItem.type === "Directory") {
					res = await _this.$http.request({
						url: "/storage/deleteDir",
						method: "POST",
						header: {
							'content-type': 'application/x-www-form-urlencoded',
							userSession: _this.userSession
						},
						data: {
							filename: curOperItem.fileName,
							path: curOperItem.path
						}
					});
					
				}else {
					res = await _this.$http.request({
						url: "/storage/DeleteImages",
						method: "POST",
						header: {
							'content-type': 'application/x-www-form-urlencoded',
							userSession: _this.userSession
						},
						data: {
							filename: curOperItem.fileName,
							path: curOperItem.path
						}
					});
				}
				await _this.getFileList();
			},
			async chooseFile() {
				return new Promise((resolve, reject) => {
					uni.chooseMessageFile({
						success: (res) => {
							resolve(res.tempFiles);
						},
						fail: (err) => {
							reject(err.errMsg);
						}
					});
				})
			},
			async chooseImage() {
				return new Promise((resolve, reject) => {
					uni.chooseImage({
						count:1,
						success: (res) => {
							resolve(res.tempFiles);
						},
						fail: (err) => {
							reject(err.errMsg);
						}
					})
				})
			},
			async chooseMovie() {
				return new Promise((resolve, reject) => {
					uni.chooseMovie({
						count: 1,
						sourceType: ['album'],
						success: (res) => {
							resolve(res.tempFile);
						},
						fail: (err) => {
							reject(err.errMsg);
						}
					})
				})
			},
			
			async uploadFile() {
				console.log("文件上传");
				const files = await _this.chooseFile();
				if(!Array.isArray(files)) {
					console.log(files);
				}
				
				console.log(files);
			},
			
			async uploadImage() {

				const images = await _this.chooseImage();
				// 缩略图
				const thumbnails = await _this.getCompressedImages(images);
				console.log(thumbnails);
				if(!Array.isArray(images)) {
					// 错误提示
					console.log(images);
				}
				const originFilename =  images[0].path.substring(images[0].path.lastIndexOf("/")+1);
				const extension = originFilename.substring(originFilename.lastIndexOf('.'));
				const filename = timeFormat(new Date(), "yyyy-MM-dd hh:mm:ss.S") + extension;
				const { uploadTask, uploadPromise } = _this.$http.uploadFile({
					url: '/storage/UploadImages',
					filePath: images[0].path,
					fileType: 'image',
					name: "file",
					header: {
						userSession: _this.userSession
					},
					formData: {
						filename: filename,
						path: _this.curPath + filename
					}
				});
			 	let thumbnailKey = (_this.curPath+filename).replace("/",'');
				const { thumbnailUploadPromise } = _this.$http.uploadFile({
					url: '/storage/UploadImages',
					filePath: thumbnails,
					fileType: 'image',
					name: "file",
					header: {
						userSession: _this.userSession
					},
					formData: {
						filename: thumbnailKey,
						path: 'thumbnails/' + thumbnailKey 
					}
				});
				uploadTask.onProgressUpdate ((res) => {
					// console.log(res.progress);
					// console.log(res.totalBytesSent);
					// console.log(res.totalBytesExpectedToSend);
				})
				await Promise.all([uploadPromise, thumbnailUploadPromise]);
				await _this.getFileList();
			},
			
			showMkdirModalAction() {
				
				_this.showMkdirModal("DialogModal1");
			},
			
			/**
			 * @param {Object} path 文件夹名称
			 */
			async createNewFolder() {
				const folderName = _this.dirName;
				let requestPath = _this.curPath + folderName;
				const res = await _this.$http.request({
					url: "/storage/createDir",
					method: "POST",
					// needLoading: true,
					header: {
						'content-type': 'application/x-www-form-urlencoded',
						userSession: _this.userSession
					},
					data: {
						path: requestPath,
					}
				})
				_this.hideMkdirModal();
				await _this.getFileList();
			},
			showItemMenu(e, activeOperItem) {
				_this.activeOperItem = activeOperItem;
				_this.gridList = _this.moreGridList;
				_this.showAddGridModal = true;
				
			},
			
			// 获取文件列表
			// createTime: "2021-04-12T15:53:50"
			// fileName: "/test/RaHUuKa2QaZy2494cf1e3178b5a97568e5d7b4565541.png"
			// path: "/test/RaHUuKa2QaZy2494cf1e3178b5a97568e5d7b4565541.png"
			// size: 189118
			// type: "image/png"
			// uploadTime: "2021-04-12T15:53:50"
			async getFileList(path) {
				let requestPath = '';
				if(path==undefined) {
					requestPath = _this.curPath;
				}else {
					requestPath = path;
				}
				console.log("requestPath", requestPath);
				const res = await _this.$http.request({
					url: '/storage/list',
					method: 'GET',
					header: {
						userSession: _this.userSession
					},
					data: {
						path: requestPath
					}
				});  
				_this.fileList = res.data;
			},
			async handleItemClick(item) {
				switch (item.type){
					// 文件夾
					case FileType.DIRECTORY:
						// path:item.path + '/'. title: item.fileName 
						await _this.changeFilePath(item);
						
						break;
					case FileType.JPG:
					case FileType.PNG:
						const pathArr = item.path.split("/");
						let originName = pathArr[pathArr.length - 1];
						const {data: previewUrl} = await _this.$http.request({
							url: "/storage/preview",
							method: 'GET',
							header: {
								userSession:  _this.userSession
							},
							data: {
								path: _this.curPath,
								filename: originName
							}
							
						});
						previewUrl && uni.previewImage({
							urls: [previewUrl],
							longPressActions: {
								itemList: ['发送给朋友', '保存图片', '收藏'],
							},
							fail(err) {
								console.log("--------图片预览失败---------");
								console.log(err);
							}
						})
						break;
					default:
						break;
				}
			},
			changeTitle(folderName) {
				_this.$emit("changeTitle", folderName);
			},
			async shareFile() {
				const curOperItem = _this.activeOperItem;
				switch(curOperItem.type) {
					case FileType.PNG:
					case FileType.JPG:
						const pathArr = curOperItem.path.split("/");
						let path = "";
						let originName = pathArr[pathArr.length - 1];
						if(pathArr.length > 1) {
							path = pathArr.slice(0, pathArr.length - 1).join("/");
						} 
						const {data: previewUrl} = await _this.$http.request({
							url: "/storage/preview",
							method: 'GET',
							header: {
								userSession:  _this.userSession
							},
							data: {
								path: path,
								filename: originName
							}
							
						});
						uni.share({
							provider: "weixin",
							type: 2,
							scene: "WXSceneSession",
							imageUrl: previewUrl,
							success() {
								console.log("success: 图片分享成功");
							},
							fail() {
								console.log("fail： 图片分享失败");
							}
						})
						break;
					default: 
					const encodedSession = encodeURIComponent(_this.userSession);
					uni.share({
						provider: "weixin",
						scene: "WXSceneSession",
						type: 5,
						title: "微信来了好文件",
						imageUrl: "https://bjetxgzv.cdn.bspapp.com/VKCEYUGU-uni-app-doc/962fc340-4f2c-11eb-bdc1-8bd33eb6adaa.png",
						miniProgram: {
							id: 'gh_c11b499b3095',
							path: `/pages/sharePage/sharePage?userSession=${encodedSession}&filePath=${curOperItem.path}`,
							type: 1,
						},
						success() {
							console.log("成功分享小程序");
						}
					})
				}
			}
			
		},
		created() {
			_this = this;

			console.log(FileType);
			if(!_this.hasLogin) {
				return;
			} 
			_this.getFileList();
		},
		
		
	}
</script>

<style lang="scss" scoped>
	.index-container {
		.func-container {
			box-sizing: border-box;
			display: flex;
			flex-direction: row;
			align-items: center;
			width: 100%;
			padding: 20upx 20rpx 0 20rpx;
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
				width: 400rpx;
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
