<template>
  <view>
    <view class="person-head">
      <cmd-avatar :src="avatarUrl" @click="fnInfoWin" size="lg" :make="{'background-color': '#fff'}"></cmd-avatar>
      <view class="person-head-box">
        <view class="person-head-nickname">{{nickName}}</view>
		<view class="progress-box">
			<progress percent="80" activeColor="green" active stroke-width="3" />
		</view>
        <view class="person-size">占用空间（1.4G/2068G 0.07%）</view>
      </view>
    </view>
<!--    <view class="person-list">
      <cmd-cell-item title="帮助与反馈" slot-left arrow>
        <cmd-icon type="message" size="md" color="#368dff"></cmd-icon>
      </cmd-cell-item> -->
<!--      <cmd-cell-item title="切换账号" slot-left arrow>
        <cmd-icon type="equalizer" size="md" color="#368dff"></cmd-icon>
      </cmd-cell-item> -->
    <!-- </view> -->
	<view class="cu-list menu sm-border" >
		<view class="cu-item arrow" @click="toOperLogPage">
			<view class="content">
				<text class="cuIcon-list text-blue "></text>
				<text class="text-grey">操作日志</text>
			</view>
		</view>
		<view class="cu-item arrow">
			<view class="content">
				<text class="cuIcon-form text-grey"></text>
				<text class="text-grey">问题反馈</text>
			</view>
		</view>
	</view>
	
  </view>
</template>

<script>
  import cmdAvatar from "@/components/cmd-avatar/cmd-avatar.vue"
  import cmdIcon from "@/components/cmd-icon/cmd-icon.vue"
  import cmdCellItem from "@/components/cmd-cell-item/cmd-cell-item.vue"
  import {mapState} from 'vuex';
  export default {
    components: {
      cmdAvatar,
      cmdCellItem,
      cmdIcon
    },
    data() {
      return {};
    },
	computed: {
		...mapState({
			nickName: state => state.loginStatusInfo.nickName,
			avatarUrl: state => state.loginStatusInfo.avatarUrl
		})
	},
    methods: {
      /**
       * 打开用户信息页
       */
      fnInfoWin() {
        uni.navigateTo({
          url: '/pages/user/info/info'
        })
      },
	  toOperLogPage() {
		  uni.navigateTo({
		  	url: '/pages/operLog/operLog',
			success() {
				console.log("进入操作日志页");
			}
		  })
	  }
    }
  }
</script>

<style lang="scss">
  .person-head {
    display: flex;
    flex-direction: row;
    align-items: center;
	width: 100%;
    height: 150px;
    padding-left: 20rpx;
	padding-right: 20rpx;
	box-sizing: border-box;
    background: linear-gradient(to right, #365fff, #36bbff);
  }

  .person-head-box {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
	width: 100%;
	box-sizing: border-box;
    margin-left: 10rpx;
  }

  .person-head-nickname {
    font-size: 14px;
    font-weight: 500;
    color: #fff;
  }

  .person-size {
    font-size: 10px;
    font-weight: 500;
    color: #fff;
  }

  .person-list {
    line-height: 0;
  }
  .progress-box {
	margin: 10upx 0 5upx 0;
	width: 100%;
  	height: 20rpx;
  }
</style>
