# Daily English Lab · US Life English Simulator

A local-first English learning website for real-life U.S. daily situations. It can be deployed directly to GitHub Pages and does not require a backend, login, database, or paid API.

## V6 Highlights

- Expanded Scenario Mode from 11 places / 160 errands to **22 places / 311 errands**.
- Added more daily-life simulations: Hotel, Cafe, Hair Salon, Gas Station / Auto Service, Campus Office, Library, Public Transit, Phone / Internet Provider, Vet / Pet Clinic, Dentist Office, and Insurance Office.
- Kept the V5 desktop flow: setup, Situation Card, Live Dialogue, Transcript.
- Kept the softer low-saturation Pink Mode.
- Fully static and GitHub Pages compatible.

## Existing Features

- Daily Practice / 今日学习
- Expression Library / 表达库
- Scenario Mode / 场景模拟
- Quick Quiz / 口语测验
- Favorites / 收藏
- Progress tracking / 学习进度
- LocalStorage-based progress
- Export/import progress JSON

## Scenario Coverage

The V6 scenario data includes 22 real-life places and 311 errands:

- DMV / 车管所
- Bank / 银行
- Clinic / 诊所/医院前台
- Restaurant / 餐馆
- Supermarket / 超市
- Gym / 健身房
- Pharmacy / 药店
- Apartment Office / 公寓/租房办公室
- Airport / 机场
- Post Office / 邮局
- Customer Service / 客服电话/客服柜台
- Hotel / 酒店
- Cafe / 咖啡店
- Hair Salon / 理发店/美发店
- Gas Station / Auto Service / 加油站/汽车服务
- Campus Office / 学校办公室
- Library / 图书馆
- Public Transit / 公共交通
- Phone / Internet Provider / 手机/网络运营商
- Vet / Pet Clinic / 兽医/宠物医院
- Dentist Office / 牙科诊所
- Insurance Office / 保险公司/保险经纪

## Deploy to GitHub Pages

Upload the project files to the repository root:

```text
index.html
styles.css
app.js
data/
README.md
.nojekyll
.gitignore
```

Then use either:

1. **Settings → Pages → Deploy from a branch → main / root**, or
2. A GitHub Actions Pages workflow.

