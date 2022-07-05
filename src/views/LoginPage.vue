<template>
  <el-form :model="form" label-width="80px" label-position="left" style="max-width: 460px">
    <el-form-item label="服务器IP"><el-input v-model="form.ip"/></el-form-item>
    <el-form-item label="用户名"><el-input v-model="form.username"/></el-form-item>
    <el-form-item label="密码"><el-input v-model="form.password" type="password"/></el-form-item>
    <el-form-item><el-button type="primary" @click="login">登录</el-button></el-form-item>
  </el-form>
</template>


<script>
export default {
  name: "FTPPage",
  data() {
    return {
      form: {
        ip: '',
        username: '',
        password: '',
      }
    }
  },
  async mounted() {
    let previousAccount = await window.electronAPI.getPreviousAccount()
    if (previousAccount)
      this.form = JSON.parse(previousAccount)
  },
  methods: {
    login: function () {
      this.$router.push('/article')
      // window.electronAPI.setPreviousAccount(JSON.stringify(this.form))
    }
  }
}
</script>
