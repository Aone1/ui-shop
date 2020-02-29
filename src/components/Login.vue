<template>
    <div class="login_container">
        <div class="login_box">
            <!-- 头像区域 -->
            <div class="avatar_box">
                <img src="../assets/logo.png" alt="">
            </div>
            <!-- 登录表单区域 -->
            <el-form :model="loginForm" :rules="loginFormRules" ref="loginFormRef" class="login_form">
                <el-form-item prop="username">
                    <el-input type="text" v-model="loginForm.username" auto-complete="off" 
                    placeholder="账号" prefix-icon="iconfont icon-user"></el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input type="text" v-model="loginForm.password" auto-complete="off" 
                    placeholder="密码" prefix-icon="iconfont icon-3702mima" show-password></el-input>
                </el-form-item>
                <el-form-item class="btns">
                    <el-button type="primary" @click="loginSubmit">登录</el-button>
                    <el-button type="info" @click="reset">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
export default {
    data(){
        return{
            loginForm:{
                username:'admin',
                password:'123'
            },
            loginFormRules:{
                username:[
                    {required: true, message: '请输入用户名', trigger: 'blur'},
                    { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
                ],
                password:[
                    {required: true, message: '请输入密码', trigger: 'blur'},
                    { min: 3, max: 15, message: '长度在 3 到 15 个字符', trigger: 'blur' }
                ]
            }
        }
    },
    methods:{
        loginSubmit:function(){
            this.$refs.loginFormRef.validate(valid=>{
                if(valid){
                    this.requestPostLogin('/manager/login/',this.loginForm).then(resp=>{
                        let data=resp.data;
                        if(data.success){
                            this.$message.success("登录成功");
                            // 1.将登录成功之后的token，保存到客户端的sessionStorage中
                            //     1.1 项目中除了登录之外的其他API接口，必须在登录之后才能访问
                            //     1.2 token只应当在当前网站打开期间生效，所以将token保存在sessionStorage中
                            window.sessionStorage.setItem("userInfo",data.data);
                            // 2.通过编程式导航跳转到后台主页，路由地址是 /home
                            this.$router.push("/home");
                        }else{
                            this.$message.error("登录失败");
                        }
                    });
                }
            })
        },
        reset:function(){
            this.$refs.loginFormRef.resetFields();
        }
    }
}
</script>

<style lang="less" scoped>
.login_container{
    background-color: #2b4b6b;
    height: 100%;
}
.login_box{
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 15px;
    position:absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%,-50%);//在横轴和纵轴启动-50%

    .avatar_box{
        height: 130px;
        width: 130px;
        border:1px solid #eee;
        border-radius: 50%;
        padding: 10px;
        box-shadow: 0 0 10px #ddd;//添加阴影
        position: absolute;
        left: 50%;
        bottom:50%;
        transform: translate(-50%,-50%);
        background-color: #fff;
        img{
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background-color: #eee;
        }
    }
}
.login_form{
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
}
.btns{
    text-align: center;
}
</style>