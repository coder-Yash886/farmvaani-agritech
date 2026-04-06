import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import {
  Send, Mic, Square, Users, MapPin, Loader2,
  PlusCircle, MessageCircle, ChevronLeft, X,
  Search, ImagePlus, Play, Pause
} from 'lucide-react';
import moment from 'moment';

const API = import.meta.env.VITE_API_BASE_URL;

// ── Small helpers ─────────────────────────────────────────────────────────────
function GroupItem({ group, isActive, onClick, showDistrict = false }) {
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      padding: '0.85rem 1rem', cursor: 'pointer',
      borderBottom: '1px solid #eee',
      backgroundColor: isActive ? 'rgba(46,125,50,0.08)' : 'transparent',
      borderLeft: isActive ? '4px solid var(--primary)' : '4px solid transparent',
      transition: 'background 0.15s',
    }}>
      <div style={{
        padding: '0.55rem', borderRadius: '50%', flexShrink: 0,
        backgroundColor: isActive ? 'var(--primary)' : '#eee',
        color: isActive ? 'white' : '#666',
      }}>
        <MessageCircle size={16} />
      </div>
      <div style={{ overflow: 'hidden', flex: 1 }}>
        <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 600, color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {group.name}
        </h3>
        <p style={{ margin: 0, fontSize: '0.75rem', color: '#888' }}>
          {group.createdBy}
          {showDistrict && (
            <span style={{ marginLeft: 6, background: 'rgba(46,125,50,0.12)', color: 'var(--primary)', borderRadius: 4, padding: '1px 5px', fontSize: '0.68rem', fontWeight: 700 }}>
              {group.district}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

// ── Audio player for voice messages ───────────────────────────────────────────
function VoiceMessage({ src }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); }
    else { audioRef.current.play(); }
    setPlaying(!playing);
  };

  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '180px' }}>
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={() => setProgress(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => { setPlaying(false); setProgress(0); if (audioRef.current) audioRef.current.currentTime = 0; }}
      />
      <button onClick={toggle} style={{ background: 'var(--primary)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
        {playing ? <Pause size={14} color="white" /> : <Play size={14} color="white" />}
      </button>
      <div style={{ flex: 1 }}>
        <input
          type="range"
          min={0}
          max={duration || 1}
          value={progress}
          onChange={(e) => { if (audioRef.current) { audioRef.current.currentTime = e.target.value; setProgress(+e.target.value); } }}
          style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
        />
        <div style={{ fontSize: '0.65rem', color: '#aaa', textAlign: 'right' }}>
          {fmt(progress)} / {fmt(duration)}
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function Community() {
  // ─ State ─────────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [socketReady, setSocketReady] = useState(false);

  const [farmerInfo, setFarmerInfo] = useState({ name: 'Farmer', phone: '', district: 'General' });
  const [activeRoom, setActiveRoom] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [groups, setGroups] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [error, setError] = useState('');
  const [groupSearch, setGroupSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Image
  const [imagePreview, setImagePreview] = useState(null);  // data URL
  const [imageFile, setImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef(null);

  // Voice
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);

  // Misc refs
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const activeRoomRef = useRef('');
  const farmerInfoRef = useRef(farmerInfo);
  const streamRef = useRef(null);

  useEffect(() => { farmerInfoRef.current = farmerInfo; }, [farmerInfo]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // ─ Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('token');
    const phone = localStorage.getItem('farmerPhone');
    if (!token) { window.location.href = '/login'; return; }

    const init = async () => {
      let userDistrict = 'General';
      let userName = localStorage.getItem('farmerName') || 'Farmer';
      try {
        const res = await axios.get(`${API}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success && res.data.data) {
          userDistrict = res.data.data.location?.district || res.data.data.village || 'General';
          userName = res.data.data.name || userName;
          localStorage.setItem('farmerName', userName);
        }
      } catch { /* use cached */ }

      const info = { name: userName, phone: phone || '', district: userDistrict };
      setFarmerInfo(info);
      farmerInfoRef.current = info;

      const defaultRoom = `${userDistrict} General Chat`;
      setActiveRoom(defaultRoom);
      activeRoomRef.current = defaultRoom;
      fetchGroups(userDistrict);

      // Socket
      const sock = io(API, { transports: ['websocket', 'polling'], reconnection: true, reconnectionAttempts: 10 });
      sock.on('connect', () => {
        setSocketReady(true);
        sock.emit('join-room', activeRoomRef.current);
      });
      sock.on('disconnect', () => setSocketReady(false));
      sock.on('connect_error', () => setError('Chat server unreachable. Please refresh.'));
      sock.on('receive-message', (msg) => {
        if (msg.roomId === activeRoomRef.current) {
          setMessages(prev => [...prev, msg]);
        }
      });
      socketRef.current = sock;
      loadMessages(defaultRoom);
    };

    init();
    return () => { socketRef.current?.disconnect(); socketRef.current = null; };
    // eslint-disable-next-line
  }, []);

  // ─ Global group search (debounced) ─────────────────────────────────────
  useEffect(() => {
    if (!groupSearch.trim()) { setSearchResults([]); return; }
    setIsSearching(true);
    const t = setTimeout(async () => {
      try {
        const res = await axios.get(`${API}/api/community/groups/search?q=${encodeURIComponent(groupSearch.trim())}`);
        setSearchResults(res.data.success ? res.data.data : []);
      } catch { setSearchResults([]); }
      finally { setIsSearching(false); }
    }, 350);
    return () => clearTimeout(t);
  }, [groupSearch]);

  // ─ Helpers ───────────────────────────────────────────────────────────────
  const loadMessages = async (room) => {
    setLoading(true); setMessages([]);
    try {
      const res = await axios.get(`${API}/api/community/messages/${encodeURIComponent(room)}`);
      if (res.data.success) setMessages(res.data.data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const switchRoom = useCallback((roomName) => {
    setActiveRoom(roomName);
    activeRoomRef.current = roomName;
    socketRef.current?.emit('join-room', roomName);
    loadMessages(roomName);
    if (window.innerWidth < 768) setShowSidebar(false);
  }, []);

  const fetchGroups = async (district) => {
    try {
      const res = await axios.get(`${API}/api/community/groups/${encodeURIComponent(district)}`);
      if (res.data.success) setGroups(res.data.data);
    } catch { /* ignore */ }
  };

  const submitCreateGroup = async (e) => {
    e.preventDefault();
    const name = newGroupName.trim();
    if (!name) return;
    setIsCreating(true); setError('');
    try {
      const res = await axios.post(`${API}/api/community/groups`, {
        name, district: farmerInfoRef.current.district, createdBy: farmerInfoRef.current.name
      });
      if (res.data.success) {
        setGroups(prev => [res.data.data, ...prev]);
        setShowCreateModal(false); setNewGroupName('');
        switchRoom(res.data.data.name);
      }
    } catch (err) {
      setError('Create failed: ' + (err.response?.data?.message || err.message));
    } finally { setIsCreating(false); }
  };

  // ─ Send text ─────────────────────────────────────────────────────────────
  const handleSendText = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || !socketRef.current?.connected) return;
    socketRef.current.emit('send-message', {
      roomId: activeRoomRef.current,
      senderName: farmerInfoRef.current.name,
      senderPhone: farmerInfoRef.current.phone,
      text: trimmed,
    });
    setText('');
  };

  // ─ Send image ────────────────────────────────────────────────────────────
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Client-side size check (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image too large. Maximum size is 10 MB.');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = ''; // reset so same file can be re-selected
  };

  const handleSendImage = async () => {
    if (!imageFile) return;
    if (!socketRef.current?.connected) {
      setError('Not connected to chat. Please refresh.');
      return;
    }
    setUploadingImage(true); setError('');
    try {
      const formData = new FormData();
      formData.append('image', imageFile, imageFile.name);

      const res = await axios.post(`${API}/api/community/upload-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      });

      if (res.data.success) {
        socketRef.current.emit('send-message', {
          roomId: activeRoomRef.current,
          senderName: farmerInfoRef.current.name,
          senderPhone: farmerInfoRef.current.phone,
          imageUrl: res.data.imageUrl,
        });
        setImagePreview(null); setImageFile(null);
      } else {
        setError(res.data.message || 'Image upload failed.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Upload failed.';
      setError('Image upload failed: ' + msg);
    } finally { setUploadingImage(false); }
  };

  // ─ Voice recording (tap to start / tap to stop) ───────────────────────────
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioChunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus' : 'audio/webm';
      const recorder = new MediaRecorder(stream, { mimeType });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        // Stop mic
        streamRef.current?.getTracks().forEach(t => t.stop());

        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioChunksRef.current = [];

        if (blob.size < 500) {
          setUploadingAudio(false);
          return; // too short / empty
        }

        setUploadingAudio(true);
        try {
          const formData = new FormData();
          formData.append('audio', blob, 'voice.webm');
          const res = await axios.post(`${API}/api/community/upload-audio`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 30000,
          });
          if (res.data.success && socketRef.current?.connected) {
            socketRef.current.emit('send-message', {
              roomId:      activeRoomRef.current,
              senderName:  farmerInfoRef.current.name,
              senderPhone: farmerInfoRef.current.phone,
              audioUrl:    res.data.audioUrl,
            });
          } else if (!res.data.success) {
            setError(res.data.message || 'Voice upload failed.');
          }
        } catch (err) {
          setError('Voice upload failed: ' + (err.response?.data?.message || err.message));
        } finally {
          setUploadingAudio(false);
        }
      };

      recorder.start(250);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => setRecordingTime(p => p + 1), 1000);
    } catch {
      alert('Microphone access denied. Please allow microphone in browser settings.');
    }
  };

  const stopRecording = () => {
    // Clear timer IMMEDIATELY so it doesn't keep running during upload
    clearInterval(recordingTimerRef.current);
    setIsRecording(false);
    setRecordingTime(0);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop(); // triggers onstop → upload
    }
  };

  const cancelRecording = () => {
    // Suppress the onstop handler so it doesn't upload
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = null;
      if (mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    }
    streamRef.current?.getTracks().forEach(t => t.stop());
    clearInterval(recordingTimerRef.current);
    setIsRecording(false);
    setRecordingTime(0);
    setUploadingAudio(false);
    audioChunksRef.current = [];
  };

  const fmtTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  // ─ Derived ───────────────────────────────────────────────────────────────
  const baseGroup = `${farmerInfo.district} General Chat`;
  const isBusy = uploadingImage || uploadingAudio;

  // ─ Styles ─────────────────────────────────────────────────────────────────
  const S = {
    layout: { paddingTop: '80px', height: '100vh', display: 'flex', justifyContent: 'center', backgroundColor: '#e9edeb' },
    wrap: { display: 'flex', width: '100%', maxWidth: '1200px', height: 'calc(100vh - 100px)', marginTop: '20px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.12)', background: 'white' },
    sidebar: { width: '300px', minWidth: '300px', display: showSidebar ? 'flex' : 'none', flexDirection: 'column', borderRight: '1px solid #ddd', backgroundColor: '#f8f9fa' },
    chatArea: { flex: 1, display: (!showSidebar || window.innerWidth > 768) ? 'flex' : 'none', flexDirection: 'column', backgroundColor: '#efeae2' },
    sideHeader: { backgroundColor: 'var(--primary)', color: 'white', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    inputRow: { display: 'flex', padding: '0.7rem', backgroundColor: '#f0f0f0', alignItems: 'flex-end', gap: '0.4rem', borderTop: '1px solid #ddd' },
  };

  return (
    <div style={S.layout}>
      <div style={S.wrap} className="community-main">

        {/* ── SIDEBAR ─────────────────────────────────────────────────── */}
        <div style={S.sidebar}>
          <div style={S.sideHeader}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={18} /> {farmerInfo.district}
              </h2>
              <span style={{ fontSize: '0.82rem', opacity: 0.9 }}>{farmerInfo.name}</span>
            </div>
            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: socketReady ? '#4ade80' : '#f87171' }} title={socketReady ? 'Connected' : 'Disconnected'} />
          </div>

          <div style={{ padding: '0.75rem' }}>
            <button onClick={() => setShowCreateModal(true)} style={{ width: '100%', padding: '0.7rem', background: 'var(--secondary)', border: 'none', borderRadius: 8, fontWeight: 700, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', color: 'white', fontSize: '0.9rem' }}>
              <PlusCircle size={16} /> Create Group
            </button>

            {/* Search */}
            <div style={{ position: 'relative', marginTop: '0.5rem' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#bbb', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Search all groups..."
                value={groupSearch}
                onChange={(e) => setGroupSearch(e.target.value)}
                style={{ width: '100%', padding: '0.5rem 2rem 0.5rem 2rem', borderRadius: 20, border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box', backgroundColor: 'white' }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
              {groupSearch && (
                <button onClick={() => setGroupSearch('')} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#bbb', padding: 2, display: 'flex' }}>
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            <div style={{ padding: '0.3rem 1rem', fontSize: '0.72rem', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{groupSearch ? 'Search Results' : 'Your Groups'}</span>
              {isSearching && <Loader2 size={12} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />}
            </div>

            {groupSearch.trim() ? (
              isSearching ? null : searchResults.length === 0 ? (
                <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
                  <Search size={28} style={{ color: '#ddd' }} />
                  <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: '#bbb' }}>No groups found for<br /><strong style={{ color: '#999' }}>"{groupSearch}"</strong></p>
                </div>
              ) : searchResults.map(g => (
                <GroupItem key={g._id} group={g} isActive={activeRoom === g.name} onClick={() => switchRoom(g.name)} showDistrict />
              ))
            ) : (
              <>
                {/* Default room */}
                <div onClick={() => switchRoom(baseGroup)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', cursor: 'pointer', borderBottom: '1px solid #eee', backgroundColor: activeRoom === baseGroup ? 'rgba(46,125,50,0.08)' : 'transparent', borderLeft: activeRoom === baseGroup ? '4px solid var(--primary)' : '4px solid transparent' }}>
                  <div style={{ padding: '0.55rem', borderRadius: '50%', flexShrink: 0, backgroundColor: activeRoom === baseGroup ? 'var(--primary)' : '#eee', color: activeRoom === baseGroup ? 'white' : '#666' }}>
                    <Users size={16} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 600, color: '#333' }}>{baseGroup}</h3>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#888' }}>Default district group</p>
                  </div>
                </div>

                {groups.length === 0 ? (
                  <div style={{ padding: '1.5rem', textAlign: 'center', color: '#bbb', fontSize: '0.83rem' }}>No custom groups yet.<br />Create one!</div>
                ) : groups.map(g => (
                  <GroupItem key={g._id} group={g} isActive={activeRoom === g.name} onClick={() => switchRoom(g.name)} />
                ))}
              </>
            )}
          </div>
        </div>

        {/* ── CHAT AREA ───────────────────────────────────────────────── */}
        <div style={S.chatArea}>
          {/* Chat header */}
          <div style={{ backgroundColor: 'white', padding: '0.7rem 1rem', display: 'flex', alignItems: 'center', borderBottom: '1px solid #ddd', gap: '0.65rem' }}>
            <button style={{ border: 'none', background: 'none', cursor: 'pointer', display: showSidebar ? 'none' : 'flex' }} onClick={() => setShowSidebar(true)}>
              <ChevronLeft size={22} color="var(--primary)" />
            </button>
            <div style={{ padding: '0.35rem', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '50%' }}><Users size={15} /></div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#333' }}>{activeRoom}</h2>
              <p style={{ margin: 0, fontSize: '0.72rem', color: socketReady ? '#22c55e' : '#f87171' }}>
                {socketReady ? '● Connected' : '○ Connecting...'}
              </p>
            </div>
          </div>

          {/* Error bar */}
          {error && (
            <div style={{ backgroundColor: '#fff5f5', borderBottom: '1px solid #fed7d7', padding: '0.45rem 1rem', fontSize: '0.83rem', color: '#c53030', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{error}</span>
              <button onClick={() => setError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c53030', display: 'flex' }}><X size={15} /></button>
            </div>
          )}

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.2rem', backgroundImage: 'radial-gradient(circle at center, #ece6df 0, transparent 2px)', backgroundSize: '15px 15px' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Loader2 size={30} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
              </div>
            ) : messages.length === 0 ? (
              <div style={{ textAlign: 'center', background: 'white', padding: '2rem', borderRadius: 16, maxWidth: 260, margin: '40px auto', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
                <Users size={38} style={{ color: '#ccc', marginBottom: '0.8rem' }} />
                <h3 style={{ margin: '0 0 0.3rem', color: '#555', fontSize: '1rem' }}>Say Hello! 👋</h3>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#999' }}>Be first to message in<br />{activeRoom}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {messages.map((msg, idx) => {
                  const isMine = farmerInfo.phone && msg.senderPhone === farmerInfo.phone;
                  return (
                    <div key={msg._id || idx} style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '72%', padding: '0.55rem 0.85rem',
                        borderRadius: isMine ? '12px 0 12px 12px' : '0 12px 12px 12px',
                        backgroundColor: isMine ? '#dcf8c6' : 'white',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                      }}>
                        {!isMine && (
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', display: 'block', marginBottom: '3px' }}>
                            {msg.senderName}
                          </span>
                        )}

                        {/* Text */}
                        {msg.text && <p style={{ margin: 0, fontSize: '0.93rem', lineHeight: 1.45, wordBreak: 'break-word' }}>{msg.text}</p>}

                        {/* Image */}
                        {msg.imageUrl && (
                          <img
                            src={`${API}${msg.imageUrl}`}
                            alt="Shared"
                            onClick={() => window.open(`${API}${msg.imageUrl}`, '_blank')}
                            style={{ maxWidth: '240px', maxHeight: '280px', borderRadius: 8, display: 'block', cursor: 'pointer', marginTop: msg.text ? '0.4rem' : 0 }}
                          />
                        )}

                        {/* Voice */}
                        {msg.audioUrl && <VoiceMessage src={`${API}${msg.audioUrl}`} />}

                        <div style={{ fontSize: '0.62rem', color: '#aaa', textAlign: 'right', marginTop: '3px' }}>
                          {moment(msg.createdAt).format('hh:mm A')}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* ── Image preview bar ─────────────────────────────────────── */}
          {imagePreview && (
            <div style={{ backgroundColor: '#fff', borderTop: '1px solid #ddd', padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <img src={imagePreview} alt="preview" style={{ height: 60, width: 60, objectFit: 'cover', borderRadius: 8, border: '2px solid #e2e8f0' }} />
              <div style={{ flex: 1, fontSize: '0.82rem', color: '#555' }}>
                {imageFile?.name}<br />
                <span style={{ color: '#999', fontSize: '0.75rem' }}>{(imageFile?.size / 1024).toFixed(0)} KB</span>
              </div>
              <button onClick={() => { setImagePreview(null); setImageFile(null); }} style={{ background: '#fee2e2', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
                <X size={14} />
              </button>
              <button onClick={handleSendImage} disabled={uploadingImage} style={{ background: 'var(--primary)', border: 'none', borderRadius: 8, padding: '0.45rem 1rem', color: 'white', fontWeight: 700, cursor: uploadingImage ? 'not-allowed' : 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem', opacity: uploadingImage ? 0.7 : 1 }}>
                {uploadingImage ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={14} />}
                Send
              </button>
            </div>
          )}

          {/* ── Voice recording bar ────────────────────────────────────── */}
          {isRecording && (
            <div style={{ backgroundColor: '#fff0f0', borderTop: '1px solid #fecaca', padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ef4444', animation: 'pulse 1s infinite' }} />
              <span style={{ flex: 1, fontWeight: 600, color: '#dc2626', fontSize: '0.9rem' }}>
                Recording... {fmtTime(recordingTime)}
              </span>
              <button onClick={cancelRecording} style={{ background: '#fee2e2', border: 'none', borderRadius: 8, padding: '0.4rem 0.8rem', color: '#dc2626', fontWeight: 600, cursor: 'pointer', fontSize: '0.82rem' }}>
                Cancel
              </button>
              <button onClick={stopRecording} style={{ background: 'var(--primary)', border: 'none', borderRadius: 8, padding: '0.4rem 0.9rem', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Send size={14} /> Send
              </button>
            </div>
          )}

          {/* ── Uploading audio indicator ──────────────────────────────── */}
          {uploadingAudio && (
            <div style={{ backgroundColor: '#f0fdf4', borderTop: '1px solid #bbf7d0', padding: '0.5rem 1rem', fontSize: '0.83rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
              Sending voice message...
            </div>
          )}

          {/* ── Input area ─────────────────────────────────────────────── */}
          {!isRecording && !imagePreview && (
            <form onSubmit={handleSendText} style={S.inputRow}>
              {/* Image upload button */}
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={isBusy}
                title="Send image"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: '0.4rem', display: 'flex', alignItems: 'center', flexShrink: 0 }}
              >
                <ImagePlus size={22} />
              </button>
              <input type="file" accept="image/*" ref={imageInputRef} onChange={handleImageSelect} style={{ display: 'none' }} />

              {/* Text input */}
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write a message..."
                disabled={isBusy}
                style={{ flex: 1, padding: '0.7rem 1rem', borderRadius: 24, border: 'none', outline: 'none', fontSize: '0.95rem', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.08)', backgroundColor: 'white' }}
              />

              {text.trim() ? (
                /* Send text */
                <button type="submit" disabled={!socketReady} style={{ background: 'var(--primary)', border: 'none', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                  <Send size={17} />
                </button>
              ) : (
                /* Mic — tap to start */
                <button
                  type="button"
                  onClick={startRecording}
                  disabled={isBusy}
                  title="Record voice message"
                  style={{ background: 'var(--primary)', border: 'none', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}
                >
                  <Mic size={17} />
                </button>
              )}
            </form>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @media(max-width: 768px) {
          .community-main { margin-top: 0 !important; height: calc(100vh - 80px) !important; border-radius: 0 !important; }
        }
      `}</style>

      {/* ── Create Group Modal ───────────────────────────────────────── */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 200, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: 16, width: '90%', maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>Create Group</h3>
              <button onClick={() => { setShowCreateModal(false); setNewGroupName(''); setError(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#888" /></button>
            </div>
            <p style={{ margin: '0 0 1.2rem', color: '#64748b', fontSize: '0.88rem' }}>
              New group in <strong>{farmerInfo.district}</strong>
            </p>
            <form onSubmit={submitCreateGroup}>
              <input
                type="text"
                autoFocus
                placeholder="e.g. Wheat Farmers, Tractor Rental..."
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                disabled={isCreating}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 8, border: '2px solid #e2e8f0', outline: 'none', fontSize: '1rem', boxSizing: 'border-box', marginBottom: '1rem' }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
              {error && <p style={{ color: '#dc2626', fontSize: '0.83rem', margin: '-0.5rem 0 0.8rem' }}>{error}</p>}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} style={{ padding: '0.65rem 1.1rem', borderRadius: 8, background: '#e2e8f0', border: 'none', cursor: 'pointer', fontWeight: 600, color: '#475569' }}>Cancel</button>
                <button type="submit" disabled={!newGroupName.trim() || isCreating} style={{ padding: '0.65rem 1.3rem', borderRadius: 8, background: 'var(--primary)', border: 'none', color: 'white', fontWeight: 700, cursor: (!newGroupName.trim() || isCreating) ? 'not-allowed' : 'pointer', opacity: (!newGroupName.trim() || isCreating) ? 0.6 : 1 }}>
                  {isCreating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
