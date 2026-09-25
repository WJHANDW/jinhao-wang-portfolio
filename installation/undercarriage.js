/* =========================================================
   INSTALLATION: GRAPHIC CARD DEALER (极简图形发牌器)
   ========================================================= */

(function () {
    const rawEssays = [
        "我觉得自己像一条蛆虫，蠕动着，在日趋腐烂的尸体中游荡",
        "有时候觉得自己是蜱虫，只是以吸食别人的血活着",
        "有时我则觉得自己像一只狂吠的犬，再叫就要被关起来",
        "然而首先我是一个野鬼，游荡在雾林里不知归处"
    ];

    // 将整句拆为单个字符数组
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

        // 1. 先在网格中生成空占位格，固定好排版结构
        const cardElements = [];
        chars.forEach((char) => {
            const card = document.createElement("div");
            card.className = "dealer-card";
            if (char === "，" || char === "。") {
                card.classList.add("card-punct");
            }
            card.textContent = char;
            gridEl.appendChild(card);
            cardElements.push(card);
        });

        // 2. 依次一张张发牌（计算从发牌口到目标格子的位移轨迹）
        const slotRect = slotEl.getBoundingClientRect();
        const slotCenterX = slotRect.left + slotRect.width / 2;
        const slotCenterY = slotRect.top + slotRect.height / 2;

        chars.forEach((char, index) => {
            setTimeout(() => {
                const card = cardElements[index];
                const cardRect = card.getBoundingClientRect();
                const targetCenterX = cardRect.left + cardRect.width / 2;
                const targetCenterY = cardRect.top + cardRect.height / 2;

                // 计算相对发牌口的坐标差
                const deltaX = slotCenterX - targetCenterX;
                const deltaY = slotCenterY - targetCenterY;

                // 发牌槽微震反馈
                slotEl.classList.add("slot-eject");
                setTimeout(() => slotEl.classList.remove("slot-eject"), 120);

                // 让卡片从发牌口初生并飞到目标位置
                card.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.3) rotate(-10deg)`;
                card.style.opacity = "0";

                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        card.classList.add("card-dealt");
                        // 带着极微弱的手绘自然角度（-1.5° ~ +1.5°）
                        const subtleRot = (Math.random() - 0.5) * 3;
                        card.style.transform = `translate(0, 0) scale(1) rotate(${subtleRot}deg)`;
                        card.style.opacity = "1";
                    });
                });

                // 全部发完后的停顿与下一轮收牌
                if (index === chars.length - 1) {
                    setTimeout(() => {
                        // 整体向下收牌/淡出
                        cardElements.forEach(c => c.classList.add("card-fadeout"));
                        setTimeout(() => {
                            currentEssayIdx = (currentEssayIdx + 1) % essays.length;
                            isDealing = false;
                            dealNextEssay();
                        }, 800);
                    }, 3500); // 读完留白 3.5 秒
                }
            }, index * 180); // 每 180ms 发出一张牌，节奏分明
        });
    }

    // 初次加载延迟 0.5 秒启动
    setTimeout(dealNextEssay, 500);
})();
