import { useState, useEffect, useCallback, useRef } from 'react';
import { connectSocket, disconnectSocket } from '../utils/socket';

export function useSocket() {
  const [connected, setConnected] = useState(false);
  const [roomCode, setRoomCode] = useState(null);
  const [roomInfo, setRoomInfo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [partnerActivity, setPartnerActivity] = useState(null);
  const [partnerJoined, setPartnerJoined] = useState(false);
  const [partnerName, setPartnerName] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = connectSocket();
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('new-message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on('user-joined', ({ name }) => {
      setPartnerJoined(true);
      setPartnerName(name);
    });

    socket.on('user-left', ({ name }) => {
      setPartnerJoined(false);
      setPartnerName(null);
    });

    socket.on('user-role-changed', ({ name, role }) => {
      // Could update room info here
    });

    socket.on('partner-activity', (activity) => {
      setPartnerActivity(activity);
      // Clear activity indicator after timeout
      setTimeout(() => setPartnerActivity(null), 3000);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('new-message');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('user-role-changed');
      socket.off('partner-activity');
      disconnectSocket();
    };
  }, []);

  const createRoom = useCallback((name) => {
    return new Promise((resolve, reject) => {
      socketRef.current?.emit('create-room', { name }, (response) => {
        if (response.success) {
          setRoomCode(response.roomCode);
          setRoomInfo(response.roomInfo);
          resolve(response);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }, []);

  const joinRoom = useCallback((code, name) => {
    return new Promise((resolve, reject) => {
      socketRef.current?.emit('join-room', { roomCode: code, name }, (response) => {
        if (response.success) {
          setRoomCode(response.roomCode);
          setRoomInfo(response.roomInfo);
          setPartnerJoined(true);
          // Get partner name from room info
          const partner = response.roomInfo.users.find(
            (u) => u.socketId !== socketRef.current.id
          );
          if (partner) setPartnerName(partner.name);
          resolve(response);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }, []);

  const setRole = useCallback((role) => {
    return new Promise((resolve, reject) => {
      socketRef.current?.emit('set-role', { role }, (response) => {
        if (response.success) resolve();
        else reject(new Error(response.error));
      });
    });
  }, []);

  const sendMessage = useCallback((text, type) => {
    socketRef.current?.emit('send-message', { text, type });
  }, []);

  const sendActivity = useCallback((isActive, activityType) => {
    socketRef.current?.emit('activity-indicator', { isActive, activityType });
  }, []);

  return {
    connected,
    roomCode,
    roomInfo,
    messages,
    partnerActivity,
    partnerJoined,
    partnerName,
    socketId: socketRef.current?.id,
    createRoom,
    joinRoom,
    setRole,
    sendMessage,
    sendActivity,
  };
}
