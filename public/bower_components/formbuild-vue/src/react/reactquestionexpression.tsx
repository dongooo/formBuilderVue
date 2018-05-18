import * as React from "react";
import { Helpers } from "../helpers";
import { Base } from "../base";
import { SurveyQuestionElementBase } from "./reactquestionelement";
import { QuestionExpressionModel } from "../question_expression";
import { ReactQuestionFactory } from "./reactquestionfactory";

export class SurveyQuestionExpression extends SurveyQuestionElementBase {
  constructor(props: any) {
    super(props);
    this.state = { value: this.question.value };
  }
  protected get question(): QuestionExpressionModel {
    return this.questionBase as QuestionExpressionModel;
  }
  componentWillReceiveProps(nextProps: any) {
    super.componentWillReceiveProps(nextProps);
    this.setState({ value: this.question.value });
  }
  render(): JSX.Element {
    if (!this.question) return null;
    var cssClasses = this.question.cssClasses;
    return (
      <div id={this.question.inputId} className={cssClasses.root}>
        {this.question.displayValue}
      </div>
    );
  }
}

ReactQuestionFactory.Instance.registerQuestion("expression", props => {
  return React.createElement(SurveyQuestionExpression, props);
});
