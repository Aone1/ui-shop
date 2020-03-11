<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
        <!-- 警告信息区域 -->
        <el-alert show-icon title="注意：只允许为第三级分类设置相关参数！" type="warning" :closable="false"></el-alert>

        <!-- 级联选择器区域 -->
        <el-row class="cat_opt">
            <el-col>
                <span>选择商品分类：</span>
                <el-cascader v-model="selectedKeys" :options="caseOptions" 
                    :props="{expandTrigger:'hover',label:'catName',value:'catId',children:'children'}"
                    @change="caseChanged"></el-cascader>
            </el-col>
        </el-row>

        <!-- tab页签区域 -->
        <el-tabs v-model="activeName" @tab-click="tabChanged">
            <el-tab-pane label="动态参数" name="many">
                <el-button type="primary" size="mini" :disabled="isBtnDisable" @click="addFormVisible=true">添加参数</el-button>
                <!-- 动态参数表格 -->
                <el-table :data="manyTableData" border stripe>
                    <el-table-column type="expand">
                        <template slot-scope="scope">
                            <!-- 循环渲染Tag标签 -->
                            <el-tag v-for="(val,i) in scope.row.attrVals" :key="i" closable @close="closeTab(i,scope.row)">{{val}}</el-tag>
                            <el-input class="input-new-tag" ref="saveTagInput" size="small"
                                v-if="scope.row.inputVisible" v-model="scope.row.inputValue"
                                @keyup.enter.native="handleInputConfirm(scope.row)"
                                @blur="handleInputConfirm(scope.row)"></el-input>
                            <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                        </template>
                    </el-table-column>
                    <el-table-column type="index"></el-table-column>
                    <el-table-column prop="attrName" label="参数名称"></el-table-column>
                    <el-table-column label="操作">
                        <template slot-scope="scope">
                            <el-button size="mini" type="primary" icon="el-icon-edit" @click="openEditForm(scope.row.attrId)">编辑</el-button>
                            <el-button size="mini" type="danger" icon="el-icon-delete" @click="del(scope.row.attrId)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-tab-pane>
            <el-tab-pane label="静态属性" name="only">
                <el-button type="primary" size="mini" :disabled="isBtnDisable" @click="addFormVisible=true">添加属性</el-button>
                <!-- 静态属性表格 -->
                <el-table :data="onlyTableData" border stripe>
                    <el-table-column type="expand">
                        <template slot-scope="scope">
                            <!-- 循环渲染Tag标签 -->
                            <el-tag v-for="(val,i) in scope.row.attrVals" :key="i" closable @close="closeTab(i,scope.row)">{{val}}</el-tag>
                            <el-input class="input-new-tag" ref="saveTagInput" size="small"
                                v-if="scope.row.inputVisible" v-model="scope.row.inputValue"
                                @keyup.enter.native="handleInputConfirm(scope.row)"
                                @blur="handleInputConfirm(scope.row)"></el-input>
                            <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                        </template>
                    </el-table-column>
                    <el-table-column type="index"></el-table-column>
                    <el-table-column prop="attrName" label="属性名称"></el-table-column>
                    <el-table-column label="操作">
                        <template slot-scope="scope">
                            <el-button size="mini" type="primary" icon="el-icon-edit" @click="openEditForm(scope.row.attrId)">编辑</el-button>
                            <el-button size="mini" type="danger" icon="el-icon-delete" @click="del(scope.row.attrId)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-tab-pane>
        </el-tabs>
    </el-card>

    <!-- 添加对话框 -->
    <el-dialog
      :title="'添加'+titleText"
      :visible.sync="addFormVisible"
      @close="addDialogClosed"
      :close-on-click-modal="false"
    >
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
        <el-form-item :label="titleText" prop="attrName">
          <el-input :placeholder="titleText" v-model="addForm.attrName" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" style="text-align: center">
        <el-button type="primary" @click="saveAddForm">保存</el-button>
        <el-button @click="addFormVisible=false">关闭</el-button>
      </div>
    </el-dialog>

    <!-- 修改对话框 -->
    <el-dialog
      :title="'修改'+titleText"
      :visible.sync="editFormVisible"
      @close="editDialogClosed"
      :close-on-click-modal="false"
    >
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="80px">
        <el-form-item :label="titleText" prop="attrName">
          <el-input :placeholder="titleText" v-model="editForm.attrName" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" style="text-align: center">
        <el-button type="primary" @click="saveEditForm">保存</el-button>
        <el-button @click="editFormVisible=false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
    data(){
        return{
            selectedKeys:[],
            caseOptions:[],
            activeName:'many',
            manyTableData:[],
            onlyTableData:[],
            addFormVisible: false,
            addForm: {},
            addFormRules:{
                attrName:[
                    {required: true, message: "数据不能为空！", trigger: "blur" }
                ]
            },
            editFormVisible: false,
            editForm: {},
            editFormRules:{
                attrName:[
                    {required: true, message: "数据不能为空！", trigger: "blur" }
                ]
            }
        }
    },
    created(){
        this.initCate();
    },
    methods:{
        initCate(){
            this.requestQuickGet('/manager/cate/allNode').then(resp=>{
                if(!resp.data.success){
                    return this.$message.error("获取分类级联列表失败！");
                }
                this.caseOptions=resp.data.data;
            })
        },
        caseChanged(){
            this.queryParams();
        },
        tabChanged(){
            this.queryParams();
        },
        queryParams(){
            if(this.selectedKeys.length!=3){
                this.selectedKeys=[];
                this.manyTableData=[];
                this.onlyTableData=[];
                return;
            }

            if(this.cateId!=null){
                this.requestQuickGet(`/manager/attr/findAttr/${this.cateId}?attrSel=${this.activeName}`).then(resp=>{
                    if(!resp.data.success){
                        return this.$message.error("查询数据失败！");
                    }
                    //将attrVals按照逗号拆分成数组
                    resp.data.data.forEach(item=>{
                        item.attrVals=item.attrVals?item.attrVals.split(','):[];
                        item.inputVisible=false;
                        item.inputValue='';
                    })
                    if(this.activeName=='many'){
                        this.manyTableData=resp.data.data;
                    }else{
                        this.onlyTableData=resp.data.data;
                    }
                })
            }
        },
        addDialogClosed() {
            this.$refs.addFormRef.resetFields();
            this.addForm={};
        },
        saveAddForm(){
            this.$refs.addFormRef.validate(valid=>{
                if(valid){
                    this.addForm.catId=this.selectedKeys[2];
                    this.addForm.attrSel=this.activeName;
                    this.addForm.attrWrite=this.activeName=="many"?"list":"manual";
                    this.addForm.attrVals="";
                    this.requestPostForm("/manager/attr/",this.addForm).then(resp=>{
                        if(!resp.data.success){
                            return this.$message.error("添加失败");
                        }
                        this.$message.success("添加成功");
                        this.addFormVisible=false;
                        this.queryParams();
                    })
                }
            });
        },
        openEditForm(id){
            this.requestQuickGet(`/manager/attr/${id}`).then(resp=>{
                this.editForm=resp.data;
            })
            this.editFormVisible=true;
        },
        editDialogClosed() {
            this.$refs.editFormRef.resetFields();
            this.editForm={};
        },
        saveEditForm(){
            this.$refs.editFormRef.validate(valid=>{
                if(valid){
                    this.requestPut("/manager/attr/",this.editForm).then(resp=>{
                        if(!resp.data.success){
                            return this.$message.error("修改失败");
                        }
                        this.$message.success("修改成功");
                        this.editFormVisible=false;
                        this.queryParams();
                    })
                }
            });
        },
        del(id){
            this.$confirm("确认删除吗？","提示",{}).then(()=>{
                this.requestDelete(`/manager/attr/${id}`).then(resp=>{
                    if(!resp.data.success){
                        return this.$message.error("删除失败");
                    }
                    this.$message.success("删除成功");
                    this.queryParams();
                })
            }).catch(err=>err)
        },
        //点击按钮，展示输入文本框
        showInput(row){
            row.inputVisible=true;
            //$nextTick方法的作用：当页面上元素被重新渲染后，才会执行回调函数中的代码
            this.$nextTick(_ => {
                this.$refs.saveTagInput.$refs.input.focus();
            });
        },
        //文本框失去焦点，或摁下Enter键都会触发
        handleInputConfirm(row){
            if(row.inputValue.trim().length===0){
                row.inputValue='';
                row.inputVisible=false;
                return;
            }
            //如果没有return，证明输入内容有效，执行添加操作
            row.attrVals.push(row.inputValue.trim());
            row.inputValue='';
            row.inputVisible=false;
            //保存
            this.updateAttrVals(row);
        },
        closeTab(i,row){
            row.attrVals.splice(i,1);
            this.updateAttrVals(row);
        },
        updateAttrVals(row){
            this.requestPut("/manager/attr/",{
                "attrId":row.attrId,
                "attrVals":row.attrVals.join(',')
            }).then(resp=>{
                if(!resp.data.success){
                    return this.$message.error("更新失败");
                }
                this.$message.success("更新成功");
            })
        }
    },
    //计算属性
    computed:{
        //如果按钮需要被禁用，则返回true，否则返回false
        isBtnDisable(){
            if(this.selectedKeys.length!=3){
                return true;
            }
            return false;
        },
        //当前选中的三级分类的id
        cateId(){
            if(this.selectedKeys.length==3){
                return this.selectedKeys[2];
            }
            return null;
        },
        titleText(){
            if(this.activeName=="many"){
                return "动态参数";
            }
            return "静态属性";
        }
    }
}
</script>

<style lang="less" scoped>
.cat_opt{
    margin:15px 0px;
}
.el-tag{
    margin:10px;
}
.input-new-tag{
    width:120px;
}
</style>