
const NUM_SIMULATIONS = 100000;

function simulate() {
  const gender = Math.random() < 0.5 ? "K" : "E";
  let stats = {
    health: Math.floor(Math.random() * 31) + 70,
    resilience: Math.floor(Math.random() * 41) + 50,
    success: Math.floor(Math.random() * 21) + 10,
    talent: Math.floor(Math.random() * 21) + 20,
    lynchCount: 0,
    vocalMinigameCount: 0,
    danceMinigameCount: 0
  };

  let fanCount = 0;
  let lynchInteractions = 0;
  let positiveRepliesCount = 0;
  let consecutiveLynchFails = 0;
  let level = 1;
  let tasksCompletedInLevel = 0;

  function applyStatChanges(changes) {
    stats.health = Math.max(0, Math.min(100, stats.health + (changes.health || 0)));
    stats.resilience = Math.max(0, Math.min(100, stats.resilience + (changes.resilience || 0)));
    stats.success = Math.max(0, Math.min(100, stats.success + (changes.success || 0)));
    stats.talent = Math.max(0, Math.min(100, stats.talent + (changes.talent || 0)));
  }

  while (level <= 4) {
    while (tasksCompletedInLevel < 4) {
      let lynchChance = Math.min(0.2, 0.05 + level * 0.03);
      if (stats.resilience < 30 || stats.health < 30) lynchChance = Math.min(0.35, lynchChance + 0.15);
      else if (stats.success > 80) lynchChance = Math.min(0.3, lynchChance + 0.1);

      if (Math.random() < lynchChance) {
        stats.lynchCount++;
        applyStatChanges({ resilience: -15, health: -5 });
        let choice = Math.random();
        lynchInteractions++;
        if (choice < 0.33) { // insult
          consecutiveLynchFails++;
          if (consecutiveLynchFails >= 4 || stats.resilience < 15) {
            return `SCANDAL_VICTIM${gender === "K" ? "_F" : ""}`;
          }
          applyStatChanges({ resilience: -15, success: -20 });
          fanCount = Math.max(0, fanCount - 200);
        } else {
          consecutiveLynchFails = 0;
          if (choice < 0.66) { // self_compassion
             applyStatChanges({ resilience: 20 });
             fanCount += Math.floor(stats.resilience / 10) * 50 * level;
          } else { // ignore
             fanCount += Math.floor(stats.resilience / 10) * 50 * level;
          }
          positiveRepliesCount++;
        }
      } else {
        let isMinigame = Math.random() < 0.4;
        if (isMinigame) {
          let win = Math.random() < 0.7;
          if (win) {
            applyStatChanges({ success: 10, talent: 15, health: -5, resilience: -5 });
            stats.vocalMinigameCount++;
          } else {
            applyStatChanges({ health: -15, talent: -5, resilience: -10 });
          }
        } else {
          let choice = Math.random() < 0.5;
          if (choice) applyStatChanges({ success: 15, resilience: -10 });
          else applyStatChanges({ resilience: 15, success: -2 });
        }
      }
      tasksCompletedInLevel++;
      fanCount += Math.floor(stats.success / 10) * 20 * level;
    }

    const reqPoints = 20 + level * 8;
    if (stats.success >= 80 && stats.health < 20 && stats.resilience < 20) {
        return `CONTRACT_PRISON${gender === "K" ? "_F" : ""}`;
    }
    
    if (stats.health <= 0 || stats.resilience <= 0 || stats.success <= 0 || stats.talent <= 0) {
        const reason = stats.health <= 0 ? "LOSER_HEALTH" : 
                      stats.resilience <= 0 ? "LOSER_MIND" : 
                      stats.success <= 0 ? "LOSER_SUCCESS" : "LOSER_TALENT";
        return `${reason}${gender === "K" ? "_F" : ""}`;
    }

    if (level === 4) {
      let ending = "GROUP_MEMBER";
      if (stats.success < reqPoints) {
        if (fanCount > 20000 && (lynchInteractions >= 2 || positiveRepliesCount >= 4)) {
          ending = "FAN_PHENOMENON";
        } else if (stats.talent > 60) {
          ending = "SOLO_CAREER";
        } else if (stats.success < 45 && stats.lynchCount <= 1) {
          ending = "QUIET_RETIREMENT";
        } else if (stats.resilience < 30 && stats.talent <= 50) {
          ending = "RETIREMENT";
        } else {
          ending = "INFLUENCER";
        }
      } else {
        if (fanCount > 80000) {
          ending = "INTERNATIONAL";
        } else if (stats.resilience < 35) {
          ending = "SOLO_CAREER";
        } else if (stats.health < 35) {
          ending = "RETIREMENT";
        } else if (stats.talent < 50) {
          ending = "INFLUENCER";
        } else {
          ending = "GROUP_MEMBER";
        }
      }
      return `${ending}${gender === "K" ? "_F" : ""}`;
    }

    if (stats.success >= reqPoints) {
      applyStatChanges({ health: -5, resilience: 10, success: 15 });
      fanCount += stats.success * 100 * level;
    } else {
      applyStatChanges({ health: -5, resilience: -10, success: -15 });
      fanCount = Math.floor(fanCount * 0.8);
    }
    level++;
    tasksCompletedInLevel = 0;
  }
  return `LOSER_DEFAULT${gender === "K" ? "_F" : ""}`;
}

const results = {};
for (let i = 0; i < NUM_SIMULATIONS; i++) {
  const res = simulate();
  results[res] = (results[res] || 0) + 1;
}

console.log("Final Diverse Ending Probabilities:");
const sorted = Object.entries(results).sort(([, a], [, b]) => b - a);
for (const [key, val] of sorted) {
  console.log(`${key}: ${(val / NUM_SIMULATIONS * 100).toFixed(2)}%`);
}
