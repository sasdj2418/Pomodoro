<script setup>
import { ref, computed } from 'vue'
import { useStats } from '@/composables/useStats'

const stats = useStats()

// 當前顯示的報表類型
const activeTab = ref('pomodoro') // 'pomodoro' | 'task'

// 圖表資料
const chartData = computed(() => {
  if (activeTab.value === 'pomodoro') {
    return stats.weeklyFocusData.value
  }
  return stats.weeklyTaskData.value
})

// 圖表最大值
const chartMax = computed(() => {
  const values = chartData.value.map(d => d.value)
  const max = Math.max(...values, 1)
  return Math.ceil(max / 2) * 2 // 向上取到最近的偶數
})

// 計算折線圖路徑
const linePath = computed(() => {
  if (chartData.value.length === 0) return ''
  
  const width = 400
  const height = 150
  const padding = 20
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2
  
  const points = chartData.value.map((d, i) => {
    const x = padding + (i / (chartData.value.length - 1)) * chartWidth
    const y = height - padding - (d.value / chartMax.value) * chartHeight
    return `${x},${y}`
  })
  
  return `M ${points.join(' L ')}`
})

// 計算資料點位置
const dataPoints = computed(() => {
  const width = 400
  const height = 150
  const padding = 20
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2
  
  return chartData.value.map((d, i) => ({
    x: padding + (i / (chartData.value.length - 1)) * chartWidth,
    y: height - padding - (d.value / chartMax.value) * chartHeight,
    value: d.value,
    label: d.label
  }))
})
</script>

