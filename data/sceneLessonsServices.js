// Everyday service courses share their illustrations with the dialogue scenes.
(() => {
  const lessons = [
    {
      id:'apartment',placeId:'apartment',title:'公寓租赁办公室',english:'Apartment Office',category:'居住生活',
      description:'看懂租房办公室里的物品，练习询问户型、钥匙、租金和押金。',
      image: 'assets/apartment.webp', thumbnail: 'assets/thumbnails/apartment.webp',imageAlt:'租赁工作人员在办公桌后与访客交谈，桌上有户型图、钥匙、笔记本电脑、文件和笔，后方有一盏台灯。',
      imageAltEnglish:'A leasing agent talks with a visitor across a desk holding a floor plan, keys, laptop, documents and pen, with a lamp behind her.',
      positions:{'leasing-agent':[23,29],'floor-plan':[53,38],keys:[43,67],laptop:[16,59],pen:[64,71],document:[57,67],lamp:[38,26],desk:[42,82]},
      words:[
        {id:'leasing-agent',word:'leasing agent',ipa:'/ˈlisɪŋ ˌeɪdʒənt/',meaning:'租赁工作人员',note:'leasing 与出租有关；leasing agent 通常负责介绍房源、安排看房和协助租赁。'},
        {id:'floor-plan',word:'floor plan',ipa:'/ˈflɔr ˌplæn/',meaning:'户型图；平面图',note:'展示房间布局的图；不是指某一层楼的计划。'},
        {id:'keys',word:'keys',ipa:'/kiz/',meaning:'钥匙（复数）',note:'一把钥匙是 a key；pick up the keys 表示领取钥匙。'},
        {id:'laptop',word:'laptop',ipa:'/ˈlæpˌtɑp/',meaning:'笔记本电脑',note:'也可说 laptop computer；desktop computer 是台式电脑。'},
        {id:'pen',word:'pen',ipa:'/pɛn/',meaning:'笔；钢笔',note:'Could I borrow a pen? 是借笔时的礼貌说法。'},
        {id:'document',word:'document',ipa:'/ˈdɑkjəmənt/',meaning:'文件',note:'这里是名词；read a document 是阅读文件，sign a document 是在文件上签字。'},
        {id:'lamp',word:'lamp',ipa:'/læmp/',meaning:'台灯；灯',note:'图中是放在柜子上的台灯；turn on the lamp 表示打开这盏灯。'},
        {id:'desk',word:'desk',ipa:'/dɛsk/',meaning:'办公桌；书桌',note:'at the desk 表示在办公桌处；on the desk 表示在桌面上。'},
        {id:'rent',word:'rent',ipa:'/rɛnt/',meaning:'租金',note:'场景延伸词，不对应单独物品；monthly rent 是月租，pay rent 是付房租。'},
        {id:'deposit',word:'deposit',ipa:'/dɪˈpɑzɪt/',meaning:'押金',note:'场景延伸词，不对应单独物品；租房押金常说 security deposit，退还条件需要向工作人员确认。'}
      ],
      sentences:[
        {id:'agent-floor-plan',text:'Could the leasing agent explain this floor plan?',translation:'可以请租赁工作人员解释一下这张户型图吗？',wordIds:['leasing-agent','floor-plan']},
        {id:'keys-pickup',text:'When can I pick up the keys?',translation:'我什么时候可以领取钥匙？',wordIds:['keys']},
        {id:'laptop-desk',text:'The laptop is on the desk.',translation:'笔记本电脑在办公桌上。',wordIds:['laptop','desk']},
        {id:'document-read',text:'May I read this document before I sign it?',translation:'我可以在签字前阅读这份文件吗？',wordIds:['document']},
        {id:'pen-borrow',text:'Could I borrow a pen, please?',translation:'可以借我一支笔吗？',wordIds:['pen']},
        {id:'lamp-switch',text:'Could you turn on the lamp?',translation:'可以把那盏灯打开吗？',wordIds:['lamp']},
        {id:'rent-includes',text:'Does the rent include water?',translation:'租金包含水费吗？',wordIds:['rent']},
        {id:'deposit-amount',text:'How much is the security deposit?',translation:'租房押金是多少？',wordIds:['deposit']}
      ],
      exercises:[
        {id:'floor-plan',before:'Could you explain this',after:'?',answer:'floor plan',acceptedAnswers:[],translation:'可以解释一下这张户型图吗？',hint:'户型图 · 两个单词',explanation:'floor plan 指展示房间布局的户型图；explain 表示解释。'},
        {id:'keys',before:'When can I pick up the',after:'?',answer:'keys',acceptedAnswers:[],translation:'我什么时候可以领取钥匙？',hint:'钥匙 · k 开头的复数',explanation:'pick up the keys 是领取钥匙；这里使用复数 keys。'},
        {id:'rent',before:'Does the',after:'include water?',answer:'rent',acceptedAnswers:[],translation:'租金包含水费吗？',hint:'租金 · r 开头',explanation:'rent 在这里是名词“租金”；Does ... include ...? 用来询问费用是否包含某项服务。'},
        {id:'deposit',before:'How much is the security',after:'?',answer:'deposit',acceptedAnswers:[],translation:'租房押金是多少？',hint:'押金 · d 开头',explanation:'security deposit 是租房时常见的押金说法；How much is ...? 用来询问金额。'}
      ]
    },
    {
      id:'customer-service',placeId:'customer-service',title:'客服柜台',english:'Customer Service',category:'生活服务',
      description:'认识客服柜台的用品，练习出示收据、退货退款和换货。',
      image: 'assets/customer-service.webp', thumbnail: 'assets/thumbnails/customer-service.webp',imageAlt:'戴着耳麦的客服代表在柜台后接待顾客；柜台上放着电话、笔记本电脑、纸箱、收据和购物袋。',
      imageAltEnglish:'A representative wearing a headset helps a customer at a counter with a telephone, laptop, box, receipt and shopping bag.',
      positions:{representative:[28,34],headset:[24,22],telephone:[53,51],laptop:[16,62],box:[41,70],receipt:[65,79],'shopping-bag':[91,73],counter:[52,91]},
      words:[
        {id:'representative',word:'representative',ipa:'/ˌrɛprɪˈzɛntətɪv/',meaning:'客服代表；代表',note:'customer service representative 是客服代表；口语中也会简称 rep。'},
        {id:'headset',word:'headset',ipa:'/ˈhɛdˌsɛt/',meaning:'耳麦；带麦克风的耳机',note:'图中客服使用的耳机带有麦克风；headphones 常指听音乐用的耳机。'},
        {id:'telephone',word:'telephone',ipa:'/ˈtɛləˌfoʊn/',meaning:'电话；电话机',note:'图中是桌面电话机；日常也常简说 phone。'},
        {id:'laptop',word:'laptop',ipa:'/ˈlæpˌtɑp/',meaning:'笔记本电脑',note:'a laptop 是一台笔记本电脑；on the laptop 可表示在这台电脑上操作。'},
        {id:'box',word:'box',ipa:'/bɑks/',meaning:'盒子；纸箱',note:'图中是 cardboard box（纸箱）；original box 是商品的原包装盒。'},
        {id:'receipt',word:'receipt',ipa:'/rɪˈsit/',meaning:'收据；购物小票',note:'字母 p 不发音；退换货时常需要出示收据。'},
        {id:'shopping-bag',word:'shopping bag',ipa:'/ˈʃɑpɪŋ ˌbæɡ/',meaning:'购物袋',note:'a shopping bag 是一个购物袋；图中的购物袋带有提手。'},
        {id:'counter',word:'counter',ipa:'/ˈkaʊntɚ/',meaning:'柜台',note:'customer service counter 是客服柜台；at the counter 是在柜台处。'},
        {id:'refund',word:'refund',ipa:'/ˈriˌfʌnd/',meaning:'退款',note:'场景延伸词，不对应单独物品；这里是名词，重音在第一音节，request a refund 是申请退款。'},
        {id:'exchange',word:'exchange',ipa:'/ɪksˈtʃeɪndʒ/',meaning:'换货；交换',note:'场景延伸词，不对应单独物品；这里是名词，make an exchange 表示办理换货。'}
      ],
      sentences:[
        {id:'representative-headset',text:'The representative is wearing a headset.',translation:'客服代表戴着耳麦。',wordIds:['representative','headset']},
        {id:'telephone-use',text:'May I use the telephone to call the store?',translation:'我可以用这部电话联系商店吗？',wordIds:['telephone']},
        {id:'laptop-counter',text:'The laptop is on the counter.',translation:'笔记本电脑在柜台上。',wordIds:['laptop','counter']},
        {id:'box-original',text:'Do I need to bring the original box?',translation:'我需要带原包装盒吗？',wordIds:['box']},
        {id:'receipt-show',text:'Here is my receipt.',translation:'这是我的购物小票。',wordIds:['receipt']},
        {id:'shopping-bag-request',text:'Could I have a shopping bag, please?',translation:'可以给我一个购物袋吗？',wordIds:['shopping-bag']},
        {id:'refund-request',text:'I would like to request a refund.',translation:'我想申请退款。',wordIds:['refund']},
        {id:'exchange-request',text:'Can I make an exchange for a different size?',translation:'我可以换一个尺码吗？',wordIds:['exchange']}
      ],
      exercises:[
        {id:'receipt',before:'Here is my',after:'.',answer:'receipt',acceptedAnswers:[],translation:'这是我的购物小票。',hint:'购物小票 · r 开头',explanation:'receipt 是购物后得到的收据；出示物品时可说 Here is my ...。'},
        {id:'box',before:'Do I need to bring the original',after:'?',answer:'box',acceptedAnswers:[],translation:'我需要带原包装盒吗？',hint:'包装盒 · b 开头',explanation:'the original box 是商品原来的包装盒；bring 表示带来。'},
        {id:'refund',before:'I would like to request a',after:'.',answer:'refund',acceptedAnswers:[],translation:'我想申请退款。',hint:'退款 · r 开头',explanation:'request a refund 是申请退款；I would like to ... 是礼貌表达需求的方式。'},
        {id:'exchange',before:'Can I make an',after:'for a different size?',answer:'exchange',acceptedAnswers:[],translation:'我可以换一个尺码吗？',hint:'换货 · e 开头',explanation:'make an exchange 表示办理换货；exchange 以元音音素开头，前面用 an。'}
      ]
    },
    {
      id:'public-transit',placeId:'public-transit',title:'公共交通',english:'Public Transit',category:'出行交通',
      description:'认识公交站和随身行李，练习问路、买票和询问换乘。',
      image: 'assets/public-transit.webp', thumbnail: 'assets/thumbnails/public-transit.webp',imageAlt:'公交站旁，一位乘客拿着车票与蓝色公交车里的司机交谈；站台有站牌、线路图、长椅和背包，乘客身旁有行李箱。',
      imageAltEnglish:'A passenger holds a ticket while talking to the driver of a blue bus beside a bus stop with a route map, bench, backpack and suitcase.',
      positions:{bus:[13,57],driver:[30,36],ticket:[37,40],map:[92,35],'bus-stop':[63,17],bench:[84,72],backpack:[94,65],suitcase:[56,77]},
      words:[
        {id:'bus',word:'bus',ipa:'/bʌs/',meaning:'公交车；巴士',note:'take the bus 表示乘公交车；get on the bus 是上车，get off the bus 是下车。'},
        {id:'driver',word:'driver',ipa:'/ˈdraɪvɚ/',meaning:'司机',note:'bus driver 是公交车司机；ask the driver 表示询问司机。'},
        {id:'ticket',word:'ticket',ipa:'/ˈtɪkɪt/',meaning:'车票；票',note:'a bus ticket 是一张公交车票；ticket 也可指电影票或门票。'},
        {id:'map',word:'map',ipa:'/mæp/',meaning:'地图；线路图',note:'图中是 route map（线路图）；on the map 表示在地图上。'},
        {id:'bus-stop',word:'bus stop',ipa:'/ˈbʌs ˌstɑp/',meaning:'公交车站',note:'热点指向公交站牌；at the bus stop 表示在公交车站。'},
        {id:'bench',word:'bench',ipa:'/bɛntʃ/',meaning:'长椅',note:'指可供几个人坐的长座椅；sit on the bench 表示坐在长椅上。'},
        {id:'backpack',word:'backpack',ipa:'/ˈbækˌpæk/',meaning:'双肩背包',note:'图中是长椅上的绿色背包；a backpack 是一个双肩背包。'},
        {id:'suitcase',word:'suitcase',ipa:'/ˈsutˌkeɪs/',meaning:'行李箱',note:'suitcase 是可数名词；luggage 通常不可数，泛指行李。'},
        {id:'fare',word:'fare',ipa:'/fɛr/',meaning:'车费；票价',note:'场景延伸词，不对应单独物品；bus fare 是公交车费，pay the fare 是支付车费。'},
        {id:'transfer',word:'transfer',ipa:'/ˈtrænsfɚ/',meaning:'换乘；转乘',note:'场景延伸词，不对应单独物品；这里是名词，重音在第一音节；a transfer 可指一次换乘。'}
      ],
      sentences:[
        {id:'driver-bus',text:'I will ask the driver where this bus goes.',translation:'我要问问司机这辆公交车开往哪里。',wordIds:['driver','bus']},
        {id:'ticket-buy',text:'Where can I buy a ticket?',translation:'我在哪里可以买票？',wordIds:['ticket']},
        {id:'map-stop',text:'Could you show me this bus stop on the map?',translation:'可以在地图上给我指出这个公交车站吗？',wordIds:['bus-stop','map']},
        {id:'bench-sit',text:'May I sit on this bench?',translation:'我可以坐在这张长椅上吗？',wordIds:['bench']},
        {id:'luggage-place',text:'Where should I put my backpack and suitcase?',translation:'我应该把背包和行李箱放在哪里？',wordIds:['backpack','suitcase']},
        {id:'fare-amount',text:'How much is the fare?',translation:'车费是多少？',wordIds:['fare']},
        {id:'transfer-need',text:'Will I need a transfer to get downtown?',translation:'去市中心需要换乘吗？',wordIds:['transfer']},
        {id:'bus-downtown',text:'Does this bus go downtown?',translation:'这辆公交车去市中心吗？',wordIds:['bus']}
      ],
      exercises:[
        {id:'ticket',before:'Where can I buy a',after:'?',answer:'ticket',acceptedAnswers:[],translation:'我在哪里可以买票？',hint:'车票 · t 开头',explanation:'buy a ticket 是买一张票；Where can I ...? 用来询问在哪里可以做某事。'},
        {id:'bus-stop',before:'Could you show me this',after:'on the map?',answer:'bus stop',acceptedAnswers:[],translation:'可以在地图上给我指出这个公交车站吗？',hint:'公交车站 · 两个单词',explanation:'bus stop 是公交车站；show me ... on the map 表示在地图上给我指出……。'},
        {id:'fare',before:'How much is the',after:'?',answer:'fare',acceptedAnswers:['bus fare'],translation:'车费是多少？',hint:'车费 · f 开头',explanation:'fare 指乘坐交通工具的费用；bus fare 明确指公交车费。'},
        {id:'transfer',before:'Will I need a',after:'to get downtown?',answer:'transfer',acceptedAnswers:[],translation:'去市中心需要换乘吗？',hint:'换乘 · t 开头的名词',explanation:'a transfer 在这里指一次换乘；get downtown 是到达市中心。'}
      ]
    },
    {
      id:'phone-internet',placeId:'phone-internet',title:'手机与网络营业厅',english:'Phone / Internet Provider',category:'生活服务',
      description:'认识手机和上网设备，练习询问套餐、流量和设备连接。',
      image: 'assets/phone-internet.webp', thumbnail: 'assets/thumbnails/phone-internet.webp',imageAlt:'营业厅工作人员向顾客介绍服务；柜台上有智能手机、路由器、蓝色网线、SIM卡示意卡、充电器、耳机和笔记本电脑。',
      imageAltEnglish:'A representative talks with a customer at a counter displaying a smartphone, router, blue Ethernet cable, SIM card display, charger, headphones and laptop.',
      positions:{smartphone:[11,65],router:[29,68],'ethernet-cable':[39,79],'sim-card':[59,79],charger:[66,68],headphones:[89,73],laptop:[55,53],counter:[49,92]},
      words:[
        {id:'smartphone',word:'smartphone',ipa:'/ˈsmɑrtˌfoʊn/',meaning:'智能手机',note:'写作一个词；日常交谈中常简说 phone，smartphone 强调智能手机。'},
        {id:'router',word:'router',ipa:'/ˈraʊtɚ/',meaning:'路由器',note:'这是常见美式读音；Wi-Fi router 是无线网络路由器。'},
        {id:'ethernet-cable',word:'Ethernet cable',ipa:'/ˈiθɚˌnɛt ˌkeɪbəl/',meaning:'以太网线；网线',note:'用于有线网络连接；Ethernet 的首字母通常大写。'},
        {id:'sim-card',word:'SIM card',ipa:'/ˈsɪm ˌkɑrd/',meaning:'SIM卡；手机卡',note:'SIM 通常读作一个音节 /sɪm/；图中用放大的卡片展示手机卡芯片。'},
        {id:'charger',word:'charger',ipa:'/ˈtʃɑrdʒɚ/',meaning:'充电器',note:'charge 是充电；charger 指用于充电的设备，不是电量本身。'},
        {id:'headphones',word:'headphones',ipa:'/ˈhɛdˌfoʊnz/',meaning:'耳机（复数）',note:'通常用复数；一副耳机可以说 a pair of headphones。'},
        {id:'laptop',word:'laptop',ipa:'/ˈlæpˌtɑp/',meaning:'笔记本电脑',note:'connect a laptop to Wi-Fi 表示把笔记本电脑连上无线网络。'},
        {id:'counter',word:'counter',ipa:'/ˈkaʊntɚ/',meaning:'柜台',note:'图中是展示设备并办理业务的柜台；on the counter 是在柜台上。'},
        {id:'plan',word:'plan',ipa:'/plæn/',meaning:'套餐；方案',note:'场景延伸词，不对应单独物品；phone plan 是手机套餐，internet plan 是网络套餐。'},
        {id:'data',word:'data',ipa:'/ˈdeɪtə/',meaning:'数据；手机流量',note:'场景延伸词，不对应单独物品；此处指上网流量，unlimited data 是不限量流量；美式也有 /ˈdætə/ 的读法。'}
      ],
      sentences:[
        {id:'smartphone-sim',text:'Will this SIM card work in my smartphone?',translation:'这张SIM卡可以用在我的智能手机里吗？',wordIds:['sim-card','smartphone']},
        {id:'router-cable',text:'Does the router come with an Ethernet cable?',translation:'这个路由器附带网线吗？',wordIds:['router','ethernet-cable']},
        {id:'charger-compatible',text:'Is this charger compatible with my phone?',translation:'这个充电器适用于我的手机吗？',wordIds:['charger']},
        {id:'headphones-try',text:'May I try these headphones?',translation:'我可以试用这副耳机吗？',wordIds:['headphones']},
        {id:'laptop-counter',text:'May I put my laptop on the counter?',translation:'我可以把笔记本电脑放在柜台上吗？',wordIds:['laptop','counter']},
        {id:'plan-cost',text:'How much does this plan cost per month?',translation:'这个套餐每个月多少钱？',wordIds:['plan']},
        {id:'data-included',text:'How much data is included?',translation:'包含多少流量？',wordIds:['data']},
        {id:'router-setup',text:'Could you help me set up the router?',translation:'可以帮我设置路由器吗？',wordIds:['router']}
      ],
      exercises:[
        {id:'sim-card',before:'Will this',after:'work in my smartphone?',answer:'SIM card',acceptedAnswers:['sim'],translation:'这张SIM卡可以用在我的智能手机里吗？',hint:'手机卡 · SIM 加一个单词',explanation:'SIM card 是手机卡；work in my smartphone 表示能在我的智能手机中使用。'},
        {id:'router',before:'Could you help me set up the',after:'?',answer:'router',acceptedAnswers:['Wi-Fi router','wifi router'],translation:'可以帮我设置路由器吗？',hint:'路由器 · r 开头',explanation:'set up the router 表示设置路由器；help me 后可以直接接动词原形。'},
        {id:'plan',before:'How much does this',after:'cost per month?',answer:'plan',acceptedAnswers:[],translation:'这个套餐每个月多少钱？',hint:'套餐 · p 开头',explanation:'plan 在营业厅场景中可指通信套餐；per month 表示每个月。'},
        {id:'data',before:'How much',after:'is included?',answer:'data',acceptedAnswers:['mobile data'],translation:'包含多少手机流量？',hint:'流量 · d 开头',explanation:'这里的 data 指套餐中的上网流量；How much ... is included? 用来询问包含的数量。'}
      ]
    },
    {
      id:'insurance-office',placeId:'insurance-office',title:'保险办公室',english:'Insurance Office',category:'生活服务',
      description:'认识保险咨询时使用的物品，练习询问文件、保障范围和保费。',
      image: 'assets/insurance-office.webp', thumbnail: 'assets/thumbnails/insurance-office.webp',imageAlt:'保险工作人员拿着笔向顾客解释桌上的文件；桌上有笔记本电脑、蓝色文件夹和计算器，墙上挂着日历。',
      imageAltEnglish:'An insurance agent uses a pen to explain a document to a customer at a desk with a laptop, blue folder and calculator, with a calendar on the wall.',
      positions:{agent:[33,31],document:[43,61],pen:[37,56],calculator:[59,61],folder:[18,66],laptop:[13,50],calendar:[92,13],desk:[45,78]},
      words:[
        {id:'agent',word:'agent',ipa:'/ˈeɪdʒənt/',meaning:'代理人；业务人员',note:'此处指 insurance agent（保险业务人员）；agent 在其他场景也可指房产经纪人等。'},
        {id:'document',word:'document',ipa:'/ˈdɑkjəmənt/',meaning:'文件',note:'这里是名词，指桌上的纸质文件；document 不一定就是保单。'},
        {id:'pen',word:'pen',ipa:'/pɛn/',meaning:'笔；钢笔',note:'sign with a pen 表示用笔签字；图中工作人员用笔指着文件。'},
        {id:'calculator',word:'calculator',ipa:'/ˈkælkjəˌleɪtɚ/',meaning:'计算器',note:'calculate 是计算；calculator 是用来计算的工具。'},
        {id:'folder',word:'folder',ipa:'/ˈfoʊldɚ/',meaning:'文件夹',note:'图中是蓝色纸质文件夹；电脑里的文件夹也叫 folder。'},
        {id:'laptop',word:'laptop',ipa:'/ˈlæpˌtɑp/',meaning:'笔记本电脑',note:'a laptop 是一台笔记本电脑；computer 是电脑的泛称。'},
        {id:'calendar',word:'calendar',ipa:'/ˈkæləndɚ/',meaning:'日历',note:'on the calendar 表示在日历上；图中是挂在墙上的月历。'},
        {id:'desk',word:'desk',ipa:'/dɛsk/',meaning:'办公桌；书桌',note:'across the desk 表示隔着办公桌；on the desk 表示在桌面上。'},
        {id:'coverage',word:'coverage',ipa:'/ˈkʌvərɪdʒ/',meaning:'保险保障；保障范围',note:'场景延伸词，不对应纸张或其他单独物品；insurance coverage 指保险提供的保障，具体内容需查看条款。'},
        {id:'premium',word:'premium',ipa:'/ˈprimiəm/',meaning:'保险费；保费',note:'场景延伸词，不对应单独物品；monthly premium 是每月保费，annual premium 是年度保费。'}
      ],
      sentences:[
        {id:'agent-document',text:'Could the agent explain this document?',translation:'可以请保险工作人员解释一下这份文件吗？',wordIds:['agent','document']},
        {id:'pen-borrow',text:'May I borrow a pen to take notes?',translation:'我可以借一支笔做笔记吗？',wordIds:['pen']},
        {id:'calculator-use',text:'May I use the calculator to check the total?',translation:'我可以用计算器核对总额吗？',wordIds:['calculator']},
        {id:'folder-document',text:'Can I keep this document in the folder?',translation:'我可以把这份文件放在文件夹里吗？',wordIds:['document','folder']},
        {id:'laptop-desk',text:'The laptop is on the desk.',translation:'笔记本电脑在办公桌上。',wordIds:['laptop','desk']},
        {id:'calendar-date',text:'Could you show me the renewal date on the calendar?',translation:'可以在日历上给我指出续保日期吗？',wordIds:['calendar']},
        {id:'coverage-explain',text:'Could you explain what this coverage includes?',translation:'可以解释一下这项保障包含哪些内容吗？',wordIds:['coverage']},
        {id:'premium-monthly',text:'How much is the monthly premium?',translation:'每月保费是多少？',wordIds:['premium']}
      ],
      exercises:[
        {id:'document',before:'Could you explain this',after:'?',answer:'document',acceptedAnswers:[],translation:'可以解释一下这份文件吗？',hint:'文件 · d 开头',explanation:'document 是文件的通称；Could you explain ...? 用来礼貌地请求解释。'},
        {id:'calculator',before:'May I use the',after:'to check the total?',answer:'calculator',acceptedAnswers:[],translation:'我可以用计算器核对总额吗？',hint:'计算器 · c 开头',explanation:'use the calculator 是使用计算器；check the total 是核对总额。'},
        {id:'coverage',before:'Could you explain what this',after:'includes?',answer:'coverage',acceptedAnswers:['insurance coverage'],translation:'可以解释一下这项保险保障包含哪些内容吗？',hint:'保险保障 · c 开头',explanation:'coverage 指保险提供的保障；what this coverage includes 表示这项保障包含的内容。'},
        {id:'premium',before:'How much is the monthly',after:'?',answer:'premium',acceptedAnswers:['insurance premium'],translation:'每月保费是多少？',hint:'保费 · p 开头',explanation:'monthly premium 是每月保费；premium 在保险语境中指投保人支付的保险费。'}
      ]
    }
  ];
  window.PICTURE_LESSONS.push(...lessons);
})();
