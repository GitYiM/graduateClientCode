<template>
	<view class="search-container">
		<cmd-icon class="search-icon" type="search" size="md" :color="searchIconColor"></cmd-icon>
		<input :placeholder="placeholder" class="search-input" v-model="keyWord"/>
	</view>
</template>

<script>
	import cmdIcon from "@/components/cmd-icon/cmd-icon.vue";
	export default {
		name:"file-search",
		components: {
			cmdIcon
		},
		data() {
			return {
				searchIconColor: "#ABABAB",
				keyWord: "",
				placeholder: "搜索网盘文件"
			};
		}
	}
</script>

<style lang="scss">
	.search-container{
		display: flex;
		align-items: center;
		background-color: #EBEBEB;
		height: 70rpx;
		width: 100%;
		box-sizing: border-box;
		border-radius: 40rpx;
		padding: 0 20rpx 0 20rpx;
		.search-icon {
			
		}
		.search-input {
			margin-left: 10rpx;
			font-size: 10px;
			color: #ABABAB;
		}
	}
</style>
