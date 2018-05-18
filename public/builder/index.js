function init(){
    return new Vue({
      el: '#formBuildWrapper',
      data: {

        renderConfig: {
            locale: "zh-cn",
            title: {
             "zh-cn": "formtitle"
            },
            pages: [
             {
              name: "page1",
              elements: [
               {
                type: "text",
                name: "inputName",
                width: "100%",
                indent: 2,
                title: {
                 "zh-cn": "input"
                },
                commentText: {
                 "zh-cn": "建议文字"
                },
                valueName: "inputValueName",
                isRequired: true,
                requiredErrorText: {
                 "zh-cn": "请输入文本"
                },
                maxLength: 10,
                placeHolder: {
                 "zh-cn": "inputPlaceHolder"
                }
               },
               {
                type: "dropdown",
                name: "dropdownName",
                width: "200",
                indent: 2,
                title: {
                 "zh-cn": "dropdown"
                },
                description: {
                 "zh-cn": "描述"
                },
                valueName: "dropdownValueName",
                isRequired: true,
                requiredErrorText: {
                 "zh-cn": "请选择一项"
                },
                titleLocation: "left",
                choices: [
                 {
                  value: "item1",
                  text: {
                   "zh-cn": "选项1"
                  }
                 },
                 {
                  value: "item2",
                  text: {
                   "zh-cn": "选项2"
                  }
                 },
                 {
                  value: "item3",
                  text: {
                   "zh-cn": "选项3"
                  }
                 }
                ],
                otherText: {
                 "zh-cn": "填写其他答案哦"
                },
                otherErrorText: {
                 "zh-cn": "填写其他答案啊"
                },
                optionsCaption: {
                 "zh-cn": "dropdownCaption"
                }
               },
               {
                type: "comment",
                name: "textareaName",
                title: {
                 "zh-cn": "textarea标题"
                },
                valueName: "textareaName",
                enableIf: "{question1} = 'value1' or ({question2} * {question4} > 20",
                isRequired: true,
                requiredErrorText: {
                 "zh-cn": "请输入合法的值"
                },
                validators: [
                 {
                  type: "regex",
                  text: "请输入数字",
                  regex: "^[0-9]*$"
                 },
                 {
                  type: "numeric",
                  text: "请输入1-10的数字",
                  minValue: 1,
                  maxValue: 10
                 }
                ],
                titleLocation: "top",
                maxLength: 10,
                cols: 26,
                placeHolder: {
                 "zh-cn": "placeholder"
                }
               }
              ]
             }
            ]
           },

      },
      created(){
        
      },
      methods: {

      }
    })
  }
  
    init();
  