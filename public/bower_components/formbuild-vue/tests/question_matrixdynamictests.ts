import { Question } from "../src/question";
import { QuestionFactory } from "../src/questionfactory";
import { QuestionSelectBase } from "../src/question_baseselect";
import { QuestionTextModel } from "../src/question_text";
import { SurveyModel } from "../src/survey";
import { QuestionCheckboxModel } from "../src/question_checkbox";
import { QuestionMatrixModel } from "../src/question_matrix";
import {
  MultipleTextItemModel,
  QuestionMultipleTextModel
} from "../src/question_multipletext";
import {
  NumericValidator,
  AnswerCountValidator,
  EmailValidator,
  RegexValidator
} from "../src/validator";
import { QuestionMatrixDropdownModel } from "../src/question_matrixdropdown";
import { MatrixDropdownColumn } from "../src/question_matrixdropdownbase";
import { QuestionDropdownModel } from "../src/question_dropdown";
import { QuestionMatrixDynamicModel } from "../src/question_matrixdynamic";
import { JsonObject } from "../src/jsonobject";
import { ItemValue } from "../src/itemvalue";

export default QUnit.module("Survey_QuestionMatrixDynamic");

QUnit.test("Matrixdropdown cells tests", function(assert) {
  var question = new QuestionMatrixDropdownModel("matrixDropdown");
  question.rows = ["row1", "row2", "row3"];
  question.columns.push(new MatrixDropdownColumn("column1"));
  question.columns.push(new MatrixDropdownColumn("column2"));
  question.choices = [1, 2, 3];
  question.columns[1]["choices"] = [4, 5];
  question.value = { row2: { column1: 2 } };
  var visibleRows = question.visibleRows;
  assert.equal(visibleRows.length, 3, "There are three rows");
  assert.equal(
    visibleRows[0].cells.length,
    2,
    "There are two cells in each row"
  );
  assert.equal(
    visibleRows[2].cells.length,
    2,
    "There are two cells in each row"
  );
  var q1 = <QuestionDropdownModel>visibleRows[0].cells[0].question;
  var q2 = <QuestionDropdownModel>visibleRows[0].cells[1].question;
  assert.deepEqual(
    ItemValue.getData(q1.choices),
    ItemValue.getData(question.choices),
    "get choices from matrix"
  );
  assert.deepEqual(
    ItemValue.getData(q2.choices),
    ItemValue.getData(question.columns[1]["choices"]),
    "get choices from column"
  );
  assert.equal(visibleRows[0].cells[1].value, null, "value is not set");
  assert.equal(visibleRows[1].cells[0].value, 2, "value was set");

  question.value = null;
  visibleRows[0].cells[1].value = 4;
  assert.deepEqual(
    question.value,
    { row1: { column2: 4 } },
    "set the cell value correctly"
  );
  visibleRows[0].cells[1].value = null;
  assert.deepEqual(question.value, null, "set to null if all cells are null");
});
QUnit.test("Matrixdynamic cells tests", function(assert) {
  var question = new QuestionMatrixDynamicModel("matrixDynamic");
  question.rowCount = 3;
  question.columns.push(new MatrixDropdownColumn("column1"));
  question.columns.push(new MatrixDropdownColumn("column2"));
  question.choices = [1, 2, 3];
  question.columns[1]["choices"] = [4, 5];
  question.value = [{}, { column1: 2 }, {}];
  var visibleRows = question.visibleRows;
  assert.equal(visibleRows.length, 3, "There are three rows");
  assert.equal(
    visibleRows[0].cells.length,
    2,
    "There are two cells in each row"
  );
  assert.equal(
    visibleRows[2].cells.length,
    2,
    "There are two cells in each row"
  );
  var q1 = <QuestionDropdownModel>visibleRows[0].cells[0].question;
  var q2 = <QuestionDropdownModel>visibleRows[0].cells[1].question;
  assert.deepEqual(
    ItemValue.getData(q1.choices),
    ItemValue.getData(question.choices),
    "get choices from matrix"
  );
  assert.deepEqual(
    ItemValue.getData(q2.choices),
    ItemValue.getData(question.columns[1]["choices"]),
    "get choices from column"
  );
  assert.equal(visibleRows[0].cells[1].value, null, "value is not set");
  assert.equal(visibleRows[1].cells[0].value, 2, "value was set");

  question.value = null;
  visibleRows[1].cells[1].value = 4;
  assert.deepEqual(
    question.value,
    [{}, { column2: 4 }, {}],
    "set the cell value correctly"
  );
  visibleRows[1].cells[1].value = null;
  assert.deepEqual(question.value, null, "set to null if all cells are null");
});
QUnit.test(
  "Matrixdynamic make the question empty on null cell value, Bug #608",
  function(assert) {
    var question = new QuestionMatrixDynamicModel("matrixDynamic");
    question.rowCount = 3;
    question.columns.push(new MatrixDropdownColumn("column1"));
    question.columns.push(new MatrixDropdownColumn("column2"));
    var visibleRows = question.visibleRows;
    visibleRows[1].cells[0].question.value = 2;
    assert.deepEqual(
      question.value,
      [{}, { column1: 2 }, {}],
      "The value set correctly"
    );
    visibleRows[1].cells[0].question.value = null;
    assert.deepEqual(
      question.value,
      null,
      "Clear the question value if all cells are empty"
    );
  }
);

