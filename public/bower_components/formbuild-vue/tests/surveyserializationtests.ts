import { SurveyModel } from "../src/survey";
import { JsonObject } from "../src/jsonobject";
import { PageModel } from "../src/page";
import { QuestionTextModel } from "../src/question_text";
import { QuestionCheckboxModel } from "../src/question_checkbox";
import { Question } from "../src/question";
import {
  QuestionMultipleTextModel,
  MultipleTextItemModel
} from "../src/question_multipletext";
import { QuestionDropdownModel } from "../src/question_dropdown";
import {
  QuestionMatrixDropdownModelBase,
  MatrixDropdownColumn
} from "../src/question_matrixdropdownbase";
import { ItemValue } from "../src/itemvalue";
import { NumericValidator } from "../src/validator";

export default QUnit.module("SurveySerialization");

QUnit.test("Serialize two pages", function(assert) {
  var survey = new SurveyModel();
  survey.addNewPage("Page 1");
  survey.addNewPage("Page 2");
  var jsObj = new JsonObject().toJsonObject(survey);
  assert.equal(
    JSON.stringify(jsObj),
    '{"pages":[{"name":"Page 1"},{"name":"Page 2"}]}',
    "serialize two pages"
  );
});
QUnit.test("Deserialize two pages", function(assert) {
  var survey = new SurveyModel();
  new JsonObject().toObject(
    { pages: [{ name: "Page1" }, { name: "Page2" }] },
    survey
  );
  assert.equal(survey.pages.length, 2, "Two pages from json");
  assert.equal(survey.pages[0].name, "Page1", "property name is set");
  assert.equal(survey.pages[0].data, survey, "data interface is set");
  assert.equal(survey.pages[1].getType(), "page", "it is a live object");
});
QUnit.test("Serialize two questions", function(assert) {
  var page = new PageModel("Page1");
  var textQuestion = new QuestionTextModel("textQuestion");
  textQuestion.isRequired = true;
  var checkBoxQuestion = new QuestionCheckboxModel("checkboxQuestion");
  checkBoxQuestion.choices = ["red", "white"];
  checkBoxQuestion.isRequired = true;
  checkBoxQuestion.hasComment = true;
  page.addQuestion(textQuestion);
  page.addQuestion(checkBoxQuestion);
  var jsObj = new JsonObject().toJsonObject(page);
  assert.equal(
    JSON.stringify(jsObj),
    '{"name":"Page1","elements":[{"type":"text","name":"textQuestion","isRequired":true},{"type":"checkbox","name":"checkboxQuestion","isRequired":true,"hasComment":true,"choices":["red","white"]}]}',
    "serialize two questions"
  );
});
QUnit.test("Deserialize two questions", function(assert) {
  var survey = new SurveyModel();
  var page = new PageModel("Page1");
  survey.addPage(page);
  new JsonObject().toObject(
    {
      questions: [
        { type: "text", name: "textQuestion", isRequired: "true" },
        {
          type: "checkbox",
          name: "checkboxQuestion",
          isRequired: "true",
          choices: ["red", "white"]
        }
      ]
    },
    page
  );
  var checkbox: any = page.questions[1];
  assert.equal(page.questions.length, 2, "Two questions from json");
  assert.equal(page.questions[0].name, "textQuestion", "property name is set");
  assert.equal(page.questions[1].getType(), "checkbox", "it is a live object");
  assert.equal(
    checkbox.choices.length,
    2,
    "property choices is set correctly: length"
  );
  assert.equal(
    checkbox.choices[0].value,
    "red",
    "property choices is set correctly: value"
  );
  assert.equal(
    checkbox.choices[0].text,
    "red",
    "property choices is set correctly: text"
  );
  assert.equal(
    checkbox.choices[1].value,
    "white",
    "property choices is set correctly: value"
  );
  assert.equal(
    checkbox.choices[1].text,
    "white",
    "property choices is set correctly: text"
  );
  survey.setValue("textQuestion", "newValue");
  assert.equal(
    (<Question>page.questions[0]).value,
    "newValue",
    "data interface is working"
  );
});
QUnit.test("Full survey deserialize with one question", function(assert) {
  var survey = new SurveyModel();
  new JsonObject().toObject(
    {
      pages: [
        {
          name: "page1",
          questions: [
            { type: "text", name: "textQuestion", isRequired: "true" },
            {
              type: "checkbox",
              name: "checkboxQuestion",
              isRequired: "true",
              choices: ["red", "white"]
            }
          ]
        }
      ]
    },
    survey
  );
  survey.setValue("textQuestion", "newValue");
  assert.equal(
    (<Question>survey.pages[0].questions[0]).value,
    "newValue",
    "data interface is working"
  );
});
QUnit.test(
  "Full survey deserialize with one question bypass pages object",
  function(assert) {
    var survey = new SurveyModel();
    new JsonObject().toObject(
      {
        questions: [
          { type: "text", name: "textQuestion", isRequired: "true" },
          {
            type: "checkbox",
            name: "checkboxQuestion",
            isRequired: "true",
            choices: ["red", "white"]
          }
        ]
      },
      survey
    );
    survey.setValue("textQuestion", "newValue");
    assert.equal(
      (<Question>survey.pages[0].questions[0]).value,
      "newValue",
      "data interface is working"
    );
  }
);
QUnit.test(
  "Full survey deserialize with one element bypass pages object",
  function(assert) {
    var survey = new SurveyModel();
    new JsonObject().toObject(
      {
        elements: [
          { type: "text", name: "textQuestion", isRequired: "true" },
          {
            type: "checkbox",
            name: "checkboxQuestion",
            isRequired: "true",
            choices: ["red", "white"]
          }
        ]
      },
      survey
    );
    survey.setValue("textQuestion", "newValue");
    assert.equal(
      (<Question>survey.pages[0].elements[0]).value,
      "newValue",
      "data interface is working"
    );
  }
);
QUnit.test("Serialize survey data", function(assert) {
  var survey = new SurveyModel();
  survey.setValue("question1", "value1");
  survey.setValue("question2", true);
  survey.setValue("question3", ["red", "white"]);
  var data = survey.data;
  var expectedData = {
    question1: "value1",
    question2: true,
    question3: ["red", "white"]
  };
  assert.deepEqual(data, expectedData, "check if get data works correctly");
});
QUnit.test("Deserialize survey data", function(assert) {
  var survey = new SurveyModel();
  var data = {
    question1: "value1",
    question2: true,
    question3: ["red", "white"]
  };
  survey.data = data;
  assert.equal(
    survey.getValue("question1"),
    "value1",
    "survey data for question 1"
  );
  assert.equal(
    survey.getValue("question2"),
    true,
    "survey data for question 2"
  );
  assert.deepEqual(
    survey.getValue("question3"),
    ["red", "white"],
    "survey data for question 3"
  );
});
QUnit.test("Serialize mutltiple text question", function(assert) {
  var mtQuestion = new QuestionMultipleTextModel("q1");
  mtQuestion.items.push(new MultipleTextItemModel("item1"));
  mtQuestion.items.push(new MultipleTextItemModel("item2", "text2"));
  var jsObj = new JsonObject().toJsonObject(mtQuestion);
  assert.equal(
    JSON.stringify(jsObj),
    '{"name":"q1","items":[{"name":"item1"},{"name":"item2","title":"text2"}]}',
    "serialize multiple text question"
  );
});
QUnit.test("Serialize restfull choices", function(assert) {
  var question = new QuestionDropdownModel("q1");
  question.choicesByUrl.path = "name";
  var jsObj = new JsonObject().toJsonObject(question);
  assert.equal(
    JSON.stringify(jsObj),
    '{"name":"q1","choicesByUrl":{"path":"name"}}',
    "serialize choicesByUrl"
  );
});
QUnit.test("Deserialize question with missing name", function(assert) {
  var survey = new SurveyModel();
  var jsonObj = new JsonObject();
  jsonObj.toObject(
    {
      questions: [{ type: "text", isRequired: "true" }]
    },
    survey
  );
  assert.equal(
    survey.pages[0].questions.length,
    1,
    "one question is deserialize."
  );
  assert.equal(jsonObj.errors.length, 1, "one serialization error");
  assert.equal(
    jsonObj.errors[0].type,
    "requiredproperty",
    "The required property error"
  );
});
QUnit.test("Deserialize choicesByUrl", function(assert) {
  var question = new QuestionDropdownModel("q1");
  assert.equal(
    question.choicesByUrl.isEmpty,
    true,
    "It is created, but no data"
  );
  var jsonObj = new JsonObject();
  jsonObj.toObject(
    {
      type: "dropdown",
      name: "country",
      choicesByUrl: {
        url: "http://services.groupkt.com/country/get/all",
        path: "RestResponse;result"
      }
    },
    question
  );
  assert.equal(
    question.choicesByUrl.getType(),
    "choicesByUrl",
    "It is the real object"
  );
  assert.equal(question.choicesByUrl.isEmpty, false, "There are data");
  assert.equal(
    question.choicesByUrl.path,
    "RestResponse;result",
    "data is copied correctly"
  );
});
QUnit.test("MatrixDropdown serialize and deserialize", function(assert) {
  var matrix = new QuestionMatrixDropdownModelBase("q1");
  matrix.columns.push(new MatrixDropdownColumn("col1"));
  matrix.columns.push(new MatrixDropdownColumn("col2"));
  var json = new JsonObject().toJsonObject(matrix);
  var matrix2 = new QuestionMatrixDropdownModelBase("q2");
  matrix2.columns.push(new MatrixDropdownColumn("col3"));
  new JsonObject().toObject(json, matrix2);
  assert.equal(matrix2.columns.length, 2, "There are two columns");
  assert.equal(matrix2.columns[0].name, "col1", "Name is correct");
  assert.equal(
    matrix2.columns[0].getType(),
    "matrixdropdowncolumn",
    "Name is correct"
  );
});

