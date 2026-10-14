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
