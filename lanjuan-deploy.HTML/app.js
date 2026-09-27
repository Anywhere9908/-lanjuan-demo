/* =====================================================================
   览卷 · CultureAccess — 可信发布与智能解读智能体 Demo
   「看见 — 核验 — 发布」三级闭环
   纯前端实现：以预设的馆藏元数据/文献证据为证据源，
   演示 claim-decomposition + evidence binding + 合规审查 + 无障碍生成。
   ===================================================================== */

/* ---------- 1. 馆藏影像数据（演示样例，SVG 矢量重绘以规避版权） ---------- */
const RELICS = {
  qingming: {
    id: "qingming",
    title: "《重修宣和博古图》残卷",
    era: "南宋 · 绍兴年间（约 1143）",
    type: "古籍 / 版刻图录",
    call: "馆藏号 GJ-0642",
    tagClass: "",
    badge: "待核验",
    desc: "刻本图录残叶，含器物线描与题记。",
    // 感知层初始观察要素
    observations: [
      { k: "主体", v: "青铜器线描图", conf: 0.94 },
      { k: "题跋", v: "竖排楷书题记 3 行", conf: 0.88 },
      { k: "钤印", v: "右下朱文方印一枚", conf: 0.81 },
      { k: "形制", v: "经折装残叶 · 框高约 24cm", conf: 0.86 },
      { k: "版式", v: "四周单边 · 白口", conf: 0.79 },
    ],
  },
  daoguang: {
    id: "daoguang",
    title: "《海国图志》道光刻本插图",
    era: "清 · 道光二十四年（1844）",
    type: "历史图片 / 舆图",
    call: "馆藏号 LS-1031",
    tagClass: "r",
    badge: "含敏感项",
    desc: "域外地理插图，含疆域与异域物产描绘。",
    observations: [
      { k: "主体", v: "域外疆域示意舆图", conf: 0.91 },
      { k: "题跋", v: "横排小字图注若干", conf: 0.83 },
      { k: "钤印", v: "未见钤印", conf: 0.92 },
      { k: "形制", v: "单叶 · 双边墨框", conf: 0.77 },
      { k: "色彩", v: "墨线为主 · 局部朱色标注", conf: 0.80 },
    ],
  },
  seal: {
    id: "seal",
    title: "馆藏近人篆刻印谱册页",
    era: "近代 · 民国（约 1930s）",
    type: "特藏 / 印谱",
    call: "馆藏号 YIN-0087",
    tagClass: "",
    badge: "待核验",
    desc: "朱色钤印册页，含边款拓片。",
    observations: [
      { k: "主体", v: "朱文篆书印蜕一枚", conf: 0.96 },
      { k: "题跋", v: "边款题识小字数行", conf: 0.84 },
      { k: "钤印", v: "印蜕主体 · 朱文", conf: 0.95 },
      { k: "形制", v: "册页单开 · 宣纸本", conf: 0.82 },
      { k: "字体", v: "小篆 · 圆朱文", conf: 0.87 },
    ],
  },
};

/* ---------- 2. 证据源库（馆藏元数据 + 文献记录 + 馆藏规章） ---------- */
const EVIDENCE = {
  // —— 《重修宣和博古图》情况 ——
  "E-GJ-01": { label: "馆藏 MARC 记录 245/260 字段", src: "特藏元数据库 · GJ-0642", quote: "正题名：重修宣和博古图；出版项：南宋绍兴间刻本；版本：宋刻元修本。", type: "元数据" },
  "E-GJ-02": { label: "《中国古籍善本书目》著录", src: "文献记录 · 善本书目", quote: "重修宣和博古图三十卷，宋王黼等撰，宋绍兴间刻本，半页十行行二十字，白口四周单边。", type: "文献" },
  "E-GJ-03": { label: "馆藏版本鉴定报告 V-2021-118", src: "馆藏规章 · 鉴定档案", quote: "经核，该残叶版式白口、四周单边，与绍兴刻本源系统相符；钤有『□□藏书』朱文方印。", type: "鉴定" },
  // —— 《海国图志》情况 ——
  "E-HG-01": { label: "馆藏 MARC 记录 245 字段", src: "特藏元数据库 · LS-1031", quote: "正题名：海国图志；责任者：魏源撰；版本：清道光二十四年古微堂刻本。", type: "元数据" },
  "E-HG-02": { label: "版刻年代考（《清代版刻图录》）", src: "文献记录 · 版刻图录", quote: "道光癸卯、甲辰两刻，图幅以墨线为主，间施朱色标注疆界。", type: "文献" },
  "E-HG-03": { label: "馆藏地图类资源著录规范", src: "馆藏规章 · 编目规范", quote: "涉及疆域、边界的舆图，发布前须核对现行边界规范表述，涉及国界要素须报专项复核。", type: "规章" },
  // —— 印谱情况 ——
  "E-YIN-01": { label: "馆藏 MARC 记录 100/245 字段", src: "特藏元数据库 · YIN-0087", quote: "题名：近人篆刻印谱；责任者待考；版本：民国间朱色钤印本，宣纸册页。", type: "元数据" },
  "E-YIN-02": { label: "馆藏印谱类著录规程", src: "馆藏规章 · 编目规范", quote: "印蜕描述须区分朱文／白文、朱色／墨色，边款题识须与印蜕分别著录。", type: "规章" },
  "E-YIN-03": { label: "印文释读外部鉴定意见", src: "文献记录 · 鉴定函件（未定稿）", quote: "该印蜕释文暂存疑，边款图像模糊，建议由金石专业馆员复核后再定释文。", type: "待复核" },
};

