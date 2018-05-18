import {
  JsonObject,
  CustomPropertiesCollection,
  JsonObjectProperty
} from "./jsonobject";
import { Question } from "./question";
import { HashTable, Helpers } from "./helpers";
import {
  Base,
  ISurveyData,
  ISurvey,
  ISurveyImpl,
  ITextProcessor,
  SurveyError
} from "./base";
import { TextPreProcessor, TextPreProcessorValue } from "./textPreProcessor";
import { ProcessValue } from "./conditionProcessValue";
import { ItemValue } from "./itemvalue";
import { surveyLocalization } from "./surveyStrings";
import {
  QuestionSelectBase,
  QuestionCheckboxBase
} from "./question_baseselect";
import { QuestionDropdownModel } from "./question_dropdown";
import { QuestionCheckboxModel } from "./question_checkbox";
import { QuestionRadiogroupModel } from "./question_radiogroup";
import { QuestionTextModel } from "./question_text";
import { QuestionCommentModel } from "./question_comment";
import { QuestionBooleanModel } from "./question_boolean";
import { ChoicesRestfull } from "./choicesRestfull";
import { QuestionFactory } from "./questionfactory";
import { ILocalizableOwner, LocalizableString } from "./localizablestring";
import { SurveyValidator } from "./validator";
import { CustomWidgetCollection } from "./questionCustomWidgets";

export interface IMatrixDropdownData {
  onRowChanged(
    row: MatrixDropdownRowModelBase,
    columnName: string,
    newRowValue: any
  );
  validateCell(
    row: MatrixDropdownRowModelBase,
    columnName: string,
    rowValue: any
  ): SurveyError;
  columns: Array<MatrixDropdownColumn>;
  createQuestion(
    row: MatrixDropdownRowModelBase,
    column: MatrixDropdownColumn
  ): Question;
  getLocale(): string;
  getMarkdownHtml(text: string): string;
  getSurvey(): ISurvey;
}

export interface IMatrixColumnOwner extends ILocalizableOwner {
  getRequiredText(): string;
  onColumnPropertiesChanged(column: MatrixDropdownColumn);
  getCellType(): string;
}

function onUpdateSelectBaseCellQuestion(
  cellQuestion: QuestionSelectBase,
  column: MatrixDropdownColumn,
  question: QuestionMatrixDropdownModelBase,
  data: any
) {
  if (cellQuestion.hasOther) {
    cellQuestion.storeOthersAsComment = false;
  }
  if (
    (!cellQuestion.choices || cellQuestion.choices.length == 0) &&
    cellQuestion.choicesByUrl.isEmpty
  ) {
    cellQuestion.choices = question.choices;
  }
  if (!cellQuestion.choicesByUrl.isEmpty) {
    cellQuestion.choicesByUrl.run(data);
  }
}
export var matrixDropdownColumnTypes = {
  dropdown: {
    properties: [
      "choices",
      "choicesOrder",
      "choicesByUrl",
      "optionsCaption",
      "otherText"
    ],
    onCellQuestionUpdate: (cellQuestion, column, question, data) => {
      onUpdateSelectBaseCellQuestion(cellQuestion, column, question, data);
      if (!cellQuestion.optionsCaption)
        cellQuestion.optionsCaption = question.optionsCaption;
    }
  },
  checkbox: {
    properties: ["choices", "choicesOrder", "choicesByUrl", "otherText"],
    onCellQuestionUpdate: (cellQuestion, column, question, data) => {
      onUpdateSelectBaseCellQuestion(cellQuestion, column, question, data);
      cellQuestion.colCount =
        column.colCount > -1 ? column.colCount : question.columnColCount;
    }
  },
  radiogroup: {
    properties: ["choices", "choicesOrder", "choicesByUrl", "otherText"],
    onCellQuestionUpdate: (cellQuestion, column, question, data) => {
      onUpdateSelectBaseCellQuestion(cellQuestion, column, question, data);
      cellQuestion.colCount =
        column.colCount > -1 ? column.colCount : question.columnColCount;
    }
  },
  text: {
    properties: ["placeHolder", "inputType"],
    onCellQuestionUpdate: (cellQuestion, column, question, data) => {}
  },
  comment: {
    properties: ["placeHolder"],
    onCellQuestionUpdate: (cellQuestion, column, question, data) => {}
  },
  boolean: {
    properties: ["defaultValue"],
    onCellQuestionUpdate: (cellQuestion, column, question, data) => {
      cellQuestion.showTitle = true;
    }
  },
  expression: {
    properties: ["expression"],
    onCellQuestionUpdate: (cellQuestion, column, question, data) => {}
  }
};