QUnit.test("Survey serialize dropdown.choices localization", function(assert) {
  var survey = new SurveyModel();
  var page = survey.addNewPage("page1");
  var q1 = <QuestionDropdownModel>page.addNewQuestion("dropdown", "question1");
  q1.choices = ["val1"];
  q1.choices[0].text = "text1";
  survey.locale = "de";
  q1.choices[0].text = "de-text1";
  survey.locale = "";
  var json = new JsonObject().toJsonObject(survey);
  var checkedJson = {
    pages: [
      {
        name: "page1",
        elements: [
          {
            type: "dropdown",
            choices: [
              { value: "val1", text: { default: "text1", de: "de-text1" } }
            ],
            name: "question1"
          }
        ]
      }
    ]
  };
  assert.deepEqual(json, checkedJson, "Jsons should be the same");
});

QUnit.test("Survey deserialize checkbox.choices localization", function(
  assert
) {
  //{ pages: [{elements: [], name: "page1"}]}
  var question = new QuestionCheckboxModel("q1");
  var jsonObj = new JsonObject();
  jsonObj.toObject(
    { type: "checkbox", choices: [{ value: "2", text: { de: "item" } }] },
    question
  );
  assert.equal(
    (<ItemValue>question.choices[0]).text,
    "2",
    "The default locale is 2"
  );
  assert.equal(
    (<ItemValue>question.choices[0]).locText.getLocaleText("de"),
    "item",
    "The de locale is item"
  );
});

