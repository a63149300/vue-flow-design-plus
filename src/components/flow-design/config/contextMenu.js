// 画布右键
export const containerMenu = {
  menuName: 'flow-menu',
  axis: {
    x: null,
    y: null
  },
  menulists: [
    {
      fnHandler: 'flowInfo',
      icoName: 'edit',
      btnName: '流程图信息'
    },
    {
      fnHandler: 'paste',
      icoName: 'edit',
      btnName: '粘贴'
    },
    {
      fnHandler: 'selectAll',
      icoName: 'edit',
      btnName: '全选'
    },
    {
      fnHandler: 'saveFlow',
      icoName: 'edit',
      btnName: '保存流程'
    },
    {
      iconName: 'edit',
      fnHandler: 'addRemark',
      btnName: '添加备注'
    },
    {
      icoName: 'edit',
      btnName: '对齐方式',
      children: [
        {
          icoName: 'edit',
          fnHandler: 'verticaLeft',
          btnName: '垂直左对齐'
        },
        {
          icoName: 'edit',
          fnHandler: 'verticalCenter',
          btnName: '垂直居中'
        },
        {
          icoName: 'edit',
          fnHandler: 'verticalRight',
          btnName: '垂直右对齐'
        },
        {
          icoName: 'edit',
          fnHandler: 'levelUp',
          btnName: '水平上对齐'
        },
        {
          icoName: 'edit',
          fnHandler: 'levelCenter',
          btnName: '水平居中'
        },
        {
          icoName: 'edit',
          fnHandler: 'levelDown',
          btnName: '水平下对齐'
        }
      ]
    }
  ]
}

// 节点右键
export const nodeMenu = {
  menuName: 'node-menu',
  axis: {
    x: null,
    y: null
  },
  menulists: [
    {
      fnHandler: 'copyNode',
      icoName: 'edit',
      btnName: '复制节点'
    },
    {
      fnHandler: 'deleteNode',
      icoName: 'edit',
      btnName: '删除节点'
    }
  ]
}

// 连线右键
export const linkMenu = {
  menuName: 'link-menu',
  axis: {
    x: null,
    y: null
  },
  menulists: [
    {
      fnHandler: 'deleteLink',
      icoName: 'edit',
      btnName: '删除连线'
    }
  ]
}
