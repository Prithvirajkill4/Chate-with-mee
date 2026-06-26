/**
 * WHATSAPP CLONE ENGINE CORE CORE LIFECYCLE MANAGEMENT SCRIPT
 * Production Grade Object Architecture System
 */

// ---> RETAIN EXISTING VALID CONFIGURATION DATA PATH <---
const firebaseConfig = {
  apiKey: "AIzaSyB2o5DXG0r249JfueFAL7ybXiDspUdW0Ns",
  authDomain: "privateconnect-37f5b.firebaseapp.com",
  databaseURL: "https://privateconnect-37f5b-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "privateconnect-37f5b",
  storageBucket: "privateconnect-37f5b.firebasestorage.app",
  messagingSenderId: "177183011219",
  appId: "1:177183011219:web:11868ef01a65b2d46d7866"
};

// Initialize Firebase Core Framework Safely
if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const db = firebase.database();

// Application Engine Core Dynamic Runtime Memory States
let myId = null;
let targetId = null;
let activeChatRoomId = null;
let activeCallRoomId = null;
let localMediaStream = null;
let peerConnection = null;
let callTimerInterval = null;
let isVideoCallMode = false;
let micMutedState = false;

// Audio Hardware Tone Elements Declarations
const ringtoneEngine = new Audio('https://actions.google.com/sounds/v1/alarms/phone_ringing.ogg');
const connectToneEngine = new Audio('https://actions.google.com/sounds/v1/communications/calling_connect.ogg');
ringtoneEngine.loop = true; connectToneEngine.loop = true;

// Standard Google Stun Cluster Array Specification Rules for Firewalls/NAT Penetration
const iceServersConfiguration = { 
  iceServers: [
    { urls: 'stun:stun1.l.google.com:19302' }, 
    { urls: 'stun:stun2.l.google.com:19302' }
  ] 
};

// --- CORE FRAMEWORK STARTUP LIFECYCLE INITIALIZER ---
window.onload = () => {
  // Browser ki memory check karo ki user pehle se login hai ya nahi
  const savedSessionId = localStorage.getItem('myId');
  
  if (savedSessionId) {
      // Agar login hai, toh session lock karo
      myId = savedSessionId;
      
      // Login screen ko zabardasti hide karo taaki flash na ho
      document.getElementById('scrLogin').classList.remove('active-screen');
      document.getElementById('scrRegister').classList.remove('active-screen');
      
      // Seedha Dashboard par direct entry
      showDashboardView();
  } else {
      // Agar naya user hai tabhi Login dikhao
      navigate('scrLogin');
  }
  
  // Background mein calls ka wait karna shuru karo
  setupGlobalIncomingCallListener();
};

// Layout View Routing Module
function navigate(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active-screen'));
  document.getElementById(screenId).classList.add('active-screen');
  document.querySelectorAll('.menu-popup').forEach(m => m.style.display = 'none');
}

function toggleMenuPopup(menuId) {
  const el = document.getElementById(menuId);
  el.style.display = (el.style.display === 'block') ? 'none' : 'block';
}

function switchDashboardTab(tabName) {
  document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active-tab'));
  document.querySelectorAll('.tab-view-panel').forEach(p => p.classList.remove('active-panel'));
  
  // Find current element and activate matching panel structures
  event.currentTarget.classList.add('active-tab');
  if (tabName === 'chats') document.getElementById('dashboardTabChats').classList.add('active-panel');
  if (tabName === 'status') document.getElementById('dashboardTabStatus').classList.add('active-panel');
  if (tabName === 'calls') document.getElementById('dashboardTabCalls').classList.add('active-panel');
}

// --- SECURE CUSTOM ID/PASSWORD AUTHENTICATION CORE LAYER ---
function processRegister() {
  const id = document.getElementById('regId').value.trim();
  const pass = document.getElementById('regPass').value.trim();
  if (!id || !pass) return alert("All credentials fields parameter targets are required!");

  db.ref('users/' + id).once('value', snap => {
    if (snap.exists()) {
      alert("Registration conflict: Chosen Custom User ID is already occupied!");
    } else {
      db.ref('users/' + id).set({ password: pass, joinedAt: Date.now() }).then(() => {
        myId = id; localStorage.setItem('myId', id); showDashboardView();
      });
    }
  });
}

function processLogin() {
  const id = document.getElementById('loginId').value.trim();
  const pass = document.getElementById('loginPass').value.trim();
  if (!id || !pass) return alert("Missing login parameter identifiers!");

  db.ref('users/' + id).once('value', snap => {
    if (!snap.exists()) {
      alert("Identity mismatch: Account target record data not found!");
    } else {
      const userDataSchema = snap.val();
      if (!userDataSchema.password || userDataSchema.password === pass) {
          if(!userDataSchema.password) db.ref('users/' + id).update({ password: pass });
          myId = id; localStorage.setItem('myId', id); showDashboardView();
      } else {
          alert("Cryptographic verification failure: Incorrect Password!");
      }
    }
  });
}

