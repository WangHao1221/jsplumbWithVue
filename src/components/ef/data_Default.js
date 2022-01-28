let dataDefault = {
    name: '简单模板',
    nodeList: [
        {
            id: 'nodeStart',
            name: '开始节点',
            type: 'taskStart',
            left: '18px',
            top: '223px',
            ico: 'el-icon-caret-right',
            state: 'running'
        }, {
            id: 'nodeEnd',
            name: '结束节点',
            type: 'taskEnd',
            left: '723px',
            top: '215px',
            ico: 'el-icon-switch-button',
            state: 'success'
        }
    ],
    lineList: []
}

export function getDataDefault() {
    return dataDefault
}
