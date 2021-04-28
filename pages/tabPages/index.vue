<template>
  <view class="origin-container">
    <!-- 顶部导航栏组件 -->
    <cmd-nav-bar :pathBack="back" @pathBack="pathBack"  :title="title"></cmd-nav-bar>
    <!-- 内容区 start -->
    <cmd-page-body type="top-bottom">
      <cmd-transition v-if="current == 0" name="fade-up">
        <file-oper @changeFilePath="changeFilePath" @changeTitle="changeTitle" :curPath="filePath"></file-oper>
      </cmd-transition>
      <cmd-transition v-if="current == 1" name="fade-up">
        <person></person>
      </cmd-transition>
    </cmd-page-body>
    <!-- 内容区 end -->
    <!-- 底部导航栏组件 -->
    <cmd-bottom-nav background-color="#ffffff" font-color="#3665ff" active-font-color="#3669ff" @click="getBottomNavCurrent"
      :current="current" :list="list"></cmd-bottom-nav>
  </view>
</template>

<script>
  import fileOper from "./file-oper/index.vue";
  import person from "./person/person.vue";
  import cmdNavBar from "@/components/cmd-nav-bar/cmd-nav-bar.vue";
  import cmdBottomNav from "@/components/cmd-bottom-nav/cmd-bottom-nav.vue";
  import cmdPageBody from "@/components/cmd-page-body/cmd-page-body.vue";
  import cmdTransition from "@/components/cmd-transition/cmd-transition.vue";

  export default {
    components: {
	  fileOper,
      person,
      cmdBottomNav,
      cmdNavBar,
      cmdPageBody,
      cmdTransition
    },

    data() {
      return {
        bodyHeight: 0,
		backTag: '',
		filePath: '',
        title: '首页',
        // 底部导航栏的默认选中
        current: 0,
        // 底部导航栏的菜单项
        list: [{
            "pagePath": "/pages/bottom-nav/fileOper/fileOper",
            "text": "首页",
            "icon": "home3"
          },
          {
            "pagePath": "/pages/bottom-nav/person/person",
            "text": "个人",
            // 字体图标不可与图片共显
            "icon": "user-tie",
            // 以导入方式传入的图片最佳 import srcImg from "@/static/xxx.png"
            // src 大小限制为40kb，建议尺寸为 81px * 81px
            // "src": "../../static/home.png",
            // "srcSelect": "../../static/homeHL.png"
          }
        ]
      };
    },
	computed: {
		back() {
			return !!this.filePath;
		}
	},
    methods: {
      /**
       * 点击底部导航栏的菜单项
       * 得到的项进行跳转切换
       */
      getBottomNavCurrent(e) {
        this.current = e.select;
        this.title = e.item.text;
		this.filePath = '';
      },
	  changeTitle(folderName) {
		  this.title = folderName;
	  },
	  changeFilePath(newPath) {
		  this.filePath = newPath;
		  
	  },
	  pathBack() {
		  const pathArray = this.filePath.split('/');
		  if(pathArray.length >= 2){
					pathArray.pop();
					pathArray.pop();
					const pathArrayString = pathArray.join('/');
					this.filePath = !!pathArrayString ? pathArrayString+'/': '';
					console.log(this.filePath);
		  }
	  },
    },
	onLoad(val)  {
		if(val.path) {
			this.filePath = val.path+"/";
		}
	}
  }
</script>

<style>
	.origin-container {
		overflow: hidden;
	}

</style>
