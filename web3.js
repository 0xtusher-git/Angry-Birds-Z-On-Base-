/* ═══════════════════════════════════════════
   WEB3 PAYMENT — web3.js
   ═══════════════════════════════════════════ */

const TREASURY = '0xCcD7569F3197cd74116D01433E6e7673b6dcF30F';
const BASE_CHAIN_ID = 8453;
const BASE_CHAIN_HEX = '0x2105';
const PLAY_COST_WEI = '1000000000000'; // 0.000001 ETH
const SESSION_KEY = 'abz_session';
const LAST_ACTIVE_KEY = 'abz_last_active';
const MAX_IDLE_TIME = 5 * 60 * 1000; // 5 minutes in ms
const UNLOCKED_LEVELS_KEY = 'abz_unlocked_levels';
const USERNAME_KEY = 'abz_username';

let provider = null;
let signer = null;

function shortAddr(addr) {
  return addr.slice(0, 6) + '…' + addr.slice(-4);
}

function showGateStep(id) {
  document.querySelectorAll('.gate-step').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function showGateError(msg) {
  const el = document.getElementById('gate-error');
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 6000);
}

async function connectWallet() {
  const btn = document.getElementById('btn-connect');
  btn.disabled = true;
  btn.textContent = 'Connecting…';
  try {
    if (!window.ethereum) throw new Error('Web3 wallet not detected. Please use a Web3-enabled browser (like Coinbase Wallet).');
    provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send('eth_requestAccounts', []);
    signer = await provider.getSigner();
    const addr = await signer.getAddress();
    const network = await provider.getNetwork();
    document.getElementById('wallet-address').textContent = shortAddr(addr);
    if (Number(network.chainId) !== BASE_CHAIN_ID) {
      await switchToBase();
    }
    showGateStep('step-pay');
  } catch (e) {
    showGateError(e.message || 'Connection failed');
    btn.disabled = false;
    btn.innerHTML = '<span class="btn-icon">🔵</span> Connect Wallet';
  }
}

async function switchToBase() {
  try {
    await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: BASE_CHAIN_HEX }] });
  } catch (switchErr) {
    if (switchErr.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: BASE_CHAIN_HEX, chainName: 'Base',
          nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
          rpcUrls: ['https://mainnet.base.org'],
          blockExplorerUrls: ['https://basescan.org']
        }]
      });
    } else throw switchErr;
  }
}

async function payToPlay(levelIdx = null) {
  // Bypass for local testing
  if (localStorage.getItem('abz_debug') === 'true') {
    // Manually trigger success flow
    const session = { txHash: 'local_debug_' + Date.now(), ts: Date.now() };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    if (levelIdx !== null) {
      const unlocked = JSON.parse(localStorage.getItem(UNLOCKED_LEVELS_KEY) || '[]');
      if (!unlocked.includes(levelIdx)) {
        unlocked.push(levelIdx);
        localStorage.setItem(UNLOCKED_LEVELS_KEY, JSON.stringify(unlocked));
      }
    }
    updateLastActive();
    showGateStep('step-unlocked');
    const playBtn = document.querySelector('#step-unlocked .btn-play');
    if (levelIdx !== null) {
      playBtn.textContent = `🎮 Start Level ${levelIdx + 1}!`;
      playBtn.onclick = () => {
        document.getElementById('wallet-gate').classList.remove('active');
        document.getElementById('game-container').style.display = 'block'; 
        loadLevel(levelIdx);
      };
    } else {
      playBtn.textContent = '🎮 Continue to Game';
      playBtn.onclick = checkRegistration;
    }
    return;
  }

  const btn = document.getElementById('btn-pay');
  btn.disabled = true;
  document.getElementById('gate-error').style.display = 'none';
  try {
    if (!signer) throw new Error('Wallet not connected');
    const network = await provider.getNetwork();
    if (Number(network.chainId) !== BASE_CHAIN_ID) {
      await switchToBase();
      provider = new ethers.BrowserProvider(window.ethereum);
      signer = await provider.getSigner();
    }
    const balance = await provider.getBalance(await signer.getAddress());
    if (balance < BigInt(PLAY_COST_WEI)) throw new Error('Insufficient ETH balance on Base Mainnet');

    showGateStep('step-confirming');

    // Add level info to tx data if unlocking a specific level
    const memo = levelIdx !== null ? `Unlock Level ${levelIdx + 1}` : 'Play Session';
    const tx = await signer.sendTransaction({
      to: TREASURY, 
      value: BigInt(PLAY_COST_WEI),
      data: ethers.hexlify(ethers.toUtf8Bytes('bc_rato96t7_' + memo))
    });

    const txLink = 'https://basescan.org/tx/' + tx.hash;
    document.getElementById('tx-link').href = txLink;
    document.getElementById('tx-hash-preview').style.display = 'block';

    const receipt = await tx.wait(1);
    if (!receipt || receipt.status === 0) throw new Error('Transaction failed on-chain');

    // Save session
    const session = { txHash: tx.hash, ts: Date.now() };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    
    // Track unlocked level
    if (levelIdx !== null) {
      const unlocked = JSON.parse(localStorage.getItem(UNLOCKED_LEVELS_KEY) || '[]');
      if (!unlocked.includes(levelIdx)) {
        unlocked.push(levelIdx);
        localStorage.setItem(UNLOCKED_LEVELS_KEY, JSON.stringify(unlocked));
      }
    }
    
    updateLastActive();

    document.getElementById('tx-link-final').href = txLink;
    document.getElementById('tx-link-final').textContent = shortTx(tx.hash) + ' → Basescan';
    showGateStep('step-unlocked');
    
    // Auto-update home leaderboard after payment
    Leaderboard.render('home-leaderboard-container');

    // Update play button
    const playBtn = document.querySelector('#step-unlocked .btn-play');
    if (levelIdx !== null) {
      playBtn.textContent = `🎮 Start Level ${levelIdx + 1}!`;
      playBtn.onclick = () => {
        document.getElementById('wallet-gate').classList.remove('active');
        document.getElementById('game-container').style.display = 'block'; 
        loadLevel(levelIdx);
      };
    } else {
      playBtn.textContent = '🎮 Continue to Game';
      playBtn.onclick = checkRegistration;
    }

  } catch (e) {
    showGateStep('step-pay');
    btn.disabled = false;
    if (e.code === 4001 || e.code === 'ACTION_REJECTED') {
      showGateError('Transaction rejected by user.');
    } else {
      showGateError(e.message || 'Payment failed');
    }
  }
}

