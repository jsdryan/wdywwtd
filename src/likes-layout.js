{
	"type": "bubble",
	"size": "kilo",
	"body": {
		"type": "box",
		"layout": "vertical",
		"contents": [
				{
					"type": "box",
					"layout": "baseline",
					"margin": "md",
					"contents": [
							{
								"type": "text",
								"text": "番號",
								"size": "md",
								"margin": "none",
								"flex": 5,
								"weight": "bold",
								"align": "center",
								"decoration": "none"
							},
							{
								"type": "text",
								"text": "查看",
								"size": "md",
								"margin": "none",
								"flex": 5,
								"align": "center",
								"offsetStart": "md",
								"weight": "bold",
								"decoration": "none"
							},
							{
								"type": "text",
								"text": "移除",
								"size": "md",
								"margin": "none",
								"flex": 5,
								"align": "center",
								"offsetStart": "md",
								"weight": "bold",
								"decoration": "none"
							}
					]
				},
				{
					"type": "box",
					"layout": "vertical",
					"margin": "xxl",
					"spacing": "md",
					"contents": [
						{
							"type": "box",
							"layout": "baseline",
							"margin": "xxl",
							"contents": [
									{
										"type": "text",
										"text": "value.likes",
										"size": "sm",
										"color": "#999999",
										"margin": "none",
										"flex": 5,
										"align": "center",
										"decoration": "none"
									},
									{
										"type": "text",
										"text": "查看",
										"size": "sm",
										"color": "#007bff",
										"margin": "none",
										"flex": 5,
										"align": "center",
										"offsetStart": "md",
										"decoration": "none",
										"action": {
											"type": "message",
											"label": "action",
											"text": "value.likes"
										}
									},
									{
										"type": "text",
										"size": "sm",
										"color": "#dc3545",
										"margin": "none",
										"flex": 5,
										"align": "center",
										"offsetStart": "md",
										"decoration": "none",
										"text": "移除",
										"action": {
											"type": "message",
											"label": "action",
											"text": "remove"
										}
									}
							],
							"action": {
								"type": "message",
								"label": "action",
								"text": "et"
							}
						}
					]
				}
		]
	}
}