import {createWebHistory, createRouter, createWebHashHistory} from "vue-router"
import LoginPage from "@/views/LoginPage"
import ArticlePage from "@/views/ArticlePage"

const routes = [
    {
        path: "/",
        redirect: "/login"
    },
    {
        path: "/login",
        name: "LoginPage",
        component: LoginPage
    },
    {
        path: "/article",
        name: "ArticlePage",
        component: ArticlePage
    }
]

const router = createRouter({
    history: process.env.IS_ELECTRON ? createWebHashHistory() : createWebHistory(),
    routes
})

export  default router
