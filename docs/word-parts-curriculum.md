# 词根词缀：24 课系统基础课程

本课程面向需要中文支持的成年英语学习者。它把构词知识组织成可逐课完成的基础路线：辨认形式与功能，观察常用词缀，建立可靠词族，再用语境和词典检验猜测。它不是英语所有词根词缀的百科全书，也不是经过 CEFR 认证的课程或等级测评。

课程数据位于 `data/wordParts.js`，共 **24 课、72 道选择题、84 个例词条目**。每课包含两项目标、三个讲解步骤、至少三个带释义与注意点的例词，以及三道有解析的自检题。例词会有意复现，例如 happiness 在名词后缀与拼写课中承担不同复习任务。中文说明、教学短句、问题与解析为本项目编写；词典与教材用于核对定义、构词关系、词源和适用边界，没有复制其整套例句或练习。

## 教学顺序与覆盖范围

| 课次 | 稳定 ID | 主题 | 本课重点与边界 |
| --- | --- | --- | --- |
| 1 | `word-parts-basics` | 语素、base、root | 意义或语法功能；base 可以已经包含词缀；不要只看字母相似 |
| 2 | `inflection-and-derivation` | 屈折与派生 | 数量、时态、比较与新词；teacher/taller 的 -er 不同；派生未必改变词类 |
| 3 | `useful-prefixes` | re-、un-、dis- | 再次、否定、解除；已有词的前缀不能任意互换 |
| 4 | `negative-prefix-variants` | in-/im-/il-/ir-、non- | 否定变体；排除类别；inspect 的 in- 不是否定 |
| 5 | `time-prefixes` | pre-、post-、fore- | 时间参照关系不同于句子时态 |
| 6 | `space-and-relationship-prefixes` | inter-、intra-、trans-、sub- | 之间、内部、跨越、下方或次一级；空间义可延伸 |
| 7 | `number-and-amount-prefixes` | mono-、bi-、multi-、semi- | 一、二、多、半；biweekly 的频率歧义需确认 |
| 8 | `degree-prefixes` | over-、under-、super-、hyper- | 过度、不足、超常；区分程度、空间与专门词义 |
| 9 | `noun-suffixes` | -ness、-er、-ment | 状态、人或工具、过程与结果；拼写和可数性 |
| 10 | `abstract-and-person-nouns` | -ion、-ity、-ist、-ism | 活动、性质、人物、观念；不向所有动词套 -tion |
| 11 | `adjective-adverb-suffixes` | -ful、-less、-ly | 性质与动作方式；carefully 的双 l 与 easily 的拼写 |
| 12 | `adjective-suffix-families` | -able/-ible、-al、-ive、-ous | 常见形容词线索；不能自由替换后缀或只取字面义 |
| 13 | `verb-suffixes` | -ize/-ise、-ify、-en | 使成为或变得；拼写变化及有条件的英美变体 |
| 14 | `adverbs-comparison-and-traps` | -ly、-ward(s)、-wise、-er/-est | 方式、方向与比较；friendly、hardly 等易错词 |
| 15 | `spelling-at-boundaries` | e、y、双写辅音 | 常见边界变化；-ing、重音、w/x/y 及英美拼写限制 |
| 16 | `roots-port-spect-struct` | port、spect、struct | 携带、看、建造；以词典词源为记忆线索 |
| 17 | `roots-dict-scrib-script` | dict、scrib/script | 说与写；同族变体；描述可口头进行，稿件可为电子稿 |
| 18 | `roots-ject-tract` | ject、tract | 投、拉的历史线索；抽象义与景点等现代义 |
| 19 | `roots-duc-duct` | duc/duct | 引导的词族；introduce、conduct、reduce/reduction |
| 20 | `roots-cred-vid-vis` | cred、vid/vis | 相信与看见；可信度不等于可见性；incredible 的语义发展 |
| 21 | `greek-bio-geo` | bio-、geo-、-logy、-graphy | 希腊来源组合形式；学科的完整范围不能字面推导 |
| 22 | `greek-tele-photo-graph` | tele-、photo-、-graph、-phone、auto- | 距离、光、记录与声音；区分组合形式和现代缩略词 |
| 23 | `compounds-families-and-stress` | 复合、词类转换、词族重音 | notebook、toothbrush、动词 email；photograph/photography 重音不同 |
| 24 | `combine-and-check` | 综合迁移 | 分层、句子检验、词典核对；知道何时放弃不可靠拆分 |