function processLogout() {
  localStorage.removeItem('myId');
  window.location.reload();
}

function processDeleteAccount() {
  if (confirm("Trigger destructive lifecycle sequence? Warning: This will wipe your complete database configurations permanently!")) {
      db.ref('users/' + myId).remove().then(() => {
          db.ref('userChats/' + myId).remove();
          processLogout();
      });
  }
}

// --- DASHBOARD REAL-TIME PARSING AND NODE SEARCH ENGINE ---
function showDashboardView() {
  navigate('scrDashboard');
  document.getElementById('dashUserDisplay').innerText = myId;
  loadRecentChatNodes();
}

function initiateChatSearch() {
  const target = document.getElementById('searchUser').value.trim();
  if (!target || target === myId) return alert("Routing exception: Invalid Target User Field Parameter!");

  db.ref('users/' + target).once('value', snap => {
    if (snap.exists()) {
        setupChatRoomParameters(target);
    } else {
        alert("Security Database Exception: Input User ID does not exist in our registries!");
    }
  });
}

function setupChatRoomParameters(targetUserKey) {
  targetId = targetUserKey;
  activeChatRoomId = [myId, targetId].sort().join("_");
  activeCallRoomId = activeChatRoomId + "_CALL";
  
  document.getElementById('chatRoomTarget').innerText = targetId;
  document.getElementById('chatRoomAvatar').innerText = targetId.charAt(0);
  
  // Real-time listener for tracking state alterations
  db.ref('blocks/' + myId + '/' + targetId).on('value', snap => {
      document.getElementById('blockMenuBtn').innerText = snap.exists() ? "Unblock User" : "Block User";
      document.getElementById('chatTargetStatus').innerText = snap.exists() ? "Blocked" : "Online";
  });

  navigate('scrChat');
  syncChatPipelineStream();
}

