<template>
  <div style="height: 100%;">
    <a-layout class="container">
      <a-layout-sider width="44" theme="light" class="select-area">
        <a-row>
          <div class="tab">基础</div>
          <node-list
            :nodeList="field.commonNodes"
            type="commonNodes"
            @setDragInfo="setDragInfo"
          />
        </a-row>
        <a-row>
          <div class="tab">高级</div>
          <node-list
            :nodeList="field.highNodes"
            type="highNodes"
            @setDragInfo="setDragInfo"
          />
        </a-row>
        <a-row>
          <div class="tab">泳道</div>
          <node-list
            :nodeList="field.laneNodes"
            type="laneNodes"
            @setDragInfo="setDragInfo"
          />
        </a-row>
      </a-layout-sider>
      <a-layout>
        <a-layout-header class="header-option">
          <div class="header-option__tools">
            <span v-for="tool in field.tools" :key="tool.type">
              <a-tooltip :title="tool.name" placement="right">
                <a-button
                  :icon="tool.icon"
                  size="small"
                  :type="currentTool.type === tool.type ? 'primary' : 'default'"
                  @click="selectTool(tool.type)"
                >
                </a-button>
              </a-tooltip>
            </span>
          </div>
          <div class="header-option__buttons">
            <a-tooltip title="保存流程" placement="bottom">
              <a-button
                @click="saveFlow"
                class="header-option-button"
                size="small"
                icon="save"
              ></a-button>
            </a-tooltip>
            <a-tooltip title="生成流程图片" placement="bottom">
              <a-button
                @click="exportFlowPicture"
                class="header-option-button"
                size="small"
                icon="picture"
              ></a-button>
            </a-tooltip>
            <a-popconfirm
              title="确认要重新绘制吗？"
              placement="bottom"
              okText="确认"
              cancelText="取消"
              @confirm="clear"
            >
              <a-tooltip title="重新绘制" placement="bottom">
                <a-button
                  class="header-option-button"
                  size="small"
                  icon="delete"
                ></a-button>
              </a-tooltip>
            </a-popconfirm>
            <a-tooltip :title="flowData.config.showGridText" placement="bottom">
              <a-button
                @click="toggleShowGrid"
                class="header-option-button"
                size="small"
                :icon="flowData.config.showGridIcon"
              >
              </a-button>
            </a-tooltip>
            <a-tooltip title="设置" placement="bottom">
              <a-button
                @click="setting"
                class="header-option-button"
                size="small"
                icon="setting"
              ></a-button>
            </a-tooltip>
            <a-tooltip title="测试" placement="bottom">
              <a-button
                @click="openTest"
                class="header-option-button"
                size="small"
                icon="tool"
              ></a-button>
            </a-tooltip>
            <a-popconfirm
              title="请选择帮助项："
              placement="bottom"
              okType="default"
              okText="快捷键大全"
              cancelText="使用文档"
              @confirm="shortcutHelper"
              @cancel="usingDoc"
            >
              <a-icon slot="icon" type="question-circle-o" style="color: red" />
              <a-tooltip title="帮助" placement="bottom">
                <a-button
                  class="header-option-button"
                  size="small"
                  icon="book"
                ></a-button>
              </a-tooltip>
            </a-popconfirm>
            <a-tooltip title="退出" placement="bottom">
              <a-button
                @click="exit"
                class="header-option-button"
                size="small"
                icon="logout"
              ></a-button>
            </a-tooltip>
          </div>
        </a-layout-header>
        <a-layout-content class="content">
          <flow-area
            ref="flowArea"
            :dragInfo="dragInfo"
            :browserType="browserType"
            :flowData="flowData"
            :select.sync="currentSelect"
            :selectGroup.sync="currentSelectGroup"
            :plumb="plumb"
            :currentTool="currentTool"
            @findNodeConfig="findNodeConfig"
            @selectTool="selectTool"
            @getShortcut="getShortcut"
            @saveFlow="saveFlow"
          >
          </flow-area>
          <vue-context-menu
            :contextMenuData="linkContextMenuData"
            @deleteLink="deleteLink"
          >
          </vue-context-menu>
        </a-layout-content>
        <a-layout-footer class="foot">
          <span>VFDP {{ info.version }}, Powered by {{ info.author }}</span>
        </a-layout-footer>
      </a-layout>
      <a-layout-sider
        width="250"
        theme="light"
        class="attr-area"
        @mousedown.stop="loseShortcut"
      >
        <flow-attr
          :plumb="plumb"
          :flowData="flowData"
          :select.sync="currentSelect"
        ></flow-attr>
      </a-layout-sider>
    </a-layout>
    <a-modal
      :title="'流程设计图_' + flowData.attr.id + '.png'"
      centered
      width="90%"
      :closable="flowPicture.closable"
      :maskClosable="flowPicture.maskClosable"
      :visible="flowPicture.modalVisible"
      okText="下载到本地"
      cancelText="取消"
      @ok="downLoadFlowPicture"
      @cancel="cancelDownLoadFlowPicture"
    >
      <img :src="flowPicture.url" style="width: 100%" />
    </a-modal>
    <setting-modal ref="settingModal"></setting-modal>
    <shortcut-modal ref="shortcutModal"></shortcut-modal>
    <test-modal ref="testModal" @loadFlow="loadFlow"></test-modal>
  </div>