/* ---------- 3. 主张拆解模板（每幅影像 → 原子主张 + 证据绑定） ---------- */
const CLAIMS = {
  qingming: [
    { text: "该馆藏为《重修宣和博古图》刻本残叶。", type: "史实·题名", ev: "E-GJ-01", status: "supported" },
    { text: "版本为南宋绍兴年间刻本，半页十行、行二十字。", type: "史实·版本", ev: "E-GJ-02", status: "supported" },
    { text: "版式为四周单边、白口，框高约 24cm。", type: "史实·形制", ev: "E-GJ-03", status: "supported" },
    { text: "右下钤有藏书印一方，印文待释读。", type: "待释读", ev: "E-GJ-03", status: "review", reason: "印文释读证据未定稿，建议标注『待释读』而非直接断言。" },
  ],
  daoguang: [
    { text: "该馆藏为《海国图志》道光二十四年古微堂刻本插图。", type: "史实·题名", ev: "E-HG-01", status: "supported" },
    { text: "图幅以墨线为主，局部施朱色标注。", type: "史实·形制", ev: "E-HG-02", status: "supported" },
    { text: "图中所绘域外疆域与异域物产，属历史地理图像。", type: "文化敏感", ev: "E-HG-03", status: "review", reason: "涉疆域、边界要素，须核对现行边界规范表述并报专项复核（REVIEW_REQUIRED）。" },
    { text: "该图可作为近代『开眼看世界』思潮的视觉史料。", type: "解读·价值", ev: "E-HG-02", status: "review", reason: "属研究性解读，需与事实描述分层标注，避免以解读冒充史实。" },
  ],
  seal: [
    { text: "该馆藏为民国间朱色钤印本印谱册页。", type: "史实·版本", ev: "E-YIN-01", status: "supported" },
    { text: "主体为朱文篆书印蜕一枚，另有边款题识。", type: "史实·形制", ev: "E-YIN-02", status: "supported" },
    { text: "印蜕释文。", type: "待释读", ev: "E-YIN-03", status: "review", reason: "印文释读鉴定意见未定稿，建议由金石专业馆员复核后再定释文。" },
    { text: "作者归属（责任者待考）。", type: "待考", ev: "E-YIN-01", status: "review", reason: "馆藏著录责任者『待考』，不得据视觉推测指定作者。" },
  ],
};

/* ---------- 4. 合规审查项 ---------- */
const COMPLIANCE = {
  qingming: [
    { t: "文化敏感检查", d: "未检出民族、宗教、边界等敏感要素。", s: "p", rule: "敏感词库 · 文化类 v3.2" },
    { t: "权利归属检查", d: "馆藏原件，出版年份早于 1929，已进入公有领域。", s: "p", rule: "权利规则库 · 公有领域判定" },
    { t: "无障碍检查", d: "Alt Text 长度 34 字，含主体、纹饰与钤印信息，符合 WCAG 2.2。", s: "p", rule: "无障碍标准 · 图像替代文本" },
  ],
  daoguang: [
    { t: "文化敏感检查", d: "检出「疆域/边界」要素，须核对现行边界规范表述后发布。", s: "r", rule: "敏感词库 · 边界类 v3.2" },
    { t: "权利归属检查", d: "馆藏原件，道光刻本已进入公有领域。", s: "p", rule: "权利规则库 · 公有领域判定" },
    { t: "无障碍检查", d: "Alt Text 长度 30 字，含疆域要素与色彩信息，符合 WCAG 2.2。", s: "p", rule: "无障碍标准 · 图像替代文本" },
  ],
  seal: [
    { t: "文化敏感检查", d: "未检出敏感要素。", s: "p", rule: "敏感词库 · 文化类 v3.2" },
    { t: "权利归属检查", d: "馆藏原件，民国钤印本，权利状态待核。", s: "r", rule: "权利规则库 · 待核状态" },
    { t: "无障碍检查", d: "Alt Text 长度 28 字，含印蜕形制与色彩信息，符合 WCAG 2.2。", s: "p", rule: "无障碍标准 · 图像替代文本" },
  ],
};

