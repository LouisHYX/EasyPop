# EasyPop

简介

EasyPop是一个用原生js编写的轻量级弹窗插件，只需少量的参数即可完成配置，目前拥有"cfm"和"msg"两种类型，同时支持必要的事件以及回调。

插件已上传至GitHub：

兼容性

Chrome、Firefox、Safari、IE10+

开始使用

将js与css代码添加到你的项目中：

<link href="YourPath/easypop.css" type="text/css" rel="stylesheet">
<script src="YourPath/easypop.js" type="text/javascript"></script>

之后通过如下方式激活弹窗：
EasyPop("msg"/*弹窗类型*/, {content: "欢迎使用EasyPop~!"}/*配置参数*/);

"cfm"类型

{
    content: "欢迎使用EasyPop~!",  //弹窗文字内容
    button: {  //操作按钮，最多设置0，1，2三个按钮，默认生成一个"major"样式的"确定"按钮
        0: ["确定", "major", function(param){}]  //依次为文字，样式(major或minor)，点击事件（使用形参来接收插件主体即可使用公有方法）
    },
    position: "default",  //弹窗初始位置，默认为"default"（页面上居中），也可以设置"x y"来自定义，必须写上px或%
    drag: true,  // 弹窗是否可拖拽，默认为true
    callback: null  //弹窗关闭后的回调函数，默认不设置
}

"msg"类型

{
    content: "欢迎使用EasyPop~!",  //弹窗文字内容
    position: "default",  //弹窗初始位置，默认为"default"（左右居中，距底边20%），也可以设置"x y"来自定义，必须写上px或%
    fade: 3,  // 弹窗何时消失，单位:秒，默认为3秒
    callback: null  //弹窗关闭后的回调函数，默认不设置
}

公有方法

open()：开启弹窗，并建立相关HTML元素

close()：关闭弹窗，并移除相关HTML元素

getSize()：获取当前弹窗的宽高，返回数组[number, number]
