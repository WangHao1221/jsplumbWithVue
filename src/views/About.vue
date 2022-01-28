<template>
  <div class="about" style="height: 800px">
    <flow-panel
      v-if="jsPlumbReloadData.name"
      @saveRouteLayout="saveRouteLayout"
      :menuList="menuList"
      :jsPlumbReloadData="jsPlumbReloadData"
    ></flow-panel>
  </div>
</template>
<script>
import FlowPanel from "@/components/ef/route_panel";
import { getDataDefault } from "@/components/ef/route_Default";

export default {
  name: "about",
  components: {
    FlowPanel,
  },
  data() {
    return {
      detailInfo: {}, //详细信息
      menuList: [], //右侧可拖动元素
      jsPlumbReloadData: {}, //画布已完成元素
    };
  },
  mounted() {
    this.queryLayout(); //回显的
    this.getMenulist(); //详情不开启
  },
  beforeDestroy() {
    this.$off("saveRouteLayout");
  },
  methods: {
    getUUID() {
      return Math.random().toString(36).substr(3, 10);
    },
    // 获取可拖动的元素
    async getMenulist() {
      this.menuList = [];
      //模拟后台数据
      let assertions = [
        {
          modifyBy: "peterWang",
          createBy: "peterWang",
          predicateName: "测试",
          modifyTime: 1638327931000,
          createTime: 1638327931000,
          beanName: "Headertest",
          remark: "11",
          example: "11",
        },
        {
          modifyBy: "peterWang",
          createBy: "peterWang",
          predicateName: "根据请求头断言",
          modifyTime: 1610349696000,
          createTime: 1581509992000,
          beanName: "Header",
          remark:
            "如果请求有一个名为X-request-Id的头，并且其值与\\d+正则表达式匹配（值为一个或多个数字），则此路由将匹配。",
          example: "X-Request-Id, \\d+",
        },
        {
          modifyBy: "peterWang",
          createBy: "peterWang",
          predicateName: "域名匹配",
          modifyTime: 1581510074000,
          createTime: 1581509488000,
          beanName: "Host",
          remark: "如果请求域名匹配如果请求域名匹配，则此路由将匹配",
          example: "http://www.cnblogs.com/manman-521/",
        },
        {
          modifyBy: "peterWang",
          createBy: "peterWang",
          predicateName: "请求路径",
          modifyTime: 1581510071000,
          createTime: 1559566370000,
          beanName: "Path",
          remark: "如果请求路径匹配，则此路由将匹配",
          example: "/api/{segment}/1.0.0",
        },
        {
          modifyBy: "8010000001",
          createBy: "peterWang",
          predicateName: "方法断言",
          modifyTime: 1603957236000,
          createTime: 1559566370000,
          beanName: "Method",
          remark: "如果请求方式匹配，则此路由将匹配",
          example: "POST",
        },
      ];
      let assertionObj = {
        id: "111",
        type: "timer",
        name: "断言选择",
        open: true,
        // 自定义覆盖样式
        style: {},
        children: [],
        category: 1, //1表示断言，2表示过滤器
      };
      assertions.forEach((item) => {
        let saveItem = { ...item };
        saveItem.name = item.predicateName;
        saveItem.beanName = item.beanName;
        saveItem.ico = "el-icon-trophy";
        saveItem.type = "task" + this.getUUID(); //拖拽框架里面是根据拖拽的type获取当前元素，所以type设置为唯一
        saveItem.typeName = "assertion";
        saveItem.category = 1; //1表示断言，2表示过滤器
        assertionObj.children.push(saveItem);
      });
      this.menuList.push(assertionObj);
      //模拟后台数据
      let filters = [
        {
          beanCode: "RequestConstantValue",
          createBy: "peterWang",
          createTime: 1630601688000,
          tilterType: "2",
          filterName: "苏宁微服务访问",
          remark: "",
          example: "",
        },
        {
          beanCode: "H5ResponseEncrypt",
          createBy: "peterWang",
          createTime: 1592771448000,
          tilterType: "1",
          filterName: "H5返回报文加密",
        },
        {
          beanCode: "H5RquestService",
          createBy: "peterWang",
          createTime: 1592227789000,
          tilterType: "1",
          filterName: "H5请求处理",
        },
        {
          beanCode: "H5Authentication",
          createBy: "peterWang",
          createTime: 1592227723000,
          tilterType: "1",
          filterName: "H5请求鉴权",
        },
        {
          beanCode: "BeforeRequestGZService",
          createBy: "peterWang",
          createTime: 1587407329000,
          tilterType: "2",
          filterName: "赣州银行请求报文映射",
          remark: "根据赣州银行报文结构构建请求报文",
        },
        {
          beanCode: "RequestAuthenticationAutoTest",
          modifyBy: "peterWang",
          createBy: "peterWang",
          modifyTime: 1587304383000,
          createTime: 1587304376000,
          tilterType: "2",
          filterName: "自动测试鉴权",
          remark: "自动测试专属过滤器，校验是否从门户请求，是否自动化测试",
        },
        {
          beanCode: "BeforeRequestGYService",
          modifyBy: "peterWang",
          createBy: "peterWang",
          modifyTime: 1586885171000,
          createTime: 1586885158000,
          tilterType: "1",
          filterName: "请求贵阳服务前处理",
          remark:
            "使用贵阳农商的报文规范组织报文，并根据下游系统加签要求加签访问",
        },
        {
          beanCode: "ResponseGYDataHandel",
          createBy: "peterWang",
          createTime: 1586885011000,
          tilterType: "2",
          filterName: "贵阳服务返回处理",
          remark: "贵阳下游服务返回报文处理，报文封装等",
        },
        {
          beanCode: "AddRequestHeader",
          modifyBy: "peterWang",
          createBy: "peterWang",
          modifyTime: 1586826165000,
          createTime: 1586826030000,
          tilterType: "2",
          filterName: "请求头添加数据",
          example: "X-Request-red,blue",
        },
        {
          beanCode: "SetPath",
          createBy: "peterWang",
          createTime: 1586804758000,
          tilterType: "1",
          filterName: "设置路径",
        },
        {
          beanCode: "SentineFilter",
          modifyBy: "1111",
          createBy: "111",
          modifyTime: 1582702165000,
          createTime: 1582702130000,
          tilterType: "1",
          filterName: "流控校验",
          actType: "01",
          sort: 1,
        },
        {
          beanCode: "RequestDuplicate",
          createBy: "peterWang",
          createTime: 1578329760000,
          tilterType: "1",
          filterName: "防重放校验",
          actType: "01",
          sort: 4,
        },
        {
          beanCode: "ResponseBodyEcrypt",
          createBy: "peterWang",
          createTime: 1571902124000,
          tilterType: "1",
          filterName: "返回报文加密",
          actType: "02",
          sort: 5,
        },
        {
          beanCode: "ApiWebDataRequest",
          createBy: "peterWang",
          createTime: 1571736744000,
          tilterType: "1",
          filterName: "H5前置处理",
          actType: "01",
          sort: 5,
        },
        {
          beanCode: "ApiWebDataResponse",
          createBy: "peterWang",
          createTime: 1571736725000,
          tilterType: "1",
          filterName: "H5后置处理",
          actType: "02",
          sort: 5,
        },
        {
          beanCode: "RequestBodyDecrypt",
          createBy: "peterWang",
          createTime: 1571384428000,
          tilterType: "1",
          filterName: "请求报文解密",
          actType: "01",
          sort: 5,
        },
        {
          beanCode: "ResponseDataDubboHandel",
          modifyBy: "8010000001",
          createBy: "peterWang",
          modifyTime: 1630587545000,
          createTime: 1567472193000,
          tilterType: "2",
          filterName: "Dubbo返回数据处理",
          actType: "02",
          sort: 5,
        },
        {
          beanCode: "TransLogRecord",
          modifyBy: "123456",
          createBy: "123456",
          modifyTime: 1563761199000,
          createTime: 1563613439000,
          tilterType: "1",
          filterName: "记录日志",
          actType: "02",
          remark:
            "用来记录开放平台通过appId、apiCode、version方式访问的日志流水记录，主要记录原始请求报文、网关处理后返回报文、appId、apiCode、version、交易结果、交易耗时、交易日期",
          sort: 6,
        },
        {
          beanCode: "ResponseDataSign",
          createBy: "123456",
          createTime: 1563366026000,
          tilterType: "1",
          filterName: "返回报文加签处理",
          actType: "02",
          sort: 4,
        },
        {
          beanCode: "ResponseDataHandel",
          modifyBy: "8010000001",
          createBy: "123456",
          modifyTime: 1630587535000,
          createTime: 1563353753000,
          tilterType: "1",
          filterName: "下游返回数据处理",
          actType: "02",
          sort: 2,
        },
        {
          beanCode: "ResponseDataMapping",
          createBy: "123456",
          createTime: 1563351497000,
          tilterType: "1",
          filterName: "返回报文字段映射",
          actType: "02",
          sort: 3,
        },
        {
          beanCode: "BeforeRequestDownstream",
          modifyBy: "8010000001",
          createBy: "123456",
          modifyTime: 1630587584000,
          createTime: 1563346798000,
          tilterType: "1",
          filterName: "请求下游前处理",
          actType: "01",
          sort: 9,
        },
        {
          beanCode: "RequestDataMapping",
          modifyBy: "8010000001",
          createBy: "123456",
          modifyTime: 1630587556000,
          createTime: 1563336037000,
          tilterType: "1",
          filterName: "请求报文字段映射",
          actType: "01",
          sort: 8,
        },
        {
          beanCode: "RequestAuthentication",
          modifyBy: "123456",
          createBy: "123456",
          modifyTime: 1563277766000,
          createTime: 1563277759000,
          tilterType: "1",
          filterName: "请求鉴权",
          actType: "01",
          sort: 6,
        },
        {
          beanCode: "RequestValidate",
          createBy: "123456",
          createTime: 1563277720000,
          tilterType: "1",
          filterName: "请求报文完整性校验",
          actType: "01",
          sort: 3,
        },
        {
          beanCode: "RequestCheckSign",
          modifyBy: "peterWang",
          createBy: "123456",
          modifyTime: 1624506077000,
          createTime: 1563268601000,
          tilterType: "1",
          filterName: "请求报文验签",
          actType: "01",
          sort: 7,
        },
      ];
      let filterObj = {
        id: "222",
        type: "timer",
        name: "过滤器选择",
        open: true,
        // 自定义覆盖样式
        style: {},
        children: [],
      };
      filters.forEach((item) => {
        let saveItem = { ...item };
        saveItem.name = item.filterName;
        saveItem.beanName = item.beanCode;
        saveItem.ico = "el-icon-scissors";
        saveItem.type = "task" + this.getUUID(); //拖拽框架里面是根据拖拽的type获取当前元素，所以type设置为唯一
        saveItem.typeName = "filter";
        saveItem.category = 2; //1表示断言，2表示过滤器
        filterObj.children.push(saveItem);
      });
      this.menuList.push(filterObj);
    },
    //返回
    btnBack() {
      this.$router.go(-1);
      this.$store.commit("removeTag", "routerMouldEditLayout");
      this.$store.commit("closePage", "routerMouldEditLayout");
    },
    // 断言参数,过滤器参数
    getAssertionAndFilterParams(nodeList, lineList) {
      let assertionList = [],
        filterList = [];
      let assertionObjList = nodeList.filter((item) => {
        return item.typeName === "assertion";
      });
      let assertionObjListNew = assertionObjList.sort(function (a, b) {
        return a.top.split("px")[0] - b.top.split("px")[0];
      });
      assertionObjListNew.forEach((item) => {
        let saveItem = {
          name: item.beanName,
          args: {},
        };
        // 参数
        //   断言
        if (item.paramList) {
          item.paramList.forEach((paramItem, index) => {
            saveItem.args["_genkey_" + index] = paramItem.param;
          });
        }
        assertionList.push(saveItem);
      });
      //过滤器排序并设置参数
      let startNode = lineList.filter((item) => {
        return item.from === "nodeAssertion";
      })[0]; //过滤器的开始节点
      let endNode = nodeList.filter((item) => {
        return item.typeName === "filter" && item.id === startNode.to;
      })[0];
      while (endNode) {
        let saveItem = {
          name: endNode.beanName,
          args: {},
        };
        if (endNode.filterParamList) {
          endNode.filterParamList.forEach((paramItem, index) => {
            saveItem.args["_genkey_" + index] = paramItem.param;
          });
        }
        filterList.push(saveItem);
        startNode = lineList.filter((item) => {
          return item.from === endNode.id;
        })[0];
        if (startNode) {
          endNode = nodeList.filter((item) => {
            return item.typeName === "filter" && item.id === startNode.to;
          })[0];
        } else {
          break;
        }
      }
      return {
        assertionList: assertionList,
        filterList: filterList,
      };
    },
    // 校验是否有过滤器选择器，是否连接到结束节点
    isCanSave(data) {
      let flag = false;
      data.nodeList.some((item) => {
        if (item.typeName === "assertion") {
          flag = true; //有断言
          return true;
        }
      });
      if (!flag) {
        this.$Message.error("编排缺少被连接的断言选择!");
        return false;
      }
      flag = false;
      data.lineList.some((item) => {
        if (item.from === "nodeAssertion") {
          flag = true; //有过滤器被连接
          return true;
        }
      });
      if (!flag) {
        this.$Message.error("编排缺少被连接的过滤器选择!");
        return false;
      } else {
        flag = false;
        data.lineList.some((item) => {
          if (item.to === "nodeEnd") {
            flag = true; //结束节点被连接
            return true;
          }
        });
        if (!flag) {
          this.$Message.error("编排必须包含结束节点!");
          return false;
        }
      }
      return true;
    },
    saveRouteLayout(data) {
      console.log(data);
      if (!this.isCanSave(data)) {
        return;
      }
      let paramObj = this.getAssertionAndFilterParams(
        data.nodeList,
        data.lineList
      );
      console.log(paramObj);
      data.RouteDefinition = {
        id: this.detailInfo.templateCode,
        name: this.detailInfo.routeName,
        uri: this.detailInfo.serverAddress,
        order: this.detailInfo.sort,
        status: this.detailInfo.status,
        predicates: paramObj.assertionList, //需要排序
        filters: paramObj.filterList, //需要排序
        isFulid: "0",
        isFusing: "0",
        fopRouteFluid: {},
        fopRouteFusing: {},
      };
      let params = {
        OPERATE_TYPE: "UPDATE",
        DUBBO_SERVICE_NAME: "AS_FOP_ROUTE_DESIGN_TEMPLATE_SAVE",
        design: JSON.stringify(data),
        templateCode: this.detailInfo.templateCode,
      };
      console.log("后台保存...", params);
    },
    queryLayout() {
      let routeDataDefault = getDataDefault();
      let serverData = [
        {
          tendId: null,
          orderBy: null,
          additionalParameter: null,
          templateCode: "ecrypTtemplate",
          templateName: "加密模板",
          sort: 3,
          type: "03",
          protocol: "01",
          msgFormat: "01",
          charset: "01",
          serverChannel: "003",
          serverAddress: "lb://xxxx",
          remark: "加密模板",
          createBy: "peterWang",
          createTime: 1597063807000,
          modifyBy: "peterWang",
          modifyTime: 1598208883000,
          design:
            '{"name":"加密模板","nodeList":[{"id":"nodeStart","name":"开始","type":"taskStart","ico":"el-icon-caret-right","left":"18px","top":"50px","style":{"width":"150px"},"state":"running"},{"id":"nodeAssertion","type":"assertion","ico":"ios-color-filter-outline","name":"断言区域","left":"200px","top":"35px","state":"running","style":{"width":"210px","height":"150px"},"children":[],"category":1},{"id":"nodeEnd","name":"结束","type":"taskEnd","ico":"el-icon-switch-button","left":"823px","top":"215px","style":{"width":"150px"},"state":"success"},{"id":"frflihiuqw","left":"220px","top":"70px","state":"","modifyBy":"peterWang","createBy":"peterWang","predicateName":"请求路径","modifyTime":1581510071000,"createTime":1559566370000,"beanName":"Path","remark":"如果请求路径匹配，则此路由将匹配","example":"/api/{segment}/1.0.0","name":"请求路径","ico":"el-icon-trophy","type":"taskbfwitasv8","typeName":"assertion","category":1,"pId":"nodeAssertion"},{"id":"gi3uoyy9g8","left":"251px","top":"267px","state":"","beanCode":"RequestBodyDecrypt","createBy":"peterWang","createTime":1571384428000,"tilterType":"1","filterName":"请求报文解密","actType":"01","sort":5,"name":"请求报文解密","beanName":"RequestBodyDecrypt","ico":"el-icon-scissors","type":"task1frrsj9dv3","typeName":"filter","category":2,"originLeft":"217px","originTop":"251px","filterParamList":[{"id":"9m5byvf7ji"}]},{"id":"01h2d4x6bf","left":"502px","top":"303px","state":"","beanCode":"ResponseDataMapping","createBy":"123456","createTime":1563351497000,"tilterType":"1","filterName":"返回报文字段映射","actType":"02","sort":3,"name":"返回报文字段映射","beanName":"ResponseDataMapping","ico":"el-icon-scissors","type":"task004zeiwi76","typeName":"filter","category":2,"originLeft":"475px","originTop":"354px","filterParamList":[{"id":"s829dr7h1s"}]}],"lineList":[{"from":"nodeStart","to":"nodeAssertion"},{"from":"nodeAssertion","to":"gi3uoyy9g8"},{"from":"gi3uoyy9g8","to":"01h2d4x6bf"},{"from":"01h2d4x6bf","to":"nodeEnd"}],"RouteDefinition":{"id":"ecrypTtemplate","uri":"lb://xxxx","order":3,"predicates":[{"name":"Path","args":{}}],"filters":[{"name":"RequestBodyDecrypt","args":{}},{"name":"ResponseDataMapping","args":{}}],"isFulid":"0","isFusing":"0","fopRouteFluid":{},"fopRouteFusing":{}}}',
          predicates: [],
          filters: [],
        },
      ];
      routeDataDefault.name = serverData[0].templateName;
      // console.log(routeDataDefault);
      this.detailInfo = serverData[0] || {};
      this.jsPlumbReloadData = serverData[0].design
        ? JSON.parse(serverData[0].design)
        : routeDataDefault;
      console.log("this.jsPlumbReloadData...", this.jsPlumbReloadData);
    },
  },
};
</script>
