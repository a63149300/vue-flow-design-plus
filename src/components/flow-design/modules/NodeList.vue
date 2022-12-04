<template>
  <a-list :grid="{ gutter: 0, column: 1 }">
    <a-list-item v-for="node in nodeList" :key="node.type">
      <a-tooltip :title="node.nodeName" placement="right">
        <div
          class="node-item"
          draggable="true"
          @dragstart="dragNode(node.type, type)"
        >
          <a-icon :type="node.icon" />
        </div>
      </a-tooltip>
    </a-list-item>
  </a-list>
</template>
<script>
export default {
  name: 'NodeList',
  props: {
    nodeList: {
      type: Array,
      default: () => []
    },
    type: {
      type: String,
      default: ''
    }
  },
  methods: {
    // 开始拖拽
    dragNode (type, belongTo) {
      this.$emit('setDragInfo', {
        type,
        belongTo
      })
    }
  }
}
</script>
