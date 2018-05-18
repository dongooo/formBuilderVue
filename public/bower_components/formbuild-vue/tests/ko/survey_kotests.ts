import { Survey } from "../../src/knockout/kosurvey";
import { QuestionText } from "../../src/knockout/koquestion_text";
import { QuestionDropdown } from "../../src/knockout/koquestion_dropdown";
import { QuestionCheckbox } from "../../src/knockout/koquestion_checkbox";
import { QuestionRadiogroup } from "../../src/knockout/koquestion_radiogroup";
import { Question } from "../../src/question";
import { QuestionMatrix } from "../../src/knockout/koquestion_matrix";
import { QuestionMatrixDropdown } from "../../src/knockout/koquestion_matrixdropdown";
import { QuestionPanelDynamic } from "../../src/knockout/koquestion_paneldynamic";
import { MatrixDropdownColumn } from "../../src/question_matrixdropdownbase";
import {
  QuestionMultipleText,
  MultipleTextItem
} from "../../src/knockout/koquestion_multipletext";
import { Page, Panel, QuestionRow } from "../../src/knockout/kopage";
import {
  CustomWidgetCollection,
  QuestionCustomWidget
} from "../../src/questionCustomWidgets";
import { koTemplate } from "../../src/knockout/templateText";
import { QuestionMatrixDynamic } from "../../src/knockout/koquestion_matrixdynamic";
import { surveyLocalization } from "../../src/surveyStrings";
import { QuestionRating } from "../../src/knockout/koquestion_rating";
import { QuestionRatingModel } from "../../src/question_rating";
import { JsonObject } from "../../src/jsonobject";

export default QUnit.module("koTests");

