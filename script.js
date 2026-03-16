const PREDEFINED_VALUES = [5, 10, 15, 20, 25];

// گۆڕینی ڕەنگی Hex بۆ RGB
function hexToRgb(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
        `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` 
        : '255, 255, 255';
}

let gameState = {
    isActive: false,
    players: {},
    isMuted: false
};

window.onload = function () {
    loadGameState();
};

function saveGameState() {
    for (let id in gameState.players) {
        const nameInput = document.getElementById(`name${id}`);
        if (nameInput) {
            gameState.players[id].name = nameInput.value;
        }
    }
    localStorage.setItem('dominoGameState', JSON.stringify(gameState));
}

function loadGameState() {
    const saved = localStorage.getItem('dominoGameState');
    if (saved) {
        gameState = JSON.parse(saved);
        
        updateMuteUI(); 
        
        if (gameState.isActive) {
            renderGameFromState();
            return;
        }
    } else {
        updateMuteUI();
    }
    
    document.getElementById('players').innerHTML = '';
    document.querySelector('.add-players').classList.remove('hidden');
    document.getElementById('gameControls').classList.add('hidden');
}

function renderGameFromState() {
    document.querySelector('.add-players').classList.add('hidden');
    document.getElementById('gameControls').classList.remove('hidden');
    const playersContainer = document.getElementById("players");
    playersContainer.innerHTML = '';

    for (let id in gameState.players) {
        const player = gameState.players[id];
        playersContainer.innerHTML += generatePlayerHTML(id, player.name);
    }

    for (let id in gameState.players) {
        const player = gameState.players[id];
        document.getElementById(`scoreInput${id}`).value = player.score;
        
        if (player.isMinus) {
            document.getElementById(`valBtns${id}`).classList.add('minus-active');
            document.getElementById(`toggleMode${id}`).textContent = 'گەڕانەوە (+)';
            document.getElementById(`toggleMode${id}`).classList.add('active');
        }
        
        updateTotalDisplay(id);
        renderHistory(id);
    }
}

function addPlayers(count) {
    gameState.isActive = true;
    gameState.players = {};
    
    const playersContainer = document.getElementById("players");
    playersContainer.innerHTML = '';

    for (let i = 1; i <= count; i++) {
        const id = i;
        gameState.players[id] = { name: "", score: 0, history: [], isMinus: false };
        playersContainer.innerHTML += generatePlayerHTML(id, "");
        
        setTimeout(() => {
            const playerElement = document.getElementById(`player-${id}`);
            if (playerElement) playerElement.classList.add('added');
        }, 100);
    }

    document.getElementById('gameControls').classList.remove('hidden');
    document.querySelector('.add-players').classList.add('hidden');
    saveGameState();
}

function generatePlayerHTML(id, name) {
    const player = gameState.players[id];
    // ڕەنگە بنەڕەتییەکان: یاریزانی دووەم بە شین دەست پێدەکات، ئەوانی تر بە ڕەنگی ئاڵتوونی
    const themeHex = player.themeHex || (id === 2 ? '#00bfff' : '#d4af37');
    const themeRgb = hexToRgb(themeHex);
    
    return `
        <div class="player-section" id="player-${id}" style="--theme-rgb: ${themeRgb};">
            <div class="player-header">
                <h3>یاریزانی ${id}</h3>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <input type="color" id="themeColor${id}" value="${themeHex}" oninput="updateCardTheme(${id})" class="theme-color-picker" title="گۆڕینی ڕەنگی کارت">
                    <button class="minus-toggle" id="toggleMode${id}" onclick="toggleScoreMode(${id})">کەمکردنەوە (-)</button>
                </div>
            </div>
            
            <div class="score-input">
                <input type="text" id="name${id}" value="${name}" placeholder="ناوی یاریزان" oninput="saveGameState()">
            </div>
            
            <div class="value-buttons" id="valBtns${id}">
                ${PREDEFINED_VALUES.map(val => `
                    <button type="button" value="${val}" onclick="addScore(${id}, ${val})">
                        ${val}
                    </button>
                `).join('')}
            </div>
            <div class="total" id="total${id}">کۆی گشتی: 0</div>
            <input type="hidden" id="scoreInput${id}" value="0">
            
            <div class="history-log" id="history${id}"></div>
        </div>
    `;
}

