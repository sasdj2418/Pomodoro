<script setup>
import { ref, provide, watch } from 'vue'
import { usePomodoroStore } from '@/stores/pomodoroStore'
import { useTimer } from '@/composables/useTimer'
import { useSound } from '@/composables/useSound'
import SideNav from '@/components/SideNav.vue'
import Timer from '@/components/Timer.vue'
import TaskList from '@/components/TaskList.vue'
import SoundSettings from '@/components/SoundSettings.vue'
import Reports from '@/components/Reports.vue'
import AddTaskModal from '@/components/modals/AddTaskModal.vue'
import ConfirmModal from '@/components/modals/ConfirmModal.vue'

const store = usePomodoroStore()
const timer = useTimer()
const sound = useSound()

// 當前顯示的面板
const currentPanel = ref('tasks') // 'tasks' | 'sounds' | 'reports'

// Modal 狀態
const showAddTaskModal = ref(false)
const showStopConfirmModal = ref(false)
const showSkipConfirmModal = ref(false)

// 監聽計時器結束
watch(() => store.timerState.currentTime, (newTime, oldTime) => {
  if (oldTime > 0 && newTime === 0) {
    // 時間到
    if (store.timerState.isBreak) {
      sound.playBreakEndSound()
    } else {
      sound.playWorkEndSound()
    }
  }
})

// 處理面板切換
const handlePanelChange = (panel) => {
  currentPanel.value = panel
}

// 處理新增任務
const handleAddTask = (taskData) => {
  store.addTask(taskData.name, taskData.pomodoros)
  showAddTaskModal.value = false
}

// 處理終止確認
const handleStopConfirm = () => {
  timer.stop()
  store.stopCurrentSession()
  showStopConfirmModal.value = false
}

// 處理跳過確認
const handleSkipConfirm = () => {
  timer.stop()
  store.skipToNext()
  showSkipConfirmModal.value = false
}

// 提供全域方法
provide('openAddTaskModal', () => showAddTaskModal.value = true)
provide('openStopConfirmModal', () => showStopConfirmModal.value = true)
provide('openSkipConfirmModal', () => showSkipConfirmModal.value = true)
</script>

<template>
  <div class="app-container">
    <SideNav 
      :current-panel="currentPanel" 
      @change-panel="handlePanelChange" 
    />
    
    <main class="main-content">
      <div class="left-panel">
        <!-- 展開/收合按鈕 -->
        <button class="panel-toggle" aria-label="收合面板">
          <svg width="12" height="20" viewBox="0 0 12 20" fill="none">
            <path d="M10 2L2 10L10 18" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        
        <!-- 任務列表 -->
        <TaskList 
          v-if="currentPanel === 'tasks'"
        />
        
        <!-- 音效設定 -->
        <SoundSettings 
          v-else-if="currentPanel === 'sounds'"
        />
        
        <!-- 報表 -->
        <Reports 
          v-else-if="currentPanel === 'reports'"
        />
      </div>
      
      <div class="right-panel">
        <Timer />
      </div>
    </main>
    
    <!-- Modals -->
    <AddTaskModal 
      v-if="showAddTaskModal"
      @close="showAddTaskModal = false"
      @confirm="handleAddTask"
    />
    
    <ConfirmModal 
      v-if="showStopConfirmModal"
      title="終止任務"
      message="您確定要終止目前任務？"
      sub-message="此次番茄鐘將不列入計算。"
      @close="showStopConfirmModal = false"
      @confirm="handleStopConfirm"
    />
    
    <ConfirmModal 
      v-if="showSkipConfirmModal"
      title="跳至休息時間"
      message="您確定要終止目前任務？"
      sub-message="該番茄鐘將不列入計算。"
      @close="showSkipConfirmModal = false"
      @confirm="handleSkipConfirm"
    />
  </div>
</template>

<style scoped>
.panel-toggle {
  position: absolute;
  top: 50%;
  left: -12px;
  transform: translateY(-50%);
  width: 24px;
  height: 48px;
  background: var(--color-primary);
  border: none;
  border-radius: 8px 0 0 8px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  z-index: 10;
}

.panel-toggle:hover {
  background: var(--color-primary-dark);
  width: 28px;
}
</style>
