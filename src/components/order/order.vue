<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
        <el-row>
            <el-col :span="8">
                <el-input placeholder="请输入搜索内容" v-model="searchMap.orderNumber" clearable @clear="getOrderList">
                    <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
                </el-input>
            </el-col>
        </el-row>

        <!-- 列表区域 -->
        <el-table :data="list" border stripe>
            <el-table-column type="index" label="序号"></el-table-column>
            <el-table-column prop="orderNumber" label="订单编号"></el-table-column>
            <el-table-column prop="orderPrice" label="订单价格" width="70px"></el-table-column>
            <el-table-column prop="payStatus" label="是否付款" width="80px">
                <template slot-scope="scope">
                    <el-tag type="danger" v-if="scope.row.payStatus=='0'">未付款</el-tag>
                    <el-tag type="success" v-else>已付款</el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="isSend" label="是否发货" width="70px"></el-table-column>
            <el-table-column prop="createTime" label="下单时间" width="140px">
                <template slot-scope="scope">
                    {{scope.row.createTime|dateFormat}}
                </template>
            </el-table-column>
            <el-table-column label="操作" width="130px" align="center">
                <template slot-scope="scope">
                    <el-button type="primary" icon="el-icon-edit" size="mini" @click="openEdit(scope.row.goodsId)"></el-button>
                    <el-button type="success" icon="el-icon-location" size="mini" @click="showProgressBox(scope.row.goodsId)"></el-button>
                </template>
            </el-table-column>
        </el-table>

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

    <!-- 修改对话框 -->
    <el-dialog
      title="修改地址"
      :visible.sync="editFormVisible"
      @close="editDialogClosed"
      :close-on-click-modal="false"
    >
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader placeholder="请选择省市区/县" v-model="editForm.address1" :options="cityData" style="width:100%"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input placeholder="请输入详细地址" v-model="editForm.address2" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" style="text-align: center">
        <el-button type="primary" @click="saveEditForm">保存</el-button>
        <el-button @click="editFormVisible=false">关闭</el-button>
      </div>
    </el-dialog>

    <!-- 展示物流对话框 -->
    <el-dialog title="物流进度" :visible.sync="progressFormVisible" :close-on-click-modal="false">
        <el-timeline :reverse="true">
            <el-timeline-item 
                v-for="(activity,i) in progressInfo" 
                :key="i" 
                :timestamp="activity.time">
                {{activity.context}}
            </el-timeline-item>
        </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import cityData from './citydata.js'
export default {
    data(){
        return{
            list: [],
            total: 0,
            searchMap:{},
            params: {
                page: 1,
                size: 10
            },
            editFormVisible: false,
            editForm: {},
            editFormRules:{
                address1:[
                    {required: true, message: "省市区/县不能为空！", trigger: "blur" }
                ],
                address2:[
                    {required: true, message: "详细地址不能为空！", trigger: "blur" }
                ]
            },
            cityData,
            progressFormVisible:false,
            progressInfo:[]
        }
    },
    created(){
        this.getOrderList();
    },
    methods:{
        async getOrderList(){
            const {data:res}=await this.$http.post(`${this.baseUrl}/order/findPageList?page=${this.params.page}&size=${this.params.size}`,this.searchMap);
            this.list=res.rows;
            this.total=res.total;
        },
        changePageSize(size){
            this.params.size = size;
            this.getOrderList();
        },
        changeCurrentPage(page){
            this.params.page = page;
            this.getOrderList();
        },
        openEdit(id){
            this.editFormVisible=true;
        },
        editDialogClosed(){
            this.$refs.editFormRef.resetFields();
        },
        saveEditForm(){
            this.$refs.editFormRef.validate(valid=>{
                if(valid){
                    alert("校验成功");
                }
            })
        },
        async showProgressBox(id){
            const {data:res}=await this.$http.get(`${this.baseUrl}/progress/`);
            if(!res.success){
                return this.$message.error("获取物流信息失败！");
            }
            this.progressInfo=res.data;
            this.progressFormVisible=true;
        }
    }
}
</script>

<style lang="less" scoped>
    
</style>