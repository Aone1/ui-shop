<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    
    <!-- 卡片视图区域 -->
    <el-card>
        <!-- 添加分类区域 -->
        <el-row>
            <el-col>
                <el-button type="primary" @click="openCaseForm">添加分类</el-button>
            </el-col>
        </el-row>

        <!-- 分类列表区域 -->
        <tree-table class="treeTable" :data="list" :columns="columns"
            :selection-type="false" :expand-type="false"
            show-index index-text="#" border>
            <template slot="isok" slot-scope="scope">
                <i class="el-icon-success" style="color:lightgreen;" v-if="scope.row.catDeleted===0"></i>
                <i class="el-icon-error" style="color:red;" v-else></i>
            </template>
            <template slot="order" slot-scope="scope">
                <el-tag size="mini" v-if="scope.row.catLevel===0">一级</el-tag>
                <el-tag size="mini" v-else-if="scope.row.catLevel===1" type="success">二级</el-tag>
                <el-tag size="mini" v-else type="warning">三级</el-tag>
            </template>
            <template slot="option" slot-scope="scope">
                <el-button size="mini" type="primary" icon="el-icon-edit" @click="openEditForm(scope.row.catId)">编辑</el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="del(scope.row.catId)">删除</el-button>
            </template>
        </tree-table>

        <!-- 分页区域 -->
        <el-pagination
            layout="total, sizes, prev, pager, next, jumper"
            :page-sizes="[5, 10, 15, 20]"
            :total="total"
            :current-page="this.params.page"
            :page-size="this.params.size"
            @size-change="changePageSize"
            @current-change="changeCurrentPage"
        ></el-pagination>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCaseFormVisible"
      @close="addDialogClosed"
      :close-on-click-modal="false"
    >
      <el-form :model="addCaseForm" :rules="addCaseFormRules" ref="addCaseFormRef" label-width="80px">
        <el-form-item label="分类名称" prop="catName">
          <el-input placeholder="分类名称" v-model="addCaseForm.catName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader placeholder="父级分类" v-model="selectedKeys" style="width:100%"
            :options="caseOptions" :props="{expandTrigger:'hover',checkStrictly:true}" clearable
            @change="parentCaseChanged"></el-cascader>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" style="text-align: center">
        <el-button type="primary" @click="saveAddCaseForm">保存</el-button>
        <el-button @click="addCaseFormVisible=false">关闭</el-button>
      </div>
    </el-dialog>

    <!-- 修改分类对话框 -->
    <el-dialog
      title="修改分类"
      :visible.sync="editCaseFormVisible"
      @close="editDialogClosed"
      :close-on-click-modal="false"
    >
      <el-form :model="editCaseForm" :rules="editCaseFormRules" ref="editCaseFormRef" label-width="80px">
        <el-form-item label="分类名称" prop="catName">
          <el-input placeholder="分类名称" v-model="editCaseForm.catName" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" style="text-align: center">
        <el-button type="primary" @click="saveEditCaseForm">保存</el-button>
        <el-button @click="editCaseFormVisible=false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
    data(){
        return{
            list:[],
            total:0,
            params:{
                page:1,
                size:5
            },
            //为table指定列的定义
            columns:[
                {label:'分类名称',prop:'catName'},
                {label:'是否有效',type:'template',template:'isok'},
                {label:'排序',type:'template',template:'order'},
                {label:'操作',type:'template',template:'option'}
            ],
            caseOptions:[],
            addCaseFormVisible: false,
            addCaseForm: {},
            addCaseFormRules:{
                catName:[
                    {required: true, message: "请输入分类名称", trigger: "blur" }
                ]
            },
            selectedKeys:[],
            editCaseFormVisible: false,
            editCaseForm: {},
            editCaseFormRules:{
                catName:[
                    {required: true, message: "请输入分类名称", trigger: "blur" }
                ]
            }
        }
    },
    created(){
        this.getCates();
    },
    methods:{
        async initParentCate(){
            const {data:res}=await this.$http.get(`${this.baseUrl}/cate/getParentCase`);
            if(!res.success){
                return this.$message.error("获取父级分类失败！");
            }
            this.caseOptions=res.data;
        },
        async getCates(){
            const {data:res}=await this.$http.get(`${this.baseUrl}/cate/findPage?page=${this.params.page}&size=${this.params.size}`);
            this.list=res.rows;
            this.total=res.total;
        },
        changePageSize(size) {
            this.params.size = size;
            this.getCates();
        },
        changeCurrentPage(page) {
            this.params.page = page;
            this.getCates();
        },
        parentCaseChanged(){
            if(this.selectedKeys.length>0){
                this.addCaseForm.catPid=this.selectedKeys[this.selectedKeys.length-1];
                this.addCaseForm.catLevel=this.selectedKeys.length;
            }else{
                this.addCaseForm.catPid=0;
                this.addCaseForm.catLevel=0;
            }
        },
        saveAddCaseForm(){
            this.$refs.addCaseFormRef.validate(async valid=>{
                if(valid){
                    const {data:res}=await this.$http.post(`${this.baseUrl}/cate/`,this.addCaseForm);
                    if(!res.success){
                        return this.$message.error("添加失败");
                    }
                    this.$message.success("添加成功");
                    this.getCates();
                    this.addCaseFormVisible=false;
                }
            });
        },
        addDialogClosed() {
            this.$refs.addCaseFormRef.resetFields();
            this.selectedKeys=[];
            this.addCaseForm={};
        },
        openCaseForm(){
            this.initParentCate();
            this.addCaseFormVisible=true;
        },
        //修改
        async openEditForm(id){
            const {data:res}=await this.$http.get(`${this.baseUrl}/cate/${id}`);
            this.editCaseForm=res;
            this.editCaseFormVisible=true;
        },
        editDialogClosed() {
            this.$refs.editCaseFormRef.resetFields();
            this.editCaseForm={};
        },
        saveEditCaseForm(){
            this.$refs.editCaseFormRef.validate(async valid=>{
                if(valid){
                    const {data:res}=await this.$http.put(`${this.baseUrl}/cate/`,this.editCaseForm);
                    if(!res.success){
                        return this.$message.error("修改失败");
                    }
                    this.$message.success("修改成功");
                    this.getCates();
                    this.editCaseFormVisible=false;
                }
            });
        },
        async del(id){
            const confirmResult=await this.$confirm("确认删除吗？","提示",{}).catch(err=>err);
            if(confirmResult=="confirm"){
                const {data:res}=await this.$http.delete(`${this.baseUrl}/cate/${id}`);
                if(!res.success){
                    return this.$message.error("删除失败！");
                }
                this.$message.success("删除成功");
                this.getCates();
            }
        }
    }
}
</script>

<style lang="less" scoped>
.treeTable{
    margin-top: 15px;
    font-size: 12px;
}
</style>