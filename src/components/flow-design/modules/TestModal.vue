<template>
  <div>
    <a-drawer
      title="测试"
      placement="right"
      :width="600"
      :visible="testVisible"
      @close="onClose"
    >
      <div>当前的flowData:</div>
      <json-view :value="flowData" :expand-depth="3" boxed copyable />

      <div style="margin-top: 12px;">暂存:</div>
      <a-textarea
        :autoSize="{ minRows: 10, maxRows: 100 }"
        :value="flowDataJson"
        @change="editFlowDataJson"
      />

      <a-divider />
      <a-button @click="tempSave" :style="{ marginRight: '8px' }"
        >暂存</a-button
      >
      <a-button @click="onLoad" type="primary">加载(暂存中的json数据)</a-button>
    </a-drawer>
  </div>
</template>

<script>
import JsonView from 'vue-json-viewer'
import { flowStatus } from '../config/flow.js'

export default {
  components: {
    JsonView
  },
  props: {
    flowConfig: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      testVisible: false,
      flowData: null,
      flowDataJson: ''
    }
  },
  methods: {
    onClose () {
      this.testVisible = false
    },
    // 编辑框
    editFlowDataJson (e) {
      this.flowDataJson = e.target.value
    },
    // 暂存
    tempSave () {
      let tempObj = Object.assign({}, this.flowData)
      tempObj.status = flowStatus.SAVE
      this.flowDataJson = JSON.stringify(tempObj)
    },
    // 加载(暂存中的json数据)
    onLoad () {
      this.$emit('loadFlow', this.flowDataJson)
      this.onClose()
    }
  }
}
</script>