QUnit.test("Survey deserialize/serialize localization survey", function(
  assert
) {
  var survey = new SurveyModel();
  var origionalJson = {
    pages: [
      {
        elements: [
          {
            type: "checkbox",
            choices: [{ value: "2", text: { de: "second item" } }],
            name: "question1"
          }
        ],
        name: "page1"
      }
    ]
  };
  new JsonObject().toObject(origionalJson, survey);

  var newJsonObj = new JsonObject().toJsonObject(survey);
  assert.deepEqual(
    newJsonObj,
    origionalJson,
    "Two json objects should be equal"
  );
});

QUnit.test(
  "Survey deserialize dynamic matrix with different locale, Issue #507",
  function(assert) {
    var survey = new SurveyModel({
      pages: [
        {
          name: "p1",
          elements: [
            {
              type: "matrixdropdown",
              name: "q1",
              columns: [{ name: "Column 1" }],
              rows: ["Row 1", "Row 2"]
            }
          ]
        }
      ],
      locale: "zh-cn"
    });
    assert.equal(
      survey.getQuestionByName("q1").name,
      "q1",
      "Matrix deserialized successful"
    );
  }
);

QUnit.test(
  "Survey checkbox.choices serialize/deserialize custom properties",
  function(assert) {
    var question = new QuestionCheckboxModel("q1");
    var jsonObj = new JsonObject();
    var originalJson = {
      name: "q1",
      choices: [{ value: "2", imageLink: "link to image" }]
    };
    jsonObj.toObject(originalJson, question);
    assert.equal(
      (<ItemValue>question.choices[0]).text,
      "2",
      "The default locale is 2"
    );
    assert.equal(
      (<ItemValue>question.choices[0])["imageLink"],
      "link to image",
      "Custom property is deserialized"
    );
    var json = jsonObj.toJsonObject(question);
    assert.deepEqual(
      json,
      originalJson,
      "Custom property has serialized correctly"
    );
  }
);
QUnit.test("Serialize numeric validation, minValue=0, Editor#239", function(
  assert
) {
  var survey = new SurveyModel();
  var page = survey.addNewPage("page1");
  var q = <Question>page.addNewQuestion("text", "question1");
  q.validators.push(new NumericValidator(0, 100));
  var json = new JsonObject().toJsonObject(q);
  var originalJson = {
    name: "question1",
    validators: [
      {
        type: "numeric",
        minValue: 0,
        maxValue: 100
      }
    ]
  };
  assert.deepEqual(json, originalJson, "minValue should be here");
});