</template>

<script>
import jsplumb from "jsplumb";
import {
  tools,
  commonNodes,
  highNodes,
  laneNodes
} from "./config/basic-node-config.js";
import { flowConfig } from "./config/args-config.js";
import html2canvas from "html2canvas";
import canvg from "canvg";
import { AMS } from "./util/AMS.js";
import FlowArea from "./modules/FlowArea";
import FlowAttr from "./modules/FlowAttr";
import SettingModal from "./modules/SettingModal";
import ShortcutModal from "./modules/ShortcutModal";
import TestModal from "./modules/TestModal";
import NodeList from "./modules/NodeList";

export default {
  name: "vfdp",
  components: {
    jsplumb,
    flowConfig,
    html2canvas,
    canvg,
    FlowArea,
    FlowAttr,
    SettingModal,
    ShortcutModal,
    TestModal,
    NodeList
  },
  mounted() {
    // 浏览器兼容性
    this.dealCompatibility();
    // 实例化JsPlumb
    this.initJsPlumb();
    // 初始化快捷键
    this.listenShortcut();
    // 初始化流程图
    this.initFlow();
    // 关闭提示
    this.listenPage();
  },
  data() {
    return {
      info: {
        version: "1.0.0",
        author: "前端爱码士",
        gitee: "https://gitee.com/zhangyeping/vue-flow-design-plus"
      },
      browserType: 3,
      plumb: {},
      field: {
        tools: tools,
        commonNodes: commonNodes,
        highNodes: highNodes,
        laneNodes: laneNodes
      },
      flowData: {
        nodeList: [],
        linkList: [],
        attr: {
          id: ""
        },
        config: {
          showGrid: true,
          showGridText: "隐藏网格",
          showGridIcon: "eye"
        },
        status: flowConfig.flowStatus.CREATE,
        remarks: []
      },
      currentTool: {
        type: "drag",
        icon: "drag",
        name: "拖拽"
      },
      currentSelect: {},
      currentSelectGroup: [],
      activeShortcut: true, // 画布聚焦开启快捷键
      linkContextMenuData: flowConfig.contextMenu.link,
      flowPicture: {
        url: "",
        modalVisible: false,
        closable: false,
        maskClosable: false
      },
      dragInfo: {
        type: "",
        belongTo: ""
      }
    };
  },
  methods: {
    // 设置dragInfo
    setDragInfo(info) {
      this.dragInfo = info;
    },
    // 获取浏览器类型
    getBrowserType() {
      let userAgent = navigator.userAgent;
      let isOpera = userAgent.indexOf("Opera") > -1;
      if (isOpera) {
        return 1;
      }

      if (userAgent.indexOf("Firefox") > -1) {
        return 2;
      }
      if (userAgent.indexOf("Chrome") > -1) {
        return 3;
      }
      if (userAgent.indexOf("Safari") > -1) {
        return 4;
      }
      if (
        userAgent.indexOf("compatible") > -1 &&
        userAgent.indexOf("MSIE") > -1 &&
        !isOpera
      ) {
        alert("IE浏览器支持性较差，推荐使用Firefox或Chrome");
        return 5;
      }
      if (userAgent.indexOf("Trident") > -1) {
        alert("Edge浏览器支持性较差，推荐使用Firefox或Chrome");
        return 6;
      }
    },
    // 浏览器兼容性
    dealCompatibility() {
      this.browserType = this.getBrowserType();
      if (this.browserType === 2) {
        flowConfig.shortcut.scaleContainer = {
          code: 16,
          codeName: "SHIFT(chrome下为ALT)",
          shortcutName: "画布缩放"
        };
      }
    },
    // 实例化JsPlumb
    initJsPlumb() {
      this.plumb = jsPlumb.getInstance(flowConfig.jsPlumbInsConfig);

      this.plumb.bind("beforeDrop", info => {
        let sourceId = info.sourceId;
        let targetId = info.targetId;

        if (sourceId === targetId) return false;
        let filter = this.flowData.linkList.filter(
          link => link.sourceId === sourceId && link.targetId === targetId
        );
        if (filter.length > 0) {
          this.$message.error("同方向的两节点连线只能有一条！");
          return false;
        }
        return true;
      });

      this.plumb.bind("connection", conn => {
        let connObj = conn.connection.canvas;
        let o = {},
          id,
          label;
        if (
          this.flowData.status === flowConfig.flowStatus.CREATE ||
          this.flowData.status === flowConfig.flowStatus.MODIFY
        ) {
          id = "link-" + AMS.getId();
          label = "";
        } else if (this.flowData.status === flowConfig.flowStatus.LOADING) {
          let l = this.flowData.linkList[this.flowData.linkList.length - 1];
          id = l.id;
          label = l.label;
        }
        connObj.id = id;
        o.type = "link";
        o.id = id;
        o.sourceId = conn.sourceId;
        o.targetId = conn.targetId;
        o.label = label;
        o.cls = {
          linkType: flowConfig.jsPlumbInsConfig.Connector[0],
          linkColor: flowConfig.jsPlumbInsConfig.PaintStyle.stroke,
          linkThickness: flowConfig.jsPlumbInsConfig.PaintStyle.strokeWidth
        };
        document.querySelector("#" + id).addEventListener("contextmenu", e => {
          this.showLinkContextMenu(e);
          this.currentSelect = this.flowData.linkList.filter(
            l => l.id === id
          )[0];
        });

        document.querySelector("#" + id).addEventListener("click", e => {
          let event = window.event || e;
          event.stopPropagation();
          this.currentSelect = this.flowData.linkList.filter(
            l => l.id === id
          )[0];
        });

        if (this.flowData.status !== flowConfig.flowStatus.LOADING)
          this.flowData.linkList.push(o);
      });

      this.plumb.importDefaults({
        ConnectionsDetachable: flowConfig.jsPlumbConfig.conn.isDetachable
      });
    },
    // 初始化快捷键
    listenShortcut() {
      document.onkeydown = e => {
        let event = window.event || e;

        // 画布聚焦开启快捷键
        if (!this.activeShortcut) return;
        let key = event.keyCode;

        switch (key) {
          case flowConfig.shortcut.multiple.code:
            this.$refs.flowArea.rectangleMultiple.flag = true;
            break;
          case flowConfig.shortcut.dragContainer.code:
            this.$refs.flowArea.container.dragFlag = true;
            break;
          case flowConfig.shortcut.scaleContainer.code:
            this.$refs.flowArea.container.scaleFlag = true;
            break;
          case flowConfig.shortcut.dragTool.code:
            this.selectTool("drag");
            break;
          case flowConfig.shortcut.connTool.code:
            this.selectTool("connection");
            break;
          case flowConfig.shortcut.zoomInTool.code:
            this.selectTool("zoom-in");
            break;
          case flowConfig.shortcut.zoomOutTool.code:
            this.selectTool("zoom-out");
            break;
          case flowConfig.shortcut.leftMove.code:
            this.moveNode("left");
            break;
          case flowConfig.shortcut.upMove.code:
            this.moveNode("up");
            break;
          case flowConfig.shortcut.rightMove.code:
            this.moveNode("right");
            break;
          case flowConfig.shortcut.downMove.code:
            this.moveNode("down");
            break;
        }

        if (event.ctrlKey) {
          if (event.altKey) {
            switch (key) {
              case flowConfig.shortcut.settingModal.code:
                this.setting();
                break;
              case flowConfig.shortcut.testModal.code:
                this.openTest();
                break;
            }
          }
        }
      };
      // 拖拽、缩放、多选快捷键复位
      document.onkeyup = e => {
        let event = window.event || e;

        let key = event.keyCode;
        if (key === flowConfig.shortcut.dragContainer.code) {
          this.$refs.flowArea.container.dragFlag = false;
        } else if (key === flowConfig.shortcut.scaleContainer.code) {
          event.preventDefault();
          this.$refs.flowArea.container.scaleFlag = false;
        } else if (key === flowConfig.shortcut.multiple.code) {
          this.$refs.flowArea.rectangleMultiple.flag = false;
        }
      };
    },
    // 关闭提示
    listenPage() {
      window.onbeforeunload = function(e) {
        e = e || window.event;
        if (e) {
          e.returnValue = "关闭提示";
        }
        return "关闭提示";
      };
    },
    // 初始化流程图
    initFlow() {
      if (this.flowData.status === flowConfig.flowStatus.CREATE) {
        this.flowData.attr.id = "flow-" + AMS.getId();
      } else {
        this.loadFlow();
      }
    },
    // 渲染流程
    loadFlow(json) {
      this.clear();
      this.$nextTick(() => {
        let loadData = JSON.parse(json);
        this.flowData.attr = loadData.attr;
        this.flowData.config = loadData.config;
        this.flowData.status = flowConfig.flowStatus.LOADING;
        this.plumb.batch(() => {
          let nodeList = loadData.nodeList;
          nodeList.forEach(node => {
            this.flowData.nodeList.push(node);
          });
          let linkList = loadData.linkList;
          this.$nextTick(() => {
            linkList.forEach(link => {
              this.flowData.linkList.push(link);
              let conn = this.plumb.connect({
                source: link.sourceId,
                target: link.targetId,
                anchor: flowConfig.jsPlumbConfig.anchor.default,
                connector: [
                  link.cls.linkType,
                  {
                    gap: 5,
                    cornerRadius: 8,
                    alwaysRespectStubs: true
                  }
                ],
                paintStyle: {
                  stroke: link.cls.linkColor,
                  strokeWidth: link.cls.linkThickness
                }
              });
              let link_id = conn.canvas.id;
              let labelHandle = e => {
                let event = window.event || e;
                event.stopPropagation();
                this.currentSelect = this.flowData.linkList.filter(
                  l => l.id === link_id
                )[0];
              };

              if (link.label !== "") {
                conn.setLabel({
                  label: link.label,
                  cssClass: `linkLabel ${link_id}`
                });

                // 添加label点击事件
                document
                  .querySelector("." + link_id)
                  .addEventListener("click", labelHandle);
              } else {
                if (document.querySelector("." + link_id)) {
                  // 移除label点击事件
                  document
                    .querySelector("." + link_id)
                    .removeEventListener("click", labelHandle);
                }
              }
            });
            this.currentSelect = {};
            this.currentSelectGroup = [];
            this.flowData.status = flowConfig.flowStatus.MODIFY;
          });
        }, true);
        let canvasSize = this.computeCanvasSize();
        this.$refs.flowArea.container.pos = {
          top: -canvasSize.minY + 100,
          left: -canvasSize.minX + 100
        };
      });
    },
    // 查找相关节点
    findNodeConfig(belongTo, type, callback) {
      let node = null;
      switch (belongTo) {
        case "commonNodes":
          node = commonNodes.filter(n => n.type === type);
          break;
        case "highNodes":
          node = highNodes.filter(n => n.type === type);
          break;
        case "laneNodes":
          node = laneNodes.filter(n => n.type === type);
          break;
      }
      if (node && node.length >= 0) node = node[0];
      callback(node);
    },
    // 设置工具
    selectTool(type) {
      let tool = tools.filter(t => t.type === type);
      if (tool && tool.length >= 0) this.currentTool = tool[0];

      switch (type) {
        case "drag":
          this.changeToDrag();
          break;
        case "connection":
          this.changeToConnection();
          break;
        case "zoom-in":
          this.changeToZoomIn();
          break;
        case "zoom-out":
          this.changeToZoomOut();
          break;
      }
    },
    // 切换为拖拽
    changeToDrag() {
      this.flowData.nodeList.forEach(node => {
        let f = this.plumb.toggleDraggable(node.id);
        if (!f) {
          this.plumb.toggleDraggable(node.id);
        }
        if (node.type !== "x-lane" && node.type !== "y-lane") {
          this.plumb.unmakeSource(node.id);
          this.plumb.unmakeTarget(node.id);
        }
      });
    },
    // 切换为连线
    changeToConnection() {
      this.flowData.nodeList.forEach(node => {
        let f = this.plumb.toggleDraggable(node.id);
        if (f) {
          this.plumb.toggleDraggable(node.id);
        }
        if (node.type !== "x-lane" && node.type !== "y-lane") {
          this.plumb.makeSource(
            node.id,
            flowConfig.jsPlumbConfig.makeSourceConfig
          );
          this.plumb.makeTarget(
            node.id,
            flowConfig.jsPlumbConfig.makeTargetConfig
          );
        }
      });

      this.currentSelect = {};
      this.currentSelectGroup = [];
    },
    // 切换为放大工具
    changeToZoomIn() {
      console.log("切换到放大工具");
    },
    // 切换为缩小工具
    changeToZoomOut() {
      console.log("切换到缩小工具");
    },
    // 检测流程数据有效性
    checkFlow() {
      let nodeList = this.flowData.nodeList;

      if (nodeList.length <= 0) {
        this.$message.error("流程图中无任何节点！");
        return false;
      }
      return true;
    },
    // 保存流程
    saveFlow() {
      let flowObj = Object.assign({}, this.flowData);

      if (!this.checkFlow()) return;
      flowObj.status = flowConfig.flowStatus.SAVE;
      let d = JSON.stringify(flowObj);
      this.$message.success("保存流程成功！请查看控制台。");
      return d;
    },
    // 生成流程图片
    exportFlowPicture() {
      if (!this.checkFlow()) return;

      let $Container = this.$refs.flowArea.$el.children[0],
        svgElems = $Container.querySelectorAll('svg[id^="link-"]'),
        removeArr = [];

      svgElems.forEach(svgElem => {
        let linkCanvas = document.createElement("canvas");
        let canvasId = "linkCanvas-" + AMS.getId();
        linkCanvas.id = canvasId;
        removeArr.push(canvasId);

        let svgContent = svgElem.outerHTML.trim();
        canvg(linkCanvas, svgContent);
        if (svgElem.style.position) {
          linkCanvas.style.position += svgElem.style.position;
          linkCanvas.style.left += svgElem.style.left;
          linkCanvas.style.top += svgElem.style.top;
        }
        $Container.appendChild(linkCanvas);
      });

      let canvasSize = this.computeCanvasSize();

      let pbd = flowConfig.defaultStyle.photoBlankDistance;
      let offsetPbd = AMS.div(pbd, 2);

      html2canvas($Container, {
        width: canvasSize.width + pbd,
        height: canvasSize.height + pbd,
        scrollX: -canvasSize.minX + offsetPbd,
        scrollY: -canvasSize.minY + offsetPbd,
        logging: false,
        onclone: () => {
          removeArr.forEach(id => {
            let currentNode = document.querySelector("#" + id);
            currentNode.parentNode.removeChild(currentNode);
          });
        }
      }).then(canvas => {
        let dataURL = canvas.toDataURL("image/png");
        this.flowPicture.url = dataURL;
        this.flowPicture.modalVisible = true;
      });
    },
    // 下载图片
    downLoadFlowPicture() {
      let alink = document.createElement("a");
      let alinkId = "alink-" + AMS.getId();
      alink.id = alinkId;
      alink.href = this.flowPicture.url;
      alink.download = "流程设计图_" + this.flowData.attr.id + ".png";
      alink.click();
    },
    // 取消下载
    cancelDownLoadFlowPicture() {
      this.flowPicture.url = "";
      this.flowPicture.modalVisible = false;
    },
    // 计算流程图宽高
    computeCanvasSize() {
      let nodeList = Object.assign([], this.flowData.nodeList),
        minX = nodeList[0].x,
        minY = nodeList[0].y,
        maxX = nodeList[0].x + nodeList[0].width,
        maxY = nodeList[0].y + nodeList[0].height;
      nodeList.forEach(node => {
        minX = Math.min(minX, node.x);
        minY = Math.min(minY, node.y);
        maxX = Math.max(maxX, node.x + node.width);
        maxY = Math.max(maxY, node.y + node.height);
      });
      let canvasWidth = maxX - minX;
      let canvasHeight = maxY - minY;
      return {
        width: canvasWidth,
        height: canvasHeight,
        minX: minX,
        minY: minY,
        maxX: maxX,
        maxY: maxY
      };
    },
    // 清除画布
    clear() {
      this.flowData.nodeList.forEach(node => {
        this.plumb.remove(node.id);
      });
      this.currentSelect = {};
      this.currentSelectGroup = [];
      this.flowData.nodeList = [];
      this.flowData.linkList = [];
      this.flowData.remarks = [];
    },
    // 显示隐藏网格
    toggleShowGrid() {
      let flag = this.flowData.config.showGrid;
      if (flag) {
        this.flowData.config.showGrid = false;
        this.flowData.config.showGridText = "显示网格";
        this.flowData.config.showGridIcon = "eye-invisible";
      } else {
        this.flowData.config.showGrid = true;
        this.flowData.config.showGridText = "隐藏网格";
        this.flowData.config.showGridIcon = "eye";
      }
    },
    // 设置
    setting() {
      this.$refs.settingModal.open();
    },
    // 快捷键大全
    shortcutHelper() {
      this.$refs.shortcutModal.open();
    },
    // 使用文档
    usingDoc() {
      window.open(this.info.gitee);
    },
    // 退出流程设计器
    exit() {
      this.$message.info("退出");
    },
    // 连接线右键
    showLinkContextMenu(e) {
      let event = window.event || e;

      event.preventDefault();
      event.stopPropagation();
      document.querySelector(".vue-contextmenuName-flow-menu").style.display =
        "none";
      document.querySelector(".vue-contextmenuName-node-menu").style.display =
        "none";
      let x = event.clientX;
      let y = event.clientY;
      this.linkContextMenuData.axis = { x, y };
    },
    // 删除线
    deleteLink() {
      let sourceId = this.currentSelect.sourceId;
      let targetId = this.currentSelect.targetId;
      this.plumb.deleteConnection(
        this.plumb.getConnections({
          source: sourceId,
          target: targetId
        })[0]
      );
      let linkList = this.flowData.linkList;
      linkList.splice(
        linkList.findIndex(
          link => link.sourceId === sourceId && link.targetId === targetId
        ),
        1
      );
      this.currentSelect = {};
    },
    // 设置快捷键失效
    loseShortcut() {
      this.activeShortcut = false;
    },
    // 设置快捷键启用
    getShortcut() {
      this.activeShortcut = true;
    },
    // 测试
    openTest() {
      let flowObj = Object.assign({}, this.flowData);
      this.$refs.testModal.flowData = flowObj;
      this.$refs.testModal.testVisible = true;
    },
    // 键盘移动节点
    moveNode(type) {
      let m = flowConfig.defaultStyle.movePx,
        isX = true;
      switch (type) {
        case "left":
          m = -m;
          break;
        case "up":
          m = -m;
          isX = false;
          break;
        case "right":
          break;
        case "down":
          isX = false;
      }

      if (this.currentSelectGroup.length > 0) {
        this.currentSelectGroup.forEach(node => {
          if (isX) {
            node.x += m;
          } else {
            node.y += m;
          }
        });
        this.plumb.repaintEverything();
      } else if (this.currentSelect.id) {
        if (isX) {
          this.currentSelect.x += m;
        } else {
          this.currentSelect.y += m;
        }
        this.plumb.repaintEverything();
      }
    }
  }
};
</script>

<style lang="less">
@import "./style/flow-designer.less";

.node-img {
  width: 14px;
  height: 14px;
  margin-right: 10px;
}
</style>
