import {
  frameworks,
  url,
  setOptions,
  initSurvey,
  getSurveyResult
} from "../settings";
import { Selector, ClientFunction } from "testcafe";
const assert = require("assert");
const title = `matrix`;

const json = {
  questions: [
    {
      type: "matrix",
      name: "Quality",
      title:
        "Please indicate if you agree or disagree with the following statements",
      columns: [
        { value: 1, text: "Strongly Disagree" },
        { value: 2, text: "Disagree" },
        { value: 3, text: "Neutral" },
        { value: 4, text: "Agree" },
        { value: 5, text: "Strongly Agree" }
      ],
      rows: [
        { value: "affordable", text: "Product is affordable" },
        { value: "does what it claims", text: "Product does what it claims" },
        {
          value: "better then others",
          text: "Product is better than other products on the market"
        },
        { value: "easy to use", text: "Product is easy to use" }
      ]
    }
  ]
};

frameworks.forEach(framework => {
  fixture`${framework} ${title}`.page`${url}${framework}`.beforeEach(
    async t => {
      await initSurvey(framework, json);
    }
  );

  test(`choose value`, async t => {
    let surveyResult;

    await t
      .click(`input[name="Quality_easy to use"][value="5"]`)
      .click(`input[value=Complete]`);

    surveyResult = await getSurveyResult();
    assert.equal(surveyResult.Quality[`easy to use`], `5`);
  });

  test(`choose several values`, async t => {
    let surveyResult;

    await t
      .click(`input[name="Quality_does what it claims"][value="4"]`)
      .click(`input[name="Quality_easy to use"][value="5"]`)
      .click(`input[value=Complete]`);

    surveyResult = await getSurveyResult();
    assert.deepEqual(surveyResult.Quality, {
      "does what it claims": "4",
      "easy to use": "5"
    });
  });

  test(`require answer for all rows`, async t => {
    let surveyResult;
    const getPosition = ClientFunction(() =>
      document.documentElement.innerHTML.indexOf(
        "Please answer questions in all rows"
      )
    );
    let position;

    await setOptions("Quality", { isAllRowRequired: true });
    await t.click(`input[value=Complete]`);

    position = await getPosition();
    assert.notEqual(position, -1);

    surveyResult = await getSurveyResult();
    assert.equal(typeof surveyResult, `undefined`);

    await t
      .click(`input[name="Quality_affordable"][value="3"]`)
      .click(`input[name="Quality_does what it claims"][value="4"]`)
      .click(`input[name="Quality_better then others"][value="2"]`)
      .click(`input[name="Quality_easy to use"][value="5"]`)
      .click(`input[value=Complete]`);

    surveyResult = await getSurveyResult();
    assert.deepEqual(surveyResult.Quality, {
      affordable: "3",
      "does what it claims": "4",
      "better then others": "2",
      "easy to use": "5"
    });
  });

  test(`checked class`, async t => {
    const isCheckedClassExistsByIndex = ClientFunction(index =>
      document
        .querySelector(`fieldset tbody tr td:nth-child(${index + 1}) label`)
        .classList.contains("checked")
    );

    assert.equal(await isCheckedClassExistsByIndex(2), false);
    assert.equal(await isCheckedClassExistsByIndex(3), false);

    await t.click(`input[name="Quality_affordable"][value="2"]`);

    assert.equal(await isCheckedClassExistsByIndex(2), true);
    assert.equal(await isCheckedClassExistsByIndex(3), false);

    await t.click(`input[name="Quality_affordable"][value="3"]`);

    assert.equal(await isCheckedClassExistsByIndex(2), false);
    assert.equal(await isCheckedClassExistsByIndex(3), true);
  });
});
