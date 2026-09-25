/* =========================================================
   INSTALLATION: GRAPHIC CARD DEALER
   严格串行逐张出牌 / 统一排版节奏
   ========================================================= */

(function () {
    const rawEssays = [
        "我觉得自己像一条蛆虫，蠕动着，在日趋腐烂的尸体中游荡",
        "有时候觉得自己是蜱虫，只是以吸食别人的血活着",
        "有时我则觉得自己像一只狂吠的犬，再叫就要被关起来",
        "然而首先我是一个野鬼，游荡在雾林里不知归处"
    ];

    const essays = rawEssays.map(s => s.split(""));

    let currentEssayIdx = 0;
    let isDealing = false;

    const slotEl = document.getElementById("dealer-slot");
    const gridEl = document.getElementById("cards-grid");

    if (!slotEl || !gridEl) return;

    function dealNextEssay() {
        if (isDealing) return;
        isDealing = true;

        gridEl.innerHTML = "";
        const chars = essays[currentEssayIdx];
        const cardElements = [];

        // 递归式严格逐张发牌：发完一张，再从发牌口推出下一张
        function dealCardStep(index) {
            if (index >= chars.length) {
                // 当前段落全部牌发完，停顿 3.6 秒供阅读，随后柔和淡出换下一段
                setTimeout(() => {
                    cardElements.forEach(c => c.classList.add("card-fadeout"));
                    setTimeout(() => {
                        currentEssayIdx = (currentEssayIdx + 1) % essays.length;
                        isDealing = false;
                        dealNextEssay();
                    }, 550);
                }, 3600);
                return;
            }

            const char = chars[index];

            // 1. 在网格末端追加实际 DOM 卡片
            const card = document.createElement("div");
            card.className = "dealer-card";
            card.textContent = char; // 标点符号与文字完全统一，不做任何特异化处理
            gridEl.appendChild(card);
            cardElements.push(card);

            // 2. 测量发牌口与此卡最终落位点之间的空间矢量差
            const slotRect = slotEl.getBoundingClientRect();
            const slotCenterX = slotRect.left + slotRect.width / 2;
            const slotCenterY = slotRect.top + slotRect.height / 2;

            const cardRect = card.getBoundingClientRect();
            const targetCenterX = cardRect.left + cardRect.width / 2;
            const targetCenterY = cardRect.top + cardRect.height / 2;

            const deltaX = slotCenterX - targetCenterX;
            const deltaY = slotCenterY - targetCenterY;

            // 3. 将新牌瞬间置于发牌口内（微小缩放、不可见）
            card.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.6)`;
            card.style.opacity = "0";

            // 4. 发牌口微震动作
            slotEl.classList.add("slot-eject");
            setTimeout(() => slotEl.classList.remove("slot-eject"), 100);

            // 5. 触发物理滑行动画飞向指定点
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    card.classList.add("card-dealt");
                    // 极细微的自然手绘角度偏差 (-1.2° ~ +1.2°)
                    const subtleRot = (Math.random() - 0.5) * 2.4;
                    card.style.transform = `translate(0, 0) scale(1) rotate(${subtleRot}deg)`;
                    card.style.opacity = "1";
                });
            });

            // 6. 等待当前这张牌飞行落定后（约 190ms），再发下一张牌
            const interval = (char === "，" || char === "。") ? 260 : 190;
            setTimeout(() => {
                dealCardStep(index + 1);
            }, interval);
        }

        // 启动第一张牌发放
        dealCardStep(0);
    }

    // 页面就绪后稍作停顿开始首轮发牌
    setTimeout(dealNextEssay, 400);
})();