QUnit.test("Survey.koCurrentPage", function(assert) {
  var survey = new Survey();
  survey.addPage(createPageWithQuestion("Page 1"));
  survey.addPage(createPageWithQuestion("Page 2"));
  survey.addPage(createPageWithQuestion("Page 3"));
  assert.equal(
    survey.currentPage,
    survey.pages[0],
    "the first page is current"
  );
  assert.equal(
    survey.koCurrentPage(),
    survey.currentPage,
    "ko current page is equal"
  );
  assert.equal(survey.koIsFirstPage(), true, "is first page");
  assert.equal(survey.koIsLastPage(), false, "is first page");
  survey.nextPage();
  assert.equal(
    survey.koCurrentPage(),
    survey.pages[1],
    "ko current page is equal"
  );
  assert.equal(survey.koIsFirstPage(), false, "is second page");
  assert.equal(survey.koIsLastPage(), false, "is second page");
  survey.nextPage();
  assert.equal(
    survey.koCurrentPage(),
    survey.pages[2],
    "ko current page is equal"
  );
  assert.equal(survey.koIsFirstPage(), false, "is last page");
  assert.equal(survey.koIsLastPage(), true, "is last page");
});
QUnit.test("Set value through observable value", function(assert) {
  var question = new QuestionText("q");
  question["koValue"]("test");
  assert.equal(question.value, "test", "value is set correctly.");
});
QUnit.test("koOtherVisible for one choice items", function(assert) {
  var question = new QuestionDropdown("q");
  assert.equal(question["koOtherVisible"](), false, "Initially is not visible");
  question["koValue"](question.otherItem.value);
  assert.equal(
    question["koOtherVisible"](),
    true,
    "Other visible is true after selecting it"
  );
});
QUnit.test("Create koValue as observable array for checkbox", function(assert) {
  var question = new QuestionCheckbox("q");
  question["koValue"].push("test1");
  question["koValue"].push("test2");
  assert.deepEqual(
    question["koValue"](),
    ["test1", "test2"],
    "koValue is observable array"
  );
  assert.deepEqual(
    question.value,
    ["test1", "test2"],
    "value is set correctly."
  );
});
QUnit.test("Default value for checkbox", function(assert) {
  var survey = new Survey();
  survey.addNewPage("p1");
  var question = new QuestionCheckbox("q");
  survey.pages[0].addQuestion(question);
  assert.deepEqual(
    question["koValue"](),
    [],
    "the koValue by default should be empty array"
  );
});
QUnit.test("koOtherVisible for multi choice items", function(assert) {
  var question = new QuestionCheckbox("q");
  assert.equal(question["koOtherVisible"](), false, "Initially is not visible");
  question["koValue"].push("test1");
  question["koValue"].push(question.otherItem.value);
  assert.equal(
    question["koOtherVisible"](),
    true,
    "Other visible is true after selecting it"
  );
  question["koValue"].pop();
  assert.equal(
    question["koOtherVisible"](),
    false,
    "Other visible is true after selecting it"
  );
});
QUnit.test(
  "Update koValue on changing data in Survey or Question.value ",
  function(assert) {
    var survey = new Survey();
    survey.setValue("textQuestion", "initialValue");
    var page = survey.addNewPage("my page");
    var question = <Question>page.addNewQuestion("text", "textQuestion");
    assert.equal(question["koValue"](), "initialValue", "get initial value");
    question.value = "setFromValue";
    assert.equal(
      question["koValue"](),
      "setFromValue",
      "set from question value"
    );
    survey.setValue("textQuestion", "setFromSurvey");
    assert.equal(question["koValue"](), "setFromSurvey", "set from survey");
  }
);
QUnit.test(
  "Update koValue on changing data in Survey or Question.value for Multiple Answer Question ",
  function(assert) {
    var survey = new Survey();
    survey.setValue("checkboxQuestion", "initialValue");
    var page = survey.addNewPage("my page");
    var question = <Question>page.addNewQuestion(
      "checkbox",
      "checkboxQuestion"
    );
    assert.deepEqual(
      question["koValue"](),
      ["initialValue"],
      "get initial value"
    );
    question.value = "setFromValue";
    assert.deepEqual(
      question["koValue"](),
      ["setFromValue"],
      "set from question value"
    );
    survey.setValue("checkboxQuestion", "setFromSurvey");
    assert.deepEqual(
      question["koValue"](),
      ["setFromSurvey"],
      "set from survey"
    );
  }
);
QUnit.test("Question Matrix: koValue in MatrixValue", function(assert) {
  var matrix = new QuestionMatrix("q1");
  matrix.rows = ["row1", "row2"];
  matrix.columns = ["col1", "col2"];
  matrix.value = { row1: "col2" };
  var visibleRows = matrix.visibleRows;
  assert.equal(visibleRows[0]["koValue"](), "col2", "set the correct value");
  visibleRows[0]["koValue"]("col1");
  visibleRows[1]["koValue"]("col2");
  assert.deepEqual(
    matrix.value,
    { row1: "col1", row2: "col2" },
    "the matrix value changed correctly"
  );
});
QUnit.test(
  "Question Matrix: change matrix value after visibleRows generation",
  function(assert) {
    var matrix = new QuestionMatrix("q1");
    matrix.rows = ["row1", "row2"];
    matrix.columns = ["col1", "col2"];
    var visibleRows = matrix.visibleRows;
    matrix.value = { row1: "col2" };
    assert.equal(visibleRows[0]["koValue"](), "col2", "set the correct value");
  }
);
QUnit.test(
  "Question MatrixDropdown: change matrix value after visibleRows generation",
  function(assert) {
    var matrix = new QuestionMatrixDropdown("q1");
    matrix.rows = ["row1", "row2", "row3"];
    matrix.columns.push(new MatrixDropdownColumn("column1"));
    matrix.columns.push(new MatrixDropdownColumn("column2"));
    matrix.choices = [1, 2, 3];
    matrix.columns[1]["choices"] = [4, 5];
    var visibleRows = matrix.visibleRows;
    matrix.value = { row2: { column1: 2 } };
    assert.equal(
      visibleRows[1].cells[0].question["koValue"](),
      2,
      "value was set"
    );
  }
);

QUnit.test("Matrixdynamic lost last cell under certain circumstances", function(
  assert
) {
  var survey = new Survey({
    questions: [
      {
        type: "matrixdynamic",
        name: "frameworksRate",
        title: "Please enter two comments",
        columns: [
          {
            name: "likeTheBest",
            cellType: "comment",
            title: "Comment 1"
          },
          {
            name: "improvements",
            cellType: "comment",
            title: "Comment 2"
          }
        ],
        rowCount: 2
      }
    ]
  });
  var question: QuestionMatrixDynamic = <any>survey.getQuestionByName(
    "frameworksRate"
  );
  assert.equal(question.rowCount, 2, "It should be 2 rowCount");
  assert.equal(question.columns.length, 2, "It should be 2 columns");
  assert.equal(question["koRows"]().length, 2, "It should be 2 rows");
  assert.equal(
    question["koRows"]()[0].cells.length,
    2,
    "It should be 2 cells in 1st row"
  );
  assert.equal(
    question["koRows"]()[1].cells.length,
    2,
    "It should be 2 cells in 2nd row"
  );
  assert.equal(
    question["koRows"]()[0].cells[0].question.getType(),
    "comment",
    "Cell 1 should be comment"
  );
  assert.equal(
    question["koRows"]()[0].cells[1].question.getType(),
    "comment",
    "Cell 2 should be comment"
  );
});

