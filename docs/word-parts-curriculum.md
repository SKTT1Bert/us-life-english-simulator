# 词根词缀：零基础到 C1 的分阶段课程

原来的词根词缀课程已扩展为 **48 课，六阶段各 8 课**，并与主学习路线的同阶段课程连接。数据位于 `data/wordParts.js`；六套独立阶段测评位于 `data/wordPartsStages.js`。本课程支持学术英语学习，不是 CEFR 认证考试，不能单独替代完整的词汇、语法、听说读写和专业阅读训练。

截至 2026-10-22，课程实际包含 **144 道课内选择题、156 个例词条目、48 组写作与口头任务、48 个主动回忆提示**。六套阶段测评各有新阅读、新听力、三道阅读题和三道听力题，共 **36 道测评选择题**，另有写作、口头回应与三条自评标准。课内及阶段测评合计 **180 道选择题**。例词为不同任务有意复现，不代表 156 个不同词根。

## 阶段与衔接

CEFR 标签是本项目采用的教学目标组织方式。CEFR 并未规定某个词根必须属于某一级；顺序依据从熟悉整词到语境推断、再到学术改写的需要编排。

| 阶段 | 8 课内容（按顺序） | 同级主路线链接 |
| --- | --- | --- |
| Pre-A1 | 整词与句子、名词复数、动词 -s、规则过去式、-ing 形式、语素与基础形式、日常复合词、屈折与派生 | `pre-a1-objects` |
| A1 | 常见前缀、名词后缀、人和工具、形容词与副词、有与没有、时间前缀、数量前缀、词族卡片 | `a1-routines` |
| A2 | 否定前缀、空间关系、程度前缀、形容词后缀、动词后缀、副词与比较陷阱、拼写边界、同形与语境 | `a2-study-summary` |
| B1 | port/spect/struct、dict/scrib/script、ject/tract、duc/duct、cred/vid/vis、bio/geo、tele/photo/graph、复合词与词族重音 | `b1-word-families` |
| B2 | 抽象与人物名词、学术词族、名词化与行动者、搭配与可数性、评价前缀、技术语境、研究过程词族、拆词后核对 | `b2-academic-word-building` |
| C1 | 分层与范围、操作定义、证据评价、密集名词短语、语域与搭配、忠实改写、专业术语表、研究生阅读回应综合任务 | `c1-academic-word-building` |

每课保存 `levelId`、`stage` 和 `pathwayLessonId`。主路线负责更广泛的沟通与技能整合，词根课程深入练习构词和词义精度。两者的学习记录各自保留，不因打开链接或完成其中一门课就替另一门课判定掌握。

Pre-A1 从物品和短句开始，允许中文解释。A1 逐步使用短句与日常说明，学习词类位置、搭配、语气和清楚的时间表达。A2 用连贯情境纠正 friendly、hardly、booking 等外形陷阱，并练习变化条件和规则边界。

B1 的八个原有词根词族课均增加输出与回忆任务。现代构词与历史词源线索分开解释：describe 可以口头进行，manuscript 可以为电子稿，visible 不等于可信。词族重音与自然拼读课程关联，但词根拆分不被用作发音评分。

B2 课内输出一般为 120–180 词，关注名词化后保留行动者、对象与时间，正确使用 information/evidence/findings，区分 underreporting、misclassification 和 nonresponse，并用上下文解释技术词。阶段测评要求 250–300 词回应和约 2 分钟发言。

C1 不以长词数量为目标。学习者要保留操作定义、程度、范围、来源与证据力度，在复杂名词短语和口头动词句之间准确转换。课内输出逐步达到 200–350 词与 2–3 分钟。阶段测评采用约 375 词阅读和 248 词听力，要求 350–450 词评审回复与 3 分钟研讨回应。长度本身不能证明 C1；识别隐含差异、比较定义、避免过度推断及提出核查方案才是关键要求。

## 课程、练习、复习、测评