/* ---------- 5. 无障碍输出模板 ---------- */
const ALT = {
  qingming: {
    alt: "线描青铜器图录残叶，器身饰夔龙纹，右侧竖排楷书题记三行，右下朱文方印",
    long: [
      ["形制", "南宋绍兴年间刻本残叶，经折装，框高约 24 厘米，四周单边、白口，半页十行、行二十字。"],
      ["画面", "主体为一青铜器线描图，器身满饰夔龙纹，线条工整，器形与《博古图》所载相符。"],
      ["文字", "右侧竖排楷书题记三行，内容为器物名与考释；右下角钤朱文方印一方，印文待释读。"],
      ["说明", "本条描述经馆藏元数据与《中国古籍善本书目》核验，印文释读项标注为『待释读』，非确证事实。"],
    ],
  },
  daoguang: {
    alt: "墨线绘制的域外疆域示意舆图，局部以朱色标注地界，四周双边墨框",
    long: [
      ["形制", "清道光二十四年古微堂刻本插图，单叶，四周双边墨框。"],
      ["画面", "以墨线勾勒域外疆域轮廓，沿海岸线标注若干地名，局部施朱色标注。"],
      ["文字", "图内外横排小字图注若干，说明地理方位与物产。"],
      ["说明", "本条描述经馆藏著录与《清代版刻图录》核验。图像涉及疆域要素，发布前须按馆藏规章完成边界规范表述复核。"],
    ],
  },
  seal: {
    alt: "宣纸册页上的朱文篆书印蜕，线条圆润，旁附边款拓片题识数行",
    long: [
      ["形制", "民国间朱色钤印本印谱册页单开，宣纸本。"],
      ["画面", "主体为朱文篆书印蜕一枚，印文布局匀整，线条圆润；旁附边款拓片，题识小字数行。"],
      ["文字", "边款题识为小字行楷，因拓片漫漶，部分字迹辨识存疑。"],
      ["说明", "本条描述经馆藏著录与印谱类著录规程核验。印蜕释文与作者归属均标注为『待考/待释读』，不作确证断言。"],
    ],
  },
};

/* ---------- 6. 状态 ---------- */
let state = { relic: null, perceived: false, verified: false, published: false, acceptedReview: {} };

