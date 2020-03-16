<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
        <!-- 提示信息 -->
        <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
        <!-- 步骤条区域 -->
        <el-steps :space="200" :active="activeIndex-0" finish-status="success" align-center>
            <el-step title="基本信息"></el-step>
            <el-step title="商品参数"></el-step>
            <el-step title="商品属性"></el-step>
            <el-step title="商品图片"></el-step>
            <el-step title="商品内容"></el-step>
            <el-step title="完成"></el-step>
        </el-steps>
        <!-- Tabs标签页 -->
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-position="top" label-width="100px">
            <el-tabs v-model="activeIndex" @tab-click="tabClicked" :before-leave="beforeTabLeave" tab-position="left">
                <el-tab-pane label="基本信息" name="0">
                    <el-form-item label="商品名称" prop="goodsName">
                        <el-input placeholder="商品名称" v-model="addForm.goodsName"></el-input>
                    </el-form-item>
                    <el-form-item label="商品价格" prop="goodsPrice">
                        <el-input placeholder="商品价格" v-model="addForm.goodsPrice" type="number"></el-input>
                    </el-form-item>
                    <el-form-item label="商品重量" prop="goodsWeight">
                        <el-input placeholder="商品重量" v-model="addForm.goodsWeight" type="number"></el-input>
                    </el-form-item>
                    <el-form-item label="商品数量" prop="goodsNumber">
                        <el-input placeholder="商品数量" v-model="addForm.goodsNumber" type="number"></el-input>
                    </el-form-item>
                    <el-form-item label="商品分类" prop="goodsCategory">
                        <el-cascader placeholder="商品分类" v-model="addForm.goodsCategory" :options="caseOptions" 
                            :props="{expandTrigger:'hover',label:'catName',value:'catId',children:'children'}"
                            @change="caseChanged" style="width:100%"></el-cascader>
                    </el-form-item>
                </el-tab-pane>
                <el-tab-pane label="商品参数" name="1">
                    <!-- 渲染表单的Item项 -->
                    <el-form-item :label="item.attrName" v-for="item in manyData" :key="item.attrId">
                        <!-- 复选框组 -->
                        <el-checkbox-group v-model="item.checkedAttrVals">
                            <el-checkbox :label="cb" v-for="(cb,i) in item.attrVals" :key="i" border></el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                </el-tab-pane>
                <el-tab-pane label="商品属性" name="2">
                    <el-form-item :label="item.attrName" v-for="item in onlyData" :key="item.attrId">
                        <el-input v-model="item.attrVals"></el-input>
                    </el-form-item>
                </el-tab-pane>
                <el-tab-pane label="商品图片" name="3">
                    <el-upload
                        :action=uploadAddPath
                        :on-preview="handlePreview"
                        :on-remove="handleRemove" :on-success="handleSuccess"
                        :file-list="fileList"
                        list-type="picture">
                        <el-button size="small" type="primary">点击上传</el-button>
                    </el-upload>
                </el-tab-pane>
                <el-tab-pane label="商品内容" name="4">
                    <!-- 富文本编辑器组件 -->
                    <quill-editor v-model="addForm.goodsIntroduce"></quill-editor>
                    <!-- 添加商品的按钮 -->
                    <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
                </el-tab-pane>
            </el-tabs>
        </el-form>
    </el-card>

    <!-- 图片预览 -->
    <el-dialog title="图片预览" :visible.sync="picVisible" width="50%" :close-on-click-modal="false">
      <img :src="picPath" style="width:100%">
    </el-dialog>
  </div>
</template>