QUnit.test("Matrixdynamic set null value, Bug Editor #156", function(assert) {
  var survey = new SurveyModel();
  survey.setDesignMode(true);
  survey.addNewPage();
  var question = new QuestionMatrixDynamicModel("matrixDynamic");
  question.rowCount = 3;
  question.columns.push(new MatrixDropdownColumn("column1"));
  question.columns.push(new MatrixDropdownColumn("column2"));
  survey.pages[0].addQuestion(question);
  /*
      question.value = null;
      assert.deepEqual(question.value, [{}, {}, {}], "Set null value correctly");
      */
  var visibleRows = question.visibleRows;
  assert.equal(visibleRows.length, 3, "There shoud be 3 rows");
});

QUnit.test("Matrixdropdown value tests after cells generation", function(
  assert
) {
  var question = new QuestionMatrixDropdownModel("matrixDropdown");
  question.rows = ["row1", "row2", "row3"];
  question.columns.push(new MatrixDropdownColumn("column1"));
  question.columns.push(new MatrixDropdownColumn("column2"));
  question.choices = [1, 2, 3];
  question.columns[1]["choices"] = [4, 5];
  var visibleRows = question.visibleRows;
  question.value = { row2: { column1: 2 } };
  assert.equal(visibleRows[1].cells[0].value, 2, "value was set");
});
QUnit.test("Matrixdynamic value tests after cells generation", function(
  assert
) {
  var question = new QuestionMatrixDynamicModel("matrixDymanic");
  question.rowCount = 3;
  question.columns.push(new MatrixDropdownColumn("column1"));
  question.columns.push(new MatrixDropdownColumn("column2"));
  question.choices = [1, 2, 3];
  question.columns[1]["choices"] = [4, 5];
  var visibleRows = question.visibleRows;
  question.value = [{}, { column1: 2 }, {}];
  assert.equal(visibleRows[1].cells[0].value, 2, "value was set");
});
QUnit.test("Matrixdynamic set text to rowCount property, bug #439", function(
  assert
) {
  var question = new QuestionMatrixDynamicModel("matrixDymanic");
  new JsonObject().toObject({ type: "matrixdynamic", rowCount: "1" }, question);
  assert.equal(question.rowCount, 1, "Row count should be 1");
  question.addRow();
  assert.equal(question.rowCount, 2, "Row count should b 2 now");
});
QUnit.test("Matrixdynamic add/remove rows", function(assert) {
  var question = new QuestionMatrixDynamicModel("matrixDymanic");
  question.rowCount = 3;
  question.columns.push(new MatrixDropdownColumn("column1"));
  question.columns.push(new MatrixDropdownColumn("column2"));
  question.value = [{}, { column1: 2 }, {}];
  question.removeRow(1);
  assert.equal(question.rowCount, 2, "one row is removed");
  assert.equal(question.value, null, "value is null now");
  question.addRow();
  assert.equal(question.rowCount, 3, "one row is added");
});
QUnit.test("Matrixdynamic required column", function(assert) {
  var question = new QuestionMatrixDynamicModel("matrixDymanic");
  question.rowCount = 2;
  question.columns.push(new MatrixDropdownColumn("column1"));
  question.columns.push(new MatrixDropdownColumn("column2"));
  var rows = question.visibleRows;
  assert.equal(question.hasErrors(), false, "No errors");
  question.columns[0].isRequired = true;
  assert.equal(rows.length, 2, "There are two rows");
  assert.equal(
    question.hasErrors(),
    true,
    "column1 should not be empty. All rows are empty"
  );
  assert.equal(
    question.getAllErrors().length,
    2,
    "There are totally two errors"
  );
  question.value = [{ column1: 2 }, {}];
  assert.equal(
    rows[0].cells[0].question.value,
    2,
    "The first cell has value 2"
  );
  assert.equal(
    question.hasErrors(),
    true,
    "column1 should not be empty. the second row is empty"
  );
  assert.equal(
    question.getAllErrors().length,
    1,
    "There are totally one errors"
  );
  question.value = [{ column1: 2 }, { column1: 3 }];
  assert.equal(
    question.hasErrors(),
    false,
    "column1 should not be empty. all values are set"
  );
  assert.equal(
    question.getAllErrors().length,
    0,
    "There are totally no errors"
  );
});
QUnit.test("Matrixdynamic column.validators", function(assert) {
  var question = new QuestionMatrixDynamicModel("matrixDymanic");
  question.rowCount = 2;
  question.columns.push(new MatrixDropdownColumn("column1"));
  question.columns.push(new MatrixDropdownColumn("column2"));
  var rows = question.visibleRows;
  assert.equal(question.hasErrors(), false, "No errors");
  question.columns[0].validators.push(new EmailValidator());
  question.rowCount = 0;
  question.rowCount = 2;
  var rows = question.visibleRows;
  question.value = [{ column1: "aaa" }, {}];
  assert.equal(question.hasErrors(), true, "column1 should has valid e-mail");
  question.value = [{ column1: "aaa@aaa.com" }, {}];
  assert.equal(question.hasErrors(), false, "column1 has valid e-mail");
});
QUnit.test("Matrixdynamic duplicationError", function(assert) {
  var question = new QuestionMatrixDynamicModel("matrixDymanic");
  question.rowCount = 2;
  question.columns.push(new MatrixDropdownColumn("column1"));
  question.columns.push(new MatrixDropdownColumn("column2"));
  question.keyName = "column1";
  var rows = question.visibleRows;
  assert.equal(question.hasErrors(), false, "No errors");
  question.value = [{ column1: "val1" }, {}];
  assert.equal(
    question.hasErrors(),
    false,
    "There is no errors, row[0].column1=val1"
  );
  question.value = [{ column1: "val1" }, { column1: "val1" }];
  assert.equal(
    question.hasErrors(),
    true,
    "There is the error, row[0].column1=val1 and row[1].column2=val1"
  );
  question.value = [{ column1: "val1" }, { column1: "val2" }];
  assert.equal(
    question.hasErrors(),
    false,
    "There is no errors, row[0].column1=val1 and row[1].column2=val2"
  );
});
QUnit.test("Matrixdynamic hasOther column", function(assert) {
  var question = new QuestionMatrixDynamicModel("matrixDymanic");
  question.choices = [1, 2, 3];
  question.rowCount = 1;
  question.columns.push(new MatrixDropdownColumn("column1"));
  question.columns[0].hasOther = true;
  var rows = question.visibleRows;
  assert.equal(question.hasErrors(), false, "Everything is fine so far");
  rows[0].cells[0].question.value = "other";
  assert.equal(question.hasErrors(), true, "Should set other value");
});
QUnit.test("Matrixdynamic adjust rowCount on setting the value", function(
  assert
) {
  var question = new QuestionMatrixDynamicModel("matrixDymanic");
  question.rowCount = 0;
  question.columns.push(new MatrixDropdownColumn("column1"));
  question.columns.push(new MatrixDropdownColumn("column2"));
  question.value = [{}, { column1: 2 }, {}];
  assert.equal(question.rowCount, 3, "It should be 3 rowCount");
  var rows = question.visibleRows;
  question.value = [{}, { column1: 2 }, {}, {}];
  assert.equal(question.rowCount, 4, "It should be 4 rowCount");
  question.value = [{ column1: 2 }];
  assert.equal(question.rowCount, 4, "Keep row count equals 4");
});
QUnit.test("Matrixdynamic minRowCount/maxRowCount", function(assert) {
  var question = new QuestionMatrixDynamicModel("matrixDymanic");
  question.minRowCount = 3;
  question.maxRowCount = 5;
  assert.equal(question.rowCount, 3, "row count is min row count");
  question.rowCount = 5;
  assert.equal(question.rowCount, 5, "row count is 5");
  question.maxRowCount = 4;
  assert.equal(question.rowCount, 4, "row count is max row count");
  question.addRow();
  assert.equal(question.rowCount, 4, "row count is still max row count");
});
QUnit.test("Matrixdynamic do not re-create the rows", function(assert) {
  var question = new QuestionMatrixDynamicModel("matrixDymanic");
  var firstRowId = question.visibleRows[0].id;
  assert.notOk(
    firstRowId.indexOf("unde") > -1,
    "there should not be undefined in the row index"
  );
  var rowCount = question.visibleRows.length;
  question.addRow();
  assert.equal(question.visibleRows.length, rowCount + 1, "Add one row");
  assert.equal(
    question.visibleRows[0].id,
    firstRowId,
    "The first row is the same after row adding"
  );
  question.removeRow(question.rowCount - 1);
  assert.equal(
    question.visibleRows[0].id,
    firstRowId,
    "The first row is the same after row removing"
  );
  question.rowCount = 10;
  assert.equal(
    question.visibleRows[0].id,
    firstRowId,
    "The first row is the same after row count increasing"
  );
  question.rowCount = 1;
  assert.equal(
    question.visibleRows[0].id,
    firstRowId,
    "The first row is the same after row count decreasing"
  );
  question.value = [{ col1: 2 }];
  assert.equal(
    question.visibleRows[0].id,
    firstRowId,
    "The first row is the same after setting value"
  );
});

