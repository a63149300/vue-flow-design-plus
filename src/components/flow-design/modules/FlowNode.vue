<template>
  <div v-if="node.type === 'start' || node.type === 'end' || node.type === 'event'"
       :id="node.id"
       class="common-circle-node"
       :class="{
         active: isActive(),
         isStart: node.type === 'start',
         isEnd: node.type === 'end'
       }"
       :style="{
         top: node.y + 'px',
         left: node.x + 'px',
         cursor: setCursor(currentTool.type)
       }"
       @click.stop="selectNode"
       @contextmenu.stop="showNodeContextMenu">
    {{ node.nodeName }}
  </div>

  <div v-else-if="node.type === 'common' || node.type === 'freedom' || node.type === 'child-flow'"
       :id="node.id"
       class="common-rectangle-node"
       :class="{ active: isActive() }"
       :style="{
         top: node.y + 'px',
         left: node.x + 'px',
         cursor: setCursor(currentTool.type)
       }"
       @click.stop="selectNode"
       @contextmenu.stop="showNodeContextMenu">
    <a-icon :type="setIcon(node.type)"
            class="node-icon"/>
    {{ node.nodeName }}
  </div>

  <div v-else-if="node.type === 'gateway'"
       :id="node.id"
       class="common-diamond-node"
       :class="{ active: isActive() }"
       :style="{
         top: node.y + 'px',
         left: node.x + 'px',
         cursor: setCursor(currentTool.type)
       }"
       @click.stop="selectNode"
       @contextmenu.stop="showNodeContextMenu">
  </div>

  <div v-else-if="node.type === 'x-lane'"
       :id="node.id"
       class="common-x-lane-node"
       :class="{ active: isActive() }"
       :style="{
         top: node.y + 'px',
         left: node.x + 'px',
         height: node.height + 'px',
         width: node.width + 'px',
       }">
    <div class="lane-text-div"
         :style="{cursor: setCursor(currentTool.type)}"
         @click.stop="selectNode"
         @contextmenu.stop="showNodeContextMenu">
      <span class="lane-text">{{ node.nodeName }}</span>
    </div>
  </div>

  <div v-else-if="node.type === 'y-lane'"
       :id="node.id"
       class="common-y-lane-node"
       :class="{ active: isActive() }"
       :style="{
         top: node.y + 'px',
         left: node.x + 'px',
         height: node.height + 'px',
         width: node.width + 'px',
       }">
    <div class="lane-text-div"
         :style="{cursor: setCursor(currentTool.type)}"
         @click.stop="selectNode"
         @contextmenu.stop="showNodeContextMenu">
      <span class="lane-text">{{ node.nodeName }}</span>
    </div>
  </div>

  <div v-else></div>
</template>

<script>
import { Resizable } from 'resizable-dom'

export default {
  props: ['select', 'selectGroup', 'node', 'plumb', 'currentTool', 'flowConfig'],
  mounted () {
    this.registerNode()
  },
  data () {
    return {
      currentSelect: this.select,
      currentSelectGroup: this.selectGroup
    }
  },
  methods: {
    // 设置ICON
    setIcon (type) {
      switch (type) {
        case 'common':
          return 'user'
        case 'freedom':
          return 'sync'
        case 'child-flow':
          return 'apartment'
        default:
          return 'tool'
      }
    },
    // 设置鼠标样式
    setCursor (type) {
      switch (type) {
        case 'drag':
          return 'move'
        case 'connection':
          return 'crosshair'
        default:
          return 'default'
      }
    },
    // 初始节点拖拽
    registerNode () {
      this.plumb.draggable(this.node.id, {
        containment: 'parent',
        handle: (e, el) => {
          // 判断节点类型
          let possibles = el.parentNode.querySelectorAll('.common-circle-node,.common-rectangle-node,.common-diamond-node,.lane-text-div')
          for (let i = 0; i < possibles.length; i++) {
            if (possibles[i] === el || e.target.className === 'lane-text') return true
          }
          return false
        },
        grid: this.flowConfig.defaultStyle.alignGridPX,
        drag: e => {
          if (this.flowConfig.defaultStyle.isOpenAuxiliaryLine) {
            this.$emit('alignForLine', e)
          }
        },
        stop: e => {
          this.node.x = e.pos[0]
          this.node.y = e.pos[1]
          // 是否为组
          if (this.currentSelectGroup.length > 1) {
            // 更新组节点信息
            this.$emit('updateNodePos')
          }
          // 隐藏辅助线
          this.$emit('hideAlignLine')
        }
      })

      if (this.node.type === 'x-lane' || this.node.type === 'y-lane') {
        let node = document.querySelector('#' + this.node.id)
        new Resizable(node, {
          handles: ['e', 'w', 'n', 's', 'nw', 'ne', 'sw', 'se'],
          initSize: {
            maxWidth: 1000,
            maxHeight: 1000,
            minWidth: 200,
            minHeight: 200
          }
        }, () => {
          this.node.height = Math.ceil(parseInt(node.style.height))
          this.node.width = Math.ceil(parseInt(node.style.width))
        })
      }
      this.currentSelect = this.node
      this.currentSelectGroup = []
    },
    // 点击节点
    selectNode () {
      this.currentSelect = this.node
      this.$emit('isMultiple', flag => {
        if (!flag) {
          this.currentSelectGroup = []
        } else {
          let f = this.currentSelectGroup.find(s => s.id === this.node.id)
          if (!f) {
            this.plumb.addToDragSelection(this.node.id)
            this.currentSelectGroup.push(this.node)
          }
        }
      })
    },
    // 节点右键
    showNodeContextMenu (e) {
      this.$emit('showNodeContextMenu', e)
      this.selectNode()
    },
    // 节点是否激活
    isActive () {
      if (this.currentSelect.id === this.node.id) return true
      return !!this.currentSelectGroup.find(n => n.id === this.node.id)
    }
  },
  watch: {
    select (val) {
      this.currentSelect = val
    },
    currentSelect: {
      handler (val) {
        this.$emit('update:select', val)
      },
      deep: true
    },
    selectGroup (val) {
      this.currentSelectGroup = val
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
