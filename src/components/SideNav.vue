<script setup>
defineProps({
  currentPanel: {
    type: String,
    default: 'tasks'
  }
})

const emit = defineEmits(['change-panel'])

const navItems = [
  { id: 'tasks', icon: 'tasks', label: '任務列表' },
  { id: 'sounds', icon: 'music', label: '音效設定' },
  { id: 'reports', icon: 'chart', label: '統計報表' }
]

const handleClick = (panelId) => {
  emit('change-panel', panelId)
}
</script>

<template>
  <nav class="side-nav">
    <ul class="nav-list">
      <li 
        v-for="item in navItems" 
        :key="item.id"
        class="nav-item"
      >
        <button
          :class="['nav-button', { active: currentPanel === item.id }]"
          :aria-label="item.label"
          :aria-current="currentPanel === item.id ? 'page' : undefined"
          @click="handleClick(item.id)"
        >
          <!-- Tasks Icon -->
          <svg v-if="item.icon === 'tasks'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
          
          <!-- Music Icon -->
          <svg v-else-if="item.icon === 'music'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18V5l12-2v13"/>
            <circle cx="6" cy="18" r="3"/>
            <circle cx="18" cy="16" r="3"/>
          </svg>
          
          <!-- Chart Icon -->
          <svg v-else-if="item.icon === 'chart'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="20" x2="18" y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
        </button>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.side-nav {
  width: 80px;
  min-height: 100vh;
  background: var(--color-bg-sidebar);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-lg) 0;
  position: sticky;
  top: 0;
}

.nav-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  margin-top: var(--spacing-2xl);
}

.nav-button {
  width: 56px;
  height: 56px;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.nav-button:hover {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.1);
}

.nav-button.active {
  color: white;
  background: rgba(255, 255, 255, 0.15);
}

.nav-button.active::before {
  content: '';
  position: absolute;
  left: 0;
  width: 4px;
  height: 32px;
  background: white;
  border-radius: 0 4px 4px 0;
}

.nav-item {
  position: relative;
}
</style>