export class MatrixDropdownColumn extends Base implements ILocalizableOwner {
  public static getColumnTypes(): Array<string> {
    var res = [];
    for (var key in matrixDropdownColumnTypes) {
      res.push(key);
    }
    return res;
  }
  private templateQuestionValue: Question;
  private colOwnerValue: IMatrixColumnOwner = null;

  constructor(name: string, title: string = null) {
    super();
    this.updateTemplateQuestion();
    this.name = name;
    if (title) this.title = title;
  }
  getDynamicPropertyName(): string {
    return "cellType";
  }
  getDynamicType(): string {
    return this.calcCellQuestionType();
  }
  getDynamicProperties(): Array<string> {
    var qType = this.calcCellQuestionType();
    var qDefinition = matrixDropdownColumnTypes[qType];
    if (qDefinition) return qDefinition.properties;
    return [];
  }
  public get colOwner(): IMatrixColumnOwner {
    return this.colOwnerValue;
  }
  public set colOwner(value: IMatrixColumnOwner) {
    this.colOwnerValue = value;
    this.updateTemplateQuestion();
  }
  public getType() {
    return "matrixdropdowncolumn";
  }
  public get cellType(): string {
    return this.getPropertyValue("cellType", "default");
  }
  public set cellType(val: string) {
    val = val.toLocaleLowerCase();
    this.setPropertyValue("cellType", val);
    this.updateTemplateQuestion();
  }
  public get templateQuestion() {
    return this.templateQuestionValue;
  }
  public get name() {
    return this.templateQuestion.name;
  }
  public set name(val: string) {
    this.templateQuestion.name = val;
  }
  public get title(): string {
    return this.templateQuestion.title;
  }
  public set title(val: string) {
    this.templateQuestion.title = val;
  }
  public get locTitle() {
    return this.templateQuestion.locTitle;
  }
  public get fullTitle(): string {
    return this.getFullTitle(this.locTitle.textOrHtml);
  }
  public getFullTitle(str: string): string {
    if (!str) str = this.name;
    if (this.isRequired) {
      var requireText = this.colOwner ? this.colOwner.getRequiredText() : "";
      if (requireText) requireText += " ";
      str = requireText + str;
    }
    return str;
  }
  public get isRequired(): boolean {
    return this.templateQuestion.isRequired;
  }
  public set isRequired(val: boolean) {
    this.templateQuestion.isRequired = val;
  }
  public get readOnly(): boolean {
    return this.templateQuestion.readOnly;
  }
  public set readOnly(val: boolean) {
    this.templateQuestion.readOnly = val;
  }
  public get hasOther(): boolean {
    return this.templateQuestion.hasOther;
  }
  public set hasOther(val: boolean) {
    this.templateQuestion.hasOther = val;
  }
  public get visibleIf(): string {
    return this.templateQuestion.visibleIf;
  }
  public set visibleIf(val: string) {
    this.templateQuestion.visibleIf = val;
  }
  public get enableIf(): string {
    return this.templateQuestion.enableIf;
  }
  public set enableIf(val: string) {
    this.templateQuestion.enableIf = val;
  }
  public get validators(): Array<SurveyValidator> {
    return this.templateQuestion.validators;
  }
  public set validators(val: Array<SurveyValidator>) {
    this.templateQuestion.validators = val;
  }

