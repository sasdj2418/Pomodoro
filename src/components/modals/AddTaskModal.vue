<script setup>
import { ref, onMounted } from 'vue'

const emit = defineEmits(['close', 'confirm'])

// 表單資料
const taskName = ref('')
const selectedPomodoros = ref(1)

// 番茄數選項 (1-5)
const pomodoroOptions = [1, 2, 3, 4, 5]

// 聚焦輸入框
const inputRef = ref(null)
onMounted(() => {
  inputRef.value?.focus()
})

// 選擇番茄數
const selectPomodoros = (count) => {
  selectedPomodoros.value = count
}

// 取消
const handleCancel = () => {
  emit('close')
}

// 確認
const handleConfirm = () => {
  if (taskName.value.trim()) {
    emit('confirm', {
      name: taskName.value.trim(),
      pomodoros: selectedPomodoros.value
    })
  }
}

// 按下 Enter 確認
const handleKeydown = (e) => {
  if (e.key === 'Enter' && taskName.value.trim()) {
    handleConfirm()
  } else if (e.key === 'Escape') {
    handleCancel()
  }
}
</script>

<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="handleCancel">
      <div class="modal-content" @keydown="handleKeydown">
        <div class="modal-header">
          <h3>新增任務</h3>
        </div>
        
        <div class="modal-body">
          <!-- 任務名稱 -->
          <div class="form-group">
            <label for="task-name" class="form-label">任務名稱</label>
            <input
              ref="inputRef"
              id="task-name"
              v-model="taskName"
              type="text"
              class="input"
              placeholder="輸入任務名稱..."
            >
          </div>
          
          <!-- 番茄數選擇 -->
          <div class="form-group">
            <label class="form-label">番茄數</label>
            <div class="pomodoro-selector">
              <button
                v-for="count in pomodoroOptions"
                :key="count"
                :class="['pomodoro-option', { selected: count <= selectedPomodoros }]"
                @click="selectPomodoros(count)"
              >
                <span class="pomodoro-dot"></span>
              </button>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="handleCancel">
            取消
          </button>
          <button 
            class="btn btn-primary" 
            :disabled="!taskName.trim()"
            @click="handleConfirm"
          >
            確認
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.form-group {
  margin-bottom: var(--spacing-lg);
}

.form-label {
  display: block;
  font-size: 0.9rem;
  color: var(--color-text-light);
  margin-bottom: var(--spacing-sm);
}

.input {
  font-size: 1.1rem;
  padding: var(--spacing-md);
}

.pomodoro-selector {
  display: flex;
  gap: var(--spacing-md);
}

.pomodoro-option {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.pomodoro-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid var(--color-border);
  transition: all var(--transition-fast);
}

.pomodoro-option.selected .pomodoro-dot {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.pomodoro-option:hover .pomodoro-dot {
  border-color: var(--color-primary);
}

.modal-footer .btn {
  min-width: 100px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
