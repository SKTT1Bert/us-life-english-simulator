// Care and wellbeing courses reuse the illustrations from the dialogue scenes.
(() => {
  const lessons = [
    {
      id:'gym',placeId:'gym',title:'健身房',english:'Gym',category:'运动健身',
      description:'认识健身器材和随身用品，练习询问器材使用与会员办理。',
      image: 'assets/gym.webp', thumbnail: 'assets/thumbnails/gym.webp',imageAlt:'健身房里，教练与一位背着运动包的顾客交谈；周围有跑步机、哑铃、训练凳、瑜伽垫、毛巾、水瓶和储物柜。',
      imageAltEnglish:'A trainer talks with a customer in a gym with a treadmill, dumbbells, bench, mat, towels, water bottle, lockers and gym bag.',
      positions:{trainer:[44,29],treadmill:[15,49],dumbbell:[9,88],bench:[22,68],mat:[85,87],towel:[61,75],'water-bottle':[55,68],locker:[90,26],'gym-bag':[81,42]},
      words:[
        {id:'trainer',word:'trainer',ipa:'/ˈtreɪnɚ/',meaning:'健身教练',note:'这里指 fitness trainer；personal trainer 是私人教练。'},
        {id:'treadmill',word:'treadmill',ipa:'/ˈtrɛdˌmɪl/',meaning:'跑步机',note:'use the treadmill 表示使用跑步机；重音在第一音节。'},
        {id:'dumbbell',word:'dumbbell',ipa:'/ˈdʌmˌbɛl/',meaning:'哑铃',note:'一只哑铃是 a dumbbell；一对可以说 a pair of dumbbells。'},
        {id:'bench',word:'bench',ipa:'/bɛntʃ/',meaning:'训练凳；长凳',note:'健身房里可说 weight bench；其他场景中也可指公园长凳。'},
        {id:'mat',word:'mat',ipa:'/mæt/',meaning:'垫子',note:'exercise mat 是运动垫；yoga mat 是瑜伽垫。'},
        {id:'towel',word:'towel',ipa:'/ˈtaʊəl/',meaning:'毛巾',note:'a clean towel 是一条干净的毛巾。'},
        {id:'water-bottle',word:'water bottle',ipa:'/ˈwɔtɚ ˌbɑtəl/',meaning:'水瓶',note:'refill my water bottle 表示给我的水瓶重新装水。'},
        {id:'locker',word:'locker',ipa:'/ˈlɑkɚ/',meaning:'储物柜',note:'locker room 是更衣室；locker 指其中一格可上锁的储物柜。'},
        {id:'gym-bag',word:'gym bag',ipa:'/ˈdʒɪm ˌbæɡ/',meaning:'健身包；运动包',note:'用来装运动衣物和用品的包；bag 是可数名词。'},
        {id:'membership',word:'membership',ipa:'/ˈmɛmbɚˌʃɪp/',meaning:'会员资格；会员服务',note:'场景延伸词，不对应图片中的单独物品；a gym membership 是健身房会员资格。'}
      ],
      sentences:[
        {id:'trainer-help',text:'Could a trainer show me how to use the treadmill?',translation:'可以请教练教我怎么用跑步机吗？',wordIds:['trainer','treadmill']},
        {id:'dumbbell-weight',text:'How much does this dumbbell weigh?',translation:'这只哑铃有多重？',wordIds:['dumbbell']},
        {id:'bench-free',text:'Is anyone using this bench?',translation:'有人正在用这张训练凳吗？',wordIds:['bench']},
        {id:'mat-borrow',text:'May I borrow a mat?',translation:'我可以借一张垫子吗？',wordIds:['mat']},
        {id:'towel-request',text:'Where can I get a clean towel?',translation:'我在哪里可以拿到干净的毛巾？',wordIds:['towel']},
        {id:'bottle-refill',text:'Where can I refill my water bottle?',translation:'我在哪里可以给水瓶加水？',wordIds:['water-bottle']},
        {id:'bag-locker',text:'Can I leave my gym bag in a locker?',translation:'我可以把健身包放在储物柜里吗？',wordIds:['gym-bag','locker']},
        {id:'membership-cost',text:'How much is a monthly membership?',translation:'一个月的会员费用是多少？',wordIds:['membership']}
      ],
      exercises:[
        {id:'treadmill',before:'Could you show me how to use the',after:'?',answer:'treadmill',acceptedAnswers:[],translation:'可以教我怎么用跑步机吗？',hint:'跑步机 · t 开头',explanation:'show me how to use ... 表示教我如何使用……；treadmill 是跑步机。'},
        {id:'towel',before:'Where can I get a clean',after:'?',answer:'towel',acceptedAnswers:[],translation:'我在哪里可以拿到干净的毛巾？',hint:'毛巾 · t 开头',explanation:'a clean towel 是一条干净的毛巾。'},
        {id:'locker',before:'Can I leave my gym bag in a',after:'?',answer:'locker',acceptedAnswers:[],translation:'我可以把健身包放在储物柜里吗？',hint:'储物柜 · l 开头',explanation:'leave ... in a locker 表示把……存放在储物柜里。'},
        {id:'membership',before:'How much is a monthly',after:'?',answer:'membership',acceptedAnswers:[],translation:'一个月的会员费用是多少？',hint:'会员服务 · m 开头',explanation:'a monthly membership 是按月办理的会员服务；How much is ...? 用来询价。'}
      ]
    },
    {
      id:'pharmacy',placeId:'pharmacy',title:'药房',english:'Pharmacy',category:'就医沟通',
      description:'认识药房柜台上的用品，练习取药、询问药师和索要收据。',
      image: 'assets/pharmacy.webp', thumbnail: 'assets/thumbnails/pharmacy.webp',imageAlt:'药房里，药师在柜台后与顾客交谈；柜台上有体温计、药瓶、片剂、纸袋和收据，身后有货架。',
      imageAltEnglish:'A pharmacist helps a customer at a pharmacy counter with a thermometer, pill bottle, tablets, paper bag and receipt, with shelves behind her.',
      positions:{pharmacist:[36,37],customer:[83,38],thermometer:[8,77],'pill-bottle':[19,73],tablets:[26,76],'paper-bag':[61,63],counter:[48,87],shelf:[14,28],receipt:[56,74]},
      words:[
        {id:'pharmacist',word:'pharmacist',ipa:'/ˈfɑrməsɪst/',meaning:'药师',note:'指提供药房专业服务的人员；pharmacy 是药房。'},
        {id:'customer',word:'customer',ipa:'/ˈkʌstəmɚ/',meaning:'顾客',note:'指购买商品或服务的人；药房顾客不一定就是用药者本人。'},
        {id:'thermometer',word:'thermometer',ipa:'/θɚˈmɑmətɚ/',meaning:'体温计；温度计',note:'图中是电子体温计，可说 digital thermometer；重音在第二音节。'},
        {id:'pill-bottle',word:'pill bottle',ipa:'/ˈpɪl ˌbɑtəl/',meaning:'药瓶',note:'指装药片或胶囊的瓶子；bottle 是可数名词。'},
        {id:'tablets',word:'tablets',ipa:'/ˈtæbləts/',meaning:'片剂；药片（复数）',note:'一片是 a tablet；在药房语境中 tablet 指片剂，也可用于指平板电脑。'},
        {id:'paper-bag',word:'paper bag',ipa:'/ˈpeɪpɚ ˌbæɡ/',meaning:'纸袋',note:'a paper bag 是一个纸袋；plastic bag 是塑料袋。'},
        {id:'counter',word:'counter',ipa:'/ˈkaʊntɚ/',meaning:'柜台',note:'at the counter 表示在柜台处；over-the-counter 可用来形容非处方药。'},
        {id:'shelf',word:'shelf',ipa:'/ʃɛlf/',meaning:'货架；架子',note:'复数是 shelves；on the shelf 表示在架子上。'},
        {id:'receipt',word:'receipt',ipa:'/rɪˈsit/',meaning:'收据；小票',note:'字母 p 不发音；购物付款后可索要 a receipt。'},
        {id:'prescription',word:'prescription',ipa:'/prɪˈskrɪpʃən/',meaning:'处方',note:'场景延伸词，不对应单独物品；pick up a prescription 常指领取处方药，处方也可以是电子形式。'}
      ],
      sentences:[
        {id:'pharmacist-customer',text:'The pharmacist is helping a customer at the counter.',translation:'药师正在柜台接待一位顾客。',wordIds:['pharmacist','customer','counter']},
        {id:'prescription-pickup',text:'I am here to pick up my prescription.',translation:'我来领取处方药。',wordIds:['prescription']},
        {id:'thermometer-find',text:'Do you sell a digital thermometer?',translation:'你们卖电子体温计吗？',wordIds:['thermometer']},
        {id:'bottle-label',text:'Could you explain the label on this pill bottle?',translation:'可以解释一下这个药瓶上的标签吗？',wordIds:['pill-bottle']},
        {id:'tablets-question',text:'Could I ask the pharmacist about these tablets?',translation:'我可以就这些药片咨询药师吗？',wordIds:['tablets','pharmacist']},
        {id:'paper-bag',text:'Could I have a paper bag, please?',translation:'可以给我一个纸袋吗？',wordIds:['paper-bag']},
        {id:'shelf-location',text:'The thermometer is on that shelf.',translation:'体温计在那个货架上。',wordIds:['thermometer','shelf']},
        {id:'receipt-request',text:'Could I have a receipt, please?',translation:'可以给我一张收据吗？',wordIds:['receipt']}
      ],
      exercises:[
        {id:'prescription',before:'I am here to pick up my',after:'.',answer:'prescription',acceptedAnswers:[],translation:'我来领取处方药。',hint:'处方；此处指处方药 · p 开头',explanation:'pick up my prescription 在药房常表示领取按处方配好的药。'},
        {id:'pharmacist',before:'Could I speak to the',after:'?',answer:'pharmacist',acceptedAnswers:[],translation:'我可以和药师说话吗？',hint:'药师 · p 开头',explanation:'speak to the pharmacist 表示与药师交谈；pharmacy 是地点“药房”。'},
        {id:'paper-bag',before:'Could I have a',after:', please?',answer:'paper bag',acceptedAnswers:[],translation:'可以给我一个纸袋吗？',hint:'纸袋 · 两个单词',explanation:'paper bag 是纸袋；Could I have ...? 是礼貌的索取方式。'},
        {id:'receipt',before:'Could I have a',after:'for this purchase?',answer:'receipt',acceptedAnswers:[],translation:'可以给我这次购物的收据吗？',hint:'收据 · r 开头',explanation:'a receipt for this purchase 是这次购物的收据；receipt 中的 p 不发音。'}
      ]
    },
    {
      id:'hair-salon',placeId:'hair-salon',title:'理发店',english:'Hair Salon',category:'生活服务',
      description:'从理发工具到发型需求，认清眼前物品，练习表达修剪意愿。',
      image: 'assets/hair-salon.webp', thumbnail: 'assets/thumbnails/hair-salon.webp',imageAlt:'理发师站在披着理发围布的顾客身后；推车上有剪刀、梳子、吹风机、毛巾和喷雾瓶，店里有镜子和理发椅。',
      imageAltEnglish:'A stylist stands behind a customer wearing a cape in a salon with scissors, a comb, hair dryer, towel, spray bottle, mirrors and salon chairs.',
      positions:{stylist:[24,29],scissors:[12,79],comb:[23,83],'hair-dryer':[32,77],mirror:[59,18],cape:[50,61],chair:[65,51],towel:[14,72],'spray-bottle':[6,66]},
      words:[
        {id:'stylist',word:'stylist',ipa:'/ˈstaɪlɪst/',meaning:'发型师',note:'hair stylist 明确指发型师；hairdresser 也是常见说法。'},
        {id:'scissors',word:'scissors',ipa:'/ˈsɪzɚz/',meaning:'剪刀',note:'通常用复数形式；一把剪刀说 a pair of scissors。'},
        {id:'comb',word:'comb',ipa:'/koʊm/',meaning:'梳子',note:'这里是名词，词尾 b 不发音；也可作动词，表示梳头发。'},
        {id:'hair-dryer',word:'hair dryer',ipa:'/ˈhɛr ˌdraɪɚ/',meaning:'吹风机',note:'美式英语也常说 blow dryer；两者都指吹干头发的电器。'},
        {id:'mirror',word:'mirror',ipa:'/ˈmɪrɚ/',meaning:'镜子',note:'look in the mirror 表示照镜子；in the mirror 表示在镜中。'},
        {id:'cape',word:'cape',ipa:'/keɪp/',meaning:'理发围布；披肩',note:'这里指 haircutting cape，用来遮住顾客衣服的围布。'},
        {id:'chair',word:'chair',ipa:'/tʃɛr/',meaning:'椅子；理发椅',note:'salon chair 指理发店的椅子；Please take a seat. 是请坐。'},
        {id:'towel',word:'towel',ipa:'/ˈtaʊəl/',meaning:'毛巾',note:'a dry towel 是一条干毛巾；a clean towel 是干净的毛巾。'},
        {id:'spray-bottle',word:'spray bottle',ipa:'/ˈspreɪ ˌbɑtəl/',meaning:'喷雾瓶',note:'spray 是喷雾；图中的喷雾瓶带有手压喷头。'},
        {id:'trim',word:'trim',ipa:'/trɪm/',meaning:'少量修剪',note:'场景延伸词，不对应单独物品；Just a trim, please. 表示只稍微修剪一下。'}
      ],
      sentences:[
        {id:'stylist-trim',text:'I will ask the stylist for a trim.',translation:'我会请发型师稍微修剪一下。',wordIds:['stylist','trim']},
        {id:'scissors-comb',text:'The scissors and comb are on the cart.',translation:'剪刀和梳子在推车上。',wordIds:['scissors','comb']},
        {id:'dryer-heat',text:'Could you turn down the heat on the hair dryer?',translation:'可以把吹风机的温度调低一点吗？',wordIds:['hair-dryer']},
        {id:'mirror-look',text:'May I see the back in the mirror?',translation:'我可以从镜子里看看后面吗？',wordIds:['mirror']},
        {id:'cape-tight',text:'The cape feels a little tight around my neck.',translation:'这条围布在脖子处感觉有点紧。',wordIds:['cape']},
        {id:'chair-sit',text:'Should I sit in this chair?',translation:'我应该坐在这把椅子上吗？',wordIds:['chair']},
        {id:'towel-request',text:'Could I have a dry towel?',translation:'可以给我一条干毛巾吗？',wordIds:['towel']},
        {id:'spray-bottle',text:'Is there water in that spray bottle?',translation:'那个喷雾瓶里装的是水吗？',wordIds:['spray-bottle']}
      ],
      exercises:[
        {id:'trim',before:'Just a',after:', please.',answer:'trim',acceptedAnswers:[],translation:'请稍微修剪一下就好。',hint:'少量修剪 · t 开头',explanation:'Just a trim, please. 是表达只修剪少量头发的常用说法。'},
        {id:'mirror',before:'May I see the back in the',after:'?',answer:'mirror',acceptedAnswers:[],translation:'我可以从镜子里看看后面吗？',hint:'镜子 · m 开头',explanation:'in the mirror 表示在镜子中；这里想看看后面的发型。'},
        {id:'hair-dryer',before:'Could you turn down the heat on the',after:'?',answer:'hair dryer',acceptedAnswers:['blow dryer'],translation:'可以把吹风机的温度调低一点吗？',hint:'吹风机 · 两个单词',explanation:'hair dryer 和 blow dryer 都指吹风机；turn down the heat 是调低温度。'},
        {id:'cape',before:'The',after:'feels a little tight around my neck.',answer:'cape',acceptedAnswers:['haircutting cape','salon cape'],translation:'这条理发围布在脖子处感觉有点紧。',hint:'理发围布 · c 开头',explanation:'cape 在理发场景中指围布；feels a little tight 表示感觉有点紧。'}
      ]
    },
    {
      id:'vet-pet-clinic',placeId:'vet-pet-clinic',title:'宠物诊所',english:'Vet / Pet Clinic',category:'宠物照护',
      description:'认识宠物就诊时常见的人物和用品，练习与兽医进行基础沟通。',
      image: 'assets/vet-pet-clinic.webp', thumbnail: 'assets/thumbnails/vet-pet-clinic.webp',imageAlt:'宠物诊所里，兽医和主人陪着站在检查台上的狗；图中有听诊器、牵引绳、项圈、宠物箱、秤、碗和写字板。',
      imageAltEnglish:'A vet and an owner stand beside a dog on an exam table, with a stethoscope, leash, collar, pet carrier, scale, bowl and clipboard nearby.',
      positions:{vet:[31,34],dog:[51,46],owner:[74,37],stethoscope:[33,35],leash:[24,72],collar:[35,74],carrier:[93,74],scale:[10,64],bowl:[7,82],clipboard:[68,76]},
      words:[
        {id:'vet',word:'vet',ipa:'/vɛt/',meaning:'兽医',note:'是 veterinarian 的常用简称；at the vet 可以表示在兽医诊所。'},
        {id:'dog',word:'dog',ipa:'/dɔɡ/',meaning:'狗',note:'a dog 是一只狗；puppy 指幼犬。'},
        {id:'owner',word:'owner',ipa:'/ˈoʊnɚ/',meaning:'主人；所有者',note:'pet owner 是宠物主人；owner 也用于房屋或商店等的所有者。'},
        {id:'stethoscope',word:'stethoscope',ipa:'/ˈstɛθəˌskoʊp/',meaning:'听诊器',note:'图中挂在兽医脖子上的器具；重音在第一音节。'},
        {id:'leash',word:'leash',ipa:'/liʃ/',meaning:'牵引绳',note:'美式常用 leash；keep a dog on a leash 表示给狗拴着牵引绳。'},
        {id:'collar',word:'collar',ipa:'/ˈkɑlɚ/',meaning:'宠物项圈；衣领',note:'此处指宠物项圈；注意与 color（颜色）区分。'},
        {id:'carrier',word:'carrier',ipa:'/ˈkæriɚ/',meaning:'宠物箱；宠物提篮',note:'pet carrier 指运送宠物的箱子或包；这里指图中的硬壳宠物箱。'},
        {id:'scale',word:'scale',ipa:'/skeɪl/',meaning:'秤',note:'美式英语称一台秤为 a scale；weigh 表示称重。'},
        {id:'bowl',word:'bowl',ipa:'/boʊl/',meaning:'碗',note:'water bowl 是水碗；food bowl 是食盆。'},
        {id:'clipboard',word:'clipboard',ipa:'/ˈklɪpˌbɔrd/',meaning:'写字板；夹板',note:'带有夹子的硬板，方便夹住表格填写。'}
      ],
      sentences:[
        {id:'vet-owner',text:'The vet is talking to the owner about the dog.',translation:'兽医正在和主人谈这只狗的情况。',wordIds:['vet','owner','dog']},
        {id:'stethoscope',text:'The vet has a stethoscope around her neck.',translation:'兽医的脖子上挂着听诊器。',wordIds:['vet','stethoscope']},
        {id:'leash-hold',text:'Should I hold the leash during the visit?',translation:'就诊时需要我牵着牵引绳吗？',wordIds:['leash']},
        {id:'collar-remove',text:'Do you need me to take off the collar?',translation:'需要我把项圈取下来吗？',wordIds:['collar']},
        {id:'carrier-place',text:'Where should I put the carrier?',translation:'我应该把宠物箱放在哪里？',wordIds:['carrier']},
        {id:'scale-dog',text:'Would you like me to help my dog onto the scale?',translation:'需要我帮助我的狗站到秤上吗？',wordIds:['dog','scale']},
        {id:'bowl-water',text:'May I have a bowl of water for my dog?',translation:'可以给我的狗一碗水吗？',wordIds:['bowl','dog']},
        {id:'clipboard-form',text:'Should I fill out the form on this clipboard?',translation:'我需要填写这块写字板上的表格吗？',wordIds:['clipboard']}
      ],
      exercises:[
        {id:'vet',before:'I would like to speak to the',after:', please.',answer:'vet',acceptedAnswers:['veterinarian'],translation:'我想和兽医说话。',hint:'兽医 · v 开头的简称',explanation:'vet 是 veterinarian 的常用简称；speak to 表示与某人交谈。'},
        {id:'leash',before:'Should I hold the',after:'during the visit?',answer:'leash',acceptedAnswers:['lead'],translation:'就诊时需要我牵着牵引绳吗？',hint:'牵引绳 · l 开头',explanation:'leash 是常见美式说法；lead 在英式英语中也可以指牵引绳。'},
        {id:'carrier',before:'Where should I put the',after:'?',answer:'carrier',acceptedAnswers:['pet carrier'],translation:'我应该把宠物箱放在哪里？',hint:'宠物箱 · c 开头',explanation:'carrier 在此处指 pet carrier；Where should I put ...? 用来询问放置位置。'},
        {id:'bowl',before:'May I have a',after:'of water for my dog?',answer:'bowl',acceptedAnswers:[],translation:'可以给我的狗一碗水吗？',hint:'碗 · b 开头',explanation:'a bowl of water 是一碗水；for my dog 表示给我的狗。'}
      ]
    },
    {
      id:'dentist',placeId:'dentist',title:'牙科诊所',english:'Dentist',category:'就医沟通',
      description:'认识牙科诊室里的常见物品，练习表达感受和向牙医提问。',
      image: 'assets/dentist.webp', thumbnail: 'assets/thumbnails/dentist.webp',imageAlt:'牙医与坐在牙科椅上的就诊者交谈；就诊者胸前有围巾，器械盘上有手套、口罩、口腔镜、牙刷和牙线，头顶有诊疗灯。',
      imageAltEnglish:'A dentist talks with a patient in a dental chair wearing a bib; a tray holds gloves, a mask, dental mirror, toothbrush and floss beneath a dental light.',
      positions:{dentist:[34,31],patient:[70,38],'dental-chair':[87,59],bib:[69,53],gloves:[16,73],mask:[30,77],'dental-mirror':[41,78],toothbrush:[48,82],floss:[58,80],light:[82,7]},
      words:[
        {id:'dentist',word:'dentist',ipa:'/ˈdɛntɪst/',meaning:'牙医',note:'a dentist 是一位牙医；dental 是形容词，表示牙科的。'},
        {id:'patient',word:'patient',ipa:'/ˈpeɪʃənt/',meaning:'就诊者；病人',note:'这里是名词；作为形容词也可表示“有耐心的”。'},
        {id:'dental-chair',word:'dental chair',ipa:'/ˈdɛntəl ˌtʃɛr/',meaning:'牙科椅',note:'牙科诊室中供就诊者坐卧的椅子；chair 是可数名词。'},
        {id:'bib',word:'bib',ipa:'/bɪb/',meaning:'围巾；牙科围巾',note:'这里指胸前保护衣服的 dental bib，也可译为牙科围兜；不是日常穿戴的 scarf。'},
        {id:'gloves',word:'gloves',ipa:'/ɡlʌvz/',meaning:'手套（复数）',note:'一只用 glove；一副手套可以说 a pair of gloves。'},
        {id:'mask',word:'mask',ipa:'/mæsk/',meaning:'口罩',note:'图中是医用口罩；在其他语境中也可指面具。'},
        {id:'dental-mirror',word:'dental mirror',ipa:'/ˈdɛntəl ˌmɪrɚ/',meaning:'口腔镜',note:'也称 mouth mirror，指带有手柄的小圆镜。'},
        {id:'toothbrush',word:'toothbrush',ipa:'/ˈtuθˌbrʌʃ/',meaning:'牙刷',note:'tooth 是牙齿，brush 是刷子；合起来写成一个词。'},
        {id:'floss',word:'floss',ipa:'/flɔs/',meaning:'牙线',note:'也可说 dental floss，通常不可数；图中是装牙线的小盒子。'},
        {id:'light',word:'light',ipa:'/laɪt/',meaning:'灯；灯光',note:'图中是 dental light（牙科诊疗灯）；bright 表示明亮的。'}
      ],
      sentences:[
        {id:'dentist-patient',text:'The dentist is talking to a patient in the dental chair.',translation:'牙医正在和坐在牙科椅上的就诊者交谈。',wordIds:['dentist','patient','dental-chair']},
        {id:'bib-remove',text:'May I take off the bib now?',translation:'我现在可以取下这条牙科围巾吗？',wordIds:['bib']},
        {id:'gloves-question',text:'Are these gloves latex-free?',translation:'这些手套不含乳胶吗？',wordIds:['gloves']},
        {id:'mask-request',text:'Could I have a new mask, please?',translation:'可以给我一个新口罩吗？',wordIds:['mask']},
        {id:'mirror-question',text:'What is the dental mirror used for?',translation:'口腔镜是用来做什么的？',wordIds:['dental-mirror']},
        {id:'toothbrush-question',text:'Could I ask you about this toothbrush?',translation:'我可以向您咨询一下这支牙刷吗？',wordIds:['toothbrush']},
        {id:'floss-question',text:'Could you show me how to use floss?',translation:'可以教我如何使用牙线吗？',wordIds:['floss']},
        {id:'light-bright',text:'The light feels a little bright.',translation:'这盏灯让我感觉有点晃眼。',wordIds:['light']}
      ],
      exercises:[
        {id:'dentist',before:'I would like to ask the',after:'a question.',answer:'dentist',acceptedAnswers:[],translation:'我想问牙医一个问题。',hint:'牙医 · d 开头',explanation:'ask someone a question 表示问某人一个问题；dentist 是牙医。'},
        {id:'bib',before:'May I take off the',after:'now?',answer:'bib',acceptedAnswers:['dental bib'],translation:'我现在可以取下牙科围巾吗？',hint:'牙科围巾 · b 开头',explanation:'bib 在这里指保护衣服的牙科围巾；take off 表示取下。'},
        {id:'gloves',before:'Are these',after:'latex-free?',answer:'gloves',acceptedAnswers:[],translation:'这些手套不含乳胶吗？',hint:'手套 · g 开头的复数',explanation:'these 后接复数名词 gloves；latex-free 表示不含乳胶。'},
        {id:'floss',before:'Could you show me how to use',after:'?',answer:'floss',acceptedAnswers:['dental floss'],translation:'可以教我如何使用牙线吗？',hint:'牙线 · f 开头',explanation:'floss 或 dental floss 都表示牙线，通常不用 a；show me how to ... 表示教我如何……。'}
      ]
    }
  ];
  window.PICTURE_LESSONS.push(...lessons);
})();
