<script setup>
import { ref, computed } from 'vue'
import { usePomodoroStore } from '@/stores/pomodoroStore'
import { useSound } from '@/composables/useSound'

const store = usePomodoroStore()
const sound = useSound()

// 音效選項列表
const soundOptions = [
  'NONE', 'BEEP', 'DEFAULT',
  'ALERT', 'WARNING', 'DIGITAL',
  'BIRD', 'ALARM', 'MUSIC',
  'DROP', 'BELL', 'HORN'
]

// 本地狀態
const soundEnabled = computed({
  get: () => store.settings.soundEnabled,
  set: (value) => store.updateSettings({ soundEnabled: value })
})

const workEndSound = computed({
  get: () => store.settings.workEndSound,
  set: (value) => store.updateSettings({ workEndSound: value })
})

const breakEndSound = computed({
  get: () => store.settings.breakEndSound,
  set: (value) => store.updateSettings({ breakEndSound: value })
})

// 選擇工作結束音效
const selectWorkSound = (soundType) => {
  workEndSound.value = soundType
  if (soundType !== 'NONE') {
    sound.testSound(soundType)
  }
}

// 選擇休息結束音效
const selectBreakSound = (soundType) => {
  breakEndSound.value = soundType
  if (soundType !== 'NONE') {
    sound.testSound(soundType)
  }
}
</script>

<template>
  <div class="sound-settings panel">
    <div class="panel-header">
      <button class="back-arrow" aria-label="返回">
        <svg width="12" height="20" viewBox="0 0 12 20" fill="none">
          <path d="M10 2L2 10L10 18" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
    
    <div class="panel-body">
      <!-- 鬧鐘提醒開關 -->
      <div class="setting-row toggle-row">
        <span class="setting-label">鬧鐘提醒</span>
        <label class="toggle-switch">
          <input 
            type="checkbox" 
            v-model="soundEnabled"
          >
          <span class="toggle-slider"></span>
        </label>
      </div>
      
      <!-- 工作結束鬧鐘 -->
      <div class="setting-section">
        <h3 class="section-title">工作結束鬧鐘</h3>
        <div class="sound-grid">
          <label 
            v-for="option in soundOptions"
            :key="`work-${option}`"
            :class="['sound-option', { selected: workEndSound === option }]"
          >
            <input
              type="radio"
              :value="option"
              :checked="workEndSound === option"
              name="work-sound"
              @change="selectWorkSound(option)"
            >
            <span class="option-indicator"></span>
            <span class="option-label">{{ option }}</span>
          </label>
        </div>
      </div>
      
      <!-- 休息結束鬧鐘 -->
      <div class="setting-section">
        <h3 class="section-title">休息結束鬧鐘</h3>
        <div class="sound-grid">
          <label 
            v-for="option in soundOptions"
            :key="`break-${option}`"
            :class="['sound-option', { selected: breakEndSound === option }]"
          >
            <input
              type="radio"
              :value="option"
              :checked="breakEndSound === option"
              name="break-sound"
              @change="selectBreakSound(option)"
            >
            <span class="option-indicator"></span>
            <span class="option-label">{{ option }}</span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sound-settings {
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
  padding: var(--spacing-lg);
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-xl);
}

.setting-label {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text);
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  width: 56px;
  height: 30px;
  cursor: pointer;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  inset: 0;
  background: var(--color-border);
  border-radius: var(--radius-full);
  transition: background var(--transition-fast);
}

.toggle-slider::before {
  content: '';
  position: absolute;
  width: 24px;
  height: 24px;
  left: 3px;
  bottom: 3px;
  background: white;
  border-radius: 50%;
  transition: transform var(--transition-fast);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toggle-switch input:checked + .toggle-slider {
  background: var(--color-accent);
}

.toggle-switch input:checked + .toggle-slider::before {
  transform: translateX(26px);
}

/* Sound Section */
.setting-section {
  margin-bottom: var(--spacing-xl);
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--spacing-md);
}

.sound-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-sm);
}

.sound-option {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
}

.sound-option:hover {
  background: var(--color-bg);
}

.sound-option input {
  display: none;
}

.option-indicator {
  width: 18px;
  height: 18px;
  border: 2px solid var(--color-border);
  border-radius: 50%;
  flex-shrink: 0;
  transition: all var(--transition-fast);
  position: relative;
}

.option-indicator::after {
  content: '';
  position: absolute;
  inset: 3px;
  background: var(--color-primary);
  border-radius: 50%;
  transform: scale(0);
  transition: transform var(--transition-fast);
}

.sound-option.selected .option-indicator {
  border-color: var(--color-primary);
}

.sound-option.selected .option-indicator::after {
  transform: scale(1);
}

.option-label {
  font-size: 0.85rem;
  color: var(--color-text);
}

.sound-option.selected .option-label {
  font-weight: 500;
}
</style>