QUnit.test("Matrixdynamic checkbox column does not work, Bug#1031", function(
  assert
) {
  var survey = new Survey({
    questions: [
      {
        type: "matrixdynamic",
        name: "q1",
        columns: [
          {
            name: "col1",
            cellType: "checkbox",
            colCount: 1,
            choices: ["1", "2", "3"]
          }
        ],
        rowCount: 1
      }
    ]
  });
  var question: QuestionMatrixDynamic = <any>survey.getQuestionByName("q1");
  var rows = question.visibleRows;
  (<any>rows[0].cells[0].question).koValue(["1"]);
  (<any>rows[0].cells[0].question).koValue(["1", "2"]);
  assert.deepEqual(
    survey.data,
    { q1: [{ col1: ["1", "2"] }] },
    "The value set correctly"
  );
});

QUnit.test("Question MultipleText: koValue in TextItem", function(assert) {
  var mQuestion = new QuestionMultipleText("q1");
  mQuestion.items.push(new MultipleTextItem("i1"));
  mQuestion.items.push(new MultipleTextItem("i2"));
  mQuestion.value = { i1: 10 };
  assert.equal(
    mQuestion.items[0]["koValue"](),
    10,
    "set the correct value to item.koValue from question"
  );
  mQuestion.items[0]["koValue"](20);
  assert.equal(
    mQuestion.items[0]["koValue"](),
    20,
    "set the correct value to item.koValue from question item"
  );
  assert.deepEqual(
    mQuestion.value,
    { i1: 20 },
    "set the correct value to question.Value from question item"
  );
  mQuestion.value = null;
  assert.equal(mQuestion.items[0]["koValue"](), null, "empty the value");
});
QUnit.test("Question MultipleText: koRows", function(assert) {
  var mQuestion = new QuestionMultipleText("q1");
  mQuestion.items.push(new MultipleTextItem("i1"));
  mQuestion.items.push(new MultipleTextItem("i2"));
  mQuestion.colCount = 2;
  assert.equal(mQuestion["koRows"]().length, 1, "just one row");
  assert.equal(mQuestion["koRows"]()[0].length, 2, "two items in one row");
  mQuestion.colCount = 1;
  assert.equal(mQuestion["koRows"]().length, 2, "two rows now");
  assert.equal(
    mQuestion["koRows"]()[0].length,
    1,
    "just one item in the first row"
  );
});
QUnit.test("koElements", function(assert) {
  var survey = new Survey();
  var page = survey.addNewPage("page1");
  page.addNewQuestion("text", "q1");
  page.addNewPanel("panel1");
  assert.equal(page["koRows"]().length, 2, "There are two rows");
  assert.equal(
    page.rows[0].questions.length,
    1,
    "One element in the first row"
  );
  assert.equal(
    page.rows[1].questions.length,
    1,
    "One element in the second row"
  );
  assert.equal(
    page["koRows"]()[0]["koElements"]().length,
    1,
    "One element in the first row, ko"
  );
  assert.equal(
    page["koRows"]()[1]["koElements"]().length,
    1,
    "One element in the second row, ko"
  );
});
QUnit.test("Set notification on setting survey data", function(assert) {
  var survey = new Survey();
  var page = survey.addNewPage("page1");
  var question = page.addNewQuestion("text", "q1");
  question["koValue"]("value1");
  survey.data = { q1: "value2" };
  assert.equal(survey.getValue("q1"), "value2", "survey data for q1");
  assert.equal(question["koValue"](), "value2", "knockout value is updated.");
});
QUnit.test("On make survey data empy for Multiple text question", function(
  assert
) {
  var survey = new Survey();
  var page = survey.addNewPage("page1");
  var question = new QuestionMultipleText("q1");
  page.addQuestion(question);
  question.items.push(new MultipleTextItem("i1"));
  question.items.push(new MultipleTextItem("i2"));
  question.value = { i1: 10 };
  survey.data = null;
  assert.equal(question.items[0]["koValue"](), null, "Make the data empty");
});
QUnit.test("koVisible property", function(assert) {
  var survey = new Survey();
  var page = survey.addNewPage("page1");
  var question = page.addNewQuestion("text", "q1");
  assert.equal(question["koVisible"](), true, "it is true by default");
  question.visible = false;
  assert.equal(question["koVisible"](), false, "it is false now");
});
QUnit.test("koComment property", function(assert) {
  var survey = new Survey();
  survey.data = { q: "other", "q-Comment": "aaaa" };
  var page = survey.addNewPage("page1");
  var question = new QuestionDropdown("q");
  page.addQuestion(question);
  question.choices = ["A", "B", "C", "D"];
  assert.equal(question["koComment"](), "aaaa", "Set ko Comment");
});
QUnit.test("Load title correctly from JSON", function(assert) {
  var survey = new Survey({ questions: [{ type: "text", name: "question1" }] });
  assert.equal(
    survey.pages[0].questions[0]["locTitle"]["koRenderedHtml"](),
    "1. question1",
    "title is getting from name"
  );
});
QUnit.test("koErrors should be empty after prevPage bug#151", function(assert) {
  var survey = new Survey();
  survey.goNextPageAutomatic = true;
  var page = survey.addNewPage("page1");
  var question = <QuestionDropdown>page.addNewQuestion("dropdown", "q1");
  question.choices = [1, 2, 3];
  question.isRequired = true;
  page = survey.addNewPage("page2");
  page.addNewQuestion("text", "q2");

  survey.nextPage();
  assert.equal(
    question["koErrors"]().length,
    1,
    "The question is not filled out."
  );
  (<Question>survey.pages[0].questions[0]).value = 1;
  assert.equal(question["koErrors"]().length, 0, "The question has not errors");
  assert.equal(survey.currentPage.name, "page2", "Go to the next page");
  survey.prevPage();
  assert.equal(question["koErrors"]().length, 0, "The question has not errors");
});

