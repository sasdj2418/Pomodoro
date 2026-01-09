import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'pomodoro_data'

/**
 * 載入 localStorage 資料
 */
const loadFromStorage = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

/**
 * 儲存至 localStorage
 */
const saveToStorage = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Failed to save to localStorage:', error)
  }
}

export const usePomodoroStore = defineStore('pomodoro', () => {
  // ===== 設定 =====
  const settings = ref({
    workDuration: 25 * 60, // 25 分鐘（秒）
    breakDuration: 5 * 60, // 5 分鐘（秒）
    longBreakDuration: 15 * 60, // 15 分鐘（秒）
    pomodorosUntilLongBreak: 4,
    soundEnabled: true,
    workEndSound: 'ALARM',
    breakEndSound: 'DEFAULT'
  })

  // ===== 計時器狀態 =====
  const timerState = ref({
    isRunning: false,
    isBreak: false,
    currentTime: 25 * 60,
    completedPomodoros: 0,
    lastSavedAt: null  // 最後保存時間戳（用於恢復計時）
  })

  // ===== 任務 =====
  const tasks = ref([])
  const completedTasks = ref([])
  const currentTaskId = ref(null)

  // ===== 統計 =====
  const stats = ref({
    dailyPomodoros: {},
    dailyFocusTime: {},
    taskCompletions: {}
  })

  // ===== Computed =====
  const currentTask = computed(() => 
    tasks.value.find(task => task.id === currentTaskId.value)
  )

  const pendingTasks = computed(() => 
    tasks.value.filter(task => !task.completed)
  )

  const todayStats = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return {
      pomodoros: stats.value.dailyPomodoros[today] || 0,
      focusTime: stats.value.dailyFocusTime[today] || 0
    }
  })

  const weekStats = computed(() => {
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay())
    
    let totalPomodoros = 0
    let totalFocusTime = 0
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + i)
      const dateKey = date.toISOString().split('T')[0]
      
      totalPomodoros += stats.value.dailyPomodoros[dateKey] || 0
      totalFocusTime += stats.value.dailyFocusTime[dateKey] || 0
    }
    
    return { pomodoros: totalPomodoros, focusTime: totalFocusTime }
  })

  // ===== Actions =====
  
  /**
   * 新增任務
   */
  const addTask = (name, estimatedPomodoros = 1) => {
    const newTask = {
      id: Date.now().toString(),
      name,
      estimatedPomodoros,
      completedPomodoros: 0,
      completed: false,
      createdAt: new Date().toISOString()
    }
    tasks.value.push(newTask)
    saveData()
    return newTask
  }

  /**
   * 刪除任務
   */
  const removeTask = (taskId) => {
    const index = tasks.value.findIndex(t => t.id === taskId)
    if (index !== -1) {
      tasks.value.splice(index, 1)
      if (currentTaskId.value === taskId) {
        currentTaskId.value = null
      }
      saveData()
    }
  }

  /**
   * 完成任務
   */
  const completeTask = (taskId) => {
    const task = tasks.value.find(t => t.id === taskId)
    if (task) {
      task.completed = true
      task.completedAt = new Date().toISOString()
      completedTasks.value.push(task)
      tasks.value = tasks.value.filter(t => t.id !== taskId)
      
      // 更新統計
      const today = new Date().toISOString().split('T')[0]
      stats.value.taskCompletions[today] = (stats.value.taskCompletions[today] || 0) + 1
      
      if (currentTaskId.value === taskId) {
        currentTaskId.value = null
      }
      saveData()
    }
  }

  /**
   * 設定當前任務
   */
  const setCurrentTask = (taskId) => {
    currentTaskId.value = taskId
    saveData()
  }

  /**
   * 移動任務順序
   */
  const moveTask = (fromIndex, toIndex) => {
    const task = tasks.value.splice(fromIndex, 1)[0]
    tasks.value.splice(toIndex, 0, task)
    saveData()
  }

  /**
   * 開始計時
   */
  const startTimer = () => {
    timerState.value.isRunning = true
    saveData()
  }

  /**
   * 暫停計時
   */
  const pauseTimer = () => {
    timerState.value.isRunning = false
    saveData()
  }

  /**
   * 重置計時器
   */
  const resetTimer = () => {
    timerState.value.isRunning = false
    timerState.value.currentTime = timerState.value.isBreak 
      ? settings.value.breakDuration 
      : settings.value.workDuration
    saveData()
  }

  /**
   * 更新計時（每秒調用）
   * 每 10 秒自動保存一次狀態
   */
  const tickTimer = () => {
    if (timerState.value.isRunning && timerState.value.currentTime > 0) {
      timerState.value.currentTime--
      
      // 每 10 秒保存一次狀態（避免頻繁寫入）
      if (timerState.value.currentTime % 10 === 0) {
        saveData()
      }
    }
  }

  /**
   * 完成一個番茄鐘
   */
  const completePomodoro = () => {
    if (!timerState.value.isBreak) {
      timerState.value.completedPomodoros++
      
      // 更新統計
      const today = new Date().toISOString().split('T')[0]
      stats.value.dailyPomodoros[today] = (stats.value.dailyPomodoros[today] || 0) + 1
      stats.value.dailyFocusTime[today] = (stats.value.dailyFocusTime[today] || 0) + settings.value.workDuration
      
      // 更新當前任務的番茄數
      if (currentTask.value) {
        currentTask.value.completedPomodoros++
        
        // 檢查是否達到預估番茄數
        if (currentTask.value.completedPomodoros >= currentTask.value.estimatedPomodoros) {
          completeTask(currentTask.value.id)
        }
      }
    }
    saveData()
  }

  /**
   * 切換到休息時間
   */
  const switchToBreak = () => {
    timerState.value.isBreak = true
    const isLongBreak = timerState.value.completedPomodoros % settings.value.pomodorosUntilLongBreak === 0
    timerState.value.currentTime = isLongBreak 
      ? settings.value.longBreakDuration 
      : settings.value.breakDuration
    timerState.value.isRunning = false
    saveData()
  }

  /**
   * 切換到工作時間
   */
  const switchToWork = () => {
    timerState.value.isBreak = false
    timerState.value.currentTime = settings.value.workDuration
    timerState.value.isRunning = false
    saveData()
  }

  /**
   * 終止當前任務
   */
  const stopCurrentSession = () => {
    timerState.value.isRunning = false
    timerState.value.currentTime = timerState.value.isBreak 
      ? settings.value.breakDuration 
      : settings.value.workDuration
    saveData()
  }

  /**
   * 跳過到下一階段
   */
  const skipToNext = () => {
    if (timerState.value.isBreak) {
      switchToWork()
    } else {
      switchToBreak()
    }
  }

  /**
   * 更新設定
   */
  const updateSettings = (newSettings) => {
    settings.value = { ...settings.value, ...newSettings }
    saveData()
  }

  /**
   * 儲存資料
   */
  const saveData = () => {
    // 記錄保存時間戳
    timerState.value.lastSavedAt = Date.now()
    
    saveToStorage({
      settings: settings.value,
      timerState: timerState.value,
      tasks: tasks.value,
      completedTasks: completedTasks.value,
      currentTaskId: currentTaskId.value,
      stats: stats.value
    })
  }

  /**
   * 載入資料
   */
  const loadData = () => {
    const data = loadFromStorage()
    if (data) {
      if (data.settings) settings.value = data.settings
      if (data.timerState) {
        const savedState = data.timerState
        
        // 如果之前正在運行，計算經過的時間並扣除
        if (savedState.isRunning && savedState.lastSavedAt) {
          const elapsedSeconds = Math.floor((Date.now() - savedState.lastSavedAt) / 1000)
          const remainingTime = Math.max(0, savedState.currentTime - elapsedSeconds)
          
          timerState.value = {
            ...savedState,
            currentTime: remainingTime,
            isRunning: false  // 需要用戶手動重新開始
          }
        } else {
          timerState.value = { ...savedState, isRunning: false }
        }
      }
      if (data.tasks) tasks.value = data.tasks
      if (data.completedTasks) completedTasks.value = data.completedTasks
      if (data.currentTaskId) currentTaskId.value = data.currentTaskId
      if (data.stats) stats.value = data.stats
    }
  }

  // 初始化時載入資料
  loadData()

  return {
    // State
    settings,
    timerState,
    tasks,
    completedTasks,
    currentTaskId,
    stats,
    
    // Computed
    currentTask,
    pendingTasks,
    todayStats,
    weekStats,
    
    // Actions
    addTask,
    removeTask,
    completeTask,
    setCurrentTask,
    moveTask,
    startTimer,
    pauseTimer,
    resetTimer,
    tickTimer,
    completePomodoro,
    switchToBreak,
    switchToWork,
    stopCurrentSession,
    skipToNext,
    updateSettings,
    saveData,
    loadData
  }
})
