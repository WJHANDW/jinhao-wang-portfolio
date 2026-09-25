/* =========================================================
   INSTALLATION: UNDERCARRIAGE / 正前方低机位单字碾压装置
   ========================================================= */

(function () {
    // 你的 4 段随笔语库（自动按单字拆分分发给每一辆车）
    const rawEssays = [
        "我觉得自己像一条蛆虫，蠕动着，在日趋腐烂的尸体中游荡",
        "有时候觉得自己是蜱虫，只是以吸食别人的血活着",
        "有时我则觉得自己像一只狂吠的犬，再叫就要被关起来",
        "然而首先我是一个野鬼，游荡在雾林里不知归处"
    ];

    // 将整句拆解为单个字符序列（包含标点作为停顿节奏）
    const essays = rawEssays.map(sentence => sentence.split(""));

    let currentEssayIdx = 0;
    let charIdx = 0;

    const canvas = document.getElementById("undercarriage-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let cw = 0;
    let ch = 0;

    function resizeCanvas() {
        const rect = canvas.getBoundingClientRect();
        cw = rect.width;
        ch = rect.height;
        canvas.width = cw * window.devicePixelRatio;
        canvas.height = ch * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    /* =========================================================
       正前方低机位透视汽车实体模型
       过程：远处车头逼近 -> 车头压顶迎面抬升 -> 露出车底与单字 -> 呼啸掠过
       ========================================================= */
    class PerspectiveCar {
        constructor(char) {
            this.char = char;
            this.progress = 0; // 0.0 (远方) -> 1.0 (完全掠过头顶)
            this.speed = 0.022 + Math.random() * 0.008; // 推进速度
            this.active = true;
            this.carType = Math.floor(Math.random() * 3); // 随机车型
        }

        update() {
            // 近大远小的非线性透视加速（越来越快地压迫过来）
            this.progress += this.speed * (1 + this.progress * 2.8);
            if (this.progress >= 1.25) {
                this.active = false;
            }
        }

        draw(ctx, w, h) {
            ctx.save();

            const p = this.progress;
            const cx = w / 2;

            // 地平线（灭点）位于画面上部 32% 处
            const horizonY = h * 0.32;

            // 随着靠近，垂直中心迅速向画面下方推移展开
            const currentY = horizonY + Math.pow(p, 1.8) * (h * 1.1);
            const scale = Math.pow(p, 2.2);

            const carW = 140 + scale * (w * 0.95);
            const carH = 50 + scale * (h * 0.75);

            // 当车辆还在中远距离时 (p < 0.55)：呈现正前方迎面压来的【车头轮廓与车灯】
            if (p < 0.58) {
                const headAlpha = Math.min(1, p * 3);
                ctx.globalAlpha = headAlpha;

                // 车头前脸主体
                ctx.fillStyle = "#222222";
                ctx.beginPath();
                ctx.roundRect(cx - carW * 0.45, currentY - carH * 0.5, carW * 0.9, carH * 0.55, 6 * p);
                ctx.fill();

                // 进气格栅阴影
                ctx.fillStyle = "#111111";
                ctx.fillRect(cx - carW * 0.35, currentY - carH * 0.22, carW * 0.7, carH * 0.18);

                // 两侧低位车灯（微弱冷光透镜）
                ctx.fillStyle = "rgba(235, 235, 235, 0.85)";
                ctx.shadowColor = "rgba(255, 255, 255, 0.4)";
                ctx.shadowBlur = 10 * p;
                ctx.fillRect(cx - carW * 0.42, currentY - carH * 0.35, carW * 0.12, carH * 0.1);
                ctx.fillRect(cx + carW * 0.30, currentY - carH * 0.35, carW * 0.12, carH * 0.1);
                ctx.shadowBlur = 0;

                // 贴地阴影
                ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
                ctx.beginPath();
                ctx.ellipse(cx, currentY + carH * 0.08, carW * 0.5, carH * 0.12, 0, 0, Math.PI * 2);
                ctx.fill();
            }

            // 当车迎面压过镜头、露出底盘时 (p >= 0.4)：车头抬起，透视展示【整个车身底盘与内部】
            if (p >= 0.4) {
                const underAlpha = Math.min(1, (p - 0.4) * 4);
                ctx.globalAlpha = underAlpha;

                const bottomY = currentY - carH * 0.15;
                const underW = carW * 1.05;
                const underH = carH * 1.1;

                // 1. 底盘大面积暗部遮罩
                ctx.fillStyle = "#1a1a1a";
                ctx.beginPath();
                ctx.roundRect(cx - underW / 2, bottomY, underW, underH, 12);
                ctx.fill();

                // 2. 底盘内侧机械结构线与传动轴
                ctx.strokeStyle = "#2e2e2e";
                ctx.lineWidth = Math.max(2, 6 * p);
                ctx.beginPath();
                // 中轴传动梁
                ctx.moveTo(cx, bottomY);
                ctx.lineTo(cx, bottomY + underH);
                // 排气管与下摆臂骨架
                ctx.moveTo(cx - underW * 0.3, bottomY + underH * 0.3);
                ctx.lineTo(cx + underW * 0.3, bottomY + underH * 0.3);
                ctx.moveTo(cx - underW * 0.35, bottomY + underH * 0.65);
                ctx.lineTo(cx + underW * 0.35, bottomY + underH * 0.65);
                ctx.stroke();

                // 3. 压在地面两侧的轮胎内壁
                ctx.fillStyle = "#0d0d0d";
                const tireWidth = underW * 0.14;
                const tireHeight = underH * 0.5;
                ctx.fillRect(cx - underW / 2 - tireWidth * 0.2, bottomY + underH * 0.3, tireWidth, tireHeight);
                ctx.fillRect(cx + underW / 2 - tireWidth * 0.8, bottomY + underH * 0.3, tireWidth, tireHeight);

                // 4. 车底正中央携带的【单字】
                // 标点符号只作空气留白节奏，文字才高亮显示
                if (this.char !== "，" && this.char !== "。") {
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";

                    const fontSize = Math.min(110, Math.max(28, 90 * p));
                    ctx.font = `500 ${fontSize}px Arial, "PingFang SC", "Hiragino Sans GB", sans-serif`;

                    // 字体反白微带冷灰，浮在油污底盘之上
                    ctx.fillStyle = "rgba(242, 242, 242, 0.96)";
                    ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
                    ctx.shadowBlur = 12;
                    ctx.fillText(this.char, cx, bottomY + underH * 0.48);
                    ctx.shadowBlur = 0;
                }
            }

            ctx.restore();
        }
    }

    /* =========================================================
       浅灰公路路面与无休止自动流转循环
       ========================================================= */
    let currentCar = null;
    let pauseCounter = 0;

    function render() {
        const w = cw;
        const h = ch;

        // 背景：与全站和谐统一的当代艺术浅灰底色
        ctx.fillStyle = "#ebebeb";
        ctx.fillRect(0, 0, w, h);

        const horizonY = h * 0.32;

        // 绘制远小近大的低机位路面透视线
        ctx.strokeStyle = "rgba(17, 17, 17, 0.08)";
        ctx.lineWidth = 1.5;

        // 左右路肩透视引导线
        ctx.beginPath();
        ctx.moveTo(w / 2 - 30, horizonY);
        ctx.lineTo(w * 0.05, h);
        ctx.moveTo(w / 2 + 30, horizonY);
        ctx.lineTo(w * 0.95, h);
        ctx.stroke();

        // 道路中央透视虚线
        ctx.strokeStyle = "rgba(17, 17, 17, 0.12)";
        ctx.lineWidth = 3;
        ctx.setLineDash([18, 22]);
        ctx.beginPath();
        ctx.moveTo(w / 2, horizonY);
        ctx.lineTo(w / 2, h);
        ctx.stroke();
        ctx.setLineDash([]); // 还原

        // 车辆逻辑调度
        if (currentCar && currentCar.active) {
            currentCar.update();
            currentCar.draw(ctx, w, h);
        } else {
            // 一辆车掠过后，稍作间歇立刻调度下一辆车（下一个字）
            if (pauseCounter > 0) {
                pauseCounter--;
            } else {
                dispatchNextChar();
            }
        }

        requestAnimationFrame(render);
    }

    function dispatchNextChar() {
        const essay = essays[currentEssayIdx];

        if (charIdx < essay.length) {
            const char = essay[charIdx];
            currentCar = new PerspectiveCar(char);
            charIdx++;
            // 如果碰到了逗号，下一辆车稍微多空出 0.3 秒节奏
            pauseCounter = (char === "，" || char === "。") ? 18 : 6;
        } else {
            // 当前整句所有字全部播放完毕：静默空旷路面停留 2 秒，自动换下一段！
            charIdx = 0;
            currentEssayIdx = (currentEssayIdx + 1) % essays.length;
            pauseCounter = 75; // 约 2 秒空路过渡
            currentCar = null;
        }
    }

    // 启动初始运行
    dispatchNextChar();
    render();
})();
