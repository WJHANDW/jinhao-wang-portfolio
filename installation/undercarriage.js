/* =========================================================
   INSTALLATION: KINETIC GRAPHIC DEALER
   2倍超高速连发 + 0.5s 文段定格周转时序
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

    const dispenserBox = document.getElementById("dealer-slot");
    const gridEl = document.getElementById("cards-grid");

    if (!dispenserBox || !gridEl) return;

    function dealNextEssay() {
        if (isDealing) return;
        isDealing = true;

        gridEl.innerHTML = "";
        const chars = essays[currentEssayIdx];

        // 1. 批量预建绝对定位卡槽
        const fragment = document.createDocumentFragment();
        const anchors = [];
        chars.forEach(() => {
            const anchor = document.createElement("div");
            anchor.className = "card-slot-anchor";
            fragment.appendChild(anchor);
            anchors.push(anchor);
        });
        gridEl.appendChild(fragment);

        // 2. 坐标一次性批读与缓存
        const slotRect = dispenserBox.getBoundingClientRect();
        const slotCenterX = slotRect.left + slotRect.width / 2;
        const slotCenterY = slotRect.top + slotRect.height * 0.72;

        const anchorCoords = anchors.map(anchor => {
            const r = anchor.getBoundingClientRect();
            return {
                x: r.left + r.width / 2,
                y: r.top + r.height / 2
            };
        });

        const cardElements = [];

        function dealCardStep(index) {
            if (index >= chars.length) {
                dispenserBox.style.transform = `rotateX(22deg) rotateZ(0deg)`;

                // 发完全部牌，严格停留 0.5s (500ms) 定格
                setTimeout(() => {
                    for (let i = 0; i < cardElements.length; i++) {
                        cardElements[i].classList.add("card-fadeout");
                    }
                    // 0.15s 淡出后即刻无缝启动下一篇
                    setTimeout(() => {
                        currentEssayIdx = (currentEssayIdx + 1) % essays.length;
                        isDealing = false;
                        dealNextEssay();
                    }, 150);
                }, 500);
                return;
            }

            const char = chars[index];
            const targetAnchor = anchors[index];
            const coords = anchorCoords[index];

            // 1. 创建实体卡牌
            const card = document.createElement("div");
            card.className = "dealer-card";
            card.textContent = char;
            targetAnchor.appendChild(card);
            cardElements.push(card);

            // 2. 纯内存读取相对坐标
            const deltaX = slotCenterX - coords.x;
            const deltaY = slotCenterY - coords.y;

            // 3. 计算发牌机转向角度
            const angleRad = Math.atan2(coords.x - slotCenterX, coords.y - slotCenterY);
            let aimDeg = (angleRad * (180 / Math.PI)) * 0.72;
            aimDeg = Math.max(-26, Math.min(26, aimDeg));

            // 发牌机高速转动对准 (0.1s)
            dispenserBox.style.transform = `rotateX(22deg) rotateZ(${-aimDeg}deg)`;

            // 4. 初始状态：卡在出牌槽口
            card.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0) rotateZ(${-aimDeg}deg)`;
            card.style.opacity = "0.7";

            // 5. 瞬间吐牌微震（压缩至 25ms）
            setTimeout(() => {
                dispenserBox.classList.add("ejecting");
                setTimeout(() => dispenserBox.classList.remove("ejecting"), 50);

                // 触发 0.18s 高速射入
                requestAnimationFrame(() => {
                    card.classList.add("in-flight");
                    const naturalAngle = (Math.random() - 0.5) * 2;
                    card.style.transform = `translate3d(0, 0, 0) rotateZ(${naturalAngle}deg)`;
                    card.style.opacity = "1";
                });
            }, 25);

            // 6. 出牌步进节奏（2倍速：单字 220ms，标点 250ms）
            const interval = (char === "，" || char === "。") ? 250 : 220;
            setTimeout(() => {
                dealCardStep(index + 1);
            }, interval);
        }

        // 首发启动
        dealCardStep(0);
    }

    setTimeout(dealNextEssay, 150);
})();