QUnit.test("add customwidget item", function(assert) {
  CustomWidgetCollection.Instance.clear();
  CustomWidgetCollection.Instance.addCustomWidget({
    name: "first",
    htmlTemplate: "<input type='text' />",
    isFit: question => {
      return false;
    }
  });
  assert.equal(
    CustomWidgetCollection.Instance.widgets.length,
    1,
    "one widget is added"
  );
  assert.ok(koTemplate, "ko template is exists");
  assert.ok(koTemplate.indexOf("survey-widget-first") > -1, "text was added");
  CustomWidgetCollection.Instance.clear();
});

QUnit.test("Localization, choices.locText.koRenderedHtml, #349", function(
  assert
) {
  var survey = new Survey();
  var page = survey.addNewPage("page");
  var q1 = <QuestionCheckbox>page.addNewQuestion("checkbox", "q1");
  q1.choices = [{ value: 1, text: { default: "text1", de: "text_de" } }];
  assert.equal(
    q1["koVisibleChoices"]()[0].text,
    "text1",
    "default locale, text property is 'text1'"
  );
  assert.equal(
    q1["koVisibleChoices"]()[0].locText.koRenderedHtml(),
    "text1",
    "default locale, locText.koRenderedHtml() is 'text1'"
  );
  survey.locale = "de";
  assert.equal(
    q1["koVisibleChoices"]()[0].text,
    "text_de",
    "default locale, text property is 'text_de'"
  );
  assert.equal(
    q1["koVisibleChoices"]()[0].locText.koRenderedHtml(),
    "text_de",
    "default locale, locText.koRenderedHtml() is 'text_de'"
  );
  survey.locale = "";
});

QUnit.test("Localization, otherItem", function(assert) {
  var survey = new Survey();
  var page = survey.addNewPage("page");
  var q1 = <QuestionCheckbox>page.addNewQuestion("checkbox", "q1");
  q1.choices = [1, 2];
  q1.hasOther = true;
  var defaultText = q1["koVisibleChoices"]()[2].locText["koRenderedHtml"]();
  assert.equal(
    q1["koVisibleChoices"]()[2].locText["koRenderedHtml"](),
    surveyLocalization.getString("otherItemText"),
    "use default locale"
  );
  survey.locale = "de";
  assert.notEqual(
    q1["koVisibleChoices"]()[2].locText["koRenderedHtml"](),
    defaultText,
    "use another locale locale"
  );
  survey.locale = "";
});

QUnit.test("otherItem, set text, editor: #90", function(assert) {
  var survey = new Survey({
    questions: [
      {
        type: "checkbox",
        name: "q1",
        choices: [1, 2],
        hasOther: true,
        otherText: "my other"
      }
    ]
  });
  var q1 = <QuestionCheckbox>survey.pages[0].questions[0];
  assert.equal(q1.name, "q1", "question load correctly");
  assert.equal(q1["koVisibleChoices"]()[2].text, "my other", "use otherText");
});

