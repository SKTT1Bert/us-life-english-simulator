// Scenario data for Daily English Lab V6.
// Fully static: generated in the browser, no backend required.
(function () {
  const commonRequirement = 'Please be ready to explain the situation clearly and ask what information or documents are needed.';

  function lowerFirst(text) {
    if (!text) return text;
    return text.charAt(0).toLowerCase() + text.slice(1);
  }

  function asSentence(text) {
    if (!text) return '';
    return /[.!?]$/.test(text) ? text : `${text}.`;
  }

  function t(id, title, titleCn, category, requirement, phrase, phraseCn, level = 'A2-B1') {
    return {
      id,
      title,
      titleCn,
      category,
      level,
      requirement: requirement || commonRequirement,
      phrase: phrase || asSentence(`I'm here to ${lowerFirst(title)}`),
      phraseCn: phraseCn || `我今天来是想${titleCn}。`,
    };
  }

  const placeDefinitions = [
    {
      id: 'dmv',
      place: 'DMV',
      placeCn: '车管所',
      staffRole: 'DMV Clerk',
      staffRoleCn: 'DMV 工作人员',
      greeting: 'Hi. What are you here for today?',
      greetingCn: '你好，今天来办理什么？',
      arrivalLines: [
        'You walk into a DMV office. The waiting area is busy and the ticket screen keeps updating.',
        'You arrive at the DMV a few minutes before your appointment and try to check in at the front desk.',
        'You tried to handle this online, but the website told you to visit a DMV office in person.'
      ],
      arrivalLinesCn: [
        '你走进 DMV 办公室，等候区很忙，叫号屏一直在更新。',
        '你在预约时间前几分钟到达 DMV，准备去前台登记。',
        '你试过网上办理，但网站提示你必须到 DMV 现场。'
      ],
      tasks: [
        t('renew-license', 'Renew a driver’s license', '更新驾照', 'License', 'Current license, ID, proof of residency, and payment method may be needed.'),
        t('lost-license', 'Replace a lost driver’s license', '补办丢失驾照', 'License', 'Another ID, current address, and replacement fee may be required.'),
        t('stolen-license', 'Report a stolen driver’s license', '报告驾照被盗', 'License', 'Ask whether a police report is needed and how to prevent misuse.'),
        t('real-id', 'Apply for REAL ID', '申请 REAL ID', 'ID', 'Identity document, SSN proof if applicable, and two proofs of residency may be needed.'),
        t('change-address', 'Change the address on a license', '更改驾照地址', 'License', 'New residential address and acceptable proof of residency may be needed.'),
        t('written-test', 'Take a written test', '参加笔试', 'Testing', 'Ask about check-in, testing language, retake rules, and required ID.'),
        t('road-test', 'Schedule a road test', '预约路考', 'Testing', 'Ask about available dates, vehicle requirements, and what to bring.'),
        t('failed-identity', 'Ask about failed identity verification', '询问身份验证失败', 'ID', 'Ask what part could not be verified and what documents can fix it.'),
        t('license-mailing', 'Check license mailing status', '查询驾照邮寄状态', 'License', 'Confirmation number, name, date of birth, and mailing address may be needed.'),
        t('vehicle-registration', 'Register a vehicle', '注册车辆', 'Vehicle', 'Title, insurance, ID, and payment may be needed.'),
        t('renew-registration', 'Renew vehicle registration', '更新车辆注册', 'Vehicle', 'License plate number, notice, insurance, and smog information may be needed.'),
        t('disabled-placard', 'Apply for a disabled parking placard', '申请残疾停车牌', 'Vehicle', 'Medical certification and application form may be needed.')
      ]
    },
    {
      id: 'bank',
      place: 'Bank',
      placeCn: '银行',
      staffRole: 'Banker',
      staffRoleCn: '银行工作人员',
      greeting: 'Hi, welcome in. What can I help you with today?',
      greetingCn: '你好，欢迎光临。今天需要办理什么？',
      arrivalLines: [
        'You walk into a bank branch during a busy weekday morning. A banker calls you to the desk.',
        'You arrive at the bank after trying to solve the issue in the mobile app.',
        'You are at the bank and want to explain the issue clearly without sharing unnecessary private details.'
      ],
      arrivalLinesCn: [
        '你在一个忙碌的工作日上午走进银行网点，客户经理叫你到桌前。',
        '你之前试过在手机银行里解决问题，现在来到网点处理。',
        '你在银行，希望把问题说清楚，同时不透露不必要的私人信息。'
      ],
      tasks: [
        t('open-checking', 'Open a checking account', '开支票账户', 'Account', 'ID, address, phone number, initial deposit, and tax status questions may come up.'),
        t('open-savings', 'Open a savings account', '开储蓄账户', 'Account', 'Ask about minimum balance, interest rate, and monthly fee.'),
        t('close-account', 'Close an account', '关闭账户', 'Account', 'Ask about remaining balance, pending transactions, and account closure confirmation.'),
        t('update-info', 'Update personal information', '更新个人信息', 'Account', 'ID and updated contact information may be needed.'),
        t('change-mailing-address', 'Change a mailing address', '更改邮寄地址', 'Account', 'Bring ID and confirm whether the change affects card delivery or statements.'),
        t('joint-account', 'Add a joint account holder', '添加联名账户持有人', 'Account', 'Both people may need ID and signatures.'),
        t('account-fees', 'Ask about account fees', '询问账户费用', 'Account', 'Ask what the fee is, why it was charged, and how to avoid it.'),
        t('maintenance-fee', 'Ask about a monthly maintenance fee', '询问月费', 'Account', 'Ask whether direct deposit, minimum balance, or student status can waive the fee.'),
        t('lost-debit-card', 'Replace a lost debit card', '补办丢失借记卡', 'Card', 'Ask to lock the old card, verify address, and get a replacement card.'),
        t('stolen-card', 'Report a stolen card', '报告银行卡被盗', 'Card', 'Ask to freeze the card and review recent transactions.'),
        t('activate-card', 'Activate a new debit card', '激活新借记卡', 'Card', 'Ask whether activation can be done in branch or online.'),
        t('reset-pin', 'Reset a debit card PIN', '重设借记卡 PIN', 'Card', 'Ask how to reset the PIN and whether the old card still works.'),
        t('card-declined', 'Ask why a card was declined', '询问银行卡为什么被拒', 'Card', 'Ask whether the issue is fraud protection, limit, card lock, or merchant error.'),
        t('dispute-charge', 'Dispute an unauthorized charge', '争议未经授权扣款', 'Card', 'Ask how to file a dispute and whether a temporary credit is possible.'),
        t('pending-transaction', 'Ask about a pending transaction', '询问 pending 交易', 'Card', 'Ask when it will post or disappear and whether the bank can release it.'),
        t('deposit-cash', 'Deposit cash', '存现金', 'Cash', 'Ask for confirmation that the cash deposit is available immediately.'),
        t('deposit-check', 'Deposit a check', '存支票', 'Cash', 'Ask about check hold, availability date, and receipt.'),
        t('withdraw-cash', 'Withdraw cash', '取现金', 'Cash', 'ID and account verification may be needed for large withdrawals.'),
        t('cashiers-check', 'Get a cashier’s check', '开 cashier’s check', 'Cash', 'Payee name, amount, fee, and ID may be needed.'),
        t('money-order', 'Get a money order', '开 money order', 'Cash', 'Ask about amount limits, fee, and payee information.'),
        t('check-hold', 'Ask about a check hold', '询问支票冻结期', 'Cash', 'Ask why the check is on hold and when funds will be available.'),
        t('wire-transfer', 'Send a wire transfer', '办理电汇', 'Transfer', 'Recipient name, bank information, amount, fee, and deadline may be needed.'),
        t('incoming-wire', 'Check an incoming wire transfer', '查询入账电汇', 'Transfer', 'Ask whether the wire is pending, posted, or missing information.'),
        t('transfer-between-accounts', 'Transfer money between accounts', '账户间转账', 'Transfer', 'Ask about daily limits and posting time.'),
        t('zelle-setup', 'Set up Zelle', '设置 Zelle', 'Transfer', 'Ask about phone/email enrollment and transfer limits.'),
        t('transfer-limits', 'Ask about transfer limits', '询问转账限额', 'Transfer', 'Ask about daily, monthly, and external transfer limits.'),
        t('apply-credit-card', 'Apply for a credit card', '申请信用卡', 'Credit', 'Ask about requirements, credit check, rewards, and annual fee.'),
        t('credit-card-denial', 'Ask about a credit card denial', '询问信用卡被拒原因', 'Credit', 'Ask how to receive the adverse action reason and whether reconsideration is possible.'),
        t('credit-limit', 'Increase a credit limit', '提高信用额度', 'Credit', 'Ask whether it requires a hard pull and what information is needed.'),
        t('online-locked', 'Unlock an online banking account', '解锁网银账户', 'Online', 'Ask how to verify identity and reset access safely.'),
        t('statement-printout', 'Get a bank statement printout', '打印银行账单', 'Documents', 'Ask whether it can include your current address and official bank logo.'),
        t('balance-letter', 'Request proof of account balance', '开账户余额证明', 'Documents', 'Ask for a balance verification letter for housing, school, or visa purposes.')
      ]
    },
    {
      id: 'clinic',
      place: 'Clinic',
      placeCn: '诊所/医院前台',
      staffRole: 'Receptionist',
      staffRoleCn: '前台工作人员',
      greeting: 'Hi. Do you have an appointment today?',
      greetingCn: '你好，今天有预约吗？',
      arrivalLines: [
        'You arrive at a clinic and the front desk asks for your appointment information.',
        'You are feeling uncomfortable and need to explain the main symptoms clearly.',
        'You are trying to understand insurance, copay, and appointment availability.'
      ],
      arrivalLinesCn: [
        '你来到诊所，前台询问你的预约信息。',
        '你身体不舒服，需要把主要症状说清楚。',
        '你想弄清楚保险、自付额和预约时间。'
      ],
      tasks: [
        t('make-appointment', 'Make an appointment', '预约看诊', 'Appointment', 'Ask for the earliest available appointment and whether telehealth is possible.'),
        t('check-in', 'Check in at the front desk', '前台登记', 'Appointment', 'Photo ID, insurance card, date of birth, and forms may be needed.'),
        t('explain-symptoms', 'Explain symptoms to a nurse', '向护士描述症状', 'Care', 'Describe when symptoms started, severity, medication, and allergies.'),
        t('urgent-care', 'Ask about urgent care availability', '询问 urgent care 是否可看', 'Care', 'Ask about walk-in wait time and whether the issue is appropriate for urgent care.'),
        t('insurance', 'Ask whether insurance is accepted', '询问是否接受保险', 'Billing', 'Ask whether the clinic is in-network and what information they need.'),
        t('copay', 'Ask about copay or out-of-pocket cost', '询问自付额/自费费用', 'Billing', 'Ask for estimated cost before seeing the doctor.'),
        t('prescription-refill', 'Request a prescription refill', '续处方', 'Medication', 'Medication name, pharmacy, and prescribing doctor may be needed.'),
        t('test-results', 'Ask for test results', '询问检查结果', 'Records', 'Ask whether results are ready and how to access the patient portal.'),
        t('reschedule', 'Reschedule an appointment', '改预约时间', 'Appointment', 'Ask for alternative dates and cancellation policy.'),
        t('cancel', 'Cancel an appointment', '取消预约', 'Appointment', 'Ask whether there is a cancellation fee.'),
        t('doctors-note', 'Request a doctor’s note', '要医生证明', 'Records', 'Ask whether the note can include date, restrictions, and return-to-work/school time.'),
        t('medical-records', 'Request medical records', '索取病历', 'Records', 'Ask about release form, portal access, and processing time.'),
        t('vaccine-record', 'Request vaccination record', '索取疫苗记录', 'Records', 'Ask for an official copy and whether it can be emailed or printed.'),
        t('new-patient-form', 'Ask about new patient forms', '询问新病人表格', 'Appointment', 'Ask whether forms can be completed online before arrival.'),
        t('pharmacy-change', 'Change pharmacy information', '更改药房信息', 'Medication', 'Provide new pharmacy name, address, and phone number.'),
        t('lab-billing', 'Ask about a lab bill', '询问化验账单', 'Billing', 'Ask whether the lab bill is separate from the clinic bill.')
      ]
    },
    {
      id: 'restaurant',
      place: 'Restaurant',
      placeCn: '餐馆',
      staffRole: 'Server',
      staffRoleCn: '服务员',
      greeting: 'Hi there. How many people are in your party?',
      greetingCn: '你好，请问几位？',
      arrivalLines: [
        'You walk into a restaurant during dinner time. The host is checking the waitlist.',
        'You sit down at a table and the server comes over with menus.',
        'You ordered food, but something about the order or bill is not right.'
      ],
      arrivalLinesCn: [
        '你晚餐时间走进餐馆，前台正在查看等位名单。',
        '你坐到桌边，服务员拿着菜单过来。',
        '你已经点了餐，但订单或账单有问题。'
      ],
      tasks: [
        t('get-table', 'Get a table', '要位子', 'Seating', 'Tell the party size, ask about wait time, and mention seating preferences.'),
        t('make-reservation', 'Make a reservation', '预约订位', 'Seating', 'Ask about available times, party size, and name for reservation.'),
        t('ask-wait-time', 'Ask about wait time', '询问等位时间', 'Seating', 'Ask how long the wait is and whether they can text you.'),
        t('order-food', 'Order food', '点餐', 'Ordering', 'Ask about recommendations, ingredients, side options, and spice level.'),
        t('ask-allergies', 'Ask about allergies', '询问过敏源', 'Ordering', 'Clearly mention the allergy and ask whether the dish contains that ingredient.'),
        t('vegetarian-options', 'Ask for vegetarian options', '询问素食选择', 'Ordering', 'Ask what dishes can be made vegetarian or vegan.'),
        t('customize-order', 'Customize an order', '定制菜品', 'Ordering', 'Ask to remove, substitute, or put sauce on the side.'),
        t('wrong-order', 'Handle a wrong order', '处理上错菜', 'Problem', 'Politely explain what you ordered and what arrived.'),
        t('cold-food', 'Say the food is cold', '说明菜凉了', 'Problem', 'Ask whether they can heat it up or remake it.'),
        t('too-spicy', 'Say the food is too spicy', '说明太辣', 'Problem', 'Ask whether there is a milder option or extra rice/water.'),
        t('bill-error', 'Ask about a bill error', '询问账单错误', 'Payment', 'Ask about extra item, wrong price, or duplicate charge.'),
        t('split-bill', 'Split the bill', '分账', 'Payment', 'Ask whether separate checks are possible.'),
        t('ask-check', 'Ask for the check', '要账单', 'Payment', 'Ask for the check and payment method.'),
        t('tip-question', 'Ask about tipping', '询问小费', 'Payment', 'Ask whether gratuity is already included.'),
        t('takeout-pickup', 'Pick up a takeout order', '取外卖', 'Takeout', 'Give name or order number and check missing items.'),
        t('missing-item', 'Report a missing takeout item', '说明外卖少东西', 'Takeout', 'Politely say what is missing and ask for a fix.'),
        t('left-item', 'Ask about a lost item', '询问遗失物品', 'Problem', 'Describe the item and where you sat.'),
        t('compliment-service', 'Compliment the service', '表扬服务', 'Social', 'Give a polite compliment or ask to speak to the manager.')
      ]
    },
    {
      id: 'supermarket',
      place: 'Supermarket',
      placeCn: '超市',
      staffRole: 'Store Associate',
      staffRoleCn: '店员',
      greeting: 'Hi, can I help you find something?',
      greetingCn: '你好，需要帮你找什么东西吗？',
      arrivalLines: [
        'You are in a supermarket aisle and cannot find what you need.',
        'You are at self-checkout and the machine keeps stopping.',
        'You are at the customer service counter with a receipt.'
      ],
      arrivalLinesCn: [
        '你在超市货架区找不到需要的东西。',
        '你在自助结账机前，机器一直停住。',
        '你拿着小票来到客服柜台。'
      ],
      tasks: [
        t('find-item', 'Find an item', '找商品', 'Shopping', 'Ask where an item is located and whether it is in stock.'),
        t('ask-stock', 'Ask if an item is in stock', '询问是否有货', 'Shopping', 'Ask whether another location has it.'),
        t('price-check', 'Ask for a price check', '询问价格核对', 'Shopping', 'Ask why the shelf price and register price are different.'),
        t('coupon', 'Use a coupon', '使用优惠券', 'Payment', 'Ask whether the coupon applies to this item.'),
        t('membership', 'Ask about membership card', '询问会员卡', 'Payment', 'Ask how to sign up and whether discounts apply today.'),
        t('self-checkout', 'Handle a self-checkout issue', '处理自助结账问题', 'Payment', 'Ask for help when the machine says unexpected item or approval needed.'),
        t('payment-declined', 'Handle payment declined', '处理付款失败', 'Payment', 'Ask whether you can try another card or split payment.'),
        t('return-item', 'Return an item', '退货', 'Returns', 'Bring receipt, item, and ask about refund method.'),
        t('exchange-item', 'Exchange an item', '换货', 'Returns', 'Ask whether exchange is possible without repurchasing.'),
        t('damaged-item', 'Report a damaged item', '说明商品损坏', 'Returns', 'Ask for replacement or refund.'),
        t('bag-fee', 'Ask about bag fee', '询问购物袋费用', 'Payment', 'Ask whether paper/plastic bags cost extra.'),
        t('rain-check', 'Ask for a rain check', '询问缺货保价单', 'Shopping', 'Ask whether sale price can be honored later.'),
        t('delivery-pickup', 'Ask about pickup or delivery order', '询问取货/配送订单', 'Shopping', 'Provide order number and ask about status.'),
        t('loyalty-points', 'Ask about loyalty points', '询问积分', 'Payment', 'Ask how points work and whether they can be applied.')
      ]
    },
    {
      id: 'gym',
      place: 'Gym',
      placeCn: '健身房',
      staffRole: 'Front Desk Staff',
      staffRoleCn: '前台工作人员',
      greeting: 'Hi, welcome. Are you a member with us?',
      greetingCn: '你好，欢迎。你是我们的会员吗？',
      arrivalLines: [
        'You enter a gym and talk to the front desk about membership or access.',
        'You want to use the gym, but something about your membership or payment is unclear.',
        'You are considering joining and want to understand the contract before signing.'
      ],
      arrivalLinesCn: [
        '你走进健身房，向前台询问会员或入场问题。',
        '你想使用健身房，但会员或付款有些问题不清楚。',
        '你考虑办卡，想在签约前弄清楚合同。'
      ],
      tasks: [
        t('tour-gym', 'Ask for a gym tour', '要求参观健身房', 'Membership', 'Ask about equipment, hours, lockers, and parking.'),
        t('join-gym', 'Sign up for a membership', '办理健身房会员', 'Membership', 'Ask about monthly fee, initiation fee, cancellation policy, and contract length.'),
        t('day-pass', 'Buy a day pass', '购买单日票', 'Access', 'Ask about price, ID requirement, and guest policy.'),
        t('guest-pass', 'Ask about guest pass', '询问访客票', 'Access', 'Ask whether you can bring a guest and what they need.'),
        t('cancel-membership', 'Cancel a membership', '取消会员', 'Membership', 'Ask about notice period, cancellation form, and final charge.'),
        t('freeze-membership', 'Freeze a membership', '暂停会员', 'Membership', 'Ask about freeze fee and how long it can be paused.'),
        t('billing-issue', 'Ask about a billing issue', '询问扣费问题', 'Billing', 'Ask why you were charged and whether a refund is possible.'),
        t('locker-issue', 'Ask about a locker issue', '询问储物柜问题', 'Facility', 'Ask for help opening or reporting a locker issue.'),
        t('class-schedule', 'Ask about class schedule', '询问课程表', 'Class', 'Ask how to book classes and whether spots are available.'),
        t('personal-training', 'Ask about personal training', '询问私教课程', 'Class', 'Ask about pricing, trial session, and trainer availability.')
      ]
    },
    {
      id: 'pharmacy',
      place: 'Pharmacy',
      placeCn: '药店',
      staffRole: 'Pharmacy Staff',
      staffRoleCn: '药房工作人员',
      greeting: 'Hi. Are you picking up a prescription?',
      greetingCn: '你好，你是来取处方药的吗？',
      arrivalLines: [
        'You arrive at the pharmacy counter and the line is moving slowly.',
        'You need medication but are not sure whether it is prescription or over-the-counter.',
        'You received a message from the pharmacy and need to understand what it means.'
      ],
      arrivalLinesCn: [
        '你来到药房柜台，队伍移动得比较慢。',
        '你需要买药，但不确定这是处方药还是非处方药。',
        '你收到了药房短信，需要弄清楚意思。'
      ],
      tasks: [
        t('pick-up-prescription', 'Pick up a prescription', '取处方药', 'Prescription', 'Name, date of birth, insurance, and pickup notification may be needed.'),
        t('refill-prescription', 'Refill a prescription', '续处方药', 'Prescription', 'Ask whether refills remain and when it will be ready.'),
        t('transfer-prescription', 'Transfer a prescription', '转移处方', 'Prescription', 'Old pharmacy name, phone number, and medication may be needed.'),
        t('insurance-pharmacy', 'Ask about insurance coverage', '询问保险是否覆盖药费', 'Billing', 'Ask about copay, prior authorization, and alternative medication.'),
        t('medication-out-of-stock', 'Ask about out-of-stock medication', '询问药品缺货', 'Prescription', 'Ask when it will arrive or whether another location has it.'),
        t('side-effects', 'Ask about side effects', '询问副作用', 'Medication', 'Ask pharmacist how to take medication and what side effects to watch for.'),
        t('otc-recommendation', 'Ask for over-the-counter medicine', '询问非处方药推荐', 'Medication', 'Describe symptoms and ask for appropriate OTC options.'),
        t('vaccine-pharmacy', 'Ask about vaccine appointment', '询问疫苗预约', 'Vaccine', 'Ask about availability, insurance, and ID requirements.'),
        t('wrong-medication', 'Report a medication issue', '说明药品问题', 'Problem', 'Ask the pharmacist to verify medication name, dosage, and instructions.'),
        t('pharmacy-hours', 'Ask about pharmacy hours', '询问药房营业时间', 'General', 'Ask about closing time and weekend hours.')
      ]
    },
    {
      id: 'apartment',
      place: 'Apartment Office',
      placeCn: '公寓/租房办公室',
      staffRole: 'Leasing Agent',
      staffRoleCn: '租赁办公室工作人员',
      greeting: 'Hi, are you here for a tour or do you live here already?',
      greetingCn: '你好，你是来看房，还是已经住在这里？',
      arrivalLines: [
        'You walk into a leasing office and want to ask about an apartment clearly.',
        'You are a resident and need help with a maintenance or payment issue.',
        'You are trying to understand lease terms before signing anything.'
      ],
      arrivalLinesCn: [
        '你走进租赁办公室，希望清楚询问公寓情况。',
        '你已经是住户，需要处理维修或付款问题。',
        '你想在签任何东西之前弄清楚租约条款。'
      ],
      tasks: [
        t('tour-apartment', 'Schedule an apartment tour', '预约看房', 'Leasing', 'Ask about available units, price, move-in date, and parking.'),
        t('ask-rent', 'Ask about rent and fees', '询问租金和费用', 'Leasing', 'Ask about base rent, amenity fee, parking, pet fee, utilities, and deposits.'),
        t('apply-apartment', 'Ask about application requirements', '询问申请材料', 'Leasing', 'Ask about ID, income, bank statements, credit check, and application fee.'),
        t('lease-terms', 'Ask about lease terms', '询问租约条款', 'Leasing', 'Ask about lease length, renewal, early termination, and attorney review if relevant.'),
        t('pet-policy', 'Ask about pet policy', '询问宠物政策', 'Leasing', 'Ask about pet rent, pet deposit, breed restrictions, and documents.'),
        t('parking', 'Ask about parking', '询问停车位', 'Leasing', 'Ask about assigned parking, guest parking, EV charging, and monthly cost.'),
        t('maintenance-request', 'Submit a maintenance request', '提交维修申请', 'Resident', 'Describe the issue, urgency, and access permission.'),
        t('package-missing', 'Report a missing package', '报告包裹丢失', 'Resident', 'Provide tracking number and delivery time.'),
        t('noise-complaint', 'Make a noise complaint', '投诉噪音', 'Resident', 'Explain dates, times, and what happened calmly.'),
        t('rent-payment', 'Ask about rent payment', '询问房租付款', 'Resident', 'Ask about portal, late fee, payment method, and receipt.'),
        t('move-in', 'Ask about move-in instructions', '询问入住流程', 'Move-in', 'Ask about keys, elevator reservation, insurance, and utilities.'),
        t('move-out', 'Ask about move-out process', '询问退租流程', 'Move-out', 'Ask about notice, inspection, cleaning, and security deposit.'),
        t('guest-policy', 'Ask about guest policy', '询问访客政策', 'Resident', 'Ask about overnight guests, parking, and registration.'),
        t('renew-lease', 'Ask about lease renewal', '询问续租', 'Resident', 'Ask about renewal offer, rent increase, and deadline.')
      ]
    },
    {
      id: 'airport',
      place: 'Airport',
      placeCn: '机场',
      staffRole: 'Airline Agent',
      staffRoleCn: '航空公司工作人员',
      greeting: 'Hi. Where are you flying today?',
      greetingCn: '你好，你今天飞哪里？',
      arrivalLines: [
        'You are at the airline counter and need help before boarding.',
        'You are going through airport procedures and something unexpected happens.',
        'You need to ask a staff member for clear instructions.'
      ],
      arrivalLinesCn: [
        '你在航空公司柜台，需要登机前的帮助。',
        '你正在走机场流程，但发生了意外情况。',
        '你需要向工作人员询问明确指示。'
      ],
      tasks: [
        t('check-in-flight', 'Check in for a flight', '办理登机', 'Check-in', 'Passport/ID, booking reference, and baggage information may be needed.'),
        t('baggage-fee', 'Ask about baggage fee', '询问行李费', 'Baggage', 'Ask about checked bag price, weight limit, and carry-on rules.'),
        t('overweight-bag', 'Handle an overweight bag', '处理行李超重', 'Baggage', 'Ask about fee, repacking, or additional bag options.'),
        t('lost-baggage', 'Report lost baggage', '报告行李丢失', 'Baggage', 'Provide baggage tag, flight number, address, and contact information.'),
        t('seat-change', 'Ask for a seat change', '要求换座位', 'Check-in', 'Ask politely about aisle/window/nearby seats.'),
        t('flight-delay', 'Ask about a delayed flight', '询问航班延误', 'Flight', 'Ask about new boarding time, connection, and compensation if relevant.'),
        t('missed-connection', 'Handle a missed connection', '处理错过转机', 'Flight', 'Ask about rebooking and hotel/meal voucher if applicable.'),
        t('boarding-gate', 'Ask about boarding gate', '询问登机口', 'Flight', 'Ask where the gate is and when boarding starts.'),
        t('pet-travel', 'Ask about pet travel', '询问宠物登机', 'Special', 'Ask whether pet is added to reservation and what documents are required.'),
        t('special-assistance', 'Ask for special assistance', '请求特殊协助', 'Special', 'Ask about wheelchair, mobility, or other support.'),
        t('security-question', 'Ask about security line', '询问安检队伍', 'Security', 'Ask which line to use and what needs to be removed.'),
        t('refund-rebook', 'Ask about refund or rebooking', '询问退款或改签', 'Flight', 'Ask about options, fees, and earliest available flight.')
      ]
    },
    {
      id: 'post-office',
      place: 'Post Office',
      placeCn: '邮局',
      staffRole: 'Postal Clerk',
      staffRoleCn: '邮局工作人员',
      greeting: 'Hi. What are you sending today?',
      greetingCn: '你好，你今天要寄什么？',
      arrivalLines: [
        'You are at the post office counter with a package or envelope.',
        'You need a mailing service but are not sure which option is best.',
        'You are tracking something that may be delayed or missing.'
      ],
      arrivalLinesCn: [
        '你拿着包裹或信封来到邮局柜台。',
        '你需要寄东西，但不确定哪种服务最合适。',
        '你在查询一个可能延误或丢失的邮件。'
      ],
      tasks: [
        t('mail-package', 'Mail a package', '寄包裹', 'Mailing', 'Ask about shipping options, delivery time, tracking, and insurance.'),
        t('mail-letter', 'Mail a letter', '寄信', 'Mailing', 'Ask about postage, address format, and delivery time.'),
        t('certified-mail', 'Send certified mail', '寄 certified mail', 'Mailing', 'Ask about proof of mailing, return receipt, and tracking.'),
        t('express-mail', 'Send express mail', '寄特快邮件', 'Mailing', 'Ask about guaranteed delivery and signature requirement.'),
        t('buy-stamps', 'Buy stamps', '买邮票', 'Mailing', 'Ask what kind of stamp is needed.'),
        t('package-tracking', 'Ask about package tracking', '查询包裹物流', 'Tracking', 'Provide tracking number and ask about status.'),
        t('missing-package-post', 'Report a missing package', '报告包裹丢失', 'Tracking', 'Ask how to file a missing mail search.'),
        t('hold-mail', 'Request mail hold', '申请暂停投递', 'Services', 'Ask how to hold mail while away.'),
        t('change-address-post', 'Change mailing address', '更改邮寄地址', 'Services', 'Ask how to forward mail to a new address.'),
        t('po-box', 'Rent a PO Box', '租 PO Box', 'Services', 'Ask about size, price, ID requirements, and access hours.')
      ]
    },
    {
      id: 'customer-service',
      place: 'Customer Service',
      placeCn: '客服电话/客服柜台',
      staffRole: 'Representative',
      staffRoleCn: '客服代表',
      greeting: 'Thank you for contacting customer service. How may I assist you?',
      greetingCn: '感谢联系客服。请问有什么可以帮您？',
      arrivalLines: [
        'You are calling customer service and need to explain the issue clearly.',
        'You are at a service counter and want a practical solution, not just a generic answer.',
        'You need to stay polite while asking for escalation or a refund.'
      ],
      arrivalLinesCn: [
        '你正在打客服电话，需要把问题清楚说明。',
        '你在客服柜台，希望得到实际解决方案，而不是泛泛回复。',
        '你需要保持礼貌，同时要求升级处理或退款。'
      ],
      tasks: [
        t('refund-request', 'Request a refund', '申请退款', 'Refund', 'Explain the order, issue, and preferred refund method.'),
        t('exchange-request', 'Request an exchange', '申请换货', 'Refund', 'Ask whether exchange is possible and how to ship or bring it back.'),
        t('subscription-cancel', 'Cancel a subscription', '取消订阅', 'Billing', 'Ask for cancellation confirmation and final billing date.'),
        t('unexpected-charge', 'Ask about an unexpected charge', '询问意外扣费', 'Billing', 'Ask what the charge is for and whether it can be reversed.'),
        t('delivery-delay', 'Ask about delivery delay', '询问配送延误', 'Delivery', 'Ask where the order is and when it will arrive.'),
        t('wrong-item', 'Report a wrong item', '报告收到错误商品', 'Order', 'Explain what you ordered and what you received.'),
        t('damaged-delivery', 'Report damaged delivery', '报告商品损坏', 'Order', 'Ask for replacement, refund, or return label.'),
        t('technical-support', 'Ask for technical support', '请求技术支持', 'Support', 'Describe the error message and what you already tried.'),
        t('account-verification', 'Handle account verification', '处理账号验证', 'Account', 'Ask what information is needed and avoid sharing verification codes unless appropriate.'),
        t('escalate-supervisor', 'Ask to speak with a supervisor', '要求转主管', 'Support', 'Ask politely to escalate after repeated unresolved answers.'),
        t('service-appointment', 'Schedule a service appointment', '预约服务', 'Support', 'Ask about availability, fee, and appointment window.'),
        t('warranty-claim', 'File a warranty claim', '申请保修', 'Support', 'Ask what proof of purchase and photos are needed.')
      ]
    },
    {
      id: 'hotel',
      place: 'Hotel',
      placeCn: '酒店',
      staffRole: 'Front Desk Agent',
      staffRoleCn: '酒店前台',
      greeting: 'Hi, welcome. Do you have a reservation with us?',
      greetingCn: '你好，欢迎入住。你有预订吗？',
      arrivalLines: [
        'You arrive at a hotel front desk and need help with your stay.',
        'You are already staying at the hotel and something needs to be fixed.',
        'You want to ask about charges, check-in, checkout, or room options clearly.'
      ],
      arrivalLinesCn: [
        '你来到酒店前台，需要处理入住相关问题。',
        '你已经住在酒店里，有一些事情需要解决。',
        '你想清楚询问费用、入住、退房或房型问题。'
      ],
      tasks: [
        t('hotel-check-in', 'Check in with a reservation', '凭预订办理入住', 'Check-in', 'ID, credit card, reservation name, and deposit policy may be needed.'),
        t('early-check-in', 'Ask for early check-in', '询问能否提前入住', 'Check-in', 'Ask whether a room is available early and whether there is a fee.'),
        t('late-checkout', 'Request late checkout', '申请延迟退房', 'Checkout', 'Ask what time is possible and whether extra charges apply.'),
        t('room-not-ready', 'Ask why the room is not ready', '询问房间为什么还没准备好', 'Check-in', 'Ask for wait time, luggage storage, or a different room.'),
        t('room-upgrade', 'Ask about a room upgrade', '询问房间升级', 'Room', 'Ask about availability, price difference, and view or bed type.'),
        t('wrong-room-type', 'Handle wrong room type', '处理房型不对', 'Room', 'Explain what you booked and ask for a correction.'),
        t('key-card-not-working', 'Fix a key card problem', '处理房卡打不开门', 'Room', 'Ask the front desk to reissue or reset the key card.'),
        t('noise-issue-hotel', 'Report a noise problem', '报告噪音问题', 'Problem', 'Explain the noise source, time, and ask for help or a room change.'),
        t('housekeeping-request', 'Request housekeeping', '要求客房清洁', 'Service', 'Ask for towels, cleaning, trash pickup, or a specific time.'),
        t('wifi-problem', 'Ask about Wi-Fi problem', '询问 Wi-Fi 问题', 'Service', 'Ask for network name, password, and troubleshooting.'),
        t('deposit-hold', 'Ask about deposit hold', '询问押金预授权', 'Billing', 'Ask when the hold will be released.'),
        t('hotel-bill-error', 'Ask about a hotel bill error', '询问酒店账单错误', 'Billing', 'Ask about duplicate charges, minibar, parking, resort fee, or tax.'),
        t('luggage-storage', 'Ask about luggage storage', '询问行李寄存', 'Service', 'Ask whether bags can be stored before check-in or after checkout.'),
        t('airport-shuttle', 'Ask about airport shuttle', '询问机场接驳车', 'Transportation', 'Ask about schedule, pickup location, and reservation requirement.')
      ]
    },
    {
      id: 'cafe',
      place: 'Cafe',
      placeCn: '咖啡店',
      staffRole: 'Barista',
      staffRoleCn: '咖啡师',
      greeting: 'Hi. What can I get started for you?',
      greetingCn: '你好，想点些什么？',
      arrivalLines: [
        'You walk into a busy cafe and need to order clearly while the line moves fast.',
        'You want to customize a drink and make sure the barista understands your order.',
        'You already picked up your drink, but something about it is wrong.'
      ],
      arrivalLinesCn: [
        '你走进一家很忙的咖啡店，队伍移动很快，你需要清楚点单。',
        '你想定制饮品，并确保咖啡师听懂。',
        '你已经拿到饮品，但发现有问题。'
      ],
      tasks: [
        t('order-coffee', 'Order a coffee', '点咖啡', 'Ordering', 'Say size, drink, hot/iced, milk, sweetness, and name for the order.'),
        t('customize-drink', 'Customize a drink', '定制饮品', 'Ordering', 'Ask for less ice, non-dairy milk, extra shot, syrup, or no sugar.'),
        t('ask-caffeine', 'Ask about caffeine level', '询问咖啡因含量', 'Ordering', 'Ask whether a drink has caffeine and what decaf options exist.'),
        t('ask-dairy-free', 'Ask for dairy-free options', '询问无奶制品选择', 'Ordering', 'Ask about oat, almond, soy milk and cross-contact.'),
        t('mobile-order-pickup', 'Pick up a mobile order', '取手机订单', 'Pickup', 'Give name, order number, and check pickup shelf.'),
        t('wrong-drink', 'Report a wrong drink', '说明饮品做错了', 'Problem', 'Politely explain what you ordered and what you received.'),
        t('drink-spilled', 'Ask for help after a spill', '饮品洒了请求帮助', 'Problem', 'Ask for napkins, replacement, or cleanup help.'),
        t('wifi-cafe', 'Ask about Wi-Fi', '询问咖啡店 Wi-Fi', 'Service', 'Ask for password and seating rules.'),
        t('outlet-seat', 'Ask about outlets or seating', '询问插座或座位', 'Service', 'Ask whether a seat is available and how long you can stay.'),
        t('food-availability-cafe', 'Ask if a pastry is available', '询问点心是否有货', 'Food', 'Ask what bakery items are still available.'),
        t('allergy-cafe', 'Ask about allergy ingredients', '询问过敏成分', 'Food', 'Ask about nuts, dairy, gluten, or other allergens.'),
        t('refund-cafe', 'Ask for a refund or remake', '要求退款或重做', 'Problem', 'Ask politely for a remake if the order is clearly wrong.')
      ]
    },
    {
      id: 'hair-salon',
      place: 'Hair Salon',
      placeCn: '理发店/美发店',
      staffRole: 'Stylist',
      staffRoleCn: '理发师/发型师',
      greeting: 'Hi. What are we doing with your hair today?',
      greetingCn: '你好，今天想怎么处理头发？',
      arrivalLines: [
        'You arrive at a salon and need to describe the haircut or service you want.',
        'You want to be specific so the stylist does not cut too much.',
        'You need to ask about price, timing, or how to fix a haircut problem.'
      ],
      arrivalLinesCn: [
        '你来到理发店，需要描述想要的发型或服务。',
        '你想说得具体一点，避免理发师剪太多。',
        '你需要询问价格、时间，或处理剪发问题。'
      ],
      tasks: [
        t('haircut-basic', 'Get a basic haircut', '普通剪发', 'Haircut', 'Explain length, sides, back, bangs, and how much to take off.'),
        t('trim-only', 'Ask for a trim only', '只修一点点', 'Haircut', 'Say clearly that you only want a small trim.'),
        t('show-reference-photo', 'Use a reference photo', '给参考照片', 'Haircut', 'Show a photo and ask whether it works with your hair.'),
        t('fix-haircut', 'Fix a haircut issue', '修正剪坏的地方', 'Problem', 'Explain what looks uneven or too short.'),
        t('ask-price-salon', 'Ask about price before service', '服务前询问价格', 'Billing', 'Ask for total price and whether tip is separate.'),
        t('wash-and-cut', 'Ask whether wash is included', '询问是否包含洗头', 'Service', 'Ask whether shampoo, blow-dry, or styling is included.'),
        t('hair-color-consult', 'Ask about hair color consultation', '询问染发咨询', 'Color', 'Ask about color options, damage, time, and cost.'),
        t('perm-consult', 'Ask about perm or treatment', '询问烫发或护理', 'Treatment', 'Ask about process, maintenance, and whether your hair is suitable.'),
        t('make-salon-appointment', 'Make a salon appointment', '预约理发', 'Appointment', 'Ask about available times and stylist preference.'),
        t('reschedule-salon', 'Reschedule a salon appointment', '改理发预约', 'Appointment', 'Ask for another time and cancellation policy.'),
        t('product-recommendation', 'Ask for hair product recommendation', '询问护发产品推荐', 'Product', 'Ask what product works for your hair type.'),
        t('too-short-hair', 'Say the haircut is too short', '说明剪得太短', 'Problem', 'Respond politely and ask how it can be adjusted.')
      ]
    },
    {
      id: 'gas-auto',
      place: 'Gas Station / Auto Service',
      placeCn: '加油站/汽车服务',
      staffRole: 'Service Clerk',
      staffRoleCn: '服务人员',
      greeting: 'Hi, what can I help you with today?',
      greetingCn: '你好，今天需要什么帮助？',
      arrivalLines: [
        'You are at a gas station or auto service counter and need quick help.',
        'Something about fuel, payment, tire pressure, or charging is not working.',
        'You want to ask a practical car-related question without using complicated words.'
      ],
      arrivalLinesCn: [
        '你在加油站或汽车服务柜台，需要快速处理问题。',
        '燃油、付款、胎压或充电方面出了问题。',
        '你想用简单英语询问汽车相关问题。'
      ],
      tasks: [
        t('pay-for-gas-inside', 'Pay for gas inside', '进店付款加油', 'Fuel', 'Say pump number, amount, fuel type, and payment method.'),
        t('gas-pump-not-working', 'Report a gas pump not working', '报告油泵不能用', 'Fuel', 'Ask whether to move pumps or reset the pump.'),
        t('wrong-fuel-concern', 'Ask what to do after selecting wrong fuel', '选错油品后询问怎么办', 'Fuel', 'Ask staff before starting the car.'),
        t('car-wash', 'Buy a car wash', '购买洗车服务', 'Service', 'Ask about wash levels, code, and expiration.'),
        t('air-pump', 'Use air pump for tires', '给轮胎打气', 'Tires', 'Ask where the air pump is and how to set PSI.'),
        t('low-tire-pressure', 'Ask about low tire pressure', '询问胎压低', 'Tires', 'Ask for air, leak check, or nearby repair.'),
        t('flat-tire', 'Ask for help with a flat tire', '爆胎求助', 'Emergency', 'Ask whether they can help or recommend roadside assistance.'),
        t('jump-start', 'Ask for a jump start', '请求搭电', 'Emergency', 'Ask if someone can help jump-start the car.'),
        t('ev-charger-issue', 'Report an EV charger issue', '报告电车充电桩问题', 'EV', 'Ask whether the charger can be reset or whether another stall works.'),
        t('ask-restroom', 'Ask to use the restroom', '询问能否使用洗手间', 'General', 'Ask politely if the restroom is available for customers.'),
        t('receipt-gas', 'Ask for a gas receipt', '索要加油小票', 'Payment', 'Ask for printed receipt by pump number.'),
        t('payment-hold-gas', 'Ask about card hold at gas pump', '询问加油站银行卡预授权', 'Payment', 'Ask why a temporary hold appears and when it will drop.'),
        t('oil-change', 'Ask about oil change service', '询问换机油服务', 'Maintenance', 'Ask about price, wait time, and vehicle information.'),
        t('battery-check', 'Ask for battery check', '请求检查电瓶', 'Maintenance', 'Ask whether they can test the battery or recommend a shop.')
      ]
    },
    {
      id: 'campus-office',
      place: 'Campus Office',
      placeCn: '学校办公室',
      staffRole: 'Office Staff',
      staffRoleCn: '办公室工作人员',
      greeting: 'Hi, what office service do you need help with?',
      greetingCn: '你好，你需要办理哪类学校事务？',
      arrivalLines: [
        'You walk into a campus office and need to ask about a student-related issue.',
        'You are trying to understand a policy, form, deadline, or hold on your account.',
        'You want to speak clearly and get the next step in writing if possible.'
      ],
      arrivalLinesCn: [
        '你走进学校办公室，需要询问学生事务。',
        '你想弄清楚某个政策、表格、截止日期或账户 hold。',
        '你希望清楚沟通，并尽量拿到书面下一步。'
      ],
      tasks: [
        t('ask-registration-hold', 'Ask about a registration hold', '询问选课 hold', 'Registration', 'Ask what caused the hold and which office can remove it.'),
        t('course-registration', 'Ask about course registration', '询问选课', 'Registration', 'Ask about seat availability, waitlist, prerequisite, and override.'),
        t('late-add-course', 'Ask to add a course late', '询问能否迟加课', 'Registration', 'Ask about deadline, instructor approval, and form.'),
        t('drop-course', 'Ask about dropping a course', '询问退课', 'Registration', 'Ask about refund, transcript, and visa/full-time implications if relevant.'),
        t('tuition-bill', 'Ask about tuition bill', '询问学费账单', 'Billing', 'Ask what charges mean and when payment is due.'),
        t('payment-plan', 'Ask about payment plan', '询问分期付款计划', 'Billing', 'Ask about enrollment, fee, due dates, and auto-pay.'),
        t('student-id-card', 'Get a student ID card', '办理学生证', 'ID', 'Ask where to get the card, photo requirement, and pickup time.'),
        t('transcript-request', 'Request a transcript', '申请成绩单', 'Records', 'Ask about official transcript, delivery method, and processing time.'),
        t('enrollment-verification', 'Request enrollment verification', '申请在读证明', 'Records', 'Ask whether it can include full-time status and dates.'),
        t('immunization-hold', 'Ask about immunization hold', '询问疫苗 hold', 'Health', 'Ask which record is missing and how to upload it.'),
        t('advisor-appointment', 'Make an advisor appointment', '预约 advisor', 'Advising', 'Ask about availability and what to prepare.'),
        t('financial-aid-question', 'Ask about financial aid documents', '询问助学金文件', 'Financial Aid', 'Ask what document is missing and the deadline.'),
        t('housing-office-campus', 'Ask about campus housing', '询问学校住宿', 'Housing', 'Ask about availability, waitlist, move-in, and cost.'),
        t('international-office', 'Ask international student office a question', '咨询国际学生办公室', 'International', 'Ask about check-in, status, document, or travel signature.'),
        t('lost-campus-item', 'Ask about lost and found', '询问失物招领', 'General', 'Describe the item, location, and time.'),
        t('print-service', 'Ask about printing service', '询问打印服务', 'General', 'Ask where to print, pay, and scan documents.')
      ]
    },
    {
      id: 'library',
      place: 'Library',
      placeCn: '图书馆',
      staffRole: 'Librarian',
      staffRoleCn: '图书馆工作人员',
      greeting: 'Hi, how can I help you in the library today?',
      greetingCn: '你好，今天在图书馆需要什么帮助？',
      arrivalLines: [
        'You are at a library desk and need help finding or using something.',
        'You want a quiet place to study but need to understand rules and reservations.',
        'You are using library services such as printing, borrowing, or research help.'
      ],
      arrivalLinesCn: [
        '你在图书馆服务台，需要找资料或使用服务。',
        '你想找安静学习的位置，但需要了解规则和预约方式。',
        '你正在使用打印、借书或研究咨询等图书馆服务。'
      ],
      tasks: [
        t('library-card', 'Get a library card', '办理图书证', 'Account', 'Ask about ID, address proof, and borrowing rules.'),
        t('find-book', 'Find a book', '找一本书', 'Borrowing', 'Ask for call number, shelf location, and availability.'),
        t('borrow-book', 'Check out a book', '借书', 'Borrowing', 'Ask about due date, renewals, and fines.'),
        t('return-book', 'Return a book', '还书', 'Borrowing', 'Ask where to return it and whether there is a fine.'),
        t('renew-book', 'Renew a borrowed item', '续借图书', 'Borrowing', 'Ask whether renewal is possible online.'),
        t('study-room', 'Reserve a study room', '预约自习室', 'Space', 'Ask about availability, time limit, and group size.'),
        t('quiet-area', 'Ask for a quiet study area', '询问安静学习区', 'Space', 'Ask where quiet zones are located.'),
        t('printing-library', 'Use printing or scanning', '使用打印/扫描', 'Service', 'Ask how to print, scan, pay, and retrieve documents.'),
        t('research-help', 'Ask for research help', '请求研究资料帮助', 'Research', 'Ask how to find articles, databases, and citations.'),
        t('interlibrary-loan', 'Ask about interlibrary loan', '询问馆际互借', 'Borrowing', 'Ask whether another library can send the item.'),
        t('computer-access', 'Ask about computer access', '询问电脑使用', 'Service', 'Ask about guest login, time limits, and software.'),
        t('lost-library-card', 'Report a lost library card', '报告图书证丢失', 'Account', 'Ask how to replace the card and protect the account.')
      ]
    },
    {
      id: 'public-transit',
      place: 'Public Transit',
      placeCn: '公共交通',
      staffRole: 'Transit Staff',
      staffRoleCn: '交通工作人员',
      greeting: 'Hi, where are you trying to go?',
      greetingCn: '你好，你想去哪里？',
      arrivalLines: [
        'You are at a station and need to figure out tickets, routes, or delays.',
        'You are not sure which train, bus, or platform to use.',
        'You need to ask for help quickly while people are moving around you.'
      ],
      arrivalLinesCn: [
        '你在车站，需要弄清楚车票、路线或延误。',
        '你不确定该坐哪班车、公交或去哪个站台。',
        '周围人来人往，你需要快速询问帮助。'
      ],
      tasks: [
        t('buy-transit-ticket', 'Buy a transit ticket', '买公共交通票', 'Ticket', 'Ask about fare, direction, transfer, and payment method.'),
        t('reload-card', 'Reload a transit card', '给交通卡充值', 'Ticket', 'Ask where to reload and whether card or cash is accepted.'),
        t('find-platform', 'Find the right platform', '找正确站台', 'Route', 'Ask which platform or track to use.'),
        t('ask-route', 'Ask for the best route', '询问最佳路线', 'Route', 'Give destination and ask for transfer instructions.'),
        t('missed-stop', 'Ask what to do after missing a stop', '坐过站后询问怎么办', 'Route', 'Ask how to go back or transfer.'),
        t('service-delay', 'Ask about service delay', '询问交通延误', 'Delay', 'Ask expected wait time and alternate route.'),
        t('lost-transit-card', 'Report a lost transit card', '报告交通卡丢失', 'Ticket', 'Ask whether balance can be transferred.'),
        t('fare-inspection', 'Handle fare inspection question', '处理查票问题', 'Ticket', 'Ask what proof of payment is needed.'),
        t('bus-not-arrive', 'Ask why bus has not arrived', '询问公交为什么没来', 'Delay', 'Ask if the route is delayed or cancelled.'),
        t('accessibility-transit', 'Ask about accessibility', '询问无障碍设施', 'Accessibility', 'Ask about elevator, ramp, wheelchair area, or assistance.'),
        t('bike-on-transit', 'Ask about bringing a bike', '询问能否带自行车', 'Rules', 'Ask about bike rules and time restrictions.'),
        t('lost-item-transit', 'Report a lost item on transit', '报告公交/地铁遗失物', 'Lost and Found', 'Provide route, time, and description of the item.'),
        t('train-cancelled', 'Handle a cancelled train', '处理列车取消', 'Delay', 'Ask about next train, refund, or alternate route.'),
        t('ask-last-train', 'Ask about last train or bus', '询问末班车', 'Schedule', 'Ask what time the last service leaves.')
      ]
    },
    {
      id: 'phone-internet',
      place: 'Phone / Internet Provider',
      placeCn: '手机/网络运营商',
      staffRole: 'Service Representative',
      staffRoleCn: '运营商客服',
      greeting: 'Hi, are you here for mobile service or home internet?',
      greetingCn: '你好，你是办理手机服务还是家庭网络？',
      arrivalLines: [
        'You contact a phone or internet provider and need to explain a service issue.',
        'You are comparing plans and want to avoid surprise fees.',
        'Your phone, SIM, bill, or home internet is not working as expected.'
      ],
      arrivalLinesCn: [
        '你联系手机或网络运营商，需要说明服务问题。',
        '你正在比较套餐，希望避免隐藏费用。',
        '你的手机、SIM 卡、账单或家庭网络出现问题。'
      ],
      tasks: [
        t('open-phone-line', 'Open a new phone line', '开通手机号码', 'Mobile', 'Ask about plan, activation fee, SIM/eSIM, and ID requirement.'),
        t('change-phone-plan', 'Change a phone plan', '更改手机套餐', 'Mobile', 'Ask about price, data, contract, and effective date.'),
        t('sim-card', 'Replace a SIM card', '更换 SIM 卡', 'Mobile', 'Ask about activation, phone compatibility, and number transfer.'),
        t('esim-setup', 'Set up eSIM', '设置 eSIM', 'Mobile', 'Ask how to scan QR code or activate in settings.'),
        t('number-port', 'Transfer a phone number', '转入手机号', 'Mobile', 'Ask about account number, transfer PIN, and timing.'),
        t('phone-bill', 'Ask about a phone bill', '询问手机账单', 'Billing', 'Ask what each charge means and whether discounts apply.'),
        t('roaming-charge', 'Ask about roaming charge', '询问漫游费', 'Billing', 'Ask why the charge appeared and how to avoid it next time.'),
        t('cancel-phone-service', 'Cancel phone service', '取消手机服务', 'Mobile', 'Ask about final bill, number loss, and cancellation date.'),
        t('home-internet-install', 'Schedule home internet installation', '预约家庭网络安装', 'Internet', 'Ask about appointment window, equipment, and activation.'),
        t('internet-outage', 'Report an internet outage', '报告网络中断', 'Internet', 'Ask whether there is an outage and estimated repair time.'),
        t('slow-internet', 'Ask about slow internet', '询问网速慢', 'Internet', 'Ask about troubleshooting, modem reset, and technician visit.'),
        t('router-return', 'Return internet equipment', '归还网络设备', 'Internet', 'Ask where to return router/modem and get receipt.'),
        t('promotional-price', 'Ask about promotional price ending', '询问优惠价到期', 'Billing', 'Ask whether a new promotion is available.'),
        t('autopay-discount', 'Ask about autopay discount', '询问自动付款折扣', 'Billing', 'Ask how to enroll and when discount applies.'),
        t('service-address-change', 'Move service to a new address', '搬家迁移服务', 'Internet', 'Ask whether service is available at the new address.'),
        t('unlock-phone', 'Ask about unlocking a phone', '询问手机解锁', 'Mobile', 'Ask about eligibility, payoff, and processing time.')
      ]
    },
    {
      id: 'vet-pet-clinic',
      place: 'Vet / Pet Clinic',
      placeCn: '兽医/宠物医院',
      staffRole: 'Vet Receptionist',
      staffRoleCn: '宠物医院前台',
      greeting: 'Hi, are you here for an appointment for your pet?',
      greetingCn: '你好，你是带宠物来看预约的吗？',
      arrivalLines: [
        'You arrive at a pet clinic and need to explain your pet’s situation clearly.',
        'You want to ask about vaccines, records, travel documents, or an urgent symptom.',
        'You are worried about cost, timing, and what documents or records are needed.'
      ],
      arrivalLinesCn: [
        '你来到宠物医院，需要清楚说明宠物情况。',
        '你想询问疫苗、记录、旅行文件或紧急症状。',
        '你担心费用、时间，以及需要什么文件或记录。'
      ],
      tasks: [
        t('vet-appointment', 'Make a vet appointment', '预约兽医', 'Appointment', 'Ask for earliest time, pet species, age, symptoms, and records.'),
        t('pet-check-in', 'Check in for a pet appointment', '宠物看诊登记', 'Appointment', 'Pet name, owner name, vaccine records, and reason for visit may be needed.'),
        t('pet-vaccine', 'Ask about pet vaccines', '询问宠物疫苗', 'Vaccine', 'Ask which vaccines are due and whether records are official.'),
        t('rabies-certificate', 'Request rabies certificate', '索取狂犬疫苗证明', 'Records', 'Ask for official vaccine certificate and tag if applicable.'),
        t('microchip-scan', 'Ask for microchip scan', '请求扫描芯片', 'Records', 'Ask whether the clinic can scan and record the microchip number.'),
        t('health-certificate-pet', 'Ask about pet health certificate', '询问宠物健康证明', 'Travel', 'Ask about appointment timing, required vaccines, and destination rules.'),
        t('pet-travel-docs', 'Ask about pet travel documents', '询问宠物旅行文件', 'Travel', 'Ask what documents are needed for airline or international travel.'),
        t('pet-sick-symptoms', 'Explain pet symptoms', '描述宠物症状', 'Care', 'Explain appetite, vomiting, diarrhea, coughing, energy level, and timing.'),
        t('urgent-vet-care', 'Ask about urgent vet care', '询问宠物急诊', 'Care', 'Ask whether the clinic can see the pet today or recommends ER.'),
        t('spay-neuter', 'Ask about spay or neuter', '询问绝育', 'Surgery', 'Ask about age, cost, preparation, and recovery.'),
        t('pet-medication-refill', 'Refill pet medication', '续宠物药', 'Medication', 'Ask whether exam is required before refill.'),
        t('vet-cost-estimate', 'Ask for cost estimate', '询问宠物医疗费用预估', 'Billing', 'Ask for exam fee, vaccine fee, lab fee, and payment options.'),
        t('pet-records', 'Request pet medical records', '索取宠物病历', 'Records', 'Ask whether records can be emailed or printed.'),
        t('pet-insurance-vet', 'Ask about pet insurance claim', '询问宠物保险理赔', 'Billing', 'Ask for invoice and medical notes needed for claim.')
      ]
    },
    {
      id: 'dentist',
      place: 'Dentist Office',
      placeCn: '牙科诊所',
      staffRole: 'Dental Receptionist',
      staffRoleCn: '牙科前台',
      greeting: 'Hi, are you here for a dental appointment?',
      greetingCn: '你好，你是来牙科看诊的吗？',
      arrivalLines: [
        'You call or visit a dentist office and need to explain a dental issue.',
        'You want to understand insurance, cleaning, pain, or treatment cost.',
        'You need to ask follow-up questions because dental terms can be confusing.'
      ],
      arrivalLinesCn: [
        '你打电话或来到牙科诊所，需要说明牙齿问题。',
        '你想了解保险、洗牙、牙痛或治疗费用。',
        '牙科术语有点难，你需要追问清楚。'
      ],
      tasks: [
        t('dentist-appointment', 'Make a dentist appointment', '预约牙医', 'Appointment', 'Ask for cleaning, exam, or specific problem appointment.'),
        t('dental-check-in', 'Check in for dental visit', '牙科看诊登记', 'Appointment', 'ID, dental insurance, forms, and medical history may be needed.'),
        t('teeth-cleaning', 'Schedule a teeth cleaning', '预约洗牙', 'Cleaning', 'Ask what is included and how long it takes.'),
        t('tooth-pain', 'Explain tooth pain', '描述牙痛', 'Care', 'Describe location, severity, sensitivity, swelling, and duration.'),
        t('dental-emergency', 'Ask for emergency dental care', '询问牙科急诊', 'Care', 'Ask whether same-day appointment is available.'),
        t('dental-insurance', 'Ask whether dental insurance is accepted', '询问是否接受牙科保险', 'Billing', 'Ask whether the dentist is in-network.'),
        t('dental-copay', 'Ask for dental cost estimate', '询问牙科费用预估', 'Billing', 'Ask what insurance covers and what you pay out of pocket.'),
        t('cavity-filling', 'Ask about a cavity filling', '询问补牙', 'Treatment', 'Ask about material, time, cost, and numbness.'),
        t('wisdom-teeth', 'Ask about wisdom teeth', '询问智齿', 'Treatment', 'Ask whether referral to oral surgeon is needed.'),
        t('xray-dentist', 'Ask about dental X-rays', '询问牙科 X 光', 'Treatment', 'Ask why X-rays are needed and whether records can be transferred.'),
        t('reschedule-dentist', 'Reschedule a dental appointment', '改牙科预约', 'Appointment', 'Ask about cancellation fee and available times.'),
        t('dental-records', 'Request dental records', '索取牙科记录', 'Records', 'Ask for X-rays and treatment records to be sent to another office.')
      ]
    },
    {
      id: 'insurance-office',
      place: 'Insurance Office',
      placeCn: '保险公司/保险经纪',
      staffRole: 'Insurance Agent',
      staffRoleCn: '保险工作人员',
      greeting: 'Hi, what type of insurance do you need help with?',
      greetingCn: '你好，你需要哪类保险帮助？',
      arrivalLines: [
        'You contact an insurance office and need to understand coverage or a bill.',
        'You want to avoid agreeing to something before understanding deductibles and exclusions.',
        'You need to ask about policy documents, claims, cancellation, or proof of insurance.'
      ],
      arrivalLinesCn: [
        '你联系保险公司或经纪，需要了解保障范围或账单。',
        '你想在弄清免赔额和除外责任前避免随便同意。',
        '你需要询问保单、理赔、取消或保险证明。'
      ],
      tasks: [
        t('renters-insurance', 'Buy renters insurance', '购买租客保险', 'Policy', 'Ask about coverage amount, liability, personal property, and proof for landlord.'),
        t('auto-insurance-quote', 'Ask for auto insurance quote', '询问车险报价', 'Policy', 'Ask about liability, comprehensive, collision, deductible, and discounts.'),
        t('health-insurance-question', 'Ask about health insurance coverage', '询问健康保险保障', 'Coverage', 'Ask whether a doctor, clinic, or medication is covered.'),
        t('policy-proof', 'Request proof of insurance', '索取保险证明', 'Documents', 'Ask for declaration page, insurance card, or certificate.'),
        t('deductible-question', 'Ask about deductible', '询问免赔额', 'Coverage', 'Ask how much you pay before insurance covers costs.'),
        t('premium-increase', 'Ask why premium increased', '询问保费为什么上涨', 'Billing', 'Ask what changed and whether discounts are available.'),
        t('billing-insurance', 'Ask about insurance bill', '询问保险账单', 'Billing', 'Ask due date, autopay, late fee, and payment options.'),
        t('cancel-policy', 'Cancel an insurance policy', '取消保险', 'Policy', 'Ask effective date, refund, and written confirmation.'),
        t('change-address-insurance', 'Change address on insurance policy', '更改保险地址', 'Policy', 'Ask whether premium or coverage changes.'),
        t('add-driver', 'Add a driver to auto policy', '车险添加驾驶员', 'Auto', 'Ask what information is needed and how price changes.'),
        t('file-claim', 'File an insurance claim', '提交保险理赔', 'Claim', 'Ask what happened, photos, receipts, and claim number.'),
        t('claim-status', 'Check claim status', '查询理赔状态', 'Claim', 'Ask what is pending and estimated timeline.'),
        t('roadside-assistance', 'Ask about roadside assistance', '询问道路救援', 'Auto', 'Ask towing, jump-start, lockout, and reimbursement rules.'),
        t('coverage-exclusion', 'Ask about exclusions', '询问不保事项', 'Coverage', 'Ask what is not covered before buying.'),
        t('compare-plans', 'Compare insurance plans', '比较保险方案', 'Policy', 'Ask about price, coverage, deductible, and limits.')
      ]
    }
  ];

  const globalComplications = [
    {
      id: 'missing-info',
      prompt: 'The staff member says one piece of information or one document is missing.',
      promptCn: '工作人员说缺少一项信息或一份材料。',
      line: 'I may need one more piece of information before I can continue. Do you have any additional document or confirmation?',
      lineCn: '我可能还需要一项信息才能继续。你有其他文件或确认信息吗？'
    },
    {
      id: 'misunderstanding',
      prompt: 'The staff member misunderstands your purpose.',
      promptCn: '工作人员误解了你的来意。',
      line: 'Just to confirm, are you trying to cancel this, or are you trying to update it?',
      lineCn: '我确认一下，你是想取消这个，还是想更新它？'
    },
    {
      id: 'long-wait',
      prompt: 'The wait time is longer than expected.',
      promptCn: '等待时间比预期更长。',
      line: 'We can help you today, but the wait may be longer than expected. Would you like to wait or schedule another time?',
      lineCn: '我们今天可以帮你处理，但等待时间可能比预期更长。你想等，还是改约其他时间？'
    },
    {
      id: 'payment-issue',
      prompt: 'A fee or payment question comes up.',
      promptCn: '出现费用或付款问题。',
      line: 'There may be a fee for this service. Would you like me to explain the charge before we continue?',
      lineCn: '这项服务可能会有费用。继续之前你需要我解释这笔费用吗？'
    },
    {
      id: 'system-issue',
      prompt: 'The system is slow or cannot find your record right away.',
      promptCn: '系统较慢，或暂时查不到你的记录。',
      line: 'The system is taking a moment to pull up your record. Can you confirm your name and one more detail?',
      lineCn: '系统需要一点时间调出你的记录。你可以确认你的姓名和另一项信息吗？'
    }
  ];

  function makeComplication(place, task, comp) {
    return {
      id: comp.id,
      afterTurns: comp.afterTurns || (Math.random() > 0.5 ? 1 : 2),
      prompt: comp.prompt,
      promptCn: comp.promptCn,
      node: {
        speaker: place.staffRole,
        en: comp.line,
        cn: comp.lineCn,
        choices: [
          {
            en: 'I understand. What would be the best next step?',
            cn: '我明白了。下一步最好怎么做？',
            next: 'ask_options',
            score: 2
          },
          {
            en: 'Could you tell me exactly what you need from me?',
            cn: '你可以明确告诉我需要我提供什么吗？',
            next: 'requirements',
            score: 2
          },
          {
            en: 'Sorry, I am a little confused. Could you say that more simply?',
            cn: '不好意思，我有点没听懂。你可以说简单一点吗？',
            next: 'simple_repeat',
            score: 1
          },
          {
            en: 'I do not have that with me today. Can I come back later?',
            cn: '我今天没有带那个。我可以之后再来吗？',
            next: 'partial',
            score: 1
          }
        ]
      }
    };
  }

  function makeContexts(place, task) {
    return {
      contexts: [
        `You are at the ${place.place} because you need to ${lowerFirst(task.title)}. You want to sound polite but direct.`,
        `You tried to solve this online first, but you still need to speak with someone in person.`,
        `You are not fully sure which words to use, so you need to ask clear follow-up questions.`,
        `You are short on time and need to understand the fastest way to finish this errand.`,
        `You are worried there may be a fee, a missing document, or a policy you do not understand.`
      ],
      contextsCn: [
        `你来到${place.placeCn}，因为你需要${task.titleCn}。你希望表达礼貌但直接。`,
        '你之前先试过网上处理，但仍然需要和工作人员当面沟通。',
        '你不完全确定应该怎么说，所以需要清楚地追问。',
        '你时间不多，需要弄清楚最快完成这件事的方法。',
        '你担心可能会有费用、缺材料，或有你不理解的规定。'
      ]
    };
  }

  function makeNodes(place, task) {
    return {
      start: {
        speaker: place.staffRole,
        en: place.greeting,
        cn: place.greetingCn,
        choices: [
          { en: task.phrase, cn: task.phraseCn, next: 'intake', score: 2 },
          { en: 'I am not sure how to explain it, but I need help with this.', cn: '我不太确定怎么解释，但我需要处理这件事。', next: 'intake', score: 1 },
          { en: 'Could you speak a little more slowly?', cn: '你可以说慢一点吗？', next: 'simple_repeat', score: 1 }
        ]
      },
      simple_repeat: {
        speaker: place.staffRole,
        en: `No problem. Tell me what you need, and I will let you know what we can do next.`,
        cn: '没问题。告诉我你需要什么，我会告诉你下一步能怎么处理。',
        choices: [
          { en: task.phrase, cn: task.phraseCn, next: 'intake', score: 2 },
          { en: 'Can I explain it step by step?', cn: '我可以一步一步解释吗？', next: 'intake', score: 2 }
        ]
      },
      intake: {
        speaker: place.staffRole,
        en: 'Got it. Can you tell me a little more about the situation?',
        cn: '明白了。你可以再具体说一下情况吗？',
        choices: [
          { en: `Sure. The main thing is that I need to ${lowerFirst(task.title)} today.`, cn: `可以。主要是我今天需要${task.titleCn}。`, next: 'details', score: 2 },
          { en: 'What information do you need from me first?', cn: '你首先需要我提供什么信息？', next: 'requirements', score: 2 },
          { en: 'Is this something I can finish today?', cn: '这件事今天可以办完吗？', next: 'timeline', score: 2 }
        ]
      },
      requirements: {
        speaker: place.staffRole,
        en: task.requirement,
        cn: '通常需要相关证件/信息。你也可以直接问工作人员具体需要什么。',
        choices: [
          { en: 'Thanks. I have some documents with me. Could you check if they are enough?', cn: '谢谢。我带了一些材料，你可以帮我看看是否够吗？', next: 'details', score: 2 },
          { en: 'Could you write down what I need to bring?', cn: '你可以写一下我需要带什么吗？', next: 'partial', score: 2 },
          { en: 'If I am missing something, can I come back later?', cn: '如果我缺了东西，可以之后再来吗？', next: 'ask_options', score: 1 }
        ]
      },
      details: {
        speaker: place.staffRole,
        en: 'Thanks. Let me check that for you. Do you have an ID or confirmation number related to this?',
        cn: '谢谢。我帮你查一下。你有和这件事相关的身份证件或确认号码吗？',
        choices: [
          { en: 'Yes. I have my ID and the confirmation information here.', cn: '有。我这里有身份证件和确认信息。', next: 'process', score: 2 },
          { en: 'I have my ID, but I do not have a confirmation number.', cn: '我有身份证件，但没有确认号码。', next: 'system_check', score: 1 },
          { en: 'What should I do if I do not have that information?', cn: '如果我没有那个信息，应该怎么办？', next: 'ask_options', score: 2 }
        ]
      },
      timeline: {
        speaker: place.staffRole,
        en: 'It depends on your documents and the current wait time. I can explain the steps first.',
        cn: '这取决于你的材料和当前等待时间。我可以先解释流程。',
        choices: [
          { en: 'Yes, please explain the steps.', cn: '好的，请解释一下流程。', next: 'requirements', score: 2 },
          { en: 'Is there a faster option online or at another location?', cn: '网上或其他地点有没有更快的方式？', next: 'ask_options', score: 2 }
        ]
      },
      system_check: {
        speaker: place.staffRole,
        en: 'I can try to look it up another way. Please confirm your name and one more identifying detail.',
        cn: '我可以尝试用其他方式查询。请确认你的姓名和另一项身份信息。',
        choices: [
          { en: 'Sure. My name is on the ID, and I can confirm my date of birth.', cn: '可以。我的姓名在证件上，我也可以确认出生日期。', next: 'process', score: 2 },
          { en: 'I prefer not to say that out loud. Is there a form I can fill out?', cn: '我不太想当面说出来。有表格可以填写吗？', next: 'ask_options', score: 2 }
        ]
      },
      process: {
        speaker: place.staffRole,
        en: 'That should work. I can continue processing this. There may be a short wait or a fee depending on the service.',
        cn: '这样应该可以。我可以继续处理。根据服务类型，可能需要等待或支付费用。',
        choices: [
          { en: 'That is fine. Please go ahead.', cn: '可以，请继续。', next: 'success', score: 2 },
          { en: 'Could you tell me the fee before we continue?', cn: '继续之前可以告诉我费用吗？', next: 'fee_explain', score: 2 },
          { en: 'Can I get a receipt or written confirmation?', cn: '我可以拿到收据或书面确认吗？', next: 'success', score: 2 }
        ]
      },
      fee_explain: {
        speaker: place.staffRole,
        en: 'Of course. I can explain the fee and payment options before you decide.',
        cn: '当然。我可以先解释费用和付款方式，你再决定。',
        choices: [
          { en: 'Thanks. I would like to continue.', cn: '谢谢。我想继续办理。', next: 'success', score: 2 },
          { en: 'I need to think about it. Can I come back later?', cn: '我需要考虑一下。可以之后再来吗？', next: 'partial', score: 1 }
        ]
      },
      ask_options: {
        speaker: place.staffRole,
        en: 'You have a few options. You can continue today if you have the required information, or come back with the missing item.',
        cn: '你有几个选择。如果你有需要的信息，今天可以继续；如果缺东西，可以之后再来。',
        choices: [
          { en: 'I want to continue today if possible.', cn: '如果可以的话，我想今天继续办理。', next: 'process', score: 2 },
          { en: 'Could you tell me exactly what to bring next time?', cn: '你可以明确告诉我下次要带什么吗？', next: 'partial', score: 2 },
          { en: 'Can I handle the rest online?', cn: '剩下的可以网上处理吗？', next: 'partial', score: 1 }
        ]
      },
      success: {
        speaker: 'System',
        en: `Success. You handled the conversation about: ${task.title}.`,
        cn: `成功。你完成了“${task.titleCn}”这次对话模拟。`,
        outcome: 'success'
      },
      partial: {
        speaker: 'System',
        en: `Partial success. You did not finish everything, but you clarified the next step for: ${task.title}.`,
        cn: `部分成功。你没有完全办完，但已经弄清楚“${task.titleCn}”的下一步。`,
        outcome: 'partial'
      }
    };
  }

  function buildPacks() {
    return placeDefinitions.map((place) => ({
      ...place,
      tasks: place.tasks.map((taskDef) => {
        const ctx = makeContexts(place, taskDef);
        const shuffledComps = globalComplications.map((comp) => makeComplication(place, taskDef, comp));
        return {
          ...taskDef,
          ...ctx,
          startNode: 'start',
          complications: shuffledComps,
          nodes: makeNodes(place, taskDef)
        };
      })
    }));
  }

  window.SCENARIO_PACKS = buildPacks();
})();
