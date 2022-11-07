<template>
  <a-drawer
    title="设置"
    placement="right"
    :zIndex="1001"
    :width="600"
    :visible="settingVisible"
    @close="close"
  >
    <a-form
      :form="settingForm"
      style="margin-bottom: 40px;"
      layout="horizontal"
    >
      <a-divider orientation="left">画布</a-divider>
      <a-form-item
        label="缩小比例"
        :label-col="formItemLayout.labelCol"
        :wrapper-col="formItemLayout.wrapperCol"
      >
        <a-slider
          :min="0.05"
          :max="0.5"
          :step="0.05"
          :tipFormatter="formatOnceNarrow"
          v-model="settingConfig.containerScale.onceNarrow"
        />
      </a-form-item>
      <a-form-item
        label="放大比例"
        :label-col="formItemLayout.labelCol"
        :wrapper-col="formItemLayout.wrapperCol"
      >
        <a-slider
          :min="0.05"
          :max="0.5"
          :step="0.05"
          :tipFormatter="formatOnceEnlarge"
          v-model="settingConfig.containerScale.onceEnlarge"
        />
      </a-form-item>

      <a-divider orientation="left">连线</a-divider>
      <a-form-item
        label="类型"
        :label-col="formItemLayout.labelCol"
        :wrapper-col="formItemLayout.wrapperCol"
      >
        <a-select v-model="settingConfig.cls.linkType">
          <a-select-option value="Bezier">贝塞尔曲线</a-select-option>
          <a-select-option value="Straight">直线</a-select-option>
          <a-select-option value="Flowchart">流程图线</a-select-option>
          <a-select-option value="StateMachine">状态线</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item
        label="颜色"
        :label-col="formItemLayout.labelCol"
        :wrapper-col="formItemLayout.wrapperCol"
      >
        <colorPicker v-model="settingConfig.cls.linkColor" />
      </a-form-item>
      <a-form-item
        label="粗细"
        :label-col="formItemLayout.labelCol"
        :wrapper-col="formItemLayout.wrapperCol"
      >
        <a-slider
          :min="1"
          :max="10"
          v-model="settingConfig.cls.linkThickness"
        />
      </a-form-item>

      <a-divider orientation="left">默认样式</a-divider>
      <a-form-item
        label="辅助线"
        :label-col="formItemLayout.labelCol"
        :wrapper-col="formItemLayout.wrapperCol"
      >
        <a-switch
          v-model="settingConfig.other.isOpenAuxiliaryLine"
          checkedChildren="开"
          unCheckedChildren="关"
        />
      </a-form-item>
      <a-form-item
        label="自动对齐水平间距"
        :label-col="formItemLayout.labelCol"
        :wrapper-col="formItemLayout.wrapperCol"
      >
        <a-slider
          :min="10"
          :max="800"
          :step="5"
          v-model="settingConfig.other.horizontal"
        />
      </a-form-item>
      <a-form-item
        label="自动对齐垂直间距"
        :label-col="formItemLayout.labelCol"
        :wrapper-col="formItemLayout.wrapperCol"
      >
        <a-slider
          :min="10"
          :max="800"
          :step="5"
          v-model="settingConfig.other.vertical"
        />
      </a-form-item>
      <a-form-item
        label="微移距离"
        :label-col="formItemLayout.labelCol"
        :wrapper-col="formItemLayout.wrapperCol"
      >
        <a-slider :min="1" v-model="settingConfig.other.movePx" />
      </a-form-item>
    </a-form>

    <div
      :style="{
        position: 'absolute',
        right: 0,
        bottom: 0,
        width: '100%',
        borderTop: '1px solid #e9e9e9',
        padding: '10px 16px',
        background: '#fff',
        textAlign: 'right',
        zIndex: 1
      }"
    >
      <a-button :style="{ marginRight: '8px' }" @click="setDefault">
        恢复默认
      </a-button>
      <a-button type="primary" @click="handleSubmit">
        确定
      </a-button>
    </div>
  </a-drawer>
</template>

<script>
import { settingConfig } from '../config/flow.js'
import cloneDeep from 'lodash/cloneDeep'
import { setFlowConfig } from '../utils/common.js'

export default {
  props: {
    flowConfig: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      settingVisible: false,
      formItemLayout: {
        labelCol: { span: 6 },
        wrapperCol: { span: 15 }
      },
      settingForm: this.$form.createForm(this),
      config: this.flowConfig,
      settingConfig: cloneDeep(settingConfig)
    }
  },
  methods: {
    // 恢复默认
    setDefault () {
      this.config = setFlowConfig(this.config, settingConfig)
      this.$ls.set('settingConfig', settingConfig)
      this.close()
      this.$message.success('恢复默认成功')
    },
    // 设置
    handleSubmit () {
      this.config = setFlowConfig(this.config, this.settingConfig)
      this.$ls.set('settingConfig', this.settingConfig)
      this.close()
      this.$message.success('设置成功')
    },
    open () {
      this.settingVisible = true
      this.settingConfig = this.$ls.get('settingConfig') || cloneDeep(settingConfig)
    },
    close () {
      this.settingVisible = false
    },
    formatOnceNarrow (v) {
      return `${v * 100}%`
    },
    formatOnceEnlarge (v) {
      return `${v * 100}%`
    }
  }
}
</script>

<style>
.m-colorPicker .box {
  z-index: 10002 !important;
  width: 220px !important;
}

.ant-divider-horizontal.ant-divider-with-text,
.ant-divider-horizontal.ant-divider-with-text-left,
.ant-divider-horizontal.ant-divider-with-text-right {
  font-weight: 800;
  margin: 24px 0 4px;
}
</style>
