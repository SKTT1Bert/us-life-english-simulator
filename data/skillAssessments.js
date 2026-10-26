// Versioned item bank. Never edit an existing form's meaning after release.
(function(root) {
  const q=(skill,prompt,options,answer,explanation,audioId=null)=>({skill,prompt,options,answer,explanation,audioId});
  const r=(p,o,a,e)=>q('reading',p,o,a,e), g=(p,o,a,e)=>q('language',p,o,a,e);
  const l=(id,p,o,a,e)=>q('listening',p,o,a,e,`human-${id}`);
  const forms=[];
  function add(levelId,variant,passage,questions,writing,speaking,rubric){forms.push({id:`skills-${levelId}-${variant.toLowerCase()}-v1`,levelId,variant,passage,questions,writing,speaking,rubric});}
  add('pre-a1','A','Hello! I am Lina. I have a red bag. My book is in the bag.',[
    l(942476,'说话的人来自哪里？',['东京','伦敦','北京'],0,'录音说 I am from Tokyo，from 表示来自。'),
    l(942441,'录音中的他在哪里？',['学校','东京','机场'],1,'He’s in Tokyo 表示他在东京，没有交代具体场所。'),
    r('包是什么颜色？',['蓝色','绿色','红色'],2,'原文写了 a red bag。'),r('书在哪里？',['包里','桌上','车里'],0,'My book is in the bag。'),
    g('选出“我是 Lina”。',['You are Lina.','I am Lina.','He is Lina.'],1,'I 表示我，搭配 am。'),g('选出 book 的复数。',['booked','book’s','books'],2,'规则名词通常加 -s。')
  ],'用 2–3 个短句介绍自己和一件物品。','说出自己的名字，并介绍身边的一件物品。',['写出或说出姓名','用一句话说明物品是什么','让听者或读者能理解主要信息']);
  add('pre-a1','B','I am Ben. This is my cup. It is blue. I need water.',[
    l(946521,'说话的人喜欢什么？',['空手道','卡拉 OK','足球'],1,'录音说 I love karaoke。'),l(946396,'录音介绍的是什么？',['麻将','一杯水','一辆车'],0,'This is mahjong。这里 mahjong 指麻将。'),
    r('Ben 的杯子是什么颜色？',['红色','黄色','蓝色'],2,'原文明确说 It is blue。'),r('Ben 需要什么？',['食物','水','一本书'],1,'I need water。'),
    g('补全：This ___ my cup.',['am','are','is'],2,'单数 this 搭配 is。'),g('选出“我需要水”。',['I need water.','I am water.','I water need.'],0,'按 I + need + water 的顺序组成陈述句。')
  ],'用短句介绍自己的杯子和一个需要。','介绍一个物品，并说出你现在需要什么。',['说明物品是什么','说出一个需要','使用能理解的短句']);
  add('a1','A','Mina works in a café from nine to five. On Friday, she finishes at three and meets Jo at the library at four.',[
    l(942576,'说话的人多久去一次东京？',['每天','每周','每年'],0,'every day 表示每天。'),l(946518,'说话的人想学什么？',['游泳','做饭','空手道'],2,'I want to learn karate。'),
    r('周五 Mina 几点结束工作？',['五点','三点','四点'],1,'周五的例外是 finishes at three。'),r('周五四点她打算做什么？',['去咖啡馆工作','回家','在图书馆见 Jo'],2,'meets Jo at the library at four。'),
    g('补全：She ___ in a café.',['work','works','working'],1,'第三人称单数的一般现在时通常加 -s。'),g('补全：The meeting starts ___ four.',['at','on','in'],0,'具体钟点使用 at。')
  ],'给朋友写 35–50 词消息：说明你哪天有空、见面时间和地点。','邀请朋友见面，清楚说出日期、时间和地点。',['包含日期、时间和地点','邀请或请求清楚','使用基本句子连接信息']);
  add('a1','B','The museum opens at ten on Saturday. Tickets are five pounds for adults and free for children. The café closes at two.',[
    l(946542,'录音在询问哪项爱好？',['看动漫','唱歌','踢足球'],0,'Do you watch anime? 是询问是否看动漫。'),l(942458,'说话的人在询问什么？',['出发地点','到达东京的时间','车票价格'],1,'What time will he arrive in Tokyo? 询问到达时间。'),
    r('孩子的门票多少钱？',['五英镑','两英镑','免费'],2,'free for children 表示儿童免费。'),r('下午三点还能使用哪项服务？',['咖啡馆；一定营业','原文没有说明博物馆关门时间','两处都肯定关门'],1,'只说明 café closes at two，没有给博物馆关闭时间。'),
    g('补全：The museum opens ___ Saturday.',['at','on','to'],1,'星期几前用 on。'),g('选出询问票价的句子。',['How old is the ticket?','Where much is it?','How much is a ticket?'],2,'How much 用于询问价格。')
  ],'给访客写 35–50 词消息，说明一处场所的开放时间和票价，并提出一个问题。','向售票员询问开放时间和价格，然后复述确认。',['时间和价格信息清楚','有一个明确问题','使用基本礼貌表达']);
  add('a2','A','Ravi planned to cycle to work, but it rained. He took the bus instead. It arrived twenty minutes late, so he called his manager before the meeting.',[
    l(951101,'说话的人听广播时发生了什么？',['开始做饭','睡着了','关了窗'],1,'While listening to the radio, I fell asleep。'),l(951110,'录音提到了哪两种交通方式？',['公共汽车和火车','火车和飞机','出租车和自行车'],0,'Some people went by bus, and others by train。'),
    r('Ravi 为什么没有骑车？',['车坏了','下雨了','车丢了'],1,'but it rained 给出了改变计划的原因。'),r('为什么在会议前打电话？',['他可能迟到，需要通知经理','他要订车票','经理要求他去骑车'],0,'公交迟到紧接着联系经理；后两项没有证据。'),
    g('补全：Yesterday he ___ the bus.',['takes','taking','took'],2,'yesterday 需要过去时，take 的过去式是 took。'),g('选出礼貌请求。',['You must move now.','Could you move your bag, please?','Moving bag you.'],1,'Could you…please? 是常用礼貌请求。')
  ],'写 70–90 词，解释一次计划变化：原计划、变化原因和接下来的安排。','用约 30 秒说明一次计划变化，交代原因和下一步。',['原计划和变化分明','原因与下一步明确','过去与将来的时间关系清楚']);
  add('a2','B','Ella bought headphones online. The left side did not work, so she emailed the shop. The shop offered a replacement, but Ella asked for a refund because she needed them that day.',[
    l(951113,'说话的人需要什么？',['备用电池','一部新手机','一张地图'],0,'spare batteries 指备用电池。'),l(951117,'录音要求对方怎么做？',['立刻挂断','拨新号码','在线等候'],2,'Please hold the line 表示请不要挂断、稍候。'),
    r('耳机有什么问题？',['颜色不对','左侧不工作','没有寄出'],1,'The left side did not work。'),r('Ella 为什么要求退款？',['店家没有提供换货','她当天就需要耳机','耳机比预想便宜'],1,'because she needed them that day，换货来不及满足需求。'),
    g('补全：The headphones ___ work yesterday.',['doesn’t','don’t','didn’t'],2,'过去时否定句使用 didn’t + 动词原形。'),g('选出请求退款的表达。',['Could I get a refund, please?','Can I get a recipe?','Where is the referee?'],0,'refund 是退款；其他词不符合语境。')
  ],'写 70–90 词邮件：描述商品问题、购买时间和希望得到的解决方式。','用约 30 秒说明商品问题并礼貌提出解决请求。',['问题描述具体','说明购买或使用背景','明确提出可执行的请求']);
  add('b1','A','The team can use a free room far from the station or pay for a room nearby. Two members cannot drive. Although the nearby room is smaller, the team chooses it so everyone can attend.',[
    l(978138,'说话的人为什么想请对方吃午餐？',['庆祝搬家','感谢帮助','介绍新同事'],1,'to thank you for all your help 明确给出目的。'),l(997131,'说话的人怎样看待这件事？',['认为它值得重视，即使对方觉得很小','完全同意对方不必重视','认为没有人关心'],0,'but for me it’s worth paying attention to 表达不同立场。'),
    r('团队选择较近房间的首要原因？',['面积最大','保证所有人能参加','价格最低'],1,'so everyone can attend 是明确的决策理由。'),r('哪句话最好概括取舍？',['他们完全不考虑费用','小房间总是更好','他们接受费用和面积上的代价以改善交通便利性'],2,'选择体现具体情境下的优先级，而不是绝对偏好。'),
    g('补全：___ it costs more, we chose the nearby room.',['Because','Although','Unless'],1,'费用较高与仍然选择构成让步。'),g('哪句最适合澄清对方意思？',['You are wrong.','Never mind.','Do you mean that we should book it today?'],2,'复述具体理解让对方确认或修正。')
  ],'写 120–150 词，按交通、费用和安静程度比较两个学习地点，并说明首选。','用约 30 秒推荐一个学习地点，同时承认一项缺点。',['按相同标准比较选项','建议与理由关联','承认一个实际限制']);
  add('b1','B','A library tried longer evening hours for one month. Visits rose, but staff reported fatigue. The manager proposes opening late twice a week and reviewing attendance after another month.',[
    l(1001658,'说话的人期待什么？',['在对方下次来访时搬家','下次去对方城市时见面','取消见面'],1,'the next time I visit your town 交代了见面的时间。'),l(1073732,'说话的人建议怎么做？',['立刻离开','再等一会儿','停止讨论'],1,'it would be better to wait a little longer 是委婉建议。'),
    r('延长营业时间带来了什么？',['访客减少','员工更轻松','访客增加，但员工疲惫'],2,'Visits rose 与 staff reported fatigue 构成得失。'),r('经理的提议是什么？',['每周两晚晚关门，之后复查效果','永远取消晚间服务','每晚开放且不再复查'],0,'提议包含频率调整和后续检查。'),
    g('补全：If attendance rises, we ___ review the schedule.',['will','would have','had'],0,'真实的将来条件常用 if + 现在时，主句 will。'),g('哪句适合在讨论中表示部分同意？',['I agree about access, but we also need to consider staff workload.','You know nothing.','No words can be used.'],0,'先承认一点，再提出需要考虑的另一点。')
  ],'写 120–150 词，建议一项图书馆服务改进，考虑使用者和工作人员，并安排复查。','用约 30 秒提出服务改进方案，说明收益、代价和下一步。',['回应不同参与者的需求','建议有具体措施','说明如何检查效果']);
  add('b2','A','A small voluntary survey found that remote workers reported higher satisfaction. Respondents came from one technology firm. The authors suggest a larger study before recommending the policy across all industries.',[
    l(1004905,'录音说鸽子借助什么找路？',['地球磁场','海水温度','人为路标'],0,'with the help of the Earth’s magnetic field 是录音内容，不要求科学背景知识。'),l(1038944,'项目为什么没有进行下去？',['参与人数太少','时间冲突','资金不足'],2,'fallen through for lack of adequate funds，for lack of 给出原因。'),
    r('哪项直接限制了结论适用范围？',['报告没有标题','样本来自同一家科技公司且自愿参与','远程办公不可能被研究'],1,'来源单一与自选样本限制推广。'),r('作者的立场最接近哪项？',['已有结果足以适用于所有行业','应禁止远程办公','结果值得关注，但推广前需要更多证据'],2,'建议 larger study before recommending，属于谨慎支持。'),
    g('选出与证据强度匹配的表述。',['This proves remote work benefits every worker.','The findings suggest a possible link in this sample.','No further study is ever necessary.'],1,'suggest、possible 和 in this sample 保留证据边界。'),g('哪句能区分相关与因果？',['Satisfaction rose among respondents, but the survey alone does not show that remote work caused the increase.','A survey always proves causation.','Every respondent must be identical.'],0,'明确承认观察到的联系不足以确定原因。')
  ],'写 170–210 词，向团队概述调查发现、两个限制和一个可检验的下一步。','用约 30 秒向同伴概述结果及最重要的限制。',['准确区分发现与推断','指出具体限制及影响','下一步能回应限制']);
  add('b2','B','Two colleges introduced peer feedback in different courses. Both reported improved drafts, but neither used a comparison group. The report recommends a pilot with shared rubrics and independent marking.',[
    l(1055420,'说话的人如何评价该研究的方法？',['对自己的研究也有帮助','只适用于过去','必须立即放弃'],0,'also helpful to us in conducting our research 表示可借鉴。'),l(1063574,'说话的人为何拒绝赞助？',['没有了解公司','调查了公司对员工的待遇','只因为活动延期'],1,'After researching…treatment of their workers 交代了决策依据。'),
    r('为什么不能确定修改进步由同伴反馈引起？',['没有对照组','两所学校必然没有共同点','所有草稿都一样'],0,'缺少对照，无法排除其他因素。'),r('共享评价标准和独立评分的主要作用？',['保证每个人分数相同','减少评价差异，增强比较可信度','消除所有研究限制'],1,'一致的标准与独立评分改善可比性，但不能消除所有限制。'),
    g('补全：The results are promising; ___, the design has limitations.',['therefore','however','for example'],1,'两部分是转折关系。'),g('选出恰当转述。',['The report proves peer feedback always works.','The report suggests testing peer feedback with a stronger evaluation design.','The report rejects all peer feedback.'],1,'建议 pilot 和 independent marking，没有绝对肯定或全面否定。')
  ],'写 170–210 词建议书，设计一次同伴反馈试点，包含衡量方式及可能的偏差。','用约 30 秒说明试点的一项关键设计及其理由。',['建议可执行','评价方式与目标对应','承认尚未解决的偏差']);
  add('c1','A','A review groups studies by task complexity rather than delivery format. Effects vary within both online and classroom categories. The authors argue that treating format as the sole explanatory variable obscures the conditions under which learning improves.',[
    l(942677,'铟在录音中与哪种用途相关？',['透明导电涂层，用于电子显示器','给植物种子加热','制造纸张'],0,'核心名词是 coatings，transparent 与 electrically conductive 是修饰。'),l(972207,'球果通常在什么条件后释放种子？',['接受低温','暴露于强光','受到高温作用'],2,'do not…until…great heat 表达必要的先行条件；只依据录音作答。'),
    r('作者重新分组的主要目的是什么？',['证明所有线上课程较差','解释粗略的授课形式分类所掩盖的差异','否定任务复杂性'],1,'按 task complexity 分组更能解释类内差异。'),r('哪项是与原文一致的谨慎推论？',['学习效果可能依赖多个条件，不能只看授课形式','授课形式在任何情况下都无作用','所有研究的结果完全一致'],0,'sole explanatory variable 被质疑，不等于形式完全无作用。'),
    g('哪句最准确地综合论点？',['The review establishes the universal superiority of classroom instruction.','The review questions whether delivery format alone adequately explains variation in learning outcomes.','The review finds that task complexity never matters.'],1,'保留了 questions、alone 和 variation，未夸大。'),g('哪种批评最有建设性？',['The authors are obviously incompetent.','This topic is uninteresting.','The proposed grouping is useful, but its explanatory value depends on consistent definitions of task complexity.'],2,'批评针对可检验的方法条件，承认贡献并说明限制。')
  ],'写 230–280 词评论：概述综述的论点，讨论分类方式的价值与局限，并提出后续研究问题。','用约 30 秒向研讨班解释核心论点和一个方法问题；完整演讲可分段练习。',['综合论点而非逐句复述','对方法提出具体、有依据的评价','结论保留适当的不确定性']);
  add('c1','B','An urban policy report credits a new transport scheme with reduced congestion. Yet fuel prices rose during the same period, and the evaluation excludes neighboring districts. A commentary calls for a counterfactual analysis and a broader geographic scope before attributing the change solely to the scheme.',[
    l(1041069,'获取资料之前需要做什么？',['签署保密协议','公开所有资料','先购买公司'],0,'first have to sign a non-disclosure agreement 表达前提。'),l(1063419,'调查把倒塌归因于什么？',['内部材料缺陷','外部因素','无法区分任何因素'],1,'extrinsic factors…rather than a flaw in its internal structure or materials，注意 rather than 的否定方向。'),
    r('评论为何提及燃油价格变化？',['它可能是拥堵下降的另一种解释','证明交通方案毫无价值','说明邻近地区必然拥堵'],0,'同期变化是潜在混杂因素，不足以直接否定政策。'),r('扩大地理范围最可能帮助检查什么？',['报告的字数','研究者的职称','拥堵是否只是转移到相邻地区'],2,'排除邻区可能漏掉影响外溢或转移。'),
    g('哪句恰当保留反事实分析的作用？',['Without a credible estimate of what would have happened otherwise, the scheme’s independent contribution remains uncertain.','A counterfactual is merely a personal preference.','More districts automatically prove causation.'],0,'明确了反事实对识别独立贡献的作用，没有声称能自动解决一切。'),g('选出最合适的限定结论。',['The scheme certainly caused the entire reduction.','The available evidence is consistent with a beneficial effect, but alternative explanations have not been ruled out.','No evidence can ever inform policy.'],1,'consistent with 与 not ruled out 区分支持和排除替代解释。')
  ],'写 230–280 词政策评议，区分观察、解释与建议，并设计一个更可信的评价方案。','用约 30 秒回答“这项政策有效吗？”，给出有分寸的结论和关键证据缺口。',['区分事实与因果解释','考虑替代解释和外溢效应','提出与证据强度相称的结论']);
  if(typeof module==='object'&&module.exports)module.exports=forms;
  if(root)root.SKILL_ASSESSMENTS=forms;
})(typeof window!=='undefined'?window:globalThis);
