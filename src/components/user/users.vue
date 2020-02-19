<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入搜索内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="formVisible=true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表区域 -->
      <el-table :data="list" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column prop="role_name" label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="190px">
          <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini"></el-button>
          <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
            <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
          </el-tooltip>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="[5, 10, 15, 20]"
        :total="total"
        :current-page="this.queryInfo.pagenum"
        :page-size="this.queryInfo.pagesize"
        @size-change="changePageSize"
        @current-change="changeCurrentPage"
      ></el-pagination>

      <!-- 添加用户对话框 -->
      <el-dialog title="添加用户" :visible.sync="formVisible" @close="addDialogClosed" :close-on-click-modal="false">
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
          <el-form-item label="用户名" prop="username">
            <el-input placeholder="用户名" v-model="addForm.username" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input placeholder="密码" v-model="addForm.password" show-password autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input placeholder="邮箱" v-model="addForm.email" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input placeholder="手机" v-model="addForm.mobile" autocomplete="off"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer" style="text-align: center">
          <el-button type="primary" @click="saveAddForm">保存</el-button>
          <el-button @click="formVisible=false">关闭</el-button>
        </div>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
      //验证邮箱的规则
      var checkEmail=(rule,value,cb)=>{
          //验证邮箱的正则表达式
          const regEmail=/^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
          if(regEmail.test(value)){
              //合法的邮箱
              return cb();
          }
          cb(new Error('请输入合法的邮箱'));
      }
      //验证手机号的规则
      var checkMobile=(rule,value,cb)=>{
          //验证手机号的正则表达式
          const regMobile=/^1[3456789]\d{9}$/;
          if(regMobile.test(value)){
              return cb();
          }
          cb(new Error('请输入合法的手机号'));
      }
    return {
      list: [],
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10
      },
      total: 0,
      formVisible:false,
      addForm:{},
      addFormRules:{
          username:[
              { required: true, message: '请输入用户名', trigger: 'blur' },
              { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
          ],
          password:[
              { required: true, message: '请输入密码', trigger: 'blur' },
              { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
          ],
          email:[
              { required: true, message: '请输入邮箱', trigger: 'blur' },
              { validator: checkEmail, trigger: 'blur' }
          ],
          mobile:[
              { required: true, message: '请输入手机号', trigger: 'blur' },
              { validator: checkMobile, trigger: 'blur' }
          ]
      }
    };
  },
  created() {
    this.getUserList();
  },
  mounted() {},
  methods: {
    getUserList() {
      this.requestQuickGet(
        `/manager/users?query=${this.queryInfo.query}&pagenum=${this.queryInfo.pagenum}&pagesize=${this.queryInfo.pagesize}`
      ).then(resp => {
        this.list = resp.data.data.users;
        this.total = resp.data.data.total;
      });
    },
    changePageSize(size) {
      this.queryInfo.pagesize = size;
      this.getUserList();
    },
    changeCurrentPage(page) {
      this.queryInfo.pagenum = page;
      this.getUserList();
    },
    userStateChanged(userinfo) {
      this.requestPut(
        `/manager/users/${userinfo.id}/state/${userinfo.mg_state}`
      ).then(resp => {
        if (resp.data.meta.status != 200) {
          userinfo.mg_state = !userinfo.mg_state;
          return this.$message.error("更新用户状态失败！");
        }
        this.$message.success("更新用户状态成功！");
      });
    },
    addDialogClosed(){
        this.$refs.addFormRef.resetFields();
    },
    saveAddForm(){
        console.log(this.addForm);
        this.requestPostForm('/manager/users',this.addForm).then(resp=>{
            if(resp.data.meta.status!=201){
                return this.$message.error("添加失败！");
            }else{
                this.$message.success("添加成功！");
                this.formVisible=false;
                this.getUserList();
            }
        })
    }
  }
};
</script>

<style lang="less" scoped>
</style>