/* ---------- 7. SVG 重绘馆藏影像 ---------- */
function relicSVG(id){
  if(id === "qingming"){
    return `
      <rect x="18" y="18" width="264" height="344" rx="2" fill="#efe6d6" stroke="#a99c88" stroke-width="1.4"/>
      <rect x="30" y="30" width="240" height="320" fill="none" stroke="#241f1a" stroke-width="2"/>
      <rect x="36" y="36" width="228" height="308" fill="none" stroke="#241f1a" stroke-width=".6" opacity=".5"/>
      <!-- 青铜器 -->
      <g transform="translate(150,210)" stroke="#241f1a" stroke-width="1.6" fill="none">
        <path d="M-52 -70 Q-58 -74 -54 -60 L-48 62 Q-46 80 0 80 Q46 80 48 62 L54 -60 Q58 -74 52 -70 Z" fill="#e9dcc6"/>
        <ellipse cx="0" cy="-72" rx="52" ry="13" fill="#e9dcc6"/>
        <ellipse cx="0" cy="-72" rx="30" ry="7" fill="none"/>
        <path d="M-30 -62 Q0 -48 30 -62" />
        <path d="M-44 -30 Q-24 -22 0 -26 Q24 -22 44 -30" opacity=".7"/>
        <path d="M-44 10 Q-24 18 0 14 Q24 18 44 10" opacity=".7"/>
        <g stroke-width="1.1" opacity=".85">
          <path d="M-36 -44 q10 -8 20 -2 q-8 8 -20 2z"/>
          <path d="M16 -44 q10 -8 20 -2 q-8 8 -20 2z"/>
          <path d="M-30 30 q12 -9 24 -2 q-10 9 -24 2z"/>
          <path d="M6 30 q12 -9 24 -2 q-10 9 -24 2z"/>
        </g>
        <path d="M-14 64 L-10 92 M14 64 L10 92 M-14 92 L14 92" stroke-width="2"/>
        <path d="M-44 -76 q-8 -18 -22 -22 M44 -76 q8 -18 22 -22" stroke-width="1.4"/>
      </g>
      <!-- 题记 -->
      <g font-family="'Noto Serif SC',serif" fill="#241f1a" font-size="15">
        <text x="216" y="72" writing-mode="tb" letter-spacing="6">重修宣和博古圖</text>
        <text x="196" y="72" writing-mode="tb" font-size="10" fill="#4a423a" letter-spacing="5">器物名考釋</text>
      </g>
      <!-- 钤印 -->
      <g transform="translate(238,320)"><rect width="26" height="26" rx="2" fill="#a8321e"/><text x="13" y="18" font-size="13" fill="#f4ece0" text-anchor="middle" font-family="'Noto Serif SC',serif">藏</text></g>
    `;
  }
  if(id === "daoguang"){
    return `
      <rect x="18" y="18" width="264" height="344" fill="#ece0cb" stroke="#a99c88" stroke-width="1.4"/>
      <rect x="30" y="30" width="240" height="320" fill="none" stroke="#241f1a" stroke-width="2.2"/>
      <rect x="37" y="37" width="226" height="306" fill="none" stroke="#241f1a" stroke-width=".6" opacity=".5"/>
      <g stroke="#241f1a" stroke-width="1.3" fill="none" opacity=".9">
        <path d="M58 88 Q120 60 186 92 Q234 116 244 160 Q228 232 170 268 Q112 300 74 262 Q44 222 52 168 Q56 116 58 88 Z" fill="#e6d8c0"/>
        <path d="M58 88 Q104 96 140 82 Q186 64 186 92" />
        <path d="M64 130 Q120 118 200 128" opacity=".5"/>
        <path d="M74 200 Q140 186 226 196" opacity=".5"/>
        <path d="M96 110 Q110 160 104 240" opacity=".4"/>
        <path d="M156 96 Q176 156 168 250" opacity=".4"/>
        <path d="M200 128 Q214 180 196 232" opacity=".4"/>
        <path d="M52 168 l-24 20 M244 160 l26 -10 M74 262 l-16 26 M170 268 l14 24" />
      </g>
      <g stroke="#a8321e" stroke-width="1" fill="none" opacity=".85">
        <path d="M84 108 q10 8 4 20"/>
        <path d="M142 118 q8 10 0 22"/>
        <path d="M192 178 q10 -6 18 4"/>
        <path d="M104 238 q9 6 4 18"/>
      </g>
      <g font-family="'Noto Serif SC',serif" fill="#241f1a" font-size="9">
        <text x="88" y="150" writing-mode="tb" opacity=".8">東南海隅圖</text>
        <text x="176" y="150" writing-mode="tb" opacity=".8">物產方位</text>
        <text x="120" y="286" font-size="8" opacity=".7">海國圖志 · 道光甲辰刻本</text>
      </g>
      <g stroke="#a8321e" stroke-width="1.4" fill="none" opacity=".7">
        <circle cx="150" cy="220" r="3"/><path d="M150 220 l14 10"/>
      </g>
    `;
  }
  return `
    <rect x="18" y="18" width="264" height="344" fill="#f2e9d8" stroke="#a99c88" stroke-width="1.4"/>
    <rect x="34" y="34" width="232" height="312" fill="none" stroke="#c9b795" stroke-width="1" stroke-dasharray="4 3"/>
    <g transform="translate(150,160)">
      <rect x="-70" y="-70" width="140" height="140" rx="4" fill="#efe3cf" stroke="#a8321e" stroke-width="1"/>
      <g stroke="#a8321e" stroke-width="2.4" fill="none" stroke-linecap="round">
        <path d="M-34 -38 q14 -6 24 4 q10 10 -2 20 q-10 8 -20 -2"/>
        <path d="M-6 -40 q16 0 14 18 q-2 18 -16 18"/>
        <path d="M18 -40 q-6 18 2 34 M30 -40 q-8 16 2 32"/>
        <path d="M-40 8 q10 -8 20 0 q10 8 22 0"/>
        <path d="M-34 34 q30 -10 66 0"/>
        <path d="M-24 20 q8 8 0 16 M8 20 q-8 8 0 16"/>
      </g>
      <rect x="-70" y="-70" width="140" height="140" rx="4" fill="none" stroke="#7a1f10" stroke-width="3"/>
    </g>
    <g font-family="'Noto Serif SC',serif" fill="#4a423a" font-size="9" opacity=".85">
      <text x="52" y="262" writing-mode="tb" letter-spacing="3">邊款題識</text>
      <text x="70" y="262" writing-mode="tb" letter-spacing="3" opacity=".7">漫漶難辨</text>
      <text x="216" y="262" writing-mode="tb" letter-spacing="3" opacity=".7">圓朱文</text>
    </g>
    <text x="150" y="332" font-family="'Noto Serif SC',serif" font-size="10" fill="#7a6f61" text-anchor="middle">近人篆刻印譜冊頁 · 民國鈐印本</text>
  `;
}

