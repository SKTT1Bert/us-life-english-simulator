// Market English data for Daily English Lab V7.
// Educational language practice only; not financial advice.
(function () {
  const vocabulary = [
  {
    "id": "market-share",
    "term": "share",
    "termCn": "股份",
    "definition": "A unit of ownership in a company.",
    "definitionCn": "公司所有权的一小部分。",
    "example": "The investor reviewed the term “share” before comparing two companies.",
    "exampleCn": "投资者在比较两家公司前复习了“股份”这个术语。",
    "category": "Stocks",
    "level": "B1",
    "tags": [
      "Stocks",
      "share",
      "股份"
    ]
  },
  {
    "id": "market-stock",
    "term": "stock",
    "termCn": "股票",
    "definition": "An investment representing ownership in a publicly traded company.",
    "definitionCn": "代表上市公司所有权的投资品种。",
    "example": "The investor reviewed the term “stock” before comparing two companies.",
    "exampleCn": "投资者在比较两家公司前复习了“股票”这个术语。",
    "category": "Stocks",
    "level": "B1",
    "tags": [
      "Stocks",
      "stock",
      "股票"
    ]
  },
  {
    "id": "market-ticker-symbol",
    "term": "ticker symbol",
    "termCn": "股票代码",
    "definition": "A short code used to identify a listed security.",
    "definitionCn": "用于识别上市证券的简短代码。",
    "example": "The investor reviewed the term “ticker symbol” before comparing two companies.",
    "exampleCn": "投资者在比较两家公司前复习了“股票代码”这个术语。",
    "category": "Stocks",
    "level": "B1",
    "tags": [
      "Stocks",
      "ticker symbol",
      "股票代码"
    ]
  },
  {
    "id": "market-market-capitalization",
    "term": "market capitalization",
    "termCn": "市值",
    "definition": "A company’s share price multiplied by its outstanding shares.",
    "definitionCn": "公司股价乘以流通在外股份总数。",
    "example": "The investor reviewed the term “market capitalization” before comparing two companies.",
    "exampleCn": "投资者在比较两家公司前复习了“市值”这个术语。",
    "category": "Stocks",
    "level": "B1",
    "tags": [
      "Stocks",
      "market capitalization",
      "市值"
    ]
  },
  {
    "id": "market-float",
    "term": "float",
    "termCn": "自由流通股",
    "definition": "Shares available for public trading, excluding closely held shares.",
    "definitionCn": "可由公众交易、但不包括紧密持有股份的股票数量。",
    "example": "The investor reviewed the term “float” before comparing two companies.",
    "exampleCn": "投资者在比较两家公司前复习了“自由流通股”这个术语。",
    "category": "Stocks",
    "level": "B1",
    "tags": [
      "Stocks",
      "float",
      "自由流通股"
    ]
  },
  {
    "id": "market-shares-outstanding",
    "term": "shares outstanding",
    "termCn": "流通在外股份",
    "definition": "The total number of company shares currently held by all shareholders.",
    "definitionCn": "当前由所有股东持有的公司股份总数。",
    "example": "The investor reviewed the term “shares outstanding” before comparing two companies.",
    "exampleCn": "投资者在比较两家公司前复习了“流通在外股份”这个术语。",
    "category": "Stocks",
    "level": "B1",
    "tags": [
      "Stocks",
      "shares outstanding",
      "流通在外股份"
    ]
  },
  {
    "id": "market-common-stock",
    "term": "common stock",
    "termCn": "普通股",
    "definition": "Equity that usually carries voting rights and variable dividends.",
    "definitionCn": "通常具有投票权且股息不固定的股权。",
    "example": "The investor reviewed the term “common stock” before comparing two companies.",
    "exampleCn": "投资者在比较两家公司前复习了“普通股”这个术语。",
    "category": "Stocks",
    "level": "B1",
    "tags": [
      "Stocks",
      "common stock",
      "普通股"
    ]
  },
  {
    "id": "market-preferred-stock",
    "term": "preferred stock",
    "termCn": "优先股",
    "definition": "Equity that generally has priority for dividends but limited voting rights.",
    "definitionCn": "通常在股息上有优先权、但投票权有限的股权。",
    "example": "The investor reviewed the term “preferred stock” before comparing two companies.",
    "exampleCn": "投资者在比较两家公司前复习了“优先股”这个术语。",
    "category": "Stocks",
    "level": "B1",
    "tags": [
      "Stocks",
      "preferred stock",
      "优先股"
    ]
  },
  {
    "id": "market-dividend",
    "term": "dividend",
    "termCn": "股息",
    "definition": "A payment a company makes to shareholders from profits or reserves.",
    "definitionCn": "公司从利润或储备中向股东支付的款项。",
    "example": "The investor reviewed the term “dividend” before comparing two companies.",
    "exampleCn": "投资者在比较两家公司前复习了“股息”这个术语。",
    "category": "Stocks",
    "level": "B1",
    "tags": [
      "Stocks",
      "dividend",
      "股息"
    ]
  },
  {
    "id": "market-dividend-yield",
    "term": "dividend yield",
    "termCn": "股息率",
    "definition": "Annual dividend per share divided by the current share price.",
    "definitionCn": "每股年度股息除以当前股价。",
    "example": "The investor reviewed the term “dividend yield” before comparing two companies.",
    "exampleCn": "投资者在比较两家公司前复习了“股息率”这个术语。",
    "category": "Stocks",
    "level": "B1",
    "tags": [
      "Stocks",
      "dividend yield",
      "股息率"
    ]
  },
  {
    "id": "market-stock-split",
    "term": "stock split",
    "termCn": "股票拆分",
    "definition": "An increase in share count that proportionally lowers the price per share.",
    "definitionCn": "按比例增加股数并降低每股价格的公司行动。",
    "example": "The investor reviewed the term “stock split” before comparing two companies.",
    "exampleCn": "投资者在比较两家公司前复习了“股票拆分”这个术语。",
    "category": "Stocks",
    "level": "B1",
    "tags": [
      "Stocks",
      "stock split",
      "股票拆分"
    ]
  },
  {
    "id": "market-reverse-stock-split",
    "term": "reverse stock split",
    "termCn": "反向拆股",
    "definition": "A reduction in share count that proportionally raises the price per share.",
    "definitionCn": "按比例减少股数并提高每股价格的公司行动。",
    "example": "The investor reviewed the term “reverse stock split” before comparing two companies.",
    "exampleCn": "投资者在比较两家公司前复习了“反向拆股”这个术语。",
    "category": "Stocks",
    "level": "B1",
    "tags": [
      "Stocks",
      "reverse stock split",
      "反向拆股"
    ]
  },
  {
    "id": "market-call-option",
    "term": "call option",
    "termCn": "看涨期权",
    "definition": "A contract giving the buyer the right to buy an asset at the strike price.",
    "definitionCn": "赋予买方按行权价买入标的资产权利的合约。",
    "example": "The trader checked the call option before choosing an option contract.",
    "exampleCn": "交易者在选择期权合约前查看了看涨期权。",
    "category": "Options Basics",
    "level": "B2",
    "tags": [
      "Options Basics",
      "call option",
      "看涨期权"
    ]
  },
  {
    "id": "market-put-option",
    "term": "put option",
    "termCn": "看跌期权",
    "definition": "A contract giving the buyer the right to sell an asset at the strike price.",
    "definitionCn": "赋予买方按行权价卖出标的资产权利的合约。",
    "example": "The trader checked the put option before choosing an option contract.",
    "exampleCn": "交易者在选择期权合约前查看了看跌期权。",
    "category": "Options Basics",
    "level": "B2",
    "tags": [
      "Options Basics",
      "put option",
      "看跌期权"
    ]
  },
  {
    "id": "market-strike-price",
    "term": "strike price",
    "termCn": "行权价",
    "definition": "The price at which an option can be exercised.",
    "definitionCn": "期权可以被行权的价格。",
    "example": "The trader checked the strike price before choosing an option contract.",
    "exampleCn": "交易者在选择期权合约前查看了行权价。",
    "category": "Options Basics",
    "level": "B2",
    "tags": [
      "Options Basics",
      "strike price",
      "行权价"
    ]
  },
  {
    "id": "market-expiration-date",
    "term": "expiration date",
    "termCn": "到期日",
    "definition": "The final date on which an option contract remains valid.",
    "definitionCn": "期权合约保持有效的最后日期。",
    "example": "The trader checked the expiration date before choosing an option contract.",
    "exampleCn": "交易者在选择期权合约前查看了到期日。",
    "category": "Options Basics",
    "level": "B2",
    "tags": [
      "Options Basics",
      "expiration date",
      "到期日"
    ]
  },
  {
    "id": "market-premium",
    "term": "premium",
    "termCn": "权利金",
    "definition": "The market price paid or received for an option contract.",
    "definitionCn": "买入或卖出期权合约时支付或收到的市场价格。",
    "example": "The trader checked the premium before choosing an option contract.",
    "exampleCn": "交易者在选择期权合约前查看了权利金。",
    "category": "Options Basics",
    "level": "B2",
    "tags": [
      "Options Basics",
      "premium",
      "权利金"
    ]
  },
  {
    "id": "market-option-contract",
    "term": "option contract",
    "termCn": "期权合约",
    "definition": "A standardized agreement covering a set number of underlying shares.",
    "definitionCn": "覆盖固定数量标的股份的标准化协议。",
    "example": "The trader checked the option contract before choosing an option contract.",
    "exampleCn": "交易者在选择期权合约前查看了期权合约。",
    "category": "Options Basics",
    "level": "B2",
    "tags": [
      "Options Basics",
      "option contract",
      "期权合约"
    ]
  },
  {
    "id": "market-contract-multiplier",
    "term": "contract multiplier",
    "termCn": "合约乘数",
    "definition": "The amount by which an option quote is multiplied, commonly 100 for U.S. equity options.",
    "definitionCn": "期权报价需要乘以的数量，美股个股期权通常为100。",
    "example": "The trader checked the contract multiplier before choosing an option contract.",
    "exampleCn": "交易者在选择期权合约前查看了合约乘数。",
    "category": "Options Basics",
    "level": "B2",
    "tags": [
      "Options Basics",
      "contract multiplier",
      "合约乘数"
    ]
  },
  {
    "id": "market-intrinsic-value",
    "term": "intrinsic value",
    "termCn": "内在价值",
    "definition": "The amount an option is in the money, excluding time value.",
    "definitionCn": "期权实值部分的金额，不包括时间价值。",
    "example": "The trader checked the intrinsic value before choosing an option contract.",
    "exampleCn": "交易者在选择期权合约前查看了内在价值。",
    "category": "Options Basics",
    "level": "B2",
    "tags": [
      "Options Basics",
      "intrinsic value",
      "内在价值"
    ]
  },
  {
    "id": "market-extrinsic-value",
    "term": "extrinsic value",
    "termCn": "外在价值",
    "definition": "The portion of an option premium beyond intrinsic value.",
    "definitionCn": "期权权利金中超过内在价值的部分。",
    "example": "The trader checked the extrinsic value before choosing an option contract.",
    "exampleCn": "交易者在选择期权合约前查看了外在价值。",
    "category": "Options Basics",
    "level": "B2",
    "tags": [
      "Options Basics",
      "extrinsic value",
      "外在价值"
    ]
  },
  {
    "id": "market-in-the-money",
    "term": "in the money",
    "termCn": "实值",
    "definition": "An option with positive intrinsic value.",
    "definitionCn": "具有正内在价值的期权。",
    "example": "The trader checked the in the money before choosing an option contract.",
    "exampleCn": "交易者在选择期权合约前查看了实值。",
    "category": "Options Basics",
    "level": "B2",
    "tags": [
      "Options Basics",
      "in the money",
      "实值"
    ]
  },
  {
    "id": "market-at-the-money",
    "term": "at the money",
    "termCn": "平值",
    "definition": "An option whose strike is near the current underlying price.",
    "definitionCn": "行权价接近标的当前价格的期权。",
    "example": "The trader checked the at the money before choosing an option contract.",
    "exampleCn": "交易者在选择期权合约前查看了平值。",
    "category": "Options Basics",
    "level": "B2",
    "tags": [
      "Options Basics",
      "at the money",
      "平值"
    ]
  },
  {
    "id": "market-out-of-the-money",
    "term": "out of the money",
    "termCn": "虚值",
    "definition": "An option with no intrinsic value at the current underlying price.",
    "definitionCn": "按当前标的价格没有内在价值的期权。",
    "example": "The trader checked the out of the money before choosing an option contract.",
    "exampleCn": "交易者在选择期权合约前查看了虚值。",
    "category": "Options Basics",
    "level": "B2",
    "tags": [
      "Options Basics",
      "out of the money",
      "虚值"
    ]
  },
  {
    "id": "market-delta",
    "term": "delta",
    "termCn": "Delta/德尔塔",
    "definition": "An estimate of how much an option price changes when the underlying moves by one unit.",
    "definitionCn": "标的价格变动一个单位时，期权价格预计变化多少。",
    "example": "The options discussion focused on delta and how it could affect the premium.",
    "exampleCn": "期权讨论重点关注Delta/德尔塔以及它可能如何影响权利金。",
    "category": "Greeks & Volatility",
    "level": "B2",
    "tags": [
      "Greeks & Volatility",
      "delta",
      "Delta/德尔塔"
    ]
  },
  {
    "id": "market-gamma",
    "term": "gamma",
    "termCn": "Gamma/伽马",
    "definition": "The rate at which delta changes as the underlying price moves.",
    "definitionCn": "标的价格变化时 Delta 的变化速度。",
    "example": "The options discussion focused on gamma and how it could affect the premium.",
    "exampleCn": "期权讨论重点关注Gamma/伽马以及它可能如何影响权利金。",
    "category": "Greeks & Volatility",
    "level": "B2",
    "tags": [
      "Greeks & Volatility",
      "gamma",
      "Gamma/伽马"
    ]
  },
  {
    "id": "market-theta",
    "term": "theta",
    "termCn": "Theta/时间损耗",
    "definition": "An estimate of the option value lost as time passes, all else equal.",
    "definitionCn": "其他条件不变时，期权随时间流逝损失的价值估计。",
    "example": "The options discussion focused on theta and how it could affect the premium.",
    "exampleCn": "期权讨论重点关注Theta/时间损耗以及它可能如何影响权利金。",
    "category": "Greeks & Volatility",
    "level": "B2",
    "tags": [
      "Greeks & Volatility",
      "theta",
      "Theta/时间损耗"
    ]
  },
  {
    "id": "market-vega",
    "term": "vega",
    "termCn": "Vega/波动率敏感度",
    "definition": "An estimate of how option value changes when implied volatility changes.",
    "definitionCn": "隐含波动率变化时，期权价值变化的估计。",
    "example": "The options discussion focused on vega and how it could affect the premium.",
    "exampleCn": "期权讨论重点关注Vega/波动率敏感度以及它可能如何影响权利金。",
    "category": "Greeks & Volatility",
    "level": "B2",
    "tags": [
      "Greeks & Volatility",
      "vega",
      "Vega/波动率敏感度"
    ]
  },
  {
    "id": "market-rho",
    "term": "rho",
    "termCn": "Rho/利率敏感度",
    "definition": "An estimate of how option value changes with interest rates.",
    "definitionCn": "利率变化时，期权价值变化的估计。",
    "example": "The options discussion focused on rho and how it could affect the premium.",
    "exampleCn": "期权讨论重点关注Rho/利率敏感度以及它可能如何影响权利金。",
    "category": "Greeks & Volatility",
    "level": "B2",
    "tags": [
      "Greeks & Volatility",
      "rho",
      "Rho/利率敏感度"
    ]
  },
  {
    "id": "market-implied-volatility",
    "term": "implied volatility",
    "termCn": "隐含波动率",
    "definition": "The market’s forward-looking volatility assumption embedded in option prices.",
    "definitionCn": "期权价格中隐含的市场对未来波动率的假设。",
    "example": "The options discussion focused on implied volatility and how it could affect the premium.",
    "exampleCn": "期权讨论重点关注隐含波动率以及它可能如何影响权利金。",
    "category": "Greeks & Volatility",
    "level": "B2",
    "tags": [
      "Greeks & Volatility",
      "implied volatility",
      "隐含波动率"
    ]
  },
  {
    "id": "market-historical-volatility",
    "term": "historical volatility",
    "termCn": "历史波动率",
    "definition": "Volatility calculated from past price movements.",
    "definitionCn": "根据过去价格变动计算的波动率。",
    "example": "The options discussion focused on historical volatility and how it could affect the premium.",
    "exampleCn": "期权讨论重点关注历史波动率以及它可能如何影响权利金。",
    "category": "Greeks & Volatility",
    "level": "B2",
    "tags": [
      "Greeks & Volatility",
      "historical volatility",
      "历史波动率"
    ]
  },
  {
    "id": "market-iv-rank",
    "term": "IV rank",
    "termCn": "IV 排名",
    "definition": "A measure comparing current implied volatility with its range over a chosen period.",
    "definitionCn": "将当前隐含波动率与某段时间内区间比较的指标。",
    "example": "The options discussion focused on IV rank and how it could affect the premium.",
    "exampleCn": "期权讨论重点关注IV 排名以及它可能如何影响权利金。",
    "category": "Greeks & Volatility",
    "level": "B2",
    "tags": [
      "Greeks & Volatility",
      "IV rank",
      "IV 排名"
    ]
  },
  {
    "id": "market-iv-percentile",
    "term": "IV percentile",
    "termCn": "IV 百分位",
    "definition": "The percentage of days in a period when implied volatility was below its current level.",
    "definitionCn": "某段时间内隐含波动率低于当前水平的天数占比。",
    "example": "The options discussion focused on IV percentile and how it could affect the premium.",
    "exampleCn": "期权讨论重点关注IV 百分位以及它可能如何影响权利金。",
    "category": "Greeks & Volatility",
    "level": "B2",
    "tags": [
      "Greeks & Volatility",
      "IV percentile",
      "IV 百分位"
    ]
  },
  {
    "id": "market-volatility-skew",
    "term": "volatility skew",
    "termCn": "波动率偏斜",
    "definition": "Differences in implied volatility across strike prices.",
    "definitionCn": "不同行权价之间隐含波动率的差异。",
    "example": "The options discussion focused on volatility skew and how it could affect the premium.",
    "exampleCn": "期权讨论重点关注波动率偏斜以及它可能如何影响权利金。",
    "category": "Greeks & Volatility",
    "level": "B2",
    "tags": [
      "Greeks & Volatility",
      "volatility skew",
      "波动率偏斜"
    ]
  },
  {
    "id": "market-term-structure",
    "term": "term structure",
    "termCn": "期限结构",
    "definition": "The pattern of implied volatility across different expiration dates.",
    "definitionCn": "不同到期日之间隐含波动率的分布形态。",
    "example": "The options discussion focused on term structure and how it could affect the premium.",
    "exampleCn": "期权讨论重点关注期限结构以及它可能如何影响权利金。",
    "category": "Greeks & Volatility",
    "level": "B2",
    "tags": [
      "Greeks & Volatility",
      "term structure",
      "期限结构"
    ]
  },
  {
    "id": "market-iv-crush",
    "term": "IV crush",
    "termCn": "隐含波动率骤降",
    "definition": "A sharp decline in implied volatility, often after a known event.",
    "definitionCn": "通常在已知事件后发生的隐含波动率快速下降。",
    "example": "The options discussion focused on IV crush and how it could affect the premium.",
    "exampleCn": "期权讨论重点关注隐含波动率骤降以及它可能如何影响权利金。",
    "category": "Greeks & Volatility",
    "level": "B2",
    "tags": [
      "Greeks & Volatility",
      "IV crush",
      "隐含波动率骤降"
    ]
  },
  {
    "id": "market-market-order",
    "term": "market order",
    "termCn": "市价单",
    "definition": "An order intended to execute immediately at the best available price.",
    "definitionCn": "以当前可获得的最佳价格尽快成交的订单。",
    "example": "I used the order ticket to review the market order before submitting the trade.",
    "exampleCn": "我在提交交易前通过订单页面检查了市价单。",
    "category": "Orders & Execution",
    "level": "B2",
    "tags": [
      "Orders & Execution",
      "market order",
      "市价单"
    ]
  },
  {
    "id": "market-limit-order",
    "term": "limit order",
    "termCn": "限价单",
    "definition": "An order that executes only at a specified price or better.",
    "definitionCn": "只在指定价格或更优价格成交的订单。",
    "example": "I used the order ticket to review the limit order before submitting the trade.",
    "exampleCn": "我在提交交易前通过订单页面检查了限价单。",
    "category": "Orders & Execution",
    "level": "B2",
    "tags": [
      "Orders & Execution",
      "limit order",
      "限价单"
    ]
  },
  {
    "id": "market-stop-order",
    "term": "stop order",
    "termCn": "止损触发单",
    "definition": "An order that becomes a market order after a trigger price is reached.",
    "definitionCn": "达到触发价格后转为市价单的订单。",
    "example": "I used the order ticket to review the stop order before submitting the trade.",
    "exampleCn": "我在提交交易前通过订单页面检查了止损触发单。",
    "category": "Orders & Execution",
    "level": "B2",
    "tags": [
      "Orders & Execution",
      "stop order",
      "止损触发单"
    ]
  },
  {
    "id": "market-stop-limit-order",
    "term": "stop-limit order",
    "termCn": "止损限价单",
    "definition": "An order that becomes a limit order after the stop price is reached.",
    "definitionCn": "达到止损触发价后转为限价单的订单。",
    "example": "I used the order ticket to review the stop-limit order before submitting the trade.",
    "exampleCn": "我在提交交易前通过订单页面检查了止损限价单。",
    "category": "Orders & Execution",
    "level": "B2",
    "tags": [
      "Orders & Execution",
      "stop-limit order",
      "止损限价单"
    ]
  },
  {
    "id": "market-trailing-stop",
    "term": "trailing stop",
    "termCn": "移动止损",
    "definition": "A stop level that moves with favorable price changes by a set amount or percentage.",
    "definitionCn": "按固定金额或百分比随有利价格移动的止损价位。",
    "example": "I used the order ticket to review the trailing stop before submitting the trade.",
    "exampleCn": "我在提交交易前通过订单页面检查了移动止损。",
    "category": "Orders & Execution",
    "level": "B2",
    "tags": [
      "Orders & Execution",
      "trailing stop",
      "移动止损"
    ]
  },
  {
    "id": "market-bid",
    "term": "bid",
    "termCn": "买价",
    "definition": "The highest displayed price a buyer is willing to pay.",
    "definitionCn": "买方愿意支付的最高显示价格。",
    "example": "I used the order ticket to review the bid before submitting the trade.",
    "exampleCn": "我在提交交易前通过订单页面检查了买价。",
    "category": "Orders & Execution",
    "level": "B2",
    "tags": [
      "Orders & Execution",
      "bid",
      "买价"
    ]
  },
  {
    "id": "market-ask",
    "term": "ask",
    "termCn": "卖价",
    "definition": "The lowest displayed price a seller is willing to accept.",
    "definitionCn": "卖方愿意接受的最低显示价格。",
    "example": "I used the order ticket to review the ask before submitting the trade.",
    "exampleCn": "我在提交交易前通过订单页面检查了卖价。",
    "category": "Orders & Execution",
    "level": "B2",
    "tags": [
      "Orders & Execution",
      "ask",
      "卖价"
    ]
  },
  {
    "id": "market-bid-ask-spread",
    "term": "bid-ask spread",
    "termCn": "买卖价差",
    "definition": "The difference between the best bid and best ask.",
    "definitionCn": "最佳买价与最佳卖价之间的差额。",
    "example": "I used the order ticket to review the bid-ask spread before submitting the trade.",
    "exampleCn": "我在提交交易前通过订单页面检查了买卖价差。",
    "category": "Orders & Execution",
    "level": "B2",
    "tags": [
      "Orders & Execution",
      "bid-ask spread",
      "买卖价差"
    ]
  },
  {
    "id": "market-fill",
    "term": "fill",
    "termCn": "成交",
    "definition": "The execution of all or part of an order.",
    "definitionCn": "订单全部或部分被执行。",
    "example": "I used the order ticket to review the fill before submitting the trade.",
    "exampleCn": "我在提交交易前通过订单页面检查了成交。",
    "category": "Orders & Execution",
    "level": "B2",
    "tags": [
      "Orders & Execution",
      "fill",
      "成交"
    ]
  },
  {
    "id": "market-partial-fill",
    "term": "partial fill",
    "termCn": "部分成交",
    "definition": "An execution in which only part of the requested quantity trades.",
    "definitionCn": "订单只有部分数量成交。",
    "example": "I used the order ticket to review the partial fill before submitting the trade.",
    "exampleCn": "我在提交交易前通过订单页面检查了部分成交。",
    "category": "Orders & Execution",
    "level": "B2",
    "tags": [
      "Orders & Execution",
      "partial fill",
      "部分成交"
    ]
  },
  {
    "id": "market-slippage",
    "term": "slippage",
    "termCn": "滑点",
    "definition": "The difference between the expected execution price and the actual price.",
    "definitionCn": "预期成交价格与实际成交价格之间的差异。",
    "example": "I used the order ticket to review the slippage before submitting the trade.",
    "exampleCn": "我在提交交易前通过订单页面检查了滑点。",
    "category": "Orders & Execution",
    "level": "B2",
    "tags": [
      "Orders & Execution",
      "slippage",
      "滑点"
    ]
  },
  {
    "id": "market-time-in-force",
    "term": "time in force",
    "termCn": "订单有效期",
    "definition": "Instructions defining how long an order remains active.",
    "definitionCn": "规定订单保持有效多长时间的指令。",
    "example": "I used the order ticket to review the time in force before submitting the trade.",
    "exampleCn": "我在提交交易前通过订单页面检查了订单有效期。",
    "category": "Orders & Execution",
    "level": "B2",
    "tags": [
      "Orders & Execution",
      "time in force",
      "订单有效期"
    ]
  },
  {
    "id": "market-volume",
    "term": "volume",
    "termCn": "成交量",
    "definition": "The number of shares or contracts traded during a period.",
    "definitionCn": "某段时间内交易的股份或合约数量。",
    "example": "The trading platform displays volume alongside the current quote.",
    "exampleCn": "交易平台会在当前报价旁显示成交量。",
    "category": "Market Data",
    "level": "B1",
    "tags": [
      "Market Data",
      "volume",
      "成交量"
    ]
  },
  {
    "id": "market-average-volume",
    "term": "average volume",
    "termCn": "平均成交量",
    "definition": "The average number of shares or contracts traded over a chosen period.",
    "definitionCn": "某个选定时期内平均交易的股份或合约数量。",
    "example": "The trading platform displays average volume alongside the current quote.",
    "exampleCn": "交易平台会在当前报价旁显示平均成交量。",
    "category": "Market Data",
    "level": "B1",
    "tags": [
      "Market Data",
      "average volume",
      "平均成交量"
    ]
  },
  {
    "id": "market-open-interest",
    "term": "open interest",
    "termCn": "未平仓量",
    "definition": "The number of outstanding option or futures contracts that remain open.",
    "definitionCn": "仍未平仓的期权或期货合约数量。",
    "example": "The trading platform displays open interest alongside the current quote.",
    "exampleCn": "交易平台会在当前报价旁显示未平仓量。",
    "category": "Market Data",
    "level": "B1",
    "tags": [
      "Market Data",
      "open interest",
      "未平仓量"
    ]
  },
  {
    "id": "market-level-1-data",
    "term": "Level 1 data",
    "termCn": "一级行情",
    "definition": "Basic market quotes such as the best bid, ask, and last price.",
    "definitionCn": "包括最佳买价、卖价和最新价等基础行情。",
    "example": "The trading platform displays Level 1 data alongside the current quote.",
    "exampleCn": "交易平台会在当前报价旁显示一级行情。",
    "category": "Market Data",
    "level": "B1",
    "tags": [
      "Market Data",
      "Level 1 data",
      "一级行情"
    ]
  },
  {
    "id": "market-level-2-data",
    "term": "Level 2 data",
    "termCn": "二级行情",
    "definition": "A deeper view of bids and asks at multiple price levels.",
    "definitionCn": "显示多个价格档位买卖挂单的更深层行情。",
    "example": "The trading platform displays Level 2 data alongside the current quote.",
    "exampleCn": "交易平台会在当前报价旁显示二级行情。",
    "category": "Market Data",
    "level": "B1",
    "tags": [
      "Market Data",
      "Level 2 data",
      "二级行情"
    ]
  },
  {
    "id": "market-order-book",
    "term": "order book",
    "termCn": "订单簿",
    "definition": "A list of resting buy and sell orders organized by price.",
    "definitionCn": "按价格排列的买入和卖出挂单列表。",
    "example": "The trading platform displays order book alongside the current quote.",
    "exampleCn": "交易平台会在当前报价旁显示订单簿。",
    "category": "Market Data",
    "level": "B1",
    "tags": [
      "Market Data",
      "order book",
      "订单簿"
    ]
  },
  {
    "id": "market-last-price",
    "term": "last price",
    "termCn": "最新成交价",
    "definition": "The price of the most recent completed trade.",
    "definitionCn": "最近一笔已完成交易的价格。",
    "example": "The trading platform displays last price alongside the current quote.",
    "exampleCn": "交易平台会在当前报价旁显示最新成交价。",
    "category": "Market Data",
    "level": "B1",
    "tags": [
      "Market Data",
      "last price",
      "最新成交价"
    ]
  },
  {
    "id": "market-mark-price",
    "term": "mark price",
    "termCn": "标记价格",
    "definition": "An estimated fair price, often derived from bid and ask values.",
    "definitionCn": "通常根据买卖报价推算的估计公允价格。",
    "example": "The trading platform displays mark price alongside the current quote.",
    "exampleCn": "交易平台会在当前报价旁显示标记价格。",
    "category": "Market Data",
    "level": "B1",
    "tags": [
      "Market Data",
      "mark price",
      "标记价格"
    ]
  },
  {
    "id": "market-vwap",
    "term": "VWAP",
    "termCn": "成交量加权平均价",
    "definition": "The average traded price weighted by volume during a period.",
    "definitionCn": "按成交量加权计算的某段时间平均成交价格。",
    "example": "The trading platform displays VWAP alongside the current quote.",
    "exampleCn": "交易平台会在当前报价旁显示成交量加权平均价。",
    "category": "Market Data",
    "level": "B1",
    "tags": [
      "Market Data",
      "VWAP",
      "成交量加权平均价"
    ]
  },
  {
    "id": "market-premarket",
    "term": "premarket",
    "termCn": "盘前交易",
    "definition": "Trading activity before the regular market session opens.",
    "definitionCn": "常规交易时段开盘前的交易活动。",
    "example": "The trading platform displays premarket alongside the current quote.",
    "exampleCn": "交易平台会在当前报价旁显示盘前交易。",
    "category": "Market Data",
    "level": "B1",
    "tags": [
      "Market Data",
      "premarket",
      "盘前交易"
    ]
  },
  {
    "id": "market-after-hours",
    "term": "after-hours",
    "termCn": "盘后交易",
    "definition": "Trading activity after the regular market session closes.",
    "definitionCn": "常规交易时段收盘后的交易活动。",
    "example": "The trading platform displays after-hours alongside the current quote.",
    "exampleCn": "交易平台会在当前报价旁显示盘后交易。",
    "category": "Market Data",
    "level": "B1",
    "tags": [
      "Market Data",
      "after-hours",
      "盘后交易"
    ]
  },
  {
    "id": "market-circuit-breaker",
    "term": "circuit breaker",
    "termCn": "熔断机制",
    "definition": "A rule that temporarily pauses trading after extreme price moves.",
    "definitionCn": "在价格剧烈变动后暂时停止交易的规则。",
    "example": "The trading platform displays circuit breaker alongside the current quote.",
    "exampleCn": "交易平台会在当前报价旁显示熔断机制。",
    "category": "Market Data",
    "level": "B1",
    "tags": [
      "Market Data",
      "circuit breaker",
      "熔断机制"
    ]
  },
  {
    "id": "market-position-size",
    "term": "position size",
    "termCn": "仓位大小",
    "definition": "The amount of capital or number of units allocated to a trade.",
    "definitionCn": "分配给一笔交易的资金或单位数量。",
    "example": "The risk plan sets a clear rule for position size.",
    "exampleCn": "风险计划为仓位大小设定了明确规则。",
    "category": "Risk Management",
    "level": "B2",
    "tags": [
      "Risk Management",
      "position size",
      "仓位大小"
    ]
  },
  {
    "id": "market-risk-reward-ratio",
    "term": "risk-reward ratio",
    "termCn": "风险回报比",
    "definition": "A comparison between potential loss and potential gain.",
    "definitionCn": "潜在亏损与潜在收益之间的比较。",
    "example": "The risk plan sets a clear rule for risk-reward ratio.",
    "exampleCn": "风险计划为风险回报比设定了明确规则。",
    "category": "Risk Management",
    "level": "B2",
    "tags": [
      "Risk Management",
      "risk-reward ratio",
      "风险回报比"
    ]
  },
  {
    "id": "market-stop-loss",
    "term": "stop loss",
    "termCn": "止损",
    "definition": "A predefined exit level intended to limit a loss.",
    "definitionCn": "为了限制亏损而预先设定的退出价位。",
    "example": "The risk plan sets a clear rule for stop loss.",
    "exampleCn": "风险计划为止损设定了明确规则。",
    "category": "Risk Management",
    "level": "B2",
    "tags": [
      "Risk Management",
      "stop loss",
      "止损"
    ]
  },
  {
    "id": "market-take-profit",
    "term": "take profit",
    "termCn": "止盈",
    "definition": "A predefined exit level intended to lock in a gain.",
    "definitionCn": "为了锁定收益而预先设定的退出价位。",
    "example": "The risk plan sets a clear rule for take profit.",
    "exampleCn": "风险计划为止盈设定了明确规则。",
    "category": "Risk Management",
    "level": "B2",
    "tags": [
      "Risk Management",
      "take profit",
      "止盈"
    ]
  },
  {
    "id": "market-maximum-drawdown",
    "term": "maximum drawdown",
    "termCn": "最大回撤",
    "definition": "The largest peak-to-trough decline over a measured period.",
    "definitionCn": "某段测量期间从峰值到谷值的最大跌幅。",
    "example": "The risk plan sets a clear rule for maximum drawdown.",
    "exampleCn": "风险计划为最大回撤设定了明确规则。",
    "category": "Risk Management",
    "level": "B2",
    "tags": [
      "Risk Management",
      "maximum drawdown",
      "最大回撤"
    ]
  },
  {
    "id": "market-diversification",
    "term": "diversification",
    "termCn": "分散投资",
    "definition": "Spreading exposure across assets to reduce concentration risk.",
    "definitionCn": "将风险敞口分散到多种资产以降低集中风险。",
    "example": "The risk plan sets a clear rule for diversification.",
    "exampleCn": "风险计划为分散投资设定了明确规则。",
    "category": "Risk Management",
    "level": "B2",
    "tags": [
      "Risk Management",
      "diversification",
      "分散投资"
    ]
  },
  {
    "id": "market-concentration-risk",
    "term": "concentration risk",
    "termCn": "集中度风险",
    "definition": "Risk caused by having too much exposure to one asset or theme.",
    "definitionCn": "对单一资产或主题暴露过多造成的风险。",
    "example": "The risk plan sets a clear rule for concentration risk.",
    "exampleCn": "风险计划为集中度风险设定了明确规则。",
    "category": "Risk Management",
    "level": "B2",
    "tags": [
      "Risk Management",
      "concentration risk",
      "集中度风险"
    ]
  },
  {
    "id": "market-leverage",
    "term": "leverage",
    "termCn": "杠杆",
    "definition": "Using borrowed capital or derivatives to amplify exposure.",
    "definitionCn": "使用借入资金或衍生品放大风险敞口。",
    "example": "The risk plan sets a clear rule for leverage.",
    "exampleCn": "风险计划为杠杆设定了明确规则。",
    "category": "Risk Management",
    "level": "B2",
    "tags": [
      "Risk Management",
      "leverage",
      "杠杆"
    ]
  },
  {
    "id": "market-margin",
    "term": "margin",
    "termCn": "保证金",
    "definition": "Funds or collateral required to support leveraged positions.",
    "definitionCn": "支持杠杆头寸所需的资金或抵押品。",
    "example": "The risk plan sets a clear rule for margin.",
    "exampleCn": "风险计划为保证金设定了明确规则。",
    "category": "Risk Management",
    "level": "B2",
    "tags": [
      "Risk Management",
      "margin",
      "保证金"
    ]
  },
  {
    "id": "market-margin-call",
    "term": "margin call",
    "termCn": "追加保证金通知",
    "definition": "A demand to add funds or reduce positions because account equity is insufficient.",
    "definitionCn": "因账户净值不足而要求补充资金或减少头寸的通知。",
    "example": "The risk plan sets a clear rule for margin call.",
    "exampleCn": "风险计划为追加保证金通知设定了明确规则。",
    "category": "Risk Management",
    "level": "B2",
    "tags": [
      "Risk Management",
      "margin call",
      "追加保证金通知"
    ]
  },
  {
    "id": "market-buying-power",
    "term": "buying power",
    "termCn": "购买力",
    "definition": "The amount an account is currently permitted to use for new positions.",
    "definitionCn": "账户当前被允许用于建立新头寸的金额。",
    "example": "The risk plan sets a clear rule for buying power.",
    "exampleCn": "风险计划为购买力设定了明确规则。",
    "category": "Risk Management",
    "level": "B2",
    "tags": [
      "Risk Management",
      "buying power",
      "购买力"
    ]
  },
  {
    "id": "market-liquidity-risk",
    "term": "liquidity risk",
    "termCn": "流动性风险",
    "definition": "The risk that a position cannot be entered or exited efficiently.",
    "definitionCn": "无法高效建立或退出头寸的风险。",
    "example": "The risk plan sets a clear rule for liquidity risk.",
    "exampleCn": "风险计划为流动性风险设定了明确规则。",
    "category": "Risk Management",
    "level": "B2",
    "tags": [
      "Risk Management",
      "liquidity risk",
      "流动性风险"
    ]
  },
  {
    "id": "market-earnings-per-share",
    "term": "earnings per share",
    "termCn": "每股收益",
    "definition": "Net income allocated to each common share, commonly abbreviated EPS.",
    "definitionCn": "分配到每股普通股的净利润，通常缩写为 EPS。",
    "example": "The analyst discussed earnings per share during the earnings review.",
    "exampleCn": "分析师在财报复盘中讨论了每股收益。",
    "category": "Earnings",
    "level": "B2",
    "tags": [
      "Earnings",
      "earnings per share",
      "每股收益"
    ]
  },
  {
    "id": "market-revenue",
    "term": "revenue",
    "termCn": "营收",
    "definition": "The total amount a company earns from its business activities before expenses.",
    "definitionCn": "公司在扣除费用前通过经营活动获得的总收入。",
    "example": "The analyst discussed revenue during the earnings review.",
    "exampleCn": "分析师在财报复盘中讨论了营收。",
    "category": "Earnings",
    "level": "B2",
    "tags": [
      "Earnings",
      "revenue",
      "营收"
    ]
  },
  {
    "id": "market-guidance",
    "term": "guidance",
    "termCn": "业绩指引",
    "definition": "Management’s forecast or expectations for future performance.",
    "definitionCn": "管理层对未来业绩的预测或预期。",
    "example": "The analyst discussed guidance during the earnings review.",
    "exampleCn": "分析师在财报复盘中讨论了业绩指引。",
    "category": "Earnings",
    "level": "B2",
    "tags": [
      "Earnings",
      "guidance",
      "业绩指引"
    ]
  },
  {
    "id": "market-earnings-beat",
    "term": "earnings beat",
    "termCn": "财报超预期",
    "definition": "Results that exceed the market consensus estimate.",
    "definitionCn": "业绩结果高于市场一致预期。",
    "example": "The analyst discussed earnings beat during the earnings review.",
    "exampleCn": "分析师在财报复盘中讨论了财报超预期。",
    "category": "Earnings",
    "level": "B2",
    "tags": [
      "Earnings",
      "earnings beat",
      "财报超预期"
    ]
  },
  {
    "id": "market-earnings-miss",
    "term": "earnings miss",
    "termCn": "财报不及预期",
    "definition": "Results that fall below the market consensus estimate.",
    "definitionCn": "业绩结果低于市场一致预期。",
    "example": "The analyst discussed earnings miss during the earnings review.",
    "exampleCn": "分析师在财报复盘中讨论了财报不及预期。",
    "category": "Earnings",
    "level": "B2",
    "tags": [
      "Earnings",
      "earnings miss",
      "财报不及预期"
    ]
  },
  {
    "id": "market-whisper-number",
    "term": "whisper number",
    "termCn": "市场私下预期",
    "definition": "An unofficial expectation that may differ from published consensus.",
    "definitionCn": "可能不同于公开一致预期的非正式市场预期。",
    "example": "The analyst discussed whisper number during the earnings review.",
    "exampleCn": "分析师在财报复盘中讨论了市场私下预期。",
    "category": "Earnings",
    "level": "B2",
    "tags": [
      "Earnings",
      "whisper number",
      "市场私下预期"
    ]
  },
  {
    "id": "market-gross-margin",
    "term": "gross margin",
    "termCn": "毛利率",
    "definition": "Gross profit divided by revenue.",
    "definitionCn": "毛利润除以营收。",
    "example": "The analyst discussed gross margin during the earnings review.",
    "exampleCn": "分析师在财报复盘中讨论了毛利率。",
    "category": "Earnings",
    "level": "B2",
    "tags": [
      "Earnings",
      "gross margin",
      "毛利率"
    ]
  },
  {
    "id": "market-operating-margin",
    "term": "operating margin",
    "termCn": "营业利润率",
    "definition": "Operating income divided by revenue.",
    "definitionCn": "营业利润除以营收。",
    "example": "The analyst discussed operating margin during the earnings review.",
    "exampleCn": "分析师在财报复盘中讨论了营业利润率。",
    "category": "Earnings",
    "level": "B2",
    "tags": [
      "Earnings",
      "operating margin",
      "营业利润率"
    ]
  },
  {
    "id": "market-net-income",
    "term": "net income",
    "termCn": "净利润",
    "definition": "Profit remaining after expenses, interest, and taxes.",
    "definitionCn": "扣除费用、利息和税收后剩余的利润。",
    "example": "The analyst discussed net income during the earnings review.",
    "exampleCn": "分析师在财报复盘中讨论了净利润。",
    "category": "Earnings",
    "level": "B2",
    "tags": [
      "Earnings",
      "net income",
      "净利润"
    ]
  },
  {
    "id": "market-free-cash-flow",
    "term": "free cash flow",
    "termCn": "自由现金流",
    "definition": "Cash generated after operating expenses and capital expenditures.",
    "definitionCn": "扣除经营费用和资本支出后产生的现金。",
    "example": "The analyst discussed free cash flow during the earnings review.",
    "exampleCn": "分析师在财报复盘中讨论了自由现金流。",
    "category": "Earnings",
    "level": "B2",
    "tags": [
      "Earnings",
      "free cash flow",
      "自由现金流"
    ]
  },
  {
    "id": "market-earnings-call",
    "term": "earnings call",
    "termCn": "财报电话会",
    "definition": "A management conference call discussing financial results and outlook.",
    "definitionCn": "管理层讨论财务业绩和前景的电话会议。",
    "example": "The analyst discussed earnings call during the earnings review.",
    "exampleCn": "分析师在财报复盘中讨论了财报电话会。",
    "category": "Earnings",
    "level": "B2",
    "tags": [
      "Earnings",
      "earnings call",
      "财报电话会"
    ]
  },
  {
    "id": "market-forward-guidance",
    "term": "forward guidance",
    "termCn": "前瞻指引",
    "definition": "Management’s outlook for upcoming periods.",
    "definitionCn": "管理层对未来期间的展望。",
    "example": "The analyst discussed forward guidance during the earnings review.",
    "exampleCn": "分析师在财报复盘中讨论了前瞻指引。",
    "category": "Earnings",
    "level": "B2",
    "tags": [
      "Earnings",
      "forward guidance",
      "前瞻指引"
    ]
  },
  {
    "id": "market-price-to-earnings-ratio",
    "term": "price-to-earnings ratio",
    "termCn": "市盈率",
    "definition": "Share price divided by earnings per share, commonly called the P/E ratio.",
    "definitionCn": "股价除以每股收益，通常称为 P/E。",
    "example": "The analyst used price-to-earnings ratio to compare the company with its peers.",
    "exampleCn": "分析师使用市盈率将该公司与同行比较。",
    "category": "Fundamental Analysis",
    "level": "B2",
    "tags": [
      "Fundamental Analysis",
      "price-to-earnings ratio",
      "市盈率"
    ]
  },
  {
    "id": "market-forward-p-e",
    "term": "forward P/E",
    "termCn": "预期市盈率",
    "definition": "Share price divided by forecast future earnings per share.",
    "definitionCn": "股价除以预测的未来每股收益。",
    "example": "The analyst used forward P/E to compare the company with its peers.",
    "exampleCn": "分析师使用预期市盈率将该公司与同行比较。",
    "category": "Fundamental Analysis",
    "level": "B2",
    "tags": [
      "Fundamental Analysis",
      "forward P/E",
      "预期市盈率"
    ]
  },
  {
    "id": "market-peg-ratio",
    "term": "PEG ratio",
    "termCn": "PEG 比率",
    "definition": "The P/E ratio divided by an expected earnings growth rate.",
    "definitionCn": "市盈率除以预期盈利增长率。",
    "example": "The analyst used PEG ratio to compare the company with its peers.",
    "exampleCn": "分析师使用PEG 比率将该公司与同行比较。",
    "category": "Fundamental Analysis",
    "level": "B2",
    "tags": [
      "Fundamental Analysis",
      "PEG ratio",
      "PEG 比率"
    ]
  },
  {
    "id": "market-price-to-sales-ratio",
    "term": "price-to-sales ratio",
    "termCn": "市销率",
    "definition": "Market value divided by company revenue.",
    "definitionCn": "公司市场价值除以营收。",
    "example": "The analyst used price-to-sales ratio to compare the company with its peers.",
    "exampleCn": "分析师使用市销率将该公司与同行比较。",
    "category": "Fundamental Analysis",
    "level": "B2",
    "tags": [
      "Fundamental Analysis",
      "price-to-sales ratio",
      "市销率"
    ]
  },
  {
    "id": "market-ev-ebitda",
    "term": "EV/EBITDA",
    "termCn": "企业价值倍数",
    "definition": "Enterprise value divided by earnings before interest, taxes, depreciation, and amortization.",
    "definitionCn": "企业价值除以息税折旧摊销前利润。",
    "example": "The analyst used EV/EBITDA to compare the company with its peers.",
    "exampleCn": "分析师使用企业价值倍数将该公司与同行比较。",
    "category": "Fundamental Analysis",
    "level": "B2",
    "tags": [
      "Fundamental Analysis",
      "EV/EBITDA",
      "企业价值倍数"
    ]
  },
  {
    "id": "market-book-value",
    "term": "book value",
    "termCn": "账面价值",
    "definition": "The accounting value of assets minus liabilities.",
    "definitionCn": "资产减去负债后的会计价值。",
    "example": "The analyst used book value to compare the company with its peers.",
    "exampleCn": "分析师使用账面价值将该公司与同行比较。",
    "category": "Fundamental Analysis",
    "level": "B2",
    "tags": [
      "Fundamental Analysis",
      "book value",
      "账面价值"
    ]
  },
  {
    "id": "market-return-on-equity",
    "term": "return on equity",
    "termCn": "净资产收益率",
    "definition": "Net income divided by shareholder equity, commonly called ROE.",
    "definitionCn": "净利润除以股东权益，通常称为 ROE。",
    "example": "The analyst used return on equity to compare the company with its peers.",
    "exampleCn": "分析师使用净资产收益率将该公司与同行比较。",
    "category": "Fundamental Analysis",
    "level": "B2",
    "tags": [
      "Fundamental Analysis",
      "return on equity",
      "净资产收益率"
    ]
  },
  {
    "id": "market-return-on-invested-capital",
    "term": "return on invested capital",
    "termCn": "投入资本回报率",
    "definition": "A measure of profit generated from invested capital, commonly called ROIC.",
    "definitionCn": "衡量投入资本产生利润能力的指标，通常称为 ROIC。",
    "example": "The analyst used return on invested capital to compare the company with its peers.",
    "exampleCn": "分析师使用投入资本回报率将该公司与同行比较。",
    "category": "Fundamental Analysis",
    "level": "B2",
    "tags": [
      "Fundamental Analysis",
      "return on invested capital",
      "投入资本回报率"
    ]
  },
  {
    "id": "market-debt-to-equity-ratio",
    "term": "debt-to-equity ratio",
    "termCn": "负债权益比",
    "definition": "Total debt divided by shareholder equity.",
    "definitionCn": "总负债除以股东权益。",
    "example": "The analyst used debt-to-equity ratio to compare the company with its peers.",
    "exampleCn": "分析师使用负债权益比将该公司与同行比较。",
    "category": "Fundamental Analysis",
    "level": "B2",
    "tags": [
      "Fundamental Analysis",
      "debt-to-equity ratio",
      "负债权益比"
    ]
  },
  {
    "id": "market-current-ratio",
    "term": "current ratio",
    "termCn": "流动比率",
    "definition": "Current assets divided by current liabilities.",
    "definitionCn": "流动资产除以流动负债。",
    "example": "The analyst used current ratio to compare the company with its peers.",
    "exampleCn": "分析师使用流动比率将该公司与同行比较。",
    "category": "Fundamental Analysis",
    "level": "B2",
    "tags": [
      "Fundamental Analysis",
      "current ratio",
      "流动比率"
    ]
  },
  {
    "id": "market-economic-moat",
    "term": "economic moat",
    "termCn": "经济护城河",
    "definition": "A durable competitive advantage that protects a company’s profits.",
    "definitionCn": "保护公司利润的持久竞争优势。",
    "example": "The analyst used economic moat to compare the company with its peers.",
    "exampleCn": "分析师使用经济护城河将该公司与同行比较。",
    "category": "Fundamental Analysis",
    "level": "B2",
    "tags": [
      "Fundamental Analysis",
      "economic moat",
      "经济护城河"
    ]
  },
  {
    "id": "market-catalyst",
    "term": "catalyst",
    "termCn": "催化剂",
    "definition": "An event or development that could materially move a security’s price.",
    "definitionCn": "可能显著推动证券价格的事件或进展。",
    "example": "The analyst used catalyst to compare the company with its peers.",
    "exampleCn": "分析师使用催化剂将该公司与同行比较。",
    "category": "Fundamental Analysis",
    "level": "B2",
    "tags": [
      "Fundamental Analysis",
      "catalyst",
      "催化剂"
    ]
  },
  {
    "id": "market-support",
    "term": "support",
    "termCn": "支撑位",
    "definition": "A price area where buying interest may slow a decline.",
    "definitionCn": "买盘兴趣可能减缓下跌的价格区域。",
    "example": "The chart review identified a possible support.",
    "exampleCn": "图表复盘识别出一个可能的支撑位。",
    "category": "Technical Analysis",
    "level": "B2",
    "tags": [
      "Technical Analysis",
      "support",
      "支撑位"
    ]
  },
  {
    "id": "market-resistance",
    "term": "resistance",
    "termCn": "阻力位",
    "definition": "A price area where selling pressure may slow an advance.",
    "definitionCn": "卖压可能减缓上涨的价格区域。",
    "example": "The chart review identified a possible resistance.",
    "exampleCn": "图表复盘识别出一个可能的阻力位。",
    "category": "Technical Analysis",
    "level": "B2",
    "tags": [
      "Technical Analysis",
      "resistance",
      "阻力位"
    ]
  },
  {
    "id": "market-breakout",
    "term": "breakout",
    "termCn": "向上突破",
    "definition": "A move above a defined resistance level or trading range.",
    "definitionCn": "价格突破明确阻力位或交易区间上沿。",
    "example": "The chart review identified a possible breakout.",
    "exampleCn": "图表复盘识别出一个可能的向上突破。",
    "category": "Technical Analysis",
    "level": "B2",
    "tags": [
      "Technical Analysis",
      "breakout",
      "向上突破"
    ]
  },
  {
    "id": "market-breakdown",
    "term": "breakdown",
    "termCn": "向下跌破",
    "definition": "A move below a defined support level or trading range.",
    "definitionCn": "价格跌破明确支撑位或交易区间下沿。",
    "example": "The chart review identified a possible breakdown.",
    "exampleCn": "图表复盘识别出一个可能的向下跌破。",
    "category": "Technical Analysis",
    "level": "B2",
    "tags": [
      "Technical Analysis",
      "breakdown",
      "向下跌破"
    ]
  },
  {
    "id": "market-trendline",
    "term": "trendline",
    "termCn": "趋势线",
    "definition": "A line connecting significant highs or lows to visualize a trend.",
    "definitionCn": "连接重要高点或低点以展示趋势的线。",
    "example": "The chart review identified a possible trendline.",
    "exampleCn": "图表复盘识别出一个可能的趋势线。",
    "category": "Technical Analysis",
    "level": "B2",
    "tags": [
      "Technical Analysis",
      "trendline",
      "趋势线"
    ]
  },
  {
    "id": "market-moving-average",
    "term": "moving average",
    "termCn": "移动平均线",
    "definition": "An average price recalculated over a rolling time window.",
    "definitionCn": "在滚动时间窗口内不断重新计算的平均价格。",
    "example": "The chart review identified a possible moving average.",
    "exampleCn": "图表复盘识别出一个可能的移动平均线。",
    "category": "Technical Analysis",
    "level": "B2",
    "tags": [
      "Technical Analysis",
      "moving average",
      "移动平均线"
    ]
  },
  {
    "id": "market-relative-strength-index",
    "term": "relative strength index",
    "termCn": "相对强弱指标",
    "definition": "A momentum oscillator, commonly called RSI, that compares recent gains and losses.",
    "definitionCn": "比较近期上涨和下跌幅度的动量振荡指标，通常称 RSI。",
    "example": "The chart review identified a possible relative strength index.",
    "exampleCn": "图表复盘识别出一个可能的相对强弱指标。",
    "category": "Technical Analysis",
    "level": "B2",
    "tags": [
      "Technical Analysis",
      "relative strength index",
      "相对强弱指标"
    ]
  },
  {
    "id": "market-macd",
    "term": "MACD",
    "termCn": "指数平滑异同移动平均线",
    "definition": "A momentum indicator based on relationships between exponential moving averages.",
    "definitionCn": "基于指数移动平均线关系的动量指标。",
    "example": "The chart review identified a possible MACD.",
    "exampleCn": "图表复盘识别出一个可能的指数平滑异同移动平均线。",
    "category": "Technical Analysis",
    "level": "B2",
    "tags": [
      "Technical Analysis",
      "MACD",
      "指数平滑异同移动平均线"
    ]
  },
  {
    "id": "market-gap",
    "term": "gap",
    "termCn": "跳空缺口",
    "definition": "A price area between sessions where no trading occurred.",
    "definitionCn": "两个交易时段之间没有成交的价格区域。",
    "example": "The chart review identified a possible gap.",
    "exampleCn": "图表复盘识别出一个可能的跳空缺口。",
    "category": "Technical Analysis",
    "level": "B2",
    "tags": [
      "Technical Analysis",
      "gap",
      "跳空缺口"
    ]
  },
  {
    "id": "market-consolidation",
    "term": "consolidation",
    "termCn": "盘整",
    "definition": "A period when price trades within a relatively narrow range.",
    "definitionCn": "价格在相对狭窄区间内交易的一段时期。",
    "example": "The chart review identified a possible consolidation.",
    "exampleCn": "图表复盘识别出一个可能的盘整。",
    "category": "Technical Analysis",
    "level": "B2",
    "tags": [
      "Technical Analysis",
      "consolidation",
      "盘整"
    ]
  },
  {
    "id": "market-momentum",
    "term": "momentum",
    "termCn": "动量",
    "definition": "The speed and persistence of a price move.",
    "definitionCn": "价格变动的速度和持续性。",
    "example": "The chart review identified a possible momentum.",
    "exampleCn": "图表复盘识别出一个可能的动量。",
    "category": "Technical Analysis",
    "level": "B2",
    "tags": [
      "Technical Analysis",
      "momentum",
      "动量"
    ]
  },
  {
    "id": "market-relative-strength",
    "term": "relative strength",
    "termCn": "相对强势",
    "definition": "A comparison of one security’s performance with another security or benchmark.",
    "definitionCn": "将某证券表现与另一证券或基准进行比较。",
    "example": "The chart review identified a possible relative strength.",
    "exampleCn": "图表复盘识别出一个可能的相对强势。",
    "category": "Technical Analysis",
    "level": "B2",
    "tags": [
      "Technical Analysis",
      "relative strength",
      "相对强势"
    ]
  },
  {
    "id": "market-portfolio",
    "term": "portfolio",
    "termCn": "投资组合",
    "definition": "A collection of investments held by an individual or institution.",
    "definitionCn": "个人或机构持有的一组投资。",
    "example": "The portfolio review included a discussion of portfolio.",
    "exampleCn": "投资组合复盘包含了对投资组合的讨论。",
    "category": "Portfolio",
    "level": "B2",
    "tags": [
      "Portfolio",
      "portfolio",
      "投资组合"
    ]
  },
  {
    "id": "market-asset-allocation",
    "term": "asset allocation",
    "termCn": "资产配置",
    "definition": "How a portfolio is divided among asset classes or exposures.",
    "definitionCn": "投资组合在不同资产类别或风险敞口之间的分配方式。",
    "example": "The portfolio review included a discussion of asset allocation.",
    "exampleCn": "投资组合复盘包含了对资产配置的讨论。",
    "category": "Portfolio",
    "level": "B2",
    "tags": [
      "Portfolio",
      "asset allocation",
      "资产配置"
    ]
  },
  {
    "id": "market-benchmark",
    "term": "benchmark",
    "termCn": "业绩基准",
    "definition": "A reference index or standard used to compare performance.",
    "definitionCn": "用于比较投资表现的参考指数或标准。",
    "example": "The portfolio review included a discussion of benchmark.",
    "exampleCn": "投资组合复盘包含了对业绩基准的讨论。",
    "category": "Portfolio",
    "level": "B2",
    "tags": [
      "Portfolio",
      "benchmark",
      "业绩基准"
    ]
  },
  {
    "id": "market-alpha",
    "term": "alpha",
    "termCn": "超额收益",
    "definition": "Return above or below what is explained by market exposure or a benchmark.",
    "definitionCn": "相对于市场敞口或基准所解释收益之外的回报。",
    "example": "The portfolio review included a discussion of alpha.",
    "exampleCn": "投资组合复盘包含了对超额收益的讨论。",
    "category": "Portfolio",
    "level": "B2",
    "tags": [
      "Portfolio",
      "alpha",
      "超额收益"
    ]
  },
  {
    "id": "market-beta",
    "term": "beta",
    "termCn": "贝塔系数",
    "definition": "A measure of sensitivity to movements in a benchmark or market.",
    "definitionCn": "衡量对基准或市场变动敏感度的指标。",
    "example": "The portfolio review included a discussion of beta.",
    "exampleCn": "投资组合复盘包含了对贝塔系数的讨论。",
    "category": "Portfolio",
    "level": "B2",
    "tags": [
      "Portfolio",
      "beta",
      "贝塔系数"
    ]
  },
  {
    "id": "market-correlation",
    "term": "correlation",
    "termCn": "相关性",
    "definition": "The degree to which two assets move together.",
    "definitionCn": "两个资产共同变动的程度。",
    "example": "The portfolio review included a discussion of correlation.",
    "exampleCn": "投资组合复盘包含了对相关性的讨论。",
    "category": "Portfolio",
    "level": "B2",
    "tags": [
      "Portfolio",
      "correlation",
      "相关性"
    ]
  },
  {
    "id": "market-hedging",
    "term": "hedging",
    "termCn": "对冲",
    "definition": "Using another position to offset part of an existing risk.",
    "definitionCn": "使用另一头寸抵消部分现有风险。",
    "example": "The portfolio review included a discussion of hedging.",
    "exampleCn": "投资组合复盘包含了对对冲的讨论。",
    "category": "Portfolio",
    "level": "B2",
    "tags": [
      "Portfolio",
      "hedging",
      "对冲"
    ]
  },
  {
    "id": "market-rebalancing",
    "term": "rebalancing",
    "termCn": "再平衡",
    "definition": "Adjusting portfolio weights back toward target allocations.",
    "definitionCn": "将投资组合权重调整回目标配置。",
    "example": "The portfolio review included a discussion of rebalancing.",
    "exampleCn": "投资组合复盘包含了对再平衡的讨论。",
    "category": "Portfolio",
    "level": "B2",
    "tags": [
      "Portfolio",
      "rebalancing",
      "再平衡"
    ]
  },
  {
    "id": "market-cost-basis",
    "term": "cost basis",
    "termCn": "成本基础",
    "definition": "The adjusted amount paid for an investment, used to calculate gains or losses.",
    "definitionCn": "用于计算盈亏的投资调整后买入成本。",
    "example": "The portfolio review included a discussion of cost basis.",
    "exampleCn": "投资组合复盘包含了对成本基础的讨论。",
    "category": "Portfolio",
    "level": "B2",
    "tags": [
      "Portfolio",
      "cost basis",
      "成本基础"
    ]
  },
  {
    "id": "market-unrealized-gain",
    "term": "unrealized gain",
    "termCn": "未实现收益",
    "definition": "A gain on a position that has not yet been sold.",
    "definitionCn": "尚未卖出的头寸所产生的账面收益。",
    "example": "The portfolio review included a discussion of unrealized gain.",
    "exampleCn": "投资组合复盘包含了对未实现收益的讨论。",
    "category": "Portfolio",
    "level": "B2",
    "tags": [
      "Portfolio",
      "unrealized gain",
      "未实现收益"
    ]
  },
  {
    "id": "market-realized-gain",
    "term": "realized gain",
    "termCn": "已实现收益",
    "definition": "A gain recognized after a position is sold or closed.",
    "definitionCn": "卖出或平仓后确认的收益。",
    "example": "The portfolio review included a discussion of realized gain.",
    "exampleCn": "投资组合复盘包含了对已实现收益的讨论。",
    "category": "Portfolio",
    "level": "B2",
    "tags": [
      "Portfolio",
      "realized gain",
      "已实现收益"
    ]
  },
  {
    "id": "market-total-return",
    "term": "total return",
    "termCn": "总回报",
    "definition": "Combined return from price changes and income such as dividends.",
    "definitionCn": "价格变化与股息等收入合计产生的回报。",
    "example": "The portfolio review included a discussion of total return.",
    "exampleCn": "投资组合复盘包含了对总回报的讨论。",
    "category": "Portfolio",
    "level": "B2",
    "tags": [
      "Portfolio",
      "total return",
      "总回报"
    ]
  },
  {
    "id": "market-brokerage-account",
    "term": "brokerage account",
    "termCn": "证券账户",
    "definition": "An account used to hold and trade securities.",
    "definitionCn": "用于持有和交易证券的账户。",
    "example": "The broker explained the account rule related to brokerage account.",
    "exampleCn": "券商客服解释了与证券账户相关的账户规则。",
    "category": "Brokerage & Account",
    "level": "B2",
    "tags": [
      "Brokerage & Account",
      "brokerage account",
      "证券账户"
    ]
  },
  {
    "id": "market-cash-account",
    "term": "cash account",
    "termCn": "现金账户",
    "definition": "A brokerage account that generally requires trades to be fully paid with available cash.",
    "definitionCn": "通常要求使用可用现金全额支付交易的证券账户。",
    "example": "The broker explained the account rule related to cash account.",
    "exampleCn": "券商客服解释了与现金账户相关的账户规则。",
    "category": "Brokerage & Account",
    "level": "B2",
    "tags": [
      "Brokerage & Account",
      "cash account",
      "现金账户"
    ]
  },
  {
    "id": "market-margin-account",
    "term": "margin account",
    "termCn": "保证金账户",
    "definition": "A brokerage account that permits borrowing against eligible assets.",
    "definitionCn": "允许以合格资产为基础借款的证券账户。",
    "example": "The broker explained the account rule related to margin account.",
    "exampleCn": "券商客服解释了与保证金账户相关的账户规则。",
    "category": "Brokerage & Account",
    "level": "B2",
    "tags": [
      "Brokerage & Account",
      "margin account",
      "保证金账户"
    ]
  },
  {
    "id": "market-settlement",
    "term": "settlement",
    "termCn": "结算",
    "definition": "The process of completing a trade by exchanging securities and cash.",
    "definitionCn": "通过交付证券与现金完成交易的过程。",
    "example": "The broker explained the account rule related to settlement.",
    "exampleCn": "券商客服解释了与结算相关的账户规则。",
    "category": "Brokerage & Account",
    "level": "B2",
    "tags": [
      "Brokerage & Account",
      "settlement",
      "结算"
    ]
  },
  {
    "id": "market-settled-cash",
    "term": "settled cash",
    "termCn": "已结算现金",
    "definition": "Cash from completed transactions that is available under settlement rules.",
    "definitionCn": "按结算规则已经可用的交易资金。",
    "example": "The broker explained the account rule related to settled cash.",
    "exampleCn": "券商客服解释了与已结算现金相关的账户规则。",
    "category": "Brokerage & Account",
    "level": "B2",
    "tags": [
      "Brokerage & Account",
      "settled cash",
      "已结算现金"
    ]
  },
  {
    "id": "market-good-faith-violation",
    "term": "good faith violation",
    "termCn": "诚信违规",
    "definition": "A cash-account violation involving the purchase and sale of securities before payment is settled.",
    "definitionCn": "现金账户在付款完成前买卖证券造成的一种违规。",
    "example": "The broker explained the account rule related to good faith violation.",
    "exampleCn": "券商客服解释了与诚信违规相关的账户规则。",
    "category": "Brokerage & Account",
    "level": "B2",
    "tags": [
      "Brokerage & Account",
      "good faith violation",
      "诚信违规"
    ]
  },
  {
    "id": "market-pattern-day-trader",
    "term": "pattern day trader",
    "termCn": "日内交易者规则",
    "definition": "A U.S. margin-account designation triggered by frequent day trades under applicable rules.",
    "definitionCn": "在适用规则下因频繁日内交易触发的美国保证金账户分类。",
    "example": "The broker explained the account rule related to pattern day trader.",
    "exampleCn": "券商客服解释了与日内交易者规则相关的账户规则。",
    "category": "Brokerage & Account",
    "level": "B2",
    "tags": [
      "Brokerage & Account",
      "pattern day trader",
      "日内交易者规则"
    ]
  },
  {
    "id": "market-assignment",
    "term": "assignment",
    "termCn": "期权指派",
    "definition": "The obligation imposed on an option seller when the holder exercises.",
    "definitionCn": "期权持有人行权后，卖方被要求履行合约义务。",
    "example": "The broker explained the account rule related to assignment.",
    "exampleCn": "券商客服解释了与期权指派相关的账户规则。",
    "category": "Brokerage & Account",
    "level": "B2",
    "tags": [
      "Brokerage & Account",
      "assignment",
      "期权指派"
    ]
  },
  {
    "id": "market-exercise",
    "term": "exercise",
    "termCn": "行权",
    "definition": "Using an option right to buy or sell the underlying at the strike price.",
    "definitionCn": "使用期权权利按行权价买入或卖出标的。",
    "example": "The broker explained the account rule related to exercise.",
    "exampleCn": "券商客服解释了与行权相关的账户规则。",
    "category": "Brokerage & Account",
    "level": "B2",
    "tags": [
      "Brokerage & Account",
      "exercise",
      "行权"
    ]
  },
  {
    "id": "market-early-exercise",
    "term": "early exercise",
    "termCn": "提前行权",
    "definition": "Exercising an American-style option before expiration.",
    "definitionCn": "在到期日前行使美式期权。",
    "example": "The broker explained the account rule related to early exercise.",
    "exampleCn": "券商客服解释了与提前行权相关的账户规则。",
    "category": "Brokerage & Account",
    "level": "B2",
    "tags": [
      "Brokerage & Account",
      "early exercise",
      "提前行权"
    ]
  },
  {
    "id": "market-roll-an-option",
    "term": "roll an option",
    "termCn": "滚动期权",
    "definition": "Closing an option position and opening another with a different strike or expiration.",
    "definitionCn": "平掉一个期权头寸并建立不同行权价或到期日的新头寸。",
    "example": "The broker explained the account rule related to roll an option.",
    "exampleCn": "券商客服解释了与滚动期权相关的账户规则。",
    "category": "Brokerage & Account",
    "level": "B2",
    "tags": [
      "Brokerage & Account",
      "roll an option",
      "滚动期权"
    ]
  },
  {
    "id": "market-buy-to-open",
    "term": "buy to open",
    "termCn": "买入开仓",
    "definition": "Buying an option contract to establish a new long option position.",
    "definitionCn": "买入期权合约以建立新的期权多头头寸。",
    "example": "The broker explained the account rule related to buy to open.",
    "exampleCn": "券商客服解释了与买入开仓相关的账户规则。",
    "category": "Brokerage & Account",
    "level": "B2",
    "tags": [
      "Brokerage & Account",
      "buy to open",
      "买入开仓"
    ]
  },
  {
    "id": "market-bullish",
    "term": "bullish",
    "termCn": "看涨",
    "definition": "Expecting an asset or market to rise.",
    "definitionCn": "预期资产或市场上涨。",
    "example": "The market commentary used bullish to describe the latest reaction.",
    "exampleCn": "市场评论使用看涨描述最新反应。",
    "category": "News & Sentiment",
    "level": "B1",
    "tags": [
      "News & Sentiment",
      "bullish",
      "看涨"
    ]
  },
  {
    "id": "market-bearish",
    "term": "bearish",
    "termCn": "看跌",
    "definition": "Expecting an asset or market to fall.",
    "definitionCn": "预期资产或市场下跌。",
    "example": "The market commentary used bearish to describe the latest reaction.",
    "exampleCn": "市场评论使用看跌描述最新反应。",
    "category": "News & Sentiment",
    "level": "B1",
    "tags": [
      "News & Sentiment",
      "bearish",
      "看跌"
    ]
  },
  {
    "id": "market-neutral-outlook",
    "term": "neutral outlook",
    "termCn": "中性展望",
    "definition": "An expectation that does not strongly favor a rise or decline.",
    "definitionCn": "不明显偏向上涨或下跌的预期。",
    "example": "The market commentary used neutral outlook to describe the latest reaction.",
    "exampleCn": "市场评论使用中性展望描述最新反应。",
    "category": "News & Sentiment",
    "level": "B1",
    "tags": [
      "News & Sentiment",
      "neutral outlook",
      "中性展望"
    ]
  },
  {
    "id": "market-analyst-upgrade",
    "term": "analyst upgrade",
    "termCn": "分析师上调评级",
    "definition": "A more favorable rating issued by an analyst.",
    "definitionCn": "分析师给出的更积极评级。",
    "example": "The market commentary used analyst upgrade to describe the latest reaction.",
    "exampleCn": "市场评论使用分析师上调评级描述最新反应。",
    "category": "News & Sentiment",
    "level": "B1",
    "tags": [
      "News & Sentiment",
      "analyst upgrade",
      "分析师上调评级"
    ]
  },
  {
    "id": "market-analyst-downgrade",
    "term": "analyst downgrade",
    "termCn": "分析师下调评级",
    "definition": "A less favorable rating issued by an analyst.",
    "definitionCn": "分析师给出的更消极评级。",
    "example": "The market commentary used analyst downgrade to describe the latest reaction.",
    "exampleCn": "市场评论使用分析师下调评级描述最新反应。",
    "category": "News & Sentiment",
    "level": "B1",
    "tags": [
      "News & Sentiment",
      "analyst downgrade",
      "分析师下调评级"
    ]
  },
  {
    "id": "market-price-target",
    "term": "price target",
    "termCn": "目标价",
    "definition": "An analyst’s estimate of a security’s future price over a stated period.",
    "definitionCn": "分析师对证券在特定期间未来价格的估计。",
    "example": "The market commentary used price target to describe the latest reaction.",
    "exampleCn": "市场评论使用目标价描述最新反应。",
    "category": "News & Sentiment",
    "level": "B1",
    "tags": [
      "News & Sentiment",
      "price target",
      "目标价"
    ]
  },
  {
    "id": "market-short-interest",
    "term": "short interest",
    "termCn": "空头持仓量",
    "definition": "Shares sold short that have not yet been covered.",
    "definitionCn": "已经卖空但尚未回补的股份数量。",
    "example": "The market commentary used short interest to describe the latest reaction.",
    "exampleCn": "市场评论使用空头持仓量描述最新反应。",
    "category": "News & Sentiment",
    "level": "B1",
    "tags": [
      "News & Sentiment",
      "short interest",
      "空头持仓量"
    ]
  },
  {
    "id": "market-short-squeeze",
    "term": "short squeeze",
    "termCn": "逼空",
    "definition": "A rapid rise caused partly by short sellers buying to close positions.",
    "definitionCn": "部分由空头买入回补推动的快速上涨。",
    "example": "The market commentary used short squeeze to describe the latest reaction.",
    "exampleCn": "市场评论使用逼空描述最新反应。",
    "category": "News & Sentiment",
    "level": "B1",
    "tags": [
      "News & Sentiment",
      "short squeeze",
      "逼空"
    ]
  },
  {
    "id": "market-insider-buying",
    "term": "insider buying",
    "termCn": "内部人士买入",
    "definition": "Purchases of company shares by officers, directors, or other insiders.",
    "definitionCn": "公司高管、董事或其他内部人士买入公司股票。",
    "example": "The market commentary used insider buying to describe the latest reaction.",
    "exampleCn": "市场评论使用内部人士买入描述最新反应。",
    "category": "News & Sentiment",
    "level": "B1",
    "tags": [
      "News & Sentiment",
      "insider buying",
      "内部人士买入"
    ]
  },
  {
    "id": "market-institutional-ownership",
    "term": "institutional ownership",
    "termCn": "机构持股",
    "definition": "The portion of shares held by institutions such as funds and pensions.",
    "definitionCn": "基金和养老金等机构持有的股份比例。",
    "example": "The market commentary used institutional ownership to describe the latest reaction.",
    "exampleCn": "市场评论使用机构持股描述最新反应。",
    "category": "News & Sentiment",
    "level": "B1",
    "tags": [
      "News & Sentiment",
      "institutional ownership",
      "机构持股"
    ]
  },
  {
    "id": "market-analyst-consensus",
    "term": "analyst consensus",
    "termCn": "分析师一致预期",
    "definition": "A combined view derived from multiple analyst estimates or ratings.",
    "definitionCn": "由多位分析师预测或评级汇总形成的观点。",
    "example": "The market commentary used analyst consensus to describe the latest reaction.",
    "exampleCn": "市场评论使用分析师一致预期描述最新反应。",
    "category": "News & Sentiment",
    "level": "B1",
    "tags": [
      "News & Sentiment",
      "analyst consensus",
      "分析师一致预期"
    ]
  },
  {
    "id": "market-market-sentiment",
    "term": "market sentiment",
    "termCn": "市场情绪",
    "definition": "The overall attitude of market participants toward an asset or market.",
    "definitionCn": "市场参与者对某资产或市场的整体态度。",
    "example": "The market commentary used market sentiment to describe the latest reaction.",
    "exampleCn": "市场评论使用市场情绪描述最新反应。",
    "category": "News & Sentiment",
    "level": "B1",
    "tags": [
      "News & Sentiment",
      "market sentiment",
      "市场情绪"
    ]
  },
  {
    "id": "market-covered-call",
    "term": "covered call",
    "termCn": "备兑看涨",
    "definition": "Owning the underlying while selling a call option against it.",
    "definitionCn": "持有标的同时卖出对应看涨期权。",
    "example": "The lesson compared the risk and payoff of a covered call.",
    "exampleCn": "课程比较了备兑看涨的风险与收益结构。",
    "category": "Options Strategies",
    "level": "B2",
    "tags": [
      "Options Strategies",
      "covered call",
      "备兑看涨"
    ]
  },
  {
    "id": "market-cash-secured-put",
    "term": "cash-secured put",
    "termCn": "现金担保看跌",
    "definition": "Selling a put while keeping enough cash to buy the shares if assigned.",
    "definitionCn": "卖出看跌期权并预留足够现金以便被指派时买入股票。",
    "example": "The lesson compared the risk and payoff of a cash-secured put.",
    "exampleCn": "课程比较了现金担保看跌的风险与收益结构。",
    "category": "Options Strategies",
    "level": "B2",
    "tags": [
      "Options Strategies",
      "cash-secured put",
      "现金担保看跌"
    ]
  },
  {
    "id": "market-protective-put",
    "term": "protective put",
    "termCn": "保护性看跌",
    "definition": "Buying a put to limit downside risk on an owned asset.",
    "definitionCn": "买入看跌期权限制已持有资产的下行风险。",
    "example": "The lesson compared the risk and payoff of a protective put.",
    "exampleCn": "课程比较了保护性看跌的风险与收益结构。",
    "category": "Options Strategies",
    "level": "B2",
    "tags": [
      "Options Strategies",
      "protective put",
      "保护性看跌"
    ]
  },
  {
    "id": "market-collar",
    "term": "collar",
    "termCn": "领口策略",
    "definition": "Combining a protective put with a covered call around an owned asset.",
    "definitionCn": "在持有标的的同时组合保护性看跌和备兑看涨。",
    "example": "The lesson compared the risk and payoff of a collar.",
    "exampleCn": "课程比较了领口策略的风险与收益结构。",
    "category": "Options Strategies",
    "level": "B2",
    "tags": [
      "Options Strategies",
      "collar",
      "领口策略"
    ]
  },
  {
    "id": "market-vertical-spread",
    "term": "vertical spread",
    "termCn": "垂直价差",
    "definition": "Buying and selling options of the same type and expiration at different strikes.",
    "definitionCn": "买卖相同类型、相同到期日但不同行权价的期权。",
    "example": "The lesson compared the risk and payoff of a vertical spread.",
    "exampleCn": "课程比较了垂直价差的风险与收益结构。",
    "category": "Options Strategies",
    "level": "B2",
    "tags": [
      "Options Strategies",
      "vertical spread",
      "垂直价差"
    ]
  },
  {
    "id": "market-debit-spread",
    "term": "debit spread",
    "termCn": "借记价差",
    "definition": "A spread entered for a net premium paid.",
    "definitionCn": "以净支付权利金建立的价差策略。",
    "example": "The lesson compared the risk and payoff of a debit spread.",
    "exampleCn": "课程比较了借记价差的风险与收益结构。",
    "category": "Options Strategies",
    "level": "B2",
    "tags": [
      "Options Strategies",
      "debit spread",
      "借记价差"
    ]
  },
  {
    "id": "market-credit-spread",
    "term": "credit spread",
    "termCn": "贷记价差",
    "definition": "A spread entered for a net premium received.",
    "definitionCn": "以净收取权利金建立的价差策略。",
    "example": "The lesson compared the risk and payoff of a credit spread.",
    "exampleCn": "课程比较了贷记价差的风险与收益结构。",
    "category": "Options Strategies",
    "level": "B2",
    "tags": [
      "Options Strategies",
      "credit spread",
      "贷记价差"
    ]
  },
  {
    "id": "market-calendar-spread",
    "term": "calendar spread",
    "termCn": "日历价差",
    "definition": "A spread using the same strike with different expiration dates.",
    "definitionCn": "使用相同行权价但不同到期日的价差策略。",
    "example": "The lesson compared the risk and payoff of a calendar spread.",
    "exampleCn": "课程比较了日历价差的风险与收益结构。",
    "category": "Options Strategies",
    "level": "B2",
    "tags": [
      "Options Strategies",
      "calendar spread",
      "日历价差"
    ]
  },
  {
    "id": "market-diagonal-spread",
    "term": "diagonal spread",
    "termCn": "对角价差",
    "definition": "A spread using different strikes and different expiration dates.",
    "definitionCn": "使用不同行权价和不同到期日的价差策略。",
    "example": "The lesson compared the risk and payoff of a diagonal spread.",
    "exampleCn": "课程比较了对角价差的风险与收益结构。",
    "category": "Options Strategies",
    "level": "B2",
    "tags": [
      "Options Strategies",
      "diagonal spread",
      "对角价差"
    ]
  },
  {
    "id": "market-straddle",
    "term": "straddle",
    "termCn": "跨式策略",
    "definition": "Buying or selling a call and put with the same strike and expiration.",
    "definitionCn": "买入或卖出相同行权价和到期日的看涨与看跌期权。",
    "example": "The lesson compared the risk and payoff of a straddle.",
    "exampleCn": "课程比较了跨式策略的风险与收益结构。",
    "category": "Options Strategies",
    "level": "B2",
    "tags": [
      "Options Strategies",
      "straddle",
      "跨式策略"
    ]
  },
  {
    "id": "market-strangle",
    "term": "strangle",
    "termCn": "宽跨式策略",
    "definition": "Buying or selling an out-of-the-money call and put with the same expiration.",
    "definitionCn": "买入或卖出相同到期日的虚值看涨与看跌期权。",
    "example": "The lesson compared the risk and payoff of a strangle.",
    "exampleCn": "课程比较了宽跨式策略的风险与收益结构。",
    "category": "Options Strategies",
    "level": "B2",
    "tags": [
      "Options Strategies",
      "strangle",
      "宽跨式策略"
    ]
  },
  {
    "id": "market-iron-condor",
    "term": "iron condor",
    "termCn": "铁鹰策略",
    "definition": "A defined-risk strategy combining a put credit spread and a call credit spread.",
    "definitionCn": "组合看跌贷记价差与看涨贷记价差的限定风险策略。",
    "example": "The lesson compared the risk and payoff of a iron condor.",
    "exampleCn": "课程比较了铁鹰策略的风险与收益结构。",
    "category": "Options Strategies",
    "level": "B2",
    "tags": [
      "Options Strategies",
      "iron condor",
      "铁鹰策略"
    ]
  }
];

  const scenarioDefinitions = [
  {
    "id": "explain-stock-move",
    "title": "Explain why a stock moved",
    "titleCn": "解释股票为什么波动",
    "category": "Stocks",
    "role": "Market Analyst",
    "roleCn": "市场分析师",
    "setup": "A stock moved sharply after the opening bell, and you want to explain the main drivers without overclaiming.",
    "setupCn": "一只股票开盘后大幅波动，你想在不过度下结论的情况下解释主要原因。",
    "objective": "Ask which verified factors are most likely driving the move.",
    "objectiveCn": "询问哪些已确认因素最可能推动这次波动。",
    "summary": "Separate confirmed news, market-wide factors, and speculation.",
    "summaryCn": "区分已确认新闻、整体市场因素和猜测。",
    "keywords": [
      "catalyst",
      "volume",
      "market sentiment"
    ],
    "complications": [
      {
        "en": "The price move started before the headline appeared.",
        "cn": "价格波动在新闻标题出现前就开始了。"
      },
      {
        "en": "Different sources are emphasizing different explanations.",
        "cn": "不同来源强调了不同解释。"
      },
      {
        "en": "The stock is also moving with its entire sector.",
        "cn": "该股票还在跟随整个行业一起波动。"
      }
    ],
    "level": "B2"
  },
  {
    "id": "compare-two-stocks",
    "title": "Compare two stocks",
    "titleCn": "比较两只股票",
    "category": "Stocks",
    "role": "Research Partner",
    "roleCn": "研究搭档",
    "setup": "You are comparing two companies in the same industry before writing a short English summary.",
    "setupCn": "你准备写一段英文摘要，正在比较同一行业的两家公司。",
    "objective": "Compare growth, valuation, margins, and major risks.",
    "objectiveCn": "比较增长、估值、利润率和主要风险。",
    "summary": "Use the same metrics and time period for both companies.",
    "summaryCn": "对两家公司使用相同指标和时间周期。",
    "keywords": [
      "market capitalization",
      "forward P/E",
      "gross margin"
    ],
    "complications": [
      {
        "en": "The price move started before the headline appeared.",
        "cn": "价格波动在新闻标题出现前就开始了。"
      },
      {
        "en": "Different sources are emphasizing different explanations.",
        "cn": "不同来源强调了不同解释。"
      },
      {
        "en": "The stock is also moving with its entire sector.",
        "cn": "该股票还在跟随整个行业一起波动。"
      }
    ],
    "level": "B2"
  },
  {
    "id": "discuss-valuation",
    "title": "Discuss whether valuation looks high",
    "titleCn": "讨论估值是否偏高",
    "category": "Stocks",
    "role": "Equity Analyst",
    "roleCn": "股票分析师",
    "setup": "A company has rallied and now trades at a higher multiple than its peers.",
    "setupCn": "一家公司上涨后估值倍数高于同行。",
    "objective": "Ask whether the premium is supported by growth and profitability.",
    "objectiveCn": "询问更高估值是否由增长和盈利能力支撑。",
    "summary": "A high multiple is not automatically expensive without context.",
    "summaryCn": "高估值倍数在缺少背景时并不必然意味着昂贵。",
    "keywords": [
      "price-to-earnings ratio",
      "PEG ratio",
      "catalyst"
    ],
    "complications": [
      {
        "en": "The price move started before the headline appeared.",
        "cn": "价格波动在新闻标题出现前就开始了。"
      },
      {
        "en": "Different sources are emphasizing different explanations.",
        "cn": "不同来源强调了不同解释。"
      },
      {
        "en": "The stock is also moving with its entire sector.",
        "cn": "该股票还在跟随整个行业一起波动。"
      }
    ],
    "level": "B2"
  },
  {
    "id": "dividend-discussion",
    "title": "Discuss a dividend stock",
    "titleCn": "讨论股息股票",
    "category": "Stocks",
    "role": "Portfolio Manager",
    "roleCn": "投资组合经理",
    "setup": "You are reviewing a company known for paying dividends.",
    "setupCn": "你正在研究一家以支付股息著称的公司。",
    "objective": "Ask about dividend yield, payout stability, and business risk.",
    "objectiveCn": "询问股息率、派息稳定性和业务风险。",
    "summary": "Yield should be considered together with cash flow and balance-sheet strength.",
    "summaryCn": "股息率应与现金流和资产负债表强度一起考虑。",
    "keywords": [
      "dividend",
      "dividend yield",
      "free cash flow"
    ],
    "complications": [
      {
        "en": "The price move started before the headline appeared.",
        "cn": "价格波动在新闻标题出现前就开始了。"
      },
      {
        "en": "Different sources are emphasizing different explanations.",
        "cn": "不同来源强调了不同解释。"
      },
      {
        "en": "The stock is also moving with its entire sector.",
        "cn": "该股票还在跟随整个行业一起波动。"
      }
    ],
    "level": "B2"
  },
  {
    "id": "stock-split",
    "title": "Explain a stock split",
    "titleCn": "解释股票拆分",
    "category": "Stocks",
    "role": "Financial Educator",
    "roleCn": "金融教育者",
    "setup": "A friend thinks a stock split makes the company more valuable.",
    "setupCn": "朋友认为股票拆分会让公司更有价值。",
    "objective": "Explain what changes and what does not change after a split.",
    "objectiveCn": "解释拆分后哪些发生变化、哪些不变。",
    "summary": "Share count and price change proportionally, while total value is initially unchanged.",
    "summaryCn": "股数和价格按比例变化，而总价值最初不变。",
    "keywords": [
      "stock split",
      "shares outstanding",
      "market capitalization"
    ],
    "complications": [
      {
        "en": "The price move started before the headline appeared.",
        "cn": "价格波动在新闻标题出现前就开始了。"
      },
      {
        "en": "Different sources are emphasizing different explanations.",
        "cn": "不同来源强调了不同解释。"
      },
      {
        "en": "The stock is also moving with its entire sector.",
        "cn": "该股票还在跟随整个行业一起波动。"
      }
    ],
    "level": "B2"
  },
  {
    "id": "sector-rotation",
    "title": "Discuss sector rotation",
    "titleCn": "讨论行业轮动",
    "category": "Stocks",
    "role": "Market Strategist",
    "roleCn": "市场策略师",
    "setup": "Several sectors are moving in different directions after new macroeconomic data.",
    "setupCn": "新宏观数据公布后，不同行业走势分化。",
    "objective": "Ask how sector rotation can affect individual stocks.",
    "objectiveCn": "询问行业轮动如何影响个股。",
    "summary": "Distinguish company-specific news from sector-wide flows.",
    "summaryCn": "区分公司特定新闻和行业整体资金流。",
    "keywords": [
      "relative strength",
      "benchmark",
      "market sentiment"
    ],
    "complications": [
      {
        "en": "The price move started before the headline appeared.",
        "cn": "价格波动在新闻标题出现前就开始了。"
      },
      {
        "en": "Different sources are emphasizing different explanations.",
        "cn": "不同来源强调了不同解释。"
      },
      {
        "en": "The stock is also moving with its entire sector.",
        "cn": "该股票还在跟随整个行业一起波动。"
      }
    ],
    "level": "B2"
  },
  {
    "id": "premarket-move",
    "title": "Review a premarket move",
    "titleCn": "复盘盘前波动",
    "category": "Stocks",
    "role": "Trading Desk Colleague",
    "roleCn": "交易台同事",
    "setup": "A stock is up sharply before regular trading begins.",
    "setupCn": "一只股票在常规交易时段开始前大涨。",
    "objective": "Ask whether volume and news support the move.",
    "objectiveCn": "询问成交量和新闻是否支持该走势。",
    "summary": "Premarket liquidity can be lower and spreads can be wider.",
    "summaryCn": "盘前流动性可能更低，价差可能更宽。",
    "keywords": [
      "premarket",
      "volume",
      "bid-ask spread"
    ],
    "complications": [
      {
        "en": "The price move started before the headline appeared.",
        "cn": "价格波动在新闻标题出现前就开始了。"
      },
      {
        "en": "Different sources are emphasizing different explanations.",
        "cn": "不同来源强调了不同解释。"
      },
      {
        "en": "The stock is also moving with its entire sector.",
        "cn": "该股票还在跟随整个行业一起波动。"
      }
    ],
    "level": "B2"
  },
  {
    "id": "short-squeeze",
    "title": "Explain a possible short squeeze",
    "titleCn": "解释可能的逼空",
    "category": "Stocks",
    "role": "Market Commentator",
    "roleCn": "市场评论员",
    "setup": "A heavily shorted stock is rising quickly on unusually high volume.",
    "setupCn": "一只高空头持仓股票在异常高成交量下快速上涨。",
    "objective": "Discuss evidence for a short squeeze without treating it as certain.",
    "objectiveCn": "在不把它当作确定事实的情况下讨论逼空证据。",
    "summary": "Look at short interest, borrow conditions, news, and trading volume.",
    "summaryCn": "查看空头持仓量、借券条件、新闻和成交量。",
    "keywords": [
      "short interest",
      "short squeeze",
      "volume"
    ],
    "complications": [
      {
        "en": "The price move started before the headline appeared.",
        "cn": "价格波动在新闻标题出现前就开始了。"
      },
      {
        "en": "Different sources are emphasizing different explanations.",
        "cn": "不同来源强调了不同解释。"
      },
      {
        "en": "The stock is also moving with its entire sector.",
        "cn": "该股票还在跟随整个行业一起波动。"
      }
    ],
    "level": "B2"
  },
  {
    "id": "read-option-chain",
    "title": "Read an option chain",
    "titleCn": "阅读期权链",
    "category": "Options",
    "role": "Options Educator",
    "roleCn": "期权讲师",
    "setup": "You opened an option chain and need help understanding the columns.",
    "setupCn": "你打开了期权链，需要理解各列信息。",
    "objective": "Ask how to read strike, bid, ask, volume, open interest, and IV.",
    "objectiveCn": "询问如何阅读行权价、买价、卖价、成交量、未平仓量和 IV。",
    "summary": "Start with expiration and strike, then compare liquidity and volatility fields.",
    "summaryCn": "先看到期日和行权价，再比较流动性和波动率字段。",
    "keywords": [
      "strike price",
      "open interest",
      "implied volatility"
    ],
    "complications": [
      {
        "en": "The contract has a wide bid-ask spread.",
        "cn": "该合约的买卖价差很宽。"
      },
      {
        "en": "Open interest is low and the quote is changing quickly.",
        "cn": "未平仓量较低，报价变化很快。"
      },
      {
        "en": "Expiration is close and time decay is accelerating.",
        "cn": "距离到期很近，时间损耗正在加速。"
      }
    ],
    "level": "B2"
  },
  {
    "id": "compare-calls",
    "title": "Compare two call options",
    "titleCn": "比较两张看涨期权",
    "category": "Options",
    "role": "Options Trader",
    "roleCn": "期权交易者",
    "setup": "Two call options have different strikes, expirations, prices, and liquidity.",
    "setupCn": "两张看涨期权的行权价、到期日、价格和流动性不同。",
    "objective": "Ask how to compare exposure, time, and execution quality.",
    "objectiveCn": "询问如何比较风险敞口、时间和成交质量。",
    "summary": "Compare delta, theta, IV, spread, and maximum amount at risk.",
    "summaryCn": "比较 Delta、Theta、IV、价差和最大风险金额。",
    "keywords": [
      "call option",
      "delta",
      "theta"
    ],
    "complications": [
      {
        "en": "The contract has a wide bid-ask spread.",
        "cn": "该合约的买卖价差很宽。"
      },
      {
        "en": "Open interest is low and the quote is changing quickly.",
        "cn": "未平仓量较低，报价变化很快。"
      },
      {
        "en": "Expiration is close and time decay is accelerating.",
        "cn": "距离到期很近，时间损耗正在加速。"
      }
    ],
    "level": "B2"
  },
  {
    "id": "volume-vs-oi",
    "title": "Explain volume versus open interest",
    "titleCn": "解释成交量与未平仓量",
    "category": "Options",
    "role": "Options Educator",
    "roleCn": "期权讲师",
    "setup": "An option contract shows high volume but relatively low open interest.",
    "setupCn": "一个期权合约成交量很高，但未平仓量相对较低。",
    "objective": "Ask what each number measures and why they differ.",
    "objectiveCn": "询问两个数字分别衡量什么以及为何不同。",
    "summary": "Volume counts today’s trading; open interest reflects outstanding contracts.",
    "summaryCn": "成交量统计当天交易，未平仓量反映仍存续的合约。",
    "keywords": [
      "volume",
      "open interest",
      "option contract"
    ],
    "complications": [
      {
        "en": "The contract has a wide bid-ask spread.",
        "cn": "该合约的买卖价差很宽。"
      },
      {
        "en": "Open interest is low and the quote is changing quickly.",
        "cn": "未平仓量较低，报价变化很快。"
      },
      {
        "en": "Expiration is close and time decay is accelerating.",
        "cn": "距离到期很近，时间损耗正在加速。"
      }
    ],
    "level": "B2"
  },
  {
    "id": "wide-spread",
    "title": "Discuss a wide bid-ask spread",
    "titleCn": "讨论较宽买卖价差",
    "category": "Options",
    "role": "Brokerage Representative",
    "roleCn": "券商客服",
    "setup": "An option quote has a much wider spread than nearby contracts.",
    "setupCn": "一个期权报价的买卖价差明显宽于附近合约。",
    "objective": "Ask how the spread affects entry and exit quality.",
    "objectiveCn": "询问价差如何影响进出场质量。",
    "summary": "A wide spread can increase slippage and make the mark price less reliable.",
    "summaryCn": "较宽价差可能增加滑点，并降低标记价格的可靠性。",
    "keywords": [
      "bid-ask spread",
      "slippage",
      "mark price"
    ],
    "complications": [
      {
        "en": "The contract has a wide bid-ask spread.",
        "cn": "该合约的买卖价差很宽。"
      },
      {
        "en": "Open interest is low and the quote is changing quickly.",
        "cn": "未平仓量较低，报价变化很快。"
      },
      {
        "en": "Expiration is close and time decay is accelerating.",
        "cn": "距离到期很近，时间损耗正在加速。"
      }
    ],
    "level": "B2"
  },
  {
    "id": "iv-crush",
    "title": "Explain IV crush after earnings",
    "titleCn": "解释财报后的 IV Crush",
    "category": "Options",
    "role": "Options Analyst",
    "roleCn": "期权分析师",
    "setup": "A company reported earnings and its options fell even though the stock moved in the expected direction.",
    "setupCn": "公司公布财报后，尽管股价方向符合预期，期权却下跌。",
    "objective": "Ask how implied volatility contraction affected the premium.",
    "objectiveCn": "询问隐含波动率收缩如何影响权利金。",
    "summary": "Direction, magnitude, time decay, and IV change all affect the result.",
    "summaryCn": "方向、幅度、时间损耗和 IV 变化都会影响结果。",
    "keywords": [
      "IV crush",
      "premium",
      "vega"
    ],
    "complications": [
      {
        "en": "The contract has a wide bid-ask spread.",
        "cn": "该合约的买卖价差很宽。"
      },
      {
        "en": "Open interest is low and the quote is changing quickly.",
        "cn": "未平仓量较低，报价变化很快。"
      },
      {
        "en": "Expiration is close and time decay is accelerating.",
        "cn": "距离到期很近，时间损耗正在加速。"
      }
    ],
    "level": "B2"
  },
  {
    "id": "greeks-overview",
    "title": "Ask for an options Greeks overview",
    "titleCn": "询问期权 Greeks",
    "category": "Options",
    "role": "Options Educator",
    "roleCn": "期权讲师",
    "setup": "You want a practical explanation of delta, gamma, theta, and vega.",
    "setupCn": "你想获得 Delta、Gamma、Theta 和 Vega 的实用解释。",
    "objective": "Ask how each Greek can change the position over time.",
    "objectiveCn": "询问每个 Greek 如何随时间改变头寸。",
    "summary": "Greeks are estimates and can change as price, time, and volatility change.",
    "summaryCn": "Greeks 是估计值，会随价格、时间和波动率变化。",
    "keywords": [
      "delta",
      "gamma",
      "theta"
    ],
    "complications": [
      {
        "en": "The contract has a wide bid-ask spread.",
        "cn": "该合约的买卖价差很宽。"
      },
      {
        "en": "Open interest is low and the quote is changing quickly.",
        "cn": "未平仓量较低，报价变化很快。"
      },
      {
        "en": "Expiration is close and time decay is accelerating.",
        "cn": "距离到期很近，时间损耗正在加速。"
      }
    ],
    "level": "B2"
  },
  {
    "id": "leaps-vs-short-dated",
    "title": "Compare LEAPS with short-dated options",
    "titleCn": "比较 LEAPS 与短期期权",
    "category": "Options",
    "role": "Options Strategist",
    "roleCn": "期权策略师",
    "setup": "You are comparing a long-dated contract with a much shorter-dated one.",
    "setupCn": "你正在比较长期合约和短期合约。",
    "objective": "Ask about cost, theta, delta, liquidity, and event exposure.",
    "objectiveCn": "询问成本、Theta、Delta、流动性和事件风险。",
    "summary": "Longer duration usually costs more but changes the time-decay profile.",
    "summaryCn": "更长期限通常成本更高，但时间损耗特征不同。",
    "keywords": [
      "expiration date",
      "theta",
      "extrinsic value"
    ],
    "complications": [
      {
        "en": "The contract has a wide bid-ask spread.",
        "cn": "该合约的买卖价差很宽。"
      },
      {
        "en": "Open interest is low and the quote is changing quickly.",
        "cn": "未平仓量较低，报价变化很快。"
      },
      {
        "en": "Expiration is close and time decay is accelerating.",
        "cn": "距离到期很近，时间损耗正在加速。"
      }
    ],
    "level": "B2"
  },
  {
    "id": "assignment-risk",
    "title": "Discuss option assignment risk",
    "titleCn": "讨论期权指派风险",
    "category": "Options",
    "role": "Brokerage Representative",
    "roleCn": "券商客服",
    "setup": "You sold an option and want to understand assignment before expiration.",
    "setupCn": "你卖出了一张期权，想了解到期前被指派的风险。",
    "objective": "Ask when assignment can happen and what the account would receive or owe.",
    "objectiveCn": "询问何时可能被指派以及账户将收到或承担什么。",
    "summary": "American-style options may be exercised early, especially around dividends or low extrinsic value.",
    "summaryCn": "美式期权可能提前行权，尤其在股息附近或外在价值很低时。",
    "keywords": [
      "assignment",
      "early exercise",
      "extrinsic value"
    ],
    "complications": [
      {
        "en": "The contract has a wide bid-ask spread.",
        "cn": "该合约的买卖价差很宽。"
      },
      {
        "en": "Open interest is low and the quote is changing quickly.",
        "cn": "未平仓量较低，报价变化很快。"
      },
      {
        "en": "Expiration is close and time decay is accelerating.",
        "cn": "距离到期很近，时间损耗正在加速。"
      }
    ],
    "level": "B2"
  },
  {
    "id": "limit-not-filled",
    "title": "Ask why a limit order did not fill",
    "titleCn": "询问限价单为何未成交",
    "category": "Brokerage",
    "role": "Brokerage Support",
    "roleCn": "券商客服",
    "setup": "Your limit order remained open even though the chart briefly touched your price.",
    "setupCn": "图表短暂触及你的限价，但订单仍未成交。",
    "objective": "Ask about queue priority, available size, and quote conditions.",
    "objectiveCn": "询问队列优先级、可成交数量和报价条件。",
    "summary": "Touching a displayed price does not guarantee enough liquidity was available for your order.",
    "summaryCn": "触及显示价格并不保证有足够流动性成交你的订单。",
    "keywords": [
      "limit order",
      "partial fill",
      "order book"
    ],
    "complications": [
      {
        "en": "The account screen and order screen show different available amounts.",
        "cn": "账户页面和订单页面显示的可用金额不同。"
      },
      {
        "en": "The app displays only a short error code.",
        "cn": "App 只显示了一条简短错误代码。"
      },
      {
        "en": "The issue appeared after a recent transfer or corporate action.",
        "cn": "问题出现在近期转账或公司行动之后。"
      }
    ],
    "level": "B2"
  },
  {
    "id": "order-rejected",
    "title": "Ask why an order was rejected",
    "titleCn": "询问订单为什么被拒",
    "category": "Brokerage",
    "role": "Brokerage Support",
    "roleCn": "券商客服",
    "setup": "The platform rejected an order and displayed a short error message.",
    "setupCn": "平台拒绝了订单，并显示了一条简短错误信息。",
    "objective": "Ask whether the issue involves buying power, permissions, price limits, or account restrictions.",
    "objectiveCn": "询问问题是否涉及购买力、权限、价格限制或账户限制。",
    "summary": "Read the exact rejection message before changing the order.",
    "summaryCn": "在修改订单前先查看准确的拒绝信息。",
    "keywords": [
      "buying power",
      "margin account",
      "time in force"
    ],
    "complications": [
      {
        "en": "The account screen and order screen show different available amounts.",
        "cn": "账户页面和订单页面显示的可用金额不同。"
      },
      {
        "en": "The app displays only a short error code.",
        "cn": "App 只显示了一条简短错误代码。"
      },
      {
        "en": "The issue appeared after a recent transfer or corporate action.",
        "cn": "问题出现在近期转账或公司行动之后。"
      }
    ],
    "level": "B2"
  },
  {
    "id": "buying-power-lower",
    "title": "Ask why buying power is lower",
    "titleCn": "询问购买力为什么下降",
    "category": "Brokerage",
    "role": "Brokerage Support",
    "roleCn": "券商客服",
    "setup": "Your account value appears unchanged, but available buying power is lower.",
    "setupCn": "账户价值看起来没变，但可用购买力下降了。",
    "objective": "Ask about margin requirements, unsettled trades, and open orders.",
    "objectiveCn": "询问保证金要求、未结算交易和未成交订单。",
    "summary": "Buying power can differ from cash balance and can change with risk requirements.",
    "summaryCn": "购买力不同于现金余额，并会随风险要求变化。",
    "keywords": [
      "buying power",
      "margin",
      "settlement"
    ],
    "complications": [
      {
        "en": "The account screen and order screen show different available amounts.",
        "cn": "账户页面和订单页面显示的可用金额不同。"
      },
      {
        "en": "The app displays only a short error code.",
        "cn": "App 只显示了一条简短错误代码。"
      },
      {
        "en": "The issue appeared after a recent transfer or corporate action.",
        "cn": "问题出现在近期转账或公司行动之后。"
      }
    ],
    "level": "B2"
  },
  {
    "id": "margin-call",
    "title": "Discuss a margin call",
    "titleCn": "讨论追加保证金通知",
    "category": "Brokerage",
    "role": "Risk Representative",
    "roleCn": "风险部门客服",
    "setup": "The brokerage sent a margin deficiency notice after a volatile session.",
    "setupCn": "市场剧烈波动后，券商发来了保证金不足通知。",
    "objective": "Ask what deadline, amount, and possible account actions apply.",
    "objectiveCn": "询问适用的截止时间、金额和可能的账户措施。",
    "summary": "Do not assume positions will remain open while the deficiency is unresolved.",
    "summaryCn": "不要假设在保证金不足未解决时头寸一定会保持不变。",
    "keywords": [
      "margin call",
      "maintenance margin",
      "leverage"
    ],
    "complications": [
      {
        "en": "The account screen and order screen show different available amounts.",
        "cn": "账户页面和订单页面显示的可用金额不同。"
      },
      {
        "en": "The app displays only a short error code.",
        "cn": "App 只显示了一条简短错误代码。"
      },
      {
        "en": "The issue appeared after a recent transfer or corporate action.",
        "cn": "问题出现在近期转账或公司行动之后。"
      }
    ],
    "level": "B2"
  },
  {
    "id": "settlement-question",
    "title": "Ask about settlement timing",
    "titleCn": "询问结算时间",
    "category": "Brokerage",
    "role": "Brokerage Support",
    "roleCn": "券商客服",
    "setup": "You sold a position and want to know when the cash becomes settled.",
    "setupCn": "你卖出了一个头寸，想知道资金何时完成结算。",
    "objective": "Ask how settlement affects withdrawals and cash-account trading.",
    "objectiveCn": "询问结算如何影响提款和现金账户交易。",
    "summary": "Trade date and settlement date are different concepts.",
    "summaryCn": "交易日和结算日是不同概念。",
    "keywords": [
      "settlement",
      "settled cash",
      "cash account"
    ],
    "complications": [
      {
        "en": "The account screen and order screen show different available amounts.",
        "cn": "账户页面和订单页面显示的可用金额不同。"
      },
      {
        "en": "The app displays only a short error code.",
        "cn": "App 只显示了一条简短错误代码。"
      },
      {
        "en": "The issue appeared after a recent transfer or corporate action.",
        "cn": "问题出现在近期转账或公司行动之后。"
      }
    ],
    "level": "B2"
  },
  {
    "id": "pdt-warning",
    "title": "Ask about a day-trading warning",
    "titleCn": "询问日内交易警告",
    "category": "Brokerage",
    "role": "Brokerage Support",
    "roleCn": "券商客服",
    "setup": "The app displayed a pattern day trader warning before an order.",
    "setupCn": "App 在下单前显示了日内交易者规则警告。",
    "objective": "Ask what activity triggered it and what restrictions could follow.",
    "objectiveCn": "询问哪些活动触发了警告以及可能出现哪些限制。",
    "summary": "Rules can depend on account type, equity, and the number of day trades.",
    "summaryCn": "规则可能取决于账户类型、净值和日内交易次数。",
    "keywords": [
      "pattern day trader",
      "margin account",
      "day trade"
    ],
    "complications": [
      {
        "en": "The account screen and order screen show different available amounts.",
        "cn": "账户页面和订单页面显示的可用金额不同。"
      },
      {
        "en": "The app displays only a short error code.",
        "cn": "App 只显示了一条简短错误代码。"
      },
      {
        "en": "The issue appeared after a recent transfer or corporate action.",
        "cn": "问题出现在近期转账或公司行动之后。"
      }
    ],
    "level": "B2"
  },
  {
    "id": "corporate-action",
    "title": "Ask about a corporate action",
    "titleCn": "询问公司行动",
    "category": "Brokerage",
    "role": "Corporate Actions Team",
    "roleCn": "公司行动团队",
    "setup": "Your position changed after a split, merger, or symbol change.",
    "setupCn": "拆股、并购或代码变更后，你的头寸发生了变化。",
    "objective": "Ask how quantity, cost basis, and temporary symbols are handled.",
    "objectiveCn": "询问数量、成本基础和临时代码如何处理。",
    "summary": "Some account fields may update on different schedules.",
    "summaryCn": "部分账户字段可能在不同时间更新。",
    "keywords": [
      "stock split",
      "cost basis",
      "ticker symbol"
    ],
    "complications": [
      {
        "en": "The account screen and order screen show different available amounts.",
        "cn": "账户页面和订单页面显示的可用金额不同。"
      },
      {
        "en": "The app displays only a short error code.",
        "cn": "App 只显示了一条简短错误代码。"
      },
      {
        "en": "The issue appeared after a recent transfer or corporate action.",
        "cn": "问题出现在近期转账或公司行动之后。"
      }
    ],
    "level": "B2"
  },
  {
    "id": "cost-basis-error",
    "title": "Report a cost-basis issue",
    "titleCn": "报告成本基础问题",
    "category": "Brokerage",
    "role": "Tax Reporting Support",
    "roleCn": "税务报告客服",
    "setup": "The displayed cost basis does not match your records.",
    "setupCn": "显示的成本基础与你的记录不一致。",
    "objective": "Ask whether transfers, wash-sale adjustments, or missing lots explain the difference.",
    "objectiveCn": "询问转仓、洗售调整或缺失批次是否解释差异。",
    "summary": "Gather trade confirmations before requesting a correction.",
    "summaryCn": "申请更正前先整理交易确认单。",
    "keywords": [
      "cost basis",
      "realized gain",
      "settlement"
    ],
    "complications": [
      {
        "en": "The account screen and order screen show different available amounts.",
        "cn": "账户页面和订单页面显示的可用金额不同。"
      },
      {
        "en": "The app displays only a short error code.",
        "cn": "App 只显示了一条简短错误代码。"
      },
      {
        "en": "The issue appeared after a recent transfer or corporate action.",
        "cn": "问题出现在近期转账或公司行动之后。"
      }
    ],
    "level": "B2"
  },
  {
    "id": "beat-but-falls",
    "title": "Explain why a stock fell after an earnings beat",
    "titleCn": "解释财报超预期后为何下跌",
    "category": "Earnings",
    "role": "Earnings Analyst",
    "roleCn": "财报分析师",
    "setup": "Headline revenue and EPS beat estimates, but the stock fell after hours.",
    "setupCn": "营收和 EPS 表面上超预期，但股票盘后下跌。",
    "objective": "Ask whether guidance, margins, valuation, or expectations explain the reaction.",
    "objectiveCn": "询问指引、利润率、估值或预期是否解释市场反应。",
    "summary": "Markets react to the full report and prior expectations, not only headline beats.",
    "summaryCn": "市场会对完整财报和此前预期作出反应，而不只是表面超预期。",
    "keywords": [
      "earnings beat",
      "guidance",
      "market sentiment"
    ],
    "complications": [
      {
        "en": "The headline numbers look strong, but guidance is weaker.",
        "cn": "表面数字看起来很强，但指引较弱。"
      },
      {
        "en": "The company is using both GAAP and non-GAAP figures.",
        "cn": "公司同时使用 GAAP 和非 GAAP 数据。"
      },
      {
        "en": "The after-hours price is changing while management is speaking.",
        "cn": "管理层讲话期间，盘后价格仍在变化。"
      }
    ],
    "level": "B2"
  },
  {
    "id": "guidance-review",
    "title": "Review management guidance",
    "titleCn": "复盘管理层指引",
    "category": "Earnings",
    "role": "Earnings Analyst",
    "roleCn": "财报分析师",
    "setup": "Management issued a revenue range for the next quarter.",
    "setupCn": "管理层给出了下一季度营收区间。",
    "objective": "Ask how the midpoint compares with consensus and prior guidance.",
    "objectiveCn": "询问区间中点与一致预期和此前指引相比如何。",
    "summary": "Use the same fiscal period and currency assumptions when comparing guidance.",
    "summaryCn": "比较指引时应使用相同财务期间和货币假设。",
    "keywords": [
      "guidance",
      "analyst consensus",
      "revenue"
    ],
    "complications": [
      {
        "en": "The headline numbers look strong, but guidance is weaker.",
        "cn": "表面数字看起来很强，但指引较弱。"
      },
      {
        "en": "The company is using both GAAP and non-GAAP figures.",
        "cn": "公司同时使用 GAAP 和非 GAAP 数据。"
      },
      {
        "en": "The after-hours price is changing while management is speaking.",
        "cn": "管理层讲话期间，盘后价格仍在变化。"
      }
    ],
    "level": "B2"
  },
  {
    "id": "margin-compression",
    "title": "Discuss margin compression",
    "titleCn": "讨论利润率收缩",
    "category": "Earnings",
    "role": "Financial Analyst",
    "roleCn": "财务分析师",
    "setup": "Revenue grew, but operating margin declined.",
    "setupCn": "营收增长，但营业利润率下降。",
    "objective": "Ask whether costs, pricing, product mix, or investment caused the decline.",
    "objectiveCn": "询问成本、定价、产品组合或投资是否导致下降。",
    "summary": "Revenue growth and profit growth can diverge when margins change.",
    "summaryCn": "利润率变化时，营收增长和利润增长可能分化。",
    "keywords": [
      "operating margin",
      "gross margin",
      "revenue"
    ],
    "complications": [
      {
        "en": "The headline numbers look strong, but guidance is weaker.",
        "cn": "表面数字看起来很强，但指引较弱。"
      },
      {
        "en": "The company is using both GAAP and non-GAAP figures.",
        "cn": "公司同时使用 GAAP 和非 GAAP 数据。"
      },
      {
        "en": "The after-hours price is changing while management is speaking.",
        "cn": "管理层讲话期间，盘后价格仍在变化。"
      }
    ],
    "level": "B2"
  },
  {
    "id": "revenue-vs-eps",
    "title": "Compare revenue and EPS performance",
    "titleCn": "比较营收与 EPS 表现",
    "category": "Earnings",
    "role": "Earnings Analyst",
    "roleCn": "财报分析师",
    "setup": "Revenue missed slightly while EPS exceeded consensus.",
    "setupCn": "营收略低于预期，但 EPS 高于一致预期。",
    "objective": "Ask which expenses, buybacks, taxes, or mix affected EPS.",
    "objectiveCn": "询问哪些费用、回购、税收或业务组合影响了 EPS。",
    "summary": "EPS can improve even when revenue growth is weaker.",
    "summaryCn": "即使营收增长较弱，EPS 也可能改善。",
    "keywords": [
      "earnings per share",
      "revenue",
      "net income"
    ],
    "complications": [
      {
        "en": "The headline numbers look strong, but guidance is weaker.",
        "cn": "表面数字看起来很强，但指引较弱。"
      },
      {
        "en": "The company is using both GAAP and non-GAAP figures.",
        "cn": "公司同时使用 GAAP 和非 GAAP 数据。"
      },
      {
        "en": "The after-hours price is changing while management is speaking.",
        "cn": "管理层讲话期间，盘后价格仍在变化。"
      }
    ],
    "level": "B2"
  },
  {
    "id": "earnings-call-question",
    "title": "Prepare a question for an earnings call",
    "titleCn": "准备财报电话会问题",
    "category": "Earnings",
    "role": "Investor Relations Coach",
    "roleCn": "投资者关系教练",
    "setup": "You want to ask management a concise, neutral question.",
    "setupCn": "你想向管理层提出一个简洁、中性的提问。",
    "objective": "Turn a concern about growth or margins into a clear English question.",
    "objectiveCn": "把对增长或利润率的担忧转化为清晰的英文问题。",
    "summary": "Avoid embedding an unsupported conclusion in the question.",
    "summaryCn": "避免在问题中预设未经证实的结论。",
    "keywords": [
      "earnings call",
      "forward guidance",
      "gross margin"
    ],
    "complications": [
      {
        "en": "The headline numbers look strong, but guidance is weaker.",
        "cn": "表面数字看起来很强，但指引较弱。"
      },
      {
        "en": "The company is using both GAAP and non-GAAP figures.",
        "cn": "公司同时使用 GAAP 和非 GAAP 数据。"
      },
      {
        "en": "The after-hours price is changing while management is speaking.",
        "cn": "管理层讲话期间，盘后价格仍在变化。"
      }
    ],
    "level": "B2"
  },
  {
    "id": "preannouncement",
    "title": "Discuss an earnings preannouncement",
    "titleCn": "讨论财报预告",
    "category": "Earnings",
    "role": "Market Analyst",
    "roleCn": "市场分析师",
    "setup": "A company updated investors before the scheduled earnings date.",
    "setupCn": "公司在预定财报日期前更新了投资者。",
    "objective": "Ask what changed and why management disclosed it early.",
    "objectiveCn": "询问发生了什么变化以及管理层为何提前披露。",
    "summary": "Compare the new range with prior guidance and consensus.",
    "summaryCn": "将新区间与此前指引和一致预期比较。",
    "keywords": [
      "guidance",
      "earnings miss",
      "catalyst"
    ],
    "complications": [
      {
        "en": "The headline numbers look strong, but guidance is weaker.",
        "cn": "表面数字看起来很强，但指引较弱。"
      },
      {
        "en": "The company is using both GAAP and non-GAAP figures.",
        "cn": "公司同时使用 GAAP 和非 GAAP 数据。"
      },
      {
        "en": "The after-hours price is changing while management is speaking.",
        "cn": "管理层讲话期间，盘后价格仍在变化。"
      }
    ],
    "level": "B2"
  },
  {
    "id": "earnings-date",
    "title": "Confirm an earnings date",
    "titleCn": "确认财报日期",
    "category": "Earnings",
    "role": "Research Assistant",
    "roleCn": "研究助理",
    "setup": "Different websites show different earnings dates.",
    "setupCn": "不同网站显示了不同财报日期。",
    "objective": "Ask how to verify whether the date is confirmed or estimated.",
    "objectiveCn": "询问如何确认日期是正式公布还是估计。",
    "summary": "Company investor-relations materials are usually more authoritative than calendar aggregators.",
    "summaryCn": "公司投资者关系资料通常比聚合日历更权威。",
    "keywords": [
      "earnings call",
      "after-hours",
      "catalyst"
    ],
    "complications": [
      {
        "en": "The headline numbers look strong, but guidance is weaker.",
        "cn": "表面数字看起来很强，但指引较弱。"
      },
      {
        "en": "The company is using both GAAP and non-GAAP figures.",
        "cn": "公司同时使用 GAAP 和非 GAAP 数据。"
      },
      {
        "en": "The after-hours price is changing while management is speaking.",
        "cn": "管理层讲话期间，盘后价格仍在变化。"
      }
    ],
    "level": "B2"
  },
  {
    "id": "after-hours-reaction",
    "title": "Describe an after-hours earnings reaction",
    "titleCn": "描述财报后的盘后反应",
    "category": "Earnings",
    "role": "Market Commentator",
    "roleCn": "市场评论员",
    "setup": "A stock is moving quickly in after-hours trading after earnings.",
    "setupCn": "财报公布后，一只股票在盘后快速波动。",
    "objective": "Describe direction, percentage move, volume, and key reported figures.",
    "objectiveCn": "描述方向、涨跌幅、成交量和关键财报数字。",
    "summary": "After-hours prices can change rapidly because liquidity is thinner.",
    "summaryCn": "盘后流动性较薄，价格可能快速变化。",
    "keywords": [
      "after-hours",
      "volume",
      "bid-ask spread"
    ],
    "complications": [
      {
        "en": "The headline numbers look strong, but guidance is weaker.",
        "cn": "表面数字看起来很强，但指引较弱。"
      },
      {
        "en": "The company is using both GAAP and non-GAAP figures.",
        "cn": "公司同时使用 GAAP 和非 GAAP 数据。"
      },
      {
        "en": "The after-hours price is changing while management is speaking.",
        "cn": "管理层讲话期间，盘后价格仍在变化。"
      }
    ],
    "level": "B2"
  },
  {
    "id": "position-sizing",
    "title": "Discuss position sizing",
    "titleCn": "讨论仓位大小",
    "category": "Risk",
    "role": "Risk Manager",
    "roleCn": "风险经理",
    "setup": "You are considering a trade but want to limit the amount at risk.",
    "setupCn": "你正在考虑一笔交易，但想限制风险金额。",
    "objective": "Ask how account size, stop distance, and liquidity affect position size.",
    "objectiveCn": "询问账户规模、止损距离和流动性如何影响仓位大小。",
    "summary": "Position size should be derived from a defined risk limit, not excitement.",
    "summaryCn": "仓位大小应由明确风险上限决定，而不是由兴奋程度决定。",
    "keywords": [
      "position size",
      "stop loss",
      "liquidity risk"
    ],
    "complications": [
      {
        "en": "Volatility increased after the position was opened.",
        "cn": "建仓后波动率上升。"
      },
      {
        "en": "Several holdings are exposed to the same underlying factor.",
        "cn": "多个持仓暴露于同一底层风险因子。"
      },
      {
        "en": "The quoted price may not support the full position size.",
        "cn": "报价可能无法支持全部仓位规模。"
      }
    ],
    "level": "B2"
  },
  {
    "id": "stop-loss-discussion",
    "title": "Discuss a stop-loss plan",
    "titleCn": "讨论止损计划",
    "category": "Risk",
    "role": "Risk Manager",
    "roleCn": "风险经理",
    "setup": "A position is volatile and you need a clear exit rule.",
    "setupCn": "一个头寸波动很大，你需要明确的退出规则。",
    "objective": "Ask where the original thesis becomes invalid and how execution risk matters.",
    "objectiveCn": "询问原始逻辑在何处失效以及成交风险如何影响止损。",
    "summary": "A stop order does not guarantee the exact execution price.",
    "summaryCn": "止损触发单不保证按准确价格成交。",
    "keywords": [
      "stop loss",
      "slippage",
      "maximum drawdown"
    ],
    "complications": [
      {
        "en": "Volatility increased after the position was opened.",
        "cn": "建仓后波动率上升。"
      },
      {
        "en": "Several holdings are exposed to the same underlying factor.",
        "cn": "多个持仓暴露于同一底层风险因子。"
      },
      {
        "en": "The quoted price may not support the full position size.",
        "cn": "报价可能无法支持全部仓位规模。"
      }
    ],
    "level": "B2"
  },
  {
    "id": "risk-reward",
    "title": "Explain risk-reward ratio",
    "titleCn": "解释风险回报比",
    "category": "Risk",
    "role": "Trading Coach",
    "roleCn": "交易教练",
    "setup": "A setup offers a possible gain, but the downside is also meaningful.",
    "setupCn": "一个交易机会有潜在收益，但下行风险也明显。",
    "objective": "Ask how to state potential loss and gain in comparable units.",
    "objectiveCn": "询问如何用可比较单位表达潜在亏损和收益。",
    "summary": "A favorable ratio does not guarantee a high probability of success.",
    "summaryCn": "较好的风险回报比并不保证高成功概率。",
    "keywords": [
      "risk-reward ratio",
      "take profit",
      "stop loss"
    ],
    "complications": [
      {
        "en": "Volatility increased after the position was opened.",
        "cn": "建仓后波动率上升。"
      },
      {
        "en": "Several holdings are exposed to the same underlying factor.",
        "cn": "多个持仓暴露于同一底层风险因子。"
      },
      {
        "en": "The quoted price may not support the full position size.",
        "cn": "报价可能无法支持全部仓位规模。"
      }
    ],
    "level": "B2"
  },
  {
    "id": "concentration",
    "title": "Discuss concentration risk",
    "titleCn": "讨论集中度风险",
    "category": "Risk",
    "role": "Portfolio Risk Analyst",
    "roleCn": "投资组合风险分析师",
    "setup": "Most of a portfolio is exposed to the same technology theme.",
    "setupCn": "投资组合的大部分都暴露于同一科技主题。",
    "objective": "Ask how correlated positions can behave during a sector selloff.",
    "objectiveCn": "询问相关头寸在行业抛售中可能如何表现。",
    "summary": "Different tickers can still represent the same underlying risk factor.",
    "summaryCn": "不同股票代码仍可能代表相同底层风险因子。",
    "keywords": [
      "concentration risk",
      "correlation",
      "diversification"
    ],
    "complications": [
      {
        "en": "Volatility increased after the position was opened.",
        "cn": "建仓后波动率上升。"
      },
      {
        "en": "Several holdings are exposed to the same underlying factor.",
        "cn": "多个持仓暴露于同一底层风险因子。"
      },
      {
        "en": "The quoted price may not support the full position size.",
        "cn": "报价可能无法支持全部仓位规模。"
      }
    ],
    "level": "B2"
  },
  {
    "id": "portfolio-hedge",
    "title": "Discuss a portfolio hedge",
    "titleCn": "讨论投资组合对冲",
    "category": "Risk",
    "role": "Portfolio Manager",
    "roleCn": "投资组合经理",
    "setup": "You want to reduce downside exposure without necessarily selling every holding.",
    "setupCn": "你想降低下行风险，但不一定卖出所有持仓。",
    "objective": "Ask what risk is being hedged, for how long, and at what cost.",
    "objectiveCn": "询问要对冲什么风险、持续多久以及成本是多少。",
    "summary": "A hedge can reduce some risk while introducing cost and basis risk.",
    "summaryCn": "对冲可以降低部分风险，但也会带来成本和基差风险。",
    "keywords": [
      "hedging",
      "protective put",
      "beta"
    ],
    "complications": [
      {
        "en": "Volatility increased after the position was opened.",
        "cn": "建仓后波动率上升。"
      },
      {
        "en": "Several holdings are exposed to the same underlying factor.",
        "cn": "多个持仓暴露于同一底层风险因子。"
      },
      {
        "en": "The quoted price may not support the full position size.",
        "cn": "报价可能无法支持全部仓位规模。"
      }
    ],
    "level": "B2"
  },
  {
    "id": "leverage-risk",
    "title": "Explain leverage risk",
    "titleCn": "解释杠杆风险",
    "category": "Risk",
    "role": "Risk Manager",
    "roleCn": "风险经理",
    "setup": "A strategy creates exposure larger than the cash invested.",
    "setupCn": "一个策略产生的风险敞口大于投入现金。",
    "objective": "Ask how losses, margin requirements, and forced liquidation can be amplified.",
    "objectiveCn": "询问亏损、保证金要求和强制平仓如何被放大。",
    "summary": "Small market moves can create large account changes when leverage is high.",
    "summaryCn": "杠杆较高时，小幅市场变动也可能造成账户大幅变化。",
    "keywords": [
      "leverage",
      "margin call",
      "buying power"
    ],
    "complications": [
      {
        "en": "Volatility increased after the position was opened.",
        "cn": "建仓后波动率上升。"
      },
      {
        "en": "Several holdings are exposed to the same underlying factor.",
        "cn": "多个持仓暴露于同一底层风险因子。"
      },
      {
        "en": "The quoted price may not support the full position size.",
        "cn": "报价可能无法支持全部仓位规模。"
      }
    ],
    "level": "B2"
  },
  {
    "id": "drawdown-review",
    "title": "Review a portfolio drawdown",
    "titleCn": "复盘投资组合回撤",
    "category": "Risk",
    "role": "Portfolio Coach",
    "roleCn": "投资组合教练",
    "setup": "The portfolio has fallen meaningfully from its recent peak.",
    "setupCn": "投资组合从近期高点出现明显下跌。",
    "objective": "Ask how to distinguish normal volatility from a broken risk plan.",
    "objectiveCn": "询问如何区分正常波动和风险计划失效。",
    "summary": "Measure drawdown consistently and review which positions contributed most.",
    "summaryCn": "应一致地衡量回撤并复盘哪些头寸贡献最大。",
    "keywords": [
      "maximum drawdown",
      "benchmark",
      "asset allocation"
    ],
    "complications": [
      {
        "en": "Volatility increased after the position was opened.",
        "cn": "建仓后波动率上升。"
      },
      {
        "en": "Several holdings are exposed to the same underlying factor.",
        "cn": "多个持仓暴露于同一底层风险因子。"
      },
      {
        "en": "The quoted price may not support the full position size.",
        "cn": "报价可能无法支持全部仓位规模。"
      }
    ],
    "level": "B2"
  },
  {
    "id": "liquidity-risk",
    "title": "Discuss liquidity risk",
    "titleCn": "讨论流动性风险",
    "category": "Risk",
    "role": "Execution Specialist",
    "roleCn": "成交专家",
    "setup": "A position looks attractive, but daily trading activity is low.",
    "setupCn": "一个头寸看起来有吸引力，但日常交易活动较低。",
    "objective": "Ask how spread, depth, and size can affect entry and exit.",
    "objectiveCn": "询问价差、深度和订单规模如何影响进出场。",
    "summary": "Quoted prices may not support the full size of an order.",
    "summaryCn": "报价可能无法支持订单的全部数量。",
    "keywords": [
      "liquidity risk",
      "order book",
      "slippage"
    ],
    "complications": [
      {
        "en": "Volatility increased after the position was opened.",
        "cn": "建仓后波动率上升。"
      },
      {
        "en": "Several holdings are exposed to the same underlying factor.",
        "cn": "多个持仓暴露于同一底层风险因子。"
      },
      {
        "en": "The quoted price may not support the full position size.",
        "cn": "报价可能无法支持全部仓位规模。"
      }
    ],
    "level": "B2"
  },
  {
    "id": "analyst-upgrade",
    "title": "Discuss an analyst upgrade",
    "titleCn": "讨论分析师上调评级",
    "category": "News",
    "role": "Market News Editor",
    "roleCn": "市场新闻编辑",
    "setup": "A major firm upgraded a stock and raised its price target.",
    "setupCn": "一家大型机构上调了股票评级和目标价。",
    "objective": "Ask what changed in the analyst’s assumptions.",
    "objectiveCn": "询问分析师的哪些假设发生了变化。",
    "summary": "Focus on the reasoning, not only the new rating label.",
    "summaryCn": "重点关注理由，而不只是新的评级标签。",
    "keywords": [
      "analyst upgrade",
      "price target",
      "forward P/E"
    ],
    "complications": [
      {
        "en": "The original source has not issued an official confirmation.",
        "cn": "原始来源尚未发布正式确认。"
      },
      {
        "en": "A widely shared post is based on an older report.",
        "cn": "一条广泛传播的帖子基于较旧的报道。"
      },
      {
        "en": "The market reaction is larger than the confirmed information alone would suggest.",
        "cn": "市场反应幅度大于已确认信息本身所能解释的程度。"
      }
    ],
    "level": "B2"
  },
  {
    "id": "analyst-downgrade",
    "title": "Discuss an analyst downgrade",
    "titleCn": "讨论分析师下调评级",
    "category": "News",
    "role": "Market News Editor",
    "roleCn": "市场新闻编辑",
    "setup": "A stock fell after a downgrade citing valuation and slower growth.",
    "setupCn": "股票在因估值和增长放缓而被下调评级后下跌。",
    "objective": "Ask whether the downgrade changed estimates or only the valuation multiple.",
    "objectiveCn": "询问下调评级是否改变了预测，还是只改变估值倍数。",
    "summary": "Rating changes can reflect price movement as well as business changes.",
    "summaryCn": "评级变化既可能反映价格变化，也可能反映业务变化。",
    "keywords": [
      "analyst downgrade",
      "price target",
      "market sentiment"
    ],
    "complications": [
      {
        "en": "The original source has not issued an official confirmation.",
        "cn": "原始来源尚未发布正式确认。"
      },
      {
        "en": "A widely shared post is based on an older report.",
        "cn": "一条广泛传播的帖子基于较旧的报道。"
      },
      {
        "en": "The market reaction is larger than the confirmed information alone would suggest.",
        "cn": "市场反应幅度大于已确认信息本身所能解释的程度。"
      }
    ],
    "level": "B2"
  },
  {
    "id": "price-target-change",
    "title": "Explain a price-target change",
    "titleCn": "解释目标价变化",
    "category": "News",
    "role": "Equity Research Associate",
    "roleCn": "股票研究助理",
    "setup": "An analyst kept the same rating but changed the price target.",
    "setupCn": "分析师维持评级不变，但调整了目标价。",
    "objective": "Ask which forecast or valuation assumption moved.",
    "objectiveCn": "询问哪个预测或估值假设发生变化。",
    "summary": "A price target is an estimate, not a guaranteed future price.",
    "summaryCn": "目标价是估计值，不是保证的未来价格。",
    "keywords": [
      "price target",
      "analyst consensus",
      "catalyst"
    ],
    "complications": [
      {
        "en": "The original source has not issued an official confirmation.",
        "cn": "原始来源尚未发布正式确认。"
      },
      {
        "en": "A widely shared post is based on an older report.",
        "cn": "一条广泛传播的帖子基于较旧的报道。"
      },
      {
        "en": "The market reaction is larger than the confirmed information alone would suggest.",
        "cn": "市场反应幅度大于已确认信息本身所能解释的程度。"
      }
    ],
    "level": "B2"
  },
  {
    "id": "insider-sale",
    "title": "Discuss an insider sale",
    "titleCn": "讨论内部人士卖出",
    "category": "News",
    "role": "Research Analyst",
    "roleCn": "研究分析师",
    "setup": "A company executive disclosed a share sale.",
    "setupCn": "公司高管披露了一笔股票出售。",
    "objective": "Ask whether it was scheduled, how large it was, and what context is available.",
    "objectiveCn": "询问是否为预定交易、规模多大以及有哪些背景。",
    "summary": "An insider sale alone does not establish a negative business outlook.",
    "summaryCn": "单独一次内部人士卖出不能证明业务前景负面。",
    "keywords": [
      "insider buying",
      "shares outstanding",
      "market sentiment"
    ],
    "complications": [
      {
        "en": "The original source has not issued an official confirmation.",
        "cn": "原始来源尚未发布正式确认。"
      },
      {
        "en": "A widely shared post is based on an older report.",
        "cn": "一条广泛传播的帖子基于较旧的报道。"
      },
      {
        "en": "The market reaction is larger than the confirmed information alone would suggest.",
        "cn": "市场反应幅度大于已确认信息本身所能解释的程度。"
      }
    ],
    "level": "B2"
  },
  {
    "id": "sec-filing",
    "title": "Summarize a regulatory filing",
    "titleCn": "总结监管文件",
    "category": "News",
    "role": "Filings Researcher",
    "roleCn": "监管文件研究员",
    "setup": "A new filing contains several sections and legal language.",
    "setupCn": "一份新文件包含多个章节和法律术语。",
    "objective": "Ask which section contains the material change and how to summarize it neutrally.",
    "objectiveCn": "询问哪一部分包含重大变化，以及如何中性总结。",
    "summary": "Use the filing itself as the primary source when possible.",
    "summaryCn": "在可能情况下应以文件原文作为主要来源。",
    "keywords": [
      "catalyst",
      "shares outstanding",
      "forward guidance"
    ],
    "complications": [
      {
        "en": "The original source has not issued an official confirmation.",
        "cn": "原始来源尚未发布正式确认。"
      },
      {
        "en": "A widely shared post is based on an older report.",
        "cn": "一条广泛传播的帖子基于较旧的报道。"
      },
      {
        "en": "The market reaction is larger than the confirmed information alone would suggest.",
        "cn": "市场反应幅度大于已确认信息本身所能解释的程度。"
      }
    ],
    "level": "B2"
  },
  {
    "id": "merger-rumor",
    "title": "Discuss an unconfirmed merger rumor",
    "titleCn": "讨论未确认并购传闻",
    "category": "News",
    "role": "News Editor",
    "roleCn": "新闻编辑",
    "setup": "Social media is circulating a possible acquisition rumor.",
    "setupCn": "社交媒体正在传播可能的收购传闻。",
    "objective": "Ask what has actually been confirmed and how to label uncertainty.",
    "objectiveCn": "询问哪些内容已得到确认以及如何标注不确定性。",
    "summary": "Clearly separate reports, official statements, and speculation.",
    "summaryCn": "明确区分报道、官方声明和猜测。",
    "keywords": [
      "market sentiment",
      "catalyst",
      "volume"
    ],
    "complications": [
      {
        "en": "The original source has not issued an official confirmation.",
        "cn": "原始来源尚未发布正式确认。"
      },
      {
        "en": "A widely shared post is based on an older report.",
        "cn": "一条广泛传播的帖子基于较旧的报道。"
      },
      {
        "en": "The market reaction is larger than the confirmed information alone would suggest.",
        "cn": "市场反应幅度大于已确认信息本身所能解释的程度。"
      }
    ],
    "level": "B2"
  },
  {
    "id": "macro-impact",
    "title": "Explain how macro data affected stocks",
    "titleCn": "解释宏观数据如何影响股票",
    "category": "News",
    "role": "Market Strategist",
    "roleCn": "市场策略师",
    "setup": "Interest-rate expectations shifted after a new economic release.",
    "setupCn": "新经济数据公布后，利率预期发生变化。",
    "objective": "Ask how rates, valuation, and sector sensitivity connect.",
    "objectiveCn": "询问利率、估值和行业敏感度之间如何联系。",
    "summary": "The same macro event can affect sectors differently.",
    "summaryCn": "同一宏观事件可能对不同行业产生不同影响。",
    "keywords": [
      "market sentiment",
      "beta",
      "sector rotation"
    ],
    "complications": [
      {
        "en": "The original source has not issued an official confirmation.",
        "cn": "原始来源尚未发布正式确认。"
      },
      {
        "en": "A widely shared post is based on an older report.",
        "cn": "一条广泛传播的帖子基于较旧的报道。"
      },
      {
        "en": "The market reaction is larger than the confirmed information alone would suggest.",
        "cn": "市场反应幅度大于已确认信息本身所能解释的程度。"
      }
    ],
    "level": "B2"
  },
  {
    "id": "sentiment-shift",
    "title": "Describe a market sentiment shift",
    "titleCn": "描述市场情绪转变",
    "category": "News",
    "role": "Market Commentator",
    "roleCn": "市场评论员",
    "setup": "Price, volume, and news tone changed quickly during the session.",
    "setupCn": "交易时段内价格、成交量和新闻语气快速变化。",
    "objective": "Describe observable evidence before assigning a sentiment label.",
    "objectiveCn": "在给出情绪标签前先描述可观察证据。",
    "summary": "Sentiment is an interpretation and should be supported by data.",
    "summaryCn": "市场情绪是一种解释，应有数据支持。",
    "keywords": [
      "market sentiment",
      "bullish",
      "bearish"
    ],
    "complications": [
      {
        "en": "The original source has not issued an official confirmation.",
        "cn": "原始来源尚未发布正式确认。"
      },
      {
        "en": "A widely shared post is based on an older report.",
        "cn": "一条广泛传播的帖子基于较旧的报道。"
      },
      {
        "en": "The market reaction is larger than the confirmed information alone would suggest.",
        "cn": "市场反应幅度大于已确认信息本身所能解释的程度。"
      }
    ],
    "level": "B2"
  },
  {
    "id": "covered-call",
    "title": "Discuss a covered call",
    "titleCn": "讨论备兑看涨",
    "category": "Strategies",
    "role": "Options Strategist",
    "roleCn": "期权策略师",
    "setup": "You own shares and are considering selling a call against them.",
    "setupCn": "你持有股票，正在考虑卖出对应看涨期权。",
    "objective": "Ask about premium, upside cap, assignment, and expiration.",
    "objectiveCn": "询问权利金、上涨空间上限、指派和到期。",
    "summary": "The strategy generates premium but can limit gains above the strike.",
    "summaryCn": "该策略产生权利金，但可能限制行权价以上的收益。",
    "keywords": [
      "covered call",
      "assignment",
      "premium"
    ],
    "complications": [
      {
        "en": "One leg is much less liquid than the other.",
        "cn": "其中一条腿的流动性明显低于另一条腿。"
      },
      {
        "en": "The position is approaching expiration and assignment risk is changing.",
        "cn": "头寸接近到期，指派风险正在变化。"
      },
      {
        "en": "Implied volatility moved after the strategy was opened.",
        "cn": "建仓后隐含波动率发生了变化。"
      }
    ],
    "level": "B2"
  },
  {
    "id": "cash-secured-put",
    "title": "Discuss a cash-secured put",
    "titleCn": "讨论现金担保看跌",
    "category": "Strategies",
    "role": "Options Strategist",
    "roleCn": "期权策略师",
    "setup": "You are considering selling a put while reserving cash for assignment.",
    "setupCn": "你考虑卖出看跌期权并预留被指派所需现金。",
    "objective": "Ask about effective purchase price, downside, and assignment.",
    "objectiveCn": "询问有效买入价、下行风险和指派。",
    "summary": "Premium reduces the effective entry price but does not remove downside risk.",
    "summaryCn": "权利金降低有效买入价，但不会消除下行风险。",
    "keywords": [
      "cash-secured put",
      "assignment",
      "strike price"
    ],
    "complications": [
      {
        "en": "One leg is much less liquid than the other.",
        "cn": "其中一条腿的流动性明显低于另一条腿。"
      },
      {
        "en": "The position is approaching expiration and assignment risk is changing.",
        "cn": "头寸接近到期，指派风险正在变化。"
      },
      {
        "en": "Implied volatility moved after the strategy was opened.",
        "cn": "建仓后隐含波动率发生了变化。"
      }
    ],
    "level": "B2"
  },
  {
    "id": "protective-put",
    "title": "Discuss a protective put",
    "titleCn": "讨论保护性看跌",
    "category": "Strategies",
    "role": "Portfolio Strategist",
    "roleCn": "投资组合策略师",
    "setup": "You own shares and want defined downside protection for a period.",
    "setupCn": "你持有股票，希望在一段时间内获得明确下行保护。",
    "objective": "Ask about strike, expiration, cost, and remaining upside.",
    "objectiveCn": "询问行权价、到期日、成本和剩余上涨空间。",
    "summary": "Protection has a premium cost and expires at a specific time.",
    "summaryCn": "保护需要支付权利金，并会在特定时间到期。",
    "keywords": [
      "protective put",
      "premium",
      "expiration date"
    ],
    "complications": [
      {
        "en": "One leg is much less liquid than the other.",
        "cn": "其中一条腿的流动性明显低于另一条腿。"
      },
      {
        "en": "The position is approaching expiration and assignment risk is changing.",
        "cn": "头寸接近到期，指派风险正在变化。"
      },
      {
        "en": "Implied volatility moved after the strategy was opened.",
        "cn": "建仓后隐含波动率发生了变化。"
      }
    ],
    "level": "B2"
  },
  {
    "id": "vertical-spread",
    "title": "Compare a vertical spread",
    "titleCn": "比较垂直价差",
    "category": "Strategies",
    "role": "Options Strategist",
    "roleCn": "期权策略师",
    "setup": "You are comparing a single option with a defined-risk vertical spread.",
    "setupCn": "你在比较单腿期权和限定风险的垂直价差。",
    "objective": "Ask how maximum gain, maximum loss, and breakeven change.",
    "objectiveCn": "询问最大收益、最大亏损和盈亏平衡点如何变化。",
    "summary": "The second leg changes both cost and payoff limits.",
    "summaryCn": "第二条腿会同时改变成本和收益边界。",
    "keywords": [
      "vertical spread",
      "debit spread",
      "credit spread"
    ],
    "complications": [
      {
        "en": "One leg is much less liquid than the other.",
        "cn": "其中一条腿的流动性明显低于另一条腿。"
      },
      {
        "en": "The position is approaching expiration and assignment risk is changing.",
        "cn": "头寸接近到期，指派风险正在变化。"
      },
      {
        "en": "Implied volatility moved after the strategy was opened.",
        "cn": "建仓后隐含波动率发生了变化。"
      }
    ],
    "level": "B2"
  },
  {
    "id": "calendar-spread",
    "title": "Discuss a calendar spread",
    "titleCn": "讨论日历价差",
    "category": "Strategies",
    "role": "Options Strategist",
    "roleCn": "期权策略师",
    "setup": "Two options share a strike but have different expirations.",
    "setupCn": "两张期权行权价相同但到期日不同。",
    "objective": "Ask how time decay and volatility across expirations affect the position.",
    "objectiveCn": "询问不同到期日的时间损耗和波动率如何影响头寸。",
    "summary": "Calendar spreads are sensitive to both price location and term structure.",
    "summaryCn": "日历价差对价格位置和期限结构都较敏感。",
    "keywords": [
      "calendar spread",
      "theta",
      "term structure"
    ],
    "complications": [
      {
        "en": "One leg is much less liquid than the other.",
        "cn": "其中一条腿的流动性明显低于另一条腿。"
      },
      {
        "en": "The position is approaching expiration and assignment risk is changing.",
        "cn": "头寸接近到期，指派风险正在变化。"
      },
      {
        "en": "Implied volatility moved after the strategy was opened.",
        "cn": "建仓后隐含波动率发生了变化。"
      }
    ],
    "level": "B2"
  },
  {
    "id": "straddle-event",
    "title": "Discuss a straddle before an event",
    "titleCn": "讨论事件前跨式策略",
    "category": "Strategies",
    "role": "Options Strategist",
    "roleCn": "期权策略师",
    "setup": "An event may cause a large move, but direction is uncertain.",
    "setupCn": "一个事件可能造成大幅波动，但方向不确定。",
    "objective": "Ask what move the premium implies and how IV can change afterward.",
    "objectiveCn": "询问权利金隐含多大波动以及事件后 IV 如何变化。",
    "summary": "A large move may still be insufficient if the options were very expensive.",
    "summaryCn": "如果期权非常昂贵，即使大幅波动也可能仍不够。",
    "keywords": [
      "straddle",
      "implied volatility",
      "IV crush"
    ],
    "complications": [
      {
        "en": "One leg is much less liquid than the other.",
        "cn": "其中一条腿的流动性明显低于另一条腿。"
      },
      {
        "en": "The position is approaching expiration and assignment risk is changing.",
        "cn": "头寸接近到期，指派风险正在变化。"
      },
      {
        "en": "Implied volatility moved after the strategy was opened.",
        "cn": "建仓后隐含波动率发生了变化。"
      }
    ],
    "level": "B2"
  },
  {
    "id": "iron-condor",
    "title": "Discuss an iron condor",
    "titleCn": "讨论铁鹰策略",
    "category": "Strategies",
    "role": "Options Strategist",
    "roleCn": "期权策略师",
    "setup": "You expect a range-bound market and are reviewing a defined-risk premium strategy.",
    "setupCn": "你预期市场区间震荡，正在研究限定风险的权利金策略。",
    "objective": "Ask about profit range, wing width, assignment, and exit plan.",
    "objectiveCn": "询问盈利区间、翼宽、指派和退出计划。",
    "summary": "The strategy has limited reward and limited risk but can still lose near the wings.",
    "summaryCn": "该策略收益和风险都有限，但价格接近两翼时仍可能亏损。",
    "keywords": [
      "iron condor",
      "credit spread",
      "assignment"
    ],
    "complications": [
      {
        "en": "One leg is much less liquid than the other.",
        "cn": "其中一条腿的流动性明显低于另一条腿。"
      },
      {
        "en": "The position is approaching expiration and assignment risk is changing.",
        "cn": "头寸接近到期，指派风险正在变化。"
      },
      {
        "en": "Implied volatility moved after the strategy was opened.",
        "cn": "建仓后隐含波动率发生了变化。"
      }
    ],
    "level": "B2"
  },
  {
    "id": "roll-option",
    "title": "Discuss rolling an option",
    "titleCn": "讨论滚动期权",
    "category": "Strategies",
    "role": "Brokerage Representative",
    "roleCn": "券商客服",
    "setup": "An option position is near expiration and you are considering a roll.",
    "setupCn": "一个期权头寸接近到期，你在考虑滚动。",
    "objective": "Ask how to describe the closing leg, opening leg, net debit or credit, and new risk.",
    "objectiveCn": "询问如何描述平仓腿、开仓腿、净借记或贷记以及新风险。",
    "summary": "Rolling closes one position and opens another; it does not erase the original result.",
    "summaryCn": "滚动是平掉一个头寸并建立另一个头寸，不会抹去原头寸结果。",
    "keywords": [
      "roll an option",
      "expiration date",
      "premium"
    ],
    "complications": [
      {
        "en": "One leg is much less liquid than the other.",
        "cn": "其中一条腿的流动性明显低于另一条腿。"
      },
      {
        "en": "The position is approaching expiration and assignment risk is changing.",
        "cn": "头寸接近到期，指派风险正在变化。"
      },
      {
        "en": "Implied volatility moved after the strategy was opened.",
        "cn": "建仓后隐含波动率发生了变化。"
      }
    ],
    "level": "B2"
  }
];

  function buildNodes(item) {
    const keywordText = item.keywords.join(', ');
    return {
      start: {
        speaker: item.role,
        en: `Let’s work through “${item.title}.” What would you like to clarify first?`,
        cn: `我们来练习“${item.titleCn}”。你想先弄清楚什么？`,
        choices: [
          { en: item.objective, cn: item.objectiveCn, next: 'detail', score: 2 },
          { en: `Could you explain the key terms in simpler English first?`, cn: '你可以先用更简单的英语解释关键术语吗？', next: 'terms', score: 2 },
          { en: `I understand the topic, but I am not sure how to ask the question clearly.`, cn: '我理解这个主题，但不确定怎样清楚地提问。', next: 'rephrase', score: 1 }
        ]
      },
      terms: {
        speaker: item.role,
        en: `Start with these terms: ${keywordText}. Use them to describe the facts before giving an opinion.`,
        cn: `先从这些术语开始：${keywordText}。先用它们描述事实，再表达观点。`,
        choices: [
          { en: `Could you give me one practical example?`, cn: '你可以给我一个实际例子吗？', next: 'detail', score: 2 },
          { en: `Let me try to explain the situation in my own words.`, cn: '让我试着用自己的话解释这个情况。', next: 'summary', score: 2 }
        ]
      },
      rephrase: {
        speaker: item.role,
        en: `A clear version is: “${item.objective}” Keep the question specific and avoid assuming the conclusion.`,
        cn: `更清楚的说法是：“${item.objectiveCn}”让问题具体，同时不要预设结论。`,
        choices: [
          { en: item.objective, cn: item.objectiveCn, next: 'detail', score: 2 },
          { en: `What evidence should I mention before asking that question?`, cn: '提出这个问题前，我应该先提到哪些证据？', next: 'evidence', score: 2 }
        ]
      },
      detail: {
        speaker: item.role,
        en: item.summary,
        cn: item.summaryCn,
        choices: [
          { en: `What is the main risk or limitation in this interpretation?`, cn: '这种解释的主要风险或局限是什么？', next: 'risk', score: 2 },
          { en: `Which data point should I verify first?`, cn: '我应该先核实哪个数据点？', next: 'evidence', score: 2 },
          { en: `Let me summarize what I understood.`, cn: '让我总结一下我的理解。', next: 'summary', score: 2 }
        ]
      },
      evidence: {
        speaker: item.role,
        en: `Verify the primary source, the time period, and whether the numbers are directly comparable. Then separate confirmed facts from interpretation.`,
        cn: '核实第一手来源、时间周期，以及这些数字是否可以直接比较。然后把确认事实与解释区分开。',
        choices: [
          { en: `That makes sense. I will state the source and time period clearly.`, cn: '明白了。我会清楚说明来源和时间周期。', next: 'success', score: 2 },
          { en: `Could you help me phrase a cautious conclusion?`, cn: '你可以帮我用谨慎的方式表达结论吗？', next: 'cautious', score: 2 }
        ]
      },
      risk: {
        speaker: item.role,
        en: `The complication in this practice is: {complication}. Explain uncertainty and avoid treating one indicator as a complete answer.`,
        cn: `本次练习的突发情况是：{complicationCn}。请说明不确定性，不要把单一指标当作完整答案。`,
        choices: [
          { en: `I would describe this as one possible explanation, not a confirmed cause.`, cn: '我会把它描述为一种可能解释，而不是已确认原因。', next: 'success', score: 2 },
          { en: `I need more information before reaching a conclusion.`, cn: '在得出结论前，我还需要更多信息。', next: 'success', score: 2 },
          { en: `So this single indicator proves what will happen next.`, cn: '所以这个单一指标证明了接下来会发生什么。', next: 'partial', score: 0 }
        ]
      },
      summary: {
        speaker: item.role,
        en: `Go ahead. Use the structure: fact, interpretation, uncertainty, and next item to verify.`,
        cn: '请开始。使用这个结构：事实、解释、不确定性、下一项需要核实的内容。',
        choices: [
          { en: `The confirmed fact is clear, but the cause is still uncertain. I would verify the primary data before making a stronger claim.`, cn: '已确认事实很清楚，但原因仍不确定。我会先核实第一手数据，再作更强结论。', next: 'success', score: 2 },
          { en: `The market moved, so the explanation must be correct.`, cn: '市场已经波动了，所以这个解释一定正确。', next: 'partial', score: 0 }
        ]
      },
      cautious: {
        speaker: item.role,
        en: `Try: “The available information suggests this may be a factor, but the evidence is not sufficient to treat it as the only cause.”`,
        cn: '可以这样说：“现有信息表明这可能是一个因素，但证据不足以把它视为唯一原因。”',
        choices: [
          { en: `Thanks. I will use that wording and identify what still needs verification.`, cn: '谢谢。我会使用这种表述，并指出仍需核实的内容。', next: 'success', score: 2 }
        ]
      },
      success: {
        speaker: 'System',
        en: `Completed: ${item.title}. You used cautious, evidence-based market English.`,
        cn: `完成：${item.titleCn}。你使用了谨慎、基于证据的市场英语。`,
        outcome: 'success'
      },
      partial: {
        speaker: 'System',
        en: `Partial completion: ${item.title}. Review how to separate facts, interpretation, and uncertainty.`,
        cn: `部分完成：${item.titleCn}。请复习如何区分事实、解释和不确定性。`,
        outcome: 'partial'
      }
    };
  }

  window.MARKET_VOCAB = vocabulary;
  window.MARKET_SCENARIOS = scenarioDefinitions.map((item) => ({ ...item, startNode: 'start', nodes: buildNodes(item) }));
})();