1. **课程与练习：** 每课至少三个讲解步骤和三个例词；完成三题后进行写作与口头任务。旧课三道题全部保留，新增任务要求把识别知识用于自己的表达。
2. **输出与自评：** 三条标准提醒检查目标词形、意义与语境、表达或边界。示范主要提供结构和关键论证，不是每项任务达到字数要求的完整范文；照抄不能替代个人输出。
3. **到期复习：** 遮住答案，先尝试 `review.prompt`，再看参考要点并评价实际回忆。复习涵盖意义、搭配和限制，不只检查熟悉感；调度由 `foundationProgress.js` 管理。
4. **阶段测评：** 使用独立于课内题目的材料。听力可先只听设备语音，查看文字稿属于辅助条件，应如实记录。六题客观分数和书面、口头自评分开；重做同一套题属于练习，不能当作新的独立等级认证。
5. **主路线迁移：** 完成本阶段后进入同级主路线的综合情境；遇到词形或表达薄弱点时回到本课程复习。

课时标签包含阅读、练习和初步输出的编辑估计：Pre-A1 12–18 分钟、A1 15–20 分钟、A2 20–25 分钟、B1 25–30 分钟、B2 30–40 分钟、C1 40–50 分钟。个人查词和修改会改变用时；这不是达到等级所需的总学时。

## 来源、原创性与边界

中文讲解、例句、任务和测评由本项目编写。涉及机构、项目结果和研究的案例明确标为**教学虚构**，不能当成真实文献。来源用于核对语言规则、定义与任务方向，不代表机构认证课程。

- [Cambridge：Word formation](https://dictionary.cambridge.org/us/grammar/british-grammar/word-formation_2) 支持前后缀、转换、复合与核对整词的框架。
- [Cambridge：Forming nouns](https://dictionary.cambridge.org/uk/grammar/british-grammar/nouns-forming-nouns-from-other-words) 支持名词化及正式表达的关系；保留行动者和对象的练习为本课程原创。
- [Manchester Academic Phrasebank：Being cautious](https://www.phrasebank.manchester.ac.uk/using-cautious-language/) 支持限制、范围与论断力度的教学方向。
- [CEFR Global Scale](https://www.coe.int/en/web/common-european-framework-reference-languages/table-1-cefr-3.3-common-reference-levels-global-scale) 提供从基础沟通到复杂文本和灵活学术表达的方向，不提供逐词级别认证。
- Cambridge 与 Merriam-Webster 的具体词条用于语义、词类、可数性和词源核对；原 24 课来源保留，新课包含 [information](https://dictionary.cambridge.org/dictionary/english/information)、[participation](https://dictionary.cambridge.org/dictionary/english/participation)、[underrepresented](https://dictionary.cambridge.org/dictionary/english/underrepresented) 等相关条目。
- [National Academies：Reproducibility and Replicability in Science](https://nap.nationalacademies.org/catalog/25303/reproducibility-and-replicability-in-science) 支持跨领域术语约定的讨论方向。本课不声称一种命名适合全部专业，也不由词尾推断方法。

来源核验日期为 2026-10-22。部分出版社页面直接抓取受限，核验使用了出版社自身索引的正文；展示会随网络变化。每课及每阶段保存 HTTPS 来源链接。设备 TTS 用于整词或明确的短语、文本，音色与口音因设备而异，不是发音质量评分工具。

本课程不穷尽英语词根词缀、历史音变、专业术语或全部学科惯例。C1 阶段支持相应学习目标；完成 48 课或选择题满分不等于已经具备全部研究生学术能力。专业知识、持续阅读、真实交流、教师反馈及更完整的外部评估仍需结合。

## 数据和兼容性

仍导出 `window.WORD_PARTS_LESSONS`。原 24 课 ID 与全部 72 道旧题的题干、选项顺序、正确索引、解析逐字保留；`quiz` 仍指向 `quizzes[0]`。重新排序不改变课的身份，新增 24 课使用新的稳定 ID。

新增字段包括 `levelId`、`pathwayLessonId`、`production` 和 `review`；阶段文件导出 `window.WORD_PARTS_STAGES`。旧选择题结果不会自动补写新增输出、自评、复习或测评记录，状态迁移由进度引擎处理。

新测评正确位置在每阶段均衡分布，六阶段使用不同固定排列。发布后不能为打乱答案而直接调整已有选项顺序，必须考虑已保存的作答索引。项目测试检查旧题兼容、六阶段各八课、唯一任务和回忆提示、同级主路线链接、独立测评及引擎保存；测试不能替代语言教学效果研究。
