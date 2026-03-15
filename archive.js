window.onload = function() {
    loadArchive();
};

function loadArchive() {
    const archiveContainer = document.getElementById('archiveList');
    archiveContainer.innerHTML = '<div class="empty-msg">لە هێنانەی زانیارییەکان... <i class="fas fa-spinner fa-spin"></i></div>';

    // هێنانی داتاکان لە فایربەیس بە ڕیزبەندی (desc = نوێترین لە سەرەوە)
    db.collection("games_archive").orderBy("timestamp", "desc").get().then((querySnapshot) => {
        if (querySnapshot.empty) {
            archiveContainer.innerHTML = '<div class="empty-msg"><i class="fas fa-box-open fa-3x" style="margin-bottom: 15px; opacity: 0.5;"></i><br>هیچ یارییەک لە ئەرشیفدا نییە.</div>';
            return;
        }

        let html = '';

        querySnapshot.forEach((doc) => {
            const game = doc.data();
            
            // ئەگەر یارییەکە هێشتا کاتی سێرڤەری وەرنەگرتبوو
            if(!game.date) return;

            html += `<div class="archive-card"><div class="card-content">`;
            html += `
                <div class="game-date">
                    <span><i class="far fa-calendar-alt"></i> بەروار: ${game.date.split(' - ')[0]}</span>
                    <span><i class="far fa-clock"></i> کات: ${game.date.split(' - ')[1]}</span>
                </div>
            `;

            let sortedPlayers = [...game.players].sort((a, b) => b.score - a.score);

            sortedPlayers.forEach((p) => {
                const isWinner = p.score === game.highestScore ? 'winner' : '';
                const crownIcon = isWinner ? '<i class="fas fa-crown winner-crown"></i>' : '';
                
                let historyHtml = '';
                if (p.history && p.history.length > 0) {
                    historyHtml = p.history.map(val => {
                        let cssClass = val < 0 ? 'minus' : 'plus';
                        let sign = val > 0 ? '+' : '';
                        return `<span class="h-item ${cssClass}">${sign}${val}</span>`;
                    }).join('');
                } else {
                    historyHtml = '<span class="h-item" style="color:#666;">هیچ خاڵێک تۆمار نەکراوە</span>';
                }

                html += `
                    <div class="player-row ${isWinner}">
                        <div class="player-info">
                            <div class="p-name">${crownIcon} ${p.name}</div>
                            <div class="p-score">${p.score}</div>
                        </div>
                        <div class="history-container">
                            ${historyHtml}
                        </div>
                    </div>
                `;
            });

            html += `</div></div>`;
        });

        archiveContainer.innerHTML = html;
    }).catch((error) => {
        console.error("کێشە لە هێنانی داتا:", error);
        archiveContainer.innerHTML = '<div class="empty-msg" style="color: #ef4444;">کێشەیەک ڕوویدا لە پەیوەندیکردن بە سێرڤەر.</div>';
    });
}