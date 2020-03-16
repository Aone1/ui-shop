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
        <el-row :gutter="20">
            <el-col :span="8">
                <el-input placeholder="请输入搜索内容" v-model="searchMap.goodsName" clearable @clear="getList">
                    <el-button slot="append" icon="el-icon-search" @click="getList"></el-button>
                </el-input>
            </el-col>
            <el-col :span="4">
                <el-button type="primary" @click="toAdd">添加商品</el-button>
            </el-col>
        </el-row>

        <!-- 用户列表区域 -->
        <el-table :data="list" border stripe>
            <el-table-column type="index" label="序号"></el-table-column>
            <el-table-column prop="goodsName" label="商品名称"></el-table-column>
            <el-table-column prop="goodsPrice" label="商品价格(元)" width="95px"></el-table-column>
            <el-table-column prop="goodsWeight" label="商品重量" width="70px"></el-table-column>
            <el-table-column prop="addTime" label="创建时间" width="140px">
                <template slot-scope="scope">
                    {{scope.row.addTime|dateFormat}}
                </template>
            </el-table-column>
            <el-table-column label="操作" width="130px" align="center">
                <template slot-scope="scope">
                    <el-button type="primary" icon="el-icon-edit" size="mini" @click="edit(scope.row.goodsId)"></el-button>
                    <el-button type="danger" icon="el-icon-delete" size="mini" @click="del(scope.row.goodsId)"></el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 分页区域 -->
        <el-pagination
            layout="total, sizes, prev, pager, next, jumper"
            :page-sizes="[10, 50, 100, 150]"
            :total="total"
            :current-page="this.params.page"
            :page-size="this.params.size"
            @size-change="changePageSize"
            @current-change="changeCurrentPage"
            background
        ></el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
    data(){
        return{
            list: [],
            total: 0,
            searchMap:{},
            params: {
                page: 1,
                size: 10
            }
        }
    },
    created(){
        this.getList();
    },
    methods:{
        async getList(){
            const {data:res}=await this.$http.post(`${this.baseUrl}/goods/findPageList?page=${this.params.page}&size=${this.params.size}`,this.searchMap);
            this.list=res.rows;
            this.total=res.total;
        },
        changePageSize(size){
            this.params.size=size;
            this.getList();
        },
        changeCurrentPage(page){
            this.params.page=page;
            this.getList();
        },
        toAdd(){
            this.$router.push('/goods/add');
        },
        edit(id){
            alert(id);
        },
        del(id){
            alert(id);
        }
    }
}
</script>

<style lang="less" scoped>
    
</style>