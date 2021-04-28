<template>
	<view class="search-container">
		<cmd-icon class="search-icon" type="search" size="md" :color="searchIconColor"></cmd-icon>
		<input  :focus="autoFocus" @blur="onBlur" @focus="onFocus" @click="onClick" :placeholder="placeholder" class="search-input" v-model="innerKeyWord"/>
	</view>
</template>

<script>
	import cmdIcon from "@/components/cmd-icon/cmd-icon.vue";
	export default {
		name:"file-search",
		components: {
			cmdIcon
		},
		props:{
			keyWord: {
				type: String,
				default: ''
			},
			autoFocus: {
				type: Boolean,
				default: false
			}
		},
		watch: {
			keyWord(val) {
				this.innerKeyWord = val;
			},
			innerKeyWord(val) {
				this.$emit("update:keyWord", val);
			}
		},
		data() {
			return {
				searchIconColor: "#ABABAB",
				placeholder: "搜索网盘文件",
				innerKeyWord: this.keyWord
			};
		},
		methods: {
			// 这里用@focus 有bug所以 换成click事件
			onClick(e) {
				this.$emit("onClick", e);
			},
			onBlur(e) {
				this.$emit("onBlur", e);
			},
			onFocus(e) {
				this.$emit("onFocus", e);
			}
		}
	}
</script>

<style lang="scss">
	.search-container{
		display: flex;
		align-items: center;
		background-color: #EBEBEB;
		height: 70upx;
		width: 100%;
		box-sizing: border-box;
		border-radius: 40rpx;
		padding: 0 20rpx 0 20rpx;
		.search-icon {
			
		}
		.search-input {
			width: 100%;
			margin-left: 10rpx;
			font-size: 10px;
			color: #ABABAB;
		}
	}
</style>
