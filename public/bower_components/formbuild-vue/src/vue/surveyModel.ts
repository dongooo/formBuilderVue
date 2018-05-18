import Vue from "vue";
import { SurveyModel } from "../survey";
import { SurveyWindowModel } from "../surveyWindow";
import { PageModel } from "../page";
import { IQuestion, IElement } from "../base";
import { surveyCss } from "../defaultCss/cssstandard";

export class VueSurveyModel extends SurveyModel {
  renderCallback: () => void;
  public render() {
    if (this.renderCallback) {
      this.renderCallback();
    }
  }
  protected onLoadSurveyFromService() {
    this.render();
  }
  protected onLoadingSurveyFromService() {
    this.render();
  }
  get css() {
    return surveyCss.getCss();
  }
  set css(value: any) {
    this.mergeValues(value, this.css);
  }
  protected setDataValueCore(valuesHash: any, key: string, value: any) {
    Vue.set(valuesHash, key, value);
  }
  protected setPropertyValueCore(propertiesHash: any, name: string, val: any) {
    Vue.set(propertiesHash, name, val);
  }
  questionAdded(
    question: IQuestion,
    index: number,
    parentPanel: any,
    rootPanel: any
  ) {
    var q: any;
    q = question;
    q.setPropertyValueCoreHandler = function(
      propertiesHash: any,
      name: string,
      val: any
    ) {
      Vue.set(propertiesHash, name, val);
    };
    super.questionAdded(question, index, parentPanel, rootPanel);
  }
  protected doOnPageAdded(page: PageModel) {
    var p: any;
    p = page;
    p.setPropertyValueCoreHandler = function(
      propertiesHash: any,
      name: string,
      val: any
    ) {
      Vue.set(propertiesHash, name, val);
    };
    super.doOnPageAdded(page);
  }
  panelAdded(panel: IElement, index: number, parentPanel: any, rootPanel: any) {
    var p: any;
    p = panel;
    p.setPropertyValueCoreHandler = function(
      propertiesHash: any,
      name: string,
      val: any
    ) {
      Vue.set(propertiesHash, name, val);
    };
    super.panelAdded(panel, index, parentPanel, rootPanel);
  }
}

export class VueSurveyWindowModel extends SurveyWindowModel {
  constructor(jsonObj: any, initialModel: SurveyModel = null) {
    super(jsonObj, initialModel);
  }
  protected createSurvey(jsonObj: any): SurveyModel {
    return new VueSurveyModel(jsonObj);
  }
}

SurveyModel.platform = "vue";
