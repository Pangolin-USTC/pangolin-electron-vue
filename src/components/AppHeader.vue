<template>
  <el-menu router mode="horizontal" :default-active="$route.path">
    <el-menu-item index="/ftp">FTP</el-menu-item>
    <el-menu-item index="/article">文章</el-menu-item>
  </el-menu>
</template>


<script>
export default {
  name: "AppHeader"
}
</script>
