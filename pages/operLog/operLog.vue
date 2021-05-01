<template>
	<view>
		<cmd-nav-bar :pathBack="true"  @pathBack="pathBack" :title="title"></cmd-nav-bar>
		<cmd-page-body type="top">
			<t-table>
				 <t-tr>
					<t-th>操作时间</t-th>
					<t-th>操作</t-th>
				</t-tr>
				<t-tr v-for="(item, index) in tableList" :key="index">
					<t-td>{{ item.operTime }}</t-td>
					<t-td>{{ item.operDetail }}</t-td>
				</t-tr>
			</t-table>
		</cmd-page-body>
	</view>
</template>

<script>
	import CmdNavBar from "@/components/cmd-nav-bar/cmd-nav-bar.vue";
	import cmdPageBody from "@/components/cmd-page-body/cmd-page-body.vue";
	import tTable from "@/components/t-table/t-table.vue";
	import tTh from '@/components/t-table/t-th.vue';
	import tTr from '@/components/t-table/t-tr.vue';
	import tTd from '@/components/t-table/t-td.vue';
	import {mapState} from 'vuex';
	export default {
		components: {
			CmdNavBar,
			cmdPageBody,
			tTable,
			tTh,
			tTr,
			tTd
		},
		data() {
			return {
				title: '操作日志',
				// {
				// 	operTime: '8:00',
				// 	operDetail: "删除文件 123.jpg",
				// 	 operRes: 'success'
				// }
				tableList: []
			}
		},
		computed: {
			...mapState({
				hasLogin: state => state.loginStatusInfo.hasLogin,
				userSession: state => state.loginStatusInfo.userSession
			}),
		},
		methods: {
			pathBack() {
				uni.navigateBack();
			},
			async getOperLogs() {
				const res = await this.$http.request({
					url: "/storage/getAllLogs",
					method:"GET",
					header: {
						userSession: this.userSession
					},
					data: {
						dayCount: 3
					}
				});
				const data = res.data;
				this.tableList = data.map(item => {
					return {
						operTime: item.operTime.split('T').join(" "),
						operDetail: item.operDes
					}
				})
				
			}
		},
		async created() {
			await this.getOperLogs();
		}
	}
</script>

<style>

</style>
