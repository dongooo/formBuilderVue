import Vue from "vue";
import { FormBuildModel } from "../formbuild";
import { FormBuildWindowModel } from "../formBuildWindow";
import { PageModel } from "../page";
import { IQuestion, IElement } from "../base";
import { baseCss } from "../defaultCss/basecss";

export class VueFormBuildModel extends FormBuildModel {
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
    return baseCss.getCss();
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

export class VueFormBuildWindowModel extends FormBuildWindowModel {
  constructor(jsonObj: any, initialModel: FormBuildModel = null) {
    super(jsonObj, initialModel);
  }
  protected createSurvey(jsonObj: any): FormBuildModel {
    return new VueFormBuildModel(jsonObj);
  }
}

FormBuildModel.platform = "vue";
