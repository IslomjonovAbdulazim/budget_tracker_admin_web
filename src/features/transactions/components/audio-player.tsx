import { useState, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { transactionsService } from '@/services/transactions'
import { useAudioManager } from '@/hooks/use-audio-manager'

interface AudioPlayerProps {
  audioPath: string | null
  transcript?: string | null
}

export function AudioPlayer({ audioPath, transcript }: AudioPlayerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)
  
  const audioUrl = transactionsService.getAudioUrl(audioPath)
  const audioId = audioPath || 'no-audio'
  const { audioRef, playAudio, pauseAudio, isCurrentlyPlaying } = useAudioManager(audioId)
  
  const isPlaying = isCurrentlyPlaying()

  if (!audioUrl) {
    return transcript ? (
      <div className="text-sm text-muted-foreground italic">
        "{transcript}"
      </div>
    ) : null
  }

  const handlePlay = async () => {
    if (!audioRef.current) return

    try {
      setIsLoading(true)
      setError(false)

      if (isPlaying) {
        pauseAudio()
      } else {
        await playAudio()
      }
    } catch (err) {
      console.error('Audio playback error:', err)
      setError(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleError = () => {
    setError(true)
    setIsLoading(false)
  }

  // Listen for audio state changes
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadStart = () => setIsLoading(true)
    const handleCanPlay = () => setIsLoading(false)
    
    audio.addEventListener('loadstart', handleLoadStart)
    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart)
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('error', handleError)
    }
  }, [audioRef])

  return (
    <div className="flex items-center gap-2">
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
      />
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handlePlay}
        disabled={isLoading || error}
        className="h-8 w-8 p-0"
      >
        {error ? (
          <VolumeX className="h-4 w-4 text-red-500" />
        ) : isLoading ? (
          <div className="h-4 w-4 animate-pulse rounded-full bg-muted" />
        ) : isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>

      {error ? (
        <span className="text-xs text-red-500">Failed to load audio</span>
      ) : (
        <div className="flex items-center gap-1">
          <Volume2 className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Audio</span>
        </div>
      )}

      {transcript && (
        <div className="text-sm text-muted-foreground italic max-w-xs truncate">
          "{transcript}"
        </div>
      )}
    </div>
  )
}