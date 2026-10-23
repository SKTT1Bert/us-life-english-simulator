# 场景图片需求与生成记录

本轮用户明确授权由 Codex 直接生成图片。复用原有 7 张插画，为缺少图片的 15 个生活场所各补充 1 张；同一张图同时用于看图识词、对话模拟和场景选择卡片，不为两种学习模式重复生图。

所有图像目标尺寸为 1536 × 1024，横向 3:2，不透明背景。延续现有自然、温暖的半写实生活场景插画；成人角色、清晰可识别的学习物品、柔和日光和木色／米色／低饱和蓝绿色。图片内不生成词语标签、可读个人资料、品牌或水印。词语、音标和热点由网页呈现。

| 场景 | 发布路径 | 完整英文 Prompt |
| --- | --- | --- |
| 车管所 | `assets/dmv.webp` | [公共办事与校园](image-prompts-civic.md#dmv) |
| 银行 | `assets/bank.webp` | [公共办事与校园](image-prompts-civic.md#bank) |
| 邮局 | `assets/post-office.webp` | [公共办事与校园](image-prompts-civic.md#post-office) |
| 学校办公室 | `assets/campus-office.webp` | [公共办事与校园](image-prompts-civic.md#campus-office) |
| 图书馆 | `assets/library.webp` | [公共办事与校园](image-prompts-civic.md#library) |
| 健身房 | `assets/gym.webp` | [健康与个人服务](image-prompts-care.md) |
| 药店 | `assets/pharmacy.webp` | [健康与个人服务](image-prompts-care.md) |
| 美发店 | `assets/hair-salon.webp` | [健康与个人服务](image-prompts-care.md) |
| 宠物医院 | `assets/vet-pet-clinic.webp` | [健康与个人服务](image-prompts-care.md) |
| 牙科诊所 | `assets/dentist.webp` | [健康与个人服务](image-prompts-care.md) |
| 公寓办公室 | `assets/apartment.webp` | [生活服务与交通](image-prompts-services.md) |
| 客服柜台 | `assets/customer-service.webp` | [生活服务与交通](image-prompts-services.md) |
| 公共交通 | `assets/public-transit.webp` | [生活服务与交通](image-prompts-services.md) |
| 手机与网络 | `assets/phone-internet.webp` | [生活服务与交通](image-prompts-services.md) |
| 保险办公室 | `assets/insurance-office.webp` | [生活服务与交通](image-prompts-services.md) |

生成后按实际物品位置标注热点；预约、租约等无法从物品外观直接确认的概念可作为场景延伸词。发布图使用 WebP 压缩，保留原始构图和尺寸；列表使用 `assets/thumbnails/` 中的缩略图，避免浏览场景时加载全部大图。
