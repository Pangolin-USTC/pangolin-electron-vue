<template>
  <el-form :model="form" label-width="100px" label-position="left" style="max-width: 460px" v-loading="logging">
    <el-form-item label="FTP网址"><el-input v-model="form.host"/></el-form-item>
    <el-form-item label="用户"><el-input v-model="form.user"/></el-form-item>
    <el-form-item label="密码"><el-input v-model="form.password" show-password/></el-form-item>
    <el-form-item label="public地址"><el-input v-model="form.publicPath"/></el-form-item>
    <el-form-item label="网站root"><el-input v-model="form.root"/></el-form-item>
    <el-form-item><el-button type="primary" @click="login">登录</el-button></el-form-item>
  </el-form>
</template>


<script>
import { ElMessage } from 'element-plus'

export default {
  name: "FTPPage",
  data() {
    return {
      form: {
        host: '',
        user: '',
        password: '',
        publicPath: '',
        root: '',
      },
      logging: false
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