function updateCardTheme(id) {
    const hex = document.getElementById(`themeColor${id}`).value;
    const rgb = hexToRgb(hex);
    
    const playerEl = document.getElementById(`player-${id}`);
    playerEl.style.setProperty('--theme-rgb', rgb);
    
    // خەزنکردنی ڕەنگەکە بۆ ئەوەی لەکاتی ڕیفرێش نەفەوتێت
    if(!gameState.players[id]) gameState.players[id] = {};
    gameState.players[id].themeHex = hex;
    saveGameState();
}

function updateCardColors(id) {
    const bgColor = document.getElementById(`bgColor${id}`).value;
    const lightColor = document.getElementById(`lightColor${id}`).value;
    
    const playerEl = document.getElementById(`player-${id}`);
    playerEl.style.setProperty('--card-bg-color', bgColor);
    playerEl.style.setProperty('--light-color', lightColor);
    
    // خەزنکردنی ڕەنگەکان لە gameState
    gameState.players[id].bgColor = bgColor;
    gameState.players[id].lightColor = lightColor;
    saveGameState();
}

function toggleScoreMode(id) {
    const player = gameState.players[id];
    player.isMinus = !player.isMinus;
    
    const btnContainer = document.getElementById(`valBtns${id}`);
    const toggleBtn = document.getElementById(`toggleMode${id}`);
    
    if (player.isMinus) {
        btnContainer.classList.add('minus-active');
        toggleBtn.textContent = 'گەڕانەوە (+)';
        toggleBtn.classList.add('active');
    } else {
        btnContainer.classList.remove('minus-active');
        toggleBtn.textContent = 'کەمکردنەوە (-)';
        toggleBtn.classList.remove('active');
    }
    saveGameState();
}

function addScore(playerId, value) {
    const player = gameState.players[playerId];
    const isReducing = player.isMinus; // ذخیره وضعیت کاهش امتیاز
    const finalValue = isReducing ? -value : value;
    
    player.score += finalValue;
    player.history.push(finalValue);
    
    const input = document.getElementById(`scoreInput${playerId}`);
    if (input) input.value = player.score;
    
    updateTotalDisplay(playerId);
    renderHistory(playerId);
    
    if (isReducing) {
        toggleScoreMode(playerId);
    } else {
        saveGameState(); 
    }

    // شرط جدید: فقط در صورتی که در حال کم کردن امتیاز نباشیم صدا پخش شود
    if (!isReducing && !gameState.isMuted) {
        let soundFile = '';
        switch (value) {
            case 5: soundFile = 'sound1.mp3'; break;
            case 10: soundFile = 'sound2.mp3'; break;
            case 15: soundFile = 'sound3.mp3'; break;
            case 20: soundFile = 'sound4.mp3'; break;
            case 25: soundFile = 'sound5.mp3'; break;
        }

        if (soundFile !== '') {
            const audio = new Audio(soundFile);
            audio.play().catch(e => console.log("خطا در پخش صدا:", e));
        }
    }
}

function renderHistory(id) {
    const container = document.getElementById(`history${id}`);
    if (!container) return;
    
    const player = gameState.players[id];
    let html = '';
    
    player.history.forEach(val => {
        const cssClass = val < 0 ? 'minus' : 'plus';
        const sign = val > 0 ? '+' : '';
        html += `<span class="history-item ${cssClass}">${sign}${val}</span>`;
    });
    
    container.innerHTML = html;
    container.scrollLeft = container.scrollWidth;
}

function updateTotalDisplay(playerId) {
    const input = document.getElementById(`scoreInput${playerId}`);
    if (!input) return;
    
    const current = parseInt(input.value) || 0;
    const totalElement = document.getElementById(`total${playerId}`);
    
    if (totalElement) {
        totalElement.textContent = `کۆی گشتی: ${current}`;
        totalElement.classList.add('animate');
        
        setTimeout(() => {
            totalElement.classList.remove('animate');
        }, 600);
    }
}

function resetGame() {
    localStorage.removeItem('dominoGameState');
    gameState = { isActive: false, players: {} };
    
    document.getElementById('gameControls').classList.add('hidden');
    document.getElementById('finalResults').classList.add('hidden');
    document.getElementById('players').innerHTML = '';
    
    document.querySelector('.add-players').classList.remove('hidden');
}

// پیشاندانی پەنجەرەی دڵنیابوونەوە
function finishGame() {
    document.getElementById('finishModal').classList.remove('hidden');
}

// داخستنی پەنجەرەی دڵنیابوونەوە
function closeFinishModal() {
    document.getElementById('finishModal').classList.add('hidden');
}

