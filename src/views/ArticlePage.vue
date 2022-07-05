<template>
  <p>Article Page</p>
  <el-button type="primary" @click="goBack">返回</el-button>
</template>


<script>
export default {
  name: "ArticlePage",
  methods: {
    goBack: function () {
      this.$router.go(-1)
    }
  }
}
</script>
