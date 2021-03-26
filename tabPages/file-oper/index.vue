<template>
	<view class="index-container">
		<view class="search-container">
			<file-search />
		</view>
		<view class="file-list">
			
		</view>
	</view>
</template>

<script>
	import fileSearch from "@/components/file-search/file-search.vue";
	export default {
		components: {
			fileSearch
		},
		data() {
			return {
				
			}
		}
	}
</script>

<style lang="scss">
	.index-container {
		.search-container {
			box-sizing: border-box;
			width: 100%;
			padding: 10px 20rpx 0 20rpx;
		}
		
		.file-list {
			
		}
	}
	
</style>
