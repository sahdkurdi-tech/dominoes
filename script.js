const PREDEFINED_VALUES = [5, 10, 15, 20, 25];

let gameState = {
    isActive: false,
    players: {},
    isMuted: false // ئەمەمان زیادکرد
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
        
        // ڕاستەوخۆ دوای هێنانەوەی داتاکان، ڕەنگی دوگمەی دەنگەکە ڕێکدەخەینەوە
        updateMuteUI(); 
        
        if (gameState.isActive) {
            renderGameFromState();
            return;
        }
    } else {
        // ئەگەر یەکەم جار بوو بکرێتەوە، با دۆخی دەنگەکە هەر ڕێکبخات
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
    return `
        <div class="player-section" id="player-${id}">
            <div class="player-header">
                <h3>یاریزانی ${id}</h3>
                <button class="minus-toggle" id="toggleMode${id}" onclick="toggleScoreMode(${id})">کەمکردنەوە (-)</button>
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
    const finalValue = player.isMinus ? -value : value;
    
    player.score += finalValue;
    player.history.push(finalValue);
    
    const input = document.getElementById(`scoreInput${playerId}`);
    if (input) input.value = player.score;
    
    updateTotalDisplay(playerId);
    renderHistory(playerId);
    
    if (player.isMinus) {
        toggleScoreMode(playerId);
    } else {
        saveGameState(); 
    }

    let soundFile = '';
    switch (value) {
        case 5: soundFile = 'sound1.mp3'; break;
        case 10: soundFile = 'sound2.mp3'; break;
        case 15: soundFile = 'sound3.mp3'; break;
        case 20: soundFile = 'sound4.mp3'; break;
        case 25: soundFile = 'sound5.mp3'; break;
    }

// تەنها ئەگەر میوت نەبوو دەنگەکە لێدەدات
    if (soundFile !== '' && !gameState.isMuted) {
        const audio = new Audio(soundFile);
        audio.play().catch(e => console.log("کێشەی دەنگ:", e));
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

function finishGame() {
    const confirmation = confirm("دەتەوێت ئێستا یارییەکە تەواو بکەیت؟");
    if (!confirmation) return;

    const allButtons = document.querySelectorAll('.value-buttons button, .minus-toggle');
    allButtons.forEach(btn => btn.disabled = true);

    showFinalResults();

    // دۆزینەوەی براوە (ئەو کەسەی زۆرترین خاڵی هەیە) لە کاتی کۆتایی پێهێناندا
    let highestScore = -Infinity;
    let winners = [];
    
    for (let id in gameState.players) {
        const player = gameState.players[id];
        if (player.score > highestScore) {
            highestScore = player.score;
        }
    }

    // پشکنین بۆ ئەوەی بزانین ئایا یەک کەسە یان چەند کەسێک یەکسانن
    for (let id in gameState.players) {
        const player = gameState.players[id];
        const nameInput = document.getElementById(`name${id}`);
        const name = nameInput?.value || `یاریزان ${id}`;
        if (player.score === highestScore) {
            winners.push(name);
        }
    }

    if (winners.length > 1) {
        alert(`🤝 یارییەکە بە یەکسانبوون کۆتایی هات لە نێوان: ${winners.join(' و ')} بە (${highestScore}) خاڵ!`);
    } else if (winners.length === 1) {
        alert(`🎉 پیرۆزە! براوەی یارییەکە بریتییە لە: ${winners[0]} بە کۆکردنەوەی (${highestScore}) خاڵ!`);
    }
    
    localStorage.removeItem('dominoGameState');
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

// خستنەگەڕی Service Worker بۆ ئەوەی وەک ئەپ کاربکات
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('سیستەمی PWA چالاک بوو.'))
            .catch(err => console.log('کێشە لە چالاککردنی PWA:', err));
    });
}