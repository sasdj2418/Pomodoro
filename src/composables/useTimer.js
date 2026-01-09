import { ref, computed, onUnmounted } from 'vue'
import { usePomodoroStore } from '@/stores/pomodoroStore'

/**
 * 計時器 Composable
 * 處理計時邏輯與格式化
 */
export const useTimer = () => {
  const store = usePomodoroStore()
  let intervalId = null

  /**
   * 格式化時間為 MM:SS
   */
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return {
      minutes: String(mins).padStart(2, '0'),
      seconds: String(secs).padStart(2, '0'),
      display: `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    }
  }

  /**
   * 計算進度百分比
   */
  const progress = computed(() => {
    const total = store.timerState.isBreak 
      ? store.settings.breakDuration 
      : store.settings.workDuration
    return ((total - store.timerState.currentTime) / total) * 100
  })

  /**
   * 格式化後的當前時間
   */
  const formattedTime = computed(() => 
    formatTime(store.timerState.currentTime)
  )

  /**
   * 開始計時
   */
  const start = () => {
    if (intervalId) return
    
    store.startTimer()
    
    intervalId = setInterval(() => {
      if (store.timerState.currentTime > 0) {
        store.tickTimer()
      } else {
        // 時間到
        stop()
        handleTimeUp()
      }
    }, 1000)
  }

  /**
   * 暫停計時
   */
  const pause = () => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
    store.pauseTimer()
  }

  /**
   * 停止計時
   */
  const stop = () => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  /**
   * 切換播放/暫停
   */
  const toggle = () => {
    if (store.timerState.isRunning) {
      pause()
    } else {
      start()
    }
  }

  /**
   * 時間結束處理
   */
  const handleTimeUp = () => {
    if (!store.timerState.isBreak) {
      // 工作時間結束
      store.completePomodoro()
    }
  }

  /**
   * 清理
   */
  onUnmounted(() => {
    stop()
  })

  return {
    // State
    isRunning: computed(() => store.timerState.isRunning),
    isBreak: computed(() => store.timerState.isBreak),
    currentTime: computed(() => store.timerState.currentTime),
    completedPomodoros: computed(() => store.timerState.completedPomodoros),
    
    // Computed
    progress,
    formattedTime,
    
    // Actions
    start,
    pause,
    stop,
    toggle,
    formatTime
  }
}