/* ---------- 8. 渲染馆藏列表 ---------- */
function renderRelicList(){
  const box = document.getElementById("relicList");
  box.innerHTML = "";
  Object.values(RELICS).forEach(r => {
    const el = document.createElement("div");
    el.className = "relic" + (state.relic === r.id ? " active" : "");
    el.onclick = () => selectRelic(r.id);
    el.innerHTML = `
      <div class="relic-thumb"><svg viewBox="0 0 300 380">${relicSVG(r.id)}</svg></div>
      <div class="relic-meta">
        <div class="t">${r.title}</div>
        <div class="d">${r.era} · ${r.type}</div>
        <div class="d" style="margin-top:2px;font-family:var(--display);font-style:italic">${r.call}</div>
        <span class="badge ${r.tagClass}">${r.badge}</span>
      </div>`;
    box.appendChild(el);
  });
}

/* ---------- 9. 选择藏品 ---------- */
function selectRelic(id){
  state = { relic: id, perceived: false, verified: false, published: false, acceptedReview: {} };
  const r = RELICS[id];
  renderRelicList();
  document.getElementById("artifactSvg").innerHTML = relicSVG(id);
  document.getElementById("artifactSvg").setAttribute("aria-label", r.title);
  document.getElementById("viewerCap").textContent = r.title + " · " + r.call;
  document.getElementById("viewerCaption").textContent = r.desc;
  document.getElementById("perceiveTag").textContent = "等待识别";
  document.getElementById("obsChips").innerHTML = "";
  document.getElementById("btnPerceive").disabled = false;
  document.getElementById("btnVerify").disabled = true;
  document.getElementById("evidenceBody").innerHTML = `
    <div class="empty-state"><div class="es-ic">◍</div>已选择影像，请运行多模态识别。</div>`;
  updateStages();
}

/* ---------- 10. 感知层 ---------- */
function runPerceive(){
  if(!state.relic) return;
  const r = RELICS[state.relic];
  const viewer = document.getElementById("viewer");
  viewer.classList.add("scanning");
  document.getElementById("perceiveTag").innerHTML = '<span class="spinner"></span> 识别中';
  document.getElementById("obsChips").innerHTML = "";
  document.getElementById("btnPerceive").disabled = true;

  setTimeout(()=>{ viewer.classList.remove("scanning"); }, 1400);

  let i = 0;
  const tick = () => {
    if(i >= r.observations.length){
      document.getElementById("perceiveTag").textContent = "识别完成";
      document.getElementById("btnPerceive").disabled = false;
      document.getElementById("btnVerify").disabled = false;
      state.perceived = true;
      document.getElementById("btnVerify").innerHTML = "进入核验层 →";
      updateStages();
      return;
    }
    const o = r.observations[i++];
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.style.animationDelay = "0s";
    chip.innerHTML = `<span class="k">${o.k}</span>${o.v}<span class="k">${(o.conf*100).toFixed(0)}%</span>`;
    document.getElementById("obsChips").appendChild(chip);
    setTimeout(tick, 320);
  };
  setTimeout(tick, 500);
}