<script>
export default {
    data(){
        return{
            uploadAddPath:this.baseUrl+"/file/upload?folder=goods",
            activeIndex:'0',
            addForm:{
                goodsName:'',
                goodsPrice:0,
                goodsWeight:0,
                goodsNumber:0,
                goodsCategory:[]
            },
            addFormRules:{
                goodsName:[
                    { required: true, message: "请输入商品名称", trigger: "blur" }
                ],
                goodsPrice:[
                    { required: true, message: "请输入商品价格", trigger: "blur" }
                ],
                goodsWeight:[
                    { required: true, message: "请输入商品重量", trigger: "blur" }
                ],
                goodsNumber:[
                    { required: true, message: "请输入商品数量", trigger: "blur" }
                ],
                goodsCategory:[
                    { required: true, message: "请选择商品分类", trigger: "blur" }
                ]
            },
            caseOptions:[],
            //动态参数
            manyData:[],
            //静态属性
            onlyData:[],
            fileList:[],
            pics:[],
            picVisible:false,
            picPath:'',
            attrs:[]
        }
    },
    created(){
        this.initCate();
    },
    methods:{
        async initCate(){
            const {data:res}=await this.$http.get(`${this.baseUrl}/cate/allNode`);
            if(!res.success){
                return this.$message.error("获取分类级联列表失败！");
            }
            this.caseOptions=res.data;
        },
        async caseChanged(){
            if(this.addForm.goodsCategory.length!=3){
                this.addForm.goodsCategory=[];
                return;
            }

            this.addForm.catId=this.addForm.goodsCategory[2];
            this.addForm.catOneId=this.addForm.goodsCategory[0];
            this.addForm.catTwoId=this.addForm.goodsCategory[1];
            this.addForm.catThreeId=this.addForm.goodsCategory[2];

            //参数
            const {data:res1}=await this.$http.get(`${this.baseUrl}/attr/findAttr/${this.cateId}?attrSel=many`);
            if(!res1.success){
                return this.$message.error("获取动态参数列表失败");
            }
            res1.data.forEach(item=>{
                item.checkedAttrVals=item.attrVals?item.attrVals.split(','):[];
                item.attrVals=item.attrVals?item.attrVals.split(','):[];
            })
            this.manyData=res1.data;

            //属性
            const {data:res2}=await this.$http.get(`${this.baseUrl}/attr/findAttr/${this.cateId}?attrSel=only`);
            if(!res2.success){
                return this.$message.error("获取静态属性列表失败");
            }
            this.onlyData=res2.data;
        },
        beforeTabLeave(activeName,oldActiveName){
            if(oldActiveName=='0'&&this.addForm.goodsCategory.length!=3){
                this.$message.error("商品分类不能为空！");
                return false;
            }
        },
        tabClicked(){
            /*
            if(this.activeIndex=='1'){
                
            }else if(this.activeIndex=='2'){
                
            }
            */
        },
        handleSuccess(response){
            //将上传成功的图片放到pics数组中
            const picInfo={picsBig:response,picsMid:response,picsSma:response};
            this.pics.push(picInfo);
        },
        async handleRemove(file){
            //后台删除
            await this.$http.delete(`${this.baseUrl}/file/del?path=${file.response}`);
            //从pics数组中找到这个图片对应的索引值
            const i=this.pics.findIndex(x=>x.picsBig===file.response);
            //从pics数组中移除
            this.pics.splice(i,1);
        },
        handlePreview(file){
            this.picPath=file.response;
            this.picVisible=true;
        },
        add(){
            this.$refs.addFormRef.validate(async valid=>{
                if(!valid){
                    return this.$message.error("请填写必要的表单项！");
                }

                //处理动态参数
                this.manyData.forEach(item=>{
                    const newInfo={
                        attrId:item.attrId,
                        attrValue:item.checkedAttrVals.join(',')
                    };
                    this.attrs.push(newInfo);
                })
                //处理静态属性
                this.onlyData.forEach(item=>{
                    const newInfo={
                        attrId:item.attrId,
                        attrValue:item.attrVals
                    };
                    this.attrs.push(newInfo);
                })

                //执行添加操作
                const {data:res}=await this.$http.post(`${this.baseUrl}/goods/add`,{goods:this.addForm,attrs:this.attrs,pics:this.pics});
                if(!res.success){
                    return this.$message.error(res.message);
                }
                this.$message.success("添加成功");
                this.$router.push('/goods');
            })
        }
    },
    computed:{
        cateId(){
            if(this.addForm.goodsCategory.length==3){
                return this.addForm.goodsCategory[2];
            }
            return null;
        }
    }
}
</script>

<style lang="less" scoped>
.el-checkbox{
    margin:0 10px 0 0!important;
}
.btnAdd{
    margin-top: 15px;
}
</style>