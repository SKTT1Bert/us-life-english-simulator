// Broad General American IPA; audio plays whole words.
window.PHONICS_LESSONS = [
  {
    id:'sounds-and-blending',title:'先听音，再拼读',subtitle:'Letter sounds & blending',duration:'5 分钟',
    intro:'把字母或字母组合与语音联系起来，再把声音合成单词。从三个音的短词开始，不需要先背完整套音标。',
    steps:[
      {title:'区分字母名和单词中的音',text:'c 的字母名是 /si/，但在 cat 中表示 /k/。拼读时用 /k/、/æ/、/t/，不要读成三个字母的名字。斜线中的符号标记声音。'},
      {title:'把声音接起来',text:'先辨认各个音，再缩短停顿：/m/—/æ/—/p/ → map。读辅音时尽量不要额外加“呃”，避免读成多个音节。'},
      {title:'用完整单词核对',text:'先自己拼读，再听示范并跟读。朗读按钮播放完整单词，用来核对整体读音，不是单个音素的示范。'}],
    examples:[
      {word:'cat',breakdown:'/k/ + /æ/ + /t/ → /kæt/',meaning:'猫',note:'三个音合成一个音节；a 不是字母名 /eɪ/。',speak:'cat'},
      {word:'map',breakdown:'/m/ + /æ/ + /p/ → /mæp/',meaning:'地图',note:'稍微延长 /m/，再接元音；结尾不加额外元音。',speak:'map'},
      {word:'sit',breakdown:'/s/ + /ɪ/ + /t/ → /sɪt/',meaning:'坐',note:'CVC（辅音—元音—辅音）结构，只有一个音节。',speak:'sit'}],
    tip:'英语拼写有规律，也有例外。自然拼读适合第一次尝试，遇到生词还要用词典或可靠音频核对。',
    quiz:{question:'拼读 cat 时，应该连接哪一组声音？',options:['/k/ + /æ/ + /t/','/si/ + /eɪ/ + /ti/','/k/ + /eɪ/ + /t/'],answer:0,explanation:'cat 的 c、a、t 对应 /k/、/æ/、/t/。字母名用于口头拼写，词中的声音用于拼读。'}
  },
  {
    id:'short-vowels',title:'练稳五个短元音',subtitle:'Short vowels in CVC words',duration:'6 分钟',
    intro:'常见单音节 CVC 词中，a、e、i、o、u 往往对应“短元音”。借助熟悉的词建立声音记忆，再尝试新词。',
    steps:[
      {title:'给元音找一个锚点',text:'用 cat /æ/、bed /ɛ/、pin /ɪ/、hot /ɑ/、cup /ʌ/ 记住常见对应。本教程采用美式音标，其他口音的 hot 可能不同。'},
      {title:'比较元音，不靠字母名猜',text:'比较 pen /pɛn/ 和 pin /pɪn/：开头结尾相同，中间元音不同。录下自己的两个词，与可靠示范比较。'},
      {title:'从中间向两边合成',text:'先认元音，再加开头结尾：/ʌ/ → /kʌ/ → /kʌp/。熟练后连贯读整个词，不必一直逐音停顿。'}],
    examples:[
      {word:'bed',breakdown:'/b/ + /ɛ/ + /d/ → /bɛd/',meaning:'床',note:'e 读 /ɛ/，与 pen 相同。',speak:'bed'},
      {word:'pin',breakdown:'/p/ + /ɪ/ + /n/ → /pɪn/',meaning:'别针',note:'/ɪ/ 不等于 i 的字母名 /aɪ/。',speak:'pin'},
      {word:'hot',breakdown:'/h/ + /ɑ/ + /t/ → /hɑt/',meaning:'热的',note:'美式 /ɑ/；英式常见 /ɒ/。',speak:'hot'},
      {word:'cup',breakdown:'/k/ + /ʌ/ + /p/ → /kʌp/',meaning:'杯子',note:'u 读 /ʌ/，不是字母名 /ju/。',speak:'cup'}],
    tip:'“短元音”是教学分类，不是把音读短一点。也非所有 CVC 拼写都如此：put 的 u 是 /ʊ/，需要单独记。',
    quiz:{question:'哪个词的元音与 bed 相同？',options:['pin','pen','pan'],answer:1,explanation:'bed 和 pen 都含 /ɛ/；pin 是 /ɪ/，pan 是 /æ/。'}
  },
  {
    id:'digraphs-and-blends',title:'两字母，一个音？',subtitle:'Digraphs & consonant blends',duration:'6 分钟',
    intro:'相邻辅音可能合起来表示一个音，也可能各自的音都保留。字母数量不一定等于声音数量。',
    steps:[
      {title:'双字母组合当作一个单位',text:'sh 常表示 /ʃ/，ch 常表示 /tʃ/。ship 中的 sh 一起识别；不分别读 s 和 h。教学中 /tʃ/ 作为一个辅音音素。'},
      {title:'辅音连缀保留各自的音',text:'stop 的 st 是辅音连缀，/s/、/t/ 都要读到。直接从 /s/ 接到 /t/，中间不插入元音。'},
      {title:'留意组合的不同声音',text:'th 在 thin 中是 /θ/，在 this 中是 /ð/：前者声带不振动，后者振动。舌尖靠近上下门牙之间，让气流通过。'}],
    examples:[
      {word:'ship',breakdown:'sh + i + p → /ʃɪp/',meaning:'船',note:'四个字母、三个音；sh 是一个辅音组合。',speak:'ship'},
      {word:'chip',breakdown:'ch + i + p → /tʃɪp/',meaning:'芯片；碎片',note:'ch 表示 /tʃ/，不同于 ship 的 /ʃ/。',speak:'chip'},
      {word:'stop',breakdown:'/s/ + /t/ + /ɑ/ + /p/ → /stɑp/',meaning:'停止',note:'st 两个辅音都保留；整个词一个音节。',speak:'stop'},
      {word:'thin',breakdown:'th + i + n → /θɪn/',meaning:'薄的；瘦的',note:'th 是清辅音 /θ/，不要用 /s/ 或 /t/ 替代。',speak:'thin'}],
    tip:'组合也有例外：ch 在 school 中读 /k/，在 chef 中读 /ʃ/。先掌握高频对应，再结合具体词核对。',
    quiz:{question:'哪个开头是辅音连缀，两个辅音都保留？',options:['ship 的 sh','chip 的 ch','stop 的 st'],answer:2,explanation:'st 保留 /s/、/t/；sh 表示 /ʃ/，ch 在 chip 中表示 /tʃ/。'}
  },
  {
    id:'silent-e',title:'词尾不发音的 e',subtitle:'The silent-e pattern',duration:'5 分钟',
    intro:'不少“元音—辅音—e”结构的单音节词，末尾 e 不发音，前面的元音读“长元音”，即常见字母名音。',
    steps:[
      {title:'观察加 e 前后的变化',text:'cap /kæp/ 与 cape /keɪp/，kit /kɪt/ 与 kite /kaɪt/。末尾 e 没有增加音节，前面的元音变了。'},
      {title:'先认结构，再合成',text:'cape 中先识别 a_e 对应 /eɪ/，再合成 /k/ + /eɪ/ + /p/。下划线表示元音与 e 之间有一个辅音字母。'},
      {title:'留意 u 的读法',text:'u_e 常见 /ju/，如 cube；有些词读 /u/，如 rule。对应受相邻辅音和口音影响，结合具体词听辨。'}],
    examples:[
      {word:'cape',breakdown:'a_e → /eɪ/；cape /keɪp/',meaning:'披风；海角',note:'与 cap 对比；末尾 e 不发音。',speak:'cape'},
      {word:'kite',breakdown:'i_e → /aɪ/；kite /kaɪt/',meaning:'风筝',note:'与 kit 对比；i 读字母名音。',speak:'kite'},
      {word:'hope',breakdown:'o_e → /oʊ/；hope /hoʊp/',meaning:'希望',note:'与 hop /hɑp/ 对比中间元音。',speak:'hope'},
      {word:'cube',breakdown:'u_e → /ju/；cube /kjub/',meaning:'立方体',note:'/ju/ 包含 /j/ 和 /u/；词仍是一个音节。',speak:'cube'}],
    tip:'末尾 e 不是万能开关。have /hæv/、give /ɡɪv/、love /lʌv/ 不按上述模式读；例外连同读音一起记。',
    quiz:{question:'cap 加 e 成为 cape 后怎么读？',options:['/keɪp/','/kæp/','/kæpi/'],answer:0,explanation:'a_e 对应 /eɪ/，末尾 e 不发音，cape /keɪp/ 仍是一个音节。'}
  },
  {
    id:'vowel-teams',title:'常见元音字母组合',subtitle:'Vowel teams & exceptions',duration:'6 分钟',
    intro:'两个元音字母有时一起表示一个元音。组合连同例词记住，比逐个读出字母名更有用。',
    steps:[
      {title:'先记三组常见对应',text:'ai 在 rain 中读 /eɪ/，ee 在 seed 中读 /i/，oa 在 boat 中读 /oʊ/。圈出组合，再与两边的辅音连起来。'},
      {title:'同样的音可以有不同拼写',text:'rain 的 ai 和 day 的 ay 都常表示 /eɪ/；seed 的 ee 与 sea 的 ea 可以表示 /i/。同一个音并非只能有一种拼写。'},
      {title:'一组字母可有多种读音',text:'ea 在 sea 中读 /i/，在 bread 中读 /ɛ/，在 break 中读 /eɪ/。分组记例词，陌生词先尝试常见读法，再查证。'}],
    examples:[
      {word:'rain',breakdown:'ai → /eɪ/；rain /reɪn/',meaning:'雨；下雨',note:'ai 整体表示 /eɪ/，不拆成两个元音。',speak:'rain'},
      {word:'seed',breakdown:'ee → /i/；seed /sid/',meaning:'种子',note:'美式音标常写 /i/，一些词典写 /iː/。',speak:'seed'},
      {word:'boat',breakdown:'oa → /oʊ/；boat /boʊt/',meaning:'小船',note:'只有一个音节。',speak:'boat'},
      {word:'bread',breakdown:'ea → /ɛ/；bread /brɛd/',meaning:'面包',note:'ea 不同于 sea；br 两个辅音都保留。',speak:'bread'}],
    tip:'不要把“两元音一起，第一个读字母名”当通则。元音字母也可能属不同音节，如 poet /ˈpoʊ.ət/。',
    quiz:{question:'哪个词的 ea 读 /ɛ/？',options:['sea','bread','break'],answer:1,explanation:'bread /brɛd/ 是 /ɛ/；sea /si/ 是 /i/；break /breɪk/ 是 /eɪ/。'}
  },
  {
    id:'syllables-stress-schwa',title:'音节、重音与弱读',subtitle:'Syllables, stress & schwa',duration:'7 分钟',
    intro:'长词可以按音节分块处理。要读得自然，还要找到重音，留意非重读音节中的弱元音 /ə/。',
    steps:[
      {title:'先分块，再合起来',text:'sunset 可以先读 sun、set，再连接。音节通常围绕一个元音声音形成；数元音字母不能准确数音节。下面分块用于辅助读音。'},
      {title:'让重读音节更突出',text:'ˈ 在主重音音节之前，ˌ 表示次重音。banana /bəˈnæn.ə/ 重音在第二音节；点号标分界，词典分界方式可能略有不同。'},
      {title:'认识弱元音 /ə/',text:'非重读音节的 a、e、o 等可能弱读成 /ə/，如 lemon 的第二音节。并非所有非重读元音都变 /ə/，music 末尾仍是 /ɪ/。'}],
    examples:[
      {word:'sunset',breakdown:'sun + set → /ˈsʌnˌsɛt/',meaning:'日落',note:'两个音节；主重音在 sun，两个元音保持清楚。',speak:'sunset'},
      {word:'lemon',breakdown:'lem + on → /ˈlɛm.ən/',meaning:'柠檬',note:'第二音节不重读，o 对应 /ə/。',speak:'lemon'},
      {word:'music',breakdown:'mu + sic → /ˈmju.zɪk/',meaning:'音乐',note:'s 读 /z/，末尾 i 保留 /ɪ/。',speak:'music'},
      {word:'banana',breakdown:'ba + na + na → /bəˈnæn.ə/',meaning:'香蕉',note:'三个音节；第二音节重读，首尾 a 弱读。',speak:'banana'}],
    tip:'重音和弱读不能总从拼写推出。这里是常见美式宽式标音；真实语音受语速、口音影响。查词同时记完整发音和重音位置。',
    quiz:{question:'banana /bəˈnæn.ə/ 的主重音在哪？',options:['第一个音节','三个一样重','第二个音节'],answer:2,explanation:'ˈ 标在 /næn/ 前，所以第二音节重读。首尾 /ə/ 轻读，形成轻—重—轻。'}
  }
];