<template>
  <div class="reports-panel panel">
    <div class="panel-header">
      <button class="back-arrow" aria-label="返回">
        <svg width="12" height="20" viewBox="0 0 12 20" fill="none">
          <path d="M10 2L2 10L10 18" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
    
    <div class="panel-body">
      <!-- Tab 切換 -->
      <div class="tabs">
        <button 
          :class="['tab', { active: activeTab === 'pomodoro' }]"
          @click="activeTab = 'pomodoro'"
        >
          番茄報表
        </button>
        <button 
          :class="['tab', { active: activeTab === 'task' }]"
          @click="activeTab = 'task'"
        >
          任務報表
        </button>
      </div>
      
      <!-- 番茄報表 -->
      <template v-if="activeTab === 'pomodoro'">
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-value primary">{{ stats.weekFocusHours.value }}</span>
            <span class="stat-unit">hr</span>
            <p class="stat-label">本週專注時間</p>
          </div>
          <div class="stat-card">
            <span class="stat-value accent">{{ stats.todayFocusHours.value }}</span>
            <span class="stat-unit">hr</span>
            <p class="stat-label">今日專注時間</p>
          </div>
          <div class="stat-card">
            <span class="stat-value primary">{{ stats.weekPomodoros.value }}</span>
            <span class="stat-unit">顆</span>
            <p class="stat-label">本週番茄數</p>
          </div>
          <div class="stat-card">
            <span class="stat-value accent">{{ stats.todayPomodoros.value }}</span>
            <span class="stat-unit">顆</span>
            <p class="stat-label">今日番茄數</p>
          </div>
        </div>
        
        <div class="chart-section">
          <h3 class="chart-title">專注時間</h3>
          <div class="chart-container">
            <svg class="line-chart" viewBox="0 0 400 150">
              <!-- Y軸刻度線 -->
              <line 
                v-for="i in 5" 
                :key="`grid-${i}`"
                x1="20" 
                :y1="20 + (i - 1) * 27.5" 
                x2="380" 
                :y2="20 + (i - 1) * 27.5"
                stroke="#E8F5F2" 
                stroke-width="1"
              />
              
              <!-- 折線 -->
              <path
                :d="linePath"
                fill="none"
                stroke="var(--color-primary)"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              
              <!-- 資料點 -->
              <circle
                v-for="(point, i) in dataPoints"
                :key="`point-${i}`"
                :cx="point.x"
                :cy="point.y"
                r="4"
                fill="var(--color-primary)"
              />
            </svg>
            
            <!-- X軸標籤 -->
            <div class="chart-labels">
              <span 
                v-for="(point, i) in dataPoints" 
                :key="`label-${i}`"
                class="chart-label"
              >
                {{ point.label }}
              </span>
            </div>
          </div>
        </div>
      </template>
      
      <!-- 任務報表 -->
      <template v-else>
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-value primary">{{ stats.weekTasksCompleted.value }}</span>
            <span class="stat-unit">項</span>
            <p class="stat-label">本週任務達成數</p>
          </div>
          <div class="stat-card">
            <span class="stat-value accent">{{ stats.todayTasksCompleted.value }}</span>
            <span class="stat-unit">項</span>
            <p class="stat-label">今日任務達成數</p>
          </div>
          <div class="stat-card">
            <span class="stat-value primary">{{ stats.weekCompletionRate.value }}</span>
            <span class="stat-unit">%</span>
            <p class="stat-label">本週任務達成率</p>
          </div>
          <div class="stat-card">
            <span class="stat-value accent">{{ stats.todayCompletionRate.value }}</span>
            <span class="stat-unit">%</span>
            <p class="stat-label">今日任務達成率</p>
          </div>
        </div>
        
        <div class="chart-section">
          <h3 class="chart-title">任務達成率</h3>
          <div class="chart-container">
            <svg class="line-chart" viewBox="0 0 400 150">
              <!-- Y軸刻度線 -->
              <line 
                v-for="i in 5" 
                :key="`grid-${i}`"
                x1="20" 
                :y1="20 + (i - 1) * 27.5" 
                x2="380" 
                :y2="20 + (i - 1) * 27.5"
                stroke="#E8F5F2" 
                stroke-width="1"
              />
              
              <!-- 折線 -->
              <path
                :d="linePath"
                fill="none"
                stroke="var(--color-primary)"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              
              <!-- 資料點 -->
              <circle
                v-for="(point, i) in dataPoints"
                :key="`point-${i}`"
                :cx="point.x"
                :cy="point.y"
                r="4"
                fill="var(--color-primary)"
              />
            </svg>
            
            <!-- X軸標籤 -->
            <div class="chart-labels">
              <span 
                v-for="(point, i) in dataPoints" 
                :key="`label-${i}`"
                class="chart-label"
              >
                {{ point.label }}
              </span>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.reports-panel {
  height: 100%;
  min-height: 500px;
}

.panel-header {
  justify-content: flex-start;
  padding: var(--spacing-md);
}

.back-arrow {
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  color: var(--color-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform var(--transition-fast);
}

.back-arrow:hover {
  transform: translateX(-4px);
}

.panel-body {
  padding: 0 var(--spacing-lg) var(--spacing-lg);
}

/* Tabs */
.tabs {
  display: flex;
  background: var(--color-primary-light);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  overflow: hidden;
  margin-bottom: var(--spacing-lg);
}

.tab {
  flex: 1;
  padding: var(--spacing-md);
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-text);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.tab:hover {
  background: rgba(255, 255, 255, 0.3);
}

.tab.active {
  background: var(--color-white);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.stat-card {
  text-align: center;
  padding: var(--spacing-sm);
}

.stat-value {
  font-size: 2rem;
  font-weight: 300;
}

.stat-value.primary {
  color: var(--color-primary);
}

.stat-value.accent {
  color: var(--color-accent);
}

.stat-unit {
  font-size: 0.9rem;
  color: var(--color-text-muted);
  margin-left: 4px;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--color-text-light);
  margin-top: var(--spacing-xs);
}

/* Chart */
.chart-section {
  background: var(--color-white);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
}

.chart-title {
  text-align: center;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--spacing-md);
}

.chart-container {
  position: relative;
}

.line-chart {
  width: 100%;
  height: auto;
}

.chart-labels {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-md);
}

.chart-label {
  font-size: 0.7rem;
  color: var(--color-text-muted);
}
</style>