QUnit.test("Update page.title correctly with numbers", function(assert) {
  var survey = new Survey();
  survey.addPage(createPageWithQuestion("page1"));
  survey.addPage(createPageWithQuestion("page2"));
  survey.pages[0].title = "title 1";
  survey.pages[1].title = "title 2";
  survey.showPageNumbers = true;
  survey.currentPageNo = 1;
  assert.equal(
    survey.currentPage.locTitle["koRenderedHtml"](),
    "2. title 2",
    "It shows page as second"
  );
  survey.pages[0].visible = false;
  assert.equal(
    survey.currentPage.locTitle["koRenderedHtml"](),
    "1. title 2",
    "It shows page as first"
  );
});

QUnit.test(
  "Survey display mode should set koIsReadonly to true for questions",
  function(assert) {
    var survey = new Survey();
    var page = new Page("page1");
    survey.addPage(page);
    var question = new QuestionText("q1");
    page.addQuestion(question);
    assert.equal(
      question["koIsReadOnly"](),
      false,
      "by default question is not readonly"
    );
    survey.mode = "display";
    assert.equal(
      question["koIsReadOnly"](),
      true,
      "survey in display mode, question is readonly"
    );
  }
);

QUnit.test(
  "Matrixdynamic adjust rowCount on setting the survey.data with another locale",
  function(assert) {
    var survey = new Survey();
    survey.addNewPage("p1");
    var question = new QuestionMatrixDynamic("q1");
    question.rowCount = 0;
    question.columns.push(new MatrixDropdownColumn("column1"));
    question.columns.push(new MatrixDropdownColumn("column2"));
    survey.pages[0].addQuestion(question);
    question.visibleRows; // cache visibleRows
    survey.data = { q1: [{}, { column1: 2 }, {}] };
    assert.equal(question.rowCount, 3, "It should be 3 rowCount");
  }
);

QUnit.test("Text preprocessing variable and value. Fix the bug#461", function(
  assert
) {
  var survey = new Survey();
  survey.addNewPage("p1");
  survey.setValue("val1", "");
  survey.setVariable("var1", "");
  var question = new QuestionText("q1");
  survey.pages[0].addQuestion(question);
  question.title = "{var1}{val1}";
  assert.equal(
    question.locTitle["koRenderedHtml"](),
    "1. {val1}",
    "The title is empty by default"
  );
  survey.setValue("val1", "[val1]");
  assert.equal(
    question.locTitle["koRenderedHtml"](),
    "1. [val1]",
    "The val1 is set"
  );
  survey.setVariable("var1", "[var1]");
  assert.equal(
    question.locTitle["koRenderedHtml"](),
    "1. [var1][val1]",
    "The var1 and val1 are set"
  );
});

QUnit.test("Load Panel from Json + visibleIf + startWithNewLine", function(
  assert
) {
  var json = {
    questions: [
      {
        type: "panel",
        name: "panel",
        elements: [
          { type: "text", name: "q1" },
          {
            type: "text",
            name: "q2",
            visibleIf: "{q1}=a",
            startWithNewLine: false
          }
        ]
      }
    ]
  };
  var survey = new Survey(json);
  var panel = survey.getAllPanels()[0];
  var koRows = panel["koRows"];
  var row = koRows()[0];

  assert.ok(row, "row is created");
  assert.equal(koRows().length, 1, "There are 1 row in the panel");
  assert.equal(
    survey.getQuestionByName("q2")["koVisible"](),
    false,
    "The question is invisible"
  );
});

QUnit.test("Load Panel from Json + isSinglePage", function(assert) {
  var json = {
    isSinglePage: true,
    pages: [
      {
        name: "page1",
        elements: [{ type: "text", name: "q1" }]
      },
      {
        name: "page2",
        elements: [{ type: "text", name: "q2" }]
      }
    ]
  };
  var survey = new Survey(json);
  var page = survey.pages[0];
  var koRows = page["koRows"];
  var row = koRows()[1];

  assert.ok(row, "the second row is created");
  assert.equal(row.elements.length, 1, "There is one element here");
  assert.equal(row.visible, true, "Row is visible");
  var q = row.elements[0];
  assert.equal(q["koVisible"](), true, "The question is visible");
});

