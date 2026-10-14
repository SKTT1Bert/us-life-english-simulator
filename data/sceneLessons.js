// Additional picture courses share the existing dialogue place IDs and one image per place.
(() => {
  const lessons = [
    {
      id: 'restaurant', placeId: 'restaurant', title: '餐厅', english: 'Restaurant', category: '吃喝点餐',
      description: '从点餐到结账，认识餐桌上的物品，学会把需要说清楚。',
      image: 'assets/restaurant.png', imageAlt: '餐厅里，服务员与顾客交谈；餐桌上有菜单、餐盘、餐叉、餐刀、水杯和账单，旁边有椅子。',
      imageAltEnglish: 'Restaurant with a waiter, customer, table, chair, menu, plate, fork, knife, glass and bill.',
      positions: {waiter:[52,33],customer:[83,45],table:[50,90],chair:[12,86],menu:[34,57],plate:[55,70],fork:[42,75],knife:[67,75],glass:[69,60],bill:[79,72]},
      words: [
        {id:'waiter',word:'waiter',ipa:'/ˈweɪtɚ/',meaning:'服务员',note:'waiter 通常指男服务员；server 是常见的性别中性说法。'},
        {id:'customer',word:'customer',ipa:'/ˈkʌstəmɚ/',meaning:'顾客',note:'餐厅顾客也可以说 diner；customer 指购买商品或服务的人。'},
        {id:'menu',word:'menu',ipa:'/ˈmɛnju/',meaning:'菜单',note:'a menu 是一份菜单；May I see the menu? 可以用来询问菜单。'},
        {id:'table',word:'table',ipa:'/ˈteɪbəl/',meaning:'桌子；餐桌',note:'a table for two 表示供两人就座的餐桌。'},
        {id:'chair',word:'chair',ipa:'/tʃɛr/',meaning:'椅子',note:'可数名词。Is this chair taken? 表示这把椅子有人用吗？'},
        {id:'plate',word:'plate',ipa:'/pleɪt/',meaning:'盘子；餐盘',note:'a clean plate 是一个干净的盘子；与 bowl（碗）区分。'},
        {id:'fork',word:'fork',ipa:'/fɔrk/',meaning:'餐叉',note:'餐具名词。Can I have a fork? 可以用来索要餐叉。'},
        {id:'knife',word:'knife',ipa:'/naɪf/',meaning:'餐刀',note:'开头 k 不发音；复数 knives 的词尾拼写会变化。'},
        {id:'glass',word:'glass',ipa:'/ɡlæs/',meaning:'玻璃杯',note:'这里是可数名词；a glass of water 是一杯水。'},
        {id:'bill',word:'bill',ipa:'/bɪl/',meaning:'账单',note:'美国餐厅也常说 check。Could we have the check? 表示请给我们账单。'}
      ],
      sentences: [
        {id:'table-two',text:'Could we have a table for two?',translation:'可以给我们一张两人桌吗？',wordIds:['table']},
        {id:'see-menu',text:'May I see the menu, please?',translation:'可以给我看一下菜单吗？',wordIds:['menu']},
        {id:'ask-waiter',text:'The waiter is helping a customer.',translation:'服务员正在帮助一位顾客。',wordIds:['waiter','customer']},
        {id:'chair-free',text:'Is this chair taken?',translation:'这把椅子有人用吗？',wordIds:['chair']},
        {id:'clean-plate',text:'Could I have a clean plate?',translation:'可以给我一个干净的盘子吗？',wordIds:['plate']},
        {id:'cutlery',text:'I need a fork and a knife.',translation:'我需要一把餐叉和一把餐刀。',wordIds:['fork','knife']},
        {id:'water-glass',text:'Could I have a glass of water?',translation:'可以给我一杯水吗？',wordIds:['glass']},
        {id:'ask-bill',text:'Could we have the bill, please?',translation:'可以给我们账单吗？',wordIds:['bill']}
      ],
      exercises: [
        {id:'menu',before:'May I see the',after:', please?',answer:'menu',acceptedAnswers:[],translation:'可以给我看一下菜单吗？',hint:'菜单 · m 开头',explanation:'see the menu 是查看菜单。'},
        {id:'fork',before:'I need a',after:'and a knife.',answer:'fork',acceptedAnswers:[],translation:'我需要一把餐叉和一把餐刀。',hint:'餐叉 · f 开头',explanation:'fork 是餐叉；knife 是餐刀。'},
        {id:'glass',before:'Could I have a',after:'of water?',answer:'glass',acceptedAnswers:['cup'],translation:'可以给我一杯水吗？',hint:'玻璃杯 · g 开头',explanation:'a glass of water 是一杯水；cup 也能构成自然的请求。'},
        {id:'bill',before:'Could we have the',after:', please?',answer:'bill',acceptedAnswers:['check'],translation:'可以给我们账单吗？',hint:'账单 · b 开头',explanation:'bill 和美式餐厅常说的 check 都表示账单。'}
      ]
    },
    {
      id:'supermarket',placeId:'supermarket',title:'超市',english:'Supermarket',category:'购物采购',
      description:'把购物车里的东西说出来，再练习结账、索要小票和询问商品。',
      image:'assets/supermarket.png',imageAlt:'超市结账区，顾客推着购物车与收银员交谈；附近有购物篮、货架、牛奶、苹果、面包和小票。',
      imageAltEnglish:'Supermarket checkout with a cashier, customer, cart, basket, shelves, receipt, milk, apples and bread.',
      positions:{cart:[41,79],basket:[12,83],cashier:[79,27],checkout:[80,80],receipt:[56,32],shelf:[12,34],milk:[52,47],apples:[59,52],bread:[73,56],customer:[37,38]},
      words:[
        {id:'cart',word:'cart',ipa:'/kɑrt/',meaning:'购物车',note:'shopping cart 是购物车；英式也常说 trolley。'},
        {id:'basket',word:'basket',ipa:'/ˈbæskɪt/',meaning:'购物篮',note:'a basket 是一个篮子，用来装少量商品。'},
        {id:'cashier',word:'cashier',ipa:'/kæˈʃɪr/',meaning:'收银员',note:'重音在第二音节；与表示“顾客”的 customer 区分。'},
        {id:'checkout',word:'checkout',ipa:'/ˈtʃɛkˌaʊt/',meaning:'结账区；收银台',note:'名词 checkout 是结账处；动词 check out 通常分成两个词。'},
        {id:'receipt',word:'receipt',ipa:'/rɪˈsit/',meaning:'收据；小票',note:'字母 p 不发音。Keep the receipt. 表示保留小票。'},
        {id:'shelf',word:'shelf',ipa:'/ʃɛlf/',meaning:'货架；架子',note:'复数是 shelves；on the shelf 表示在架子上。'},
        {id:'milk',word:'milk',ipa:'/mɪlk/',meaning:'牛奶',note:'通常不可数，可以说 a carton of milk（一盒牛奶）。'},
        {id:'apples',word:'apples',ipa:'/ˈæpəlz/',meaning:'苹果（复数）',note:'一个苹果是 an apple，多个苹果是 apples。'},
        {id:'bread',word:'bread',ipa:'/brɛd/',meaning:'面包',note:'通常不可数；一条面包可以说 a loaf of bread。'},
        {id:'customer',word:'customer',ipa:'/ˈkʌstəmɚ/',meaning:'顾客',note:'The customer is waiting. 表示顾客正在等候。'}
      ],
      sentences:[
        {id:'get-cart',text:'Where can I get a cart?',translation:'我在哪里可以拿到购物车？',wordIds:['cart']},
        {id:'use-basket',text:'I only need a basket today.',translation:'我今天只需要一个购物篮。',wordIds:['basket']},
        {id:'checkout-location',text:'Where is the checkout?',translation:'结账处在哪里？',wordIds:['checkout']},
        {id:'cashier-customer',text:'The cashier is helping a customer.',translation:'收银员正在帮助一位顾客。',wordIds:['cashier','customer']},
        {id:'receipt-request',text:'Could I have a receipt, please?',translation:'可以给我一张小票吗？',wordIds:['receipt']},
        {id:'milk-shelf',text:'The milk is on that shelf.',translation:'牛奶在那个货架上。',wordIds:['milk','shelf']},
        {id:'buy-apples',text:'I would like these apples.',translation:'我想要这些苹果。',wordIds:['apples']},
        {id:'bread-find',text:'Where can I find the bread?',translation:'我在哪里能找到面包？',wordIds:['bread']}
      ],
      exercises:[
        {id:'cart',before:'Where can I get a',after:'?',answer:'cart',acceptedAnswers:['shopping cart','trolley'],translation:'我在哪里可以拿到购物车？',hint:'购物车 · c 开头',explanation:'cart、shopping cart 或英式 trolley 都可表示购物车。'},
        {id:'receipt',before:'Could I have a',after:', please?',answer:'receipt',acceptedAnswers:[],translation:'可以给我一张小票吗？',hint:'小票 · r 开头',explanation:'receipt 表示收据或小票，p 不发音。'},
        {id:'milk',before:'The',after:'is on that shelf.',answer:'milk',acceptedAnswers:[],translation:'牛奶在那个货架上。',hint:'牛奶 · m 开头',explanation:'milk 通常不可数，这里用 is。'},
        {id:'bread',before:'Where can I find the',after:'?',answer:'bread',acceptedAnswers:[],translation:'我在哪里能找到面包？',hint:'面包 · b 开头',explanation:'find the bread 表示找到面包，bread 通常不可数。'}
      ]
    },
    {
      id:'cafe',placeId:'cafe',title:'咖啡店',english:'Cafe',category:'吃喝点餐',
      description:'认识点单柜台和饮品用品，把一杯咖啡的需求说得更清楚。',
      image:'assets/cafe.png',imageAlt:'咖啡店里，咖啡师在柜台后接待顾客；柜台上有杯子、牛奶、杯盖、餐巾和糕点，左侧有咖啡机和菜单板。',
      imageAltEnglish:'Cafe with a barista, customer, coffee machine, menu, counter, cup, milk, lid, napkin and pastry.',
      positions:{barista:[57,35],customer:[89,47],'coffee-machine':[27,46],menu:[29,13],counter:[46,91],cup:[41,69],milk:[52,66],lid:[65,72],napkin:[61,78],pastry:[28,71]},
      words:[
        {id:'barista',word:'barista',ipa:'/bəˈristə/',meaning:'咖啡师',note:'指制作并供应咖啡的人；重音在第二音节。'},
        {id:'customer',word:'customer',ipa:'/ˈkʌstəmɚ/',meaning:'顾客',note:'顾客点单可以说 I would like ...（我想要……）。'},
        {id:'coffee-machine',word:'coffee machine',ipa:'/ˈkɔfi məˌʃin/',meaning:'咖啡机',note:'espresso machine 指制作浓缩咖啡的机器。'},
        {id:'menu',word:'menu',ipa:'/ˈmɛnju/',meaning:'菜单',note:'菜单板可以说 menu board；不确定饮品时可先看菜单。'},
        {id:'counter',word:'counter',ipa:'/ˈkaʊntɚ/',meaning:'柜台',note:'order at the counter 表示在柜台点单。'},
        {id:'cup',word:'cup',ipa:'/kʌp/',meaning:'杯子',note:'a cup of coffee 是一杯咖啡；这里图中是咖啡杯。'},
        {id:'milk',word:'milk',ipa:'/mɪlk/',meaning:'牛奶',note:'oat milk 是燕麦奶；with milk 表示加奶。'},
        {id:'lid',word:'lid',ipa:'/lɪd/',meaning:'盖子；杯盖',note:'a lid for my cup 表示用于我的杯子的盖子。'},
        {id:'napkin',word:'napkin',ipa:'/ˈnæpkɪn/',meaning:'餐巾；餐巾纸',note:'Can I have a napkin? 可以用来索要餐巾。'},
        {id:'pastry',word:'pastry',ipa:'/ˈpeɪstri/',meaning:'糕点',note:'可指一份糕点；图中的 croissant 是牛角面包。'}
      ],
      sentences:[
        {id:'barista-help',text:'The barista is helping a customer.',translation:'咖啡师正在帮助一位顾客。',wordIds:['barista','customer']},
        {id:'menu-look',text:'May I see the menu?',translation:'我可以看一下菜单吗？',wordIds:['menu']},
        {id:'counter-order',text:'Please order at the counter.',translation:'请在柜台点单。',wordIds:['counter']},
        {id:'cup-coffee',text:'I would like a cup of coffee.',translation:'我想要一杯咖啡。',wordIds:['cup']},
        {id:'milk-add',text:'Could you add some milk?',translation:'可以加一些牛奶吗？',wordIds:['milk']},
        {id:'lid-napkin',text:'Could I have a lid and a napkin?',translation:'可以给我一个杯盖和一张餐巾纸吗？',wordIds:['lid','napkin']},
        {id:'pastry-order',text:'I would like that pastry, please.',translation:'我想要那份糕点。',wordIds:['pastry']},
        {id:'machine',text:'The coffee machine is behind the counter.',translation:'咖啡机在柜台后面。',wordIds:['coffee-machine','counter']}
      ],
      exercises:[
        {id:'cup',before:'I would like a',after:'of coffee.',answer:'cup',acceptedAnswers:[],translation:'我想要一杯咖啡。',hint:'杯子 · c 开头',explanation:'a cup of coffee 是一杯咖啡。'},
        {id:'milk',before:'Could you add some',after:'?',answer:'milk',acceptedAnswers:[],translation:'可以加一些牛奶吗？',hint:'牛奶 · m 开头',explanation:'some milk 是一些牛奶；milk 通常不可数。'},
        {id:'lid',before:'Could I have a',after:'for my cup?',answer:'lid',acceptedAnswers:['cup lid'],translation:'可以给我的杯子一个盖子吗？',hint:'杯盖 · l 开头',explanation:'lid 是盖子；cup lid 明确指杯盖。'},
        {id:'napkin',before:'Could I have a',after:', please?',answer:'napkin',acceptedAnswers:['paper napkin'],translation:'可以给我一张餐巾纸吗？',hint:'餐巾 · n 开头',explanation:'napkin 是餐巾，paper napkin 是纸餐巾。'}
      ]
    },
    {
      id:'airport',placeId:'airport',title:'机场',english:'Airport',category:'交通出行',
      description:'从值机柜台到登机口，认清证件、行李和指示信息，再练习出行沟通。',
      image:'assets/airport.png',imageAlt:'机场值机区域，工作人员在柜台帮助旅客；旅客带着护照、登机牌和行李箱，周围有登机口、指示牌、屏幕和座椅。',
      imageAltEnglish:'Airport with an agent, traveler, passport, boarding pass, suitcase, counter, gate, sign, screen and seats.',
      positions:{passport:[54,41],'boarding-pass':[55,52],suitcase:[78,85],gate:[90,45],sign:[88,13],screen:[22,16],seat:[14,61],traveler:[70,40],agent:[43,40],counter:[44,74]},
      words:[
        {id:'passport',word:'passport',ipa:'/ˈpæspɔrt/',meaning:'护照',note:'Have your passport ready. 表示请准备好护照。'},
        {id:'boarding-pass',word:'boarding pass',ipa:'/ˈbɔrdɪŋ ˌpæs/',meaning:'登机牌',note:'可为纸质或电子登机牌，不等同于预订确认信。'},
        {id:'suitcase',word:'suitcase',ipa:'/ˈsutˌkeɪs/',meaning:'行李箱',note:'一只箱子用 a suitcase；luggage 是更泛指的行李，通常不可数。'},
        {id:'gate',word:'gate',ipa:'/ɡeɪt/',meaning:'登机口',note:'机场中的 gate 指登机口；gate number 是登机口编号。'},
        {id:'sign',word:'sign',ipa:'/saɪn/',meaning:'指示牌；标志',note:'字母 g 不发音；follow the signs 是跟着指示牌走。'},
        {id:'screen',word:'screen',ipa:'/skrin/',meaning:'屏幕',note:'机场屏幕显示航班状态、登机时间和登机口。'},
        {id:'seat',word:'seat',ipa:'/sit/',meaning:'座位',note:'这里是名词；seat number 也可指机上的座位号。'},
        {id:'traveler',word:'traveler',ipa:'/ˈtrævəlɚ/',meaning:'旅客',note:'美式拼写 traveler；英式常写 traveller。'},
        {id:'agent',word:'agent',ipa:'/ˈeɪdʒənt/',meaning:'工作人员；代理人',note:'这里指 airline agent（航空公司工作人员）。'},
        {id:'counter',word:'counter',ipa:'/ˈkaʊntɚ/',meaning:'柜台',note:'check-in counter 是值机柜台。'}
      ],
      sentences:[
        {id:'passport-ready',text:'Please have your passport ready.',translation:'请准备好你的护照。',wordIds:['passport']},
        {id:'boarding-pass',text:'Here is my boarding pass.',translation:'这是我的登机牌。',wordIds:['boarding-pass']},
        {id:'suitcase-check',text:'I would like to check this suitcase.',translation:'我想托运这个行李箱。',wordIds:['suitcase']},
        {id:'gate-find',text:'Where is my gate?',translation:'我的登机口在哪里？',wordIds:['gate']},
        {id:'sign-follow',text:'Please follow the sign to the gate.',translation:'请跟着指示牌前往登机口。',wordIds:['sign','gate']},
        {id:'screen-info',text:'The screen shows the gate number.',translation:'屏幕显示登机口编号。',wordIds:['screen','gate']},
        {id:'seat-wait',text:'You can wait in that seat.',translation:'你可以在那个座位上等候。',wordIds:['seat']},
        {id:'agent-traveler',text:'The agent is helping a traveler at the counter.',translation:'工作人员正在柜台帮助一位旅客。',wordIds:['agent','traveler','counter']}
      ],
      exercises:[
        {id:'passport',before:'Please have your',after:'ready.',answer:'passport',acceptedAnswers:[],translation:'请准备好你的护照。',hint:'护照 · p 开头',explanation:'have your passport ready 表示准备好护照。'},
        {id:'boarding-pass',before:'Here is my',after:'.',answer:'boarding pass',acceptedAnswers:[],translation:'这是我的登机牌。',hint:'登机牌 · 两个单词',explanation:'boarding pass 指登机牌；ticket 的范围更广，不一定是登机牌。'},
        {id:'gate',before:'Where is my',after:'?',answer:'gate',acceptedAnswers:['boarding gate'],translation:'我的登机口在哪里？',hint:'登机口 · g 开头',explanation:'gate 在机场语境中是登机口，也可明确说 boarding gate。'},
        {id:'suitcase',before:'I would like to check this',after:'.',answer:'suitcase',acceptedAnswers:['bag'],translation:'我想托运这个行李箱。',hint:'行李箱 · s 开头',explanation:'check this suitcase 在这里指托运行李；bag（包）也能用于这句请求。'}
      ]
    },
    {
      id:'hotel',placeId:'hotel',title:'酒店',english:'Hotel',category:'住宿出行',
      description:'认识酒店前台和行李用品，练习办理入住、拿房卡和询问设施。',
      image:'assets/hotel.png',imageAlt:'酒店大厅，前台工作人员向客人递房卡；附近有前台桌、服务铃、行李箱、行李车、电梯、沙发和灯。',
      imageAltEnglish:'Hotel lobby with a receptionist, guest, key card, suitcase, elevator, bell, desk, sofa, lamp and luggage cart.',
      positions:{receptionist:[42,33],guest:[68,35],'key-card':[54,37],suitcase:[69,84],elevator:[86,31],bell:[36,47],desk:[41,73],sofa:[12,48],lamp:[26,27],'luggage-cart':[95,55]},
      words:[
        {id:'receptionist',word:'receptionist',ipa:'/rɪˈsɛpʃənɪst/',meaning:'前台工作人员',note:'在酒店可说 front desk agent；重音在第二音节。'},
        {id:'guest',word:'guest',ipa:'/ɡɛst/',meaning:'客人；住客',note:'酒店住客通常叫 guest；a guest 是一位客人。'},
        {id:'key-card',word:'key card',ipa:'/ˈki ˌkɑrd/',meaning:'房卡',note:'酒店开门用的卡片，room key 也可指房间钥匙或房卡。'},
        {id:'suitcase',word:'suitcase',ipa:'/ˈsutˌkeɪs/',meaning:'行李箱',note:'luggage 是泛指行李，通常不可数；suitcase 指一只箱子。'},
        {id:'elevator',word:'elevator',ipa:'/ˈɛləˌveɪtɚ/',meaning:'电梯',note:'常见美式英语；英式常用 lift。'},
        {id:'bell',word:'bell',ipa:'/bɛl/',meaning:'铃；服务铃',note:'ring the bell 表示按铃或摇铃，提醒工作人员。'},
        {id:'desk',word:'desk',ipa:'/dɛsk/',meaning:'桌子；服务台',note:'酒店 front desk 指前台，不只是普通写字桌。'},
        {id:'sofa',word:'sofa',ipa:'/ˈsoʊfə/',meaning:'沙发',note:'couch 也是常见的“沙发”说法。'},
        {id:'lamp',word:'lamp',ipa:'/læmp/',meaning:'灯；台灯',note:'图中为台灯；turn on the lamp 表示打开灯。'},
        {id:'luggage-cart',word:'luggage cart',ipa:'/ˈlʌɡɪdʒ ˌkɑrt/',meaning:'行李车',note:'搬运行李的推车；也可以说 baggage cart。'}
      ],
      sentences:[
        {id:'receptionist-guest',text:'The receptionist is helping a guest.',translation:'前台工作人员正在帮助一位住客。',wordIds:['receptionist','guest']},
        {id:'key-card',text:'Could I have another key card?',translation:'可以再给我一张房卡吗？',wordIds:['key-card']},
        {id:'suitcase-store',text:'Could you store my suitcase?',translation:'可以帮我寄存行李箱吗？',wordIds:['suitcase']},
        {id:'elevator-find',text:'Where is the elevator?',translation:'电梯在哪里？',wordIds:['elevator']},
        {id:'bell-desk',text:'There is a bell on the desk.',translation:'服务台上有一个铃。',wordIds:['bell','desk']},
        {id:'sofa-wait',text:'You can wait on the sofa.',translation:'你可以在沙发上等候。',wordIds:['sofa']},
        {id:'lamp-on',text:'Could you turn on the lamp?',translation:'可以打开那盏灯吗？',wordIds:['lamp']},
        {id:'cart-use',text:'May I use the luggage cart?',translation:'我可以使用行李车吗？',wordIds:['luggage-cart']}
      ],
      exercises:[
        {id:'key-card',before:'Could I have another',after:'?',answer:'key card',acceptedAnswers:['room key'],translation:'可以再给我一张房卡吗？',hint:'房卡 · 两个单词',explanation:'key card 是房卡；room key 在这里也能指房间钥匙或房卡。'},
        {id:'elevator',before:'Where is the',after:'?',answer:'elevator',acceptedAnswers:['lift'],translation:'电梯在哪里？',hint:'电梯 · e 开头',explanation:'elevator 是美式说法，lift 是常见英式说法。'},
        {id:'suitcase',before:'Could you store my',after:'?',answer:'suitcase',acceptedAnswers:['luggage','bag'],translation:'可以帮我寄存行李箱吗？',hint:'行李箱 · s 开头',explanation:'store 在这里表示寄存；luggage 和 bag 也可自然用于这句请求。'},
        {id:'sofa',before:'You can wait on the',after:'.',answer:'sofa',acceptedAnswers:['couch'],translation:'你可以在沙发上等候。',hint:'沙发 · s 开头',explanation:'sofa 和 couch 都表示沙发。'}
      ]
    },
    {
      id:'clinic',placeId:'clinic',title:'诊所',english:'Clinic',category:'就医沟通',
      description:'在诊所前台认清证件和表格，练习预约登记与基本沟通。',
      image:'assets/clinic.png',imageAlt:'诊所前台，工作人员接待一位病人；前台有保险卡、表格、写字板、笔、体温计和口罩，旁边有等候椅。',
      imageAltEnglish:'Clinic reception with a receptionist, patient, insurance card, form, clipboard, pen, chair, thermometer and mask.',
      positions:{receptionist:[27,34],patient:[68,33],'insurance-card':[48,38],form:[43,51],clipboard:[33,53],pen:[46,57],chair:[92,57],thermometer:[10,47],mask:[19,53]},
      words:[
        {id:'receptionist',word:'receptionist',ipa:'/rɪˈsɛpʃənɪst/',meaning:'前台工作人员',note:'诊所的前台通常帮助处理预约、登记和付款。'},
        {id:'patient',word:'patient',ipa:'/ˈpeɪʃənt/',meaning:'病人；就诊者',note:'这里是名词；patient 作为形容词也可表示“有耐心的”。'},
        {id:'insurance-card',word:'insurance card',ipa:'/ɪnˈʃʊrəns ˌkɑrd/',meaning:'保险卡',note:'就医登记时常需要出示 health insurance card（医疗保险卡）。'},
        {id:'form',word:'form',ipa:'/fɔrm/',meaning:'表格',note:'fill out a form 是填写表格；也可说 fill in a form。'},
        {id:'clipboard',word:'clipboard',ipa:'/ˈklɪpˌbɔrd/',meaning:'写字板；夹板',note:'这里指带夹子的硬板，用于固定纸张填写，不是电脑剪贴板。'},
        {id:'pen',word:'pen',ipa:'/pɛn/',meaning:'笔',note:'Can I borrow a pen? 表示可以借我一支笔吗？'},
        {id:'chair',word:'chair',ipa:'/tʃɛr/',meaning:'椅子',note:'Please take a seat. 是请坐；图中的 chair 指具体椅子。'},
        {id:'thermometer',word:'thermometer',ipa:'/θɚˈmɑmətɚ/',meaning:'体温计；温度计',note:'重音在第二音节；在诊所里用于测量体温。'},
        {id:'mask',word:'mask',ipa:'/mæsk/',meaning:'口罩',note:'图中为医用口罩；语境不同，也可指面具。'},
        {id:'appointment',word:'appointment',ipa:'/əˈpɔɪntmənt/',meaning:'预约',note:'抽象的场景延伸词，不对应单独物品。I have an appointment. 表示我有预约。'}
      ],
      sentences:[
        {id:'appointment',text:'I have an appointment today.',translation:'我今天有预约。',wordIds:['appointment']},
        {id:'reception-patient',text:'The receptionist is helping a patient.',translation:'前台工作人员正在帮助一位就诊者。',wordIds:['receptionist','patient']},
        {id:'insurance',text:'Here is my insurance card.',translation:'这是我的保险卡。',wordIds:['insurance-card']},
        {id:'form-clipboard',text:'Please fill out the form on the clipboard.',translation:'请填写写字板上的表格。',wordIds:['form','clipboard']},
        {id:'borrow-pen',text:'Could I borrow a pen?',translation:'可以借我一支笔吗？',wordIds:['pen']},
        {id:'chair-wait',text:'Please wait in that chair.',translation:'请在那把椅子上等候。',wordIds:['chair']},
        {id:'thermometer',text:'This thermometer measures temperature.',translation:'这支体温计用于测量温度。',wordIds:['thermometer']},
        {id:'mask',text:'May I have a mask, please?',translation:'可以给我一个口罩吗？',wordIds:['mask']}
      ],
      exercises:[
        {id:'appointment',before:'I have an',after:'today.',answer:'appointment',acceptedAnswers:[],translation:'我今天有预约。',hint:'预约 · a 开头',explanation:'appointment 表示预约；开头是元音音素，所以这里用 an。'},
        {id:'insurance-card',before:'Here is my',after:'.',answer:'insurance card',acceptedAnswers:['health insurance card'],translation:'这是我的保险卡。',hint:'保险卡 · 两个单词',explanation:'insurance card 是保险卡；health insurance card 明确指医疗保险卡。'},
        {id:'form',before:'Please fill out the',after:'.',answer:'form',acceptedAnswers:[],translation:'请填写这份表格。',hint:'表格 · f 开头',explanation:'fill out the form 表示填写表格。'},
        {id:'pen',before:'Could I borrow a',after:'?',answer:'pen',acceptedAnswers:[],translation:'可以借我一支笔吗？',hint:'笔 · p 开头',explanation:'borrow a pen 是借一支笔；Could I ...? 是礼貌请求。'}
      ]
    }
  ];
  window.PICTURE_LESSONS.push(...lessons);
})();
