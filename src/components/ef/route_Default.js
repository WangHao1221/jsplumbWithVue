let dataDefault = {
    name: '路由编排',
    nodeList: [
        {
            id: 'nodeStart',
            name: '开始',
            type: 'taskStart',
            ico: 'el-icon-caret-right',
            left: '18px',
            top: '50px',
            style: {
                width: '150px'
            },
            state: 'running'
        },
        {
            id: 'nodeAssertion',
            type: 'assertion',
            ico: 'ios-color-filter-outline',
            name: '断言区域',
            left: '200px',
            top: '35px',
            state: 'running',
            // 自定义覆盖样式
            style: {
                width: '210px',
                height: '150px'
            },
            children: [],
            category: 1 //1表示断言，2表示过滤器
        },
        {
            id: 'nodeEnd',
            name: '结束',
            type: 'taskEnd',
            ico: 'el-icon-switch-button',
            left: '823px',
            top: '215px',
            style: {
                width: '150px'
            },
            state: 'success'
        }
    ],
    lineList: [
        {
            from: 'nodeStart',
            to: 'nodeAssertion'
        }
    ]
}

export function getDataDefault() {
    return dataDefault
}