/* ---------- 11. 核验层 ---------- */
function runVerify(){
  if(!state.relic || !state.perceived) return;
  const id = state.relic;
  const claims = CLAIMS[id];
  const comp = COMPLIANCE[id];

  const hasReview = claims.some(c => c.status === "review") || comp.some(c => c.s === "r");
  const overallPass = !hasReview;

  let html = "";

  // 发布状态横幅（核验结果）
  html += `
    <div class="publish-banner ${overallPass ? "pass" : "review"}" id="pubBanner">
      <div class="big">${overallPass ? "✓" : "!"}</div>
      <div class="txt">
        <div class="h">${overallPass ? "PASS · 允许发布" : "REVIEW_REQUIRED · 需人工复核"}</div>
        <div class="s">${overallPass
          ? "全部主张已绑定证据，合规检查通过，可进入发布层。"
          : `检出 ${claims.filter(c=>c.status==="review").length} 条证据待复核主张、${comp.filter(c=>c.s==="r").length} 项合规复核项。`}</div>
      </div>
    </div>`;

  // 主张拆解 + 证据绑定
  html += `<div style="font-family:var(--serif);font-weight:700;font-size:13.5px;margin:4px 0 10px">主张拆解与证据绑定</div>`;
  claims.forEach((c, idx) => {
    const ev = EVIDENCE[c.ev];
    html += `
      <div class="claim ${c.status}" data-claim="${idx}">
        <div class="claim-h">
          <span class="ctype">${c.type}</span>
          <span class="status-pill ${c.status === "supported" ? "ok" : "rv"}">${c.status === "supported" ? "✓ 证据支持" : "! 需复核"}</span>
        </div>
        <div class="claim-t">${c.text}</div>
        <div class="ev">
          <div class="src">▸ ${ev.src} · ${ev.label}</div>
          <div class="quote">「${ev.quote}」</div>
          <div class="rel">证据类型：${ev.type} · 归属校验：指向本藏品实体 ✓</div>
        </div>
        ${c.status === "review" ? `
        <div class="rel" style="font-size:10.5px;color:var(--review);margin-top:7px">复核提示：${c.reason}</div>
        <div class="claim-actions">
          <button class="mini-btn accept" onclick="acceptClaim(${idx})" id="acc-${idx}">标记为已复核（留痕）</button>
        </div>` : ""}
      </div>`;
  });

  // 合规审查
  html += `<div style="font-family:var(--serif);font-weight:700;font-size:13.5px;margin:16px 0 6px">合规审查（文化敏感 · 权利 · 无障碍）</div>`;
  comp.forEach(c => {
    html += `
      <div class="compliance-item">
        <div class="cm-ic ${c.s}">${c.s === "p" ? "✓" : "!"}</div>
        <div class="cm-body">
          <div class="t">${c.t}</div>
          <div class="d">${c.d}</div>
          <div class="cm-rule">↳ ${c.rule}</div>
        </div>
      </div>`;
  });

  // 证据链时间轴
  html += `
    <div style="font-family:var(--serif);font-weight:700;font-size:13.5px;margin:18px 0 10px">Evidence Trace · 全链路留痕</div>
    <div class="timeline">
      <div class="tl-node g"><div class="tl-t">感知层 · 多模态识别</div><div class="tl-d">${new Date().toLocaleString("zh-CN")}</div>
        <div class="tl-c">提取画面主体、题跋、钤印、形制等 ${RELICS[id].observations.length} 项观察要素（附置信度），仅作观察不作断言。</div></div>
      <div class="tl-node ${overallPass ? "g" : ""}"><div class="tl-t">核验层 · 主张拆解与证据绑定</div><div class="tl-d">${new Date().toLocaleString("zh-CN")}</div>
        <div class="tl-c">共拆解 ${claims.length} 条原子主张，绑定馆藏元数据/文献记录/馆藏规章共 ${new Set(claims.map(c=>c.ev)).size} 个证据源；${claims.filter(c=>c.status==="supported").length} 条获证据支持，${claims.filter(c=>c.status==="review").length} 条标记复核。</div></div>
      <div class="tl-node ${overallPass ? "g" : ""}"><div class="tl-t">核验层 · 合规审查</div><div class="tl-d">${new Date().toLocaleString("zh-CN")}</div>
        <div class="tl-c">完成文化敏感、权利归属、无障碍三项标准审查，输出 ${overallPass ? "PASS" : "REVIEW_REQUIRED"} 状态。</div></div>
    </div>`;

  // 发布按钮
  html += `
    <div class="btn-row">
      <button class="btn cinnabar" onclick="runPublish()">${overallPass ? "确认发布 →" : "复核后发布 →"}</button>
      <button class="btn ghost" onclick="downloadTrace()">导出 Evidence Trace</button>
    </div>`;

  document.getElementById("evidenceBody").innerHTML = html;
  state.verified = true;
  state.overallPass = overallPass;
  updateStages();
}

/* 标记复核 */
function acceptClaim(idx){
  state.acceptedReview[idx] = true;
  const btn = document.getElementById("acc-" + idx);
  if(btn){ btn.textContent = "✓ 已复核（已留痕）"; btn.disabled = true; btn.style.opacity = ".6"; }
}