QUnit.test("Matrixdynamic change column properties on the fly", function(
  assert
) {
  var question = new QuestionMatrixDynamicModel("matrixDymanic");
  question.addColumn("col1");
  var rows = question.visibleRows;
  assert.equal(
    rows[0].cells[0].question.getType(),
    "dropdown",
    "the default cell type is 'dropdown'"
  );
  assert.equal(
    (<QuestionDropdownModel>rows[0].cells[0].question).choices.length,
    question.choices.length,
    "By use question.choices by default"
  );
  question.columns[0]["choices"] = [1, 2, 3, 4, 5, 6, 7];
  assert.equal(
    (<QuestionDropdownModel>rows[0].cells[0].question).choices.length,
    question.columns[0]["choices"].length,
    "Use column choices if set"
  );
});

QUnit.test("Matrixdynamic customize cell editors", function(assert) {
  /*
          col2 - invisible if col1 is empty, [item1, item2] - if col1 = 1 and [item3, item4] if col1 = 2
      */
  var matrix = new QuestionMatrixDynamicModel("matrixDymanic");
  matrix.addColumn("col1");
  matrix.addColumn("col2");
  matrix.columns[0]["choices"] = [1, 2];
  var survey = new SurveyModel();
  survey.addNewPage("p1");
  survey.pages[0].addQuestion(matrix);
  survey.onMatrixCellCreated.add(function(survey, options) {
    if (options.columnName == "col2") {
      options.cellQuestion.visible = options.rowValue["col1"] ? true : false;
    }
  });
  survey.onMatrixCellValueChanged.add(function(survey, options) {
    if (options.columnName != "col1") return;
    var question = options.getCellQuestion("col2");
    question.visible = options.value ? true : false;
    if (options.value == 1) question.choices = ["item1", "item2"];
    if (options.value == 2) question.choices = ["item3", "item4"];
  });
  matrix.rowCount = 1;
  var rows = matrix.visibleRows;
  var q1 = <QuestionDropdownModel>rows[0].cells[0].question;
  var q2 = <QuestionDropdownModel>rows[0].cells[1].question;
  assert.equal(q2.visible, false, "col2 is invisible if col1 is empty");
  q1.value = 1;
  assert.equal(
    q2.choices[0].value,
    "item1",
    "col1 = 1, col2.choices = ['item1', 'item2']"
  );
  q1.value = 2;
  assert.equal(
    q2.choices[0].value,
    "item3",
    "col1 = 2, col2.choices = ['item3', 'item4']"
  );
  q1.value = null;
  assert.equal(q2.visible, false, "col2 is invisible if col1 = null");
  matrix.addRow();
  assert.equal(
    (<QuestionDropdownModel>rows[1].cells[1].question).visible,
    false,
    "row2. col2 is invisible if col1 = null"
  );
});

