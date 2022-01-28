<template>
  <div v-if="easyFlowVisible" style="height: 100%">
    <el-row>
      <!--顶部工具菜单-->
      <el-col :span="24">
        <div class="ef-tooltar">
          <el-link type="primary" :underline="false">{{ data.name }}</el-link>
          <el-divider direction="vertical"></el-divider>
          <el-button
            type="text"
            title="保存"
            size="large"
            @click="saveElement"
            :disabled="menuList.length <= 0 || data.nodeList.length <= 2"
            >保存</el-button
          >
          <el-divider direction="vertical"></el-divider>
          <el-button
            type="text"
            icon="el-icon-delete"
            size="large"
            title="删除"
            @click="deleteElement"
            :disabled="menuList.length <= 0 || data.nodeList.length <= 2"
          ></el-button>
          <el-divider direction="vertical"></el-divider>
          <el-button
            type="text"
            icon="el-icon-download"
            size="large"
            title="下载"
            @click="downloadData"
          ></el-button>
          <el-divider direction="vertical"></el-divider>
          <el-button
            type="text"
            icon="el-icon-plus"
            size="large"
            title="放大"
            @click="zoomAdd"
          ></el-button>
          <el-divider direction="vertical"></el-divider>
          <el-button
            type="text"
            icon="el-icon-minus"
            size="large"
            title="缩小"
            @click="zoomSub"
          ></el-button>
          <el-divider direction="vertical"></el-divider>
          <el-button
            type="text"
            icon="el-icon-office-building"
            size="large"
            title="自动布局"
            @click="dataReloadAuto"
            :disabled="data.nodeList.length <= 2"
          ></el-button>
        </div>
      </el-col>
    </el-row>
    <div
      style="
        display: flex;
        width: 100%;
        min-width: 1000px;
        height: calc(100% - 142px);
        overflow: auto;
      "
    >
      <!-- 可拖拽list -->
      <div
        style="width: 230px; border-right: 1px solid #dce3e8"
        v-if="menuList.length > 0"
      >
        <node-menu
          @addNode="addNode"
          ref="nodeMenu"
          :menuList="menuList"
        ></node-menu>
      </div>
      <div
        style="
          min-width: 500px;
          min-height: 500px;
          flex: 1;
          position: relative;
          overflow: scroll;
        "
      >
        <div
          id="efContainer"
          ref="efContainer"
          class="container"
          v-flowDrag
          style="
            width: 100%;
            height: 100%;
            transform-origin: 0% 0%;
            transition: 0.5s;
          "
        >
          <template v-for="node in data.nodeList">
            <flow-node
              :id="node.id"
              :key="node.id"
              :node="node"
              :activeElement="activeElement"
              @changeNodeSite="changeNodeSite"
              @nodeRightMenu="nodeRightMenu"
              @clickNode="clickNode"
            >
            </flow-node>
          </template>
          <!-- 给画布一个默认的宽度和高度 -->
          <!-- <div style="position:absolute;top:1500px;left: 1500px;">&nbsp;</div> -->
        </div>
      </div>
      <!-- 编排条件 -->
      <div
        style="
          width: 300px;
          border-left: 1px solid #dce3e8;
          background-color: #fbfbfb;
        "
        v-show="isShowRight"
      >
        <flow-node-form
          ref="nodeForm"
          @setLineLabel="setLineLabel"
          @repaintEverything="repaintEverything"
        ></flow-node-form>
      </div>
    </div>
    <el-table :data="tableData" style="width: 100%" height="100px">
      <el-table-column prop="apiCode" label="API编码" width="300">
      </el-table-column>
      <el-table-column prop="apiName" label="API名称" width="200">
      </el-table-column>
      <el-table-column prop="apiTypeName" label="API类别" width="300">
      </el-table-column>
      <el-table-column prop="version" label="版本号" width="120">
      </el-table-column>
      <el-table-column prop="serviceTypeName" label="服务类型" width="200">
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import draggable from "vuedraggable";
// 使用修改后的jsplumb
import "./jsplumb";
import { easyFlowMixin } from "@/components/ef/mixins";
import flowNode from "@/components/ef/node";
import nodeMenu from "@/components/ef/node_menu";
import FlowNodeForm from "./node_form";
import lodash from "lodash";
import { ForceDirected } from "./force_directed";
import html2canvas from "html2canvas";
import Canvg from "canvg";
import $ from "jquery";

