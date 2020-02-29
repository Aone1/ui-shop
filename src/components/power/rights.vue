<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 用户列表区域 -->
      <el-table :data="list" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="authName" label="权限名称"></el-table-column>
        <el-table-column prop="path" label="路径"></el-table-column>
        <el-table-column prop="level" label="权限等级">
            <template slot-scope="scope">
                <el-tag v-if="scope.row.level===0">一级</el-tag>
                <el-tag v-else-if="scope.row.level===1" type="success">二级</el-tag>
                <el-tag v-else type="warning">三级</el-tag>
            </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
    data(){
        return{
            list:[]
        }
    },
    created(){
        this.getRightsList();
    },
    mounted(){},
    methods:{
        getRightsList(){
            this.requestQuickGet('/manager/menu/rights/list').then(resp=>{
                if(!resp.data.success){
                    return this.$message.error("查询权限列表失败！");
                }
                this.list=resp.data.data;
            })
        }
    }
}
</script>

<style lang="less" scoped>
    
</style>