//QUnit.test("Matrixdynamic validate cell values - do not allow to have the same value", function (assert) {
QUnit.test(
  "Matrixdynamic validate cell values - onMatrixCellValueChanged",
  function(assert) {
    var matrix = new QuestionMatrixDynamicModel("matrixDymanic");
    matrix.addColumn("col1");
    var survey = new SurveyModel();
    survey.addNewPage("p1");
    survey.pages[0].addQuestion(matrix);
    var cellQuestions = [];
    survey.onMatrixCellCreated.add(function(survey, options) {
      cellQuestions.push(options.cellQuestion);
    });
    survey.onMatrixCellValidate.add(function(survey, options) {
      if (options.value == "notallow") {
        options.error = "This cell is not allow";
      }
    });
    var rows = matrix.visibleRows;
    assert.equal(
      cellQuestions.length,
      2,
      "There are 2 cell questions in the array"
    );
    cellQuestions[0].value = "notallow";
    matrix.hasErrors(true);
    assert.equal(cellQuestions[0].errors.length, 1, "There is an error");
    cellQuestions[0].value = "allow";
    matrix.hasErrors(true);
    assert.equal(cellQuestions[0].errors.length, 0, "There is no errors");
  }
);

QUnit.test(
  "Matrixdynamic validate cell values - do not allow to have the same value",
  function(assert) {
    var matrix = new QuestionMatrixDynamicModel("matrixDymanic");
    matrix.addColumn("col1");
    var survey = new SurveyModel();
    survey.addNewPage("p1");
    survey.pages[0].addQuestion(matrix);
    var cellQuestions = [];
    survey.onMatrixCellCreated.add(function(survey, options) {
      cellQuestions.push(options.cellQuestion);
    });
    survey.onMatrixCellValueChanged.add(function(survey, options) {
      //validate value on change
      options.getCellQuestion("col1").hasErrors(true);
    });
    survey.onMatrixCellValidate.add(function(survey, options) {
      var rows = options.question.visibleRows;
      for (var i = 0; i < rows.length; i++) {
        //we have the same row
        if (rows[i] === options.row) continue;
        if (rows[i].value && rows[i].value["col1"] == options.value) {
          options.error = "You have already select the same value";
        }
      }
    });
    var rows = matrix.visibleRows;
    assert.equal(
      cellQuestions.length,
      2,
      "There are 2 cell questions in the array"
    );
    cellQuestions[0].value = 1;
    assert.equal(cellQuestions[1].errors.length, 0, "There is now errors");
    cellQuestions[1].value = 1;
    assert.equal(cellQuestions[1].errors.length, 1, "There is an error");
    cellQuestions[1].value = 2;
    assert.equal(cellQuestions[1].errors.length, 0, "There no errors again");
  }
);

