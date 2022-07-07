<template>
  <el-container v-loading="loading" style="width: 100%; height: 100%">
    <el-header style="padding: 30px"><el-page-header @back="goBack"/></el-header>
    <el-main style="margin-top: 0; padding-top: 0">
      <el-container>
        <el-aside width="300px">
          <el-container>
            <el-main>
              <el-scrollbar height="600px">
                <el-table :data="articleList" border @row-click="getContent">
                  <el-table-column prop="name" label="文件"/>
                </el-table>
              </el-scrollbar>
            </el-main>
            <el-footer>
              <el-row justify="space-evenly">
                <el-button type="success" @click="openDialog">新建</el-button>
                <el-popconfirm
                    title="确认要删除该文章？"
                    cancel-button-type="primary"
                    cancel-button-text="否"
                    confirm-button-type="danger"
                    confirm-button-text="是"
                    @confirm="deleteArticle"
                >
                  <template #reference><el-button type="danger">删除</el-button></template>
                </el-popconfirm>
                <el-button type="primary" @click="ftpSync">同步</el-button>
              </el-row>
            </el-footer>
          </el-container>

          <el-dialog v-model="createDialog" title="请输入标题" width="30%">
            <el-input v-model="createTitle" ref="createInput" @keypress.enter="createArticle"/>
            <template #footer>
              <span>
                <el-button @click="createArticle" type="success">确认</el-button>
                <el-button @click="this.createDialog = false">取消</el-button>
              </span>
            </template>
          </el-dialog>
        </el-aside>

        <el-main style="margin-top: 0; padding-top: 0">
          <mavon-editor v-model="editorValue"
                        :style="'height:' + editorHeight"
                        @fullScreen="fullScreen"
                        @save="setContent"
          />
        </el-main>
      </el-container>
    </el-main>
  </el-container>
</template>


<script>
import {ElMessage} from 'element-plus'

export default {
  name: "ArticlePage",

  data() {
    return {
      loading: false,
      articleList: [],
      editorValue: '',
      selectedFilename: '',
      createDialog: false,
      createTitle: '',
      editorHeight: '680px'
    }
  },

  async mounted() {
    // 检查本地有无对应文件夹, 如果没有, 需要初始化hexo文件夹
    let vm = this
    vm.loading = true
    await window.electronAPI.checkLocalHexo()
    vm.loading = false
    // 获取文章列表
    await this.getArticleList()
    // 获取第一篇文章
    if (vm.articleList)
      await vm.getContent(vm.articleList[0])
  },

  methods: {
    goBack: function () {
      this.$router.go(-1)
    },
    getArticleList: async function() {
      this.articleList = []
      let list = JSON.parse(await window.electronAPI.getArticleList()).data
      for (const n of list)
        this.articleList.push({name: n})
    },
    getContent: async function(article) {
      this.selectedFilename = article.name
      this.editorValue = await window.electronAPI.getArticleContent(article.name)
    },
    setContent: async function() {
      if (!this.selectedFilename) return
      await window.electronAPI.setArticleContent(this.selectedFilename, this.editorValue)
      ElMessage.success('保存成功')
    },
    createArticle: async function() {
      let vm = this
      vm.createDialog = false
      if (!vm.createTitle) return
      await window.electronAPI.createArticle(vm.createTitle)
      setTimeout(() => {
        vm.getArticleList()
      }, 500)
      vm.createTitle = ''
      ElMessage.success('创建成功')
    },
    deleteArticle: async function() {
      let vm = this
      await window.electronAPI.deleteArticle(vm.selectedFilename)
      await vm.getArticleList()
      if (vm.articleList)
        await vm.getContent(vm.articleList[0])
      ElMessage.success('删除成功')
    },
    openDialog: function () {
      let vm = this
      vm.createDialog = true
      setTimeout(() => vm.$refs.createInput.focus())
    },
    ftpSync: async function () {
      this.loading = true
      let result = await window.electronAPI.ftpSync()
      this.loading = false
      if (result)
        ElMessage.success('同步成功')
      else
        ElMessage.error('同步失败')
    },
    fullScreen: function(fullscreen) {
      if (fullscreen)
        this.editorHeight = 'auto'
      else
        this.editorHeight = '680px'
    }
  },
}
</script>