function isLevelUnlocked(idx) {
  // To make it truly "pay every level", even Level 1 could require payment.
  // But usually Level 1 is free to try. Let's keep Level 1 free as a hook.
  if (idx === 0) return true; 
  
  const unlocked = JSON.parse(localStorage.getItem(UNLOCKED_LEVELS_KEY) || '[]');
  return unlocked.includes(idx);
}

async function showLevelPaymentGate(levelIdx) {
  const gate = document.getElementById('wallet-gate');
  gate.classList.add('active');
  Leaderboard.render('home-leaderboard-container'); // Refresh leaderboard on gate show
  
  // Reset steps
  document.querySelectorAll('.gate-step').forEach(s => s.classList.remove('active'));
  
  const priceDesc = document.querySelector('.price-usd');
  if (priceDesc) priceDesc.textContent = `to unlock Level ${levelIdx + 1}`;
  
  const payBtn = document.getElementById('btn-pay');
  payBtn.onclick = () => payToPlay(levelIdx);
  
  // Try to reconnect signer if null
  if (!signer && window.ethereum) {
    try {
      provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();
      if (accounts.length > 0) {
        signer = await provider.getSigner();
        const addr = await signer.getAddress();
        document.getElementById('wallet-address').textContent = shortAddr(addr);
      }
    } catch (e) { console.warn('Auto-reconnect failed', e); }
  }

  if (signer) {
    showGateStep('step-pay');
  } else {
    showGateStep('step-connect');
  }
}

function resetAllProgress() {
  localStorage.removeItem(UNLOCKED_LEVELS_KEY);
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(LAST_ACTIVE_KEY);
  localStorage.removeItem(USERNAME_KEY);
  location.reload();
}

function checkRegistration() {
  const name = localStorage.getItem(USERNAME_KEY);
  if (!name) {
    showGateStep('step-register');
  } else {
    startGame();
  }
}

function useLocalTesting() {
  localStorage.setItem('abz_debug', 'true');
  localStorage.setItem(SESSION_KEY, JSON.stringify({ txHash: 'local_debug', ts: Date.now() }));
  startGame();
}

function registerUser() {
  const input = document.getElementById('reg-username');
  const name = input.value.trim();
  if (!name) {
    showGateError('Please enter a username');
    return;
  }
  localStorage.setItem(USERNAME_KEY, name);
  startGame();
}

function shortTx(hash) { return hash.slice(0, 10) + '…' + hash.slice(-6); }

function checkExistingSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return false;
  try {
    const s = JSON.parse(raw);
    if (!s.txHash) return false;

    // Check idle time
    const lastActive = parseInt(localStorage.getItem(LAST_ACTIVE_KEY) || '0');
    if (lastActive > 0 && (Date.now() - lastActive > MAX_IDLE_TIME)) {
      console.log('Session expired due to inactivity');
      clearSession();
      return false;
    }

    // Refresh last active on check
    updateLastActive();
    return true;
  } catch { return false; }
}

function updateLastActive() {
  localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
}

function clearSession() { 
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(LAST_ACTIVE_KEY);
}

function showPaymentGate() {
  document.getElementById('wallet-gate').classList.add('active');
  document.getElementById('game-container').style.display = 'none';
  showGateStep('step-connect');
}

function startGame() {
  document.getElementById('wallet-gate').classList.remove('active');
  document.getElementById('game-container').style.display = 'block';
  initGame();
}

function retryOrPay() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (raw) {
    // Already paid this session — just retry level
    restartLevel();
    document.getElementById('screen-gameover').style.display = 'none';
  } else {
    showPaymentGate();
  }
}

// On load: check if already paid or debug mode
window.addEventListener('DOMContentLoaded', () => {
  Leaderboard.render('home-leaderboard-container'); // Initial render
  
  if (checkExistingSession()) {
    showGateStep('step-unlocked');
    document.getElementById('btn-pay') && (document.getElementById('btn-pay').disabled = false);
    const unlocked = document.getElementById('step-unlocked');
    const payBtn = unlocked.querySelector('.btn-play');
    if (payBtn) payBtn.textContent = '🎮 Continue Playing!';
    const txFinal = document.getElementById('tx-link-final');
    try {
      const s = JSON.parse(localStorage.getItem(SESSION_KEY));
      txFinal.href = 'https://basescan.org/tx/' + s.txHash;
      txFinal.textContent = shortTx(s.txHash) + ' → Basescan';
    } catch {}
    showGateStep('step-unlocked');
  }

  // Continuous activity tracking
  setInterval(() => {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) updateLastActive();
  }, 10000); // every 10s

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      // Re-check session on return
      if (!checkExistingSession() && !document.getElementById('wallet-gate').classList.contains('active')) {
        location.reload(); // Force payment gate if expired while away
      }
    } else {
      updateLastActive();
    }
  });
});
