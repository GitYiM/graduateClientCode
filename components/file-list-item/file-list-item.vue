<template>
	<view :class="disabled ? 'uni-list-item--disabled' : ''" :hover-class="disabled || showSwitch ? '' : 'uni-list-item--hover'" class="uni-list-item" @click="onClick">
		<view class="uni-list-item__container">
			<!-- 有缩略图得用image, 文件等固定图标用icon -->
			<view v-if="prefixShow" class="uni-list-item__icon">
				<cmd-icon v-if="prefixIcon" :type="prefixIcon" :color="prefixIconColor"/>
				<text v-if="textPrefixIcon"  class="text-gray" style="font-size: 24px;" :class="'cuIcon-'+textPrefixIcon"></text>
				<image v-else-if="thumb" :src="thumb" class="uni-list-item__icon-img"  />
			</view>
			<view class="uni-list-item__content">
				<view class="uni-list-item__content-title">{{ title }}</view>
				<view v-if="note" class="uni-list-item__content-note">{{ note }}</view>
			</view>
			<view v-if="showMore" class="uni-list-item__extra">
				<text @click="itemMoreClick" data-target="bottomModal" class="text-gray" style="font-size: 24px;" :class="'cuIcon-more'"></text>
			</view>
		</view>
	</view>
</template>

<script>
	import cmdIcon from '../cmd-icon/cmd-icon.vue';
	export default {
		name: 'UniListItem',
		components: {
			cmdIcon
		},
		props: {
			title: {
				type: String,
				default: ''
			}, // 列表标题
			note: {
				type: String,
				default: ''
			}, // 列表描述
			disabled: { // 是否禁用
				type: Boolean,
				default: false
			},
			thumb: {
				type: String,
				default: ''
			}, // 缩略图
			showMore: {
				type: Boolean,
				default: false
			},
			prefixShow: {
				type: Boolean,
				default: false
			},
			prefixIcon: {
				type: String,
				default: ''
			},
			prefixIconColor: {
				type: String,
				default: ''
			},
			textPrefixIcon: {
				type: String,
				default: ''
			}
			
		},
		data() {
			return {

			}
		},
		methods: {
			onClick() {
				this.$emit('itemClick')
			},
			onSwitchChange(e) {
				this.$emit('switchChange', e.detail)
			},
			itemMoreClick(e) {
				this.$emit('itemMoreClick', e);
			}
		}
	}
</script>

<style>
	@charset "UTF-8";

	.uni-list-item {
		font-size: 32upx;
		position: relative;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: center
	}

	.uni-list-item--disabled {
		opacity: .3
	}

	.uni-list-item--hover {
		background-color: #f1f1f1
	}

	.uni-list-item__container {
		padding: 24upx 30upx;
		width: 100%;
		box-sizing: border-box;
		flex: 1;
		position: relative;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center
	}

	.uni-list-item__container:after {
		position: absolute;
		z-index: 3;
		right: 0;
		bottom: 0;
		left: 30upx;
		height: 1px;
		content: '';
		-webkit-transform: scaleY(.5);
		transform: scaleY(.5);
		background-color: #c8c7cc
	}

	.uni-list-item__content {
		flex: 1;
		overflow: hidden;
		display: flex;
		flex-direction: column
	}

	.uni-list-item__content-title {
		font-size: 32upx;
		text-overflow: ellipsis;
		white-space: nowrap;
		color: inherit;
		line-height: 1.5;
		overflow: hidden
	}

	.uni-list-item__content-note {
		color: #999;
		font-size: 28upx;
		white-space: normal;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden
	}

	.uni-list-item__extra {
		width: 25%;
		display: flex;
		flex-direction: row;
		justify-content: flex-end;
		align-items: center
	}

	.uni-list-item__icon {
		margin-right: 18upx;
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center
	}

	.uni-list-item__icon-img {
		height: 60upx;
		width: 60upx
	}

	.uni-list>.uni-list-item:last-child .uni-list-item-container:after {
		height: 0
	}
</style>