QUnit.test("Load PanelDynamic from Json", function(assert) {
  var json = {
    questions: [
      {
        type: "paneldynamic",
        name: "q",
        panelCount: 3,
        templateElements: [
          { type: "text", name: "q1" },
          { type: "text", name: "q2" }
        ]
      }
    ]
  };
  var survey = new Survey(json);
  var question = <QuestionPanelDynamic>survey.getAllQuestions()[0];
  assert.ok(question, "paneldynamic question is loaded");
  assert.equal(
    question.template.elements.length,
    2,
    "template elements are loaded correctly"
  );
  assert.equal(
    question.template.elements[1].name,
    "q2",
    "the name of the second question is 'q2'"
  );
  assert.equal(question.panelCount, 3, "panelCount loaded correctly");
  assert.equal(question["koPanels"]().length, 3, "There are 3 panels now");
  var panel = question["koPanels"]()[0];
  assert.equal(panel.koVisible(), true, "Panel is visible");
  assert.equal(panel["koRows"]().length, 2, "Two questions - two rows");
  var row = <QuestionRow>panel["koRows"]()[0];
  assert.ok(row, "the first row is created");
  assert.equal(row.koElements().length, 1, "there is one question in the row");
  assert.equal(row.koElements()[0].koVisible(), true, "question is visible");
  <Question>panel.questions[0].koValue("val1");
  assert.deepEqual(
    question.value,
    [{ q1: "val1" }, {}, {}],
    "Set the value correctly"
  );

  question.value = [
    { q1: "item1_1", q2: "item1_2" },
    { q1: "item2_1", q2: "item2_2" },
    {}
  ];
  assert.equal(
    <Question>panel.questions[0].koValue(),
    "item1_1",
    "knockout question in panel get notification"
  );
  question.removePanel(0);
  assert.equal(
    question["koPanels"]().length,
    2,
    "2 panels, koPanels has been updated"
  );
});

QUnit.test("Load PanelDynamic from Json, nested panel", function(assert) {
  var json = {
    questions: [
      {
        type: "paneldynamic",
        name: "q",
        panelCount: 3,
        templateElements: [
          { type: "text", name: "q1" },
          {
            type: "panel",
            name: "np1",
            elements: [{ type: "text", name: "q2" }]
          }
        ]
      }
    ]
  };
  var survey = new Survey(json);
  var question = <QuestionPanelDynamic>survey.getAllQuestions()[0];
  assert.ok(question, "paneldynamic question is loaded");
  assert.equal(
    question.template.elements.length,
    2,
    "template elements are loaded correctly"
  );
  assert.equal(
    question.template.elements[1].name,
    "np1",
    "the name of the second element is 'pn1'"
  );
  assert.equal(question.panelCount, 3, "panelCount loaded correctly");
  assert.equal(question["koPanels"]().length, 3, "There are 3 panels now");
  var panel = question["koPanels"]()[0];
  assert.equal(
    panel.elements.length,
    2,
    "panel elements are created correctly"
  );
  var nestedPanel = <Panel>panel.elements[1];
  assert.equal(
    nestedPanel.name,
    "np1",
    "copied panel: the name of the second element is 'pn1'"
  );

  assert.equal(
    nestedPanel.elements.length,
    1,
    "there is one element in the nested panel"
  );
  assert.equal(panel.koVisible(), true, "Panel is visible");
  assert.equal(nestedPanel.koVisible(), true, "Nested panel is visible");
  assert.equal(panel["koRows"]().length, 2, "Two elements - two rows");
  var row1 = <QuestionRow>panel["koRows"]()[0];
  var row2 = <QuestionRow>panel["koRows"]()[1];
  assert.ok(row1, "the first row is created");
  assert.equal(row1.koElements().length, 1, "there is one element in the row");
  assert.equal(row1.koElements()[0].koVisible(), true, "element is visible");
  assert.ok(row2, "the second row is created");
  assert.equal(row2.koElements().length, 1, "there is one element in the row");
  assert.equal(row2.koElements()[0].koVisible(), true, "element is visible");
  assert.equal(
    nestedPanel["koRows"]().length,
    1,
    "One element - one row in nested panel"
  );
  var rowN1 = <QuestionRow>nestedPanel["koRows"]()[0];
  assert.ok(row1, "the nested row is created");
  assert.equal(
    row1.koElements().length,
    1,
    "there is one element in the nested row"
  );
  assert.equal(
    row1.koElements()[0].koVisible(),
    true,
    "element is visible in nested row is visible"
  );
});

