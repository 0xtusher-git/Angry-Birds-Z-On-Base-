/* ═══════════════════════════════════════════
   LEADERBOARD SYSTEM — leaderboard.js
   ═══════════════════════════════════════════ */

const Leaderboard = {
  storageKey: 'abz_leaderboard',
  
  mockData: [],

  init() {
    const existing = localStorage.getItem(this.storageKey);
    if (!existing || existing.includes('Vitalik.eth')) {
      localStorage.setItem(this.storageKey, JSON.stringify([]));
    }
  },

  getScores() {
    return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
  },

  submitScore(name, score, level) {
    let scores = this.getScores();
    
    // Find if user already has a score
    const existingIdx = scores.findIndex(s => s.name === name);
    
    if (existingIdx !== -1) {
      // Only update if the new score is higher
      if (score > scores[existingIdx].score) {
        scores[existingIdx].score = score;
        scores[existingIdx].level = level;
        scores[existingIdx].ts = Date.now();
      }
    } else {
      // Add new player entry
      scores.push({ name, score, level, ts: Date.now(), isUser: true });
    }
    
    // Sort by score descending
    scores.sort((a, b) => b.score - a.score);
    // Keep top 100 unique players
    scores = scores.slice(0, 100);
    
    localStorage.setItem(this.storageKey, JSON.stringify(scores));
    
    // IMPORTANT: For true global sync across all users, 
    // a backend (Firebase/Supabase) is required here.
    // this.syncWithGlobal(name, score, level); 
  },

  render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const scores = this.getScores();
    container.innerHTML = `
      <div class="lb-header">
        <span>Rank</span>
        <span>Player</span>
        <span>Level</span>
        <span>Score</span>
      </div>
      <div class="lb-list">
        ${scores.length === 0 ? '<div class="lb-empty">Waiting for the first Champion...</div>' : 
          scores.map((s, i) => `
            <div class="lb-row ${s.isUser ? 'user-row' : ''}">
              <span class="lb-rank">${i + 1}</span>
              <span class="lb-name">${s.name}</span>
              <span class="lb-level">Lvl ${s.level}</span>
              <span class="lb-score">${s.score.toLocaleString()}</span>
            </div>
          `).join('')
        }
      </div>
    `;
  }
};

Leaderboard.init();
