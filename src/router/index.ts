import { createRouter, createWebHashHistory } from 'vue-router'
import CharacterSelectView from '@/views/CharacterSelectView.vue'
import CharacterSummaryView from '@/views/CharacterSummaryView.vue'
import TaskListView from '@/views/TaskListView.vue'
import TodoView from '@/views/TodoView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: CharacterSelectView },
    { path: '/character/:id', component: CharacterSummaryView },
    { path: '/character/:id/tasks', component: TaskListView },
    { path: '/character/:id/todo', component: TodoView },
  ],
})

export default router
