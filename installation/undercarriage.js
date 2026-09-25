/* =========================================================
   INSTALLATION: KINETIC GRAPHIC DEALER (ZERO-JANK HIGH-FPS)
   坐标预批处理 + 纯 GPU 硬件加速合成
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

        // 1. 批量创建卡槽并挂载
        const fragment = document.createDocumentFragment();
        const anchors = [];
        chars.forEach(() => {
            const anchor = document.createElement("div");
            anchor.className = "card-slot-anchor";
            fragment.appendChild(anchor);
            anchors.push(anchor);
        });
        gridEl.appendChild(fragment);

        // 2. 【核心优化】：在此处一次性批读全部坐标并缓存！
        // 后续出牌过程中，绝不再触发任何 getBoundingClientRect()，根除重排卡顿！
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

                // 文段停留 0.5s，快速收牌换下一轮
                setTimeout(() => {
                    for (let i = 0; i < cardElements.length; i++) {
                        cardElements[i].classList.add("card-fadeout");
                    }
                    setTimeout(() => {
                        currentEssayIdx = (currentEssayIdx + 1) % essays.length;
                        isDealing = false;
                        dealNextEssay();
                    }, 300);
                }, 500);
                return;
            }

            const char = chars[index];
            const targetAnchor = anchors[index];
            const coords = anchorCoords[index];

            // 1. 创建卡牌
            const card = document.createElement("div");
            card.className = "dealer-card";
            card.textContent = char;
            targetAnchor.appendChild(card);
            cardElements.push(card);

            // 2. 从预存数据中直接计算，零开销
            const deltaX = slotCenterX - coords.x;
            const deltaY = slotCenterY - coords.y;

            // 3. 计算发牌机转向角度
            const angleRad = Math.atan2(coords.x - slotCenterX, coords.y - slotCenterY);
            let aimDeg = (angleRad * (180 / Math.PI)) * 0.72;
            aimDeg = Math.max(-26, Math.min(26, aimDeg));

            // 发牌机转向（采用 translate3d 走 GPU 合成）
            dispenserBox.style.transform = `rotateX(22deg) rotateZ(${-aimDeg}deg)`;

            // 4. 初始状态：卡在槽口
            card.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0) rotateZ(${-aimDeg}deg)`;
            card.style.opacity = "0.7";

            // 5. 机械推射微震与平滑滑出
            setTimeout(() => {
                dispenserBox.classList.add("ejecting");
                setTimeout(() => dispenserBox.classList.remove("ejecting"), 100);

                // 强制下一帧由 GPU 硬件合成执行飞行动画
                requestAnimationFrame(() => {
                    card.classList.add("in-flight");
                    const naturalAngle = (Math.random() - 0.5) * 2;
                    card.style.transform = `translate3d(0, 0, 0) rotateZ(${naturalAngle}deg)`;
                    card.style.opacity = "1";
                });
            }, 80);

            // 6. 发牌步进
            const interval = (char === "，" || char === "。") ? 700 : 615;
            setTimeout(() => {
                dealCardStep(index + 1);
            }, interval);
        }

        // 启动第一张
        dealCardStep(0);
    }

    setTimeout(dealNextEssay, 350);
})();