QUnit.test("Matrixdropdown different cell types", function(assert) {
  var question = new QuestionMatrixDropdownModel("matrixDropdown");

  question.columns.push(new MatrixDropdownColumn("dropdown"));
  question.columns.push(new MatrixDropdownColumn("checkbox"));
  question.columns.push(new MatrixDropdownColumn("radiogroup"));
  question.columns.push(new MatrixDropdownColumn("text"));
  question.columns.push(new MatrixDropdownColumn("comment"));
  question.columns.push(new MatrixDropdownColumn("boolean"));

  for (var i = 0; i < question.columns.length; i++) {
    question.columns[i].cellType = question.columns[i].name;
  }
  question.rows = ["row1", "row2", "row3"];

  for (var i = 0; i < question.columns.length; i++) {
    var col = question.columns[i];
    var row = question.visibleRows[0];
    assert.equal(
      row.cells[i].question.getType(),
      col.name,
      "Expected " + col.name + ", but was" + row.cells[i].question.getType()
    );
  }
});
QUnit.test("Matrixdropdown boolean cellType", function(assert) {
  var question = new QuestionMatrixDropdownModel("matrixDropdown");

  question.columns.push(new MatrixDropdownColumn("col1"));
  question.columns.push(new MatrixDropdownColumn("col2"));
  question.cellType = "boolean";

  question.rows = ["row1"];
  var visibleRows = question.visibleRows;
  visibleRows[0].cells[0].question.value = true;
  visibleRows[0].cells[1].question.value = false;
  assert.deepEqual(
    question.value,
    { row1: { col1: true, col2: false } },
    "Boolean field set value correctly"
  );
});
QUnit.test("Matrixdropdown booleanDefaultValue", function(assert) {
  var question = new QuestionMatrixDropdownModel("matrixDropdown");

  question.columns.push(new MatrixDropdownColumn("col1"));
  question.columns.push(new MatrixDropdownColumn("col2"));
  question.cellType = "boolean";
  question.columns[0]["defaultValue"] = "true";
  question.columns[1]["defaultValue"] = "false";

  question.rows = ["row1"];
  var visibleRows = question.visibleRows;
  assert.deepEqual(
    question.value,
    { row1: { col1: true, col2: false } },
    "Boolean field set value correctly"
  );
});

QUnit.test("Matrixdropdown defaultValue", function(assert) {
  var survey = new SurveyModel({
    questions: [
      {
        type: "matrixdropdown",
        name: "q1",
        defaultValue: { row1: { col1: 1 } },
        columns: [
          {
            name: "col1",
            choices: [1, 2, 3]
          }
        ],
        rows: [
          {
            value: "row1"
          }
        ]
      }
    ]
  });
  var question = <QuestionMatrixDropdownModel>survey.getQuestionByName("q1");
  assert.deepEqual(
    question.value,
    { row1: { col1: 1 } },
    "default value has been assign"
  );
});

QUnit.test("Matrixdropdown isRequiredInAllRows", function(assert) {
  var question = new QuestionMatrixDynamicModel("matrix");
  question.rowCount = 2;
  question.columns.push(new MatrixDropdownColumn("dropdown"));
  var rows = question.visibleRows;
  assert.equal(
    question.hasErrors(),
    false,
    "There is no errors in the matrix. Null is possible"
  );
  assert.equal(rows[0].isEmpty, true, "There is no error in the first row");
  assert.equal(rows[1].isEmpty, true, "There is no error in the second row");
  question.minRowCount = 2;
  assert.equal(
    question.hasErrors(),
    true,
    "Error, value in all rows are required"
  );
});
QUnit.test("Matrixdropdown supportGoNextPageAutomatic property", function(
  assert
) {
  var question = new QuestionMatrixDropdownModel("matrix");
  question.rows = ["row1", "row2"];
  question.columns.push(new MatrixDropdownColumn("col1"));
  question.columns.push(new MatrixDropdownColumn("col2"));
  var rows = question.visibleRows;
  assert.equal(
    question.supportGoNextPageAutomatic(),
    false,
    "There is no value in rows"
  );
  question.value = { row1: { col1: 1, col2: 11 } };
  assert.equal(
    question.supportGoNextPageAutomatic(),
    false,
    "There is no value in the second row"
  );
  question.value = { row1: { col1: 1, col2: 11 }, row2: { col1: 2, col2: 22 } };
  assert.equal(
    question.supportGoNextPageAutomatic(),
    true,
    "All row values are set"
  );
  question.value = { row1: { col1: 1 }, row2: { col1: 2, col2: 22 } };
  assert.equal(
    question.supportGoNextPageAutomatic(),
    false,
    "The first row is not set completely"
  );
});

