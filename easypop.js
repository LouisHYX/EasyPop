/**
 * 弹窗插件——EasyPop
 */

(function (win, doc) {
    "use strict";

    var instance = null;  //定义插件实例
    var defaults = {  //默认配置参数
        cfm: {
            content: "欢迎使用EasyPop~!",  //内容
            button: {  //操作按钮,数组参数依次为:文字,样式,事件;按钮最多支持三个,背景颜色可选参数:major,minor
                0: ["确定", "major", function () {
                    alert("该按钮暂未绑定事件");
                }]
            },
            position: "default",  //位置,"default"或"x y"
            drag: true,  //弹窗是否可拖拽
            callback: null  //弹窗关闭后的回调
        },
        msg: {
            content: "欢迎使用EasyPop~!",  //消息内容
            position: "default",  //位置,"default"或"x y"
            fade: 3,  //何时关闭插件,单位:秒
            callback: null  //弹窗关闭后的回调
        }
    };

    /**
     * 判断用户浏览器类型  //私有
     * @returns {*}
     */
    function whichBrowser() {
        var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
        var isOpera = userAgent.indexOf("Opera") > -1;

        //判断是否Chrome浏览器
        if (userAgent.indexOf("Chrome") > -1) {
            return "Chrome";
        }

        //判断是否Firefox浏览器
        if (userAgent.indexOf("Firefox") > -1) {
            return "FF";
        }

        //判断是否Safari浏览器
        if (userAgent.indexOf("Safari") > -1) {
            return "Safari";
        }

        //判断是否Opera浏览器
        if (isOpera) {
            return "Opera";
        }

        //判断是否IE浏览器
        if (userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1 && !isOpera) {
            return "IE";
        }
    }

    /**
     * 将字符串转换为Node(String ==> Node)  //私有
     * @param str  //要操作的字符串--String
     * @returns {NodeList}
     */
    function switchNode(str) {  //创建一个临时盒子来承载DOM结构,再将其删除并返回剩余节点
        var temp_obj = document.createElement("div");
        temp_obj.innerHTML = str;
        return temp_obj.childNodes;
    }

    /**
     * 将用户定义的参数与默认参数进行合并(深拷贝)  //私有
     * @param cus  //用户传入的参数--object
     * @param def  //插件默认的参数--object
     * @returns {{}}
     */
    function comParams(cus, def) {
        var res = {};  //需要返回的结果
        if (cus === undefined) {
            cus = {};
        }

        //判断参数是否为object,返回true或false
        function isObject(o) {
            return Object.prototype.toString.call(o) === '[object Object]';
        }

        for (var key in def) {
            if (def.hasOwnProperty(key)) {  //默认参数是否具有key属性
                if (cus.hasOwnProperty(key)) {  //自定义参数是否具有key属性
                    if (isObject(def[key]) && isObject(cus[key])) {  //默认参数与自定义参数的key属性是否都是object
                        comParams(cus[key], def[key]);  //key属性都为object就进行递归
                    } else {
                        res[key] = {};  //如果其中一个key属性不是object,那就赋值为{}
                    }
                    res[key] = cus[key];  //如果key属性都不为object就赋值为自定义参数的key属性
                } else {
                    res[key] = def[key];  //如果自定义参数没有key属性,就赋值为默认参数的key属性
                }
            }
        }
        return res;
    }

    /**
     * 插件主体
     */
    var EasyPop = (function () {
        var pageSize = [];  //当前页面宽高
        switch (whichBrowser()) {
            case "Chrome":
            case "FF":
            case "Safari":
            case "Opera":
                if (window.innerWidth && window.innerHeight) {
                    pageSize = [window.innerWidth, window.innerHeight];
                }
                break;
            case "IE":
                if (document.body && document.body.clientWidth) {
                    pageSize = [document.body.clientWidth, document.body.clientHeight];
                }
                break;
        }

        var currentPop = null;  //当前弹窗主体
        var mask = null;  //背景蒙层
        var moveBox = null;  //弹窗可拖拽区域
        var closeBtn = null;  //cfm右上角的关闭按钮
        var btnBox = null;  //cfm弹窗操作按钮外盒子
        var btnArr = [];  //cfm弹窗操作按钮数组

        /**
         * 插件构造函数
         * @param type  //弹窗类型--string
         * @param options  //用户传入的配置参数--object
         * @constructor
         */
        function EasyPop(type, options) {
            this.type = type || "cfm";
            switch (this.type) {
                case "cfm":
                    this.config = comParams(options, defaults.cfm);
                    break;
                case "msg":
                    this.config = comParams(options, defaults.msg);
                    break;
            }
            this.open();
        }

        EasyPop.prototype = {

            /**
             * 开启插件(初始化弹窗DOM结构,进行定位,添加动效)
             */
            open: function () {
                var me = this;
                switch (me.type) {
                    case "cfm":
                        var cfmHtml = "<div class='cfm-box'><div class='cfm-move-box' id='cfm-move-box'><a class='cfm-close' id='cfm-close' href='javascript:void(0);'></a></div>";
                        cfmHtml += "<p class='cfm-content'>" + me.config.content + "</p>";
                        cfmHtml += "<div class='cfm-button-box' id='cfm-button-box'>";
                        for (var n in me.config.button) {
                            if (me.config.button.hasOwnProperty(n)) {
                                if (n > 3) {
                                    break;
                                }
                                if (me.config.button[n][1] === "major") {
                                    cfmHtml += "<a class='cfm-button major'>" + me.config.button[n][0] + "</a>";
                                }
                                if (me.config.button[n][1] === "minor") {
                                    cfmHtml += "<a class='cfm-button minor'>" + me.config.button[n][0] + "</a>";
                                }
                            }
                        }

                        cfmHtml += "</div></div>";

                        mask = doc.body.appendChild(switchNode("<div class='black-mask'></div>")[0]);
                        currentPop = mask.appendChild(switchNode(cfmHtml)[0]);
                        currentPop.style.width = me.getSize()[0] + 1 + "px";  //定义cfm弹窗宽度,加1是因为offsetwidth取不到宽度小数,拖动弹窗到右边缘计算left值时,会由于值过大而造成宽度变窄

                        /*按钮宽度根据按钮数量来添加*/
                        btnArr = document.getElementsByClassName("cfm-button");
                        var btn_box_width = 0;
                        for (var num = 0; num < btnArr.length; num++) {
                            btn_box_width += btnArr[num].offsetWidth + 20;  //按钮盒子的宽度是单个按钮长度加上两边的margin
                        }
                        btnBox = document.getElementById("cfm-button-box");  //获取操作按钮父盒子
                        btnBox.style.width = btn_box_width + "px";

                        moveBox = document.getElementById("cfm-move-box");  //获取标题栏
                        if (me.config.drag === true || me.config.drag === undefined) {
                            moveBox.style.cursor = "move";
                        }
                        closeBtn = document.getElementById("cfm-close");  //获取关闭按钮
                        doc.body.style.overflow = "hidden";  //禁用body滚动条
                        break;
                    case "msg":
                        var msgHtml = "<div class='msg-box'>" + me.config.content + "</div>";
                        currentPop = doc.body.appendChild(switchNode(msgHtml)[0]);
                        break;
                }
                me._popPosition();  //插件主体定位
                me._showPop();  //开启动效
                me._bindEvent(); //绑定事件
            },

            /**
             * 关闭插件
             */
            close: function () {
                var me = this;
                switch (me.type) {
                    case "cfm":
                        mask.removeChild(currentPop);
                        doc.body.removeChild(mask);
                        break;
                    case "msg":
                        doc.body.removeChild(currentPop);
                        break;
                }

                doc.body.style.overflow = "auto";  //恢复body滚动条

                /*执行插件回调*/
                if (me.config.callback && typeof me.config.callback === "function") {
                    me.config.callback();
                }

                instance = null;  //删除插件实例
            },

            /**
             * 获取当前插件主体宽高的函数
             */
            getSize: function () {
                return [currentPop.offsetWidth, currentPop.offsetHeight];
            },

            /**
             * 插件主体位置
             */
            _popPosition: function () {
                var me = this;

                switch (me.type) {
                    case "cfm":
                        if (me.config.position.indexOf(" ") !== -1) {
                            cusPosition();
                        } else {
                            if (me.config.position === "default" || me.config.position === undefined) {
                                currentPop.style.left = (pageSize[0] - me.getSize()[0]) / 2 + "px";
                                currentPop.style.top = (pageSize[1] - me.getSize()[1]) / 2 + "px";
                            } else {
                                return;
                            }
                        }
                        break;
                    case "msg":
                        if (me.config.position.indexOf(" ") !== -1) {
                            cusPosition();
                        } else {
                            if (me.config.position === "default" || me.config.position === undefined) {
                                currentPop.style.left = (pageSize[0] - me.getSize()[0]) / 2 + "px";
                                currentPop.style.bottom = "20%";
                            } else {
                                return;
                            }
                        }
                        break;
                }

                function cusPosition() {  //用户自定义弹窗位置函数
                    var pos = me.config.position.split(" ");
                    for (var index = 0; index < pos.length; index++) {
                        if (pos[index] === "center") {
                            if (index === 0) {
                                currentPop.style.left = (pageSize[0] - me.getSize()[0]) / 2 + "px";
                            }
                            if (index === 1) {
                                currentPop.style.top = (pageSize[1] - me.getSize()[1]) / 2 + "px";
                            }
                        } else {
                            if (pos[index].indexOf("px") !== -1) {  //传入的参数为px,同时防止不合理数值
                                if (index === 0) {
                                    currentPop.style.left = Math.min(Number(pos[index].replace("px", "")), me._getLimit()[0]) + "px";
                                }
                                if (index === 1) {
                                    currentPop.style.top = Math.min(Number(pos[index].replace("px", "")), me._getLimit()[1]) + "px";
                                }
                            }
                            if (pos[index].indexOf("%") !== -1) {  //传入的参数为%,同时防止不合理数值
                                var limitPercent = [
                                    (me._getLimit()[0] / pageSize[0]) * 100,
                                    (me._getLimit()[1] / pageSize[1]) * 100
                                ];
                                if (index === 0) {
                                    currentPop.style.left = Math.min(Number(pos[index].replace("%", "")), limitPercent[0]) + "%";
                                }
                                if (index === 1) {
                                    currentPop.style.top = Math.min(Number(pos[index].replace("%", "")), limitPercent[1]) + "%";
                                }
                            }

                        }
                    }
                }
            },

            /**
             * 初始化事件
             */
            _bindEvent: function () {
                var me = this;
                var isDrag = false;  //是否可以拖动
                var m_offset = [];  //鼠标按下时相对于弹窗左上角的坐标

                if (me.type === "cfm") {
                    closeBtn.addEventListener("click", closePop);
                    btnBox.addEventListener("click", handleEvent);
                    if (me.config.drag) {  //如果配置参数drag为true则绑定事件
                        moveBox.addEventListener("mousedown", function (e) {
                            if (e.target.className !== "cfm-close") {
                                m_offset = [
                                    e.pageX - currentPop.offsetLeft,
                                    e.pageY - currentPop.offsetTop
                                ];
                                isDrag = true;
                            }
                        });
                        doc.addEventListener("mousemove", function (e) {
                            e.preventDefault();
                            var mousePos = [e.pageX, e.pageY];  //鼠标当前相对于页面的坐标
                            var popPos = [0, 0];  //弹窗新的坐标
                            if (isDrag) {
                                popPos = [
                                    mousePos[0] - m_offset[0],
                                    mousePos[1] - m_offset[1]
                                ];

                                popPos = [  //拖动范围限定
                                    Math.min(me._getLimit()[0], Math.max(0, popPos[0])),
                                    Math.min(me._getLimit()[1], Math.max(0, popPos[1]))
                                ];
                                currentPop.style.left = popPos[0] + "px";
                                currentPop.style.top = popPos[1] + "px";
                            }
                        });
                        doc.addEventListener("mouseup", function () {
                            isDrag = false;
                        });
                    }
                }

                function closePop() {  //关闭插件事件
                    me.close();
                    closeBtn.removeEventListener("click", closePop);
                }

                function handleEvent(e) {  //操作按钮事件
                    var btn = e.target;
                    for (var x = 0; x < btnArr.length; x++) {
                        if (btn === btnArr[x]) {
                            me.config.button[x][2](me/*传入插件主体,用户可以在操作按钮上执行特有方法*/);
                        }
                    }
                    btnBox.removeEventListener("click", handleEvent);
                }


            },

            /**
             * 插件显示动效
             */
            _showPop: function () {
                var me = this;
                currentPop.style.animation = "show 0.2s ease 1 forwards";

                /*如果是msg类型,则执行自动关闭功能*/
                if (me.type === "msg") {
                    if (me.config.fade) {
                        setTimeout(function () {
                            me.close();
                        }, me.config.fade * 1000);
                    } else {
                        setTimeout(function () {
                            me.close();
                        }, defaults.msg.fade * 1000);
                    }
                }
            },

            /**
             * 计算当前插件主体left与top可设置的极限值
             */
            _getLimit: function () {
                var me = this;
                return [  //弹窗可以移动的极限范围
                    pageSize[0] - me.getSize()[0],
                    pageSize[1] - me.getSize()[1]
                ];
            }

        };

        return EasyPop;
    })();

    win.EasyPop = function (type, options) {
        if (!instance) {  //单例(若不存在实例,则创建实例;若存在实例,则直接返回)
            instance = new EasyPop(type, options);
        }
        return instance;
    };

})(window, document);