  public get minWidth(): string {
    return this.getPropertyValue("minWidth", "");
  }
  public set minWidth(val: string) {
    this.setPropertyValue("minWidth", val);
  }
  public get colCount(): number {
    return this.getPropertyValue("colCount", -1);
  }
  public set colCount(val: number) {
    if (val < -1 || val > 4) return;
    this.setPropertyValue("colCount", val);
  }
  public getLocale(): string {
    return this.colOwner ? this.colOwner.getLocale() : "";
  }
  public getMarkdownHtml(text: string) {
    return this.colOwner ? this.colOwner.getMarkdownHtml(text) : null;
  }
  public createCellQuestion(data: any): Question {
    var qType = this.calcCellQuestionType();
    var cellQuestion = <Question>this.createNewQuestion(qType);
    this.updateCellQuestion(cellQuestion, data);
    return cellQuestion;
  }
  public updateCellQuestion(cellQuestion: Question, data: any) {
    this.setQuestionProperties(cellQuestion);
    var qType = this.calcCellQuestionType();
    var qDefinition = matrixDropdownColumnTypes[qType];
    if (qDefinition && qDefinition["onCellQuestionUpdate"]) {
      qDefinition["onCellQuestionUpdate"](
        cellQuestion,
        this,
        this.colOwner,
        data
      );
    }
  }
  defaultCellTypeChanged() {
    this.updateTemplateQuestion();
  }
  protected calcCellQuestionType(): string {
    if (this.cellType !== "default") return this.cellType;
    if (this.colOwner) return this.colOwner.getCellType();
    return "dropdown";
  }
  protected updateTemplateQuestion() {
    var prevCellType = this.templateQuestion
      ? this.templateQuestion.getType()
      : "";
    var curCellType = this.calcCellQuestionType();
    if (curCellType === prevCellType) return;
    if (this.templateQuestion) {
      this.removeProperties(prevCellType);
    }
    this.templateQuestionValue = this.createNewQuestion(curCellType);
    this.templateQuestion.locOwner = this;
    this.addProperties(curCellType);
    var self = this;
    this.templateQuestion.locTitle.onRenderedHtmlCallback = function(text) {
      return self.getFullTitle(text);
    };
    this.templateQuestion.onPropertyChanged.add(function() {
      self.doColumnPropertiesChanged();
    });
  }
  protected createNewQuestion(cellType: string): Question {
    var question = <Question>JsonObject.metaData.createClass(cellType);
    this.setQuestionProperties(question);
    return question;
  }
  protected setQuestionProperties(question: Question) {
    if (this.templateQuestion) {
      var json = new JsonObject().toJsonObject(this.templateQuestion);
      json.type = question.getType();
      new JsonObject().toObject(json, question);
    }
  }
  protected propertyValueChanged(name: string, oldValue: any, newValue: any) {
    super.propertyValueChanged(name, oldValue, newValue);
    this.doColumnPropertiesChanged();
  }
  private doColumnPropertiesChanged() {
    if (this.colOwner != null && !this.isLoadingFromJson) {
      this.colOwner.onColumnPropertiesChanged(this);
    }
  }
  private getProperties(curCellType: string): Array<JsonObjectProperty> {
    var qDef = matrixDropdownColumnTypes[curCellType];
    if (!qDef || !qDef.properties) return [];
    return JsonObject.metaData.findProperties(curCellType, qDef.properties);
  }
  private removeProperties(curCellType: string) {
    var properties = this.getProperties(curCellType);
    for (var i = 0; i < properties.length; i++) {
      var prop = properties[i];
      delete this[prop.name];
      if (prop.serializationProperty) {
        delete this[prop.serializationProperty];
      }
    }
  }
  private addProperties(curCellType: string) {
    var question = this.templateQuestion;
    var properties = this.getProperties(curCellType);
    for (var i = 0; i < properties.length; i++) {
      var prop = properties[i];
      this.addProperty(question, prop.name, false);
      if (prop.serializationProperty) {
        this.addProperty(question, prop.serializationProperty, true);
      }
    }
  }
  private addProperty(
    question: Question,
    propName: string,
    isReadOnly: boolean
  ) {
    var desc = {
      configurable: true,
      get: function() {
        return question[propName];
      }
    };
    if (!isReadOnly) {
      desc["set"] = function(v: any) {
        question[propName] = v;
      };
    }
    Object.defineProperty(this, propName, desc);
  }
}

export class MatrixDropdownCell {
  private questionValue: Question;
  constructor(
    public column: MatrixDropdownColumn,
    public row: MatrixDropdownRowModelBase,
    public data: IMatrixDropdownData
  ) {
    this.questionValue = data.createQuestion(this.row, this.column);
    this.questionValue.validateValueCallback = function() {
      return data.validateCell(row, column.name, row.value);
    };
    CustomPropertiesCollection.getProperties(column.getType()).forEach(
      property => {
        let propertyName = property.name;
        if (
          column[propertyName] !== undefined &&
          this.questionValue.getPropertyValue(propertyName, null) == null
        ) {
          this.questionValue[propertyName] = column[propertyName];
        }
      }
    );
    Object.keys(column).forEach(key => {});
    this.questionValue.updateCustomWidget();
  }
  public get question(): Question {
    return this.questionValue;
  }
  public get value(): any {
    return this.question.value;
  }
  public set value(value: any) {
    this.question.value = value;
  }
  public runCondition(values: HashTable<any>) {
    this.question.runCondition(values);
  }
}