// --- TWO-WAY MESSAGE TRANSMISSION LOGIC INFRASTRUCTURE ---
function syncChatPipelineStream() {
  const viewport = document.getElementById('chatMessageViewport');
  viewport.innerHTML = "";
  
  db.ref('chats/' + activeChatRoomId).off();
  db.ref('chats/' + activeChatRoomId).on('child_added', snap => {
      const msgFrame = snap.val();
      const div = document.createElement('div');
      let tsString = new Date(msgFrame.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
      
      if (msgFrame.isCall) {
          div.className = "call-log";
          div.innerHTML = `📞 ${msgFrame.text} • <span style="color:#8696a0; font-size:10px;">${tsString}</span>`;
      } else {
          div.className = `message ${msgFrame.sender === myId ? 'sent' : 'received'}`;
          div.innerHTML = `<span class="msg-text">${msgFrame.text}</span><span class="time">${tsString}</span>`;
      }
      viewport.appendChild(div);
      viewport.scrollTop = viewport.scrollHeight;
  });

  // Structural dynamic sync for data wipe event triggers
  db.ref('chats/' + activeChatRoomId).on('value', snap => {
      if(!snap.exists()) viewport.innerHTML = "";
  });
}

async function transmitMessage() {
  const input = document.getElementById('chatInputMessage');
  const txtVal = input.value.trim();
  if (!txtVal) return;

  const blockNodeGuard1 = await db.ref('blocks/' + myId + '/' + targetId).once('value');
  const blockNodeGuard2 = await db.ref('blocks/' + targetId + '/' + myId).once('value');
  if (blockNodeGuard1.exists() || blockNodeGuard2.exists()) return alert("Transactional Error: Inter-device security blocking protocol configuration restriction!");

  const dataPacket = { sender: myId, text: txtVal, isCall: false, timestamp: Date.now() };
  await db.ref('chats/' + activeChatRoomId).push(dataPacket);
  
  await db.ref('userChats/' + myId + '/' + targetId).set({ modified: Date.now() });
  await db.ref('userChats/' + targetId + '/' + myId).set({ modified: Date.now() });
  
  input.value = "";
  input.focus(); // Keypad context tracking retention lock
}

function processClearChat() {
  if(confirm("Purge all data frames residing inside this conversation channel node?")) {
      db.ref('chats/' + activeChatRoomId).remove();
      toggleMenuPopup('menuChat');
  }
}

async function processToggleBlock() {
  const blockDataReference = db.ref('blocks/' + myId + '/' + targetId);
  const snapshotNode = await blockDataReference.once('value');
  if (snapshotNode.exists()) blockDataReference.remove(); else blockDataReference.set(true);
  toggleMenuPopup('menuChat');
}

function loadRecentChatNodes() {
  const elementContainer = document.getElementById('recentChatsContainer');
  db.ref('userChats/' + myId).on('value', snap => {
      elementContainer.innerHTML = "";
      if(!snap.exists()) { 
          elementContainer.innerHTML = "<p style='text-align:center;color:#8696a0;padding:30px;font-size:14px;'>No interactive conversation history nodes discovered.</p>"; 
          return; 
      }
      snap.forEach(child => {
          const companionId = child.key;
          const letterToken = companionId.charAt(0).toUpperCase();
          const nodeRowDiv = document.createElement('div');
          nodeRowDiv.className = "chat-item";
          nodeRowDiv.innerHTML = `<div class="chat-avatar-circle">${letterToken}</div><strong>${companionId}</strong>`;
          nodeRowDiv.onclick = () => setupChatRoomParameters(companionId);
          elementContainer.appendChild(nodeRowDiv);
      });
  });
}

// --- ADVANCED WEBRTC DUAL AUDIO/VIDEO ENGINE CONTROLS LAYER ---
async function triggerMediaCall(videoOptionFlag) {
  isVideoCallMode = videoOptionFlag;
  
  const blockContextNode = await db.ref('blocks/' + myId + '/' + targetId).once('value');
  if (blockContextNode.exists()) return alert("Revoke profile isolation structure block constraint rule before initialization sequence execution.");

  // Inject record identifier string into history metrics
  db.ref('chats/' + activeChatRoomId).push({ 
    sender: myId, 
    text: isVideoCallMode ? "Video Call Log Session" : "Audio Call Log Session", 
    isCall: true, 
    timestamp: Date.now() 
  });
  
  document.getElementById('mediaTargetName').innerText = targetId;
  document.getElementById('mediaCallTimer').innerText = "Ringing Target Hub...";
  
  if(isVideoCallMode) {
      document.getElementById('videoViewportGrid').style.display = "block";
      document.getElementById('mediaAudioAvatar').style.display = "none";
  } else {
      document.getElementById('videoViewportGrid').style.display = "none";
      document.getElementById('mediaAudioAvatar').style.display = "flex";
  }
  
  navigate('scrCall');
  connectToneEngine.play().catch(()=>{});

  initializeHardwareStreamTracks();
}

function setupGlobalIncomingCallListener() {
  db.ref('calls').on('child_added', snap => {
      const incomingSessionId = snap.key;
      // Evaluate if current system context is a tracking path endpoint array member
      if (incomingSessionId.includes(localStorage.getItem('myId'))) {
          db.ref('calls/' + incomingSessionId).on('value', innerSnap => {
              const channelPayload = innerSnap.val();
              if (channelPayload && channelPayload.offer && channelPayload.sender !== localStorage.getItem('myId')) {
                  activeCallRoomId = incomingSessionId;
                  targetId = channelPayload.sender;
                  isVideoCallMode = channelPayload.isVideo;
                  
                  document.getElementById('incCallTargetName').innerText = targetId;
                  document.getElementById('incCallAvatar').innerText = targetId.charAt(0);
                  document.getElementById('incCallTypeLabel').innerText = isVideoCallMode ? "Incoming Encrypted Video Stream..." : "Incoming Encrypted Voice Stream...";
                  document.getElementById('overlayIncomingCall').style.display = "flex";
                  ringtoneEngine.play().catch(()=>{});
              }
          });
      }
  });
}

function processIncomingCallDecision(decisionActionFlag) {
  ringtoneEngine.pause(); ringtoneEngine.currentTime = 0;
  document.getElementById('overlayIncomingCall').style.display = "none";
  
  if (decisionActionFlag) {
      document.getElementById('mediaTargetName').innerText = targetId;
      document.getElementById('mediaCallTimer').innerText = "Negotiating Handshake connection...";
      if(isVideoCallMode) {
          document.getElementById('videoViewportGrid').style.display = "block";
          document.getElementById('mediaAudioAvatar').style.display = "none";
      } else {
          document.getElementById('videoViewportGrid').style.display = "none";
          document.getElementById('mediaAudioAvatar').style.display = "flex";
      }
      navigate('scrCall');
      initializeHardwareStreamTracks();
  } else {
      db.ref('calls/' + activeCallRoomId).remove();
  }
}

function initializeHardwareStreamTracks() {
  navigator.mediaDevices.getUserMedia({ video: isVideoCallMode, audio: true })
  .then(hardwareMediaStreamInstance => {
      localMediaStream = hardwareMediaStreamInstance;
      document.getElementById('viewLocalVideo').srcObject = hardwareMediaStreamInstance;
      
      peerConnection = new RTCPeerConnection(iceServersConfiguration);
      hardwareMediaStreamInstance.getTracks().forEach(track => peerConnection.addTrack(track, hardwareMediaStreamInstance));
      
      peerConnection.ontrack = event => {
          document.getElementById('viewRemoteVideo').srcObject = event.streams[0];
          executeCallConnectedTimerState();
      };

      peerConnection.onicecandidate = event => {
          if (event.candidate) {
              db.ref('calls/' + activeCallRoomId + '/candidates').push({ candidate: event.candidate.toJSON(), sender: myId });
          }
      };

      executeWebRTCSignalingHandshake();
  })
  .catch(err => {
      alert("Hardware execution failure anomaly: Media permissions access denied!");
      executeHangup();
  });
}

function executeWebRTCSignalingHandshake() {
  const sessionSignalDatabaseReference = db.ref('calls/' + activeCallRoomId);

  sessionSignalDatabaseReference.on('value', async snap => {
      const structuralPayload = snap.val();
      if (!structuralPayload) { executeHangup(); return; }

      if (structuralPayload.offer && structuralPayload.sender !== myId && peerConnection.signalingState !== "have-remote-offer" && peerConnection.signalingState !== "stable") {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(structuralPayload.offer));
          const sessionAnswerInstance = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(sessionAnswerInstance);
          sessionSignalDatabaseReference.update({ answer: sessionAnswerInstance, sender: myId });
      }
      if (structuralPayload.answer && structuralPayload.sender !== myId && peerConnection.signalingState !== "stable") {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(structuralPayload.answer));
      }
  });

  sessionSignalDatabaseReference.child('candidates').on('child_added', snap => {
      const remoteCandidateFrame = snap.val();
      if (remoteCandidateFrame.sender !== myId && remoteCandidateFrame.candidate) {
          peerConnection.addIceCandidate(new RTCIceCandidate(remoteCandidateFrame.candidate)).catch(()=>{});
      }
  });

  sessionSignalDatabaseReference.once('value', async snap => {
      if (!snap.exists() || !snap.val().offer) {
          const sessionOfferInstance = await peerConnection.createOffer();
          await peerConnection.setLocalDescription(sessionOfferInstance);
          sessionSignalDatabaseReference.set({ offer: sessionOfferInstance, sender: myId, isVideo: isVideoCallMode });
      }
  });
}

