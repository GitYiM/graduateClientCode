<template>
	<view class="searchPage-container">
		<cmd-nav-bar :pathBack="true"  @pathBack="pathBack" :title="title"></cmd-nav-bar>
		<cmd-page-body type="top-bottom">
			<view class="func-container">
				<view class="search-container">
					<file-search :autoFocus="true" @onFocus="inputFocus" :keyWord.sync="searchKeyword"/>
				</view>
				<button class="cu-btn round bg-blue" @click="searchOrCancel">{{buttonTitle}}</button>
			</view>
			<view v-show="showHistory" class="history-tags">
				<view class="history-tags-head">
					<text class="history-tages-head-title" style="font-size: 20px; font-weight: 500;">搜索历史</text>
					<view class="history-tages-head-box"/>
					<text @click="clearAllKeyWords"  class="history-tages-head-iconBtn lg cuIcon-deletefill"></text>
				</view>
				<view class="history-tags-body">
					<block v-for="(item, index) in tagsList">
						<button class="tag-btn cu-btn round bg-gray" @click="handleTagClick(item.keyWord)">{{item.keyWord}}</button>
					</block>
				</view>
			</view>
			<view v-show="showFileList" class="history-search-result">
				<view class="history-tags-head">
					<text>搜索结果 ({{fileList.length}})</text>
				</view>
				<view class="search-file-list">
					<block v-for="(item, index) in fileList" :key="index">
						<file-list-item :thumb="item.thumbnail" :type="item.type" :prefixShow="true"
						 :note="item.createTime.replace('T', ' ')+ '   ' +(item.type === 'Directory' ? '':convertBytes(item.size))" 
						 prefixIconColor="#000" :showMore="true" :title="item.fileName"
						 @itemClick="handleItemClick(item)"  @itemMoreClick="showItemMenu($event, item)" />
					</block>
				</view>
			</view>
		</cmd-page-body>
		<!-- 底部popupwindow -->
		<view class="cu-modal bottom-modal" :class="modalName=='bottomModal'?'show':''"  @tap="hideModal">
			<view class="cu-dialog text-start">
				<block v-for="(item, index) in menu" :key="index">
					<file-list-item @itemClick="handle(item)" :textPrefixIcon="item.textPrefixIcon" :prefixIcon="item.prefixIcon" :prefixShow="true"  :prefixIconColor="item.color" :title="item.title" />
				</block>
			</view>
		</view>
	</view>
</template>

<script>
	import cmdNavBar from "@/components/cmd-nav-bar/cmd-nav-bar.vue";
	import cmdPageBody from "@/components/cmd-page-body/cmd-page-body.vue";
	import fileSearch from "@/components/file-search/file-search.vue";
	import fileListItem from "@/components/file-list-item/file-list-item.vue";
	import conversionUtils from "@/utils/conversionUtils/conversionUtils.js";
	import {FileType} from '@/common/const/index.js';
	let _this;
	export default {
		components: {
			cmdNavBar,
			cmdPageBody,
			fileSearch,
			fileListItem
		},
		data() {
			return {
				title: "文件搜索",
				searchKeyword: "",
				tagsList: [],
				fileList: [],
				// 搜索结果列表
				resCount: 0,
				modalName: "",
				menu: [],
				itemMoreMenu: [
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
				activeOperItem: {}
				
			}
		},
		computed: {
			buttonTitle() {
				return !!_this.searchKeyword? "搜索": "取消";
			},
			showHistory() {
				return !!_this.tagsList.length > 0 && !(_this.fileList.length > 0);
			},
			showFileList() {
				return _this.fileList.length > 0;
			}
		},
		watch: {
			searchKeyword() {
				console.log("change");
			}
		},
		methods: {
			pathBack() {
				uni.navigateBack();
			},
			convertBytes(size) {
				return conversionUtils.convertBytes(size);
			},
			async searchOrCancel() {
				if(_this.buttonTitle === "搜索") {
					await _this.searchByKeyword();
				}else {
					_this.pathBack();
				}
			},
			async searchByKeyword(keyWord) {
				if(keyWord) {
					_this.searchKeyword = keyWord;
				}
				const res = await _this.$http.request({
					url: "/storage/searchFile",
					method: "GET",
					data: {
						keyWord: _this.searchKeyword
					}
				})
				_this.fileList = res.data;
				await _this.updateTags();
			},
			async updateTags() {
				// 更新历史搜索标签
				const res = await _this.$http.request({
					url:"/storage/getHistoryKeyword",
					method: "GET",
					data: {
						limitCount: 5
					}
				});
				_this.tagsList = res.data;
				console.log(_this.tagsList);
			},
			async handleTagClick(keyWord) {
				console.log("点击标签");
				await _this.searchByKeyword(keyWord);
			},
			async clearAllKeyWords() {
			    const res = await _this.$http.request({
					url: "/storage/clearKeyWords",
					method: "GET"
				})
				if(res.code === 0) {
					_this.tagsList = [];
				}
			},
			async handleItemClick(item) {
				switch (item.type){
					// 文件夾
					case FileType.DIRECTORY:
					
						uni.reLaunch({
							url: `/pages/tabPages/index?path=${item.path}`,
							success: () => {
								console.log("路由跳转成功");
							},
							fail: (err) => {
								console.log(err);
							}
						});
						
						break;
					case FileType.JPG:
					case FileType.PNG:
						const pathArr = item.path.split("/");
						let path = "";
						if(pathArr.length > 1) {
							path = pathArr.slice(0, pathArr.length - 1).join("/");
						} 
						const {data: previewUrl} = await _this.$http.request({
							url: "/storage/preview",
							method: 'GET',
							data: {
								path: path,
								filename: item.fileName
							}
							
						});
						uni.previewImage({
							urls: [previewUrl],
							longPressActions: {
								itemList: ['发送给朋友', '保存图片', '收藏'],
							}
						});
						break;
					default:
						break;
				}

			},
			showItemMenu(e, item) {
				console.log("点击");
				_this.menu = _this.itemMenu;
				_this.modalName = e.currentTarget.dataset.target;
				_this.activeOperItem = item;
			},
			hideModal() {
				_this.modalName = "";
			}, 
			inputFocus() {
				_this.fileList = [];
			}
			
		},
		async created() {
			_this = this;
			await _this.updateTags();
		},
	}
</script>

<style lang="scss" scoped>
	.searchPage-container {
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
		}
		.history-tags {
			box-sizing: border-box;
			padding: 15px;
			
			.history-tags-head {
				width: 100%;
				display: flex;
				flex-direction: row;
				align-items: center;
				.history-tages-head-title {
					width: 200rpx;
				}
				.history-tages-head-box {
					flex: 1;
				}
				.history-tages-head-iconBtn {
					width: 40rpx;
				}
			}
			.history-tags-body {
				margin-top: 20upx;
				display: flex;
				flex-wrap: wrap;
				.tag-btn {
					margin: 10rpx;
				}
			}
		}
		.history-search-result {
			box-sizing: border-box;
			padding: 15px;
			
		}
	}
</style>
