# LINE 機器人：欸你今天要看哪片

## 功能

- 使用者可以從 JavLibrary 的「高評價」區隨機抽取番號。
- 使用者可以針對每一個番號進行「收藏」或「觀看預覽」。

## 待實現功能

- [x] 列出 Fanza 的每月 Top 10。
- [ ] 列出 Fanza 的 Top 10 新人。
- [ ] 使用者提示選單。
- [ ] 每月自動從 JavLibrary 更新番號。
- [ ] 設定目前機器人抽片的類型。
- [ ] 推薦系統。
- [ ] 後臺系統。
- [x] 十連抽。
- [x] 收藏女優。

## 待改善設計

- [ ] 女優作品改為 Flex Carousel 呈現。

### 後臺系統

#### JSON 範例

```json
{
  "displayName": "西格馬",
  "profileUrl": "https://sprofile.line-scdn.net/...",
  "target": "IPX-439",
  "action": "sendRandomVideo",
  "boneredAt": "2021-10-13 22:52:25"
}
```

#### 後臺顯示範例

```
2021-10-13:
[大頭貼] 西格馬在 22:52:25 時抽了 IPX-439 這個編號的片片！
```
