<script setup>
import { computed } from 'vue'

const props = defineProps({
  task: {
    type: Object,
    required: true
  },
  isCurrent: {
    type: Boolean,
    default: false
  },
  isRunning: {
    type: Boolean,
    default: false
  },
  sortMode: {
    type: Boolean,
    default: false
  },
  canMoveUp: {
    type: Boolean,
    default: true
  },
  canMoveDown: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['remove', 'start', 'move-up', 'move-down'])

// 番茄指示器
const pomodoroIndicators = computed(() => {
  return Array.from({ length: props.task.estimatedPomodoros }, (_, i) => ({
    id: i,
    completed: i < props.task.completedPomodoros
  }))
})
</script>

<template>
  <li :class="['task-item', { current: isCurrent, running: isRunning }]">
    <!-- 排序模式：上下移動按鈕 -->
    <template v-if="sortMode">
      <div class="sort-controls">
        <button 
          class="sort-btn"
          :disabled="!canMoveUp"
          aria-label="往上移動"
          @click="emit('move-up')"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 14l5-5 5 5H7z"/>
          </svg>
        </button>
        <button 
          class="sort-btn"
          :disabled="!canMoveDown"
          aria-label="往下移動"
          @click="emit('move-down')"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 10l5 5 5-5H7z"/>
          </svg>
        </button>
      </div>
      
      <span class="task-name">{{ task.name }}</span>
      
      <button 
        class="action-btn delete-btn"
        aria-label="刪除任務"
        @click="emit('remove')"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </template>
    
    <!-- 一般模式 -->
    <template v-else>
      <div class="task-checkbox">
        <div class="checkbox-circle" />
      </div>
      
      <span class="task-name">{{ task.name }}</span>
      
      <!-- 番茄指示器 -->
      <div class="pomodoro-dots">
        <span 
          v-for="dot in pomodoroIndicators"
          :key="dot.id"
          :class="['dot', { completed: dot.completed }]"
        />
      </div>
      
      <div class="task-actions">
        <button 
          class="action-btn delete-btn"
          aria-label="刪除任務"
          @click="emit('remove')"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        
        <button 
          :class="['action-btn', 'play-btn', { active: isRunning }]"
          :aria-label="isRunning ? '暫停' : '開始'"
          @click="emit('start')"
        >
          <!-- Pause Icon -->
          <svg v-if="isRunning" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="1"/>
            <rect x="14" y="4" width="4" height="16" rx="1"/>
          </svg>
          <!-- Play Icon -->
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </button>
      </div>
    </template>
  </li>
</template>

<style scoped>
.task-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-sm);
  background: var(--color-white);
  border: 1px solid var(--color-border);
  transition: all var(--transition-fast);
}

.task-item:hover {
  border-color: var(--color-primary-light);
  box-shadow: 0 2px 8px var(--color-shadow);
}

.task-item.current {
  border-color: var(--color-primary);
  background: var(--color-bg-light);
}

.task-item.running {
  border-color: var(--color-accent-active);
}

.task-checkbox {
  flex-shrink: 0;
}

.checkbox-circle {
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-primary);
  border-radius: 50%;
  transition: all var(--transition-fast);
}

.task-item.current .checkbox-circle {
  background: var(--color-primary-light);
}

.task-name {
  flex: 1;
  font-size: 0.95rem;
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pomodoro-dots {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-border);
  transition: background var(--transition-fast);
}

.dot.completed {
  background: var(--color-accent-active);
}

.task-actions {
  display: flex;
  gap: var(--spacing-xs);
  flex-shrink: 0;
}

.action-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.action-btn:hover {
  background: var(--color-bg);
  color: var(--color-text);
}

.delete-btn:hover {
  color: #e74c3c;
}

.play-btn {
  color: var(--color-primary);
}

.play-btn:hover {
  background: var(--color-primary-light);
  color: var(--color-primary-dark);
}

.play-btn.active {
  background: var(--color-accent-active);
  color: white;
}

/* Sort mode styles */
.sort-controls {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sort-btn {
  width: 20px;
  height: 16px;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color var(--transition-fast);
}

.sort-btn:hover:not(:disabled) {
  color: var(--color-primary);
}

.sort-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
</style>