// A complete core route, not an exhaustive inventory of English spellings or accents.
// The six original lesson IDs and first questions remain unchanged for saved progress.
(() => {
  const legacy = new Map(window.PHONICS_LESSONS.map(lesson => [lesson.id, lesson]));
  const S = {
    ufli: { label: 'University of Florida · Literacy glossary', url: 'https://ufli.education.ufl.edu/resources/teaching-resources/glossary/' },
    ies: { label: 'IES · Foundational reading skills practice guide', url: 'https://ies.ed.gov/ncee/WWC/PracticeGuide/21' },
    syllables: { label: 'Reading Rockets · Six syllable types', url: 'https://www.readingrockets.org/topics/spelling-and-word-study/articles/six-syllable-types' },
    vowels: { label: 'Iowa State University · Vowels', url: 'https://iastate.pressbooks.pub/teachingpronunciation/chapter/chapter-3-vowels/' },
    consonants: { label: 'Iowa State University · Consonants', url: 'https://iastate.pressbooks.pub/teachingpronunciation/chapter/4-consonants/' },
    endings: { label: 'Iowa State University · -ed and -s endings', url: 'https://iastate.pressbooks.pub/teachingpronunciation/chapter/chapter-5-ed-and-s-endings/' },
    stress: { label: 'Iowa State University · Word stress', url: 'https://iastate.pressbooks.pub/teachingpronunciation/chapter/6-word-stress/' },
    dictionary: { label: 'Cambridge Dictionary · US/UK pronunciation and audio', url: 'https://dictionary.cambridge.org/us/pronunciation/' },
    record: { label: 'Cambridge Dictionary · record noun and verb', url: 'https://dictionary.cambridge.org/us/pronunciation/english/record?a=british' },
    read: { label: 'Collins Dictionary · read and its past tense', url: 'https://www.collinsdictionary.com/us/dictionary/english/read' },
    accents: { label: 'Cambridge Dictionary · UK/US pronunciation', url: 'https://dictionaryblog.cambridge.org/2025/10/29/you-say-to-may-to-and-i-say-to-mah-to-uk-us-pronunciation/' },
    war: { label: 'Cambridge Dictionary · war', url: 'https://dictionary.cambridge.org/us/dictionary/english/war' }
  };
  const Q = (question, options, answer, explanation) => ({ question, options, answer, explanation });
  const E = (word, breakdown, meaning, note, speak = word) => ({ word, breakdown, meaning, note, speak });
  const T = (title, text) => ({ title, text });
  const sources = (...keys) => keys.map(key => ({ ...S[key] }));
  const stages = ['阶段一 · 听辨与辅音', '阶段二 · 元音与拼写', '阶段三 · 复杂组合与词尾', '阶段四 · 多音节与综合解码'];
  const extra = [
    {
      id: 'consonant-sound-map', title: '辅音地图：看口型、听振动', subtitle: 'Consonant sounds & letter choices', duration: '8 分钟',
      intro: '先建立常见单字母辅音的声音地图。字母和音不是一对一：x 可以表示两个音，q 常和 u 一起出现。',
      goals: ['区分常见清浊辅音配对', '辨认 j、x、qu 与字母名的差别'],
      steps: [
        T('先配对，再换一个音', 'p/b、t/d、k/g、f/v、s/z 常分别对应 /p b/、/t d/、/k ɡ/、/f v/、/s z/。用手轻触喉部比较发声，不能只靠是否送气判断。英语 /b d ɡ/ 也不等于给清音后面加“呃”。'),
        T('补齐鼻音、近音和 h', 'm /m/、n /n/ 让气流从鼻腔通过；l /l/ 与 r /r/ 不要混同。w /w/ 先收圆嘴唇，y 在 yes 中是 /j/；h /h/ 是轻的气流。/r/ 是本课程对常见美式近音的宽式写法。'),
        T('注意 j、x、qu 的特殊情况', 'j 在 jam 中为 /dʒ/；x 在 box 中为 /k/+/s/，不是一个音。qu 在 quit 中常为 /k/+/w/。先读整个词，确认每个结尾都在；其余双字母辅音会在后两课补上。')],
      examples: [E('van', '/v/ + /æ/ + /n/ → /væn/', '厢式车', '上齿轻触下唇；/v/ 有声，和 fan /fæn/ 不同。'), E('jam', '/dʒ/ + /æ/ + /m/ → /dʒæm/', '果酱', 'j 的音不是字母名 /dʒeɪ/。'), E('box', '/b/ + /ɑ/ + /k/ + /s/ → /bɑks/', '盒子', '三个字母，四个音；结尾 /ks/ 不加元音。'), E('quit', '/k/ + /w/ + /ɪ/ + /t/ → /kwɪt/', '停止；退出', 'qu 在此保留 /k/、/w/；不是 q 的字母名。'), E('yes', '/j/ + /ɛ/ + /s/ → /jɛs/', '是的', 'IPA /j/ 对应 yes 的开头，不是 jam 的 /dʒ/。')],
      tip: '先把单个音放回熟悉的词中练习。不要把拼音的读法直接套给英语辅音；本页按钮只读完整单词。', sources: sources('consonants', 'dictionary'),
      quizzes: [Q('box /bɑks/ 中，字母 x 对应什么？', ['/z/', '/k/ + /s/', '/ɛks/'], 1, 'box 的 x 表示 /ks/；/ɛks/ 是字母名。'), Q('哪一个词的开头是 /j/？', ['jam', 'van', 'yes'], 2, 'yes 的 y 是 /j/；jam 的 j 是 /dʒ/。'), Q('哪一对词适合比较 /f/ 和 /v/？', ['fan /fæn/ 与 van /væn/', 'cat 与 cup', 'pin 与 pan'], 0, 'fan/van 只更换开头辅音，适合听辨清浊和发音部位。')]
    },
    {
      id: 'more-consonant-digraphs', title: '补齐 ng、ck、ph、wh', subtitle: 'More consonant graphemes', duration: '8 分钟',
      intro: '继续把多字母拼写当作读音单位，同时分清一个音和两个连续的音。双写字母通常不要求把辅音读两遍。',
      goals: ['辨认 /ŋ/ 与 /ŋk/ 的区别', '识别 ck、ph、wh 和双写辅音的常见读法'],
      steps: [T('ng 与 nk 不能当成相同结尾', 'sing 的 ng 通常表示 /ŋ/，不要额外加 /ɡ/；sink 的 nk 则是 /ŋ/+/k/。finger 中可能听到 /ŋɡ/，所以看到 ng 仍要检查具体词。'), T('ck、双写与 ph', 'back 的 ck 表示一个 /k/；bell、miss、buzz 中 ll、ss、zz 各表示一个辅音。ph 在 phone 中常读 /f/。组合数、字母数和音素数应分别观察。'), T('wh 与剩余的 th', '许多美式说话者把 when 的 wh 读 /w/，部分口音保留 /ʍ/；who 的 wh 读 /h/。this /ðɪs/ 的 th 是浊音，与 thin /θɪn/ 相比声带振动。')],
      examples: [E('sing', 's + i + ng → /sɪŋ/', '唱歌', '结尾 /ŋ/ 是一个鼻音，不另读 /ɡ/。'), E('sink', 's + i + n + k → /sɪŋk/', '水槽；下沉', 'n 在 /k/ 前读成 /ŋ/；仍须保留 /k/。'), E('back', 'b + a + ck → /bæk/', '背部；返回', 'ck 只对应一个 /k/。'), E('phone', 'ph + o_e + n → /foʊn/', '电话', '先记住 ph /f/；o_e 的模式会在第 7 课展开。'), E('when', 'wh + e + n → /wɛn/', '什么时候', '这里示范常见 wh/w 合流的美式读法。')],
      tip: '不要把 ng 一律读 /ŋɡ/，也不要把所有 wh 一律读 /w/。书面组合是起点，词典读音是核对工具。', sources: sources('ufli', 'consonants', 'dictionary'),
      quizzes: [Q('sing 的常见结尾读音是哪一项？', ['/nɡ/', '/ŋɡ/', '/ŋ/'], 2, 'sing /sɪŋ/ 的 ng 通常只有 /ŋ/，没有额外的 /ɡ/。'), Q('哪一个组合在 back 中只表示一个辅音？', ['ba', 'ck', 'ack'], 1, 'ck 表示 /k/；back 共 /b æ k/ 三个音。'), Q('本课示范中，this 的 th 与 thin 的 th 有何区别？', ['this 用 /ð/，thin 用 /θ/', '两者都读 /t/', 'this 的 th 不发音'], 0, '/ð/ 与 /θ/ 发音部位相近，主要区别是清浊。')]
    },
    {
      id: 'consonant-blends-review', title: '阶段复习：连缀不断音', subtitle: 'Initial and final clusters', duration: '8 分钟',
      intro: '把前五课连起来：圈出字母组合，数实际的音，再练词首和词尾连缀。辅音挤在一起时，既不漏音，也不插入新元音。',
      goals: ['读出常见双辅音与三辅音连缀', '区分字母数、音素数和音节数'],
      steps: [T('词首连缀按顺序连接', '常见 l 连缀有 bl/cl/fl/gl/pl/sl，r 连缀有 br/cr/dr/fr/gr/pr/tr；s 连缀有 sk/sl/sm/sn/sp/st/sw。不是逐个背字母，而是保留组成它们的声音。'), T('三辅音和词尾都要保留', 'spr、str、scr 等词首连缀有三个辅音；词尾 nd、nt、mp、st、sk、ft 也常见。先慢读，再自然连接；不要把 desk 读成两个音节。'), T('用短词做阶段自检', '读 flat → flats，听出多出的 /s/；再读 ship → slip，区分一个 /ʃ/ 与 /s/+/l/。读错时找出具体漏了哪个音，不用重复整词碰运气。')],
      examples: [E('flag', '/f/ + /l/ + /æ/ + /ɡ/ → /flæɡ/', '旗帜', 'fl 保留两个辅音，f 后不加 /ə/。'), E('desk', '/d/ + /ɛ/ + /s/ + /k/ → /dɛsk/', '书桌', '结尾 /sk/ 两个音仍在同一个音节。'), E('spring', '/s/ + /p/ + /r/ + /ɪ/ + /ŋ/ → /sprɪŋ/', '春天；弹簧', '开头三辅音，结尾 ng 一个音。'), E('stamp', '/s/ + /t/ + /æ/ + /m/ + /p/ → /stæmp/', '邮票', 'st 和 mp 都保留各自的音。')],
      tip: '分音是练习方法，最终目标是流畅读词。练习答对只能证明你识别了规则，不是发音评分。', sources: sources('ufli', 'consonants', 'ies'),
      quizzes: [Q('spring /sprɪŋ/ 的词首有几个辅音音素？', ['一个', '两个', '三个'], 2, '/s/、/p/、/r/ 都保留；ng 则整体表示 /ŋ/。'), Q('哪个读法没有给 desk 加额外元音？', ['/dɛsk/', '/dɛsək/', '/dəɛsk/'], 0, 'desk 只有一个元音核 /ɛ/，词尾 /sk/ 直接相接。'), Q('哪一项正确区分 ship 与 slip 的开头？', ['都是一个 /ʃ/', 'ship 为 /ʃ/，slip 为 /s/+/l/', 'ship 有两个音，slip 有一个音'], 1, 'sh 是双字母辅音组合，sl 是保留两个音的连缀。')]
    },
    {
      id: 'open-syllables-and-y', title: '开音节与字母 y', subtitle: 'Open syllables & y as a vowel', duration: '7 分钟',
      intro: '有些音节以一个元音字母结尾，常见读法是字母名音。y 则会随位置改变角色：可以表示辅音，也可以表示元音。',
      goals: ['识别简单开音节中的常见长元音', '区分 y 的 /j/、/aɪ/、/i/ 与 /ɪ/'],
      steps: [T('用短词认识开音节', 'me /mi/、go /ɡoʊ/、hi /haɪ/ 的末尾没有辅音字母封住元音。以元音字母结尾的重读开音节常见长元音；这是拼写线索，不是保证。'), T('y 在词首与词尾的角色', 'yes 的 y 是辅音 /j/；my、cry 等单音节词结尾常读 /aɪ/；happy、city 等多音节词非重读结尾常读 /i/。不要把 happy 的 y 读成 /waɪ/。'), T('位置不能解释全部', 'gym、myth 中的 y 表示 /ɪ/；to /tu/ 和 do /du/ 也不能照 go 的元音类推。遇到非重读音节还需要检查弱读。')],
      examples: [E('me', 'm + e → /mi/', '我（宾格）', 'e 在这里是一个开音节的末尾元音。'), E('cry', 'cr + y → /kraɪ/', '哭；喊叫', 'y 在这个单音节词中读 /aɪ/。'), E('happy', 'hap + py → /ˈhæpi/', '快乐的', '词尾 y 是非重读 /i/；pp 不读成两个独立的 /p/。'), E('gym', 'g + y + m → /dʒɪm/', '健身房', 'y 读 /ɪ/；g 在此读 /dʒ/。')],
      tip: '“开音节”是帮助读词的拼写类别；不要根据元音字母的位置忽略整词的重音和例外。', sources: sources('syllables', 'vowels', 'dictionary'),
      quizzes: [Q('哪个词末尾 y 在本课读 /aɪ/？', ['happy', 'cry', 'city'], 1, 'cry /kraɪ/ 为单音节；happy 和 city 末尾通常为 /i/。'), Q('me 的常见读音是？', ['/mɛ/', '/mɪ/', '/mi/'], 2, 'me 是简单开音节，e 读 /i/。'), Q('gym 中 y 表示哪个音？', ['/ɪ/', '/j/', '/waɪ/'], 0, 'gym /dʒɪm/ 的 y 表示元音 /ɪ/。')]
    },
    {
      id: 'more-long-vowel-spellings', title: '同一个长元音，不同拼法', subtitle: 'igh, ie, ey, oe, ew, ue & ui', duration: '8 分钟',
      intro: '长元音不只由 silent-e 产生。把常见拼写按读音归类，再记录同一组合的不同读法。',
      goals: ['识别常见长元音的多种拼写', '不把 ie、ew 等组合当成绝对规则'],
      steps: [T('先给 /aɪ/ 和 /i/ 建两组', 'igh 在 light 中读 /aɪ/，ie 在 pie 中也读 /aɪ/；但 ie 在 field 中读 /i/。key 的 ey 常读 /i/，而 they 的 ey 读 /eɪ/。用整词区分，不背一条万能口诀。'), T('再给 /oʊ/ 找补充拼写', 'toe 的 oe、snow 的 ow、go 的 o、home 的 o_e 都可以表示 /oʊ/。这里 ow 不同于 cow 的 /aʊ/；下一课会集中比较。'), T('处理 /u/ 和 /ju/', 'blue 的 ue、fruit 的 ui、chew 的 ew 常表示 /u/；few 的 ew 为 /ju/。美式 new 常为 /nu/，一些其他口音保留 /nju/。')],
      examples: [E('light', 'l + igh + t → /laɪt/', '光；轻的', 'igh 整体对应 /aɪ/，不另读 g 或 h。'), E('field', 'f + ie + l + d → /fild/', '田地；领域', 'ie 读 /i/，区别于 pie /paɪ/。'), E('toe', 't + oe → /toʊ/', '脚趾', 'oe 表示 /oʊ/，不是两个音节。'), E('blue', 'bl + ue → /blu/', '蓝色', 'bl 的两个辅音保留，ue 表示 /u/。'), E('few', 'f + ew → /fju/', '少数；几个', '/j/ 接 /u/；仍只有一个音节。')],
      tip: '先试已学拼写模式，再用词义和词典核对。词义能帮助发现读错，却不能替代字母解码。', sources: sources('vowels', 'ufli', 'dictionary'),
      quizzes: [Q('light 中 igh 的读音是什么？', ['/ɪɡh/', '/i/', '/aɪ/'], 2, 'light /laɪt/ 的 igh 表示一个双元音 /aɪ/。'), Q('哪个词的 ie 读 /i/？', ['pie', 'field', 'tie'], 1, 'field /fild/ 为 /i/；pie、tie 中 ie 为 /aɪ/。'), Q('few 的本课读音是哪项？', ['/fju/', '/fɛw/', '/fʌ/'], 0, 'few /fju/ 的 ew 对应 /ju/，不是额外加一个音节。')]
    },
    {
      id: 'diphthongs-oi-ou-ow', title: '滑动的元音：oi、oy、ou、ow', subtitle: 'Diphthongs and contrasting spellings', duration: '7 分钟',
      intro: '双元音是在同一个音节里从一个元音位置滑向另一个位置。不能把它们读成两个彼此断开的音节。',
      goals: ['把 /ɔɪ/ 与 /aʊ/ 连贯读出', '识别 ow 和 ou 的读音变化'],
      steps: [T('oi 与 oy 常见 /ɔɪ/', 'coin 的 oi、toy 的 oy 都常读 /ɔɪ/。嘴形连续移动，把开头辅音和结尾辅音接在同一个元音核两边。'), T('ou 与 ow 常见 /aʊ/', 'cloud 的 ou、cow 的 ow 常读 /aʊ/。与上一课 snow /snoʊ/ 比较：拼写一样的 ow，也可能是 /oʊ/。'), T('明确列出例外，别硬套', 'soup 的 ou 是 /u/，young 的 ou 是 /ʌ/；touch 也不读 /aʊ/。已知词先建声音记忆，陌生词再试规则并查证。')],
      examples: [E('coin', 'c + oi + n → /kɔɪn/', '硬币', 'oi 在一个音节内滑动。'), E('toy', 't + oy → /tɔɪ/', '玩具', 'oy 与 coin 的 oi 是同一个常见双元音。'), E('cloud', 'cl + ou + d → /klaʊd/', '云', 'cl 保留两个辅音，ou 不是两个音节。'), E('cow', 'c + ow → /kaʊ/', '奶牛', 'ow 读 /aʊ/，不同于 snow 的 /oʊ/。')],
      tip: '“双元音”说的是语音，不是两个元音字母；my 只有一个元音字母 y，也能表示 /aɪ/。', sources: sources('vowels', 'ufli', 'dictionary'),
      quizzes: [Q('哪个词的 ow 与 cow 相同？', ['snow /snoʊ/', 'low /loʊ/', 'now /naʊ/'], 2, 'cow 和 now 都含 /aʊ/；snow、low 是 /oʊ/。'), Q('coin 和 toy 共有哪个元音？', ['/ɔɪ/', '/aʊ/', '/oʊ/'], 0, 'oi 和 oy 在这两个词中都表示 /ɔɪ/。'), Q('对于 soup，哪种做法正确？', ['见到 ou 就读 /aʊ/', '记住 soup /sup/，不把 ou 读法绝对化', '把 ou 拆成两个音节'], 1, 'soup 是 ou 读 /u/ 的常见词，需与具体词一起记忆。')]
    },
    {
      id: 'vowel-variants-review', title: '阶段复习：oo、au、aw 与例外', subtitle: 'Vowel variants and review', duration: '8 分钟',
      intro: '元音组合已经越来越多。用对比词收束这一阶段，特别注意 /u/、/ʊ/ 以及不同口音中的 /ɔ/ 与 /ɑ/。',
      goals: ['区分 food/book 的元音', '结合已学模式解释而非死猜拼写'],
      steps: [T('oo 至少要分两组', 'food /fud/、moon /mun/ 常为 /u/；book /bʊk/、foot /fʊt/ 为 /ʊ/。u 在 put 中也读 /ʊ/，在 cup 中则读 /ʌ/。'), T('au、aw 与部分 al 拼写', 'sauce、saw、talk 常在保留区别的美式口音中含 /ɔ/；很多美式说话者把这类 /ɔ/ 与 /ɑ/ 合流。课程保留 /ɔ/ 标记便于比较，不把合流当成错误。'), T('按模式排序，再找例外', '把 cape、rain 放到 /eɪ/，seed、field 放到 /i/，boat、snow 放到 /oʊ/；再把 bread、book 单独核对。比较发音时只换一个关键部分，避免一次同时改变太多。')],
      examples: [E('food', 'f + oo + d → /fud/', '食物', 'oo 读 /u/。'), E('book', 'b + oo + k → /bʊk/', '书', '/ʊ/ 与 food 的 /u/ 不同，不只是时间长短。'), E('saw', 's + aw → /sɔ/', '锯；看见的过去式', '部分美式口音读 /sɑ/；两者是口音差异。'), E('talk', 't + al + k → /tɔk/', '交谈', '此词 l 不单独发音；部分口音为 /tɑk/。')],
      tip: '标音是一种清晰、可比较的基准。设备语音与这里不同，不一定是你读错，也可能是口音或标音惯例不同。', sources: sources('vowels', 'accents', 'dictionary'),
      quizzes: [Q('哪个词按本课读音含 /ʊ/？', ['food', 'book', 'moon'], 1, 'book /bʊk/，food 和 moon 使用 /u/。'), Q('哪组都可以归入 /oʊ/？', ['boat 与 snow', 'cow 与 snow', 'bread 与 boat'], 0, 'boat /boʊt/、snow /snoʊ/；cow 为 /aʊ/，bread 为 /ɛ/。'), Q('听到美式 talk /tɑk/，最合理的判断是？', ['对方漏读了 a', '这个词必须读成两个音节', '可能是 /ɔ/ 与 /ɑ/ 合流的口音'], 2, '部分美式口音不区分这组元音，不能只因与标音不同就判错。')]
    },
    {
      id: 'r-controlled-vowels', title: '元音遇到 r：ar、or、er、ir、ur', subtitle: 'R-controlled vowels', duration: '8 分钟',
      intro: '常见美式英语通常保留元音后的 r。此时不能把元音完全按短元音或字母名音处理。',
      goals: ['识别 ar、or 与重读 /ɝ/ 的常见对应', '区分重读 /ɝ/ 和非重读 /ɚ/'],
      steps: [T('先对照 ar 与 or', 'car 的 ar 常读 /ɑr/，fork 的 or 常读 /ɔr/。课程用 /r/ 表示常见美式 r，不要求舌尖弹动。不要在 r 后补一个额外元音。'), T('把 er、ir、ur 放在一起', 'her、bird、turn 的重读元音常同为 /ɝ/。同一个声音有三种常见拼法；不能按 e、i、u 的字母名逐个读。'), T('区分重音与拼写的例外', 'teacher 末尾常为非重读 /ɚ/。word 的 or 常读 /ɝ/，不是 fork 的 /ɔr/。先认组合，再查整词。')],
      examples: [E('car', 'c + ar → /kɑr/', '汽车', '在本课美式基准中保留 r。'), E('fork', 'f + or + k → /fɔrk/', '叉子', 'or 与 car 的 ar 不同。'), E('bird', 'b + ir + d → /bɝd/', '鸟', 'ir 对应重读卷舌元音 /ɝ/。'), E('turn', 't + ur + n → /tɝn/', '转弯；轮次', '与 bird 的元音相同。'), E('teacher', 'teach + er → /ˈtitʃɚ/', '教师', '末尾 er 是非重读 /ɚ/，不是另一个重读音节。')],
      tip: '一些英语口音不读非元音前的 r，这是合法的口音系统。本路线采用通常保留 r 的美式基准，不代表所有英语。', sources: sources('vowels', 'syllables', 'dictionary'),
      quizzes: [Q('bird 和 turn 在本课共有哪个元音？', ['/æ/', '/oʊ/', '/ɝ/'], 2, 'bird /bɝd/ 与 turn /tɝn/ 都使用重读 /ɝ/。'), Q('teacher 最后一个音节中的 er 通常怎样读？', ['非重读 /ɚ/', '重读 /eɪr/', '字母名 e 加 r'], 0, 'teacher /ˈtitʃɚ/ 的重音在第一音节，末尾为非重读 /ɚ/。'), Q('哪个词的 or 不能照 fork /fɔrk/ 类推？', ['corn /kɔrn/', 'word /wɝd/', 'short /ʃɔrt/'], 1, 'word 的 or 是 /ɝ/，需要记住这个具体词。')]
    },
    {
      id: 'r-vowel-combinations', title: 'air、ear、eer：按整词核对', subtitle: 'Vowel-plus-r combinations', duration: '7 分钟',
      intro: '多个元音字母加 r 时，拼写与声音的对应更加多样。先建常见词组，再认识同拼写的反例。',
      goals: ['比较 air/are 与 ear/eer 的常见读法', '识别 ear 和 war 的特殊对应'],
      steps: [T('air 和部分 are 可以同音', 'hair /hɛr/ 与 care /kɛr/ 的元音加 r 可归为同一组。这里 /ɛr/ 是宽式教学写法；词典可能使用不同符号或更细的标音。'), T('ear 不能只记一种读法', 'near /nɪr/、bear /bɛr/、heard /hɝd/ 的 ear 分别对应不同读音。eer 在 deer 中常为 /ɪr/。先识别词，不把 ear 机械读成一个固定音。'), T('比较 ore、or 和 war', 'more 常为 /mɔr/，war 为 /wɔr/，而 car 是 /kɑr/。w 后的 ar 不能直接照 car；口音也可能影响元音细节。')],
      examples: [E('hair', 'h + air → /hɛr/', '头发', '与 care 的元音加 r 属同一常见组。'), E('near', 'n + ear → /nɪr/', '附近；靠近', '此处 ear 为 /ɪr/。'), E('bear', 'b + ear → /bɛr/', '熊；承受', '相同 ear，却不同于 near。'), E('heard', 'h + ear + d → /hɝd/', '听见的过去式', 'ear 在此为 /ɝ/。'), E('war', 'w + ar → /wɔr/', '战争', 'ar 不照 car /kɑr/ 读。')],
      tip: '只按拼写无法唯一推出这些词的读音。遇到新词，先尝试学过的对应，再核对词典的美式条目。', sources: sources('vowels', 'war', 'dictionary'),
      quizzes: [Q('哪个词与 hair 的元音加 r 最接近？', ['care /kɛr/', 'near /nɪr/', 'heard /hɝd/'], 0, 'hair 与 care 都按本课使用 /ɛr/。'), Q('ear 在 heard 中表示什么？', ['/ɪr/', '/eɪr/', '/ɝ/'], 2, 'heard /hɝd/ 不能照 near 或 bear 的读音拼。'), Q('哪一项说明了 war 的读音？', ['必定和 car 押韵', '常见美式 /wɔr/，需要与整词一起记', 'w 不发音'], 1, 'war 的 w 发 /w/，元音加 r 为 /ɔr/。')]
    },
    {
      id: 'soft-c-g-and-alternatives', title: 'c、g 的软音与复杂辅音拼写', subtitle: 'Soft c/g, -dge and /ʒ/', duration: '8 分钟',
      intro: '辅音字母也会随环境改变读音。认识常见环境能提高第一次尝试的成功率，但 g 的例外尤其多。',
      goals: ['使用 c/g 的常见环境线索并识别例外', '区分 /dʒ/、/ʒ/、/ʃ/ 的词中拼写'],
      steps: [T('先看 c 后面的字母', 'c 在 e、i、y 前常读 /s/，如 cent、city、cycle；其他位置常读 /k/。ck 读 /k/，末尾 ce 如 face 常读 /s/；这只是常见模式。'), T('g 的软音需要更谨慎', 'gem、giant 中 g 是 /dʒ/，但 get、give、girl 中仍是 /ɡ/。badge 的 dge、age 的 ge 常表示 /dʒ/，不要逐字母拆出额外的 /d/。'), T('认识其他高频辅音结尾', 'vision 的 s 对应 /ʒ/，不同于 ship 的 /ʃ/ 和 jam 的 /dʒ/。常见 -tion 在 action 中为 /ʃən/，而 -sion 在 vision 中为 /ʒən/；不能把所有这类结尾读成同一种声音。')],
      examples: [E('cent', 'c + e + n + t → /sɛnt/', '一分（货币）', 'c 在 e 前常为 /s/。'), E('gem', 'g + e + m → /dʒɛm/', '宝石', 'g 在此读软音 /dʒ/。'), E('badge', 'b + a + dge → /bædʒ/', '徽章', 'dge 一起对应 /dʒ/。'), E('vision', 'vi + sion → /ˈvɪʒən/', '视力；愿景', '第二部分以 /ʒ/ 开头；它是浊擦音。'), E('action', 'ac + tion → /ˈækʃən/', '行动', 'tion 在这个词中读 /ʃən/。')],
      tip: 'c/g 的环境规则不是无例外定律。把 get、give、girl 作为常见反例保留，不要为了符合口诀改错读音。', sources: sources('consonants', 'ufli', 'dictionary'),
      quizzes: [Q('哪一个 g 读 /ɡ/，属于软音预测的常见例外？', ['gem', 'giant', 'give'], 2, 'give /ɡɪv/ 的 g 仍为 /ɡ/。'), Q('badge 中 dge 表示什么？', ['/d/ + /ɡ/ + /ɛ/', '/dʒ/', '/ʒ/'], 1, 'badge /bædʒ/ 中 dge 对应 /dʒ/，不是三个独立的音。'), Q('vision 中 s 对应哪个辅音？', ['/ʒ/', '/s/', '/ʃ/'], 0, 'vision /ˈvɪʒən/ 使用 /ʒ/，与清音 /ʃ/ 不同。')]
    },
    {
      id: 'silent-letter-patterns', title: '看得见，却不单独发音', subtitle: 'Silent letters and changing patterns', duration: '8 分钟',
      intro: '有些字母保留了拼写历史，却不再单独对应声音。先识别熟悉的组合，再警惕同样字母在别的词中恢复发音。',
      goals: ['识别 kn、wr、mb、gn 的常见不发音字母', '比较 gh 的不发音与 /f/ 读法'],
      steps: [T('先练词首的 kn、wr、gn', 'knee 中 k 不发音，write 中 w 不发音，gnome 中 g 不发音。直接从 /n/ 或 /r/ 开始，不添加一个短促的前置音。'), T('再看词尾与词中', 'lamb 的 b 通常不发音；listen 的 t 不发音。不同词的相同字母未必如此，如 number 的 b 会发音；记整个词的组合与位置。'), T('gh 是需要分组处理的例子', 'night 中 gh 不另发音，laugh 中 gh 是 /f/，ghost 中 gh 读 /ɡ/。不要把“gh 总不发音”当作通则。')],
      examples: [E('knee', 'kn + ee → /ni/', '膝盖', 'k 不发音，ee 为 /i/。'), E('write', 'wr + i_e + t → /raɪt/', '写', 'w 不发音，i_e 为 /aɪ/。'), E('lamb', 'l + a + mb → /læm/', '羔羊', '词尾 mb 中 b 不单独发音。'), E('laugh', 'l + au + gh → /læf/', '笑', '本课美式 /læf/；gh 是 /f/，不是静音。'), E('ghost', 'gh + o + st → /ɡoʊst/', '幽灵', 'gh 在这里为 /ɡ/，结尾 st 保留两个辅音。')],
      tip: '“不发音字母”不等于可以不写它；阅读时认出，拼写时保留。词族变化也可能改变发音，例如 sign 与 signal。', sources: sources('ufli', 'consonants', 'dictionary'),
      quizzes: [Q('write 中哪个字母不单独发音？', ['r', 'w', 't'], 1, 'write /raɪt/ 从 /r/ 开始，w 不发音。'), Q('哪个词的 gh 在本课读 /f/？', ['night', 'ghost', 'laugh'], 2, 'laugh /læf/ 的 gh 对应 /f/；night 的 gh 不单独发音，ghost 的 gh 为 /ɡ/。'), Q('knee 的正确分音结果是什么？', ['/n/ + /i/', '/k/ + /n/ + /i/', '/n/ + /ɛ/'], 0, 'knee /ni/ 中 k 不发音，ee 表示 /i/。')]
    },
    {
      id: 's-ending-sounds', title: '词尾 -s：不总是 /s/', subtitle: 'Plural and verb -s endings', duration: '8 分钟',
      intro: '复数、第三人称单数和所属关系常用 -s。读什么音主要看词基的最后一个声音，而不是最后一个字母。',
      goals: ['按词基尾音选择 /s/、/z/ 或 /ɪz/', '分清是否增加一个音节'],
      steps: [T('嘶擦类尾音后加一个音节', '词基以 /s z ʃ ʒ tʃ dʒ/ 结尾时，-s/-es 常读 /ɪz/，如 buses、watches。部分说话者弱读为 /əz/；这里统一用 /ɪz/ 作为宽式练习标记。'), T('其余清辅音后通常 /s/', 'cups 中 p 是 /p/，books 中结尾是 /k/，加 -s 后通常为 /s/。直接接上辅音，不额外插入元音。'), T('其余浊音和元音后通常 /z/', 'bags 的 /ɡ/、runs 的 /n/ 和 keys 的 /i/ 后，词尾通常是 /z/。拼写改为 -ies 不代表一定增加音节，如 cities /ˈsɪtiz/。')],
      examples: [E('cups', 'cup + s → /kʌp/ + /s/ → /kʌps/', '杯子（复数）', '一个音节，结尾 /ps/ 保留。'), E('bags', 'bag + s → /bæɡ/ + /z/ → /bæɡz/', '包（复数）', '最后一个词基音为浊音 /ɡ/。'), E('watches', 'watch + es → /wɑtʃ/ + /ɪz/ → /ˈwɑtʃɪz/', '手表（复数）；观看（三单）', '词基末音 /tʃ/ 后增加一个音节。'), E('keys', 'key + s → /ki/ + /z/ → /kiz/', '钥匙（复数）', '元音后用 /z/，不是字母 s 的名字。')],
      tip: '这是规则词尾的声音模式；不规则复数如 children 另学。理解和保留语法词尾比故意把尾音拖得很长更重要。', sources: sources('endings', 'dictionary'),
      quizzes: [Q('cups 的 -s 按本课读什么？', ['/ɪz/', '/z/', '/s/'], 2, '/p/ 是非嘶擦类清辅音，后面接 /s/。'), Q('哪个词的规则词尾增加一个音节？', ['watches', 'bags', 'keys'], 0, 'watch 以 /tʃ/ 结尾，watches 加 /ɪz/；另两个只加 /z/。'), Q('选择 -s 的读音时，首先看什么？', ['最后一个字母的名字', '词基最后一个声音', '单词有几个字母'], 1, '词基尾音决定规则词尾的变体，不能只看字母。')]
    },
    {
      id: 'ed-endings-review', title: '阶段复习：-ed 与词尾连读', subtitle: 'Past-tense endings and cumulative review', duration: '8 分钟',
      intro: '规则过去式和过去分词常用 -ed，但不一定增加音节。与 -s 一样，关键是词基最后一个声音。',
      goals: ['区分规则 -ed 的 /t/、/d/ 与 /ɪd/', '综合使用组合、silent letters 和词尾规则'],
      steps: [T('/t/、/d/ 后增加一个音节', 'wanted、needed 的 -ed 常用 /ɪd/，也可听到弱读 /əd/。词基已经以 /t/ 或 /d/ 结尾时，需要这个额外音节。'), T('其余清浊音后直接接辅音', '其余清辅音后 -ed 常读 /t/，如 washed；其余浊辅音和元音后常读 /d/，如 cleaned、played。不要每个 -ed 都读成 /ɛd/。'), T('从词基回查，兼顾拼写', 'stop → stopped 双写 p 但不多一个 /p/；study → studied 改 y 为 i 不自动增加音节。先识别词基，读原词，再把正确词尾接上；不规则 went 不按 -ed 规则。')],
      examples: [E('washed', 'wash + ed → /wɑʃ/ + /t/ → /wɑʃt/', '洗过', '一个音节，末尾 /ʃt/ 不漏 /t/。'), E('cleaned', 'clean + ed → /klin/ + /d/ → /klind/', '清理过', '/n/ 后接 /d/，不增加音节。'), E('wanted', 'want + ed → /wɑnt/ + /ɪd/ → /ˈwɑntɪd/', '想要过', '词基以 /t/ 结尾，增加一个音节；本课标音不写快速语流变体。'), E('stopped', 'stop + ed（双写 p）→ /stɑp/ + /t/ → /stɑpt/', '停下了', '双写 p 是拼写变化，不是多出一个发音单位。')],
      tip: '形容词 naked、wicked 等不是用这条规则临时拼出的普通过去式；请查整词。不要把练习规则当成所有 -ed 拼写的定律。', sources: sources('endings', 'consonants', 'dictionary'),
      quizzes: [Q('哪个词的 -ed 按本课增加一个音节？', ['washed', 'wanted', 'cleaned'], 1, 'want 以 /t/ 结尾，wanted 加 /ɪd/；另外两个只加辅音。'), Q('cleaned 的词尾是什么？', ['/d/', '/t/', '/ɛd/'], 0, '词基 clean 以浊音 /n/ 结尾，后接 /d/。'), Q('对于 stopped，哪项正确？', ['双写 p 所以要读两次 /p/', '末尾必须增加一个音节', '词基 stop 后接 /t/，全词仍一个音节'], 2, 'stopped /stɑpt/ 的双写是拼写规则，语音上不增加 /p/ 或元音。')]
    },
    {
      id: 'six-syllable-types', title: '六类音节：给长词找入口', subtitle: 'Six useful written syllable patterns', duration: '9 分钟',
      intro: '六类音节是帮助解码的拼写框架。它们不能穷尽真实语音，也不等于每个词都能机械分成六类之一。',
      goals: ['用六种拼写类型解释熟悉词', '识别 consonant-le 与口语音节的关系'],
      steps: [T('回顾封闭、开放与 VCe', '封闭音节如 cat，常有短元音；开放音节如 me，末尾单元音字母常读长元音；VCe 如 home，末尾 e 通常不发音。它们帮助预测，不能抹去 have 等反例。'), T('加上元音组合与 vowel-r', '元音组合类如 rain、boat、coin，组合可对应不同类型的元音；vowel-r 如 car、bird，r 影响元音。这里分类的是拼写，不是要求把所有声音分成互不重叠的六组。'), T('认识 consonant-le 结尾', 'table、candle、little 末尾的辅音加 le 常形成非重读音节。宽式可写 /əl/；真实语音也可能是成音节的 /l̩/。le 中 e 不是单独的 /ɛ/。')],
      examples: [E('picnic', 'pic（封闭）+ nic（封闭）→ /ˈpɪknɪk/', '野餐', '分块用于解码；两个元音都可用短 /ɪ/。'), E('robot', 'ro（开放）+ bot（封闭）→ /ˈroʊbɑt/', '机器人', '先试 /oʊ/ 再连接后半；重音在开头。'), E('table', 'ta（开放）+ ble（辅音-le）→ /ˈteɪbəl/', '桌子', '结尾可听成成音节的 /l/，不读字母 e。'), E('raincoat', 'rain（元音组合）+ coat（元音组合）→ /ˈreɪnˌkoʊt/', '雨衣', '两个意义块也帮助识别两个拼写块。')],
      tip: '六类常用标签：封闭、开放、VCe、元音组合、vowel-r、辅音-le。部分教学方案把后者扩大为 final stable syllable；本课明确使用较窄的辅音-le 类。', sources: sources('syllables', 'ufli', 'dictionary'),
      quizzes: [Q('table 最后一部分 ble 属于哪类常见拼写？', ['开放音节', '辅音-le', 'VCe'], 1, 'ble 是辅音 b 加 le，通常构成非重读结尾。'), Q('rain 的主要元音拼写线索是什么？', ['结尾 r', '两个封闭音节', '元音组合 ai'], 2, 'rain 中 ai 整体表示 /eɪ/，属于元音组合类。'), Q('哪一项正确理解六类音节？', ['它们是实用拼写线索，仍需核对例外', '它们能唯一推出任何词的读音', '每个元音字母永远形成一个音节'], 0, '音节类别帮助第一次解码；重音、弱读、例外和口音仍要查证。')]
    },
    {
      id: 'multisyllable-decoding', title: '长词分块：试读、连接、核对', subtitle: 'Flexible multisyllabic decoding', duration: '9 分钟',
      intro: '长词不必一口气猜。先找熟悉的词基和元音组合，尝试可行的分块，再读回完整单词。',
      goals: ['尝试 VC/CV、V/CV 与 VC/V 分块', '把解码分块与意义词块配合使用'],
      steps: [T('先圈元音单位与熟悉词块', '先把 sh、igh、oa 等已知组合圈在一起；复合词可先找两个词，如 rain + coat。前后缀也能提供分块线索，但构词块不总等于一个口语音节。'), T('两种分法都可以尝试', 'rabbit 可试 rab + bit（VC/CV）；tiger 可试 ti + ger（V/CV）；habit 则试 hab + it（VC/V）。单辅音夹在元音之间时，不应规定它永远归左或归右。'), T('把试读送回词典与语境', '先分别读块，再连接，检查读音、重音和词义是否成立。教学分块可能与词典音节边界不同；不把分块线当成精密语音分析。')],
      examples: [E('rabbit', 'rab + bit → /ˈræbɪt/', '兔子', '双写 bb 不表示两个分离的 /b/；这里分块帮助短元音判断。'), E('tiger', 'ti + ger → /ˈtaɪɡɚ/', '老虎', '第一块试开音节 /taɪ/；g 为 /ɡ/，末尾弱读。'), E('habit', 'hab + it → /ˈhæbɪt/', '习惯', '若先试 ha + bit 不合已知词音，可调整为 hab + it。'), E('fantastic', 'fan + tas + tic → /fænˈtæstɪk/', '极好的', '三个音节，第二个音节重读，末尾 c 为 /k/。')],
      tip: '不要只凭“猜起来像某个词”跳过字母。每次调整分法，都要说明哪些字母对应了哪些声音。', sources: sources('ies', 'syllables', 'dictionary'),
      quizzes: [Q('tiger 在本课的辅助分块是哪一项？', ['tig + er，必须读短 /ɪ/', 'ti + ger，第一块试 /taɪ/', 't + i + g + e + r，五个音节'], 1, 'tiger /ˈtaɪɡɚ/ 可用 ti + ger 辅助；元音字母数不直接决定音节数。'), Q('habit 的第一音节元音是什么？', ['/eɪ/', '/ɑ/', '/æ/'], 2, 'habit /ˈhæbɪt/ 第一音节为 /hæb/；不是字母名 /eɪ/。'), Q('试读长词后，下一步最合适的是？', ['连接整词并核对词典读音、重音和语境', '只要分成小块就不必再核对', '把每块都读得同样重'], 0, '分块只是解码步骤，完整读音与语义必须接得上。')]
    },
    {
      id: 'irregular-high-frequency', title: '高频词：规律部分与特殊部分', subtitle: 'Irregular high-frequency words', duration: '8 分钟',
      intro: '常用词不一定规则，规则词也可以是高频词。遇到例外时，把可靠的字母—声音对应保留下来，集中记真正特殊的部分。',
      goals: ['说明高频与规则是两种不同分类', '识别常见例外词及功能词弱读'],
      steps: [T('不要把整个词都当成无法分析', 'said /sɛd/ 的 s 和 d 仍正常，特殊处在 ai；have /hæv/ 的 h、a、v 可以认出，不能强套 a_e。找出需要特别记忆的位置，比只记轮廓更清楚。'), T('记住 one、two、does、of 等整词', 'one /wʌn/、two /tu/、does /dʌz/、of /ʌv/ 都需要单独核对。of 的 f 通常是 /v/；不能照 off /ɔf/ 或 /ɑf/ 读。'), T('区分词典重读形式与句中弱读', '功能词在句中可能弱读：a /ə/、the /ðə/ 或 /ði/、of /əv/。强调它们时声音又可能更完整；这不意味着拼写改变了。')],
      examples: [E('said', 's + ai（特殊）+ d → /sɛd/', '说过', 'ai 在这里为 /ɛ/，不是 rain 中的 /eɪ/。'), E('one', '整词核对 → /wʌn/', '一；一个', '读音包含 /w/，不能从 silent-e 模式直接推出。'), E('two', 't + wo（特殊）→ /tu/', '二；两个', '不单独读 w，末尾元音为 /u/。'), E('does', 'do + es（整词变化）→ /dʌz/', 'do 的第三人称单数', '元音发生变化；不是把 do /du/ 简单接 /z/。'), E('of', 'o + f → 强读 /ʌv/；常见弱读 /əv/', '……的', '结尾为 /v/，与 off 的 /f/ 不同。')],
      tip: '例外不是让你停止解码的理由。把词音、拼写和句中意思联系起来，过一段时间再认读；不要把点过“完成”当成长期记住。', sources: sources('ufli', 'ies', 'dictionary'),
      quizzes: [Q('said 中主要需要特别记忆的是哪一部分？', ['s 必须不发音', 'ai 在这里读 /ɛ/', 'd 读成 /t/'], 1, 'said /sɛd/ 的特殊元音拼写为 ai；s、d 仍可按熟悉对应识别。'), Q('does 的常见重读读音是哪项？', ['/duz/', '/doʊz/', '/dʌz/'], 2, 'does /dʌz/ 不能由 do /du/ 直接加 /z/ 推出。'), Q('关于高频词，哪一项正确？', ['高频词既可能规则，也可能不规则', '所有高频词都不规则', '所有高频词都按字母名读'], 0, '高频说的是出现频率，不是拼写与读音是否规则。')]
    },
    {
      id: 'heteronyms-and-accents', title: '同样拼写，不一定同样读', subtitle: 'Heteronyms, context and accent variation', duration: '9 分钟',
      intro: '有时必须先确定词义、词性或时态，才能选择读音。另一些差别来自口音，而不是语法变化。',
      goals: ['用语境选择 read、lead、record 的读音', '把口音变体与词义变化分开理解'],
      steps: [T('read 与 lead 要放回句子', 'read 现在时 /rid/，过去式 /rɛd/；lead 作“带领”是 /lid/，作金属“铅”是 /lɛd/。字母没有变，语法或词义却决定了声音。'), T('record 比较词性和重音', '名词 record 常为 /ˈrɛkɚd/，动词 record 常为 /rɪˈkɔrd/。重音移动，非重读元音也会改变；不是所有双音节名词和动词都服从这一模式。'), T('口音差异要另外识别', 'tomato 常见美式 /təˈmeɪtoʊ/，一些英式读音中间为 /ɑː/；美式常保留 car 的 r。字典的 US/UK 标签是示范类别，不代表同一国家人人发音完全一致。')],
      examples: [E('read（现在）', 'I read every day. → read /rid/', '读；阅读', '现在时；听完整句帮助确定 TTS 的语境。', 'I read every day.'), E('read（过去）', 'I read it yesterday. → read /rɛd/', '读过', '过去式与 red 同音；不要让孤立词 TTS 替你判断时态。', 'I read it yesterday.'), E('record（名词）', 'a record → /ˈrɛkɚd/', '记录', '名词首音节重读。', 'a record'), E('record（动词）', 'record a message → /rɪˈkɔrd/', '录制', '动词第二音节重读。', 'record a message'), E('tomato', 'to + ma + to → /təˈmeɪtoʊ/', '番茄', '这是常见美式读法；合法口音可以不同。')],
      tip: '本课提供语境文本给设备语音，但 TTS 仍可能读错同形异音词。以所列词典的词性、标音和录音核对，不把自动朗读当裁判。', sources: sources('read', 'record', 'accents', 'dictionary'),
      quizzes: [Q('I read it yesterday. 中 read 按本课应读？', ['/rɛd/', '/rid/', '/reɪd/'], 0, 'yesterday 明确过去时间，read 的过去式读 /rɛd/。'), Q('record a message 中 record 的主重音在哪？', ['第一音节', '第二音节', '没有重音'], 1, '这里 record 为动词，常见 /rɪˈkɔrd/，第二音节重读。'), Q('美国与英国词典给 tomato 不同元音时，合理做法是？', ['判定其中一个必然错误', '把两个元音同时塞进同一个词', '选择一个目标口音练习，并认识另一个合法变体'], 2, '口音差异不等于错误；听懂不同变体，同时保持自己的练习基准。')]
    },
    {
      id: 'integrated-decoding-review', title: '综合解码：从生词到短句', subtitle: 'Decode, verify and read in context', duration: '10 分钟',
      intro: '最后一课把整条路线串起来。不要比赛谁背得快，而是练习遇到陌生词时能说明、核对并修正自己的读法。',
      goals: ['独立完成识别组合、分块、试读与核对', '把规则词和例外放回有意义的短句'],
      steps: [T('先找可靠线索', '找词基、前后缀和已知字母组合；圈元音核，尝试分块。遇到 unknown pattern 不跳过，先标出来，再决定要查哪一部分。'), T('再核对重音、弱读与词尾', '把各块接成完整词，检查 -s/-ed 是否增加音节，查看重音符号和弱元音。把错误写成具体原因，例如“把 ea 全读成 /i/”，方便下次复习。'), T('最后放回短句并延迟复习', '先读例词，再读自编短句：The shipment arrived. We watched the sunset. 判断句意是否连贯；随后遮住标音再试。选择题成功只记录规则识别，不验证真实口语或长期掌握。')],
      examples: [E('shipment', 'ship + ment → /ˈʃɪpmənt/', '货物；装运', 'sh 一音；第一音节重读；后半弱读 /ə/。'), E('sunshine', 'sun + shine → /ˈsʌnˌʃaɪn/', '阳光', '前半短 /ʌ/，后半 sh 加 i_e /aɪ/。'), E('replayed', 're + play + ed → /ˌriˈpleɪd/', '重播了', 'ay /eɪ/；词基以元音结尾，-ed 加 /d/ 而不加音节。'), E('carefully', 'care + ful + ly → /ˈkɛrfəli/', '仔细地', '重音在开头，ful 常弱读 /fəl/，末尾 y /i/。')],
      tip: '这 24 课完成的是核心基础路线。继续阅读、听真人录音、记录个别例外，并按需要学习更多词汇和口音；没有一种拼读口诀能覆盖所有英语词。', sources: sources('ies', 'stress', 'endings', 'dictionary'),
      quizzes: [Q('replayed 的 -ed 为什么不增加音节？', ['因为拼写有两个 e', '因为词基 play 以元音结尾，规则词尾为 /d/', '因为所有 -ed 都不增加音节'], 1, 'play 的尾音是 /eɪ/，不是 /t/ 或 /d/，所以接 /d/：/ˌriˈpleɪd/。'), Q('shipment 中正确的一组线索是什么？', ['sh 读两个音、重音在末尾', '所有元音字母都读字母名', 'sh 为 /ʃ/、首音节重读、后半含弱读 /ə/'], 2, 'shipment /ˈʃɪpmənt/ 同时用到辅音组合、重音和 schwa。'), Q('学习本路线后遇到一个不合规则的生词，应当怎样？', ['保留能解码的部分，并查整词读音、重音与意思', '为了符合口诀而改动词的发音', '只凭外形猜一个熟悉的词'], 0, '规则用于尝试，可靠词典与语境用于核对；例外应具体记录。')]
    }
  ];
  const additions = new Map(extra.map(lesson => [lesson.id, lesson]));
  const legacyDetails = {
    'sounds-and-blending': { goals: ['区分字母名、音素与音节', '完成短词合音和拆音'], sources: sources('ies', 'ufli'), questions: [Q('把 map /mæp/ 拆成音素，正确的是？', ['/m/ + /æ/ + /p/', '/ɛm/ + /eɪ/ + /pi/', '/mæ/ + /pə/'], 0, '分音数的是词中的声音；字母名和额外的 /ə/ 都不是原词的一部分。'), Q('本课程的朗读按钮示范什么？', ['纯音素发音和自动口语评分', '完整单词或有标注的短语语音', '每个字母的中文名字'], 1, '设备 TTS 读完整文本；不能替代纯音素示范，也没有自动发音评分。')] },
    'short-vowels': { goals: ['辨认五个常见短元音', '用最小对比核对元音而不读字母名'], sources: sources('vowels', 'dictionary'), questions: [Q('哪个词的元音是 /ʌ/？', ['pin', 'bed', 'cup'], 2, 'cup /kʌp/ 含 /ʌ/；pin 为 /ɪ/，bed 为 /ɛ/。'), Q('关于 put /pʊt/，哪项正确？', ['它提醒我们 CVC 拼写也有例外', 'u 必须改读 /ʌ/', '它有三个音节'], 0, 'put 的 u 为 /ʊ/，所以不能把所有 CVC 词读法都绝对化。')] },
    'digraphs-and-blends': { goals: ['区分双字母辅音和辅音连缀', '比较 sh、ch 与两种 th'], sources: sources('consonants', 'ufli'), questions: [Q('ship 的 sh 通常表示什么？', ['/s/ + /h/', '/ʃ/', '/tʃ/'], 1, 'sh 在 ship /ʃɪp/ 中表示 /ʃ/，是一个辅音音素。'), Q('哪一对 th 分别为清音 /θ/ 和浊音 /ð/？', ['thin 与 this', 'ship 与 chip', 'stop 与 thin'], 0, 'thin /θɪn/ 和 this /ðɪs/ 展示了 th 的两种常见读音。')] },
    'silent-e': { goals: ['识别常见 a_e、i_e、o_e、u_e 模式', '保留 have 等常见反例'], sources: sources('syllables', 'vowels', 'dictionary'), questions: [Q('hope /hoʊp/ 的末尾 e 做了什么？', ['读一个 /ɛ/ 音节', '把 p 读成 b', '不单独发音，帮助识别 o_e 模式'], 2, 'hope 为一个音节，o_e 常对应 /oʊ/；末尾 e 不额外发音。'), Q('哪个词不按本课的常见长元音 VCe 模式读？', ['kite', 'have', 'cape'], 1, 'have /hæv/ 是常见反例，a 仍为 /æ/。')] },
    'vowel-teams': { goals: ['识别 ai、ay、ee、ea、oa 的常见对应', '记住一组拼写可以有多种读法'], sources: sources('ufli', 'vowels', 'dictionary'), questions: [Q('rain 的 ai 与哪个词的组合常表示同一个音？', ['day 的 ay', 'bread 的 ea', 'seed 的 ee'], 0, 'rain 和 day 都使用 /eɪ/；bread 为 /ɛ/，seed 为 /i/。'), Q('为什么不能把 ea 永远读成 /i/？', ['因为 ea 永远不发音', '因为 ea 总表示两个音节', '因为 bread /brɛd/、break /breɪk/ 等具有不同读法'], 2, '相同 ea 可表示 /i/、/ɛ/、/eɪ/ 等；需要和具体词一起记。')] },
    'syllables-stress-schwa': { goals: ['找到主重音并保持其他音节较轻', '识别 schwa 而不把所有非重读元音都改成 /ə/'], sources: sources('stress', 'vowels', 'dictionary'), questions: [Q('lemon /ˈlɛmən/ 的第二个元音是什么？', ['/oʊ/', '/ə/', '/æ/'], 1, 'lemon 的非重读第二音节使用 schwa /ə/。'), Q('哪项正确描述 music /ˈmjuzɪk/？', ['所有非重读元音都必须变 /ə/', '它没有重音', '第一音节重读，末尾仍保留 /ɪ/'], 2, '非重读不自动等于 schwa；music 的后一个元音仍是 /ɪ/。')] }
  };
  const order = [
    'sounds-and-blending', 'consonant-sound-map', 'short-vowels', 'digraphs-and-blends', 'more-consonant-digraphs', 'consonant-blends-review',
    'silent-e', 'open-syllables-and-y', 'vowel-teams', 'more-long-vowel-spellings', 'diphthongs-oi-ou-ow', 'vowel-variants-review',
    'r-controlled-vowels', 'r-vowel-combinations', 'soft-c-g-and-alternatives', 'silent-letter-patterns', 's-ending-sounds', 'ed-endings-review',
    'six-syllable-types', 'multisyllable-decoding', 'syllables-stress-schwa', 'irregular-high-frequency', 'heteronyms-and-accents', 'integrated-decoding-review'
  ];
  window.PHONICS_LESSONS = order.map((id, index) => {
    const original = legacy.get(id);
    const lesson = original ? { ...original, goals: legacyDetails[id].goals, sources: legacyDetails[id].sources, quizzes: [original.quiz, ...legacyDetails[id].questions] } : additions.get(id);
    return { ...lesson, stage: stages[Math.floor(index / 6)], quiz: lesson.quizzes[0] };
  });
})();
