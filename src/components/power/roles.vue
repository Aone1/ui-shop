<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>

      <!-- 角色列表区域 -->
      <el-table :data="list" border stripe>
        <el-table-column type="expand">
            <template slot-scope="scope">
                <el-row :class="['vcenter','bdbottom',i1===0?'bdtop':'']" v-for="(item1,i1) in scope.row.children" :key="item1.id">
                    <!-- 渲染一级权限 -->
                    <el-col :span="5">
                        <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                        <i class="el-icon-caret-right"></i>
                    </el-col>
                    <!-- 渲染二级和三级权限 -->
                    <el-col :span="19">
                        <el-row :class="['vcenter',i2===0?'':'bdtop']" v-for="(item2,i2) in item1.children" :key="item2.id">
                            <el-col :span="6">
                                <el-tag closable @close="removeRightById(scope.row,item2.id)" type="success">{{item2.authName}}</el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <el-col :span="18">
                                <el-tag closable @close="removeRightById(scope.row,item3.id)" type="warning" v-for="item3 in item2.children" :key="item3.id">{{item3.authName}}</el-tag>
                            </el-col>
                        </el-row>
                    </el-col>
                </el-row>
            </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作" width="300px">
            <template slot-scope="scope">
                <el-button size="mini" type="primary" icon="el-icon-edit" @click="edit(scope.row.id)">编辑</el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="del(scope.row.id)">删除</el-button>
                <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
            </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分配权限的对话框 -->
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" :close-on-click-modal="false"
        @close="setRightDialogClosed">
        <el-tree :data="rightsList" :props="treeProps" default-expand-all
            show-checkbox node-key="id" :default-checked-keys="defKeys"
            ref="treeRef"></el-tree>
        <div slot="footer" class="dialog-footer" style="text-align: center">
          <el-button type="primary" @click="saveRight">保存</el-button>
          <el-button @click="setRightDialogVisible=false">关闭</el-button>
        </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      list: [],
      setRightDialogVisible:false,
      rightsList:[],
      treeProps:{
          label:'authName',
          children:'children'
      },
      defKeys:[],
      roleId:''
    };
  },
  created() {
    this.getRolesList();
  },
  mounted() {},
  methods: {
    getRolesList() {
        this.requestQuickGet('/manager/role/roles').then(resp=>{
            if(!resp.data.success){
                return this.$message.error("查询角色列表失败！");
            }
            this.list=resp.data.data;
        })
    },
    removeRightById(role,rightId){
        this.$confirm('确认删除吗？','提示',{}).then(()=>{
            this.requestDelete(`/manager/role/delRight/${role.id}/${rightId}`).then(resp=>{
                if(!resp.data.success){
                    return this.$message.error("删除权限失败！");
                }
                role.children=resp.data.data;
            })
        }).catch(()=>{
            //不能缺少catch方法，否则报错：Uncaught (in promise) cancel
        })
    },
    showSetRightDialog(role){
        this.roleId=role.id;
        this.requestQuickGet('/manager/menu/rights/tree').then(resp=>{
            if(!resp.data.success){
                return this.$message.error("查询权限列表失败！");
            }
            this.rightsList=resp.data.data;
        })

        //递归获取三级节点的ID
        this.getLeafKeys(role,this.defKeys);

        this.setRightDialogVisible=true;
    },
    getLeafKeys(node,arr){
        //如果当前node节点不包含children属性，则是三节点，将id存入arr
        if(!node.children){
            return arr.push(node.id);
        }

        node.children.forEach(item=>this.getLeafKeys(item,arr));
    },
    setRightDialogClosed(){
        this.defKeys=[];
    },
    saveRight(){
        const keys=[
            ...this.$refs.treeRef.getCheckedKeys(),
            ...this.$refs.treeRef.getHalfCheckedKeys()
            ];
        const idStr=keys.join(',');
        this.requestPostForm('/manager/role/addRight',{roleId:this.roleId,psIds:idStr}).then(resp=>{
            if(!resp.data.success){
                return this.$message.error("分配权限失败！");
            }
            this.$message.success("分配权限失败！");
            this.getRolesList();
            this.setRightDialogVisible=false;
        })
    },
    edit(id){
        alert(id);
    },
    del(id){
        alert(id);
    }
  }
};
</script>

<style lang="less" scoped>
.el-tag{
    margin: 7px
}
.bdtop{
    border-top: 1px solid #eee;
}
.bdbottom{
    border-bottom:1px solid #eee;
}
.vcenter{
    display: flex;
    align-items: center;
}
</style>