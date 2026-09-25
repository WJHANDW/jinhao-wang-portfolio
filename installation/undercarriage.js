/* =========================================================
   INSTALLATION: KINETIC GRAPHIC DEALER
   发牌器瞄准转向 + 固定卡槽绝对物理飞行时序
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

        // 核心解法1：发牌前预先建立完整阵列插槽（Anchors），锁定每个字的未来坐标
        // 这彻底消除了“发一张牌、旧牌被推向左边”的版面跳跃！
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
                // 回正发牌箱角度
                dispenserBox.style.transform = `rotateX(24deg) rotateZ(0deg)`;

                // 读毕停顿 3.6 秒，全牌收纳下沉
                setTimeout(() => {
                    cardElements.forEach(c => c.classList.add("card-fadeout"));
                    setTimeout(() => {
                        currentEssayIdx = (currentEssayIdx + 1) % essays.length;
                        isDealing = false;
                        dealNextEssay();
                    }, 500);
                }, 3600);
                return;
            }

            const char = chars[index];
            const targetAnchor = anchors[index];

            // 1. 创建真正有字实体牌
            const card = document.createElement("div");
            card.className = "dealer-card";
            card.textContent = char;
            targetAnchor.appendChild(card);
            cardElements.push(card);

            // 2. 测量当前目标卡槽与发牌机槽口的相对矢量
            const slotRect = dispenserBox.getBoundingClientRect();
            const slotCenterX = slotRect.left + slotRect.width / 2;
            const slotCenterY = slotRect.top + slotRect.height * 0.75; // 出牌口高度

            const anchorRect = targetAnchor.getBoundingClientRect();
            const targetCenterX = anchorRect.left + anchorRect.width / 2;
            const targetCenterY = anchorRect.top + anchorRect.height / 2;

            const deltaX = slotCenterX - targetCenterX;
            const deltaY = slotCenterY - targetCenterY;

            // 核心解法2：计算瞄准方位角（Aiming Angle）
            // 目标越偏左，角度越负；目标越偏右，角度越正（范围限制在 ±28° 之间）
            const angleRad = Math.atan2(targetCenterX - slotCenterX, targetCenterY - slotCenterY);
            let aimDeg = (angleRad * (180 / Math.PI)) * 0.75;
            aimDeg = Math.max(-28, Math.min(28, aimDeg));

            // 发牌箱机体转向瞄准出牌目标！
            dispenserBox.style.transform = `rotateX(24deg) rotateZ(${-aimDeg}deg)`;

            // 核心解法3：构筑“从发牌槽内探出并射出”的物理景深
            // 牌刚诞生时：处于发牌槽深处，极小、扁平、带有俯仰透视
            card.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.28, 0.45) rotateX(45deg) rotateZ(${-aimDeg}deg)`;
            card.style.opacity = "0.2";
            card.style.boxShadow = "none";

            // 机构吐牌微震反馈
            dispenserBox.classList.add("ejecting");
            setTimeout(() => dispenserBox.classList.remove("ejecting"), 90);

            // 双重重绘帧：触发从出牌口向外高速滑行展开
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    card.classList.add("in-flight");
                    // 飞出后落定位点，附带极其微妙的自然手绘偏差 (-1.2° ~ +1.2°)
                    const naturalAngle = (Math.random() - 0.5) * 2.4;
                    card.style.transform = `translate(0, 0) scale(1) rotateX(0deg) rotateZ(${naturalAngle}deg)`;
                    card.style.opacity = "1";
                    card.style.boxShadow = "0 2px 7px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)";
                });
            });

            // 标点符号与汉字的发牌节奏微调
            const cadence = (char === "，" || char === "。") ? 270 : 190;
            setTimeout(() => {
                dealCardStep(index + 1);
            }, cadence);
        }

        // 首发前发牌箱先瞄向第一张牌的位置
        dealCardStep(0);
    }

    setTimeout(dealNextEssay, 450);
})();
