<template>
	<view class="cu-modal" :class="showModal?'show':''">
		<view class="cu-dialog">
			<view class="cu-bar bg-white justify-end">
				<view class="content">{{modalTitle}}</view>
				<view class="action" @tap="hideFunction">
					<text class="cuIcon-close text-red"></text>
				</view>
			</view>
			<view class="progress-container">
				<text>正在上传文件{{uploadInfo.uploadFile}}</text>
				<view class="cu-progress round margin-top striped active">
					<view class="bg-green" :style="[{ width:uploadInfo.uploadProgress+'%'}]">{{uploadInfo.uploadProgress}}%</view>
				</view>
			</view>
			<view class="cu-bar bg-white justify-end">
				<view class="action">
					<button class="cu-btn bg-red text-white" @tap="abortUpload">取消</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import DialogModal from '../DialogModal/DialogModal.vue';
	let _this;
	export default {
		name:"uploadProgressModal",
		components: {
			DialogModal
		},
		props: {
			uploadInfo: {
				type: Object,
				default: {
					uploadProgress: 0,
					uploadFile: ''
				}
			},
			showModal: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				modalTitle: "文件上传"
			};
		},
		watch: {
			'uploadInfo.uploadProgress': {
				handler(newVal, oldVal) {
					if(newVal === 100) {
						setTimeout(() => {
							_this.onFinishUpload();
						}, 1000)
					}
				}
			}
		},
		methods: {
			abortUpload() {
				_this.$emit("uploadAbort");
			},
			hideFunction() {
				_this.$emit("onFinishUpload");
			},
			onFinishUpload() {
				_this.$emit("onFinishUpload");
			}
		},
		created() {
			_this = this;
		}
	}
</script>

<style lang="scss">
	.progress-container {
		box-sizing: border-box;
		padding: 0 20rpx;
	}
</style>
