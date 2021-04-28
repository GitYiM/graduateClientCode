<template>
	<!-- 新建文件夹模态框 -->
	<view class="cu-modal" :class="showModal?'show':''">
		<view class="cu-dialog">
			<view class="cu-bar bg-white justify-end">
				<view class="content">{{modalTitle}}</view>
				<view class="action" @tap="hideFunction">
					<text class="cuIcon-close text-red"></text>
				</view>
			</view>
			<slot></slot>
			<view class="cu-bar bg-white justify-end">
				<view class="action">
					<button class="cu-btn line-green text-green" @tap="hideFunction">取消</button>
					<button class="cu-btn bg-green margin-left" @tap="confirmAction">确定</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name:"DialogModal",
		props: {
			showModal: {
				type: Boolean,
				default: false
			},
			modalTitle: {
				type: String,
				default: ''
			},
		},
		data() {
			return {
				
			};
		},
		methods: {
			hideFunction() {
				console.log("执行hide");
				this.$emit("hideAction");
			},
			confirmAction() {
				this.$emit("confirmAction");
			}
		}
	}
</script>

<style>

</style>
