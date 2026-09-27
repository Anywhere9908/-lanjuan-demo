# 览卷 · CultureAccess — 可信发布与智能解读智能体 Demo

> **模型负责「看见」，证据决定「事实」。**
>
> 面向高校图书馆古籍、特藏与历史影像的 **可信发布（Trusted Publishing）+ 智能解读** 演示原型。
> 以「看见 — 核验 — 发布」三级闭环，演示 *证据优先* 的馆藏内容生成机制。

---

## 一、这是什么

一个**零依赖、单页、可一键托管公网**的前端 Demo，用于演示图书馆特藏影像的线上发布流程：

| 阶段 | 演示内容 |
|------|----------|
| **① 看见 · 感知层** | 多模态识别影像主体 / 题跋 / 钤印 / 形制，输出带置信度的**观察要素**（只观察，不断言） |
| **② 核验 · 证据层** | **主张拆解（Claim Decomposition）** → 逐条绑定馆藏元数据 / 文献记录 / 馆藏规章，生成 **Evidence Trace**；文化敏感 · 权利 · 无障碍三项合规审查输出 **PASS / REVIEW_REQUIRED** |
| **③ 发布 · 生成层** | 生成符合无障碍标准的 **Alt Text** 与分层长描述，馆员一键确认上线，全程留痕 |

Demo 内置 **3 幅馆藏样例**（古籍残卷 / 历史舆图 / 印谱册页），其中 2 幅含「需复核」主张与合规项，用于演示 **REVIEW_REQUIRED** 分支。

## 二、核心机制（证据优先）

- **主张级溯源**：每条描述拆为原子主张并绑定具体证据源，避免「整段生成、无法校验」的看图说话。
- **溯源先于行文**：先锁定证据源与允许的语气强度，再生成连接性文字。
- **证据台账裁决**：无据 / 矛盾 / 混杂证据的主张自动标记回退给馆员。
- **实体归属校验**：不仅检查「有引用」，还检查引用是否指向该藏品实体。
- **无障碍达标**：Alt Text + 分层长描述，覆盖视障读者信息需求。

> 上述机制分别对照学界的 claim-level grounding、provenance-before-prose、
> evidence-ledger adjudication、deceptive grounding 与 alt-text generation 范式（见 `../` 目录下的研究报告）。

## 三、支持的形制与交互

- **双角色视图**：顶栏「馆员视图 / 读者视图」一键切换。馆员走完整发布流程；读者查看已发布的可信解读与引用信息。
- **Evidence Trace 导出**：核验 / 发布后可导出 `.md` 留痕文件，满足学术伦理与审计要求。
- **纯演示数据**：所有影像由 SVG 矢量重绘（规避版权），元数据与证据为演示样例。

## 四、如何得到公开网址（3 选 1）

本目录即一个静态站点，入口为标准 `index.html`，**无需构建、无外部依赖**（仅需浏览器加载 Google Fonts，离线时自动回退系统字体）。

### 方式 A · Vercel（最快，推荐）
```bash
npm i -g vercel      # 或使用网页拖拽
cd lanjuan
vercel --prod        # 按提示确认，即可获得 https://xxx.vercel.app
```
也可在 [vercel.com/new](https://vercel.com/new) 直接**拖拽本文件夹**，无需任何配置即可上线。

### 方式 B · GitHub Pages
1. 将本目录内容推到 GitHub 仓库（`main` 分支）。
2. 仓库 **Settings → Pages → Build and deployment → Source: GitHub Actions**。
3. 已内置 `.github/workflows/deploy.yml`，推送后自动部署，网址形如
   `https://<用户名>.github.io/<仓库名>/`。

### 方式 C · Netlify
在 [app.netlify.com/drop](https://app.netlify.com/drop) 直接拖拽本文件夹，秒级获得
`https://xxx.netlify.app` 公开网址（已含 `netlify.toml`）。

### 本地预览
```bash
cd lanjuan
python3 -m http.server 8080
# 浏览器打开 http://localhost:8080
```

## 五、文件说明

```
lanjuan/
├── index.html      # 页面结构 + 全套视觉系统（宋韵卷轴 × 档案库房美学）
├── app.js          # 数据（3 幅馆藏 + 证据源 + 主张模板 + 合规规则）与三级闭环逻辑
├── vercel.json     # Vercel 部署配置
├── netlify.toml    # Netlify 部署配置
├── .nojekyll       # GitHub Pages 关闭 Jekyll
├── .github/
│   └── workflows/deploy.yml   # GitHub Pages 自动部署
└── README.md
```

## 六、适用场景

古籍与特藏影像数字化上线、数字展陈展品说明与无障碍内容生产、馆藏资源向科研教学的
知识转化、面向公众的在线馆藏浏览与检索；亦可推广至博物馆、档案馆与文化展陈场景，
或作为高校信息素养教育与学术伦理课程的 AI 合规治理教学案例。

---

<sub>Demo 原型 · 演示数据为样例 · 「模型负责看见，证据决定事实」</sub>
