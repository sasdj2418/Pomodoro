<script setup>
import { computed, inject, watch, ref } from 'vue'
import { usePomodoroStore } from '@/stores/pomodoroStore'
import { useTimer } from '@/composables/useTimer'
import { useSound } from '@/composables/useSound'

const store = usePomodoroStore()
const timer = useTimer()
const sound = useSound()

const openStopConfirmModal = inject('openStopConfirmModal')
const openSkipConfirmModal = inject('openSkipConfirmModal')

// 計時器到期標記
const timerEnded = ref(false)

// 計算進度
const progress = computed(() => {
  const total = store.timerState.isBreak 
    ? store.settings.breakDuration 
    : store.settings.workDuration
  return ((total - store.timerState.currentTime) / total) * 100
})

// 圓形進度條參數
const circleRadius = 180
const circumference = 2 * Math.PI * circleRadius
const dashOffset = computed(() => 
  circumference - (progress.value / 100) * circumference
)

// 番茄鐘進度指示器
const pomodoroIndicators = computed(() => {
  const total = store.settings.pomodorosUntilLongBreak
  const completed = store.timerState.completedPomodoros % total
  return Array.from({ length: total }, (_, i) => ({
    id: i,
    completed: i < completed,
    current: i === completed && store.timerState.isRunning && !store.timerState.isBreak
  }))
})

// 監聽計時器結束
watch(() => store.timerState.currentTime, (newTime, oldTime) => {
  if (oldTime > 0 && newTime === 0 && !timerEnded.value) {
    timerEnded.value = true
    handleTimeUp()
  }
})

// 時間結束處理
const handleTimeUp = () => {
  timer.stop()
  
  if (store.timerState.isBreak) {
    // 休息結束，切換到工作
    sound.playBreakEndSound()
    setTimeout(() => {
      store.switchToWork()
      timerEnded.value = false
    }, 1000)
  } else {
    // 工作結束，完成番茄鐘並切換到休息
    sound.playWorkEndSound()
    store.completePomodoro()
    setTimeout(() => {
      store.switchToBreak()
      timerEnded.value = false
    }, 1000)
  }
}

// 控制按鈕處理
const handleStop = () => {
  openStopConfirmModal()
}

const handleToggle = () => {
  timer.toggle()
}

const handleSkip = () => {
  if (store.timerState.currentTime < (store.timerState.isBreak ? store.settings.breakDuration : store.settings.workDuration)) {
    openSkipConfirmModal()
  } else {
    store.skipToNext()
  }
}
</script>

<template>
  <div :class="['timer-container', { 'is-break': store.timerState.isBreak }]">
    <!-- 圓形計時器 -->
    <div class="timer-circle">
      <svg class="progress-ring" viewBox="0 0 400 400">
        <!-- 背景圓 -->
        <circle
          class="progress-bg"
          cx="200"
          cy="200"
          :r="circleRadius"
          fill="none"
          stroke-width="8"
        />
        <!-- 進度圓 -->
        <circle
          class="progress-bar"
          cx="200"
          cy="200"
          :r="circleRadius"
          fill="none"
          stroke-width="8"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="dashOffset"
          stroke-linecap="round"
        />
        <!-- 頂部指示器 -->
        <rect
          class="top-indicator"
          x="195"
          y="12"
          width="10"
          height="24"
          rx="5"
        />
      </svg>
      
      <!-- 時間顯示 -->
      <div class="time-display">
        <span class="time-minutes">{{ timer.formattedTime.value.minutes }}</span>
        <span class="time-separator">:</span>
        <span class="time-seconds">{{ timer.formattedTime.value.seconds }}</span>
      </div>
    </div>
    
    <!-- 番茄鐘進度指示器 -->
    <div class="pomodoro-indicators">
      <div 
        v-for="indicator in pomodoroIndicators"
        :key="indicator.id"
        :class="['indicator', { 
          completed: indicator.completed,
          current: indicator.current 
        }]"
      />
    </div>
    
    <!-- 控制按鈕 -->
    <div class="timer-controls">
      <button 
        class="control-btn stop-btn"
        aria-label="終止"
        @click="handleStop"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      
      <button 
        class="control-btn play-btn"
        :aria-label="store.timerState.isRunning ? '暫停' : '開始'"
        @click="handleToggle"
      >
        <!-- Pause Icon -->
        <svg v-if="store.timerState.isRunning" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="4" width="4" height="16" rx="1"/>
          <rect x="14" y="4" width="4" height="16" rx="1"/>
        </svg>
        <!-- Play Icon -->
        <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z"/>
        </svg>
      </button>
      
      <button 
        class="control-btn skip-btn"
        aria-label="跳過"
        @click="handleSkip"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M5 4l10 8-10 8V4z"/>
          <path d="M13 4l10 8-10 8V4z"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.timer-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xl);
}

.timer-circle {
  position: relative;
  width: 400px;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.progress-bg {
  stroke: var(--color-border);
}

.progress-bar {
  stroke: var(--color-primary);
  transition: stroke-dashoffset 0.5s ease;
}

.is-break .progress-bar {
  stroke: var(--color-break);
}

.top-indicator {
  fill: var(--color-primary);
  transform-origin: center;
  transform: rotate(90deg) translate(0, -200px);
}

.is-break .top-indicator {
  fill: var(--color-break);
}

.time-display {
  display: flex;
  align-items: center;
  font-size: 5rem;
  font-weight: 300;
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
  letter-spacing: -2px;
}

.is-break .time-display {
  color: var(--color-break-dark);
}

.time-separator {
  margin: 0 var(--spacing-sm);
}

.pomodoro-indicators {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  position: absolute;
  right: 40px;
  top: 50%;
  transform: translateY(-50%);
}

.indicator {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--color-border);
  transition: all var(--transition-fast);
}

.indicator.completed {
  background: var(--color-primary);
}

.indicator.current {
  background: var(--color-accent-active);
  animation: pulse 1.5s ease-in-out infinite;
}

.is-break .indicator.completed {
  background: var(--color-break);
}

.timer-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  background: var(--color-primary);
  padding: var(--spacing-md) var(--spacing-2xl);
  border-radius: var(--radius-full);
}

.is-break .timer-controls {
  background: var(--color-break);
}

.control-btn {
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.play-btn {
  width: 56px;
  height: 56px;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.8; }
}
</style>
