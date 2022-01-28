<template>
  <div v-if="easyFlowVisible" style="height: 100%">
    <el-row v-show="!data.hide">
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
            :disabled="
              (menuList && menuList.length <= 0) || data.nodeList.length <= 2
            "
            >保存</el-button
          >
          <el-divider direction="vertical"></el-divider>
          <el-button
            type="text"
            icon="el-icon-delete"
            size="large"
            title="删除"
            @click="deleteElement"
            :disabled="
              (menuList && menuList.length <= 0) || data.nodeList.length <= 2
            "
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
        </div>
      </el-col>
    </el-row>
    <div
      style="
        display: flex;
        width: 100%;
        min-width: 1000px;
        height: calc(100% - 42px);
        overflow: auto;
      "
    >
      <!-- 可拖拽list -->
      <div
        style="width: 230px; border-right: 1px solid #dce3e8"
        v-if="menuList && menuList.length > 0"
      >
        <node-menu
          @addNode="addNode"
          ref="nodeMenu"
          :menuList="menuList"
        ></node-menu>
      </div>
      <div
        style="
          min-width: 600px;
          min-height: 600px;
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
  </div>
</template>

<script>
import draggable from "vuedraggable";
// import { jsPlumb } from 'jsplumb'
// 使用修改后的jsplumb
import "./jsplumb";
import { easyFlowMixin } from "@/components/ef/mixins";
import flowNode from "@/components/ef/route_node";
import nodeMenu from "@/components/ef/node_menu";
import FlowNodeForm from "./node_form";
import lodash from "lodash";
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
  beforeMount() {
    // this.jsPlumbReloadData = lodash.cloneDeep(this.jsPlumbReloadData)
    // console.log(this.jsPlumbReloadData)
  },
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
    resetDragNodes(list, offsetX, offsetY) {
      //   console.log(offsetX, offsetY);
      let resetList = list.filter((item) => {
        return item.typeName === "assertion";
      });
      //   console.log(resetList);
      resetList.forEach((item) => {
        list.some((rootItem) => {
          if (rootItem.id === item.id) {
            // 修改坐标
            let itemX = parseFloat(item.left.split("px")[0]) + offsetX;
            let itemY = parseFloat(item.top.split("px")[0]) + offsetY;
            rootItem.left = itemX + "px";
            rootItem.top = itemY + "px";
            $("#" + item.id).css({
              left: itemX + "px",
              top: itemY + "px",
            });
            return true;
          }
        });
      });
      this.$set(this.data, "nodeList", list);
      this.repaintEverything();
      //   console.log(this.data.nodeList);
    },
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
          if (conn.sourceId !== "nodeStart") {
            this.activeElement.type = "line";
          }
          this.activeElement.sourceId = conn.sourceId;
          this.activeElement.targetId = conn.targetId;
          this.$refs.nodeForm.lineInit({
            from: conn.sourceId,
            to: conn.targetId,
            label: conn.getLabel(),
          });
          this.isShowRight = false;
        });
        // 连线
        this.jsPlumb.bind("connection", (evt) => {
          //   console.log("connection", evt);
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
          //   console.log("contextmenu", evt);
        });

        // 连线
        this.jsPlumb.bind("beforeDrop", (evt) => {
          //   console.log("beforeDrop", evt);
          if (evt.targetId === "nodeAssertion") {
            this.$message.error("该关系不允许创建");
            return false; //断言不可连线
          }
          // 如果起点是断言，则目标元素必须是过滤器的起点
          let from = evt.sourceId;
          let to = evt.targetId;
          if (from === "nodeAssertion") {
            if (this.checkAssertionLine(evt)) {
              this.$message.error(
                "断言区域有且只能有一条指向过滤器初始节点的线"
              );
              return false;
            }
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
          if (to === "nodeEnd") {
            let returnFlag = false;
            this.data.lineList.some((item) => {
              if (item.to === "nodeEnd") {
                returnFlag = true; //已经存在结束节点被连接
                return true;
              }
            });
            if (returnFlag) {
              this.$message.error("结束节点只能连接一次");
              return false;
            }
          }
          this.$message.success("连接成功");
          return true;
        });

        // beforeDetach
        this.jsPlumb.bind("beforeDetach", (evt) => {
          //   console.log("beforeDetach", evt);
        });
        this.jsPlumb.setContainer(this.$refs.efContainer);
        if (this.data.hide) {
          //   console.log("this.data.hide....");
          setTimeout(() => {
            this.handleAssertionShow(this.data);
          }, 500);
        }
      });
    },
    // 其他拖拽不合法，坐标恢复
    otherNodeResetting(id) {
      let myList = this.data.nodeList;
      myList.some((rootItem) => {
        if (rootItem.id === id) {
          // 修改坐标
          let itemX = parseFloat(rootItem.originLeft.split("px")[0]);
          let itemY = parseFloat(rootItem.originTop.split("px")[0]);
          rootItem.left = itemX + "px";
          rootItem.top = itemY + "px";
          $("#" + rootItem.id).css({
            left: itemX + "px",
            top: itemY + "px",
          });
          return true;
        }
      });
      const self = this;
      self.$nextTick(function () {
        self.$set(this.data, "nodeList", myList);
        self.repaintEverything();
      });
    },
    // 加载流程图
    loadEasyFlow() {
      // 初始化节点
      for (var i = 0; i < this.data.nodeList.length; i++) {
        let node = this.data.nodeList[i];
        // console.log(node);
        // 设置源点，可以拖出线连接其他节点
        this.jsPlumb.makeSource(
          node.id,
          lodash.merge(this.jsplumbSourceOptions, {})
        );
        // 设置目标点，其他源点拖出的线可以连接该节点
        this.jsPlumb.makeTarget(node.id, this.jsplumbTargetOptions);
        const self = this;
        if (!node.viewOnly) {
          this.jsPlumb.draggable(node.id, {
            containment: "parent",
            stop: function (el) {
              // 拖拽节点结束后的对调
              //   console.log("拖拽结束2: ", el);
              this.isShowRight = false;
              if (el.el.id === "nodeAssertion") {
                // 如果拖动的是断言区域和过滤器区域,则让区域里面的元素跟随拖动
                let offsetX = el.pos[0] - node.originLeft.split("px")[0];
                let offsetY = el.pos[1] - node.originTop.split("px")[0];
                // nodeAssertion
                self.resetDragNodes(self.data.nodeList, offsetX, offsetY);
              } else {
                // 判断拖动的新节点是否在区域内
                let isInObj = self.checkOtherNodeIsIn(
                  self.data.nodeList[1],
                  el.pos[0],
                  el.pos[1]
                );
                if (
                  (node.typeName === "assertion" && !isInObj.isIn) ||
                  (node.typeName !== "assertion" && isInObj.isIn)
                ) {
                  self.$message.error("断言区域内只能拖放断言选择器!");
                  // 坐标恢复
                  self.otherNodeResetting(el.el.id);
                } else {
                  let newX = el.pos[0];
                  let newY = el.pos[1];
                  let _nodeList = self.data.nodeList;
                  _nodeList.some((item) => {
                    if (item.id === el.el.id) {
                      item.left = newX + "px";
                      item.top = newY + "px";
                      return true;
                    }
                  });
                  self.$set(self.data, "nodeList", _nodeList);
                }
              }
            },
            start: function (el) {
              node.originLeft = node.left;
              node.originTop = node.top;
              self.isShowRight = false;
            },
            drag: function (el) {
              // console.log("move....",el)
              //在元素移动的时候改变状态
              self.isShowRight = false;
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
    // 针对断言
    checkNodeIsIn(item, left, top) {
      //   console.log(item, left, top);
      //node尺寸170,32
      let returnObj = {
        pId: undefined,
        isIn: false,
      };
      let itemLeft = parseFloat(item.left.split("px")[0]),
        itemTop = parseFloat(item.top.split("px")[0]),
        itemWidth = parseFloat(item.style.width.split("px")[0]),
        itemHeight = parseFloat(item.style.height.split("px")[0]);
      //   console.log(itemLeft, itemTop, itemWidth, itemHeight);
      if (
        left < itemLeft ||
        top < itemTop ||
        left > itemLeft + itemWidth ||
        top > itemTop + itemHeight
      ) {
        // 区域外
      } else {
        // 区域内
        returnObj.pId = item.id;
        returnObj.isIn = true;
      }
      return returnObj;
    },
    // 针对断言外其他节点
    checkOtherNodeIsIn(item, left, top) {
      //   console.log(item, left, top);
      //node尺寸170,32
      let returnObj = {
        pId: undefined,
        isIn: false,
      };
      let itemLeft = parseFloat(item.left.split("px")[0]),
        itemTop = parseFloat(item.top.split("px")[0]),
        itemWidth = parseFloat(item.style.width.split("px")[0]),
        itemHeight = parseFloat(item.style.height.split("px")[0]);
      //   console.log(itemLeft, itemTop, itemWidth, itemHeight);
      if (
        left < itemLeft ||
        top < itemTop ||
        left > itemLeft + itemWidth ||
        top > itemTop + itemHeight
      ) {
        // 区域外
      } else {
        // 区域内
        returnObj.pId = item.id;
        returnObj.isIn = true;
      }
      return returnObj;
    },
    /**
     * 拖拽结束后添加新的节点
     * @param evt
     * @param nodeMenu 被添加的节点对象
     * @param mousePosition 鼠标拖拽结束的坐标
     */
    addNode(evt, nodeMenu, mousePosition) {
      this.$off("addNode");
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
      // 判断是否是断言或者过滤器
      //   console.log(nodeMenu);
      //   console.log(this.data.nodeList);
      left = left - containerRect.x + efContainer.scrollLeft;
      top = top - containerRect.y + efContainer.scrollTop;
      var nodeId = this.getUUID();
      var node = {
        id: nodeId,
        left: left + "px",
        top: top + "px",
        state: nodeMenu.type === "assertion" ? "running" : "",
        ...nodeMenu,
      };
      if (nodeMenu.typeName === "assertion") {
        // 断言区域
        var assertionObj = this.data.nodeList[1];
        // 判断拖动的新节点是否在区域内
        let isInObj = this.checkNodeIsIn(assertionObj, left, top);
        if (isInObj.isIn) {
          node.pId = isInObj.pId;
        } else {
          this.$message.error("请将断言选择拖动到断言区域内!");
          return;
        }
        // 判断断言是否重复，断言不允许重复
        let assertionList = this.data.nodeList.filter((item) => {
          return item.typeName === "assertion";
        });
        let isHave = false;
        assertionList.some((item) => {
          if (item.name === node.name) {
            isHave = true;
            return true;
          }
        });
        if (isHave) {
          this.$message.error("断言区域内已经存在该断言选择器!");
          return;
        }
        // 修改node节点坐标，相对于断言区域水平居中，竖直从上向下排列，
        let itemLeft = parseFloat(assertionObj.left.split("px")[0]),
          itemTop = parseFloat(assertionObj.top.split("px")[0]),
          itemWidth = parseFloat(assertionObj.style.width.split("px")[0]),
          itemHeight = parseFloat(assertionObj.style.height.split("px")[0]);
        // console.log(itemLeft, itemTop, itemWidth, itemHeight);
        node.left = itemLeft + Math.ceil((itemWidth - 170) / 2) + "px";
        node.top = itemTop + (assertionList.length * 45 + 35) + "px";
        // 默认断言区域只能放两个断言，如果超过2个，则需要动态修改断言区域的大小
        if (assertionList.length >= 2) {
          // console.log(assertionObj) //this.data.nodeList[1]
          let newWidth =
            parseFloat(assertionObj.style.width.split("px")[0]) + 0;
          let newHeight =
            parseFloat(assertionObj.style.height.split("px")[0]) + 35;
          assertionObj.style = {
            width: newWidth + "px",
            height: newHeight + "px",
          };
          this.$set(this.data.nodeList, 1, assertionObj);
          // 修改新元素的坐标位置
          // let preObj = assertionList[assertionList.length-1];
          // let preObjLeft = parseFloat(preObj.left.split("px")[0]);
          // let preObjTop = parseFloat(preObj.top.split("px")[0]) + 45;
          // node.left = preObjLeft + 'px';
          // node.top = preObjTop + 'px';
          // 限制最大高度
          let maxHeight = (document.body.clientHeight - 145) * 0.6;
          // console.log("clientHeight...",clientHeight)
          if (newHeight >= maxHeight) {
            $("#" + assertionObj.id).css({
              "max-height": maxHeight + "px",
              overflow: "auto",
            });
          }
        }
      } else if (nodeMenu.typeName === "filter") {
        // 断言区域
        var assertionObj = this.data.nodeList[1];
        // 判断拖动的新节点是否在区域内
        let isInObj = this.checkOtherNodeIsIn(assertionObj, left, top);
        if (isInObj.isIn) {
          this.$message.error("断言区域内只能拖放断言选择器!");
          return;
        }
      }
      this.data.nodeList.push(node);
      const self = this;
      this.$nextTick(function () {
        if (node.typeName === "filter") {
          this.jsPlumb.makeSource(nodeId, this.jsplumbSourceOptions);
          this.jsPlumb.makeTarget(nodeId, this.jsplumbTargetOptions);
        }
        this.jsPlumb.draggable(nodeId, {
          containment: "parent",
          stop: function (el) {
            // 拖拽节点结束后的对调
            // console.log("拖拽结束: ", el);
            // 判断拖动的新节点是否在区域内
            let isInObj = self.checkOtherNodeIsIn(
              self.data.nodeList[1],
              el.pos[0],
              el.pos[1]
            );
            if (nodeMenu.typeName !== "assertion") {
              if (isInObj.isIn) {
                self.$message.error("断言区域内只能拖放断言选择器!");
                // 坐标恢复
                self.otherNodeResetting(el.el.id);
              }
            } else {
              if (isInObj.isIn) {
                node.pId = isInObj.pId;
              } else {
                self.$message.error("请将断言选择拖到断言区域内!");
                node.left = node.originLeft;
                node.top = node.originTop;
                self.$set(el.pos, 0, parseFloat(node.left.split("px")[0]));
                self.$set(el.pos, 1, parseFloat(node.top.split("px")[0]));
                self.data.nodeList.splice(
                  self.data.nodeList.indexOf(node),
                  1,
                  node
                );
                $("#" + nodeId).css({
                  left: node.left,
                  top: node.top,
                });
              }
            }
          },
          start: function (el) {
            node.originLeft = node.left;
            node.originTop = node.top;
            //在元素移动的时候改变状态
            self.isShowRight = false;
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
      this.$confirm("确定要删除节点" + nodeName + "?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        closeOnClickModal: false,
      })
        .then(() => {
          /**
           * 这里需要进行业务判断，是否可以删除
           */
          const that = this;
          let _nodeList = this.data.nodeList;
          let _deleIndex = -1;
          _nodeList.some((node, index) => {
            if (node.id === nodeId) {
              _deleIndex = index;
              if (node.typeName === "assertion") {
                let assertionList = that.data.nodeList.filter((nodeItem) => {
                  return nodeItem.typeName === "assertion";
                });
                that.deleNodeResetAssertionArea(assertionList.indexOf(node));
              }
              _nodeList.splice(_deleIndex, 1);
              this.$set(this.data, "nodeList", _nodeList);
              return true;
            }
          });
          this.$nextTick(function () {
            this.jsPlumb.removeAllEndpoints(nodeId);
            this.activeElement = {};
            this.isShowRight = false;
          });
        })
        .catch(() => {});
      return true;
    },
    // 如果删除的是断言区域里面的元素，需要调整区域大小
    deleNodeResetAssertionArea(deleIndex) {
      // 断言区域
      var assertionObj = this.data.nodeList[1];
      let assertionObjHeight = parseFloat(
        assertionObj.style.height.split("px")[0]
      );
      // 如果断言区域高度不低于默认的150px，则需要减小45
      if (assertionObjHeight > 150) {
        let newWidth = parseFloat(assertionObj.style.width.split("px")[0]);
        assertionObj.style = {
          width: newWidth + "px",
          height: assertionObjHeight - 35 + "px",
        };
        this.$set(this.data.nodeList, 1, assertionObj);
      }
      // 断言区域元素内删除元素后面的元素全部上移
      let assertionList = this.data.nodeList.filter((nodeItem) => {
        return nodeItem.typeName === "assertion";
      });
      assertionList.forEach((item, index) => {
        if (item.typeName === "assertion" && index >= deleIndex) {
          //   console.log("resetTop....", item, index);
          let itemLeft = parseFloat(item.left.split("px")[0]);
          let itemTop = parseFloat(item.top.split("px")[0] - 45);
          item.left = itemLeft + "px";
          item.top = itemTop + "px";
          this.repaintEverything();
        }
      });
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
      console.log(nodeId);
      if (
        nodeId === "nodeStart" ||
        nodeId === "nodeAssertion" ||
        nodeId === "nodeEnd"
      ) {
        this.activeElement = {};
        this.isShowRight = false;
        return; //点击的开始和结束节点
      }
      this.isShowRight = true;
      this.activeElement.type = "node";
      this.activeElement.nodeId = nodeId;
      this.$refs.nodeForm.nodeInit(this.data, nodeId);
      this.data.nodeList.filter((node) => {
        if (node.id === nodeId) {
          //   console.log(node);
          this.activeElement.nodeName = node.name;
        }
      });
    },
    /**
     * 断言区域有且只能有一条指向过滤器初始节点的线
     */
    checkAssertionLine(evt) {
      let from = evt.sourceId;
      let to = evt.targetId;
      let returnFlag = false;
      this.data.lineList.some((item) => {
        if (item.from === from) {
          returnFlag = true;
          return true;
        }
      });
      if (to === "nodeEnd") {
        returnFlag = true;
      }
      this.data.lineList.some((item) => {
        if (item.to === to) {
          returnFlag = true;
          return true;
        }
      });
      return returnFlag;
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
      //   console.log("nodeRightMenu...");
      // this.menu.show = true
      // this.menu.curNodeId = nodeId
      // this.menu.left = evt.x + 'px'
      // this.menu.top = evt.y + 'px'
    },
    repaintEverything(data) {
      this.$nextTick(function () {
        // console.log("repaintEverything...", data);
        if (data) {
          this.$set(this, "data", data);
        }
        // console.log(this.data);
        this.jsPlumb.repaint();
        this.jsPlumb.repaintEverything();
      });
    },
    // 加载流程图
    dataReload(data) {
      this.easyFlowVisible = false;
      this.data.nodeList = [];
      this.data.lineList = [];
      this.$nextTick(() => {
        data = lodash.cloneDeep(data);
        if (data.hide) {
          // 如果是详情，则所有的不可编辑
          data.nodeList.forEach((item) => {
            item.viewOnly = true;
          });
        }
        this.easyFlowVisible = true;
        this.data = data;
        this.$nextTick(() => {
          this.jsPlumb = jsPlumb.getInstance();
          this.jsPlumbInit();
        });
      });
    },
    handleAssertionShow(data) {
      data.nodeList.forEach((item) => {
        if (item.typeName === "assertion") {
          // 断言区域里面的断言，详情回显的时候需要设置 z-index否则显示有bug
          $("#" + item.id).css("z-index", 10);
        }
      });
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
        // console.log(svgImage);
        if (svgImage) {
          // this.data.svgImage = svgImage
          this.$emit("saveRouteLayout", this.data);
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
