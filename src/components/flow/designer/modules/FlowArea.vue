<template>
  <div style="width: 100%; height: 100%; overflow: hidden; position: relative;"
       @dragover="allowDrop"
       @drop="drop">
    <!--辅助线X-->
    <div v-if="container.auxiliaryLine.isOpen && container.auxiliaryLine.isShowXLine"
         class="auxiliary-line-x"
         :style="{ top: auxiliaryLinePos.y + 'px' }"></div>
    <!--辅助线Y-->
    <div v-if="container.auxiliaryLine.isOpen && container.auxiliaryLine.isShowYLine"
         class="auxiliary-line-y"
         :style="{ left: auxiliaryLinePos.x + 'px' }"></div>
    <div id="flowContainer"
         class="flow-container"
         :class="{ grid: flowData.config.showGrid, zoomIn: currentTool.type === 'zoom-in', zoomOut: currentTool.type === 'zoom-out', canScale: container.scaleFlag, canDrag: container.dragFlag, canMultiple: rectangleMultiple.flag }"
         :style="{ top: container.pos.top + 'px', left: container.pos.left + 'px', transform: 'scale(' + container.scale + ')', transformOrigin: container.scaleOrigin.x + 'px ' + container.scaleOrigin.y + 'px' }"
         @click.stop="containerHandler"
         @mousedown="mousedownHandler"
         @mousemove="mousemoveHandler"
         @mouseup="mouseupHandler"
         @mousewheel="scaleContainer"
         @DOMMouseScroll="scaleContainer"
         @contextmenu="showContainerContextMenu">
      <flow-node
        v-for="(node, index) in flowData.nodeList"
        :key="index"
        :node="node"
        :plumb="plumb"
        :select.sync="currentSelect"
        :selectGroup.sync="currentSelectGroup"
        :currentTool="currentTool"
        @showNodeContextMenu="showNodeContextMenu"
        @isMultiple="isMultiple"
        @updateNodePos="updateNodePos"
        @alignForLine="alignForLine"
        @hideAlignLine="hideAlignLine">
      </flow-node>
      <div class="rectangle-multiple"
           v-if="rectangleMultiple.flag && rectangleMultiple.multipling"
           :style="{ top: rectangleMultiple.position.top + 'px', left: rectangleMultiple.position.left + 'px', width: rectangleMultiple.width + 'px', height: rectangleMultiple.height + 'px' }">
      </div>
    </div>
    <div class="container-scale">
      缩放倍数：{{ container.scaleShow }}%
    </div>
    <div class="mouse-position">
      x: {{ mouse.position.x }}, y: {{ mouse.position.y }}
    </div>
    <vue-context-menu
      :contextMenuData="containerContextMenuData"
      @flowInfo="flowInfo"
      @paste="paste"
      @selectAll="selectAll"
      @saveFlow="saveFlow"
      @verticaLeft="verticaLeft"
      @verticalCenter="verticalCenter"
      @verticalRight="verticalRight"
      @levelUp="levelUp"
      @levelCenter="levelCenter"
      @levelDown="levelDown"
      @addRemark="addRemark">
    </vue-context-menu>
    <vue-context-menu
      :contextMenuData="nodeContextMenuData"
      @copyNode="copyNode"
      @deleteNode="deleteNode">
    </vue-context-menu>
  </div>
</template>

