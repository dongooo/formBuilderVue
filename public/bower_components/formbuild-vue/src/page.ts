import { JsonObject } from "./jsonobject";
import { HashTable, Helpers } from "./helpers";
import {
  Base,
  IPage,
  IConditionRunner,
  ISurvey,
  IElement,
  IQuestion,
  SurveyElement
} from "./base";
import { QuestionBase } from "./questionbase";
import { ConditionRunner } from "./conditions";
import { QuestionFactory } from "./questionfactory";
import { PanelModel, PanelModelBase, QuestionRowModel } from "./panel";
/**
 * The page object. It has elements collection, that contains questions and panels.
 */
export class PageModel extends PanelModelBase implements IPage {
  private hasShownValue: boolean = false;
  constructor(public name: string = "") {
    super(name);
  }
  public getType(): string {
    return "page";
  }
  public toString(): string {
    return this.name;
  }
  /**
   * The visible index of the page. It has values from 0 to visible page count - 1.
   * @see SurveyModel.visiblePages
   * @see SurveyModel.pages
   */
  public get visibleIndex(): number {
    return this.getPropertyValue("visibleIndex", -1);
  }
  public set visibleIndex(val: number) {
    this.setPropertyValue("visibleIndex", val);
  }
  /**
   * Returns true, if the page is started page in the survey. It can be shown on the start only and the end-user could not comeback to it after it passed it.
   */
  public get isStarted(): boolean {
    return this.survey && this.survey.isPageStarted(this);
  }
  getIsPageVisible(exceptionQuestion: IQuestion): boolean {
    if (this.isStarted) return false;
    return super.getIsPageVisible(exceptionQuestion);
  }
  public get num() {
    return this.getPropertyValue("num", -1);
  }
  public set num(val: number) {
    if (this.num == val) return;
    this.setPropertyValue("num", val);
    this.onNumChanged(val);
  }
  /**
   * Set this property to "hide" to make "Prev", "Next" and "Complete" buttons are invisible for this page. Set this property to "show" to make these buttons visible, even if survey showNavigationButtons property is false.
   * @see SurveyMode.showNavigationButtons
   */
  public get navigationButtonsVisibility(): string {
    return this.getPropertyValue("navigationButtonsVisibility", "inherit");
  }
  public set navigationButtonsVisibility(val: string) {
    this.setPropertyValue("navigationButtonsVisibility", val.toLowerCase());
  }
  protected getRenderedTitle(str: string): string {
    str = super.getRenderedTitle(str);
    if (this.num > 0) {
      str = this.num + ". " + str;
    }
    return str;
  }
  /**
   * The property returns true, if the page has been shown to the end-user.
   */
  public get wasShown(): boolean {
    return this.hasShownValue;
  }
  get hasShown(): boolean {
    return this.wasShown;
  }
  public setWasShown(val: boolean) {
    if (this.survey.isDesignMode) return;
    if (val == this.hasShownValue) return;
    if (val == true && this.areQuestionsRandomized) {
      this.randomizeElements();
    }
    this.hasShownValue = val;
  }
  private randomizeElements() {
    var oldElements = [];
    for (var i = 0; i < this.elements.length; i++) {
      oldElements.push(this.elements[i]);
    }
    var newElements = Helpers.randomizeArray<IElement>(oldElements);
    this.elements.splice(0, this.elements.length);
    for (var i = 0; i < newElements.length; i++) {
      this.elements.push(newElements[i]);
    }
  }
  /**
   * The property returns true, if the elements are randomized on the page
   * @see hasShown
   * @see questionsOrder
   * @see SurveyModel.questionsOrder
   */
  public get areQuestionsRandomized(): boolean {
    var order =
      this.questionsOrder == "default" && this.survey
        ? this.survey.questionsOrder
        : this.questionsOrder;
    return order == "random";
  }
  /**
   * Use this property to randomize questions. Set it to 'random' to randomize questions, 'initial' to keep them in the same order or 'default' to use the Survey questionsOrder property
   * @see SurveyModel.questionsOrder
   * @see areQuestionsRandomized
   */
  public get questionsOrder() {
    return this.getPropertyValue("questionsOrder", "default");
  }
  public set questionsOrder(val: string) {
    this.setPropertyValue("questionsOrder", val);
  }
  /**
   * Call it to focus the input on the first question
   */
  public focusFirstQuestion() {
    for (var i = 0; i < this.questions.length; i++) {
      var question = this.questions[i];
      if (!question.visible || !question.hasInput) continue;
      this.questions[i].focus();
      break;
    }
  }
  /**
   * Call it to focus the input of the first question that has an error.
   */
  public focusFirstErrorQuestion() {
    for (var i = 0; i < this.questions.length; i++) {
      if (
        !this.questions[i].visible ||
        this.questions[i].currentErrorCount == 0
      )
        continue;
      this.questions[i].focus(true);
      break;
    }
  }
  /**
   * Call it to scroll to the page top.
   */
  public scrollToTop() {
    SurveyElement.ScrollElementToTop(this.id);
  }
  /**
   * Time in seconds end-user spent on this page
   */
  public get timeSpent(): number {
    return this.getPropertyValue("timeSpent", 0);
  }
  public set timeSpent(val: number) {
    this.setPropertyValue("timeSpent", val);
  }
  /**
   * The maximum time in seconds that end-user has to complete the page. If the value is 0 or less, the end-user has unlimited number of time to finish the page.
   * @see startTimer
   * @see SurveyModel.maxTimeToFinishPage
   */
  public get maxTimeToFinish(): number {
    return this.getPropertyValue("maxTimeToFinish", 0);
  }
  public set maxTimeToFinish(val: number) {
    this.setPropertyValue("maxTimeToFinish", val);
  }
  protected onNumChanged(value: number) {}
  protected onVisibleChanged() {
    super.onVisibleChanged();
    if (this.survey != null) {
      this.survey.pageVisibilityChanged(this, this.visible);
    }
  }
}

JsonObject.metaData.addClass(
  "page",
  [
    {
      name: "navigationButtonsVisibility",
      default: "inherit",
      choices: ["inherit", "show", "hide"]
    },
    {
      name: "questionsOrder",
      default: "default",
      choices: ["default", "initial", "random"]
    },
    { name: "maxTimeToFinish:number", default: 0 }
  ],
  function() {
    return new PageModel();
  },
  "panelbase"
);