export class MatrixDropdownRowModelBase
  implements ISurveyData, ISurveyImpl, ILocalizableOwner, ITextProcessor {
  private static idCounter: number = 1;
  private static getId(): string {
    return "srow_" + MatrixDropdownRowModelBase.idCounter++;
  }
  protected data: IMatrixDropdownData;
  private rowValues: HashTable<any> = {};
  private isSettingValue: boolean = false;
  private idValue: string;
  private textPreProcessor;

  public cells: Array<MatrixDropdownCell> = [];

  constructor(data: IMatrixDropdownData, value: any) {
    this.data = data;
    this.value = value;
    this.textPreProcessor = new TextPreProcessor();
    var self = this;
    this.textPreProcessor.onProcess = function(
      textValue: TextPreProcessorValue
    ) {
      self.getProcessedTextValue(textValue);
    };
    for (var i = 0; i < this.data.columns.length; i++) {
      if (this.rowValues[this.data.columns[i].name] === undefined) {
        this.rowValues[this.data.columns[i].name] = null;
      }
    }
    this.idValue = MatrixDropdownRowModelBase.getId();
  }
  public get id(): string {
    return this.idValue;
  }
  public get rowName() {
    return null;
  }
  public get value(): any {
    return this.rowValues;
  }
  getAllValues(): any {
    return this.value;
  }
  public set value(value: any) {
    this.isSettingValue = true;
    this.rowValues = {};
    if (value != null) {
      for (var key in value) {
        this.rowValues[key] = value[key];
      }
    }
    for (var i = 0; i < this.cells.length; i++) {
      this.cells[i].question.onSurveyValueChanged(
        this.getValue(this.cells[i].column.name)
      );
    }
    this.isSettingValue = false;
  }
  public onReadOnlyChanged() {
    for (var i = 0; i < this.cells.length; i++) {
      this.cells[i].question.onReadOnlyChanged();
    }
  }
  public onAnyValueChanged(name: string) {
    for (var i = 0; i < this.cells.length; i++) {
      this.cells[i].question.onAnyValueChanged(name);
    }
  }
  public getValue(name: string): any {
    return this.rowValues[name];
  }
  public setValue(name: string, newValue: any) {
    if (this.isSettingValue) return;
    if (newValue === "") newValue = null;
    if (newValue != null) {
      this.rowValues[name] = newValue;
    } else {
      delete this.rowValues[name];
    }
    this.data.onRowChanged(this, name, this.value);
    this.onAnyValueChanged("row");
  }
  public getComment(name: string): string {
    var result = this.getValue(name + Base.commentPrefix);
    return result ? result : "";
  }
  public setComment(name: string, newValue: string) {
    this.setValue(name + Base.commentPrefix, newValue);
  }
  public get isEmpty() {
    var val = this.value;
    if (Helpers.isValueEmpty(val)) return true;
    for (var key in val) {
      if (val[key] !== undefined && val[key] !== null) return false;
    }
    return true;
  }
  public getQuestionByColumn(column: MatrixDropdownColumn): Question {
    for (var i = 0; i < this.cells.length; i++) {
      if (this.cells[i].column == column) return this.cells[i].question;
    }
    return null;
  }
  public getQuestionByColumnName(columnName: string): Question {
    for (var i = 0; i < this.cells.length; i++) {
      if (this.cells[i].column.name == columnName)
        return this.cells[i].question;
    }
    return null;
  }
  public clearIncorrectValues() {
    var val = this.value;
    var newVal = {};
    for (var key in val) {
      var question = this.getQuestionByColumnName(key);
      if (question) {
        var qVal = question.value;
        question.clearIncorrectValues();
        if (!Helpers.isTwoValueEquals(qVal, question.value)) {
          this.setValue(key, question.value);
        }
      } else {
        this.setValue(key, null);
      }
    }
  }
  public getLocale(): string {
    return this.data ? this.data.getLocale() : "";
  }
  public getMarkdownHtml(text: string) {
    return this.data ? this.data.getMarkdownHtml(text) : null;
  }
  public onLocaleChanged() {
    for (var i = 0; i < this.cells.length; i++) {
      this.cells[i].question.onLocaleChanged();
    }
  }
  public runCondition(values: HashTable<any>) {
    values["row"] = this.value;
    for (var i = 0; i < this.cells.length; i++) {
      this.cells[i].runCondition(values);
    }
  }
  protected buildCells() {
    var columns = this.data.columns;
    for (var i = 0; i < columns.length; i++) {
      var column = columns[i];
      this.cells.push(this.createCell(column));
    }
  }
  protected createCell(column: MatrixDropdownColumn): MatrixDropdownCell {
    return new MatrixDropdownCell(column, this, this.data);
  }
  geSurveyData(): ISurveyData {
    return this;
  }
  getSurvey(): ISurvey {
    return this.data ? this.data.getSurvey() : null;
  }
  //ITextProcessor
  private getProcessedTextValue(textValue: TextPreProcessorValue) {
    var firstName = new ProcessValue().getFirstName(textValue.name);
    textValue.isExists = firstName == "row";
    textValue.canProcess = textValue.isExists;
    if (!textValue.isExists) return;
    //name should start with the row
    var values = { row: this.value };
    textValue.value = new ProcessValue().getValue(textValue.name, values);
  }
  getTextProcessor(): ITextProcessor {
    return this;
  }
  processText(text: string, returnDisplayValue: boolean): string {
    text = this.textPreProcessor.process(text, returnDisplayValue);
    return this.getSurvey().processText(text, returnDisplayValue);
  }
  processTextEx(text: string, returnDisplayValue: boolean): any {
    text = this.processText(text, returnDisplayValue);
    var hasAllValuesOnLastRun = this.textPreProcessor.hasAllValuesOnLastRun;
    var res = this.getSurvey().processTextEx(text, returnDisplayValue);
    res.hasAllValuesOnLastRun =
      res.hasAllValuesOnLastRun && hasAllValuesOnLastRun;
    return res;
  }
}