QUnit.test(
  "Matrixdropdown supportGoNextPageAutomatic always false for checkbox",
  function(assert) {
    var question = new QuestionMatrixDropdownModel("matrix");
    question.rows = ["row1", "row2"];
    question.columns.push(new MatrixDropdownColumn("col1"));
    question.columns.push(new MatrixDropdownColumn("col2"));
    question.columns[1].cellType = "checkbox";
    var json = new JsonObject().toJsonObject(question);
    json.type = question.getType();
    question.columns.push(new MatrixDropdownColumn("col3"));
    question.columns.push(new MatrixDropdownColumn("col4"));
    new JsonObject().toObject(json, question);

    assert.equal(question.columns.length, 2, "There were two columns");
  }
);

QUnit.test("Matrixdropdown set columns", function(assert) {
  var question = new QuestionMatrixDropdownModel("matrix");
  question.rows = ["row1", "row2"];
  question.columns.push(new MatrixDropdownColumn("col1"));
  question.columns.push(new MatrixDropdownColumn("col2"));

  assert.equal(
    question.supportGoNextPageAutomatic(),
    false,
    "There is no value in rows"
  );
  question.value = { row1: { col1: 1, col2: 11 } };
  assert.equal(
    question.supportGoNextPageAutomatic(),
    false,
    "Checkbox doesn't support gotNextPageAutomatic"
  );
});

QUnit.test("Matrixdynamic column.visibleIf", function(assert) {
  var question = new QuestionMatrixDynamicModel("matrixDynamic");
  question.rowCount = 2;
  question.columns.push(new MatrixDropdownColumn("column1"));
  question.columns.push(new MatrixDropdownColumn("column2"));
  question.columns.push(new MatrixDropdownColumn("column3"));
  question.columns[0]["choices"] = [1, 2, 3];
  question.columns[1]["choices"] = [4, 5];
  question.columns[2]["choices"] = [7, 8, 9, 10];
  question.columns[2].isRequired = true;

  question.columns[1].visibleIf = "{row.column1} = 2";
  question.columns[2].visibleIf = "{a} = 5";

  var visibleRows = question.visibleRows;
  var q1 = <QuestionDropdownModel>visibleRows[0].cells[0].question;
  var q2 = <QuestionDropdownModel>visibleRows[0].cells[1].question;
  var q3 = <QuestionDropdownModel>visibleRows[0].cells[2].question;

  var values = { a: 3 };
  question.runCondition(values);
  assert.equal(q1.visible, true, "1. q1 visibleIf is empty");
  assert.equal(q2.visible, false, "1. q2 visibleIf depends on column1 - false");
  assert.equal(
    q3.visible,
    false,
    "1. q3 visibleIf depends on external data - false"
  );
  assert.equal(
    question.hasErrors(),
    false,
    "1. q3 required column is invisible."
  );

  values = { a: 5 };
  question.runCondition(values);
  assert.equal(
    q3.visible,
    true,
    "2. q3 visibleIf depends on external data - true"
  );

  q1.value = 2;
  question.runCondition(values);
  assert.equal(q2.visible, true, "3. q2 visibleIf depends on column1 - true");
});
QUnit.test("Matrixdynamic column.enableIf", function(assert) {
  var question = new QuestionMatrixDynamicModel("matrixDynamic");
  question.rowCount = 2;
  question.columns.push(new MatrixDropdownColumn("column1"));
  question.columns.push(new MatrixDropdownColumn("column2"));
  question.columns.push(new MatrixDropdownColumn("column3"));
  question.columns[0]["choices"] = [1, 2, 3];
  question.columns[1]["choices"] = [4, 5];
  question.columns[2]["choices"] = [7, 8, 9, 10];
  question.columns[2].isRequired = true;

  question.columns[1].enableIf = "{row.column1} = 2";
  question.columns[2].enableIf = "{a} = 5";

  var visibleRows = question.visibleRows;
  var q1 = <QuestionDropdownModel>visibleRows[0].cells[0].question;
  var q2 = <QuestionDropdownModel>visibleRows[0].cells[1].question;
  var q3 = <QuestionDropdownModel>visibleRows[0].cells[2].question;

  var values = { a: 3 };
  question.runCondition(values);
  assert.equal(q1.isReadOnly, false, "1. q1 enableIf is empty");
  assert.equal(
    q2.isReadOnly,
    true,
    "1. q2 enableIf depends on column1 - false"
  );
  assert.equal(
    q3.isReadOnly,
    true,
    "1. q3 enableIf depends on external data - false"
  );
  values = { a: 5 };
  question.runCondition(values);
  assert.equal(
    q3.isReadOnly,
    false,
    "2. q3 enableIf depends on external data - true"
  );

  q1.value = 2;
  question.runCondition(values);
  assert.equal(
    q2.isReadOnly,
    false,
    "3. q2 enableIf depends on column1 - true"
  );
});
QUnit.test(
  "Matrixdynamic column.visibleIf, load from json and add item",
  function(assert) {
    var survey = new SurveyModel({
      questions: [
        {
          type: "matrixdynamic",
          rowCount: 1,
          columns: [
            { name: "col1", choices: [1, 2] },
            { name: "col2", visibleIf: "{row.col1} = 1" }
          ]
        }
      ]
    });
    var matrix = <QuestionMatrixDynamicModel>survey.getAllQuestions()[0];
    var rows = matrix.visibleRows;
    var q_0_1 = <QuestionDropdownModel>rows[0].cells[1].question;
    assert.equal(q_0_1.visible, false, "Initial the question is invisible");
    matrix.addRow();
    var q_1_1 = <QuestionDropdownModel>rows[1].cells[1].question;
    assert.equal(
      q_1_1.visible,
      false,
      "Initial the question in the added row is invisible"
    );
  }
);

