import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function SimpleCall() {
  /* ------------- URL params & role ------------------ */
  const { roomId, creator } = useParams();
  const isHost = creator === 'true';

  /* ------------- refs ------------------------------- */
  const localVideo     = useRef(null);
  const remoteVideo    = useRef(null);
  const pcRef          = useRef(null);
  const wsRef          = useRef(null);
  const localStreamRef = useRef(null);
  const iceQueue       = useRef([]);      // ICE before remote-SDP

  /* ------------- recording refs --------------------- */
  const mediaRecRef    = useRef(null);
  const blobMap        = useRef({});      // { 1:Blob, 2:Blob, … }
  const videoId        = useRef(null);
  const chunkCount     = useRef(1);       // next index in blobMap
  const uploadCount    = useRef(1);       // next index to upload

  /* ------------- state ------------------------------ */
  const [remoteOn,    setRemoteOn]    = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  /* ==================================================
     life-cycle
  ================================================== */
  useEffect(() => { start(); return stop; }, []);

  /* ==================================================
     peer-connection helpers
  ================================================== */
  function newPeerConnection() {
    const pc = new RTCPeerConnection({
      iceServers:[{ urls:'stun:stun.l.google.com:19302' }]
    });

    /* add local tracks */
    localStreamRef.current.getTracks()
      .forEach(t => pc.addTrack(t, localStreamRef.current));

    pc.ontrack = e => {
      remoteVideo.current.srcObject = e.streams[0];
      setRemoteOn(true);
    };

    pc.onicecandidate = e => {
      if (e.candidate && wsRef.current?.readyState === 1) {
        wsRef.current.send(JSON.stringify({
          type:'ice', roomId, data:e.candidate.toJSON()
        }));
      }
    };

    return pc;
  }

  /* ==================================================
     start call
  ================================================== */
  async function start() {
    /* 1. camera / mic */
    localStreamRef.current =
      await navigator.mediaDevices.getUserMedia({ video:true, audio:true });
    localVideo.current.srcObject = localStreamRef.current;

    /* 2. peer */
    pcRef.current = newPeerConnection();

    /* 3. websocket signalling */
    const ws = new WebSocket('ws://localhost:8080/ws');
    wsRef.current = ws;

    ws.onopen = () => ws.send(JSON.stringify({ type:'join-room', roomId }));
    ws.onmessage = async ({ data }) => {
      const msg = JSON.parse(data);
      if (msg.roomId !== roomId) return;

      switch (msg.type) {
        case 'join-room':
          if (isHost) await sendOffer();
          break;

        case 'offer':
          if (isHost) break;                            // ignore own offer
          await resetPeer();
          await pcRef.current.setRemoteDescription(msg.data);
          await addQueuedIce();
          const answer = await pcRef.current.createAnswer();
          await pcRef.current.setLocalDescription(answer);
          ws.send(JSON.stringify({ type:'answer', roomId, data:answer }));
          break;

        case 'answer':
          if (!isHost) break;
          await pcRef.current.setRemoteDescription(msg.data);
          await addQueuedIce();
          break;

        case 'ice':
          const cand = new RTCIceCandidate(msg.data);
          if (pcRef.current.remoteDescription)
            await pcRef.current.addIceCandidate(cand);
          else
            iceQueue.current.push(cand);
          break;
      }
    };
  }

  async function sendOffer() {
    await resetPeer();
    const offer = await pcRef.current.createOffer();
    await pcRef.current.setLocalDescription(offer);
    wsRef.current.send(JSON.stringify({ type:'offer', roomId, data:offer }));
  }

  async function resetPeer() {
    pcRef.current?.close();
    pcRef.current = newPeerConnection();
    setRemoteOn(false);
    iceQueue.current = [];
  }

  async function addQueuedIce() {
    while (iceQueue.current.length) {
      await pcRef.current.addIceCandidate(iceQueue.current.shift());
    }
  }

  /* ==================================================
     recording & chunk upload
  ================================================== */
  async function startRecording() {
    /* 1. tell backend we’re starting a new video */
    const { data } = await axios.post('http://localhost:8080/upload/start', {
      userid: localStorage.getItem('userId'),
      title:  'video'
    });
    videoId.current = data.videoId;

    /* 2. create MediaRecorder on the EXISTING local stream */
    const mr = new MediaRecorder(localStreamRef.current,
                                 { mimeType:'video/webm' }); // supported by Chrome, FF[2]
    mediaRecRef.current = mr;
    setIsRecording(true);

    mr.ondataavailable = async (evt) => {
      if (!evt.data || evt.data.size === 0) return;
      const idx  = chunkCount.current;
      const blob = new Blob([evt.data], { type:'video/webm' });
      blobMap.current[idx] = blob;
      chunkCount.current  += 1;
      await uploadChunk(idx);               // fire-and-await to keep order
    };

    mr.start(20_000);                       // emit data every 20 s
  }

  async function uploadChunk(idx) {
    try {
      /* a) obtain signed PUT URL for this chunk */
      const { data } = await axios.post(
        'http://localhost:8080/upload/chunk-upload',
        {
          chunkUserId: localStorage.getItem('userId'),
          videoid:     videoId.current,
          chunkId:     idx,
        }
      );

      /* b) PUT the blob directly to storage */
      await axios.put(
        data.signedUrl,
        blobMap.current[idx],
        { headers:{ 'Content-Type':'video/webm' } }
      );

      uploadCount.current = idx + 1;        // advance pointer on success
    } catch (err) {
      console.error(`chunk ${idx} failed`, err);
      /* simple retry once after 2 s; production could back-off & persist queue */
      setTimeout(() => uploadChunk(idx), 2_000);
    }
  }

  function stopRecording() {
    mediaRecRef.current?.stop();
    setIsRecording(false);
  }

  /* ==================================================
     cleanup
  ================================================== */
  function stop() {
    stopRecording();
    wsRef.current?.close();
    pcRef.current?.close();
    localStreamRef.current?.getTracks().forEach(t => t.stop());
  }

  /* ==================================================
     UI
  ================================================== */
  return (
    <div style={{ padding:20, fontFamily:'sans-serif' }}>
      <h2>{ isHost ? 'HOST' : 'GUEST' } – room { roomId }</h2>

      {/* record controls */}
      <button
        style={{ marginBottom:10 }}
        onClick={ isRecording ? stopRecording : startRecording }
      >
        { isRecording ? 'Stop recording' : 'Start recording' }
      </button>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        {/* local */}
        <div style={{ border:'1px solid #ccc' }}>
          <p style={{ margin:4 }}>Local</p>
          <video ref={ localVideo } autoPlay muted playsInline
                 style={{ width:'100%', background:'#000' }} />
        </div>

        {/* remote */}
        <div style={{ border:'1px solid #0af' }}>
          <p style={{ margin:4 }}>Remote</p>

          { !remoteOn && (
            <div style={{
              width:'100%', aspectRatio:'16/9',
              display:'flex', alignItems:'center', justifyContent:'center',
              background:'#111', color:'#888'
            }}>
              waiting …
            </div>
          )}

          <video ref={ remoteVideo } autoPlay playsInline
                 style={{
                   width:'100%', background:'#000',
                   display: remoteOn ? 'block' : 'none'
                 }} />
        </div>
      </div>
    </div>
  );
}
