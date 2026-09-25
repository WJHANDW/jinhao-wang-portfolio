/* =========================================================
   INSTALLATION: KINETIC GRAPHIC DEALER
   真随机切片抽取 + 2倍超高速连发 + 0.5s 文段定格周转时序
   ========================================================= */

(function () {
    const rawEssays = [
        // --- 原始随笔系列 ---
        "我觉得自己像一条蛆虫，蠕动着，在日趋腐烂的尸体中游荡",
        "有时候觉得自己是蜱虫，只是以吸食别人的血活着",
        "有时我则觉得自己像一只狂吠的犬，再叫就要被关起来",
        "然而首先我是一个野鬼，游荡在雾林里不知归处",

        // --- 记忆与梦境切片 ---
        "在生活进入长时间平淡快乐时，我常害怕一场迅疾的暴雨摧毁一切",
        "像小时候夜晚山边的天忽然亮起，不知是打雷要下雨，还是有人放烟花",
        "今早做了一个切合现实的梦，回想时发现它确实曾发生过，最后一次发生时我真的走了",
        "梦里回家，在院子杂物堆捡到一只橘猫，后来发现它的爪子跟婴儿拳头一般大",
        "带回家两三天它一直不吃也不让摸，很凶，我没衣物保护的地方随时都会被挠",
        "我单手捧着核桃与腰果仁喂它，吃到最后它舌头上的倒刺剐着我的掌心",
        "我摩挲着它弓着的身子，它变温顺了，跟我玩了起来，它一定是饿坏了",
        "它下楼找流浪猫玩被听到，我爸说：这是什么猫？声调低沉有力，像卡夫卡《审判》里的父亲",
        "即使垂垂老矣将死之时也足以审判儿子。我在楼梯往下喊：不让养我就出去住！",

        // --- 新增随笔切片 ---
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

    // 核心改进：真随机选段（确保不与上一段连续重复）
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

        // 2. 一次性批量读取坐标，出牌过程零重排读取开销
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
                    // 0.15s 淡出后即刻随机挑选下一篇启动
                    setTimeout(() => {
                        currentEssayIdx = getRandomEssayIndex(currentEssayIdx);
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

            // 5. 瞬间吐牌微震（25ms）
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