/**
 * A base class for matrix dropdown and matrix dynamic questions.
 */
export class QuestionMatrixDropdownModelBase extends Question
  implements IMatrixDropdownData {
  public static addDefaultColumns(matrix: QuestionMatrixDropdownModelBase) {
    var colNames = QuestionFactory.DefaultColums;
    for (var i = 0; i < colNames.length; i++) matrix.addColumn(colNames[i]);
  }
  private columnsValue: Array<MatrixDropdownColumn>;
  private choicesValue: Array<ItemValue>;
  private isRowChanging = false;
  protected generatedVisibleRows: Array<MatrixDropdownRowModelBase> = null;
  columnsChangedCallback: () => void;
  updateCellsCallback: () => void;

  constructor(public name: string) {
    super(name);
    var self = this;
    this.columnsValue = this.createNewArray("columns", function(item) {
      item.colOwner = self;
    });
    this.choicesValue = this.createItemValues("choices");
    this.createLocalizableString("optionsCaption", this);
    this.registerFunctionOnPropertyValueChanged("columns", function() {
      self.generatedVisibleRows = null;
      self.fireCallback(self.columnsChangedCallback);
    });
  }
  public getType(): string {
    return "matrixdropdownbase";
  }
  public get isAllowTitleLeft(): boolean {
    return false;
  }
  /**
   * The list of matrix columns.
   */
  public get columns(): Array<MatrixDropdownColumn> {
    return this.columnsValue;
  }
  public set columns(value: Array<MatrixDropdownColumn>) {
    this.setPropertyValue("columns", value);
  }
  protected onMatrixRowCreated(row: MatrixDropdownRowModelBase) {
    if (!this.survey) return;
    var options = {
      rowValue: row.value,
      row: row,
      column: null,
      columnName: null,
      cell: null,
      cellQuestion: null,
      value: null
    };
    for (var i = 0; i < this.columns.length; i++) {
      options.column = this.columns[i];
      options.columnName = options.column.name;
      var cell = row.cells[i];
      options.cell = cell;
      options.cellQuestion = cell.question;
      options.value = cell.value;
      this.survey.matrixCellCreated(this, options);
    }
  }
  /**
   * Use this property to change the default cell type.
   */
  public get cellType(): string {
    return this.getPropertyValue("cellType", "dropdown");
  }
  public set cellType(val: string) {
    val = val.toLowerCase();
    if (this.cellType == val) return;
    this.setPropertyValue("cellType", val);
    this.updateColumnsCellType();
    this.fireCallback(this.updateCellsCallback);
  }
  private updateColumnsCellType() {
    for (var i = 0; i < this.columns.length; i++) {
      this.columns[i].defaultCellTypeChanged();
    }
  }
  /**
   * The default column count for radiogroup and checkbox  cell types.
   */
  public get columnColCount(): number {
    return this.getPropertyValue("columnColCount", 0);
  }
  public set columnColCount(value: number) {
    if (value < 0 || value > 4) return;
    this.setPropertyValue("columnColCount", value);
    this.fireCallback(this.updateCellsCallback);
  }
  /**
   * Use this property to set the mimimum column width.
   */
  public get columnMinWidth(): string {
    return this.getPropertyValue("columnMinWidth", "");
  }
  public set columnMinWidth(val: string) {
    this.setPropertyValue("columnMinWidth", val);
  }
  /**
   * Set this property to true to show the horizontal scroll.
   */
  public get horizontalScroll(): boolean {
    return this.getPropertyValue("horizontalScroll", false);
  }
  public set horizontalScroll(val: boolean) {
    this.setPropertyValue("horizontalScroll", val);
  }

  public getRequiredText(): string {
    return this.survey ? this.survey.requiredText : "";
  }
  onColumnPropertiesChanged(column: MatrixDropdownColumn) {
    if (!this.generatedVisibleRows) return;
    for (var i = 0; i < this.generatedVisibleRows.length; i++) {
      var row = this.generatedVisibleRows[i];
      for (var j = 0; j < row.cells.length; j++) {
        if (row.cells[j].column !== column) continue;
        column.updateCellQuestion(row.cells[j].question, row);
        break;
      }
    }
  }
  getCellType(): string {
    return this.cellType;
  }
  public getConditionJson(operator: string = null, path: string = null): any {
    if (!path) return super.getConditionJson();
    var columnName = "";
    for (var i = path.length - 1; i >= 0; i--) {
      if (path[i] == ".") break;
      columnName = path[i] + columnName;
    }
    var column = this.getColumnByName(columnName);
    if (!column) return null;
    var question = column.createCellQuestion(null);
    if (!question) return null;
    return question.getConditionJson(operator);
  }
  public clearIncorrectValues() {
    var rows = this.visibleRows;
    if (!rows) return;
    for (var i = 0; i < rows.length; i++) {
      rows[i].clearIncorrectValues();
    }
  }
  public runCondition(values: HashTable<any>) {
    super.runCondition(values);
    this.runCellsCondition(values);
  }
  protected runCellsCondition(values: HashTable<any>) {
    if (!this.generatedVisibleRows) return;
    var newValues = {};
    if (values && values instanceof Object) {
      newValues = JSON.parse(JSON.stringify(values));
    }
    newValues["row"] = {};
    var rows = this.generatedVisibleRows;
    for (var i = 0; i < rows.length; i++) {
      rows[i].runCondition(newValues);
    }
  }
  public onLocaleChanged() {
    super.onLocaleChanged();
    for (var i = 0; i < this.columns.length; i++) {
      this.columns[i].onLocaleChanged();
    }
    var rows = this.visibleRows;
    if (!rows) return;
    for (var i = 0; i < rows.length; i++) {
      rows[i].onLocaleChanged();
    }
    this.fireCallback(this.updateCellsCallback);
  }
  /**
   * Returns the column by it's name. Retuns null if a column with this name doesn't exist.
   * @param column
   */
  public getColumnByName(columnName: string): MatrixDropdownColumn {
    for (var i = 0; i < this.columns.length; i++) {
      if (this.columns[i].name == columnName) return this.columns[i];
    }
    return null;
  }
  getColumnName(columnName: string): MatrixDropdownColumn {
    return this.getColumnByName(columnName);
  }
  /**
   * Returns the column width.
   * @param column
   */
  public getColumnWidth(column: MatrixDropdownColumn): string {
    return column.minWidth ? column.minWidth : this.columnMinWidth;
  }
  /**
   * The default choices for dropdown, checkbox and radiogroup cell types.
   */
  public get choices(): Array<any> {
    return this.choicesValue;
  }
  public set choices(val: Array<any>) {
    this.setPropertyValue("choices", val);
  }
  /**
   * The default options caption for dropdown cell type.
   */
  public get optionsCaption() {
    return this.getLocalizableStringText(
      "optionsCaption",
      surveyLocalization.getString("optionsCaption")
    );
  }
  public set optionsCaption(val: string) {
    this.setLocalizableStringText("optionsCaption", val);
  }
  public get locOptionsCaption() {
    return this.getLocalizableString("optionsCaption");
  }
  public addColumn(name: string, title: string = null): MatrixDropdownColumn {
    var column = new MatrixDropdownColumn(name, title);
    this.columnsValue.push(column);
    return column;
  }
  /**
   * Returns the rows model objects that used during rendering.
   */
  public get visibleRows(): Array<MatrixDropdownRowModelBase> {
    if (this.isLoadingFromJson) return;
    if (!this.generatedVisibleRows) {
      this.generatedVisibleRows = this.generateRows();
      if (this.data) {
        this.runCellsCondition(this.data.getAllValues());
      }
    }
    return this.generatedVisibleRows;
  }
  /**
   * Set this property to false, to hide table header. The default value is true.
   */
  public get showHeader(): boolean {
    return this.getPropertyValue("showHeader", true);
  }
  public set showHeader(val: boolean) {
    this.setPropertyValue("showHeader", val);
  }
  public onSurveyLoad() {
    super.onSurveyLoad();
    this.generatedVisibleRows = null;
  }
  /**
   * Returns the row value. If the row value is empty, the object is empty: {}.
   * @param rowIndex row index from 0 to visible row count - 1.
   */
  public getRowValue(rowIndex: number) {
    if (rowIndex < 0) return null;
    var visRows = this.visibleRows;
    if (rowIndex >= visRows.length) return null;
    var newValue = this.createNewValue(this.value);
    return this.getRowValueCore(visRows[rowIndex], newValue);
  }
  /**
   * Set the row value.
   * @param rowIndex row index from 0 to visible row count - 1.
   * @param rowValue an object {"column name": columnValue,... }
   */
  public setRowValue(rowIndex: number, rowValue: any) {
    if (rowIndex < 0) return null;
    var visRows = this.visibleRows;
    if (rowIndex >= visRows.length) return null;
    this.onRowChanged(visRows[rowIndex], "", rowValue);
    this.onValueChanged();
  }
  protected generateRows(): Array<MatrixDropdownRowModelBase> {
    return null;
  }
  protected createNewValue(curValue: any): any {
    return !curValue ? {} : curValue;
  }
  protected getRowValueCore(
    row: MatrixDropdownRowModelBase,
    questionValue: any,
    create: boolean = false
  ): any {
    var result = questionValue[row.rowName] ? questionValue[row.rowName] : null;
    if (!result && create) {
      result = {};
      questionValue[row.rowName] = result;
    }
    return result;
  }
  protected getRowDisplayValue(
    row: MatrixDropdownRowModelBase,
    rowValue: any
  ): any {
    for (var i = 0; i < this.columns.length; i++) {
      var column = this.columns[i];
      if (rowValue[column.name]) {
        rowValue[column.name] = row.cells[i].question.displayValue;
      }
    }
    return rowValue;
  }
  protected onBeforeValueChanged(val: any) {}
  protected onValueChanged() {
    if (this.isRowChanging) return;
    this.onBeforeValueChanged(this.value);
    if (!this.generatedVisibleRows || this.generatedVisibleRows.length == 0)
      return;
    this.isRowChanging = true;
    var val = this.createNewValue(this.value);
    for (var i = 0; i < this.generatedVisibleRows.length; i++) {
      var row = this.generatedVisibleRows[i];
      this.generatedVisibleRows[i].value = this.getRowValueCore(row, val);
    }
    this.isRowChanging = false;
  }
  supportGoNextPageAutomatic() {
    var rows = this.generatedVisibleRows;
    if (!rows) rows = this.visibleRows;
    if (!rows) return true;
    for (var i = 0; i < rows.length; i++) {
      var cells = this.generatedVisibleRows[i].cells;
      if (!cells) continue;
      for (var colIndex = 0; colIndex < cells.length; colIndex++) {
        var question = cells[colIndex].question;
        if (
          question &&
          (!question.supportGoNextPageAutomatic() || !question.value)
        )
          return false;
      }
    }
    return true;
  }
  public hasErrors(fireCallback: boolean = true): boolean {
    var errosInColumns = this.hasErrorInColumns(fireCallback);
    return super.hasErrors(fireCallback) || errosInColumns;
  }
  public getAllErrors(): Array<SurveyError> {
    var result = super.getAllErrors();
    var rows = this.generatedVisibleRows;
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      for (var j = 0; j < row.cells.length; j++) {
        var errors = row.cells[j].question.getAllErrors();
        if (errors && errors.length > 0) {
          result = result.concat(errors);
        }
      }
    }
    return result;
  }
  private hasErrorInColumns(fireCallback: boolean): boolean {
    if (!this.generatedVisibleRows) return false;
    var res = false;
    for (var i = 0; i < this.generatedVisibleRows.length; i++) {
      var cells = this.generatedVisibleRows[i].cells;
      if (!cells) continue;
      for (var colIndex = 0; colIndex < this.columns.length; colIndex++) {
        if (!cells[colIndex]) continue;
        var question = cells[colIndex].question;
        res =
          (question && question.visible && question.hasErrors(fireCallback)) ||
          res;
      }
    }
    return res;
  }
  protected getFirstInputElementId(): string {
    var question = this.getFirstCellQuestion(false);
    return question ? question.inputId : super.getFirstInputElementId();
  }
  protected getFirstErrorInputElementId(): string {
    var question = this.getFirstCellQuestion(true);
    return question ? question.inputId : super.getFirstErrorInputElementId();
  }
  protected getFirstCellQuestion(onError: boolean): Question {
    if (!this.generatedVisibleRows) return null;
    for (var i = 0; i < this.generatedVisibleRows.length; i++) {
      var cells = this.generatedVisibleRows[i].cells;
      for (var colIndex = 0; colIndex < this.columns.length; colIndex++) {
        if (!onError) return cells[colIndex].question;
        if (cells[colIndex].question.currentErrorCount > 0)
          return cells[colIndex].question;
      }
    }
    return null;
  }
  //IMatrixDropdownData
  public createQuestion(
    row: MatrixDropdownRowModelBase,
    column: MatrixDropdownColumn
  ): Question {
    return this.createQuestionCore(row, column);
  }
  protected createQuestionCore(
    row: MatrixDropdownRowModelBase,
    column: MatrixDropdownColumn
  ): Question {
    var question = column.createCellQuestion(row);
    if (this.isReadOnly) {
      question.readOnly = true;
    }
    question.setSurveyImpl(row);
    return question;
  }
  protected deleteRowValue(
    newValue: any,
    row: MatrixDropdownRowModelBase
  ): any {
    delete newValue[row.rowName];
    return Object.keys(newValue).length == 0 ? null : newValue;
  }
  onReadOnlyChanged() {
    if (this.isLoadingFromJson) return;
    var rows = this.visibleRows;
    for (var i = 0; i < rows.length; i++) {
      rows[i].onReadOnlyChanged();
    }
  }
  onAnyValueChanged(name: string) {
    if (this.isLoadingFromJson) return;
    var rows = this.visibleRows;
    for (var i = 0; i < rows.length; i++) {
      rows[i].onAnyValueChanged(name);
    }
  }
  protected onCellValueChanged(
    row: MatrixDropdownRowModelBase,
    columnName: string,
    rowValue: any
  ) {
    if (!this.survey) return;
    var self = this;
    var getQuestion = function(colName) {
      for (var i = 0; self.columns.length; i++) {
        if (self.columns[i].name == colName) {
          return row.cells[i].question;
        }
      }
      return null;
    };
    var options = {
      row: row,
      columnName: columnName,
      rowValue: rowValue,
      value: rowValue[columnName],
      getCellQuestion: getQuestion
    };
    this.survey.matrixCellValueChanged(this, options);
  }
  validateCell(
    row: MatrixDropdownRowModelBase,
    columnName: string,
    rowValue: any
  ): SurveyError {
    if (!this.survey) return;
    var self = this;
    var options = {
      row: row,
      columnName: columnName,
      rowValue: rowValue,
      value: rowValue[columnName]
    };
    return this.survey.matrixCellValidate(this, options);
  }
  onRowChanged(
    row: MatrixDropdownRowModelBase,
    columnName: string,
    newRowValue: any
  ) {
    var oldValue = this.createNewValue(this.value);
    if (this.isMatrixValueEmpty(oldValue)) oldValue = null;
    var newValue = this.createNewValue(this.value);
    var rowValue = this.getRowValueCore(row, newValue, true);
    if (!rowValue) rowValue = {};
    for (var key in rowValue) delete rowValue[key];
    if (newRowValue) {
      newRowValue = JSON.parse(JSON.stringify(newRowValue));
      for (var key in newRowValue) {
        if (!this.isValueEmpty(newRowValue[key])) {
          rowValue[key] = newRowValue[key];
        }
      }
    }
    if (Object.keys(rowValue).length == 0) {
      newValue = this.deleteRowValue(newValue, row);
    }
    if (this.isTwoValueEquals(oldValue, newValue)) return;
    this.isRowChanging = true;
    this.setNewValue(newValue);
    this.isRowChanging = false;
    if (columnName) {
      this.onCellValueChanged(row, columnName, rowValue);
    }
  }
  private isMatrixValueEmpty(val) {
    if (!val) return;
    if (Array.isArray(val)) {
      for (var i = 0; i < val.length; i++) {
        if (Object.keys(val[i]).length > 0) return false;
      }
      return true;
    }
    return Object.keys(val).length == 0;
  }
  getSurvey(): ISurvey {
    return this.survey;
  }
}