export default {
  props: {
    menuList: {
      type: Array,
    },
    jsPlumbReloadData: {
      type: Object,
    },
  },
  data() {
    return {
      // jsPlumb 实例
      jsPlumb: null,
      // 控制画布销毁
      easyFlowVisible: true,
      // 是否加载完毕标志位
      loadEasyFlowFinish: false,
      // 数据
      data: { nodeList: [] },
      // 激活的元素、可能是节点、可能是连线
      activeElement: {
        // 可选值 node 、line
        type: undefined,
        // 节点ID
        nodeId: undefined,
        // 连线ID
        sourceId: undefined,
        targetId: undefined,
      },
      zoom: 1.0,
      tableData: [],
      isShowRight: false,
    };
  },
  // 一些基础配置移动该文件中
  mixins: [easyFlowMixin],
  components: {
    draggable,
    flowNode,
    nodeMenu,
    FlowNodeForm,
  },
  directives: {
    flowDrag: {
      bind(el, binding, vnode, oldNode) {
        if (!binding) {
          return;
        }
        el.onmousedown = (e) => {
          if (e.button == 2) {
            // 右键不管
            return;
          }
          //  鼠标按下，计算当前原始距离可视区的高度
          let disX = e.clientX;
          let disY = e.clientY;
          el.style.cursor = "move";

          document.onmousemove = function (e) {
            // 移动时禁止默认事件
            e.preventDefault();
            const left = e.clientX - disX;
            disX = e.clientX;
            el.scrollLeft += -left;

            const top = e.clientY - disY;
            disY = e.clientY;
            el.scrollTop += -top;
          };

          document.onmouseup = function (e) {
            el.style.cursor = "auto";
            document.onmousemove = null;
            document.onmouseup = null;
          };
        };
      },
    },
  },
  beforeMount() {},
  mounted() {
    this.jsPlumb = jsPlumb.getInstance();
    this.$nextTick(() => {
      // 默认加载流程的数据、在这里可以根据具体的业务返回符合流程数据格式的数据即可
      this.dataReload(this.jsPlumbReloadData);
    });
    // let mydiv=document.getElementById("mydiv");
    // window.οnresize = function(){
    //     mydiv.style.width=document.body.clientWidth;
    //     mydiv.style.height=document.body.clientHeight;
    // }
  },
  methods: {
    // 返回唯一标识
    getUUID() {
      return Math.random().toString(36).substr(3, 10);
    },
    jsPlumbInit() {
      this.jsPlumb.ready(() => {
        // 导入默认配置
        this.jsPlumb.importDefaults(this.jsplumbSetting);
        // 会使整个jsPlumb立即重绘。
        this.jsPlumb.setSuspendDrawing(false, true);
        // 初始化节点
        this.loadEasyFlow();
        // 单点击了连接线, https://www.cnblogs.com/ysx215/p/7615677.html
        this.jsPlumb.bind("click", (conn, originalEvent) => {
          this.activeElement.type = "line";
          this.activeElement.sourceId = conn.sourceId;
          this.activeElement.targetId = conn.targetId;
          this.$refs.nodeForm.lineInit({
            from: conn.sourceId,
            to: conn.targetId,
            label: conn.getLabel(),
          });
          this.isShowRight = true;
          //新增，点击线条更改线条样式
          // conn.setPaintStyle({ stroke: "lightgray", strokeWidth: 3 });
        });
        // 连线
        this.jsPlumb.bind("connection", (evt) => {
          let from = evt.source.id;
          let to = evt.target.id;
          if (this.loadEasyFlowFinish) {
            this.data.lineList.push({ from: from, to: to });
          }
        });

        // 删除连线回调
        this.jsPlumb.bind("connectionDetached", (evt) => {
          this.deleteLine(evt.sourceId, evt.targetId);
        });

        // 改变线的连接节点
        this.jsPlumb.bind("connectionMoved", (evt) => {
          this.changeLine(evt.originalSourceId, evt.originalTargetId);
        });

        // 连线右击
        this.jsPlumb.bind("contextmenu", (evt) => {
          console.log("contextmenu", evt);
        });

        // 连线
        this.jsPlumb.bind("beforeDrop", (evt) => {
          let from = evt.sourceId;
          let to = evt.targetId;
          if (from === "nodeStart" && to === "nodeEnd") {
            this.$message.error("节点不支持直接开始到结束");
            return false;
          }
          if (from === to) {
            this.$message.error("节点不支持连接自己");
            return false;
          }
          if (this.hasLine(from, to)) {
            this.$message.error("该关系不允许创建");
            return false;
          }
          if (this.hashOppositeLine(from, to)) {
            this.$message.error("不支持两个节点之间连线回环");
            return false;
          }
          this.$message.success("连接成功");
          return true;
        });

        // beforeDetach
        this.jsPlumb.bind("beforeDetach", (evt) => {
          console.log("beforeDetach", evt);
        });
        this.jsPlumb.setContainer(this.$refs.efContainer);
      });
    },
    // 加载流程图
    loadEasyFlow() {
      // 初始化节点
      for (var i = 0; i < this.data.nodeList.length; i++) {
        let node = this.data.nodeList[i];
        // 设置源点，可以拖出线连接其他节点
        this.jsPlumb.makeSource(
          node.id,
          lodash.merge(this.jsplumbSourceOptions, {})
        );
        // 设置目标点，其他源点拖出的线可以连接该节点
        this.jsPlumb.makeTarget(node.id, this.jsplumbTargetOptions);
        if (!node.viewOnly) {
          this.jsPlumb.draggable(node.id, {
            containment: "parent",
            stop: function (el) {
              // 拖拽节点结束后的对调
              console.log("拖拽结束: ", el);
            },
          });
        }
      }
      // 初始化连线
      for (var i = 0; i < this.data.lineList.length; i++) {
        let line = this.data.lineList[i];
        var connParam = {
          source: line.from,
          target: line.to,
          label: line.label ? line.label : "",
          connector: line.connector ? line.connector : "",
          anchors: line.anchors ? line.anchors : undefined,
          paintStyle: line.paintStyle ? line.paintStyle : undefined,
        };
        this.jsPlumb.connect(connParam, this.jsplumbConnectOptions);
      }
      this.$nextTick(function () {
        this.loadEasyFlowFinish = true;
      });
    },
    // 删除激活的元素
    deleteElement() {
      if (this.activeElement.type === "node") {
        this.deleteNode(this.activeElement);
      } else if (this.activeElement.type === "line") {
        this.$confirm("确定删除所点击的线吗?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
          .then(() => {
            var conn = this.jsPlumb.getConnections({
              source: this.activeElement.sourceId,
              target: this.activeElement.targetId,
            })[0];
            this.jsPlumb.deleteConnection(conn);
            this.activeElement = {};
            this.isShowRight = false;
          })
          .catch(() => {});
      } else {
        this.$Message.error("当前节点不可删除");
      }
    },
    // 删除线
    deleteLine(from, to) {
      this.data.lineList = this.data.lineList.filter(function (line) {
        if (line.from == from && line.to == to) {
          return false;
        }
        return true;
      });
    },
    // 改变连线
    changeLine(oldFrom, oldTo) {
      this.deleteLine(oldFrom, oldTo);
    },
    // 改变节点的位置
    changeNodeSite(data) {
      for (var i = 0; i < this.data.nodeList.length; i++) {
        let node = this.data.nodeList[i];
        if (node.id === data.nodeId) {
          node.left = data.left;
          node.top = data.top;
        }
      }
    },
    /**
     * 拖拽结束后添加新的节点
     * @param evt
     * @param nodeMenu 被添加的节点对象
     * @param mousePosition 鼠标拖拽结束的坐标
     */
    addNode(evt, nodeMenu, mousePosition) {
      var screenX = evt.originalEvent.clientX,
        screenY = evt.originalEvent.clientY;
      let efContainer = this.$refs.efContainer;
      var containerRect = efContainer.getBoundingClientRect();
      var left = screenX,
        top = screenY;
      // 计算是否拖入到容器中
      if (
        left < containerRect.x ||
        left > containerRect.width + containerRect.x ||
        top < containerRect.y ||
        containerRect.y > containerRect.y + containerRect.height
      ) {
        this.$message.error("请把节点拖入到画布中");
        return;
      }
      left = left - containerRect.x + efContainer.scrollLeft;
      top = top - containerRect.y + efContainer.scrollTop;
      // 居中
      left -= 85;
      top -= 16;
      var nodeId = this.getUUID(); //不能用nodeMenu.apiId，否则删除后重新连接会出现问题
      var node = {
        id: nodeId,
        name: nodeMenu.apiName,
        type: nodeMenu.type,
        left: left + "px",
        top: top + "px",
        ico: nodeMenu.ico,
        apiId: nodeMenu.apiId,
        apiCode: nodeMenu.apiCode,
        apiName: nodeMenu.apiName,
        version: nodeMenu.version,
        state: "running",
      };
      this.data.nodeList.push(node);
      this.$nextTick(function () {
        this.jsPlumb.makeSource(nodeId, this.jsplumbSourceOptions);
        this.jsPlumb.makeTarget(nodeId, this.jsplumbTargetOptions);
        this.jsPlumb.draggable(nodeId, {
          containment: "parent",
          stop: function (el) {
            // 拖拽节点结束后的对调
            console.log("拖拽结束: ", el);
          },
        });
      });
    },
    /**
     * 删除节点
     */
    deleteNode(item) {
      let nodeId = item.nodeId,
        nodeName = item.nodeName;
      this.$confirm("确定要删除API节点" + nodeName + "?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        closeOnClickModal: false,
      })
        .then(() => {
          /**
           * 这里需要进行业务判断，是否可以删除
           */
          this.data.nodeList = this.data.nodeList.filter(function (node) {
            if (node.id === nodeId) {
              // 伪删除，将节点隐藏，否则会导致位置错位
              node.show = false;
              return false;
            }
            return true;
          });
          this.$nextTick(function () {
            this.jsPlumb.removeAllEndpoints(nodeId);
            this.activeElement = {};
            this.tableData = [];
          });
        })
        .catch(() => {});
      return true;
    },
    // 设置连线条件
    setLineLabel(from, to, label) {
      var conn = this.jsPlumb.getConnections({
        source: from,
        target: to,
      })[0];
      if (!label || label === "") {
        conn.removeClass("flowLabel");
        conn.addClass("emptyFlowLabel");
      } else {
        conn.addClass("flowLabel");
      }
      conn.setLabel({
        label: label,
      });
      this.data.lineList.forEach(function (line) {
        if (line.from == from && line.to == to) {
          line.label = label;
        }
      });
    },
    clickNode(nodeId) {
      this.tableData = [];
      this.isShowRight = false;
      if (nodeId === "nodeStart" || nodeId === "nodeEnd") {
        this.activeElement = {};
        return; //点击的开始和结束节点
      }
      this.activeElement.type = "node";
      this.activeElement.nodeId = nodeId;
      this.$refs.nodeForm.nodeInit(this.data, nodeId);
      this.data.nodeList.filter((node) => {
        if (node.id === nodeId) {
          // console.log(node)
          this.activeElement.nodeName = node.apiName;
          this.tableData.push({ ...node });
        }
      });
    },
    // 是否具有该线
    /**
     * @isBackward 是否是逆向
     */
    hasLine(from, to, isBackward) {
      if (
        (!isBackward && (from === "nodeEnd" || to === "nodeStart")) ||
        (isBackward && (from === "nodeStart" || to === "nodeEnd"))
      ) {
        return true;
      }
      for (var i = 0; i < this.data.lineList.length; i++) {
        var line = this.data.lineList[i];
        // 节点不可重复
        // if ((!isBackward && (line.from === from ||line.to === to))||
        // (isBackward && (line.from === to ||line.to === from))){
        //     return true
        // }
        if (line.from === from && line.to === to) {
          return true;
        }
      }
      return false;
    },
    // 是否含有相反的线
    hashOppositeLine(from, to) {
      return this.hasLine(to, from, true);
    },
    nodeRightMenu(nodeId, evt) {
      console.log("nodeRightMenu...");
      // this.menu.show = true
      // this.menu.curNodeId = nodeId
      // this.menu.left = evt.x + 'px'
      // this.menu.top = evt.y + 'px'
    },
    repaintEverything() {
      this.jsPlumb.repaint();
      this.jsPlumb.repaintEverything();
    },
    // 加载流程图
    dataReload(data) {
      this.easyFlowVisible = false;
      this.data.nodeList = [];
      this.data.lineList = [];
      this.$nextTick(() => {
        data = lodash.cloneDeep(data);
        this.easyFlowVisible = true;
        if (data.hide) {
          // 如果是详情，则所有的不可编辑
          data.nodeList.forEach((item) => {
            item.viewOnly = true;
          });
        }
        this.data = data;
        this.$nextTick(() => {
          this.jsPlumb = jsPlumb.getInstance();
          this.$nextTick(() => {
            this.jsPlumbInit();
          });
        });
      });
    },
    // 自适应创建坐标
    dataReloadAuto() {
      if (!this.data.nodeList) {
        this.$message({
          message: "当前无节点可布局",
          type: "warning",
        });
        return;
      }
      let tempData = lodash.cloneDeep(this.data);
      let data = ForceDirected(tempData);
      this.dataReload(data);
    },
    zoomAdd() {
      if (this.zoom >= 1.5) {
        return;
      }
      this.zoom = this.zoom + 0.1;
      this.$refs.efContainer.style.transform = `scale(${this.zoom})`;
      this.jsPlumb.setZoom(this.zoom);
    },
    zoomSub() {
      if (this.zoom <= 0.7) {
        return;
      }
      this.zoom = this.zoom - 0.1;
      this.$refs.efContainer.style.transform = `scale(${this.zoom})`;
      this.jsPlumb.setZoom(this.zoom);
    },
    // 保存数据
    saveElement() {
      // 以下是对svg的处理
      var svgElem = $("#efContainer"); //divReport为需要截取成图片的dom的id
      var operatesvgElem = svgElem.clone(); //必须clone否则页面会发生改变
      operatesvgElem.find("svg").each(function (index, node) {
        //获取svg的父节点
        var parentNode = node.parentNode;
        //获取svg的html代码
        var svg = node.outerHTML.trim();
        //创建一个<canvas>，用于放置转换后的元素
        var canvas = document.createElement("canvas");
        //将svg元素转换为canvas元素
        Canvg(canvas, svg);
        //设置新canvas元素的位置
        if (node.style.position) {
          canvas.style.position += node.style.position;
          canvas.style.left += node.style.left;
          canvas.style.top += node.style.top;
        }

        //删除svg元素
        parentNode.removeChild(node);
        //增加canvas元素
        parentNode.appendChild(canvas);
      });
      // 将绘制内容生成图片（缩略图）
      html2canvas(this.$refs.efContainer, {
        backgroundColor: "#ffffff",
        x: 0, //解决滚动对导出位置的影响
        y: 0,
      }).then((canvas) => {
        let svgImage = canvas.toDataURL("image/png"); // 将canvas转成base64图片格式
        console.log(svgImage);
        if (svgImage) {
          this.data.svgImage = svgImage;
          this.$emit("saveLayout", this.data);
        } else {
          this.$message.error("生成缩略图失败!");
        }
      });
    },
    // 下载数据
    downloadData() {
      this.$confirm("确定要下载该流程数据吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        closeOnClickModal: false,
      })
        .then(() => {
          var datastr =
            "data:text/json;charset=utf-8," +
            encodeURIComponent(JSON.stringify(this.data, null, "\t"));
          var downloadAnchorNode = document.createElement("a");
          downloadAnchorNode.setAttribute("href", datastr);
          downloadAnchorNode.setAttribute("download", "data.json");
          downloadAnchorNode.click();
          downloadAnchorNode.remove();
          this.$message.success("正在下载中,请稍后...");
        })
        .catch(() => {});
    },
  },
};
</script>
<style lang="less" scoped></style>
