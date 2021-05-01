<template>
	<view>
		<cmd-nav-bar :pathBack="back" @pathBack="pathBack"  :title="title"></cmd-nav-bar>
		<cmd-page-body type="top">
			<view class="share-from">
				<image class="user-avatar png" src="/static/authenError.png"  mode="aspectFit"></image>
				<text style="margin-left: 20rpx; font-weight: bold;"  class="text-black">我的分享</text>
			</view>
			<view class="share-list">
				<view class="list-description">
					<text style="font-weight: bold;">总共有{{fileCount}}个文件</text>
				</view>
				<view class="file-list">
					<block v-for="(item, index) in fileList">
						<file-list-item :thumb="item.thumbnail" @itemClick="handleItemClick(item)" :type="item.type" :prefixShow="true"  :note="item.createTime.replace('T', ' ')+ '   ' +(item.type === 'Directory' ? '':convertBytes(item.size))"  :title="item.fileName" />				
					</block>
				</view>
			</view>
		</cmd-page-body>
	</view>
</template>

<script>
	import CmdNavBar from "@/components/cmd-nav-bar/cmd-nav-bar.vue";
	import cmdPageBody from "@/components/cmd-page-body/cmd-page-body.vue";
	import {mapState} from 'vuex';
	import conversionUtils from "@/utils/conversionUtils/conversionUtils.js";
	import fileListItem from "@/components/file-list-item/file-list-item.vue";
	import {FileType} from '@/common/const/index.js';
	export default {
		components: {
			CmdNavBar,
			cmdPageBody,
			fileListItem
		},
		data() {
			return {
				title: "分享",
				fileList: [],
				sharedUsersession: '',
				sharedPath: '',
				requestPathArr: ['']
				
			}
		},
		watch: {
			'requestPathArr.length': {
				async handler(newValue, oldValue) {
					let len = this.requestPathArr.length;
					if(len > 1) {
						const path = this.requestPathArr[len - 1];
						await this.getFileList(path);
					}else if( len === 1){
						await this.getSharedFileList();
					}
				}
			}
		},
		computed: {
			...mapState({
				hasLogin: state => state.loginStatusInfo.hasLogin,
				userSession: state => state.loginStatusInfo.userSession
			}),
			fileCount() {
				return this.fileList.length;
			},
			back() {
				return this.requestPathArr.length > 1;
			}
		},
		methods: {
			async getSharedFileList () {
				const res = await this.$http.request({
					url: "/storage/getSharedFileList",
					method: "GET",
					header: {
						userSession: this.sharedUsersession
					},
					data: {
						path: this.sharedPath
					}
				});
				this.fileList = res.data;
			},
			async getFileList(path) {
				
				const res = await this.$http.request({
					url: '/storage/list',
					method: 'GET',
					header: {
						userSession: this.userSession
					},
					data: {
						path: path
					}
				});  
				this.fileList = res.data;
			},
			convertBytes(size) {
				return conversionUtils.convertBytes(size);
			},
			async handleItemClick(item) {
				switch (item.type){
					case FileType.DIRECTORY:
						this.requestPathArr.push(item.path+'/');
						break;
					case FileType.JPG:
					case FileType.PNG:
							const pathArr = item.path.split("/");
							let path = "";
							let originName = pathArr[pathArr.length - 1];
							if(pathArr.length > 1) {
								path = pathArr.slice(0, pathArr.length - 1).join("/");
							} 
							const {data: previewUrl} = await this.$http.request({
								url: "/storage/preview",
								method: 'GET',
								header: {
									userSession:  this.userSession
								},
								data: { 
									path: path,
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
			pathBack() {
				this.requestPathArr.pop();
			}
		
		},
	async onLoad(payload) {
		this.sharedPath = payload.filePath;
		this.sharedUsersession = decodeURIComponent(payload.userSession);
		await this.getSharedFileList();
	} 
}	
</script>

<style lang="scss">
	.share-from {
		background-color: #f9faff ;
		display: flex;
		align-items: center;
		box-sizing: border-box;
		padding: 10px 15rpx 10px 15rpx;
		
		
	}
	.share-list {
		.list-description {
			box-sizing: border-box;
			padding: 5px 15rpx 5px 15rpx;
		}
	}
	.user-avatar {
		width: 100upx;
		height: 100upx;
		font-size: 100upx;
		line-height: 128upx;
		border-radius: 64upx;
		border: 1px solid lightgray;
	}
</style>