QUnit.test("MatrixDropdownColumn cell question", function(assert) {
  var question = new QuestionMatrixDynamicModel("matrix");
  var column = question.addColumn("col1");
  assert.equal(
    column.templateQuestion.getType(),
    "dropdown",
    "The default type is dropdown"
  );
  question.cellType = "radiogroup";
  assert.equal(
    column.templateQuestion.getType(),
    "radiogroup",
    "The default type is radiogroup"
  );
  column.cellType = "checkbox";
  assert.equal(
    column.templateQuestion.getType(),
    "checkbox",
    "The question type is checkbox"
  );
});

QUnit.test("MatrixDropdownColumn properties are in questions", function(
  assert
) {
  var column = new MatrixDropdownColumn("col1");
  column.title = "some text";
  assert.equal(column.templateQuestion.name, "col1", "name set into question");
  assert.equal(
    column.templateQuestion.title,
    "some text",
    "title into question"
  );
  column.cellType = "checkbox";
  assert.equal(
    column.templateQuestion.getType(),
    "checkbox",
    "cell type is changed"
  );
  assert.equal(
    column.templateQuestion.name,
    "col1",
    "name is still in question"
  );
  assert.equal(
    column.templateQuestion.title,
    "some text",
    "title is still in question"
  );
});
QUnit.test("MatrixDropdownColumn add/remove serialization properties", function(
  assert
) {
  var column = new MatrixDropdownColumn("col1");
  assert.ok(
    column["optionsCaption"],
    "optionsCaption property has been created"
  );
  assert.ok(
    column["locOptionsCaption"],
    "Serialization property has been created for optionsCaption"
  );
  column.cellType = "text";
  assert.notOk(
    column["optionsCaption"],
    "optionsCaption property has been removed"
  );
  assert.notOk(
    column["locOptionsCaption"],
    "Serialization property has been removed for optionsCaption"
  );
});
QUnit.test("MatrixDropdownColumn cellType property, choices", function(assert) {
  var prop = JsonObject.metaData.findProperty(
    "matrixdropdowncolumn",
    "cellType"
  );
  assert.ok(prop, "Property is here");
  assert.equal(prop.choices.length, 8, "There are 8 cell types by default");
  assert.equal(prop.choices[0], "default", "The first value is default");
  assert.equal(prop.choices[1], "dropdown", "The second value is default");
});

QUnit.test(
  "MatrixDropdownColumn copy local choices into cell question",
  function(assert) {
    var question = new QuestionMatrixDynamicModel("matrix");
    question.choices = [1, 2, 3];
    var column = question.addColumn("col1");
    column["choices"] = [4, 5];
    question.rowCount = 1;
    var rows = question.visibleRows;
    assert.equal(
      rows[0].cells[0].question["choices"].length,
      2,
      "There are 2 choices"
    );
    assert.equal(
      rows[0].cells[0].question["choices"][0].value,
      4,
      "The first value is 4"
    );
  }
);