四个阶段依次为：构词入门（1–2）、词缀应用（3–15）、词根词族（16–22）、迁移巩固（23–24）。阶段长度由内容需要决定，不以平均课数代替教学顺序。

## 学习与自检方式

建议每次学习一课：先看目标与三个步骤，再遮住拆分说明尝试解释例词，完成三道自检，最后写一句自己的例句。下一次学习前，先回忆上一课一个词族和一条适用边界。课时是阅读与初步练习的编辑估计，不代表达到掌握所需的固定时间。

自检同时包含形式识别、句子中的用法，以及对规则边界的判断。答案后提供解析，错误选项用于暴露常见误解，例如把所有 in- 都当否定或把所有 -ly 都当副词。三道选择题只能检查这些有限目标，不能证明自发口语、词汇广度或长期记忆。课程的进度记录与完成条件由基础课程运行时管理，数据文件本身不评估学习者。

朗读文本用于整词或明确标注的短语。设备 TTS 的音色、口音和质量可能不同；它不是词源、音素切分或发音评分工具。像 conduct 这样可能随词类改变重音的词，例子提供短语语境；仍应参考词典读音。构词边界、拼写分块和口语音节边界不是同一概念。

## 来源与核验范围

来源核验日期：**2026-10-22**。每课 `sources` 保存了可点击的 HTTPS 标题与 URL；下列清单解释这些来源分别支持什么。它们不代表来源机构对本课程的认证或背书。

