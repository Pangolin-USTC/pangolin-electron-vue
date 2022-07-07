<template>
  <el-form display="flex" :model="form" label-width="100px" label-position="left" v-loading="logging"
           style="width: 460px; margin-right: 90px">
    <el-form-item label="FTP地址"><el-input v-model="form.host"/></el-form-item>
    <el-form-item label="用户名"><el-input v-model="form.user"/></el-form-item>
    <el-form-item label="密码"><el-input v-model="form.password" show-password/></el-form-item>
    <el-form-item label="public路径"><el-input v-model="form.publicPath"/></el-form-item>
    <el-form-item label="网站root"><el-input v-model="form.root"/></el-form-item>
    <el-form-item>
      <el-row style="width: 100%" justify="space-evenly">
        <el-col :span="4"/>
        <el-col :span="10"><el-button @click="this.helpDialog = true">说明</el-button></el-col>
        <el-col :span="10"><el-button type="primary" @click="login">登录</el-button></el-col>
      </el-row>
    </el-form-item>
    <el-dialog v-model="helpDialog" title="说明" width="39%">
      <span>
        FTP地址、用户名、密码为登录FTP所需要，public路径为FTP中存放网站资源的路径<br/><br/>
        若博客网站在子路径下，需要填写网站root<br/><br/>
        例如，中科大学生的FTP地址为home.ustc.edu.cn，用户名为邮箱用户名，密码为邮箱密码<br/><br/>
        public路径为public_html，个人主页地址http://home.ustc.edu.cn/~emailusername<br/><br/>
        因此网站root为/~emailusername，第一个斜杠可省略，会自动补充<br/><br/>
      </span>
    </el-dialog>
  </el-form>
</template>


<script>
import { ElMessage } from 'element-plus'

export default {
  name: "LoginPage",
  data() {
    return {
      form: {
        host: '',
        user: '',
        password: '',
        publicPath: '',
        root: '',
      },
      logging: false,
      helpDialog: false,
    }
  },
  async mounted() {
    let previousAccount = await window.electronAPI.getPreviousAccount()
    if (previousAccount)
      this.form = JSON.parse(previousAccount)
  },
  methods: {
    login: async function () {
      this.logging = true
      const result = await window.electronAPI.ftpLogin(JSON.stringify(this.form))
      this.logging = false
      if(result) {
        ElMessage.success('登录成功')
        await this.$router.push('/article')
      }
      else
        ElMessage.error('登录失败')
    }
  }
}
</script>
