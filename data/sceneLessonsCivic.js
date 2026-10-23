// Civic and campus courses reuse the corresponding dialogue scene images.
(() => {
  const lessons = [
    {
      id:'dmv',placeId:'dmv',title:'车管所',english:'DMV',category:'办事服务',
      description:'认识办证柜台上的证件和表格，练习取号、等候与办理驾驶证业务。',
      image: 'assets/dmv.webp', thumbnail: 'assets/thumbnails/dmv.webp',imageAlt:'车管所内，工作人员在柜台接待出示驾驶证的顾客；柜台上有表格、文件夹、笔和号码票，后方有叫号屏幕和等候椅。',
      imageAltEnglish:'DMV office with a clerk, a customer holding a driver’s license, a counter, form, folder, pen, ticket, display screen and waiting chairs.',
      positions:{clerk:[41,31],'drivers-license':[60,53],form:[43,71],folder:[20,72],pen:[53,68],ticket:[26,80],screen:[29,12],chair:[12,44],counter:[58,84]},
      words:[
        {id:'clerk',word:'clerk',ipa:'/klɝk/',meaning:'办事员；柜台工作人员',note:'这里指车管所柜台工作人员。DMV 是 Department of Motor Vehicles 的缩写，各州机构名称可能不同。'},
        {id:'drivers-license',word:"driver's license",ipa:'/ˈdraɪvɚz ˌlaɪsəns/',meaning:'驾驶证',note:'美式常说 driver’s license；renew my driver’s license 表示更新驾驶证。'},
        {id:'form',word:'form',ipa:'/fɔrm/',meaning:'表格',note:'fill out a form 表示填写表格；application form 是申请表。'},
        {id:'folder',word:'folder',ipa:'/ˈfoʊldɚ/',meaning:'文件夹',note:'这里是装纸质材料的文件夹；keep documents in a folder 表示把文件放在文件夹里。'},
        {id:'pen',word:'pen',ipa:'/pɛn/',meaning:'笔',note:'Could I borrow a pen? 可以用来礼貌地借笔填写材料。'},
        {id:'ticket',word:'ticket',ipa:'/ˈtɪkɪt/',meaning:'号码票；排队号票',note:'图中指等候办事时领取的号码票；ticket 也可指车票或罚单，要结合语境。'},
        {id:'screen',word:'screen',ipa:'/skrin/',meaning:'屏幕',note:'这里指叫号屏幕；on the screen 表示在屏幕上。'},
        {id:'chair',word:'chair',ipa:'/tʃɛr/',meaning:'椅子',note:'等候时可说 Is this chair taken?（这把椅子有人坐吗？）。'},
        {id:'counter',word:'counter',ipa:'/ˈkaʊntɚ/',meaning:'柜台',note:'at the counter 表示在柜台办理业务；服务窗口也常叫 window。'},
        {id:'appointment',word:'appointment',ipa:'/əˈpɔɪntmənt/',meaning:'预约',note:'场景延伸词，不对应单独物品。make an appointment 表示预约时间。'}
      ],
      sentences:[
        {id:'clerk-counter',text:'The clerk can help you at the counter.',translation:'办事员可以在柜台为你提供帮助。',wordIds:['clerk','counter']},
        {id:'renew-license',text:"I need to renew my driver's license.",translation:'我需要更新驾驶证。',wordIds:['drivers-license']},
        {id:'form-pen',text:'Please use a pen to fill out this form.',translation:'请用笔填写这份表格。',wordIds:['pen','form']},
        {id:'folder-documents',text:'My documents are in this folder.',translation:'我的材料在这个文件夹里。',wordIds:['folder']},
        {id:'take-ticket',text:'Do I need to take a ticket?',translation:'我需要先取一张号码票吗？',wordIds:['ticket']},
        {id:'number-screen',text:'Your number will appear on the screen.',translation:'你的号码会显示在屏幕上。',wordIds:['screen']},
        {id:'chair-available',text:'Is this chair taken?',translation:'这把椅子有人坐吗？',wordIds:['chair']},
        {id:'appointment-time',text:'I have an appointment at ten.',translation:'我预约了十点办理。',wordIds:['appointment']}
      ],
      exercises:[
        {id:'license',before:'I need to renew my',after:'.',answer:"driver's license",acceptedAnswers:['drivers license','driver’s license'],translation:'我需要更新驾驶证。',hint:'驾驶证 · driver’s ...',explanation:'renew my driver’s license 表示更新驾驶证；美式 license 用 s 拼写。'},
        {id:'form',before:'Please fill out this',after:'.',answer:'form',acceptedAnswers:['application form'],translation:'请填写这份表格。',hint:'表格 · f 开头',explanation:'fill out this form 是填写这份表格；application form 是申请表。'},
        {id:'ticket',before:'Do I need to take a',after:'?',answer:'ticket',acceptedAnswers:[],translation:'我需要先取一张号码票吗？',hint:'号码票 · t 开头',explanation:'take a ticket 在这个办事场景中指取号等候。'},
        {id:'appointment',before:'I have an',after:'at ten.',answer:'appointment',acceptedAnswers:[],translation:'我预约了十点办理。',hint:'预约 · a 开头',explanation:'have an appointment 表示有预约；appointment 以元音音素开头，因此用 an。'}
      ]
    },
    {
      id:'bank',placeId:'bank',title:'银行',english:'Bank',category:'办事服务',
      description:'从柜台上的现金、银行卡和支票开始，练习开户、存款与索要凭条。',
      image: 'assets/bank.webp', thumbnail: 'assets/thumbnails/bank.webp',imageAlt:'银行柜员在柜台后接待顾客，柜台上摆着现金、银行卡、支票、笔、凭条和计算器，左侧墙上有自动取款机。',
      imageAltEnglish:'Bank with a teller and customer at a counter, an ATM, cash, debit card, check, pen, receipt and calculator.',
      positions:{teller:[40,35],atm:[8,31],cash:[22,73],'debit-card':[25,82],check:[43,77],pen:[57,78],receipt:[61,72],calculator:[38,65],counter:[64,84]},
      words:[
        {id:'teller',word:'teller',ipa:'/ˈtɛlɚ/',meaning:'银行柜员',note:'bank teller 指办理存取款等柜台业务的工作人员。'},
        {id:'atm',word:'ATM',ipa:'/ˌeɪ ti ˈɛm/',meaning:'自动取款机',note:'三个字母分别读；at an ATM 表示在自动取款机上办理业务。'},
        {id:'cash',word:'cash',ipa:'/kæʃ/',meaning:'现金',note:'通常不可数；deposit cash 是存现金，withdraw cash 是取现金。'},
        {id:'debit-card',word:'debit card',ipa:'/ˈdɛbɪt ˌkɑrd/',meaning:'借记卡',note:'借记卡通常直接从银行账户扣款；credit card 是信用卡。'},
        {id:'check',word:'check',ipa:'/tʃɛk/',meaning:'支票',note:'这里是银行支票；美式拼写 check，英式写 cheque。'},
        {id:'pen',word:'pen',ipa:'/pɛn/',meaning:'笔',note:'sign with a pen 表示用笔签名；borrow a pen 是借一支笔。'},
        {id:'receipt',word:'receipt',ipa:'/rɪˈsit/',meaning:'凭条；收据',note:'字母 p 不发音；办理存取款后可以索要 receipt。'},
        {id:'calculator',word:'calculator',ipa:'/ˈkælkjəˌleɪtɚ/',meaning:'计算器',note:'图中指柜台上的计算器；use a calculator 表示使用计算器。'},
        {id:'counter',word:'counter',ipa:'/ˈkaʊntɚ/',meaning:'柜台',note:'bank counter 是银行柜台；at the counter 表示在柜台。'},
        {id:'account',word:'account',ipa:'/əˈkaʊnt/',meaning:'账户',note:'场景延伸词，不对应单独物品。open an account 是开户；checking account 是支票账户。'}
      ],
      sentences:[
        {id:'teller-counter',text:'The teller is at the counter.',translation:'银行柜员在柜台后面。',wordIds:['teller','counter']},
        {id:'cash-deposit',text:'I would like to deposit some cash.',translation:'我想存一些现金。',wordIds:['cash']},
        {id:'atm-location',text:'Where is the nearest ATM?',translation:'最近的自动取款机在哪里？',wordIds:['atm']},
        {id:'debit-card',text:'When will my debit card arrive?',translation:'我的借记卡什么时候能寄到？',wordIds:['debit-card']},
        {id:'check-pen',text:'Could I borrow a pen to sign this check?',translation:'可以借我一支笔签这张支票吗？',wordIds:['pen','check']},
        {id:'receipt-request',text:'Could I have a receipt, please?',translation:'可以给我一张凭条吗？',wordIds:['receipt']},
        {id:'calculator-use',text:'May I use this calculator?',translation:'我可以用一下这个计算器吗？',wordIds:['calculator']},
        {id:'open-account',text:'I would like to open an account.',translation:'我想开一个账户。',wordIds:['account']}
      ],
      exercises:[
        {id:'cash',before:'I would like to deposit some',after:'.',answer:'cash',acceptedAnswers:[],translation:'我想存一些现金。',hint:'现金 · c 开头',explanation:'deposit cash 表示存现金；cash 通常不可数，可以搭配 some。'},
        {id:'atm',before:'Where is the nearest',after:'?',answer:'ATM',acceptedAnswers:['automated teller machine'],translation:'最近的自动取款机在哪里？',hint:'自动取款机 · 三个字母',explanation:'ATM 是 automated teller machine 的缩写，日常通常直接读三个字母。'},
        {id:'debit-card',before:'When will my',after:'arrive?',answer:'debit card',acceptedAnswers:[],translation:'我的借记卡什么时候能寄到？',hint:'借记卡 · 两个单词',explanation:'debit card 是借记卡；my 后面直接接名词短语。'},
        {id:'account',before:'I would like to open an',after:'.',answer:'account',acceptedAnswers:[],translation:'我想开一个账户。',hint:'账户 · a 开头',explanation:'open an account 表示开户；account 以元音音素开头，因此用 an。'}
      ]
    },
    {
      id:'post-office',placeId:'post-office',title:'邮局',english:'Post Office',category:'办事服务',
      description:'辨认寄信和寄包裹所需的物品，练习称重、贴邮票和查询物流。',
      image: 'assets/post-office.webp', thumbnail: 'assets/thumbnails/post-office.webp',imageAlt:'邮局工作人员为顾客称包裹，柜台上有秤、胶带、带邮票的信封和标签，左侧有蓝色邮筒，后方货架摆着包裹。',
      imageAltEnglish:'Post office with a postal clerk, a package on a scale, an envelope with a stamp, packing tape, a label and a blue mailbox.',
      positions:{'postal-clerk':[58,29],package:[58,54],scale:[60,68],envelope:[24,84],stamp:[34,76],tape:[33,66],label:[62,83],mailbox:[10,44]},
      words:[
        {id:'postal-clerk',word:'postal clerk',ipa:'/ˈpoʊstəl ˌklɝk/',meaning:'邮局柜台工作人员',note:'在邮局负责收寄邮件、出售邮票等柜台业务的人。'},
        {id:'package',word:'package',ipa:'/ˈpækɪdʒ/',meaning:'包裹',note:'mail a package 表示寄包裹；parcel 也是包裹的常见说法。'},
        {id:'scale',word:'scale',ipa:'/skeɪl/',meaning:'秤',note:'这里是称包裹重量的秤；put it on the scale 表示把它放在秤上。'},
        {id:'envelope',word:'envelope',ipa:'/ˈɛnvəˌloʊp/',meaning:'信封',note:'an envelope 是一个信封；a padded envelope 是有缓冲内衬的信封。'},
        {id:'stamp',word:'stamp',ipa:'/stæmp/',meaning:'邮票',note:'a stamp 是一枚邮票；put a stamp on the envelope 是把邮票贴在信封上。'},
        {id:'tape',word:'tape',ipa:'/teɪp/',meaning:'胶带',note:'图中是 packing tape（封箱胶带）；a roll of tape 是一卷胶带。'},
        {id:'label',word:'label',ipa:'/ˈleɪbəl/',meaning:'标签；面单',note:'shipping label 是邮寄面单，通常包含收件地址等信息。'},
        {id:'mailbox',word:'mailbox',ipa:'/ˈmeɪlˌbɑks/',meaning:'邮筒；信箱',note:'图中是用于投递邮件的邮筒；美式 mailbox 也可指家门口的信箱。'},
        {id:'tracking-number',word:'tracking number',ipa:'/ˈtrækɪŋ ˌnʌmbɚ/',meaning:'物流追踪号码',note:'场景延伸词；用于在线查询邮件位置和投递状态，不是图片上可读的号码。'},
        {id:'postage',word:'postage',ipa:'/ˈpoʊstɪdʒ/',meaning:'邮资；邮费',note:'场景延伸词，通常不可数；How much is the postage? 表示邮费是多少？'}
      ],
      sentences:[
        {id:'clerk-package',text:'The postal clerk is weighing my package.',translation:'邮局工作人员正在称我的包裹。',wordIds:['postal-clerk','package']},
        {id:'scale-place',text:'Please put the package on the scale.',translation:'请把包裹放在秤上。',wordIds:['package','scale']},
        {id:'envelope-stamp',text:'Does this envelope need another stamp?',translation:'这个信封还需要再贴一枚邮票吗？',wordIds:['envelope','stamp']},
        {id:'tape-request',text:'Could I have some packing tape?',translation:'可以给我一些封箱胶带吗？',wordIds:['tape']},
        {id:'label-address',text:'Please write the address on this label.',translation:'请把地址写在这个标签上。',wordIds:['label']},
        {id:'mailbox-location',text:'Where is the nearest mailbox?',translation:'最近的邮筒在哪里？',wordIds:['mailbox']},
        {id:'tracking-request',text:'Could I have the tracking number?',translation:'可以给我物流追踪号码吗？',wordIds:['tracking-number']},
        {id:'postage-price',text:'How much is the postage?',translation:'邮费是多少？',wordIds:['postage']}
      ],
      exercises:[
        {id:'package',before:'I would like to mail this',after:'.',answer:'package',acceptedAnswers:['parcel'],translation:'我想寄这个包裹。',hint:'包裹 · p 开头',explanation:'mail this package 表示寄这个包裹；parcel 也表示包裹。'},
        {id:'scale',before:'Please put the package on the',after:'.',answer:'scale',acceptedAnswers:[],translation:'请把包裹放在秤上。',hint:'秤 · s 开头',explanation:'on the scale 表示在秤上，工作人员需要称重来计算邮资。'},
        {id:'stamp',before:'Does this envelope need another',after:'?',answer:'stamp',acceptedAnswers:['postage stamp'],translation:'这个信封还需要再贴一枚邮票吗？',hint:'邮票 · s 开头',explanation:'another stamp 是再一枚邮票；postage stamp 是更完整的说法。'},
        {id:'tracking-number',before:'Could I have the',after:'?',answer:'tracking number',acceptedAnswers:[],translation:'可以给我物流追踪号码吗？',hint:'物流追踪号码 · 两个单词',explanation:'tracking number 用于查询物流状态；Could I have ...? 是礼貌请求。'}
      ]
    },
    {
      id:'campus-office',placeId:'campus-office',title:'校园办公室',english:'Campus Office',category:'校园学习',
      description:'在校园办公室认识学生证和办事材料，练习预约咨询、填写表格与询问安排。',
      image: 'assets/campus-office.webp', thumbnail: 'assets/thumbnails/campus-office.webp',imageAlt:'校园办公室内，顾问与学生隔着办公桌交谈；桌上有笔记本电脑、台历、文件夹、表格、学生证和笔，后方墙上有公告板。',
      imageAltEnglish:'Campus office with an advisor and student, a laptop, calendar, folder, form, student ID, pen and bulletin board.',
      positions:{advisor:[36,32],student:[80,36],'student-id':[37,74],form:[48,67],folder:[27,63],laptop:[54,46],calendar:[15,50],pen:[58,71],'bulletin-board':[63,13]},
      words:[
        {id:'advisor',word:'advisor',ipa:'/ədˈvaɪzɚ/',meaning:'顾问；指导老师',note:'academic advisor 是学业顾问，帮助学生了解课程和学习安排；也可拼作 adviser。'},
        {id:'student',word:'student',ipa:'/ˈstudənt/',meaning:'学生',note:'a new student 是新生；college student 是大学生。'},
        {id:'student-id',word:'student ID',ipa:'/ˈstudənt ˌaɪ ˈdi/',meaning:'学生证',note:'这里指学生证卡片；student ID number 才明确指学号。'},
        {id:'form',word:'form',ipa:'/fɔrm/',meaning:'表格',note:'fill out this form 是填写这份表格；submit a form 是提交表格。'},
        {id:'folder',word:'folder',ipa:'/ˈfoʊldɚ/',meaning:'文件夹',note:'这里是装材料的文件夹；in this folder 表示在这个文件夹里。'},
        {id:'laptop',word:'laptop',ipa:'/ˈlæpˌtɑp/',meaning:'笔记本电脑',note:'也可以说 laptop computer；on my laptop 表示在我的笔记本电脑上。'},
        {id:'calendar',word:'calendar',ipa:'/ˈkæləndɚ/',meaning:'日历；台历',note:'图中是桌上的台历；check the calendar 表示查看日历或日程。'},
        {id:'pen',word:'pen',ipa:'/pɛn/',meaning:'笔',note:'用来填写或签署纸质材料；Could I borrow a pen? 表示可以借我一支笔吗？'},
        {id:'bulletin-board',word:'bulletin board',ipa:'/ˈbʊlətɪn ˌbɔrd/',meaning:'公告板',note:'美式常用说法，指张贴通知的板；英式常说 noticeboard。'},
        {id:'appointment',word:'appointment',ipa:'/əˈpɔɪntmənt/',meaning:'预约',note:'场景延伸词，不对应单独物品。an appointment with my advisor 是与顾问的预约。'}
      ],
      sentences:[
        {id:'advisor-student',text:'The advisor is helping a new student.',translation:'顾问正在帮助一位新生。',wordIds:['advisor','student']},
        {id:'student-id',text:'Do I need to bring my student ID?',translation:'我需要带学生证吗？',wordIds:['student-id']},
        {id:'form-pen',text:'Could I borrow a pen to fill out this form?',translation:'可以借我一支笔填写这份表格吗？',wordIds:['pen','form']},
        {id:'folder-documents',text:'All my documents are in this folder.',translation:'我的材料都在这个文件夹里。',wordIds:['folder']},
        {id:'laptop-submit',text:'Can I submit the form on my laptop?',translation:'我可以在笔记本电脑上提交这份表格吗？',wordIds:['laptop','form']},
        {id:'calendar-check',text:'Let me check my calendar.',translation:'让我看一下日程安排。',wordIds:['calendar']},
        {id:'bulletin-board-notice',text:'The notice is on the bulletin board.',translation:'通知在公告板上。',wordIds:['bulletin-board']},
        {id:'appointment-book',text:'I would like to make an appointment with my advisor.',translation:'我想预约与我的顾问见面。',wordIds:['appointment','advisor']}
      ],
      exercises:[
        {id:'student-id',before:'Do I need to bring my',after:'?',answer:'student ID',acceptedAnswers:['student ID card'],translation:'我需要带学生证吗？',hint:'学生证 · student ...',explanation:'student ID 或 student ID card 都可表示学生证。'},
        {id:'form',before:'Could I borrow a pen to fill out this',after:'?',answer:'form',acceptedAnswers:[],translation:'可以借我一支笔填写这份表格吗？',hint:'表格 · f 开头',explanation:'fill out this form 表示填写这份表格。'},
        {id:'bulletin-board',before:'The notice is on the',after:'.',answer:'bulletin board',acceptedAnswers:['noticeboard','notice board'],translation:'通知在公告板上。',hint:'公告板 · 两个单词',explanation:'bulletin board 是美式常见说法；noticeboard 也是公告板。'},
        {id:'appointment',before:'I would like to make an',after:'with my advisor.',answer:'appointment',acceptedAnswers:[],translation:'我想预约与我的顾问见面。',hint:'预约 · a 开头',explanation:'make an appointment with someone 表示预约与某人见面。'}
      ]
    },
    {
      id:'library',placeId:'library',title:'图书馆',english:'Library',category:'校园学习',
      description:'认识借阅柜台、书架和图书用品，练习办借书证、借书与确认归还日期。',
      image: 'assets/library.webp', thumbnail: 'assets/thumbnails/library.webp',imageAlt:'图书馆借阅柜台，图书管理员拿着一本书接待读者；柜台上有借书证、扫描器、台灯和借阅凭条，旁边有书车，后方有书架。',
      imageAltEnglish:'Library checkout desk with a librarian holding a book, a library card, scanner, lamp and receipt, with a book cart and bookshelves nearby.',
      positions:{librarian:[39,28],book:[45,51],'library-card':[49,66],scanner:[54,56],bookshelf:[22,25],'book-cart':[9,72],lamp:[76,45],receipt:[62,63]},
      words:[
        {id:'librarian',word:'librarian',ipa:'/laɪˈbrɛriən/',meaning:'图书管理员',note:'重音在第二音节；图书管理员可以帮助查找图书和了解借阅规则。'},
        {id:'book',word:'book',ipa:'/bʊk/',meaning:'书',note:'这里是名词；check out a book 在图书馆表示办理借书。'},
        {id:'library-card',word:'library card',ipa:'/ˈlaɪˌbrɛri ˌkɑrd/',meaning:'借书证；图书馆读者证',note:'apply for a library card 表示申请借书证。'},
        {id:'scanner',word:'scanner',ipa:'/ˈskænɚ/',meaning:'扫描器',note:'图中是 barcode scanner（条码扫描器），用于读取图书或借书证上的条码。'},
        {id:'bookshelf',word:'bookshelf',ipa:'/ˈbʊkˌʃɛlf/',meaning:'书架',note:'复数是 bookshelves；on the bookshelf 表示在书架上。'},
        {id:'book-cart',word:'book cart',ipa:'/ˈbʊk ˌkɑrt/',meaning:'书车；图书推车',note:'图书馆用于搬运和整理图书的推车。'},
        {id:'lamp',word:'lamp',ipa:'/læmp/',meaning:'灯；台灯',note:'图中是台灯；turn on the lamp 表示打开台灯。'},
        {id:'receipt',word:'receipt',ipa:'/rɪˈsit/',meaning:'借阅凭条；收据',note:'图书馆的 checkout receipt 可以列出借阅图书和归还日期。'},
        {id:'borrow',word:'borrow',ipa:'/ˈbɑroʊ/',meaning:'借入；借阅',note:'场景延伸动词，不对应单独物品。borrow a book 是借入一本书；lend 是借给别人。'},
        {id:'due-date',word:'due date',ipa:'/ˈdu ˌdeɪt/',meaning:'到期日；应归还日期',note:'场景延伸词。图书馆语境中指图书应该归还的日期，不是图片上可读的日期。'}
      ],
      sentences:[
        {id:'librarian-book',text:'The librarian can help you find a book.',translation:'图书管理员可以帮你找书。',wordIds:['librarian','book']},
        {id:'library-card-apply',text:'How do I apply for a library card?',translation:'我该如何申请借书证？',wordIds:['library-card']},
        {id:'scanner-card',text:'Please hold your library card under the scanner.',translation:'请把借书证放在扫描器下方。',wordIds:['library-card','scanner']},
        {id:'bookshelf-location',text:'The book is on that bookshelf.',translation:'那本书在那个书架上。',wordIds:['book','bookshelf']},
        {id:'book-cart',text:'Should I put this book on the book cart?',translation:'我应该把这本书放在书车上吗？',wordIds:['book','book-cart']},
        {id:'lamp-on',text:'May I turn on this lamp?',translation:'我可以打开这盏台灯吗？',wordIds:['lamp']},
        {id:'receipt-due-date',text:'The due date is on your receipt.',translation:'应归还日期印在你的借阅凭条上。',wordIds:['due-date','receipt']},
        {id:'borrow-duration',text:'How long can I borrow this book?',translation:'这本书我可以借多久？',wordIds:['borrow','book']}
      ],
      exercises:[
        {id:'library-card',before:'How do I apply for a',after:'?',answer:'library card',acceptedAnswers:[],translation:'我该如何申请借书证？',hint:'借书证 · 两个单词',explanation:'apply for a library card 表示申请借书证。'},
        {id:'borrow',before:'How long can I',after:'this book?',answer:'borrow',acceptedAnswers:[],translation:'这本书我可以借多久？',hint:'借阅 · b 开头',explanation:'can 后接动词原形 borrow；borrow 表示借入，lend 表示借给别人。'},
        {id:'due-date',before:'The',after:'is on your receipt.',answer:'due date',acceptedAnswers:['return date'],translation:'应归还日期印在你的借阅凭条上。',hint:'应归还日期 · 两个单词',explanation:'due date 在借书语境中表示应归还日期；return date 也能表达归还日期。'},
        {id:'bookshelf',before:'The book is on that',after:'.',answer:'bookshelf',acceptedAnswers:['shelf'],translation:'那本书在那个书架上。',hint:'书架 · b 开头',explanation:'bookshelf 指书架；shelf 是更通用的架子或搁板，也适合这句话。'}
      ]
    }
  ];
  window.PICTURE_LESSONS.push(...lessons);
})();
