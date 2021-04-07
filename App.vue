<script>
	export default {
		onLaunch: function() {
			// 从存储中获取登录状态，避免重复登录
			this.$store.commit("updateLoginStatusInfo", uni.getStorageSync("loginStatusInfo"));
			
			console.log('App Launch');
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	@import "colorui/main.css";
	@import "colorui/icon.css";
	/*每个页面公共css */
</style>