QUnit.test("PanelDynamic and koRenderedHtml on text processing", function(
  assert
) {
  var json = {
    questions: [
      {
        type: "paneldynamic",
        name: "q",
        panelCount: 3,
        templateElements: [
          { type: "text", name: "q1" },
          {
            type: "panel",
            name: "np1",
            title: "{panel.q1}",
            elements: [{ type: "text", name: "q2", title: "{panel.q1}" }]
          }
        ]
      }
    ]
  };
  var survey = new Survey(json);
  var question = <QuestionPanelDynamic>survey.getAllQuestions()[0];
  var panel = <Panel>question.panels[0];
  var pLocTitle = (<Panel>panel.elements[1]).locTitle;
  var qLocTitle = (<Question>panel.questions[1]).locTitle;
  assert.equal(
    qLocTitle["koRenderedHtml"](),
    "",
    "q2 title is empty by default"
  );
  assert.equal(pLocTitle["koRenderedHtml"](), "", "np1 title is empty");
  question.value = [{ q1: "val1" }];
  assert.equal(qLocTitle["koRenderedHtml"](), "val1", "q2 title is q1.value");
  assert.equal(pLocTitle["koRenderedHtml"](), "val1", "np1 title is q1.value");
});

export class DesignerSurveyTester extends Survey {
  constructor(
    jsonObj: any = null,
    renderedElement: any = null,
    css: any = null
  ) {
    super(jsonObj, renderedElement, css);
  }
  protected onBeforeCreating() {
    super.onBeforeCreating();
    this.setDesignMode(true);
  }
}

QUnit.test(
  "Questions are not rendered in Panel inside Dynamic Panel in Editor, editor bug #216",
  function(assert) {
    var survey = new DesignerSurveyTester({
      pages: [
        {
          name: "page1",
          elements: [
            {
              type: "paneldynamic",
              name: "question1",
              templateElements: [
                {
                  type: "panel",
                  elements: [
                    {
                      type: "text",
                      name: "question2"
                    }
                  ],
                  name: "panel1"
                }
              ]
            }
          ]
        }
      ]
    });
    var dynamicPanel = <QuestionPanelDynamic>survey.getQuestionByName(
      "question1"
    );
    assert.ok(dynamicPanel, "Dynamic panel is here");
    assert.equal(
      dynamicPanel.panels.length,
      1,
      "At design-time there should be one panel"
    );
    var templatePanel = dynamicPanel.panels[0];
    assert.ok(templatePanel, "template panel is here");
    var panel = <Panel>templatePanel.elements[0];
    assert.ok(panel, "panel is here");
    assert.equal(panel.elements.length, 1, "There is one element in the panel");
    var rows = panel["koRows"]();
    assert.ok(rows, "panel rows are here");
    assert.equal(rows.length, 1, "There is one element in the rows");
    var row1 = rows[0];
    assert.equal(
      row1.koElements().length,
      1,
      "there is one element in the row"
    );
    assert.equal(row1.koElements()[0].koVisible(), true, "element is visible");
    assert.equal(row1.koElements()[0].name, "question2", "It is our question");
  }
);

QUnit.test(
  "Add invisible question in Panel from JSON in Editor, editor bug #218",
  function(assert) {
    var survey = new DesignerSurveyTester();
    var page = survey.addNewPage("page1");
    var json = {
      type: "panel",
      elements: [
        {
          type: "text",
          name: "question2",
          visible: false
        }
      ],
      name: "panel1"
    };
    var newElement = JsonObject.metaData.createClass("panel");
    new JsonObject().toObject(json, newElement);
    page.addElement(newElement);

    var panel = <Panel>survey.pages[0].elements[0];
    assert.ok(panel, "panel is here");
    assert.equal(panel.elements.length, 1, "There is one element in the panel");
    var rows = panel["koRows"]();
    assert.ok(rows, "panel rows are here");
    assert.equal(rows.length, 1, "There is one element in the rows");
    var row1 = rows[0];
    assert.equal(
      row1.koElements().length,
      1,
      "there is one element in the row"
    );
    assert.equal(row1.koElements()[0].koVisible(), true, "element is visible");
    assert.equal(row1.koElements()[0].name, "question2", "It is our question");
  }
);

QUnit.test(
  "Load rating from JSON, bug# https://github.com/surveyjs/editor/issues/171",
  function(assert) {
    var json = {
      questions: [
        { type: "rating", name: "q", rateMax: 8, rateMin: 2, rateStep: 2 }
      ]
    };
    var survey = new Survey(json);

    var question = <QuestionRating>survey.getAllQuestions()[0];
    assert.equal(
      question["koVisibleRateValues"]().length,
      4,
      "There are 4 items: 2, 4, 6, 8"
    );
  }
);
QUnit.test("Default value doesn't set in PanelDynamic , bug#910", function(
  assert
) {
  var json = {
    questions: [
      {
        type: "paneldynamic",
        name: "pdynamic",
        templateElements: [
          {
            type: "text",
            name: "q1",
            defaultValue: "value1"
          },
          {
            type: "dropdown",
            name: "q2",
            defaultValue: "item2",
            choices: ["item1", "item2", "item3"]
          }
        ],
        panelCount: 1
      }
    ]
  };
  var survey = new Survey(json);
  var panel = <QuestionPanelDynamic>survey.getQuestionByName("pdynamic");
  var q1 = <Question>panel.panels[0].questions[0];
  var q2 = <Question>panel.panels[0].questions[1];
  assert.equal(q1.value, "value1", "The default value set to q1.value");
  assert.equal(q2.value, "item2", "The default value set to q2.value");
  assert.equal(
    q1["koValue"](),
    "value1",
    "The default value set to q1.koValue()"
  );
  assert.equal(
    q2["koValue"](),
    "item2",
    "The default value set to q2.koValue()"
  );
});

