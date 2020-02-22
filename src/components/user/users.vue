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
          <el-button type="primary" @click="addFormVisible=true">添加用户</el-button>
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
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="openEdit(scope.row.id)"
            ></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="del(scope.row.id)"></el-button>
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="openRoleDialog(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
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
    </el-card>

    <!-- 添加用户对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addFormVisible"
      @close="addDialogClosed"
      :close-on-click-modal="false"
    >
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
        <el-button @click="addFormVisible=false">关闭</el-button>
      </div>
    </el-dialog>

    <!-- 修改用户对话框 -->
    <el-dialog
      title="修改用户"
      :visible.sync="editFormVisible"
      @close="editDialogClosed"
      :close-on-click-modal="false"
    >
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input placeholder="用户名" v-model="editForm.username" autocomplete="off" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input placeholder="邮箱" v-model="editForm.email" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input placeholder="手机" v-model="editForm.mobile" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" style="text-align: center">
        <el-button type="primary" @click="saveEditForm">保存</el-button>
        <el-button @click="editFormVisible=false">关闭</el-button>
      </div>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="roleDialogVisible"
      :close-on-click-modal="false"
      @close="setRoleDialogClosed"
    >
      <div>
        <p>当前的用户：{{userInfo.username}}</p>
        <p>当前的角色：{{userInfo.role_name}}</p>
        <p>
          分配新角色：
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </p>
      </div>
      <div slot="footer" class="dialog-footer" style="text-align: center">
        <el-button type="primary" @click="saveRoleInfo">保存</el-button>
        <el-button @click="roleDialogVisible=false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    //验证邮箱的规则
    var checkEmail = (rule, value, cb) => {
      //验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
      if (regEmail.test(value)) {
        //合法的邮箱
        return cb();
      }
      cb(new Error("请输入合法的邮箱"));
    };
    //验证手机号的规则
    var checkMobile = (rule, value, cb) => {
      //验证手机号的正则表达式
      const regMobile = /^1[3456789]\d{9}$/;
      if (regMobile.test(value)) {
        return cb();
      }
      cb(new Error("请输入合法的手机号"));
    };
    return {
      list: [],
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10
      },
      total: 0,
      addFormVisible: false,
      addForm: {},
      addFormRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 3, max: 10, message: "长度在 3 到 10 个字符", trigger: "blur" }
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { min: 6, max: 15, message: "长度在 6 到 15 个字符", trigger: "blur" }
        ],
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" }
        ],
        mobile: [
          { required: true, message: "请输入手机号", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" }
        ]
      },
      editFormVisible: false,
      editForm: {},
      editFormRules: {
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" }
        ],
        mobile: [
          { required: true, message: "请输入手机号", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" }
        ]
      },
      roleDialogVisible: false,
      userInfo: {},
      rolesList: [],
      selectedRoleId:''
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
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    saveAddForm() {
      this.$refs.addFormRef.validate(valid => {
        if (valid) {
          this.requestPostForm("/manager/users", this.addForm).then(resp => {
            if (resp.data.meta.status != 201) {
              return this.$message.error("添加失败！");
            } else {
              this.$message.success("添加成功！");
              this.addFormVisible = false;
              this.getUserList();
            }
          });
        }
      });
    },
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
    openEdit(id) {
      this.editFormVisible = true;
      this.requestQuickGet(`/manager/users/${id}`).then(resp => {
        if (resp.data.meta.status == 200) {
          this.editForm = resp.data.data;
        }
      });
    },
    saveEditForm() {
      this.$refs.editFormRef.validate(valid => {
        if (valid) {
          this.requestPut(`/manager/users/${this.editForm.id}`, {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          }).then(resp => {
            if (resp.data.meta.status != 200) {
              return this.$message.error("更新用户信息失败！");
            } else {
              this.editFormVisible = false;
              this.getUserList();
              this.$message.success("修改成功！");
            }
          });
        }
      });
    },
    del(id) {
      this.$confirm("确认删除吗？", "提示", {})
        .then(() => {
          this.requestDelete(`/manager/users/${id}`).then(resp => {
            if (resp.data.meta.status != 200) {
              return this.$message.error("删除用户信息失败！");
            } else {
              this.$message.success("删除用户信息成功！");
              this.getUserList();
            }
          });
        })
        .catch(() => {
          //不能缺少catch方法，否则报错：Uncaught (in promise) cancel
        });
    },
    setRoleDialogClosed() {
        this.userInfo={};
        this.selectedRoleId='';
    },
    openRoleDialog(userInfo) {
      this.userInfo = userInfo;
      this.requestQuickGet("/manager/roles").then(resp => {
        if (resp.data.meta.status != 200) {
          return this.$message.error("查询角色列表失败！");
        } else {
          this.rolesList = resp.data.data;
        }
      });
      this.roleDialogVisible = true;
    },
    saveRoleInfo(){
        if(!this.selectedRoleId){
            return this.$message.error("请选择要分配的角色！");
        }

        this.requestPut(`/manager/users/${this.userInfo.id}/role`,{rid:this.selectedRoleId}).then(resp=>{
            if(resp.data.meta.status!=200){
                return this.$message.error("更新角色失败！");
            }
            this.$message.success("更新角色成功！");
            this.getUserList();
            this.roleDialogVisible=false;
        })
    }
  }
};
</script>

<style lang="less" scoped>
</style>