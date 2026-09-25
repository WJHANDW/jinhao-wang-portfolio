/* =========================================================
   INSTALLATION: KINETIC GRAPHIC DEALER
   纯俯视极简圆盘 (95px) + 极隐蔽狭缝 (15%) + 整席汇聚回收
   ========================================================= */

(function () {
    const rawEssays = [
        "我觉得自己像一条蛆虫，蠕动着，在日趋腐烂的尸体中游荡",
        "有时候觉得自己是蜱虫，只是以吸食别人的血活着",
        "有时我则觉得自己像一只狂吠的犬，再叫就要被关起来",
        "然而首先我是一个野鬼，游荡在雾林里不知归处",
        "在生活进入长时间平淡快乐时，我常害怕一场迅疾的暴雨摧毁一切",
        "像小时候夜晚山边的天忽然亮起，不知是打雷要下雨，还是有人放烟花",
        "今早做了一个切合现实的梦，回想时发现它确实曾发生过，最后一次发生时我真的走了",
        "梦里回家，在院子杂物堆捡到一只橘猫，后来发现它的爪子跟婴儿拳头一般大",
        "带回家两三天它一直不吃也不让摸，很凶，我没衣物保护的地方随时都会被挠",
        "我单手捧着核桃与腰果仁喂它，吃到最后它舌头上的倒刺剐着我的掌心",
        "我摩挲着它弓着的身子，它变温顺了，跟我玩了起来，它一定是饿坏了",
        "它下楼找流浪猫玩被听到，我爸说：这是什么猫？声调低沉有力，像卡夫卡《审判》里的父亲",
        "即使垂垂老矣将死之时也足以审判儿子。我在楼梯往下喊：不让养我就出去住！",
        "压抑的氛围，空气中悬浮着许多细小的絮，不敢过分呼吸",
        "在审查严格的条件下，我要把握作品的尺度。我们想要说话，我们要发明自己的语言",
        "只接受一种道理的人只有一种逻辑，别人的看法都是低等的，存在就是对他的挑战",
        "吓了我二十年的老虎，离远后发现它不过是一只无能狂吠的犬",
        "从前的喝令我竟看出乞求，像垂垂老矣、失去筹码的赌徒，颓然瘫在桌前",
        "必须想象自己是一个摄像机云台，我试图捕捉羽毛球的轨迹",
        "手逐渐酸麻，举高俯拍到无法支撑，贴在胸膛上才能勉强把录像录完",
        "新娘裙摆像妖怪般盘踞在床上，兄弟团撞门与粗鲁捣弄，结婚仪式充满了原始父权文化",
        "侵入性就是一方在空间上侵入另一方，产生排异，在不断侵入中获得快感",
        "有些我能想得到的、做出来不会让我满意的想法，我不会去做",
        "在我们的社会中，似乎男性生殖器代表着一种超越性，只要挂着一组就总能有底气",
        "小时候暴雨天，猪肝色雨衣罩住全身，我看着地下如黑履带般的路面推断自己到哪了",
        "我闭着眼置于一场冒险，感受重心的偏移和每一次转弯的强度，在脑内画一张地图",
        "感觉非常糟糕，找不到工作，被困在家里任人摆布，长期屈辱，人生一塌糊涂",
        "感觉浑身没劲，提不起兴趣，对人没有耐心，我很无力，不知道怎么办",
        "跳楼机坠降的失重，理发害怕被剪刀伤害的恐惧，和想起父母往事的感觉都很像",
        "很刺激，有点酥麻抽离，挤出最后一点气时，一阵酸胀从胸腔顺着手臂传到掌心"
    ];

    const essays = rawEssays.map(s => s.split(""));

    function getRandomEssayIndex(excludeIdx) {
        if (essays.length <= 1) return 0;
        let nextIdx;
        do {
            nextIdx = Math.floor(Math.random() * essays.length);
        } while (nextIdx === excludeIdx);
        return nextIdx;
    }

    let currentEssayIdx = getRandomEssayIndex(-1);
    let isDealing = false;

    const dispenserDisc = document.getElementById("dealer-slot");
    const gridEl = document.getElementById("cards-grid");
    const discardPileEl = document.getElementById("discard-free-pile");

    if (!dispenserDisc || !gridEl || !discardPileEl) return;

    // --- 1. 初始化自然散乱常驻废牌堆 (恒定 12 张，高度固定) ---
    const initialChars = ["审", "判", "犬", "雾", "鬼", "痕", "雨", "絮", "语", "尺", "度", "脉"];

    for (let i = 0; i < 12; i++) {
        const sheet = document.createElement("div");
        sheet.className = "discarded-sheet";
        sheet.textContent = initialChars[i];

        const rot = (Math.random() - 0.5) * 14.4; // ±7.2°
        const jx = (Math.random() - 0.5) * 16;   // ±8px
        const jy = (Math.random() - 0.5) * 16;
        const liftY = -(i * 0.25); // 极微厚度，高度恒定

        sheet.style.transform = `translate3d(${jx}px, ${jy + liftY}px, 0) rotateZ(${rot}deg)`;
        sheet.style.zIndex = (i + 1).toString();
        discardPileEl.appendChild(sheet);
    }

    // --- 2. 发牌与整席汇聚回收循环 ---
    function dealNextEssay() {
        if (isDealing) return;
        isDealing = true;

        gridEl.innerHTML = "";
        const chars = essays[currentEssayIdx];

        // 批量创建卡槽并挂载
        const fragment = document.createDocumentFragment();
        const anchors = [];
        chars.forEach(() => {
            const anchor = document.createElement("div");
            anchor.className = "card-slot-anchor";
            fragment.appendChild(anchor);
            anchors.push(anchor);
        });
        gridEl.appendChild(fragment);

        // 一次性缓存全局坐标
        const discRect = dispenserDisc.getBoundingClientRect();
        const discCenterX = discRect.left + discRect.width / 2;
        const discCenterY = discRect.top + discRect.height / 2;
        // 95px 圆盘下边缘出牌口基准
        const slotEjectY = discRect.top + discRect.height * 0.88;

        const pileRect = discardPileEl.getBoundingClientRect();
        const pileCenterX = pileRect.left + pileRect.width / 2;
        const pileCenterY = pileRect.top + pileRect.height / 2;

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
                // 发完全部牌，圆盘平滑回正 0deg
                dispenserDisc.style.transform = `rotateZ(0deg)`;

                // 定格 0.5s 后执行整席悬浮汇聚回收 (0.8x)
                setTimeout(() => {
                    executeCollectiveFlockRecall();
                }, 500);
                return;
            }

            const char = chars[index];
            const targetAnchor = anchors[index];
            const coords = anchorCoords[index];

            // 桌面散落微扰
            const rotDeg = (Math.random() - 0.5) * 11;
            const jitterX = (Math.random() - 0.5) * 12;
            const jitterY = (Math.random() - 0.5) * 14;

            const card = document.createElement("div");
            card.className = "dealer-card";
            card.textContent = char;
            card.style.zIndex = (10 + index).toString();
            targetAnchor.appendChild(card);
            cardElements.push(card);

            const deltaX = discCenterX - (coords.x + jitterX);
            const deltaY = slotEjectY - (coords.y + jitterY);

            // 圆盘纯俯视同轴旋转角度计算
            const angleRad = Math.atan2((coords.x + jitterX) - discCenterX, (coords.y + jitterY) - discCenterY);
            let aimDeg = (angleRad * (180 / Math.PI)) * 0.72;
            aimDeg = Math.max(-28, Math.min(28, aimDeg));
            dispenserDisc.style.transform = `rotateZ(${-aimDeg}deg)`;

            // 出牌口初始位置
            card.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0) rotateZ(${-aimDeg}deg)`;
            card.style.opacity = "0.7";

            // 瞬间射出
            setTimeout(() => {
                dispenserDisc.classList.add("ejecting");
                setTimeout(() => dispenserDisc.classList.remove("ejecting"), 50);

                requestAnimationFrame(() => {
                    card.classList.add("in-flight");
                    card.style.transform = `translate3d(${jitterX}px, ${jitterY}px, 0) rotateZ(${rotDeg}deg)`;
                    card.style.opacity = "1";
                });
            }, 25);

            // 步进间隔 (2倍速)
            const interval = (char === "，" || char === "。") ? 250 : 220;
            setTimeout(() => {
                dealCardStep(index + 1);
            }, interval);
        }

        // --- 整席悬浮汇聚回收核心执行器 (0.8x 速率) ---
        function executeCollectiveFlockRecall() {
            cardElements.forEach((card, idx) => {
                const anchorCoord = anchorCoords[idx];
                
                const targetPileX = pileCenterX - anchorCoord.x;
                const targetPileY = pileCenterY - anchorCoord.y;

                const pileRot = (Math.random() - 0.5) * 14.4;
                const pileJx = (Math.random() - 0.5) * 16;
                const pileJy = (Math.random() - 0.5) * 16;
                const fixedLift = -((idx % 8) * 0.35); // 恒定高度

                card.classList.remove("in-flight");
                card.classList.add("in-recall");

                setTimeout(() => {
                    card.style.transform = `translate3d(${targetPileX + pileJx}px, ${targetPileY + pileJy + fixedLift}px, 0) rotateZ(${pileRot}deg)`;
                    card.style.zIndex = (50 + idx).toString();
                }, idx * 5);
            });

            // 0.45s 飞行 + 0.1s 缓冲落定
            setTimeout(() => {
                const topSheets = discardPileEl.querySelectorAll(".discarded-sheet");
                const replaceCount = Math.min(cardElements.length, topSheets.length);
                for (let k = 0; k < replaceCount; k++) {
                    topSheets[topSheets.length - 1 - k].textContent = cardElements[cardElements.length - 1 - k].textContent;
                }

                currentEssayIdx = getRandomEssayIndex(currentEssayIdx);
                isDealing = false;
                dealNextEssay();
            }, 560);
        }

        dealCardStep(0);
    }

    setTimeout(dealNextEssay, 200);
})();
