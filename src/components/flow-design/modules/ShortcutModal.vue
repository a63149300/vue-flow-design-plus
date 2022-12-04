<template>
  <a-modal
    title="快捷键大全"
    width="600px"
    :visible="modalVisible"
    :footer="null"
    @cancel="close">
    <a-table
      rowKey="code"
      size="small"
      :pagination="false"
      :columns="columns"
      :dataSource="dataSource">
    </a-table>
  </a-modal>
</template>

<script>
import { shortcutKeys } from '../config/shortcutKeys.js'

export default {
  data () {
    return {
      modalVisible: false,
      columns: [
        {
          title: '功能',
          align: 'center',
          key: 'shortcutName',
          dataIndex: 'shortcutName',
          width: '50%'
        },
        {
          title: '快捷键',
          align: 'center',
          key: 'codeName',
          dataIndex: 'codeName',
          width: '50%'
        }
      ],
      dataSource: []
    }
  },
  methods: {
    open () {
      this.modalVisible = true
      this.dataSource = Object.values(shortcutKeys)
    },
    close () {
      this.dataSource = []
      this.modalVisible = false
    },
    saveSetting () {
      this.close()
    }
  }
}
</script>
