import { useState, useCallback, useEffect, useRef } from 'react';
import { Room, RoomEvent, RemoteParticipant, LocalParticipant } from 'livekit-client';
import { toast } from '@/components/ui/use-toast';

export interface LiveKitParticipant {
  id: string;
  identity: string;
  name?: string;
  isTeacher: boolean;
  isSpeaking: boolean;
  audioLevel: number;
  isMicrophoneEnabled: boolean;
  isCameraEnabled: boolean;
  isScreenSharing: boolean;
}

interface UseLiveKitSessionOptions {
  onConnected?: (room: Room) => void;
  onDisconnected?: () => void;
  onParticipantConnected?: (participant: RemoteParticipant) => void;
  onParticipantDisconnected?: (participant: RemoteParticipant) => void;
  onError?: (error: Error) => void;
}

export function useLiveKitSession(roomName: string, options: UseLiveKitSessionOptions = {}) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<LiveKitParticipant[]>([]);
  const [activeSpeakers, setActiveSpeakers] = useState<string[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const roomRef = useRef<Room | null>(null);

  const mapParticipant = useCallback((p: RemoteParticipant | LocalParticipant): LiveKitParticipant => {
    const identity = p.identity;
    const metadata = JSON.parse(p.metadata || '{}');
    
    return {
      id: p.sid,
      identity,
      name: metadata.name || identity,
      isTeacher: metadata.role === 'teacher',
      isSpeaking: p.isSpeaking,
      audioLevel: p.audioLevel || 0,
      isMicrophoneEnabled: p.isMicrophoneEnabled,
      isCameraEnabled: p.isCameraEnabled,
      isScreenSharing: p.isScreenShareEnabled,
    };
  }, []);

  const updateParticipants = useCallback((room: Room) => {
    const remoteParticipants = Array.from(room.participants.values());
    const localParticipant = room.localParticipant;
    
    const mappedParticipants = [
      ...remoteParticipants.map(p => mapParticipant(p)),
      mapParticipant(localParticipant)
    ];
    
    setParticipants(mappedParticipants);
  }, [mapParticipant]);

  const connect = useCallback(async (token: string) => {
    if (isConnecting || isConnected) return;
    
    try {
      setIsConnecting(true);
      setError(null);
      
      // Create a new room instance
      const newRoom = new Room({
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: {
          resolution: 'h720p_30fps',
        },
      });
      
      // Set up event listeners
      newRoom
        .on(RoomEvent.ParticipantConnected, (participant) => {
          updateParticipants(newRoom);
          options.onParticipantConnected?.(participant);
        })
        .on(RoomEvent.ParticipantDisconnected, (participant) => {
          updateParticipants(newRoom);
          options.onParticipantDisconnected?.(participant);
        })
        .on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
          setActiveSpeakers(speakers.map(s => s.sid));
        })
        .on(RoomEvent.Disconnected, () => {
          setIsConnected(false);
          options.onDisconnected?.();
        })
        .on(RoomEvent.Reconnecting, () => {
          // Handle reconnection
        })
        .on(RoomEvent.Reconnected, () => {
          // Handle reconnected
        });

      // Connect to the room
      await newRoom.connect(process.env.NEXT_PUBLIC_LIVEKIT_WS_URL || 'wss://lisan-alhekma-0h4ja3yk.livekit.cloud', token);
      
      // Enable camera and mic by default for the local participant
      await newRoom.localParticipant.enableCameraAndMicrophone();
      
      // Update state
      roomRef.current = newRoom;
      setRoom(newRoom);
      setIsConnected(true);
      updateParticipants(newRoom);
      
      // Call the connected callback
      options.onConnected?.(newRoom);
      
      return newRoom;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to connect to the session');
      setError(error);
      options.onError?.(error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting, isConnected, options, updateParticipants]);

  const disconnect = useCallback(async () => {
    if (!roomRef.current) return;
    
    try {
      roomRef.current.disconnect();
    } catch (err) {
      console.error('Error disconnecting from room:', err);
    } finally {
      roomRef.current = null;
      setRoom(null);
      setIsConnected(false);
      setParticipants([]);
      setActiveSpeakers([]);
    }
  }, []);

  const toggleMicrophone = useCallback(async (enabled: boolean) => {
    if (!roomRef.current) return;
    
    try {
      if (enabled) {
        await roomRef.current.localParticipant.setMicrophoneEnabled(true);
      } else {
        await roomRef.current.localParticipant.setMicrophoneEnabled(false);
      }
      updateParticipants(roomRef.current);
    } catch (err) {
      console.error('Failed to toggle microphone:', err);
      throw err;
    }
  }, [updateParticipants]);

  const toggleCamera = useCallback(async (enabled: boolean) => {
    if (!roomRef.current) return;
    
    try {
      if (enabled) {
        await roomRef.current.localParticipant.setCameraEnabled(true);
      } else {
        await roomRef.current.localParticipant.setCameraEnabled(false);
      }
      updateParticipants(roomRef.current);
    } catch (err) {
      console.error('Failed to toggle camera:', err);
      throw err;
    }
  }, [updateParticipants]);

  const toggleScreenShare = useCallback(async (enabled: boolean) => {
    if (!roomRef.current) return;
    
    try {
      if (enabled) {
        await roomRef.current.localParticipant.setScreenShareEnabled(true);
      } else {
        await roomRef.current.localParticipant.setScreenShareEnabled(false);
      }
      updateParticipants(roomRef.current);
    } catch (err) {
      console.error('Failed to toggle screen share:', err);
      throw err;
    }
  }, [updateParticipants]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
      }
    };
  }, []);

  return {
    // State
    isConnecting,
    isConnected,
    room,
    participants,
    activeSpeakers,
    error,
    
    // Actions
    connect,
    disconnect,
    toggleMicrophone,
    toggleCamera,
    toggleScreenShare,
  };
}

export default useLiveKitSession;