// کاتێک پەنجەی نا بە "بەڵێ، یارییەکە تەواو"
function confirmFinishGame() {
    // پەنجەرەکە لادەبەین
    closeFinishModal();

    const allButtons = document.querySelectorAll('.value-buttons button, .minus-toggle');
    allButtons.forEach(btn => btn.disabled = true);

    let highestScore = -Infinity;
    let playersArr = [];
    
    // کۆکردنەوەی خاڵەکان و زانیارییەکان
    for (let id in gameState.players) {
        const player = gameState.players[id];
        const nameInput = document.getElementById(`name${id}`);
        const name = nameInput?.value || `یاریزان ${id}`;
        
        if (player.score > highestScore) {
            highestScore = player.score;
        }
        
        playersArr.push({
            name: name,
            score: player.score,
            history: player.history
        });
    }
    
    // کات و بەروار
    const now = new Date();
    const dateString = now.toLocaleDateString('en-GB') + ' - ' + now.toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'});

    // داتای یارییەکە
    const gameRecord = {
        date: dateString,
        timestamp: window.db ? firebase.firestore.FieldValue.serverTimestamp() : new Date(),
        players: playersArr,
        highestScore: highestScore
    };
    
    // ناردنی بۆ فایربەیس
    if(window.db) {
        window.db.collection("games_archive").add(gameRecord).then(() => {
            localStorage.removeItem('dominoGameState');
            // چوونە ناو پەڕەی ئەرشیف ڕاستەوخۆ بێ ئەوەی ئالێرت پیشان بدات
            window.location.href = 'archive.html';
        }).catch((error) => {
            console.error("هەڵە هەیە:", error);
            alert("کێشەیەک ڕوویدا لە خەزنکردنی یارییەکە. دڵنیابەرەوە لە ئینتەرنێتەکەت.");
        });
    } else {
        alert("فایربەیس نەبەستراوەتەوە بە باشی.");
    }
}

function showFinalResults() {
    const resultsContainer = document.getElementById('finalResults');
    if (!resultsContainer) return;
    
    resultsContainer.innerHTML = '';
    resultsContainer.classList.remove('hidden');
    
    let playersArr = [];
    for (let id in gameState.players) {
        const player = gameState.players[id];
        const nameInput = document.getElementById(`name${id}`);
        const name = nameInput?.value || `یاریزان ${id}`;
        playersArr.push({ name, score: player.score });
    }

    playersArr.sort((a, b) => b.score - a.score);

    let html = `
        <h3>ئەنجامی کۆتایی</h3>
        <table>
            <thead>
                <tr>
                    <th>یاریزانان</th>
                    <th>خاڵەکانی</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    playersArr.forEach(p => {
        html += `
            <tr>
                <td>${p.name}</td>
                <td>${p.score}</td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;

    resultsContainer.innerHTML = html;
}

function toggleMute() {
    gameState.isMuted = !gameState.isMuted;
    updateMuteUI();
    saveGameState();
}

function updateMuteUI() {
    const btn = document.getElementById('muteBtn');
    if (!btn) return;
    
    if (gameState.isMuted) {
        btn.innerHTML = '<i class="fas fa-volume-mute"></i>';
        btn.classList.add('muted');
    } else {
        btn.innerHTML = '<i class="fas fa-volume-up"></i>';
        btn.classList.remove('muted');
    }
}

var noSleep = new NoSleep();
var isAwake = false;

document.addEventListener('click', function enableNoSleep() {
    if (!isAwake) {
        noSleep.enable();
        isAwake = true;
        console.log("سیستەمی NoSleep چالاک بوو، شاشەکە ناکوژێتەوە");
        document.removeEventListener('click', enableNoSleep, false);
    }
}, false);

// خستنەگەڕی Service Worker و چاودێریکردنی ڤێرژنی نوێ
// خستنەگەڕی Service Worker بە شێوەیەکی ڕاست و دروست
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // لێرە کاتە گۆڕاوەکەمان لابرد و تەنها ناوی فایلەکەمان هێشتەوە
        navigator.serviceWorker.register('./sw.js').then(reg => {
            
            reg.onupdatefound = () => {
                const installingWorker = reg.installing;
                installingWorker.onstatechange = () => {
                    // تەنها ئەگەر ڤێرژنێکی نوێ هەبوو و پێشتر دانەیەک مۆدێل کرابوو ڕیفرێش بکات
                    if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        console.log('ڤێرژنێکی نوێ دۆزرایەوە! پەڕەکە نوێ دەبێتەوە...');
                        window.location.reload();
                    }
                };
            };
        }).catch(err => console.log('کێشە لە Service Worker:', err));
    });
}