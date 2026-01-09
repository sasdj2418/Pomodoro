<script setup>
import { ref, inject, computed } from 'vue'
import { usePomodoroStore } from '@/stores/pomodoroStore'
import TaskItem from './TaskItem.vue'

const store = usePomodoroStore()
const openAddTaskModal = inject('openAddTaskModal')

// 是否處於排序模式
const isSortMode = ref(false)

// 待辦任務
const pendingTasks = computed(() => 
  store.tasks.filter(task => !task.completed)
)

// 已完成任務
const completedTasks = computed(() => store.completedTasks)

// 切換排序模式
const toggleSortMode = () => {
  isSortMode.value = !isSortMode.value
}

// 移動任務
const moveTaskUp = (index) => {
  if (index > 0) {
    store.moveTask(index, index - 1)
  }
}

const moveTaskDown = (index) => {
  if (index < pendingTasks.value.length - 1) {
    store.moveTask(index, index + 1)
  }
}

// 刪除任務
const handleRemoveTask = (taskId) => {
  store.removeTask(taskId)
}

// 開始任務（設為當前任務並開始計時）
const handleStartTask = (taskId) => {
  store.setCurrentTask(taskId)
}
</script>

<template>
  <div class="task-list-container panel">
    <!-- 代辦任務區 -->
    <div class="panel-header">
      <h2>代辦任務</h2>
      <div class="header-actions">
        <button 
          :class="['btn-icon', { active: isSortMode }]"
          aria-label="排序任務"
          @click="toggleSortMode"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M7 15l5 5 5-5"/>
            <path d="M7 9l5-5 5 5"/>
          </svg>
        </button>
        <button 
          class="btn-icon"
          aria-label="新增任務"
          @click="openAddTaskModal"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>
    </div>
    
    <div class="panel-body task-list">
      <TransitionGroup name="task" tag="ul" class="pending-tasks">
        <TaskItem
          v-for="(task, index) in pendingTasks"
          :key="task.id"
          :task="task"
          :is-current="task.id === store.currentTaskId"
          :is-running="task.id === store.currentTaskId && store.timerState.isRunning"
          :sort-mode="isSortMode"
          :can-move-up="index > 0"
          :can-move-down="index < pendingTasks.length - 1"
          @remove="handleRemoveTask(task.id)"
          @start="handleStartTask(task.id)"
          @move-up="moveTaskUp(index)"
          @move-down="moveTaskDown(index)"
        />
      </TransitionGroup>
      
      <p v-if="pendingTasks.length === 0" class="empty-message">
        目前沒有待辦任務，點擊 + 新增任務
      </p>
    </div>
    
    <!-- 已完成任務區 -->
    <div class="completed-section">
      <div class="section-header">
        <h3>已完成任務</h3>
      </div>
      
      <ul class="completed-tasks">
        <li 
          v-for="task in completedTasks.slice(-5).reverse()" 
          :key="task.id"
          class="completed-task-item"
        >
          <svg class="check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
          <span class="task-name">{{ task.name }}</span>
        </li>
      </ul>
      
      <p v-if="completedTasks.length === 0" class="empty-message completed-empty">
        尚未完成任何任務
      </p>
    </div>
  </div>
</template>

<style scoped>
.task-list-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 500px;
}

.header-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.header-actions .btn-icon {
  color: var(--color-text);
}

.header-actions .btn-icon.active {
  background: var(--color-primary);
  color: white;
}

.task-list {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-sm) var(--spacing-md);
}

.pending-tasks {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.empty-message {
  text-align: center;
  color: var(--color-text-muted);
  padding: var(--spacing-xl) var(--spacing-md);
  font-size: 0.95rem;
}

.completed-section {
  border-top: 1px solid var(--color-border);
  background: var(--color-bg-light);
}

.section-header {
  padding: var(--spacing-md);
  background: linear-gradient(to right, var(--color-border), transparent);
}

.section-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
}

.completed-tasks {
  list-style: none;
  padding: 0 var(--spacing-md) var(--spacing-md);
}

.completed-task-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text-muted);
}

.completed-task-item:last-child {
  border-bottom: none;
}

.check-icon {
  color: var(--color-primary);
  flex-shrink: 0;
}

.task-name {
  font-size: 0.9rem;
  text-decoration: line-through;
}

.completed-empty {
  padding: var(--spacing-md);
}

/* Transition animations */
.task-enter-active,
.task-leave-active {
  transition: all 0.3s ease;
}

.task-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.task-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.task-move {
  transition: transform 0.3s ease;
}
</style>