/* ---------- 12. 发布层 ---------- */
function runPublish(){
  if(!state.verified) return;
  const id = state.relic;
  const a = ALT[id];
  const comp = COMPLIANCE[id];
  const claims = CLAIMS[id];
  const hasReview = claims.some(c => c.status === "review") || comp.some(c => c.s === "r");
  const needsAck = hasReview && Object.keys(state.acceptedReview).length < claims.filter(c=>c.status==="review").length;

  let warn = "";
  if(needsAck){
    warn = `<div class="publish-banner review" style="margin-bottom:12px"><div class="big">…</div><div class="txt"><div class="h">建议先完成复核留痕</div><div class="s">仍有待复核主张未标记『已复核』。可继续发布（演示），但正式环境应阻断。</div></div></div>`;
  }

  const status = hasReview ? "REVIEW_REQUIRED（经馆员复核后发布）" : "PASS";
  let html = warn;
  html += `
    <div class="publish-banner ${hasReview ? "review" : "pass"}">
      <div class="big">${hasReview ? "!" : "✓"}</div>
      <div class="txt"><div class="h">发布状态：${status}</div>
      <div class="s">内容已生成无障碍替代文本与长描述，经馆员一键确认后正式上线，全程留痕。</div></div>
    </div>

    <div style="font-family:var(--serif);font-weight:700;font-size:13.5px;margin:6px 0 8px">无障碍 Alt Text（WCAG 2.2 图像替代文本）</div>
    <div class="alt-box">
      <div class="alt-label">Alt Text · 屏幕阅读器语音替代</div>
      <div class="alt-text">${a.alt}</div>
    </div>
    <div class="hint">${a.alt.length} 字 · 含主体、形制与色彩信息 · 通过无障碍检查</div>

    <div style="font-family:var(--serif);font-weight:700;font-size:13.5px;margin:16px 0 6px">长描述（分层：形制 / 画面 / 文字 / 说明）</div>
    <div class="longdesc">
      ${a.long.map(([h, t]) => `<h4>${h}</h4><p>${t}</p>`).join("")}
    </div>

    <div style="font-family:var(--serif);font-weight:700;font-size:13.5px;margin:16px 0 8px">发布留痕</div>
    <div class="timeline">
      <div class="tl-node g"><div class="tl-t">发布层 · 内容生成</div><div class="tl-d">${new Date().toLocaleString("zh-CN")}</div><div class="tl-c">生成 Alt Text（${a.alt.length} 字）与分层长描述；证据来源保持与核验层一致。</div></div>
      <div class="tl-node g"><div class="tl-t">发布层 · 馆员确认</div><div class="tl-d">${new Date().toLocaleString("zh-CN")}</div><div class="tl-c">馆员一键确认上线，发布状态 ${status}。</div></div>
      <div class="tl-node g"><div class="tl-t">上线 · 读者可见</div><div class="tl-d">${new Date().toLocaleString("zh-CN")}</div><div class="tl-c">内容进入在线馆藏浏览，读者可查看解读并追溯证据链。</div></div>
    </div>

    <div class="btn-row">
      <button class="btn ghost" onclick="downloadTrace()">导出完整 Evidence Trace</button>
      <button class="btn ghost" onclick="switchRole('reader')">查看读者端 →</button>
    </div>`;

  document.getElementById("evidenceBody").innerHTML = html;
  state.published = true;
  updateStages(3);
  renderReader();
  buildTraceDownload();
}