JsonObject.metaData.addClass(
  "matrixdropdowncolumn",
  [
    "name",
    { name: "title", serializationProperty: "locTitle" },
    {
      name: "cellType",
      default: "default",
      choices: () => {
        var res = MatrixDropdownColumn.getColumnTypes();
        res.splice(0, 0, "default");
        return res;
      }
    },
    { name: "colCount", default: -1, choices: [-1, 0, 1, 2, 3, 4] },
    "isRequired:boolean",
    "hasOther:boolean",
    "readOnly:boolean",
    "minWidth",
    "visibleIf:condition",
    "enableIf:condition",
    {
      name: "validators:validators",
      baseClassName: "surveyvalidator",
      classNamePart: "validator"
    }
  ],
  function() {
    return new MatrixDropdownColumn("");
  }
);

JsonObject.metaData.addClass(
  "matrixdropdownbase",
  [
    {
      name: "columns:matrixdropdowncolumns",
      className: "matrixdropdowncolumn"
    },
    "horizontalScroll:boolean",
    {
      name: "choices:itemvalues",
      onGetValue: function(obj: any) {
        return ItemValue.getData(obj.choices);
      },
      onSetValue: function(obj: any, value: any) {
        obj.choices = value;
      }
    },
    { name: "optionsCaption", serializationProperty: "locOptionsCaption" },
    {
      name: "cellType",
      default: "dropdown",
      choices: () => {
        return MatrixDropdownColumn.getColumnTypes();
      }
    },
    { name: "columnColCount", default: 0, choices: [0, 1, 2, 3, 4] },
    "columnMinWidth",
    { name: "showHeader:boolean", default: true }
  ],
  function() {
    return new QuestionMatrixDropdownModelBase("");
  },
  "question"
);
