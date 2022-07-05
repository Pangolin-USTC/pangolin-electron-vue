import {createWebHistory, createRouter} from "vue-router"
import FTPPage from "@/views/LoginPage"
import ArticlePage from "@/views/ArticlePage"

const routes = [
    {
        path: "/",
        redirect: "/login"
    },
    {
        path: "/login",
        name: "LoginPage",
        component: FTPPage
    },
    {
        path: "/article",
        name: "ArticlePage",
        component: ArticlePage
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export  default router
