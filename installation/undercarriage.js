/* =========================================================
   INSTALLATION: UNDERCARRIAGE / 沥青下潜
   视觉动态装置核心逻辑
   ========================================================= */

(function () {
    // 1. 你的日常随笔语库（以后随时在这里改写、扩充句子）
    const essays = [
        [
            "昨晚梦见一滩融化的沥青",
            "黏在鞋底",
            "像身体分泌出的某种废料",
            "车轮碾过去的时候",
            "没有骨骼断裂的声音",
            "只有空气被沉重压缩的喘息"
        ],
        [
            "机械每天在吞吐机油与尘土",
            "我们在吞吐图像与情绪",
            "被底盘带走的那阵风",
            "其实也是我们日常摄入的一部分",
            "只是从未有人低头打量过它的残骸"
        ],
        [
            "地表是一层薄脆的膜",
            "卡车碾过时产生的微颤",
            "能一直传导到脊柱后侧",
            "静止的凝视",
            "有时比撞击更具侵略性"
        ],
        [
            "画布和底盘一样",
            "不负责储存干净的光芒",
            "它负责盛接滴落的油垢",
            "泥浆，刮痕",
            "以及急速离去时的背影"
        ]
    ];

    let currentEssayIndex = Math.floor(Math.random() * essays.length);
    let phraseIndex = 0;
    let accumulatedPhrases = [];

    const canvas = document.getElementById("undercarriage-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const logTextEl = document.getElementById("log-text");
    const nextBtn = document.getElementById("btn-next-passage");

    // 高清适配抗锯齿
    function resizeCanvas() {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // 车辆实体生成器
    class Vehicle {
        constructor(phrase) {
            this.phrase = phrase;
            const rect = canvas.getBoundingClientRect();
            this.w = rect.width;
            this.h = rect.height;

            this.y = -this.h * 1.3;
            this.speed = 18 + Math.random() * 8; // 呼啸通过的速度
            this.carWidth = this.w * (0.75 + Math.random() * 0.15);
            this.carLength = this.h * 1.25;

            this.active = true;
            this.triggeredLog = false;
        }

        update() {
            this.y += this.speed;

            // 车体正中掠过画面中轴时，下方记录台高亮沉淀文字
            if (!this.triggeredLog && this.y + this.carLength * 0.5 > this.h * 0.45) {
                this.triggeredLog = true;
                accumulatedPhrases.push(this.phrase);
                updateTranscript();
            }

            if (this.y > this.h * 1.2) {
                this.active = false;
            }
        }

        draw(ctx, w, h) {
            ctx.save();
            const cx = w / 2;
            const cy = this.y;

            // 1. 车身巨型底盘遮罩
            const shadowGrad = ctx.createLinearGradient(0, cy, 0, cy + this.carLength);
            shadowGrad.addColorStop(0, "rgba(8, 8, 8, 0.98)");
            shadowGrad.addColorStop(0.5, "rgba(14, 14, 14, 0.95)");
            shadowGrad.addColorStop(1, "rgba(8, 8, 8, 0.98)");

            ctx.fillStyle = shadowGrad;
            ctx.beginPath();
            ctx.roundRect(cx - this.carWidth / 2, cy, this.carWidth, this.carLength, 12);
            ctx.fill();

            // 2. 机械车轮剪影
            ctx.fillStyle = "#080808";
            const tireW = 28;
            const tireH = 85;
            // 前轮
            ctx.fillRect(cx - this.carWidth / 2 - tireW * 0.4, cy + 50, tireW, tireH);
            ctx.fillRect(cx + this.carWidth / 2 - tireW * 0.6, cy + 50, tireW, tireH);
            // 后轮
            ctx.fillRect(cx - this.carWidth / 2 - tireW * 0.4, cy + this.carLength - 140, tireW, tireH);
            ctx.fillRect(cx + this.carWidth / 2 - tireW * 0.6, cy + this.carLength - 140, tireW, tireH);

            // 3. 底盘防护与传动骨架
            ctx.strokeStyle = "rgba(45, 45, 45, 0.7)";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(cx, cy + 20);
            ctx.lineTo(cx, cy + this.carLength - 20);
            ctx.moveTo(cx - this.carWidth * 0.35, cy + this.carLength * 0.3);
            ctx.lineTo(cx + this.carWidth * 0.35, cy + this.carLength * 0.3);
            ctx.moveTo(cx - this.carWidth * 0.35, cy + this.carLength * 0.7);
            ctx.lineTo(cx + this.carWidth * 0.35, cy + this.carLength * 0.7);
            ctx.stroke();

            // 4. 车底随笔文字
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = "bold 20px 'Courier New', monospace, sans-serif";
            ctx.fillStyle = "rgba(240, 240, 240, 0.92)";
            ctx.shadowColor = "rgba(255, 255, 255, 0.3)";
            ctx.shadowBlur = 8;
            ctx.fillText(this.phrase, cx, cy + this.carLength * 0.5);

            ctx.restore();
        }
    }

    let currentVehicle = null;
    let cooldown = 30;

    function renderScene() {
        const rect = canvas.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;

        // 沥青路面底色
        ctx.fillStyle = "#181818";
        ctx.fillRect(0, 0, w, h);

        // 道路中央微弱虚线
        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctx.lineWidth = 4;
        ctx.setLineDash([25, 35]);
        ctx.beginPath();
        ctx.moveTo(w / 2, 0);
        ctx.lineTo(w / 2, h);
        ctx.stroke();
        ctx.setLineDash([]);

        // 车辆逻辑
        if (currentVehicle && currentVehicle.active) {
            currentVehicle.update();
            currentVehicle.draw(ctx, w, h);
        } else {
            cooldown--;
            if (cooldown <= 0) {
                dispatchNextCar();
                cooldown = 45 + Math.random() * 25;
            }
        }

        requestAnimationFrame(renderScene);
    }

    function dispatchNextCar() {
        const currentList = essays[currentEssayIndex];
        if (phraseIndex < currentList.length) {
            currentVehicle = new Vehicle(currentList[phraseIndex]);
            phraseIndex++;
        } else {
            cooldown = 120;
        }
    }

    function updateTranscript() {
        if (!logTextEl) return;
        const currentList = essays[currentEssayIndex];
        const html = currentList.map((p, idx) => {
            return idx < accumulatedPhrases.length
                ? `<span class="accumulated">${p}</span>`
                : `<span>${p}</span>`;
        }).join(" / ");

        logTextEl.innerHTML = html;
    }

    function resetAndSwitchEssay(newIdx) {
        currentEssayIndex = (newIdx !== undefined) ? newIdx : (currentEssayIndex + 1) % essays.length;
        phraseIndex = 0;
        accumulatedPhrases = [];
        currentVehicle = null;
        cooldown = 15;
        updateTranscript();
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", () => resetAndSwitchEssay());
    }

    updateTranscript();
    renderScene();
})();