/* ---------- 13. 读者端 ---------- */
function renderReader(){
  if(!state.published) return;
  const id = state.relic;
  const r = RELICS[id];
  const a = ALT[id];
  const claims = CLAIMS[id];
  const body = document.getElementById("readerBody");
  const srcSet = [...new Set(claims.map(c => EVIDENCE[c.ev].src))];
  body.innerHTML = `
    <div class="reader-card">
      <div class="viewer-caption" style="text-align:center;margin-bottom:10px">
        <div style="max-width:300px;margin:0 auto"><svg viewBox="0 0 300 380" style="width:100%;border:1px solid var(--line-2);border-radius:2px">${relicSVG(id)}</svg></div>
      </div>
      <h3>${r.title}</h3>
      <div class="meta">${r.era} · ${r.type} · ${r.call}</div>
      <div class="alt-box" style="margin-top:6px">
        <div class="alt-label">图像替代文本 · Alt Text</div>
        <div class="alt-text">${a.alt}</div>
      </div>
      <div class="longdesc">${a.long.map(([h,t])=>`<h4>${h}</h4><p>${t}</p>`).join("")}</div>
      <div class="cite-block">
        <div class="cite-label">建议引用 · Evidence Trace</div>
        本条目内容经 CultureAccess 可信发布机制核验，描述中的事实性主张绑定以下证据源：<br/>
        ${srcSet.map(s => "· " + s).join("<br/>")}<br/>
        <span style="color:var(--ink-3)">发布状态：${state.overallPass ? "PASS" : "REVIEW_REQUIRED（已复核）"} · 发布留痕见馆藏系统日志</span>
      </div>
      <div class="trace-mini">
        ${claims.map(c => `
          <div class="row">
            <span class="k">${c.status === "supported" ? "✓ 有据" : "! 已复核"}</span>
            <span>${c.text}<br/><span style="color:var(--ink-3);font-size:10.5px">证据：${EVIDENCE[c.ev].src}</span></span>
          </div>`).join("")}
      </div>
    </div>`;
}

/* ---------- 14. 导出 Evidence Trace ---------- */
function buildTraceDownload(){
  const id = state.relic, r = RELICS[id], a = ALT[id], claims = CLAIMS[id];
  const lines = [];
  lines.push("# 览卷 · CultureAccess — Evidence Trace");
  lines.push("");
  lines.push("藏品：" + r.title);
  lines.push("馆藏号：" + r.call);
  lines.push("年代：" + r.era);
  lines.push("发布时间：" + new Date().toLocaleString("zh-CN"));
  lines.push("发布状态：" + (state.overallPass ? "PASS" : "REVIEW_REQUIRED（经复核）"));
  lines.push("");
  lines.push("## 一、感知层观察要素");
  r.observations.forEach(o => lines.push(`- ${o.k}：${o.v}（置信度 ${(o.conf*100).toFixed(0)}%）`));
  lines.push("");
  lines.push("## 二、主张—证据对照");
  claims.forEach((c, i) => {
    const ev = EVIDENCE[c.ev];
    lines.push(`${i+1}. [${c.status === "supported" ? "证据支持" : "需复核"}] ${c.text}`);
    lines.push(`   证据源：${ev.src} · ${ev.label}`);
    lines.push(`   证据原文：「${ev.quote}」`);
  });
  lines.push("");
  lines.push("## 三、合规审查");
  COMPLIANCE[id].forEach(c => lines.push(`- [${c.s === "p" ? "PASS" : "REVIEW"}] ${c.t}：${c.d}（规则：${c.rule}）`));
  lines.push("");
  lines.push("## 四、发布产物");
  lines.push("Alt Text：" + a.alt);
  lines.push("长描述：");
  a.long.forEach(([h,t]) => lines.push(`  - ${h}：${t}`));
  window._traceText = lines.join("\n");
}
function downloadTrace(){
  if(!window._traceText) buildTraceDownload();
  const blob = new Blob([window._traceText], {type:"text/markdown;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "Evidence_Trace_" + state.relic + ".md";
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url), 1500);
}

/* ---------- 15. 阶段条 & 角色 ---------- */
function updateStages(force){
  const stages = document.querySelectorAll(".stage");
  stages.forEach(s => s.classList.remove("active","done"));
  const step = force || (!state.perceived ? 1 : (state.verified ? 3 : 2));
  if(step === 1){ stages[0].classList.add("active"); }
  else if(step === 2){ stages[0].classList.add("done"); stages[1].classList.add("active"); }
  else { stages[0].classList.add("done"); stages[1].classList.add("done"); stages[2].classList.add("active"); }
}
function switchRole(role){
  if(role === "reader"){
    document.body.classList.remove("mode-librarian");
    document.body.classList.add("mode-reader");
    document.getElementById("btnRead").classList.add("on");
    document.getElementById("btnLib").classList.remove("on");
    if(!state.published){
      document.getElementById("readerBody").innerHTML = `
        <div class="empty-state"><div class="es-ic">◍</div>尚无已发布内容。<br/>请返回馆员视图完成一次可信发布后，再查看读者端。</div>`;
    }
  } else {
    document.body.classList.add("mode-librarian");
    document.body.classList.remove("mode-reader");
    document.getElementById("btnLib").classList.add("on");
    document.getElementById("btnRead").classList.remove("on");
  }
}

/* ---------- 16. 初始化 ---------- */
renderRelicList();
updateStages(1);
// 默认载入第一幅，便于演示
selectRelic("qingming");
