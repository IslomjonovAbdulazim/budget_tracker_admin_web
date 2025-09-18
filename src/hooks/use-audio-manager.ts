import { useEffect, useRef, useState } from 'react'

// Global audio manager to ensure only one audio plays at a time
class AudioManager {
  private currentAudio: HTMLAudioElement | null = null
  private currentId: string | null = null
  private listeners: Set<() => void> = new Set()

  play(audio: HTMLAudioElement, id: string): void {
    // Stop ALL other audio first
    this.stopAll()
    
    this.currentAudio = audio
    this.currentId = id
    this.notifyListeners()
  }

  stop(id?: string): void {
    if (!id || this.currentId === id) {
      if (this.currentAudio) {
        this.currentAudio.pause()
        this.currentAudio.currentTime = 0
      }
      this.currentAudio = null
      this.currentId = null
      this.notifyListeners()
    }
  }

  stopAll(): void {
    if (this.currentAudio) {
      this.currentAudio.pause()
      this.currentAudio.currentTime = 0
    }
    this.currentAudio = null
    this.currentId = null
    this.notifyListeners()
  }

  getCurrentId(): string | null {
    return this.currentId
  }

  isPlaying(id: string): boolean {
    return this.currentId === id && this.currentAudio && !this.currentAudio.paused
  }

  addListener(callback: () => void): void {
    this.listeners.add(callback)
  }

  removeListener(callback: () => void): void {
    this.listeners.delete(callback)
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => callback())
  }
}

// Global instance
const audioManager = new AudioManager()

export function useAudioManager(id: string) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [, forceUpdate] = useState({})

  // Force re-render when audio manager state changes
  useEffect(() => {
    const callback = () => forceUpdate({})
    audioManager.addListener(callback)
    return () => audioManager.removeListener(callback)
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleEnded = () => {
      audioManager.stop(id)
    }

    const handlePause = () => {
      // Only stop if this audio was the one playing
      if (audioManager.getCurrentId() === id) {
        audioManager.stop(id)
      }
    }

    const handlePlay = () => {
      // Ensure this audio is registered as playing
      if (audioManager.getCurrentId() !== id) {
        audioManager.play(audio, id)
      }
    }

    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('play', handlePlay)

    return () => {
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('play', handlePlay)
      // Stop this audio when component unmounts
      if (audioManager.getCurrentId() === id) {
        audioManager.stop(id)
      }
    }
  }, [id])

  const playAudio = async () => {
    const audio = audioRef.current
    if (!audio) return

    try {
      // This will stop all other audio and register this one
      audioManager.play(audio, id)
      await audio.play()
    } catch (error) {
      audioManager.stop(id)
      throw error
    }
  }

  const pauseAudio = () => {
    const audio = audioRef.current
    if (!audio) return

    audio.pause()
    audioManager.stop(id)
  }

  const isCurrentlyPlaying = () => {
    return audioManager.isPlaying(id)
  }

  return {
    audioRef,
    playAudio,
    pauseAudio,
    isCurrentlyPlaying,
  }
}