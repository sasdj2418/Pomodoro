import { computed } from 'vue'
import { usePomodoroStore } from '@/stores/pomodoroStore'

/**
 * 統計資料 Composable
 */
export const useStats = () => {
  const store = usePomodoroStore()

  /**
   * 取得最近 N 天的日期
   */
  const getRecentDays = (days = 7) => {
    const dates = []
    const now = new Date()
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(now.getDate() - i)
      dates.push(date.toISOString().split('T')[0])
    }
    
    return dates
  }

  /**
   * 格式化日期顯示
   */
  const formatDateLabel = (dateStr) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }

  /**
   * 本週每日專注時間資料（用於圖表）
   */
  const weeklyFocusData = computed(() => {
    const days = getRecentDays(7)
    return days.map(date => ({
      date,
      label: formatDateLabel(date),
      value: Math.round((store.stats.dailyFocusTime[date] || 0) / 60 / 60 * 100) / 100 // 小時
    }))
  })

  /**
   * 本週每日番茄數資料（用於圖表）
   */
  const weeklyPomodoroData = computed(() => {
    const days = getRecentDays(7)
    return days.map(date => ({
      date,
      label: formatDateLabel(date),
      value: store.stats.dailyPomodoros[date] || 0
    }))
  })

  /**
   * 本週每日任務完成數資料
   */
  const weeklyTaskData = computed(() => {
    const days = getRecentDays(7)
    return days.map(date => ({
      date,
      label: formatDateLabel(date),
      value: store.stats.taskCompletions[date] || 0
    }))
  })

  /**
   * 今日專注時間（小時）
   */
  const todayFocusHours = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    const seconds = store.stats.dailyFocusTime[today] || 0
    return Math.round(seconds / 60 / 60 * 100) / 100
  })

  /**
   * 本週專注時間（小時）
   */
  const weekFocusHours = computed(() => {
    return Math.round(store.weekStats.focusTime / 60 / 60 * 100) / 100
  })

  /**
   * 今日番茄數
   */
  const todayPomodoros = computed(() => store.todayStats.pomodoros)

  /**
   * 本週番茄數
   */
  const weekPomodoros = computed(() => store.weekStats.pomodoros)

  /**
   * 今日任務完成數
   */
  const todayTasksCompleted = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return store.stats.taskCompletions[today] || 0
  })

  /**
   * 本週任務完成數
   */
  const weekTasksCompleted = computed(() => {
    const days = getRecentDays(7)
    return days.reduce((sum, date) => sum + (store.stats.taskCompletions[date] || 0), 0)
  })

  /**
   * 計算完成率（模擬數據，實際應根據設定的目標計算）
   */
  const todayCompletionRate = computed(() => {
    // 假設每日目標 8 個番茄
    const target = 8
    return Math.min(100, Math.round((todayPomodoros.value / target) * 100))
  })

  const weekCompletionRate = computed(() => {
    // 假設每週目標 40 個番茄
    const target = 40
    return Math.min(100, Math.round((weekPomodoros.value / target) * 100))
  })

  return {
    // Data for charts
    weeklyFocusData,
    weeklyPomodoroData,
    weeklyTaskData,
    
    // Summary stats
    todayFocusHours,
    weekFocusHours,
    todayPomodoros,
    weekPomodoros,
    todayTasksCompleted,
    weekTasksCompleted,
    todayCompletionRate,
    weekCompletionRate,
    
    // Utilities
    getRecentDays,
    formatDateLabel
  }
}
