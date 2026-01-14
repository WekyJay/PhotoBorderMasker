import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Generator from '../views/Generator.vue'
import Editor from '../views/Editor.vue'
import TemplateNew from '../views/TemplateNew.vue'


export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/generator', name: 'generator', component: Generator },
    { path: '/editor', name: 'editor', component: Editor },
    { path: '/shadow-test', name: 'shadow-test', component: () => import('../views/ShadowTest.vue') },
    { path: '/templates/new', name: 'template-new', component: TemplateNew },
    { path: '/templates', name: 'templates', component: () => import('../views/TemplateManager.vue') },
    { path: '/test-upload', name: 'test-upload', component: () => import('../views/TestUpload.vue') },
    { path: '/simple-test', name: 'simple-test', component: () => import('../views/SimpleTest.vue') },
  ]
})
