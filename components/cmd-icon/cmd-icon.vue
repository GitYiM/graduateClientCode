<template>
	<view :class="[prefixClass, prefixClass+'-'+type]" :style="setStyle" @tap="$_click"></view>
</template>

<script>
	/**  
	 * 图标组件  
	 * @description 用于展示 icon。该组件的 icon 图形基于 Webfont，因此可任意放大、改变颜色。  
	 * @tutorial https://ext.dcloud.net.cn/plugin?id=175  
	 * @property {String} prefix-class 自定义字体图标库前缀 - 默认cmd-icon  
	 * @property {String} type 图标图案类型 - 列如：home、add  
	 * @property {String} color 图标颜色 - 默认白色  
	 * @property {Number} size 图标大小 - 默认24，单位px  
	 * @event {Function} click 图标组件点击事件  
	 * @example <cmd-icon type="bell" size="30" color="#654321"></cmd-icon>  
	 */
	export default {
		name: 'cmd-icon',

		props: {
			/**
			 * 自定义字体图标库前缀
			 */
			prefixClass: {
				type: String,
				default: 'cmd-icon'
			},
			/**
			 * 图标类型
			 */
			type: String,
			/**
			 * 图标颜色
			 */
			color: {
				type: String,
				default: '#fff'
			},
			/**
			 * 图标大小
			 */
			size: {
				type: [Number, String],
				default: '24'
			}
		},

		computed: {
			setStyle() {
				return `color:${this.color};
				font-size:${this.size}px;
				line-height:${this.size}px`
			}
		},

		methods: {
			$_click(e) {
				this.$emit('click', e)
			}
		}
	}
</script>

<style>
	@font-face {
		font-family: cmdicons;
		src: url('data:application/font-woff;charset=utf-8;base64,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') format('woff');
	}

	.cmd-icon {
		display: flex;
		font-family: cmdicons;
		font-style: normal;
		font-weight: 400;
		font-variant: normal;
		text-transform: none;
		text-rendering: auto;
		text-align: center;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		vertical-align: middle;
	}
	.cmd-icon-home3:before {
	  content: "\e902";
	}
	.cmd-icon-image:before {
	  content: "\e90d";
	}
	.cmd-icon-music:before {
	  content: "\e911";
	}
	.cmd-icon-film:before {
	  content: "\e913";
	}
	.cmd-icon-folder:before {
	  content: "\e92f";
	}
	.cmd-icon-folder-open:before {
	  content: "\e930";
	}
	.cmd-icon-folder-plus:before {
	  content: "\e931";
	}
	.cmd-icon-folder-minus:before {
	  content: "\e932";
	}
	.cmd-icon-folder-download:before {
	  content: "\e933";
	}
	.cmd-icon-folder-upload:before {
	  content: "\e934";
	}
	.cmd-icon-user-tie:before {
	  content: "\e976";
	}
	.cmd-icon-search:before {
	  content: "\e986";
	}
	.cmd-icon-eye:before {
	  content: "\e9ce";
	}
	.cmd-icon-eye-blocked:before {
	  content: "\e9d1";
	}
	.cmd-icon-more-filled:before {
	  content: "\eaa3";
	}
/* 	.cmd-icon-switch-over::before {
		content: "\e647";
	} */
</style>