function executeCallConnectedTimerState() {
  connectToneEngine.pause(); connectToneEngine.currentTime = 0;
  const timeLabelElement = document.getElementById('mediaCallTimer');
  timeLabelElement.classList.add('timer-active');
  
  let dynamicSessionCounter = 0;
  if(callTimerInterval) clearInterval(callTimerInterval);
  callTimerInterval = setInterval(() => {
      dynamicSessionCounter++;
      let mathematicalMinutesFormat = String(Math.floor(dynamicSessionCounter / 60)).padStart(2, '0');
      let mathematicalSecondsFormat = String(dynamicSessionCounter % 60).padStart(2, '0');
      timeLabelElement.innerText = `${mathematicalMinutesFormat}:${mathematicalSecondsFormat}`;
  }, 1000);
}

function toggleLocalMute() {
  if (localMediaStream) {
      micMutedState = !micMutedState;
      localMediaStream.getAudioTracks()[0].enabled = !micMutedState;
      document.getElementById('btnMuteTrigger').style.background = micMutedState ? "#ff5b5b" : "#2a3942";
      document.getElementById('btnMuteTrigger').innerText = micMutedState ? "🔇" : "🎤";
  }
}

function executeHangup() {
  if(localMediaStream) localMediaStream.getTracks().forEach(trackInstance => trackInstance.stop());
  if(peerConnection) peerConnection.close();
  if(callTimerInterval) clearInterval(callTimerInterval);
  
  connectToneEngine.pause(); ringtoneEngine.pause();
  
  db.ref('calls/' + activeCallRoomId).off();
  db.ref('calls/' + activeCallRoomId).remove();
  
  // Wipe operational properties to default configuration memory boundaries
  localMediaStream = null; peerConnection = null; callTimerInterval = null;
  
  if(targetId) setupChatRoomParameters(targetId); else navigate('scrDashboard');
}

// Global Event Trigger Interceptors mapping configuration rules
document.getElementById('chatInputMessage').addEventListener("keypress", (e) => { if (e.key === "Enter") transmitMessage(); });