QUnit.test("MatrixDropdownColumn load choices from json", function(assert) {
  var question = new QuestionMatrixDropdownModel("matrix");
  var json = {
    type: "matrixdropdown",
    name: "frameworksRate",
    choices: ["Excelent", "Good", "Average", "Fair", "Poor"],
    columns: [
      {
        name: "using",
        title: "Do you use it?",
        choices: ["Yes", "No"],
        cellType: "radiogroup"
      },
      {
        name: "experience",
        title: "How long do you use it?",
        choices: [
          { value: 5, text: "3-5 years" },
          { value: 2, text: "1-2 years" },
          {
            value: 1,
            text: "less then a year"
          }
        ]
      }
    ],
    rows: [{ value: "reactjs" }]
  };
  new JsonObject().toObject(json, question);
  var rows = question.visibleRows;
  assert.equal(
    rows[0].cells[1].question["choices"].length,
    3,
    "There are 3 choices"
  );
  assert.equal(
    rows[0].cells[1].question["choices"][0].value,
    5,
    "The first value is 5"
  );
});

QUnit.test(
  "MatrixDynamic do not generate an error on setting a non-array value",
  function(assert) {
    var survey = new SurveyModel();
    var page = survey.addNewPage("page");
    var question = new QuestionMatrixDynamicModel("matrix");
    page.addElement(question);
    question.addColumn("col1");
    question.rowCount = 1;
    survey.setValue("matrix", "sometext");
    assert.equal(question.value, "sometext", "It does not generate the error");
  }
);

QUnit.test("matrixDynamic.addConditionNames", function(assert) {
  var names = [];
  var question = new QuestionMatrixDynamicModel("matrix");
  question.addColumn("col1");
  question.addColumn("col2");
  question.addConditionNames(names);
  assert.deepEqual(
    names,
    ["matrix[0].col1", "matrix[0].col2"],
    "addConditionNames work correctly for matrix dynamic"
  );
});
QUnit.test("matrixDropdown.addConditionNames", function(assert) {
  var names = [];
  var question = new QuestionMatrixDropdownModel("matrix");
  question.addColumn("col1");
  question.addColumn("col2");
  question.rows = ["row1", "row2"];
  question.addConditionNames(names);
  assert.deepEqual(
    names,
    [
      "matrix.row1.col1",
      "matrix.row1.col2",
      "matrix.row2.col1",
      "matrix.row2.col2"
    ],
    "addConditionNames work correctly for matrix dropdown"
  );
});

QUnit.test("matrixDynamic.getConditionJson", function(assert) {
  var names = [];
  var question = new QuestionMatrixDynamicModel("matrix");
  question.addColumn("col1");
  question.addColumn("col2");
  question.columns[0]["choices"] = [1, 2];
  question.columns[1].cellType = "checkbox";
  question.columns[1]["choices"] = [1, 2, 3];
  question.rowCount = 2;
  var json = question.getConditionJson("equals", "[0].col1");
  assert.deepEqual(json.choices, [1, 2], "column 1 get choices");
  assert.equal(json.type, "dropdown", "column 1 get type");
  json = question.getConditionJson("equals", "row.col2");
  assert.deepEqual(json.choices, [1, 2, 3], "column 2 get choices");
  assert.equal(json.type, "checkbox", "column 2 get type");
  json = question.getConditionJson("contains", "[0].col2");
  assert.equal(json.type, "radiogroup", "column 2 get type for contains");
});

QUnit.test("matrixDynamic.clearInvisibleValues", function(assert) {
  var names = [];
  var question = new QuestionMatrixDynamicModel("matrix");
  question.addColumn("col1");
  question.addColumn("col2");
  question.columns[0]["choices"] = [1, 2];
  question.columns[1]["choices"] = [1, 2, 3];
  question.rowCount = 2;
  question.value = [{ col1: 1, col2: 4 }, { col4: 1, col2: 2 }];
  question.clearIncorrectValues();
  assert.deepEqual(
    question.value,
    [{ col1: 1 }, { col2: 2 }],
    "clear unexisting columns and values"
  );
});

QUnit.test("matrixDropdown.clearInvisibleValues", function(assert) {
  var names = [];
  var question = new QuestionMatrixDropdownModel("matrix");
  question.addColumn("col1");
  question.addColumn("col2");
  question.columns[0]["choices"] = [1, 2];
  question.columns[1]["choices"] = [1, 2, 3];
  question.rows = ["row1", "row2"];
  question.value = {
    row1: { col1: 1, col2: 4 },
    row0: { col1: 1 },
    row2: { col4: 1, col2: 2 }
  };
  question.clearIncorrectValues();
  assert.deepEqual(
    question.value,
    { row1: { col1: 1 }, row2: { col2: 2 } },
    "clear unexisting columns and values"
  );
});
