import { computed } from 'vue'
import { usePomodoroStore } from '@/stores/pomodoroStore'

// 匯入音效檔案
import beepSound from '@/assets/sounds/beep.wav'
import bellSound from '@/assets/sounds/bell.wav'
import alarmSound from '@/assets/sounds/alarm.wav'
import birdSound from '@/assets/sounds/bird.wav'
import digitalSound from '@/assets/sounds/digital.wav'
import alertSound from '@/assets/sounds/alert.wav'
import warningSound from '@/assets/sounds/warning.wav'
import dropSound from '@/assets/sounds/drop.mp3'
import hornSound from '@/assets/sounds/horn.wav'
import musicSound from '@/assets/sounds/music.mp3'
import defaultSound from '@/assets/sounds/default.wav'

/**
 * 音效檔案對應表
 */
const SOUND_FILES = {
  NONE: null,
  BEEP: beepSound,
  DEFAULT: defaultSound,
  ALERT: alertSound,
  WARNING: warningSound,
  DIGITAL: digitalSound,
  BIRD: birdSound,
  ALARM: alarmSound,
  MUSIC: musicSound,
  DROP: dropSound,
  BELL: bellSound,
  HORN: hornSound
}

/**
 * 音效 Composable
 * 使用真實音效檔案播放
 */
export const useSound = () => {
  const store = usePomodoroStore()

  // 預載音效的快取
  const audioCache = new Map()
  
  // 目前正在播放的音效
  let currentlyPlaying = null

  /**
   * 取得或建立 Audio 物件
   */
  const getAudio = (soundType) => {
    if (!audioCache.has(soundType)) {
      const file = SOUND_FILES[soundType]
      if (file) {
        const audio = new Audio(file)
        audio.preload = 'auto'
        audioCache.set(soundType, audio)
      }
    }
    return audioCache.get(soundType)
  }

  /**
   * 停止目前播放的音效
   */
  const stopCurrentSound = () => {
    if (currentlyPlaying) {
      currentlyPlaying.pause()
      currentlyPlaying.currentTime = 0
      currentlyPlaying = null
    }
  }

  /**
   * 預載所有音效
   */
  const preloadSounds = () => {
    Object.keys(SOUND_FILES).forEach(key => {
      if (SOUND_FILES[key]) {
        getAudio(key)
      }
    })
  }

  /**
   * 播放指定類型的音效
   */
  const playSound = async (soundType) => {
    if (!store.settings.soundEnabled) return
    if (soundType === 'NONE') return

    // 先停止之前播放的音效
    stopCurrentSound()

    const audio = getAudio(soundType)
    if (audio) {
      try {
        // 重設播放位置以便重複播放
        audio.currentTime = 0
        currentlyPlaying = audio
        await audio.play()
      } catch (error) {
        console.warn('音效播放失敗:', error.message)
      }
    }
  }

  /**
   * 播放工作結束音效
   */
  const playWorkEndSound = () => {
    playSound(store.settings.workEndSound)
  }

  /**
   * 播放休息結束音效
   */
  const playBreakEndSound = () => {
    playSound(store.settings.breakEndSound)
  }

  /**
   * 測試播放音效
   */
  const testSound = (soundType) => {
    playSound(soundType)
  }

  /**
   * 所有可用的音效列表
   */
  const soundOptions = computed(() => Object.keys(SOUND_FILES))

  // 預載音效
  preloadSounds()

  return {
    soundOptions,
    playSound,
    playWorkEndSound,
    playBreakEndSound,
    testSound,
    preloadSounds
  }
}
