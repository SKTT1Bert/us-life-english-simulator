// Original stage assessments for the morphology strand. All study scenarios are
// teaching fiction. A stage score checks this material; it is not CEFR certification.
(function () {
  const cefr = {label:'Council of Europe · CEFR global scale',url:'https://www.coe.int/en/web/common-european-framework-reference-languages/table-1-cefr-3.3-common-reference-levels-global-scale'};
  const grammar = {label:'Cambridge · Word formation',url:'https://dictionary.cambridge.org/us/grammar/british-grammar/word-formation_2'};
  const nominal = {label:'Cambridge · Forming nouns',url:'https://dictionary.cambridge.org/uk/grammar/british-grammar/nouns-forming-nouns-from-other-words'};
  const cautious = {label:'Manchester Academic Phrasebank · Cautious language',url:'https://www.phrasebank.manchester.ac.uk/using-cautious-language/'};
  const stage = (id,label,title,description,canDo,pathwayLessonId,reading,listening,questions,writing,speaking,rubric,model,sources=[grammar,cefr]) => ({
    id,label,title,description,canDo,pathwayLessonId,
    assessment:{reading:{title:'独立阅读 · 教学虚构情境',text:reading},listening:{title:'独立听力 · 教学虚构情境',text:listening},
      questions:questions.map(([skill,prompt,options,answer,explanation],index)=>({id:'wp-'+id+'-assessment-'+(index+1),skill,prompt,options,answer,explanation})),
      writing,speaking,rubric,model},sources
  });
  window.WORD_PARTS_STAGES = [
    stage('pre-a1','Pre-A1','看懂基础词形','从整词、数量和常见动作变化开始；允许中文解释，英语输出以短语和短句为主。',
      ['能在短句中找到基础词和一个词尾','能区别物品复数与动作变化','能写出并说出三组简单词形'],
      'pre-a1-objects',
      'Mia has one bag and two pens. She reads at home. Yesterday she played a game. Now she is making tea. Her raincoat is by the door.\n\n词语支持：has 有；pen 笔；at home 在家；yesterday 昨天；now 现在；tea 茶；by the door 在门边。',
      'I am Tom. I have three cups. I washed a cup yesterday. My sister is reading now. We have two bedrooms. A bedroom is a room in our home.',
      [
        ['reading','two pens 中的 -s 在这里表示什么？',['正在写字','笔不止一支','昨天'],1,'pens 是物品名词的复数，与 two 一起说明数量。'],
        ['reading','She reads at home. 中 reads 的基础词是？',['read','home','she'],0,'read 是动作基础词，reads 与 she 配合。'],
        ['reading','哪一组来自文中并显示去掉词尾 e 后加 -ing？',['pen → pens','play → played','make → making'],2,'making 来自 make，拼写去掉词尾 e。'],
        ['listening','音频中 three cups 的 cups 表达什么？',['杯子的复数','过去喝茶','一种职业'],0,'three 与 cups 一起表示三个杯子。'],
        ['listening','washed 与 yesterday 一起最直接说明？',['明天的动作','三个人','过去的动作'],2,'washed 的 -ed 在这里是过去式，yesterday 也说明昨天。'],
        ['listening','bedroom 的哪个部分提供房间这一类别？',['bed','room','-ed'],1,'room 提供类别，bed 提示这一房间的用途。']
      ],
      '写 4 个英语短语或短句：一组物品单复数、一句昨天的规则过去式、一句 am/is/are + ing。可以使用词库：cup、pen、play、read。再用中文解释一个词尾。',
      '用 20–30 秒说出你的四项答案；然后说一个复合词，并用中文说明它是什么类别。',
      ['单复数和基础词对应正确','过去式与进行时短句有完整结构','能用自己的话解释一个词尾或复合关系'],
      'one pen / two pens; I played yesterday. I am reading now. pens 的 s 表示不止一支笔。bedroom 是一种 room。示范展示结构，提交时请换成自己的物品或句子。'),
    stage('a1','A1','用词族表达日常生活','把常见前后缀放进家庭、学习和活动安排，开始保留词类、搭配和使用语气。',
      ['能用前缀说明再次、解除和否定','能在短句中正确使用人名词、形容词与副词','能用词族组织一段日常说明并主动回忆'],
      'a1-routines',
      'Lena is a learner at a small language club. Her teacher gives her a useful card every week. Lena reads the instructions carefully. If a sentence is unclear, she rewrites it with her partner. The club is bilingual: people use English and Spanish. On Fridays, members reuse old paper to make new word cards.\n\n词语支持：instruction 指示；unclear 不清楚；partner 同伴；member 成员。',
      'Welcome to the art room. Please unwrap the new brushes. Put the colourful boxes on the shelf. The printer is beside the window. It prints pictures for the learners. The old map is useless because the building has changed. We will preview the next activity before lunch. Our meeting is every two weeks, not twice a week.',
      [
        ['reading','Lena rewrites a sentence 时，她做什么？',['拆开句子的包装','停止所有阅读','再写一次或改写句子'],2,'re- 在 rewrite 中提示再次写，语境说明她与同伴一起处理不清楚的句子。'],
        ['reading','reads the instructions carefully 中 carefully 的工作是？',['给出读者职业','说明阅读的方式','说明指示的数量'],1,'carefully 是方式副词，修饰 reads。'],
        ['reading','文中 bilingual 指？',['使用两种语言','只有一种语言','没有语言'],0,'文中明确是 English 和 Spanish，与 bi- 的二相符。'],
        ['listening','音频里的 printer 指什么？',['所有绘画者','一台打印设备','打印的过去时间'],1,'音频说明它在窗边并打印图片，是工具义。'],
        ['listening','unwrap the new brushes 的 un- 表示？',['解除包装状态','多次重复','颜色丰富'],0,'unwrap 是打开包裹或包装，不是把 brushes 否定为不存在。'],
        ['listening','为什么音频说 every two weeks，而不只说 biweekly？',['所有词缀都不能学习','会议每天举行','用明确频率避免每周两次与每两周一次的歧义'],2,'明确时间安排比有歧义的频率词更容易理解。']
      ],
      '写 60–80 词介绍你的学习角或一个教学虚构小组。至少用一个 re-/un- 词、一个 -er 人或工具名词、一个 -ful/-less 形容词和一个 -ly 副词。用具体对象和安排支撑意思。',
      '用 45–60 秒介绍学习安排，并解释你用过的两个派生词。若说明频率，使用明确时间表达。',
      ['四类目标形式在句子中使用正确','说明包含具体对象或时间，搭配自然','能解释至少两种词缀功能而非只拼读字母'],
      'Our group meets every two weeks. A teacher gives us a useful card. We read it carefully and rewrite one example. We use a printer for pictures and reuse paper for practice. In teacher, -er refers to a person; in printer, it refers to a tool. 这段示范不要求逐字照抄。'),
    stage('a2','A2','在语境中修正构词猜测','把否定、程度、位置、拼写和易混形式用于连贯说明，避免被词尾外形误导。',
      ['能区分前缀的范围与程度而不随意替换','能核对后缀边界拼写和整词搭配','能用短段落解释问题与修正方案'],
      'a2-study-summary',
      'During a weekend trip, Omar made an incorrect booking. The confirmation showed one room, but his family needed two. The receptionist was friendly and suggested a simple solution. She could simplify the change if Omar emailed his booking number. He had hardly any battery left, so he borrowed a charger. Later he wrote a clearer checklist to prevent the same mistake.\n\n词语支持：confirmation 确认信息；receptionist 接待员；charger 充电器。',
      'We underestimated the number of visitors, so some people waited outside. The entrance sign was invisible from the bus stop because a tree covered it. Next time we will widen the path and move the sign. We also need an internal message for our own volunteers and an international notice for visitors from other countries. Please check the wording carefully: an irregular schedule is not the same as an impossible schedule.',
      [
        ['reading','hardly any battery left 在文中表示？',['电量几乎没有了','电池工作得很努力','电量比以前更多'],0,'hardly 在这里表示几乎不，不能从 hard 推成努力地。'],
        ['reading','friendly 为什么不能根据 -ly 就当作方式副词？',['所有形容词都以 ly 结尾','它是过去式','它在这里描述接待员的性质'],2,'The receptionist was friendly. 中 friendly 是形容词。'],
        ['reading','simple → simplify 展示哪种变化？',['复数变化','形容词相关词族变为使之简化的动词','比较级变化'],1,'-ify 构成动词，同时需要核对规范词形 simplify。'],
        ['listening','underestimated the number of visitors 指？',['证明游客故意增加','完全没有做过估计','估计人数低于实际需要'],2,'under- 在这里表示估计不足，不说明意图。'],
        ['listening','音频中 internal message 的主要对象是？',['其他国家所有人','本组织自己的志愿者','只有公交司机'],1,'internal 的范围是组织内部，音频明确说 our own volunteers。'],
        ['listening','为什么不能把 irregular schedule 直接改成 impossible schedule？',['不规律和不可能是不同意义','两者字母数量不同而已','所有 in- 都是方向'],0,'共同否定线索不使整词同义，具体词义必须保留。']
      ],
      '写 100–130 词描述一次教学虚构的活动问题与调整。使用 underestimate、friendly、hardly、simplify 中至少三个，再用一组 internal/international 或 possible/impossible 说明范围或可行性。最后指出一个不能机械推断的词义。',
      '用 60–90 秒汇报问题和下一步；随后解释 friendly 与 hardly 为什么不能用一条 -ly 规则处理。',
      ['至少三个目标词在连贯情境中准确使用','区分程度、范围或可行性而不乱换前缀','口头与书面都能解释一个外形陷阱'],
      'We underestimated attendance and had hardly any seats left. A friendly volunteer helped us simplify registration. We sent an internal message to our team and prepared an international notice for visitors. Here hardly means almost no, while friendly describes a person. 二者不能只凭相同词尾认作同一词类。'),
    stage('b1','B1','把词根线索转化为可靠理解','建立拉丁与希腊词族网络，在文章与口头说明中保留现代词义、搭配和发音边界。',
      ['能利用熟悉词根提出合乎语境的意思猜测','能区分词源助记与现代整词定义','能写出连贯说明并说出需要查证的边界'],
      'b1-word-families',
      'A local museum is preparing a small exhibition about an old railway. Volunteers will transport several objects from a storage room and inspect them before display. A student of geography will describe how the railway connected neighbourhoods. Another volunteer will extract dates from a digital manuscript. The curator rejected an early plan because its photographs had unclear ownership. A visible label will identify each object, but the team still needs credible information about its history. The exhibition also includes a short section on geology because the builders cut through several rock formations. No single word root can explain the whole subject: the volunteers must read full definitions and check the records.',
      'Our first meeting will introduce the project and explain how we conduct interviews. Please do not assume that describe means writing by hand: participants can describe their experiences aloud. Later, those accounts may appear in an electronic manuscript. We will ask visitors for photographs, but we will not request an autograph from everyone. Here autograph means a personal signature, not an automatic chart. When you present the photography section, check the stress of photography separately from photograph. Familiar word parts help us remember the vocabulary, but they do not provide every modern meaning or pronunciation.',
      [
        ['reading','extract dates from a digital manuscript 中，from 引出什么？',['提取日期的人','资料来源','被否决的理由'],1,'dates 是提取对象，digital manuscript 是来源。'],
        ['reading','文中 visible 与 credible 的差别？',['两者都证明标签内容正确','前者必须是动词','前者谈看得见，后者谈可信程度'],2,'标签可见不能保证历史信息可靠。'],
        ['reading','geography 与 geology 在本材料中说明？',['有共同主题线索但具体任务不同','完全相同的研究范围','geo- 必定指画图'],0,'一项描述地方连接，另一项涉及岩石；共同 geo- 不让定义等同。'],
        ['listening','讲者为何用 describe 和 electronic manuscript 作例子？',['说明现代用法不能只由历史字面义决定','要求所有人手写','禁止口头描述'],0,'describe 可以口头进行，manuscript 可以是电子稿。'],
        ['listening','音频中 autograph 指？',['自动图表','亲笔签名','研究方法'],1,'讲者直接澄清现代整词义。'],
        ['listening','讲者要求呈现 photography 时另外检查什么？',['是否每个字母有意义','是否必须使用大写','整词重音和读音'],2,'词族成员可能改变重音，不能把 photograph 的重音原样移过去。']
      ],
      '写 160–200 词的博物馆志愿者说明，至少使用 transport/inspect/extract/conduct/credible 中四个词。解释两个词根如何助记，指出两项不能只由词根确定的信息；保留资料来源与实际对象。',
      '作 90 秒汇报，先清楚介绍项目任务，再用一个例子解释词源线索与现代意义的区别。朗读一个同族词时注明是否核对过词典音频。',
      ['至少四个目标词搭配正确且任务连贯','词根解释没有取代现代定义','明确两项仍需查证的意义、来源或读音边界'],
      'The volunteers will transport the objects and inspect them before display. They will extract dates from the manuscript and conduct interviews. The roots help connect ideas such as carrying and looking, but credible information still depends on records. A visible label can be easy to see while its content remains unverified. photograph and photography also require separate pronunciation checks.'),
    stage('b2','B2','在学术表达中控制词形与证据','用新材料检查词族、名词化、可数性和技术语境，区分词汇线索、方法和研究结论。',
      ['能把动词句转换为保留责任与对象的名词短语','能用合适搭配和数量表达报告研究信息','能判断技术词及评价前缀所不能保证的结论'],
      'b2-academic-word-building',
      'Teaching case — all organisations and observations in this passage are fictional. A college team evaluated a revised booking guide for its writing centre. The coordinator rewrote the guide in March, and two tutors introduced it at an optional workshop in April. The evaluation included comments from eighteen attendees. The report presented two findings: several attendees preferred the shorter instructions, and some requested an audio version. It provided information about these respondents, but it did not compare their later booking behaviour with that of students who had not attended.\n\nThe team described the planned audio-and-text version as multimodal. In this report, the term refers specifically to the two forms of presentation; it does not mean that all accessibility problems have been solved. The guide was also described as reusable, although a second centre would need to replace the local contact details.\n\nA draft summary claimed that the implementation of the guide had caused a measurable improvement in booking accuracy. The reviewers asked for a revision. No accuracy measure had been reported, and the comments concerned perceived usefulness. They also noted possible underreporting: some handwritten responses were not entered into the digital summary. This did not prove intentional concealment, and it was different from misclassification, which would involve assigning recorded responses to the wrong category. The reviewers recommended checking the missing forms and defining the intended outcome before making a stronger claim.',
      'This is a fictional project meeting. We need to distinguish the coordinator’s revision of the guide from the evaluation of its effects. The first names an action that took place in March. The second would require evidence about an outcome. At present, we have two findings about respondents’ preferences and some information about their requests. Please do not write two informations or claim that the comments prove improved accuracy.\n\nFor the next version, I propose that we measure successful bookings under a clearly stated procedure. A measurable outcome is one we can record; that description alone does not show that our instrument is reliable. We must also explain what counts as a successful booking. Finally, the team’s analysis of missing forms should be reported separately from any accusation of deliberate underreporting. We know that some forms were absent from the summary. We have not established why.',
      [
        ['reading','哪种名词化准确保留了三月那项行动的责任与对象？',['the guide’s revision of the coordinator in March','the tutors’ evaluation of booking accuracy in March','the coordinator’s revision of the guide in March'],2,'原文行动者是 coordinator，动作是修订 guide，时间为 March。'],
        ['reading','本报告 multimodal 的含义由什么限定？',['audio-and-text 两种呈现方式','这个词一定指所有感官','使用者已经没有任何障碍'],0,'作者明确规定本情境的两种方式，词形不保证无障碍效果。'],
        ['reading','为什么评审拒绝 measurable improvement in booking accuracy 的结论？',['因为长名词一律错误','没有报告准确性指标，反馈谈的是感知有用性','因为 reusable 只能指纸'],1,'问题是结论与实际证据不对应，而不是禁止名词化。'],
        ['listening','讲者认为应如何报告当前信息？',['two informations 和 a findingly','two findings 和 some information','proof of accuracy for every student'],1,'findings 可数，information 在这里通常不可数；范围限于实际反馈。'],
        ['listening','measurable outcome 为什么还不够？',['可测量就表示已可靠','它不是英语形容词','还需定义记录规则并检验测量质量'],2,'词形说明可记录的可能性，不替代测量方法与质量。'],
        ['listening','对缺失表格，讲者要求避免什么？',['未经证据就断言故意少报','继续检查记录','报告存在缺失'],0,'已知缺失不等于已知动机，需分别调查。']
      ],
      '写 250–300 词的评审回复。用 revision、evaluation、analysis、findings 和 measurable；保留谁在何时做了什么。解释原结论为何超出资料，区分 underreporting 与 misclassification，并提出两个具体后续步骤。',
      '作 2 分钟项目组发言：先解释两个名词化短语，再说明一个技术词的局部定义，最后提出测量与记录方面的改进。不得把教学案例当真实研究引用。',
      ['词族、数量与搭配准确，行动者和对象未丢失','明确区分反馈偏好与客观准确性结论','两项建议对应定义、测量或缺失记录的实际问题'],
      'The coordinator’s revision of the guide is documented, but an evaluation of its effects requires an outcome measure. The current findings concern respondents’ preferences. An analysis of missing forms should establish what was omitted without assuming intent. The next step is to define booking accuracy and test a recording procedure. Multimodal in this case means audio plus text; it does not establish universal accessibility. 这是论证骨架，完整回答应展开到规定字数。',[grammar,nominal,cautious,cefr]),
    stage('c1','C1','在复杂文本中保持专业精度','以专业阅读与研讨回应为目标，综合分层构词、操作定义、密集名词短语、语域和忠实改写。',
      ['能解释复杂派生词并保留程度、条件与局部定义','能把密集名词表达改为清楚而忠实的论证','能评价术语可比性、证据强度与推广限制并提出核查方案'],
      'c1-academic-word-building',
      'Teaching case — the project, institutions and observations below are fictional. A consortium commissioned an evaluation of a peer-feedback handbook used in two postgraduate seminars. Its summary described the handbook as reusable and claimed that implementation had increased engagement. In the methods appendix, however, Seminar A defined engagement as opening the online handbook at least once during a week. Seminar B used the same label for submitting a response that included a reasoned comment on a peer’s draft. The shared noun therefore concealed different recording rules rather than establishing a common measure.\n\nThe evaluators found the proposed mechanism plausible: clearer prompts might help students formulate feedback. Several participants also described the handbook as useful. These observations supported further investigation, but the report contained no comparison that isolated the handbook’s contribution from the tutors’ additional explanations. A draft sentence referring to the certainty of the handbook’s effectiveness was consequently replaced with a statement about the plausibility of the proposed explanation. That change preserved an unresolved question; it did not turn uncertainty into a negative finding.\n\nThe phrase postgraduate seminar participation improvement framework created another difficulty. Its head noun described a framework intended to improve participation, not evidence that improvement had occurred. Nor did the label specify whether participation meant attendance, document access or the quality of contributions. The reviewers asked the authors to expand the phrase into explicit sentences and to identify who would use the framework.\n\nEvening students were underrepresented in the comments, although a few had responded. The report therefore questioned transferability to evening courses with different schedules. It did not demonstrate non-transferability under every possible condition. Before recommending wider reuse, the reviewers proposed contacting nonrespondents, describing the barriers they encountered and comparing the two seminars using clearly stated criteria. They also requested a glossary that preserved each source’s local definition of engagement. Without that record, a later synthesis might treat unlike measures as equivalent merely because they shared a familiar word family.\n\nThe final editorial recommendation was to use nominalisation selectively. Terms such as implementation and evaluation helped connect sections, but they sometimes hid actors and conditions. Where responsibility mattered, a sentence naming the tutor or consortium was clearer. Every revision was required to retain the original source, scope and degree of certainty.',
      'This is a fictional review meeting. I want to explain three distinctions before we approve the wording. First, the handbook’s perceived usefulness is a report of participants’ views. It is relevant, but it does not by itself demonstrate learning gains. We should keep the reporting source visible when changing useful into usefulness.\n\nSecond, underrepresentation does not mean non-participation. Some evening students replied, but they were fewer than the comparison required. We need the relevant group sizes and the reasons for missing responses before we can interpret the imbalance. Similarly, questioning transferability to evening courses is narrower than declaring the framework unusable everywhere.\n\nThird, a glossary must do more than list roots and suffixes. When two reports use engagement differently, record the definition, the observation rule and the context beside each entry. The fact that engagement is a noun derived from engage does not resolve the methodological difference. In a spoken briefing, I would explain this with verbs: one seminar counted who opened the handbook; the other counted who wrote a reasoned response.\n\nFor the written report, we can retain technical noun phrases where their relationships are clear. For example, the consortium’s evaluation of the tutors’ implementation identifies two different actors and actions. If we shorten that to implementation evaluation, we must ensure that the surrounding paragraph still supplies those relationships. Formality should not erase responsibility. I recommend a targeted follow-up and a revised glossary, not a claim that the current observations establish either universal effectiveness or universal failure.',
      [
        ['reading','相同的 engagement 词形为什么不能让两个研讨班指标直接合并？',['操作定义与记录规则不同','名词不能用于研究','两处拼写其实不同'],0,'一处记录打开手册，一处记录有理由的反馈，词名相同不保证指标可比。'],
        ['reading','从 certainty 改为 plausibility 在文中起什么作用？',['认定手册已经失败','撤回超出证据的确定性，保留待检验解释','只改变词性而不改变判断'],1,'两个名词表达不同证据力度；该修订恢复与现有资料相符的谨慎程度。'],
        ['reading','postgraduate seminar participation improvement framework 的中心及其意义是？',['improvement，证明已有改善','participation，说明所有人都参加','framework，指旨在改善参与的框架'],2,'名称中的 improvement 表明意图，不保证效果；中心是 framework。'],
        ['listening','把 useful 改成 usefulness 时，讲者要求保留什么？',['把意见改成客观学习增益','删除来源使句子更正式','是谁报告这一评价及其证据范围'],2,'参与者观点与已证实学习效果不同，名词化不能抹掉来源。'],
        ['listening','讲者怎样向口头听众解释两个 engagement 指标？',['还原为打开手册与写出有理由回应两个动作','只朗读词源','用同一个抽象名词重复两遍'],0,'动词句使不同观察规则更易理解，同时保持内容。'],
        ['listening','the consortium’s evaluation of the tutors’ implementation 保留了哪种关系？',['所有工作都是 tutor 评价 consortium','consortium 评价，tutors 实施','研究已经证明普遍成功'],1,'所有格与 of 区分两个行动者和两层任务；压缩后需防止丢失。']
      ],
      '写 350–450 词的学术评审回复：解释 engagement、underrepresentation、transferability 三个词为何需要语境；纠正一个证据力度过强的改写；展开一个密集名词短语；提出两项可执行核查。保留来源、范围和不确定性，明确教学虚构身份。',
      '作 3 分钟研讨回应，先用通俗动词句解释两个指标，再用适当专业名词评价论证；自答两个追问：“结果是不是无效？”“是不是所有情境都不能用？”用证据范围回答。',
      ['复杂词和名词短语解释准确，局部定义与行动者清楚','忠实区分观点、机制合理性、因果效果和推广范围','建议具体且与限制对应，书面与口头语域都清楚自然'],
      'The shared term engagement masks two distinct observation rules, so a synthesis should preserve rather than erase the local definitions. Perceived usefulness and a plausible mechanism justify further investigation, but they do not establish effectiveness. Underrepresentation limits interpretation without implying complete non-participation, and uncertainty about transferability is narrower than universal non-transferability. The consortium should clarify the criteria, examine missing responses and retain the actors in its account of evaluation and implementation. 这是结构示范，完整回复还需展开例证与后续核查。',[grammar,nominal,cautious,cefr])
  ];
}());