1. **现代形态学框架。** [Essentials of Linguistics 2e：语素](https://ecampusontario.pressbooks.pub/essentialsoflinguistics2/chapter/5-1-what-is-morphology/)、[root/base/affix](https://ecampusontario.pressbooks.pub/essentialsoflinguistics2/chapter/5-2-types-of-morphology-affixes-and-beyond/)、[派生](https://ecampusontario.pressbooks.pub/essentialsoflinguistics2/chapter/5-5-derivational-morphology/)、[屈折](https://ecampusontario.pressbooks.pub/essentialsoflinguistics2/chapter/5-6/)、[复合](https://ecampusontario.pressbooks.pub/essentialsoflinguistics2/chapter/5-7-compounding/)和[分析方法](https://ecampusontario.pressbooks.pub/essentialsoflinguistics2/chapter/how-to-solve-morphology-problems/)用于核对术语、分层及“不能只按字母相似分析”的方法。[格拉斯哥大学 STELLA](https://stella.glasgow.ac.uk/grammar/unit-4-3-affixes.html)提供派生与屈折及常见后缀的对照。
2. **前缀与常见词尾。** [加拿大政府语言资料：Word Formation](https://www.btb.termiumplus.gc.ca/guides/hyper/perl/source/wordform.html)用于时间、空间前缀；[Cambridge：Suffixes](https://dictionary.cambridge.org/grammar/british-grammar/suffixes)用于常见词类后缀；[Cambridge：Word formation](https://dictionary.cambridge.org/grammar/british-grammar/word-formation)用于构词类型。数量、程度与抽象名词课还列出 Merriam-Webster 对应形式的单独词条，避免只用一个泛化词缀表支持所有解释。
3. **拼写与歧义。** [Cambridge：前缀拼写](https://dictionary.cambridge.org/grammar/british-grammar/e)、[词尾与动词形式](https://dictionary.cambridge.org/grammar/british-grammar/spelling-and-verb-forms)及 [Hunter College 拼写资料](https://www2.hunter.cuny.edu/pending-migration/rwc/grammar-and-mechanics/spelling-no-exercise.pdf)支持常见拼写模式与例外条件。[Cambridge：biweekly](https://dictionary.cambridge.org/us/dictionary/english/biweekly)直接支持该频率词的两种释义。部分 Cambridge 页面限制自动抓取，核验时可通过出版社索引的页面正文查到内容；链接可用性与页面展示可能随网络环境变化。
4. **拉丁词根不是民间拆字。** 各课引用 Merriam-Webster 的具体词条与 Word History，例如 [transport](https://www.merriam-webster.com/dictionary/transport)、[inspect](https://www.merriam-webster.com/dictionary/inspect)、[construct](https://www.merriam-webster.com/dictionary/construct)、[predict](https://www.merriam-webster.com/dictionary/predict)、[describe](https://www.merriam-webster.com/dictionary/describe)、[manuscript](https://www.merriam-webster.com/dictionary/manuscript)、[reject](https://www.merriam-webster.com/dictionary/reject)、[extract](https://www.merriam-webster.com/dictionary/extract)、[introduce](https://www.merriam-webster.com/dictionary/introduce)、[conduct](https://www.merriam-webster.com/dictionary/conduct)、[reduce](https://www.merriam-webster.com/dictionary/reduce)、[credible](https://www.merriam-webster.com/dictionary/credible)、[evident](https://www.merriam-webster.com/dictionary/evident)和 [visible](https://www.merriam-webster.com/dictionary/visible)。课程展示便于识别的英语形式，不复原所有借入语言和拉丁语词形变化。
5. **希腊组合形式与发音限制。** [biology](https://www.merriam-webster.com/dictionary/biology)、[geology](https://www.merriam-webster.com/dictionary/geology)、[geography](https://www.merriam-webster.com/dictionary/geography)、[telephone](https://www.merriam-webster.com/dictionary/telephone)、[photo-](https://www.merriam-webster.com/dictionary/photo-)、[-graph](https://www.merriam-webster.com/dictionary/-graph)及 [autograph](https://www.merriam-webster.com/dictionary/autograph)用于核对形式与历史联系；[photograph](https://www.merriam-webster.com/dictionary/photograph) 与 [photography](https://www.merriam-webster.com/dictionary/photography)用于核对词族的重音差异。

## 编辑原则与局限

- **明确分析层次。** 现代可观察的构词（help + ful）与历史词源线索（con + struct）分开说明。括号中的 `(e)` 只提示某些词的尾部形式，不把 e 教成独立有义后缀。
- **词源不能决定现代定义。** describe 可口头使用；manuscript 可是电子稿；attraction 可指景点；incredible 可表达赞叹。词源是记忆与关联工具，不是语义运算器。
- **规则有选择限制。** “常见”“通常”是适用范围，不是可以省掉的修饰语。否定前缀、后缀拼写、可数性、比较级和英美拼写都需核对具体词。
- **不把词汇条目当健康、法律或事实判断工具。** hyperactive 等只是语言例子；visible 与 credible 的不同恰好提醒读者：能看见不等于已证实。
- **范围有限。** 课程选择高频、可迁移的词缀和若干拉丁/希腊词族；没有覆盖全部派生形式、所有借词史、全部学科术语、完整历史音变或所有英语变体。未列出的形式不等于不重要或不存在。
- **学习效果未作实证承诺。** 内容自检、代码检查和浏览器测试不能替代学习者研究；不声称读完后自动掌握某个 CEFR 等级或所有长词。

## 数据与兼容性

运行时仍导出 `window.WORD_PARTS_LESSONS`。原有六个稳定 ID 保留：`word-parts-basics`、`useful-prefixes`、`noun-suffixes`、`adjective-adverb-suffixes`、`roots-port-spect-struct`、`combine-and-check`。旧课可按教学需要调整顺序，身份不依赖数组下标。

原有 `title`、`subtitle`、`duration`、`intro`、`steps`、`examples`、`tip`、`quiz` 保留；新增 `stage`、两个 `goals`、课题相关 `sources` 和三个 `quizzes`。`quiz` 始终指向 `quizzes[0]`，旧六课的首题保留以兼容旧内容引用。旧单题结果如何迁移、何时算新课程完成，由进度引擎处理，不能仅因 ID 保留就把一题等同于三题全部完成。

数据文件内的小型转换函数仅把紧凑的编辑条目转换成既有字段结构，并按稳定 ID 排序；不依赖外部请求，不读写本地存储。更改课题语义时应重新审视旧进度的含义；新增题目或调整题序也应与进度版本策略一起评估。

维护时运行项目的 `tests/foundations.test.js` 与 `tests/foundations-browser.cjs`，并人工检查释义、拆分、题目唯一性、正确答案与解析是否相符。程序能验证结构和交互，不能替代语言内容审校。
