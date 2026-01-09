<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  subMessage: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close', 'confirm'])

const handleCancel = () => {
  emit('close')
}

const handleConfirm = () => {
  emit('confirm')
}

// 鍵盤事件處理
const handleKeydown = (e) => {
  if (e.key === 'Enter') {
    handleConfirm()
  } else if (e.key === 'Escape') {
    handleCancel()
  }
}
</script>

<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="handleCancel" @keydown="handleKeydown">
      <div class="modal-content confirm-modal">
        <div class="modal-header">
          <h3>{{ title }}</h3>
        </div>
        
        <div class="modal-body">
          <p class="confirm-message">{{ message }}</p>
          <p v-if="subMessage" class="confirm-sub-message">{{ subMessage }}</p>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="handleCancel">
            取消
          </button>
          <button class="btn btn-primary" @click="handleConfirm">
            確認
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.confirm-modal {
  max-width: 420px;
}

.confirm-message {
  font-size: 1rem;
  color: var(--color-text);
  margin-bottom: var(--spacing-sm);
}

.confirm-sub-message {
  font-size: 0.9rem;
  color: var(--color-text-light);
}

.modal-footer .btn {
  min-width: 100px;
}
</style>
