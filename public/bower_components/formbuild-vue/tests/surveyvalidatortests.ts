import {
  SurveyValidator,
  NumericValidator,
  EmailValidator,
  ValidatorResult
} from "../src/validator";
import { CustomError } from "../src/error";
import { SurveyModel } from "../src/survey";
import { QuestionTextModel } from "../src/question_text";
import { QuestionMultipleTextModel } from "../src/question_multipletext";
import { JsonObject } from "../src/jsonobject";

export default QUnit.module("Validators");

QUnit.test("Numeric validator", function(assert) {
  var validator = new NumericValidator();
  assert.notEqual(
    validator.validate("s5").error,
    null,
    "Could not convert to numeric"
  );
  assert.equal(validator.validate(5), null, "There are no limits (non-zero)");
  assert.equal(validator.validate(0), null, "There are no limits (zero)");
  assert.equal(
    validator.validate("5").value,
    5,
    "Convert to numeric (non-zero)"
  );
  assert.equal(
    validator.validate("5").error,
    null,
    "There is no error (non-zero)"
  );
  assert.equal(validator.validate("0").value, 0, "Convert to numeric (zero)");
  assert.equal(validator.validate("0").error, null, "There is no error (zero)");

  validator.minValue = 10;
  validator.maxValue = 20;
  assert.notEqual(
    validator.validate(5).error,
    null,
    "Value is too low. Limits are not 0."
  );
  assert.notEqual(
    validator.validate(25).error,
    null,
    "Value is too high. Limits are not 0."
  );
  assert.equal(
    validator.validate("15").error,
    null,
    "Value is between minValue and maxValue. Limits are not 0."
  );
  assert.equal(
    validator.validate(15),
    null,
    "Value is between minValue and maxValue. Return no errors. Limits are not 0."
  );

  validator.minValue = 0;
  validator.maxValue = 20;
  assert.notEqual(
    validator.validate(-1).error,
    null,
    "Value is too low. Low limit is 0."
  );
  assert.notEqual(
    validator.validate(25).error,
    null,
    "Value is too high. Low limit is 0."
  );
  assert.equal(
    validator.validate("15").error,
    null,
    "Value is between minValue and maxValue. Low limit is 0."
  );
  assert.equal(
    validator.validate(15),
    null,
    "Value is between minValue and maxValue. Return no errors. Low limit is 0."
  );

  validator.minValue = -20;
  validator.maxValue = 0;
  assert.notEqual(
    validator.validate(-21).error,
    null,
    "Value is too low. High limit is 0."
  );
  assert.notEqual(
    validator.validate(1).error,
    null,
    "Value is too high. High limit is 0."
  );
  assert.equal(
    validator.validate("-5").error,
    null,
    "Value is between minValue and maxValue. High limit is 0."
  );
  assert.equal(
    validator.validate(-5),
    null,
    "Value is between minValue and maxValue. Return no errors. High limit is 0."
  );
});

QUnit.test("Email validator", function(assert) {
  var validator = new EmailValidator();
  assert.equal(
    validator.validate("my@mail.com"),
    null,
    "Could convert the correct e-mail"
  );
  assert.notEqual(
    validator.validate("@mail.com").error,
    null,
    "Could convert the incorrect correct e-mail"
  );
});

export class CamelCaseValidator extends SurveyValidator {
  public getType(): string {
    return "CamelCaseValidator";
  }
  public validate(value: any, name: string = null): ValidatorResult {
    if (!value) return null;
    if (value.indexOf("CamelCase") < 0)
      return new ValidatorResult(value, new CustomError("No Camel Case"));
    return null;
  }
}

JsonObject.metaData.addClass(
  "CamelCaseValidator",
  [],
  function() {
    return new CamelCaseValidator();
  },
  "surveyvalidator"
);

QUnit.test("Support camel names in validators, Bug#994", function(assert) {
  var json = {
    elements: [
      {
        type: "text",
        name: "qSame",
        validators: [{ type: "CamelCaseValidator" }]
      },
      {
        type: "text",
        name: "qLow",
        validators: [{ type: "camelcasevalidator" }]
      },
      {
        type: "text",
        name: "qUpper",
        validators: [{ type: "CAMELCASEVALIDATOR" }]
      }
    ]
  };
  var survey = new SurveyModel(json);
  var qSame = <QuestionTextModel>survey.getQuestionByName("qSame");
  var qLow = <QuestionTextModel>survey.getQuestionByName("qLow");
  var qUpper = <QuestionTextModel>survey.getQuestionByName("qUpper");
  assert.equal(qSame.validators.length, 1, "same case - validtor is here");
  assert.equal(qLow.validators.length, 1, "low case - validtor is here");
  assert.equal(qUpper.validators.length, 1, "upper case - validtor is here");
});

QUnit.test(
  "Validators and isRequired in multipletext items, Bug#1055",
  function(assert) {
    var json = {
      questions: [
        {
          type: "multipletext",
          name: "pricelimit",
          items: [
            {
              name: "leastamount",
              validators: [
                {
                  type: "numeric",
                  minValue: 0,
                  maxValue: 100
                }
              ]
            },
            {
              name: "mostamount",
              isRequired: true,
              validators: [
                {
                  type: "numeric",
                  minValue: 0,
                  maxValue: 100
                }
              ]
            }
          ]
        }
      ]
    };
    var survey = new SurveyModel(json);
    var question = <QuestionMultipleTextModel>survey.getQuestionByName(
      "pricelimit"
    );
    question.items[1].value = 3;
    assert.equal(
      question.hasErrors(),
      false,
      "Everything is fine, there is no errors"
    );
  }
);
