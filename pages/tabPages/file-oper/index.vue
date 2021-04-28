<template>
	<view class="index-container">
		
		<!-- main content -->
		<view class="func-container">
			<view class="search-container">
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
			<image class="unauthorization-img" src="../../../static/logo.png"  mode="widthFix"></image>
			<text class="unauthorization-description">
				授权失败
			</text>
			<button class="authorization-button" type="primary" size="mini"  @click="wxLogin">点击授权</button>
		</view>
		
		<!-- 底部popupwindow -->
		<view class="cu-modal bottom-modal" :class="modalName=='bottomModal'?'show':''"  @tap="hideModal">
			<view class="cu-dialog text-start">
				<block v-for="(item, index) in menu" :key="index">
					<file-list-item @itemClick="handle(item)" :textPrefixIcon="item.textPrefixIcon" :prefixIcon="item.prefixIcon" :prefixShow="true"  :prefixIconColor="item.color" :title="item.title" />
				</block>
			</view>
		</view>
		
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
	// ps: 这里尽量不要用箭头函数，否则this指向杀你
	let _this;
	export default {
		components: {
			fileSearch,
			fileListItem,
			cmdIcon,
			DialogModal
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
				addMenu: [
					{
						title: '上传微信文件',
						textPrefixIcon: 'add',
						color: '#fff',
						actionFunc: "uploadFile"
					},
					{
						title: '上传图片',
						textPrefixIcon: 'add',
						color: '#fff',
						actionFunc: "uploadImage"
					},
					{
						title: '上传视频',
						textPrefixIcon: 'add',
						color: '#fff',
						actionFunc: "uploadFile"
					},
					{
						title: '新建文件夹',
						prefixIcon: 'folder',
						color: '#000',
						actionFunc: "showMkdirModalAction"
					},
				],
				itemMenu: [
					{
						title: '分享',
						actionFunc: "shareFile"
					},
					{
						title: '重命名',
						actionFunc: "changeName"
					},
					{
						title: "删除",
						actionFunc: "deleteFile"
					},
					
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
			curPath:async (val) => {
				console.log("operwatch", val);
				await _this.getFileList(val);
				console.log(getCurrentPages());
				console.log(_this.fileList);
				const pathArray = _this.curPath.split('/');
				_this.changeTitle(pathArray[pathArray.length-2] || "首页");
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
			hideRenameModal() {
				_this.showRenameModal = false;
			},
			async renameFile() {
				const newName = _this.fileNewName;
				const res = await _this.$http.request({
					url: "/storage/fileRename",
					method: "POST",
					header: {
						'content-type': 'application/x-www-form-urlencoded'
					},
					data: {
						newFileName: newName,
						path: _this.activeOperItem.path
					}
				})
				_this.showRenameModal = false;
				await _this.getFileList();
			},
			async changeFilePath(newPath) {
				await _this.$emit("changeFilePath", newPath);
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
				_this.menu = _this.addMenu;
				_this.modalName = e.currentTarget.dataset.target;
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
							'content-type': 'application/x-www-form-urlencoded'
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
							'content-type': 'application/x-www-form-urlencoded'
						},
						data: {
							filename: curOperItem.fileName,
							path: curOperItem.path
						}
					});
				}
				await _this.getFileList();
				console.log(res);
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
					formData: {
						filename: filename,
						userSession: _this.userSession,
						path: _this.curPath + filename
					}
				});
			 	let thumbnailKey = (_this.curPath+filename).replace("/",'');
				const { thumbnailUploadPromise } = _this.$http.uploadFile({
					url: '/storage/UploadImages',
					filePath: thumbnails,
					fileType: 'image',
					name: "file",
					formData: { 
						filename: thumbnailKey,
						userSession: _this.userSession,
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
						'content-type': 'application/x-www-form-urlencoded'
					},
					data: {
						path: requestPath,
					}
				})
				_this.hideMkdirModal();
				await _this.getFileList();
			},
			showItemMenu(e, activeOperItem) {
				_this.menu = _this.itemMenu;
				_this.modalName = e.currentTarget.dataset.target;
				_this.activeOperItem = activeOperItem;
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
						await _this.changeFilePath(item.path + '/');
						// _this.curPath = item.path+'/';
						// console.log(_this.curPath);
						// await _this.getFileList(_this.curPath);
						
						break;
					case FileType.JPG:
					case FileType.PNG:
						const {data: previewUrl} = await _this.$http.request({
							url: "/storage/preview",
							method: 'GET',
							header: {
								userSession:  _this.userSession
							},
							data: {
								path: _this.curPath,
								filename: item.fileName
							}
							
						});
						previewUrl && uni.previewImage({
							urls: [previewUrl],
							longPressActions: {
								itemList: ['发送给朋友', '保存图片', '收藏'],
							}
						})
						break;
					default:
						break;
				}
			},
			changeTitle(folderName) {
				_this.$emit("changeTitle", folderName);
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