<script>
  import { flowConfig } from '../config/args-config.js'
  import $ from 'jquery'
  // import 'jquery-ui/ui/widgets/draggable'
  // import 'jquery-ui/ui/widgets/droppable'
  // import 'jquery-ui/ui/widgets/resizable'
  import { ZYP } from '../util/ZYP.js'
  import FlowNode from './FlowNode'

  export default {
    props: ['browserType', 'flowData', 'plumb', 'select', 'selectGroup', 'currentTool', 'dragInfo'],
    components: {
      FlowNode
    },
    mounted () {
      this.initFlowArea()
    },
    data () {
      return {
        ctx: null,
        currentSelect: this.select,
        currentSelectGroup: this.selectGroup,
        container: {
          pos: {
            top: -3000,
            left: -3000
          },
          dragFlag: false,
          draging: false,
          scale: flowConfig.defaultStyle.containerScale.init,
          scaleFlag: false,
          scaleOrigin: {
            x: 0, y: 0
          },
          scaleShow: ZYP.mul(flowConfig.defaultStyle.containerScale.init, 100),
          // 辅助线
          auxiliaryLine: {
            isOpen: flowConfig.defaultStyle.isOpenAuxiliaryLine,
            isShowXLine: false,
            isShowYLine: false,
            controlFnTimesFlag: true
          }
        },
        // 辅助线位置
        auxiliaryLinePos: {
          x: 0, y: 0
        },
        mouse: {
          position: {
            x: 0, y: 0
          },
          // 鼠标点击起始位置
          tempPos: {
            x: 0, y: 0
          }
        },
        // 鼠标划框多选
        rectangleMultiple: {
          flag: false, // 是否按了ctrl键
          multipling: false,
          position: {
            top: 0, left: 0
          },
          height: 0,
          width: 0
        },
        containerContextMenuData: flowConfig.contextMenu.container,
        nodeContextMenuData: flowConfig.contextMenu.node,
        // 当前聚焦的连接线ID
        tempLinkId: '',
        // 剪切板内容
        clipboard: []
      }
    },
    methods: {
      allowDrop (e) {
        e.preventDefault()
      },
      drop () {
        let belongTo = this.dragInfo.belongTo
        let type = this.dragInfo.type

        // 复位拖拽工具
        this.$emit('selectTool', 'drag')

        this.$emit('findNodeConfig', belongTo, type, node => {
          if (!node) {
            this.$message.error('未知的节点类型！')
            return
          }
          // 增加节点
          this.addNewNode(node)
        })
      },
      // 初始化画布
      initFlowArea () {
        const that = this
        that.ctx = document.getElementById('flowContainer').parentNode
        $('.flow-container').droppable({
          accept: function (t) {
            if (t[0].className.indexOf('node-item') != -1) {
              let event = window.event || 'firefox'
              if (that.ctx.contains(event.srcElement) || event == 'firefox') {
                return true
              }
            }
            return false
          },
          hoverClass: 'flow-container-active',
          drop: function (event, ui) {
            let belongTo = ui.draggable.attr('belongTo')
            let type = ui.draggable.attr('type')

            // 复位拖拽工具
            that.$emit('selectTool', 'drag')

            that.$emit('findNodeConfig', belongTo, type, node => {
              if (!node) {
                that.$message.error('未知的节点类型！')
                return
              }
              // 增加节点
              that.addNewNode(node)
            })
          }
        })
      },
      // 画布鼠标按下
      mousedownHandler (e) {
        const that = this

        let event = window.event || e

        if (event.button == 0) {
          if (that.container.dragFlag) {
            that.mouse.tempPos = that.mouse.position
            that.container.draging = true
          }

          that.currentSelectGroup = []
          if (that.rectangleMultiple.flag) {
            that.mouse.tempPos = that.mouse.position
            that.rectangleMultiple.multipling = true
          }
        }
      },
      // 画布鼠标移动
      mousemoveHandler (e) {
        const that = this

        let event = window.event || e

        if (event.target.id == 'flowContainer') {
          that.mouse.position = {
            x: event.offsetX,
            y: event.offsetY
          }
        } else {
          let cn = event.target.className
          let tn = event.target.tagName
          if (cn != 'lane-text' && cn != 'lane-text-div' && tn != 'svg' && tn != 'path' && tn != 'I') {
            that.mouse.position.x = event.target.offsetLeft + event.offsetX
            that.mouse.position.y = event.target.offsetTop + event.offsetY
          }
        }
        if (that.container.draging) {
          let nTop = that.container.pos.top + (that.mouse.position.y - that.mouse.tempPos.y)
          let nLeft = that.container.pos.left + (that.mouse.position.x - that.mouse.tempPos.x)
          if (nTop >= 0) nTop = 0
          if (nLeft >= 0) nLeft = 0
          that.container.pos = {
            top: nTop,
            left: nLeft
          }
        }
        if (that.rectangleMultiple.multipling) {
          let h = that.mouse.position.y - that.mouse.tempPos.y
          let w = that.mouse.position.x - that.mouse.tempPos.x
          let t = that.mouse.tempPos.y
          let l = that.mouse.tempPos.x
          if (h >= 0 && w < 0) {
            w = -w
            l -= w
          } else if (h < 0 && w >= 0) {
            h = -h
            t -= h
          } else if (h < 0 && w < 0) {
            h = -h
            w = -w
            t -= h
            l -= w
          }
          that.rectangleMultiple.height = h
          that.rectangleMultiple.width = w
          that.rectangleMultiple.position.top = t
          that.rectangleMultiple.position.left = l
        }
      },
      // 画布鼠标点击松开
      mouseupHandler () {
        const that = this

        if (that.container.draging) that.container.draging = false
        if (that.rectangleMultiple.multipling) {
          // 鼠标划框内的节点
          that.judgeSelectedNode()
          that.rectangleMultiple.multipling = false
          that.rectangleMultiple.width = 0
          that.rectangleMultiple.height = 0
        }
      },
      // 鼠标划框内的节点
      judgeSelectedNode () {
        const that = this

        let ay = that.rectangleMultiple.position.top
        let ax = that.rectangleMultiple.position.left
        let by = ay + that.rectangleMultiple.height
        let bx = ax + that.rectangleMultiple.width

        let nodeList = that.flowData.nodeList
        nodeList.forEach(function (node, index) {
          if (node.y >= ay && node.x >= ax && node.y <= by && node.x <= bx) {
            that.plumb.addToDragSelection(node.id)
            that.currentSelectGroup.push(node)
          }
        })
      },
      // 画布鼠标滚轴
      scaleContainer (e) {
        const that = this

        let event = window.event || e

        if (that.container.scaleFlag) {
          if (that.browserType == 2) {
            if (event.detail < 0) {
              that.enlargeContainer()
            } else {
              that.narrowContainer()
            }
          } else {
            if (event.deltaY < 0) {
              that.enlargeContainer()
            } else if (that.container.scale) {
              that.narrowContainer()
            }
          }
        }
      },
      // 画布放大
      enlargeContainer () {
        const that = this
        that.container.scaleOrigin.x = that.mouse.position.x
        that.container.scaleOrigin.y = that.mouse.position.y
        let newScale = ZYP.add(that.container.scale, flowConfig.defaultStyle.containerScale.onceEnlarge)
        if (newScale <= flowConfig.defaultStyle.containerScale.max) {
          that.container.scale = newScale
          that.container.scaleShow = ZYP.mul(that.container.scale, 100)
          that.plumb.setZoom(that.container.scale)
        }
      },
      // 画布缩小
      narrowContainer () {
        const that = this
        that.container.scaleOrigin.x = that.mouse.position.x
        that.container.scaleOrigin.y = that.mouse.position.y
        let newScale = ZYP.sub(that.container.scale, flowConfig.defaultStyle.containerScale.onceNarrow)
        if (newScale >= flowConfig.defaultStyle.containerScale.min) {
          that.container.scale = newScale
          that.container.scaleShow = ZYP.mul(that.container.scale, 100)
          that.plumb.setZoom(that.container.scale)
        }
      },
      // 画布右健
      showContainerContextMenu (e) {
        let event = window.event || e

        event.preventDefault()
        $('.vue-contextmenuName-node-menu').css('display', 'none')
        $('.vue-contextmenuName-link-menu').css('display', 'none')
        this.selectContainer()
        let x = event.clientX
        let y = event.clientY
        this.containerContextMenuData.axis = { x, y }
      },
      // 节点右键
      showNodeContextMenu (e) {
        let event = window.event || e

        event.preventDefault()
        $('.vue-contextmenuName-flow-menu').css('display', 'none')
        $('.vue-contextmenuName-link-menu').css('display', 'none')
        let x = event.clientX
        let y = event.clientY
        this.nodeContextMenuData.axis = { x, y }
      },
      // 流程图信息
      flowInfo () {
        const that = this

        let nodeList = that.flowData.nodeList
        let linkList = that.flowData.linkList
        alert('当前流程图中有 ' + nodeList.length + ' 个节点，有 ' + linkList.length + ' 条连线。')
      },
      // 粘贴
      paste () {
        const that = this
        let dis = 0
        that.clipboard.forEach(function (node, index) {
          let newNode = Object.assign({}, node)
          newNode.id = newNode.type + '-' + ZYP.getId()
          let nodePos = that.computeNodePos(that.mouse.position.x + dis, that.mouse.position.y + dis)
          newNode.x = nodePos.x
          newNode.y = nodePos.y
          dis += 20
          that.flowData.nodeList.push(newNode)
        })
      },
      // 全选
      selectAll () {
        const that = this
        that.flowData.nodeList.forEach(function (node, index) {
          that.plumb.addToDragSelection(node.id)
          that.currentSelectGroup.push(node)
        })
      },
      // 保存流程
      saveFlow () {
        this.$emit('saveFlow')
      },
      // 节点排列前校验节点数量
      checkAlign () {
        if (this.currentSelectGroup.length < 2) {
          this.$message.error('请选择至少两个节点！')
          return false
        }
        return true
      },
      // 垂直左对齐
      verticaLeft () {
        const that = this

        if (!that.checkAlign()) return
        let nodeList = that.flowData.nodeList
        let selectGroup = that.currentSelectGroup
        let baseX = selectGroup[0].x
        let baseY = selectGroup[0].y
        for (let i = 1; i < selectGroup.length; i++) {
          baseY = baseY + selectGroup[i - 1].height + flowConfig.defaultStyle.alignSpacing.vertical
          let f = nodeList.filter(n => n.id == selectGroup[i].id)[0]
          f.tx = baseX
          f.ty = baseY
          that.plumb.animate(selectGroup[i].id, { top: baseY, left: baseX }, {
            duration: flowConfig.defaultStyle.alignDuration,
            complete: function () {
              f.x = f.tx
              f.y = f.ty
            }
          })
        }
      },
      // 垂直居中
      verticalCenter () {
        const that = this

        if (!that.checkAlign()) return
        let nodeList = that.flowData.nodeList
        let selectGroup = that.currentSelectGroup
        let baseX = selectGroup[0].x
        let baseY = selectGroup[0].y
        let firstX = baseX
        for (let i = 1; i < selectGroup.length; i++) {
          baseY = baseY + selectGroup[i - 1].height + flowConfig.defaultStyle.alignSpacing.vertical
          baseX = firstX + ZYP.div(selectGroup[0].width, 2) - ZYP.div(selectGroup[i].width, 2)
          let f = nodeList.filter(n => n.id == selectGroup[i].id)[0]
          f.tx = baseX
          f.ty = baseY
          that.plumb.animate(selectGroup[i].id, { top: baseY, left: baseX }, {
            duration: flowConfig.defaultStyle.alignDuration,
            complete: function () {
              f.x = f.tx
              f.y = f.ty
            }
          })
        }
      },
      // 垂直右对齐
      verticalRight () {
        const that = this

        if (!that.checkAlign()) return
        let nodeList = that.flowData.nodeList
        let selectGroup = that.currentSelectGroup
        let baseX = selectGroup[0].x
        let baseY = selectGroup[0].y
        let firstX = baseX
        for (let i = 1; i < selectGroup.length; i++) {
          baseY = baseY + selectGroup[i - 1].height + flowConfig.defaultStyle.alignSpacing.vertical
          baseX = firstX + selectGroup[0].width - selectGroup[i].width
          let f = nodeList.filter(n => n.id == selectGroup[i].id)[0]
          f.tx = baseX
          f.ty = baseY
          that.plumb.animate(selectGroup[i].id, { top: baseY, left: baseX }, {
            duration: flowConfig.defaultStyle.alignDuration,
            complete: function () {
              f.x = f.tx
              f.y = f.ty
            }
          })
        }
      },
      // 水平上对齐
      levelUp () {
        const that = this

        if (!that.checkAlign()) return
        let nodeList = that.flowData.nodeList
        let selectGroup = that.currentSelectGroup
        let baseX = selectGroup[0].x
        let baseY = selectGroup[0].y
        for (let i = 1; i < selectGroup.length; i++) {
          baseX = baseX + selectGroup[i - 1].width + flowConfig.defaultStyle.alignSpacing.level
          let f = nodeList.filter(n => n.id == selectGroup[i].id)[0]
          f.tx = baseX
          f.ty = baseY
          that.plumb.animate(selectGroup[i].id, { top: baseY, left: baseX }, {
            duration: flowConfig.defaultStyle.alignDuration,
            complete: function () {
              f.x = f.tx
              f.y = f.ty
            }
          })
        }
      },
      // 水平居中
      levelCenter () {
        const that = this

        if (!that.checkAlign()) return
        let nodeList = that.flowData.nodeList
        let selectGroup = that.currentSelectGroup
        let baseX = selectGroup[0].x
        let baseY = selectGroup[0].y
        let firstY = baseY
        for (let i = 1; i < selectGroup.length; i++) {
          baseY = firstY + ZYP.div(selectGroup[0].height, 2) - ZYP.div(selectGroup[i].height, 2)
          baseX = baseX + selectGroup[i - 1].width + flowConfig.defaultStyle.alignSpacing.level
          let f = nodeList.filter(n => n.id == selectGroup[i].id)[0]
          f.tx = baseX
          f.ty = baseY
          that.plumb.animate(selectGroup[i].id, { top: baseY, left: baseX }, {
            duration: flowConfig.defaultStyle.alignDuration,
            complete: function () {
              f.x = f.tx
              f.y = f.ty
            }
          })
        }
      },
      // 水平下对齐
      levelDown () {
        const that = this

        if (!that.checkAlign()) return
        let nodeList = that.flowData.nodeList
        let selectGroup = that.currentSelectGroup
        let baseX = selectGroup[0].x
        let baseY = selectGroup[0].y
        let firstY = baseY
        for (let i = 1; i < selectGroup.length; i++) {
          baseY = firstY + selectGroup[0].height - selectGroup[i].height
          baseX = baseX + selectGroup[i - 1].width + flowConfig.defaultStyle.alignSpacing.level
          let f = nodeList.filter(n => n.id == selectGroup[i].id)[0]
          f.tx = baseX
          f.ty = baseY
          that.plumb.animate(selectGroup[i].id, { top: baseY, left: baseX }, {
            duration: flowConfig.defaultStyle.alignDuration,
            complete: function () {
              f.x = f.tx
              f.y = f.ty
            }
          })
        }
      },
      addRemark () {
        const that = this
        alert('添加备注(待完善)...')
      },
      // 复制节点
      copyNode () {
        const that = this

        that.clipboard = []
        if (that.currentSelectGroup.length > 0) {
          that.clipboard = Object.assign([], that.currentSelectGroup)
        } else if (that.currentSelect.id) {
          that.clipboard.push(that.currentSelect)
        }
      },
      // 查询删除节点关联的连接线
      getConnectionsByNodeId (nodeId) {
        const that = this
        let conns1 = that.plumb.getConnections({
          source: nodeId
        })
        let conns2 = that.plumb.getConnections({
          target: nodeId
        })
        return conns1.concat(conns2)
      },
      // 删除节点
      deleteNode () {
        const that = this
        let nodeList = that.flowData.nodeList
        let linkList = that.flowData.linkList
        let arr = []

        arr.push(Object.assign({}, that.currentSelect))

        arr.forEach(function (c, index) {
          let conns = that.getConnectionsByNodeId(c.id)
          console.log(conns)
          conns.forEach(function (conn, index) {
            linkList.splice(linkList.findIndex(link => (link.sourceId == conn.sourceId || link.targetId == conn.targetId)), 1)
          })
          that.plumb.deleteEveryEndpoint()
          let inx = nodeList.findIndex(node => node.id == c.id)
          nodeList.splice(inx, 1)
          that.$nextTick(() => {
            linkList.forEach(function (link, index) {
              let conn = that.plumb.connect({
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
              })
              if (link.label != '') {
                conn.setLabel({
                  label: link.label,
                  cssClass: 'linkLabel'
                })
              }
            })
          })
        })
        that.selectContainer()
      },
      // 增加画布节点
      addNewNode (node) {
        const that = this

        let x = that.mouse.position.x
        let y = that.mouse.position.y
        let nodePos = that.computeNodePos(x, y)
        x = nodePos.x
        y = nodePos.y

        let newNode = Object.assign({}, node)
        newNode.id = newNode.type + '-' + ZYP.getId()
        newNode.height = 50
        if (newNode.type == 'start' || newNode.type == 'end' ||
          newNode.type == 'event' || newNode.type == 'gateway') {
          newNode.x = x - 25
          newNode.width = 50
        } else {
          newNode.x = x - 60
          newNode.width = 120
        }
        newNode.y = y - 25
        if (newNode.type == 'x-lane') {
          newNode.height = 200
          newNode.width = 600
        } else if (newNode.type == 'y-lane') {
          newNode.height = 600
          newNode.width = 200
        }
        that.flowData.nodeList.push(newNode)
      },
      // x, y取整计算
      computeNodePos (x, y) {
        const pxx = flowConfig.defaultStyle.alignGridPX[0]
        const pxy = flowConfig.defaultStyle.alignGridPX[1]
        if (x % pxx) x = pxx - (x % pxx) + x
        if (y % pxy) y = pxy - (y % pxy) + y
        return {
          x: x,
          y: y
        }
      },
      // 点击画布
      containerHandler () {
        this.selectContainer()
        let toolType = this.currentTool.type
        if (toolType === 'zoom-in') {
          this.enlargeContainer()
        } else if (toolType === 'zoom-out') {
          this.narrowContainer()
        }
      },
      // 清除面布已选内容
      selectContainer () {
        this.currentSelect = {}
        // 开启快捷键
        this.$emit('getShortcut')
      },
      // 是否为多选行为
      isMultiple (callback) {
        callback(this.rectangleMultiple.flag)
      },
      // 更新组节点信息
      updateNodePos () {
        const that = this

        let nodeList = that.flowData.nodeList
        that.currentSelectGroup.forEach(function (node, index) {
          let l = parseInt($('#' + node.id).css('left'))
          let t = parseInt($('#' + node.id).css('top'))
          let f = nodeList.filter(n => n.id == node.id)[0]
          f.x = l
          f.y = t
        })
      },
      // 计算辅助线
      alignForLine (e) {
        const that = this

        if (that.selectGroup.length > 1) return
        if (that.container.auxiliaryLine.controlFnTimesFlag) {
          let elId = e.el.id
          let nodeList = that.flowData.nodeList
          nodeList.forEach(function (node, index) {
            if (elId != node.id) {
              let dis = flowConfig.defaultStyle.showAuxiliaryLineDistance,
                elPos = e.pos,
                elH = e.el.offsetHeight,
                elW = e.el.offsetWidth,
                disX = elPos[0] - node.x,
                disY = elPos[1] - node.y
              if ((disX >= -dis && disX <= dis) || ((disX + elW) >= -dis && (disX + elW) <= dis)) {
                that.container.auxiliaryLine.isShowYLine = true
                that.auxiliaryLinePos.x = node.x + that.container.pos.left
                let nodeMidPointX = node.x + (node.width / 2)
                if (nodeMidPointX == (elPos[0] + (elW / 2))) {
                  that.auxiliaryLinePos.x = nodeMidPointX + that.container.pos.left
                }
              }
              if ((disY >= -dis && disY <= dis) || ((disY + elH) >= -dis && (disY + elH) <= dis)) {
                that.container.auxiliaryLine.isShowXLine = true
                that.auxiliaryLinePos.y = node.y + that.container.pos.top
                let nodeMidPointY = node.y + (node.height / 2)
                if (nodeMidPointY == (elPos[1] + (elH / 2))) {
                  that.auxiliaryLinePos.y = nodeMidPointY + that.container.pos.left
                }
              }
            }
          })
          that.container.auxiliaryLine.controlFnTimesFlag = false
          setTimeout(function () {
            that.container.auxiliaryLine.controlFnTimesFlag = true
          }, 200)
        }
      },
      // 隐藏辅助线
      hideAlignLine () {
        if (this.container.auxiliaryLine.isOpen) {
          this.container.auxiliaryLine.isShowXLine = false
          this.container.auxiliaryLine.isShowYLine = false
        }
      }
    },
    watch: {
      select (val) {
        this.currentSelect = val
        // 清除连接线焦点
        if (this.tempLinkId !== '') {
          $('#' + this.tempLinkId).removeClass('link-active')
          this.tempLinkId = ''
        }
        // 设置连接线焦点
        if (this.currentSelect.type === 'link') {
          this.tempLinkId = this.currentSelect.id
          $('#' + this.currentSelect.id).addClass('link-active')
        }
      },
      currentSelect: {
        handler (val) {
          this.$emit('update:select', val)
        },
        deep: true
      },
      selectGroup (val) {
        this.currentSelectGroup = val
        if (this.currentSelectGroup.length <= 0) this.plumb.clearDragSelection()
      },
      currentSelectGroup: {
        handler (val) {
          this.$emit('update:selectGroup', val)
        },
        deep: true
      }
    }
  }
</script>

<style lang="scss">
  @import '../style/flow-area.scss';
</style>
