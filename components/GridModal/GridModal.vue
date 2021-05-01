<template>
	<view class="cu-modal bottom-modal" :class="showModal?'show':''"  @tap="hideModal">
		<view class="cu-dialog text-start">
			<view class="cu-list grid" :class="['col-3','no-border']">
				<view class="cu-item" v-for="(item,index) in cuIconList" :key="index" @click="handleClick(item.clickAction)">
					<view :class="['cuIcon-' + item.cuIcon,'text-' + item.color]"></view>
					<text>{{item.name}}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name:"GridModal",
		props: {
			showModal: {
				type: Boolean,
				default: false
			},
			cuIconList: {
				type: Array,
				//{cuIcon, name, color}
				default: []
			}
		},
		data() {
			return {
				
			};
		},
		methods: {
			hideModal() {
				this.$emit("hideModal");
			},
			handleClick(actionKey) {
				this.$emit("handleAction", actionKey);
			}
		}
	}
</script>

<style lang="scss">

</style>
