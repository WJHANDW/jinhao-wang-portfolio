/* =========================================================
   INSTALLATION: KINETIC GRAPHIC DEALER
   等大机械出仓推牌 + 平稳可见飞行轨迹
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

        // 预设好每一个字的绝对卡槽，锁死坐标，杜绝任何旧牌晃动
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

                // 读毕停顿 3.8 秒，全牌收纳
                setTimeout(() => {
                    cardElements.forEach(c => c.classList.add("card-fadeout"));
                    setTimeout(() => {
                        currentEssayIdx = (currentEssayIdx + 1) % essays.length;
                        isDealing = false;
                        dealNextEssay();
                    }, 550);
                }, 3800);
                return;
            }

            const char = chars[index];
            const targetAnchor = anchors[index];

            // 1. 创建等大实体卡牌（100% 原尺寸）
            const card = document.createElement("div");
            card.className = "dealer-card";
            card.textContent = char;
            targetAnchor.appendChild(card);
            cardElements.push(card);

            // 2. 精确测量发牌槽口中央坐标与目标卡槽终点
            const slotRect = dispenserBox.getBoundingClientRect();
            const slotCenterX = slotRect.left + slotRect.width / 2;
            const slotCenterY = slotRect.top + slotRect.height * 0.72; // 出牌口缝隙处

            const anchorRect = targetAnchor.getBoundingClientRect();
            const targetCenterX = anchorRect.left + anchorRect.width / 2;
            const targetCenterY = anchorRect.top + anchorRect.height / 2;

            const deltaX = slotCenterX - targetCenterX;
            const deltaY = slotCenterY - targetCenterY;

            // 3. 计算发牌机转向角度
            const angleRad = Math.atan2(targetCenterX - slotCenterX, targetCenterY - slotCenterY);
            let aimDeg = (angleRad * (180 / Math.PI)) * 0.72;
            aimDeg = Math.max(-26, Math.min(26, aimDeg));

            // 发牌机先沉稳转头瞄准目标（提前 150ms 动身，让观者看清转头过程）
            dispenserBox.style.transform = `rotateX(22deg) rotateZ(${-aimDeg}deg)`;

            // 4. 关键：真实物理出仓机制（牌保持 1:1 正常大小，绝不搞缩放）
            // 初始状态：卡牌刚好卡在发牌口窄缝处，微倾斜，与出牌口缝隙完全贴合
            card.style.transform = `translate(${deltaX}px, ${deltaY}px) rotateZ(${-aimDeg}deg)`;
            card.style.opacity = "0.7";
            card.style.boxShadow = "0 1px 3px rgba(0,0,0,0.2)";

            // 稍作 120ms 停顿，让发牌机微震，牌被机械平稳推出来，清晰可见！
            setTimeout(() => {
                dispenserBox.classList.add("ejecting");
                setTimeout(() => dispenserBox.classList.remove("ejecting"), 140);

                // 5. 牌从发牌槽顺滑脱离、平稳飞向目标（耗时 0.65 秒，匀减速滑翔）
                requestAnimationFrame(() => {
                    card.classList.add("in-flight");
                    // 落定后带极细微的自然手绘偏角 (-1° ~ +1°)
                    const naturalAngle = (Math.random() - 0.5) * 2;
                    card.style.transform = `translate(0, 0) rotateZ(${naturalAngle}deg)`;
                    card.style.opacity = "1";
                    card.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.02)";
                });
            }, 120);

            // 6. 出牌间隔节奏（每张牌发完并平稳飞落后，才进行下一张）
            // 飞行耗时 0.65s + 观者看清停顿 0.15s = 约 800ms
            const interval = (char === "，" || char === "。") ? 920 : 800;
            setTimeout(() => {
                dealCardStep(index + 1);
            }, interval);
        }

        // 首发
        dealCardStep(0);
    }

    setTimeout(dealNextEssay, 500);
})();