QUnit.test(
  "Survey.isSinglePage = true, the last page doesn't added, bug#1009",
  function(assert) {
    var json = {
      pages: [
        {
          name: "page1",
          elements: [
            {
              name: "text1",
              type: "text"
            }
          ]
        },
        {
          name: "page2",
          elements: [
            {
              name: "text2",
              type: "text"
            }
          ]
        },
        {
          name: "page3",
          elements: [
            {
              name: "text3",
              type: "text"
            }
          ]
        }
      ]
    };
    var survey = new Survey(json);
    survey.isSinglePage = true;
    assert.equal(
      survey.currentPage.questions.length,
      3,
      "There are 3 elements on the single page"
    );
    assert.equal(
      survey.currentPage["koRows"]().length,
      3,
      "There are 3 rows on the page"
    );
    assert.equal(
      survey.currentPage["koRows"]()[2].koVisible(),
      true,
      "The last row is visible"
    );
  }
);

QUnit.test("Survey Localization - radiogroup.otheItem, Bug#1045", function(
  assert
) {
  var json = {
    questions: [
      {
        type: "radiogroup",
        name: "q1",
        hasOther: true,
        choices: [1, 2],
        otherText: {
          default: "Other",
          es: "Otro"
        }
      }
    ]
  };

  var survey = new Survey(json);
  var q1 = <QuestionRadiogroup>survey.getQuestionByName("q1");

  assert.equal(
    q1.visibleChoices[2].locText["koRenderedHtml"](),
    "Other",
    "By default it is Other"
  );
  survey.locale = "es";
  assert.equal(
    q1.visibleChoices[2].locText["koRenderedHtml"](),
    "Otro",
    "Otro for Spanish"
  );
  survey.locale = "";
  assert.equal(
    q1.visibleChoices[2].locText["koRenderedHtml"](),
    "Other",
    "It is default again"
  );
  survey.locale = "es";
  assert.equal(
    q1.visibleChoices[2].locText["koRenderedHtml"](),
    "Otro",
    "It is Spanish again"
  );
  survey.locale = "";
});

QUnit.test(
  "PanelDynamic and MatrixDynamic, survey in readonly mode, Bug#1051",
  function(assert) {
    var json = {
      questions: [
        {
          type: "paneldynamic",
          name: "panel",
          panelCount: 2,
          templateElements: [
            {
              type: "text",
              name: "q1"
            }
          ]
        },
        {
          type: "matrixdynamic",
          name: "matrix",
          rowCount: 2,
          columns: [
            {
              name: "col1"
            }
          ]
        },
        {
          type: "text",
          name: "q2"
        }
      ]
    };
    var survey = new Survey(json);
    var panel = <QuestionPanelDynamic>survey.getQuestionByName("panel");
    var matrix = <QuestionMatrixDynamic>survey.getQuestionByName("matrix");
    var rows = matrix.visibleRows;
    var question = <QuestionText>survey.getQuestionByName("q2");
    assert.equal(
      panel.panels[0].questions[0]["koIsReadOnly"](),
      false,
      "The question is not readonly in panel dynamic"
    );
    assert.equal(
      rows[0].cells[0].question["koIsReadOnly"](),
      false,
      "The question is not readonly in matrix dynamic"
    );
    survey.mode = "display";
    assert.equal(
      question["koIsReadOnly"](),
      true,
      "The standard question is readonly"
    );
    assert.equal(
      panel.panels[0].questions[0]["koIsReadOnly"](),
      true,
      "The question in dynamic panel should be readonly"
    );
    assert.equal(
      rows[0].cells[0].question["koIsReadOnly"](),
      true,
      "The question is readonly in matrix dynamic"
    );
  }
);

function createPageWithQuestion(name: string): Page {
  var page = new Page(name);
  page.addNewQuestion("text", "q1");
  return page;
}
