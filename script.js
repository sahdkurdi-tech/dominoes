const PREDEFINED_VALUES = [5, 10, 15, 20, 25];

let currentPlayerId = 1;

window.onload = function () {
    document.getElementById('players').innerHTML = '';
    
    // إظهار قسم إضافة اللاعبين عند التحميل
    document.querySelector('.add-players').classList.remove('hidden');
};

// وەرگرتنی ژمارەی یاریزانەکان ڕاستەوخۆ لە دوگمەکانەوە
function addPlayers(count) {
    const playersContainer = document.getElementById("players");
    playersContainer.innerHTML = '';

    for (let i = 1; i <= count; i++) {
        const id = currentPlayerId++;
        const playerHTML = `
            <div class="player-section" id="player-${id}">
                <h3>یاریزانی ${id}</h3>
                <div class="score-input">
                    <label for="name${id}">ناوی یاریزان:</label>
                    <input type="text" id="name${id}" placeholder="ناوەکەی بنووسە">
                </div>
                <div class="value-buttons">
                    ${PREDEFINED_VALUES.map(val => `
                        <button type="button" value="${val}" onclick="addScore(${id}, ${val})">
                            ${val}
                        </button>
                    `).join('')}
                </div>
                <div class="total" id="total${id}">کۆی گشتی: 0</div>
                <input type="hidden" id="scoreInput${id}" value="0">
            </div>
        `;
        playersContainer.innerHTML += playerHTML;
        
        // إضافة تأثير ظهور اللاعب
        setTimeout(() => {
            const playerElement = document.getElementById(`player-${id}`);
            if (playerElement) playerElement.classList.add('added');
        }, 100);
    }

    // إظهار أزرار التحكم
    document.getElementById('gameControls').classList.remove('hidden');
    
    // إخفاء قسم إضافة اللاعبين بعد بدء اللعبة
    document.querySelector('.add-players').classList.add('hidden');
    
    currentPlayerId = 1;
}

// زیادکردنی ڕاستەوخۆی خاڵەکان بەبێ پرسیارکردن
function addScore(playerId, value) {
    addToScore(playerId, value);
}

function addToScore(playerId, value) {
    const input = document.getElementById(`scoreInput${playerId}`);
    if (!input) return;
    
    const current = parseInt(input.value) || 0;
    input.value = current + value;
    
    updateTotalDisplay(playerId);
    
    // لێرەدا دەنگەکان جیا دەکەینەوە بەپێی ئەو بەهایەی زیاد کراوە
    let soundFile = '';
    switch (value) {
        case 5:
            soundFile = 'sound1.mp3';
            break;
        case 10:
            soundFile = 'sound2.mp3';
            break;
        case 15:
            soundFile = 'sound3.mp3';
            break;
        case 20:
            soundFile = 'sound4.mp3';
            break;
        case 25:
            soundFile = 'sound5.mp3';
            break;
    }

    // ئەگەر فایلەکە دیاری کرابوو، لێی بدە
    if (soundFile !== '') {
        const audio = new Audio(soundFile);
        audio.play().catch(e => console.log("کێشەیەک هەیە لە لێدانی دەنگەکە:", e));
    }
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
    document.getElementById('gameControls').classList.add('hidden');
    document.getElementById('finalResults').classList.add('hidden');
    document.getElementById('players').innerHTML = '';
    currentPlayerId = 1;
    
    const allButtons = document.querySelectorAll('.value-buttons button');
    allButtons.forEach(btn => btn.disabled = false);
    
    document.querySelector('.add-players').classList.remove('hidden');
}

function finishGame() {
    const confirmation = confirm("دەتەوێت ئێستا یارییەکە تەواو بکەیت؟");
    if (!confirmation) return;

    const allButtons = document.querySelectorAll('.value-buttons button');
    allButtons.forEach(btn => btn.disabled = true);

    showFinalResults();

    const winnerFound = checkForWinner();
    if (!winnerFound) {
        alert("تا ئێستا کەس سەرکەوتنی بەدەست نەهێناوە. ئەنجامی کۆتایی لە خشتەکەدا نیشان دراوە..");
    }
}

function checkForWinner() {
    const WINNING_SCORE = 100;
    const allPlayerSections = document.querySelectorAll('.player-section');
    let winnerFound = false;

    allPlayerSections.forEach((section) => {
        const id = section.id.split('-')[1];
        const input = document.getElementById(`scoreInput${id}`);
        if (!input) return;
        
        const score = parseInt(input.value) || 0;
        const nameInput = document.getElementById(`name${id}`);
        const name = nameInput?.value || `یاریزان ${id}`;

        if (score >= WINNING_SCORE) {
            alert(`🎉 براوەی... ${name}! (خاڵەکان: ${score})`);
            winnerFound = true;
        }
    });

    return winnerFound;
}

function showFinalResults() {
    const resultsContainer = document.getElementById('finalResults');
    if (!resultsContainer) return;
    
    resultsContainer.innerHTML = '';
    resultsContainer.classList.remove('hidden');
    
    const allPlayerSections = document.querySelectorAll('.player-section');
    let players = [];

    allPlayerSections.forEach((section) => {
        const id = section.id.split('-')[1];
        const input = document.getElementById(`scoreInput${id}`);
        if (!input) return;
        
        const score = parseInt(input.value) || 0;
        const nameInput = document.getElementById(`name${id}`);
        const name = nameInput?.value || `یاریزان ${id}`;
        
        players.push({ name, score });
    });

    players.sort((a, b) => b.score - a.score);

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
    
    players.forEach(p => {
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

// --- بەشی ڕێگریکردن لە کوژانەوەی شاشە (بە شێوازی مسۆگەر NoSleep) ---

var noSleep = new NoSleep();
var isAwake = false;

// مۆبایلەکان ڕێگە نادەن شاشە بە کراوەیی بهێڵرێتەوە تا بەکارهێنەر پەنجە نەدات لە شاشەکە
// بۆیە هەر کاتێک یەکەم کلیک لەسەر سایتەکە کرا (بۆ نموونە کاتی کلیک کردن لە دوگمەکان)، ئەمە چالاک دەبێت
document.addEventListener('click', function enableNoSleep() {
    if (!isAwake) {
        noSleep.enable(); // شاشەکە بە کراوەیی دەهێڵێتەوە
        isAwake = true;
        console.log("سیستەمی NoSleep چالاک بوو، شاشەکە ناکوژێتەوە");
        
        // لابردنی ئەم ئیڤێنتە بۆ ئەوەی تەنها یەکجار کار بکات
        document.removeEventListener('click', enableNoSleep, false);
    }
}, false);