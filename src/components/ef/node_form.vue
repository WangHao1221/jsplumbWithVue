<template>
    <div>
        <div class="ef-node-form">
            <div class="ef-node-form-header">
                属性
            </div>
            <div class="ef-node-form-body">
                <el-form :model="node" ref="dataForm" label-width="80px" v-show="type === 'node'">
                      <el-form-item label="策略名称">
                          <el-input v-model="node.name" :disabled="true"></el-input>
                      </el-form-item>
                    <div v-show="(node.type!=='assertion'&&node.type!=='filter'&&node.category===1)">
                      <el-form-item label="策略编码">
                          <el-input v-model="node.beanName" :disabled="true"></el-input>
                      </el-form-item>
                      <el-form-item label="示例">
                          <el-input v-model="node.example" :disabled="true"></el-input>
                      </el-form-item>
                      <el-form-item label="匹配数据" v-for="(nodeItem,nodeIndex) in node.paramList" :key="nodeItem.id">
                          <el-input class="my-input" v-model="nodeItem.param" placeholder="请输入" :disabled="isRead"></el-input>
                          <el-button class="customer-btn" type="default" icon="el-icon-plus" @click="addProps(1,nodeItem,nodeIndex)" :disabled="isRead"></el-button>
                          <el-button class="customer-btn" type="default" icon="el-icon-delete" @click="deleteProps(1,nodeItem,nodeIndex)" :disabled="isRead"></el-button>
                      </el-form-item>
                    </div>
                    <div v-show="(node.type!=='assertion'&&node.type!=='filter'&&node.category===2)">
                      <el-form-item label="策略编码">
                          <el-input v-model="node.beanCode" :disabled="true"></el-input>
                      </el-form-item>
                      <el-form-item label="示例">
                          <el-input v-model="node.example" :disabled="true"></el-input>
                      </el-form-item>
                     <el-form-item label="策略内容" v-for="(nodeItem,nodeIndex) in node.filterParamList" :key="nodeItem.id">
                          <el-input class="my-input" v-model="nodeItem.param" placeholder="请输入" :disabled="isRead"></el-input>
                          <el-button class="customer-btn" type="default" icon="el-icon-plus" @click="addProps(2,nodeItem,nodeIndex)" :disabled="isRead"></el-button>
                          <el-button class="customer-btn" type="default" icon="el-icon-delete" @click="deleteProps(2,nodeItem,nodeIndex)" :disabled="isRead"></el-button>
                      </el-form-item>
                    </div>
                    <el-form-item v-show="!isRead">
                        <!-- <el-button icon="el-icon-close">重置</el-button> -->
                        <el-button type="primary" icon="el-icon-check" @click="save">保存</el-button>
                    </el-form-item>
                </el-form>

                <el-form :model="line" ref="dataForm" label-width="80px" v-show="type === 'line'">
                    <el-form-item label="条件">
                        <el-input v-model="line.label" placeholder="请输入" :disabled="isRead"></el-input>
                    </el-form-item>
                    <el-form-item v-show="!isRead">
                        <!-- <el-button icon="el-icon-close" @click="resetLine">重置</el-button> -->
                        <el-button type="primary" icon="el-icon-check" @click="saveLine">保存</el-button>
                    </el-form-item>
                </el-form>
            </div>
        </div>
    </div>

</template>

<script>
import { cloneDeep } from "lodash";

export default {
  props: {},
  data() {
    return {
      isRead: false,
      // node 或 line
      type: "node",
      node: {},
      line: {},
      data: {},
    };
  },
  methods: {
    /**
     * 表单修改，这里可以根据传入的ID进行业务信息获取
     * @param data
     * @param id
     */
    nodeInit(data, id) {
      this.isRead = data.hide; //详情时只读
      this.type = "node";
      this.data = data;
      data.nodeList.filter((node) => {
        if (node.id === id) {
          //   console.log(node);
          if (node.typeName === "assertion" && !node.paramList) {
            // 断言
            node.paramList = [{ id: this.getUUID() }]; //断言 匹配数据
          } else if (node.typeName === "filter" && !node.filterParamList) {
            // 过滤器
            node.filterParamList = [{ id: this.getUUID() }]; //过滤器 策略内容参数
          }
          this.node = cloneDeep(node);
          console.log(this.node);
        }
      });
    },
    lineInit(line) {
      this.type = "line";
      this.line = line;
    },
    resetLine() {
      //   console.log(this.line);
    },
    getUUID() {
      return Math.random()
        .toString(36)
        .substr(3, 10);
    },
    addProps(type, nodeItem, nodeIndex) {
      // 判断是断言还是匹配项，进行数组末尾拼接
      if (!nodeItem.param) {
        this.$Message.warning("匹配数据或内容不能为空");
        return;
      }
      // 向数组插入一条新数据
      let _paramsList =
        type === 1 ? this.node.paramList : this.node.filterParamList;
      _paramsList.splice(nodeIndex + 1, 0, {
        id: this.getUUID(),
      });
      this.$set(
        this.node,
        type === 1 ? "paramList" : "filterParamList",
        _paramsList
      );
    },
    deleteProps(type, nodeItem, nodeIndex) {
      if (this.node.paramList.length === 1) {
        this.$Message.warning("匹配数据或内容不能为空");
        return;
      }
      // 可以删除，判断删除的是断言，还是匹配项
      let _paramsList =
        type === 1 ? this.node.paramList : this.node.filterParamList;
      _paramsList.splice(nodeIndex, 1);
      this.$set(
        this.node,
        type === 1 ? "paramList" : "filterParamList",
        _paramsList
      );
    },
    // 修改连线
    saveLine() {
      this.$emit("setLineLabel", this.line.from, this.line.to, this.line.label);
    },
    save() {
      let isCanSave = true;
      let compareList =
        this.node.typeName === "assertion"
          ? this.node.paramList
          : this.node.filterParamList;
      if (this.node.typeName === "assertion") {
        // 断言
        compareList.some((item) => {
          if (!item.param) {
            isCanSave = false;
            this.$Message.error("匹配数据不允许存在为空");
            return true;
          }
        });
      } else if (this.node.typeName === "filter") {
        // 过滤器
        compareList.some((item) => {
          if (!item.param) {
            isCanSave = false;
            this.$Message.error("策略内容不允许存在为空");
            return true;
          }
        });
      }
      if (!isCanSave) {
        return;
      }
      this.data.nodeList.filter((node) => {
        if (node.id === this.node.id) {
          //   console.log(node);
          if (node.typeName === "assertion") {
            // 断言
            node.paramList = this.node.paramList;
          } else if (node.typeName === "filter") {
            // 过滤器
            node.filterParamList = this.node.filterParamList;
          }
          this.$emit("repaintEverything", this.data);
        }
      });
    },
  },
};
</script>

<style lang="less" scoped>
.el-form-item__content {
  .my-input {
    width: calc(~"100% - 86px");
  }
  .customer-btn {
    padding: 6px 10px;
  }
}
</style>
