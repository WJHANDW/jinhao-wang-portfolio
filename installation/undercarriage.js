/* =========================================================
   INSTALLATION: KINETIC GRAPHIC DEALER
   1.3 倍速敏捷出牌 + 0.5s 极速周转时序
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

        // 预设好每一个字的绝对卡槽，锁死坐标
        const anchors = [];
        chars.forEach(() => {
            const anchor = document.createElement("div");
            anchor.className = "card-slot-anchor";
            gridEl.appendChild(anchor);
            anchors.push(anchor);
        });

        const cardElements = [];

        function dealCardStep(index) {
            if (index >= chars.length) {
                // 恢复发牌机初始中正角度
                dispenserBox.style.transform = `rotateX(22deg) rotateZ(0deg)`;

                // 核心需求：发完所有牌后，文段仅停留 0.5s，马上开始下一轮
                setTimeout(() => {
                    cardElements.forEach(c => c.classList.add("card-fadeout"));
                    // 0.3s 淡出后立即启动下一篇
                    setTimeout(() => {
                        currentEssayIdx = (currentEssayIdx + 1) % essays.length;
                        isDealing = false;
                        dealNextEssay();
                    }, 300);
                }, 500); // 严格停留 0.5s (500ms)
                return;
            }

            const char = chars[index];
            const targetAnchor = anchors[index];

            // 1. 创建等大实体卡牌（100% 真实尺寸）
            const card = document.createElement("div");
            card.className = "dealer-card";
            card.textContent = char;
            targetAnchor.appendChild(card);
            cardElements.push(card);

            // 2. 测量发牌槽口中央坐标与目标卡槽终点
            const slotRect = dispenserBox.getBoundingClientRect();
            const slotCenterX = slotRect.left + slotRect.width / 2;
            const slotCenterY = slotRect.top + slotRect.height * 0.72;

            const anchorRect = targetAnchor.getBoundingClientRect();
            const targetCenterX = anchorRect.left + anchorRect.width / 2;
            const targetCenterY = anchorRect.top + anchorRect.height / 2;

            const deltaX = slotCenterX - targetCenterX;
            const deltaY = slotCenterY - targetCenterY;

            // 3. 计算发牌机转向角度
            const angleRad = Math.atan2(targetCenterX - slotCenterX, targetCenterY - slotCenterY);
            let aimDeg = (angleRad * (180 / Math.PI)) * 0.72;
            aimDeg = Math.max(-26, Math.min(26, aimDeg));

            // 发牌机快速转向目标（配合 1.3 倍速）
            dispenserBox.style.transform = `rotateX(22deg) rotateZ(${-aimDeg}deg)`;

            // 4. 真实物理出仓机制（等大探头）
            card.style.transform = `translate(${deltaX}px, ${deltaY}px) rotateZ(${-aimDeg}deg)`;
            card.style.opacity = "0.7";
            card.style.boxShadow = "0 1px 3px rgba(0,0,0,0.2)";

            // 提速出仓微震（90ms）
            setTimeout(() => {
                dispenserBox.classList.add("ejecting");
                setTimeout(() => dispenserBox.classList.remove("ejecting"), 110);

                // 5. 牌从发牌槽顺滑脱离、平稳飞向目标（0.5s）
                requestAnimationFrame(() => {
                    card.classList.add("in-flight");
                    const naturalAngle = (Math.random() - 0.5) * 2;
                    card.style.transform = `translate(0, 0) rotateZ(${naturalAngle}deg)`;
                    card.style.opacity = "1";
                    card.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.02)";
                });
            }, 90);

            // 6. 出牌间隔节奏（1.3倍速：单字间隔 615ms，标点 700ms）
            const interval = (char === "，" || char === "。") ? 700 : 615;
            setTimeout(() => {
                dealCardStep(index + 1);
            }, interval);
        }

        // 首发
        dealCardStep(0);
    }

    setTimeout(dealNextEssay, 350);
})();
