{
  "type": "bubble",
  "size": "kilo",
  "hero": {
      "type": "image",
      "url": "https://img.freepik.com/free-vector/colorful-palm-silhouettes-background_23-2148541792.jpg?size=626&ext=jpg",
      "size": "full",
      "aspectRatio": "20:13",
      "aspectMode": "cover",
      "action": {
          "type": "uri",
          "uri": "https://www.google.com/"
      }
  },
  "body": {
      "type": "box",
      "layout": "vertical",
      "contents": [
          {
              "type": "text",
              "text": "vidId",
              "weight": "bold",
              "size": "xl",
              "align": "center"
          },
          {
              "type": "box",
              "layout": "vertical",
              "margin": "lg",
              "spacing": "sm",
              "contents": [
                  {
                      "type": "box",
                      "layout": "baseline",
                      "spacing": "sm",
                      "contents": [
                          {
                              "type": "text",
                              "text": "演員",
                              "color": "#aaaaaa",
                              "size": "md",
                              "flex": 5,
                              "align": "center"
                          },
                          {
                              "type": "text",
                              "text": "casts",
                              "color": "#666666",
                              "size": "md",
                              "flex": 5,
                              "align": "center",
                              "wrap": true
                          }
                      ]
                  },
                  {
                      "type": "box",
                      "layout": "baseline",
                      "spacing": "sm",
                      "contents": [
                          {
                              "type": "text",
                              "text": "發行日",
                              "color": "#aaaaaa",
                              "size": "md",
                              "flex": 5,
                              "align": "center"
                          },
                          {
                              "type": "text",
                              "text": "releaseDate",
                              "color": "#666666",
                              "size": "md",
                              "flex": 5,
                              "align": "center",
                              "wrap": true
                          }
                      ]
                  }
              ]
          }
      ]
  },
  "footer": {
      "type": "box",
      "layout": "vertical",
      "spacing": "sm",
      "contents": [
          {
              "type": "button",
              "style": "link",
              "height": "sm",
              "action": {
                  "type": "uri",
                  "label": "預告片",
                  "uri": "https://www.google.com/"
              }
          },
          {
              "type": "button",
              "style": "link",
              "height": "sm",
              "action": {
                  "type": "uri",
                  "label": "片源 1",
                  "uri": "https://www.google.com/"
              }
          },
          {
              "type": "button",
              "style": "link",
              "height": "sm",
              "action": {
                  "type": "uri",
                  "label": "片源 2",
                  "uri": "https://www.google.com/"
              }
          },
          {
              "type": "button",
              "style": "link",
              "height": "sm",
              "action": {
                  "type": "message",
                  "label": "❤ 我喜歡，收藏！",
                  "text": "收藏"
              }
          },
          {
              "type": "button",
              "style": "link",
              "height": "sm",
              "action": {
                  "type": "message",
                  "label": "👎 不喜歡，再抽！",
                  "text": "抽"
              }
          },
          {
              "type": "button",
              "style": "link",
              "height": "sm",
              "action": {
                  "type": "message",
                  "label": "😍 列出我的收藏！",
                  "text": "我的收藏"
              }
          },
          {
              "type": "spacer",
              "size": "sm"
          }
      ],
      "flex": 0
  }
}