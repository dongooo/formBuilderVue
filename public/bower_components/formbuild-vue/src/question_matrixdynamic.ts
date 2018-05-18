import {
  QuestionMatrixDropdownModelBase,
  MatrixDropdownRowModelBase,
  IMatrixDropdownData,
  MatrixDropdownColumn
} from "./question_matrixdropdownbase";
import { JsonObject } from "./jsonobject";
import { QuestionFactory } from "./questionfactory";
import { surveyLocalization } from "./surveyStrings";
import { Base, SurveyError } from "./base";
import { CustomError } from "./error";
import { LocalizableString } from "./localizablestring";

export class MatrixDynamicRowModel extends MatrixDropdownRowModelBase {
  constructor(public index: number, data: IMatrixDropdownData, value: any) {
    super(data, value);
    this.buildCells();
  }
  public get rowName() {
    return this.id;
  }
}

/**
 * A Model for a matrix dymanic question. You may use a dropdown, checkbox, radiogroup, text and comment questions as a cell editors.
 * An end-user may dynamically add/remove rows, unlike in matrix dropdown question.
 */
export class QuestionMatrixDynamicModel extends QuestionMatrixDropdownModelBase
  implements IMatrixDropdownData {
  public static MaxRowCount = 100;
  private rowCounter = 0;
  private rowCountValue: number = 2;
  rowCountChangedCallback: () => void;

  constructor(public name: string) {
    super(name);
    this.createLocalizableString("confirmDeleteText", this);
    this.createLocalizableString("keyDuplicationError", this);
    this.createLocalizableString("addRowText", this);
    this.createLocalizableString("removeRowText", this);
  }
  public getType(): string {
    return "matrixdynamic";
  }
  /**
   * Set it to true, to show a confirmation dialog on removing a row
   * @see ConfirmDeleteText
   */
  public get confirmDelete(): boolean {
    return this.getPropertyValue("confirmDelete", false);
  }
  public set confirmDelete(val: boolean) {
    this.setPropertyValue("confirmDelete", val);
  }
  /**
   * Set it to a column name and the library shows duplication error, if there are same values in different rows in the column.
   * @see keyDuplicationError
   */
  public get keyName(): string {
    return this.getPropertyValue("keyName", "");
  }
  public set keyName(val: string) {
    this.setPropertyValue("keyName", val);
  }
  /**
   * The number of rows in the matrix.
   * @see minRowCount
   * @see maxRowCount
   */
  public get rowCount(): number {
    return this.rowCountValue;
  }
  public set rowCount(val: number) {
    if (val < 0 || val > QuestionMatrixDynamicModel.MaxRowCount) return;
    var prevValue = this.rowCountValue;
    this.rowCountValue = val;
    if (this.value && this.value.length > val) {
      var qVal = this.value;
      qVal.splice(val);
      this.value = qVal;
    }
    if (this.isLoadingFromJson) return;
    if (this.generatedVisibleRows) {
      this.generatedVisibleRows.splice(val);
      for (var i = prevValue; i < val; i++) {
        this.generatedVisibleRows.push(this.createMatrixRow(null));
      }
    }
    this.fireCallback(this.rowCountChangedCallback);
  }
  /**
   * The minimum row count. A user could not delete a row if the rowCount equals to minRowCount
   * @see rowCount
   * @see maxRowCount
   */
  public get minRowCount(): number {
    return this.getPropertyValue("minRowCount", 0);
  }
  public set minRowCount(val: number) {
    if (val < 0) val = 0;
    if (val == this.minRowCount || val > this.maxRowCount) return;
    this.setPropertyValue("minRowCount", val);
    if (this.rowCount < val) this.rowCount = val;
  }
  /**
   * The maximum row count. A user could not add a row if the rowCount equals to maxRowCount
   * @see rowCount
   * @see minRowCount
   */
  public get maxRowCount(): number {
    return this.getPropertyValue(
      "maxRowCount",
      QuestionMatrixDynamicModel.MaxRowCount
    );
  }
  public set maxRowCount(val: number) {
    if (val <= 0) return;
    if (val > QuestionMatrixDynamicModel.MaxRowCount)
      val = QuestionMatrixDynamicModel.MaxRowCount;
    if (val == this.maxRowCount || val < this.minRowCount) return;
    this.setPropertyValue("maxRowCount", val);
    if (this.rowCount > val) this.rowCount = val;
  }
  /**
   * Returns true, if a new row can be added.
   * @see maxRowCount
   * @see canRemoveRow
   * @see rowCount
   */
  public get canAddRow(): boolean {
    return this.rowCount < this.maxRowCount;
  }
  /**
   * Returns true, if a row can be removed.
   * @see minRowCount
   * @see canAddRow
   * @see rowCount
   */
  public get canRemoveRow(): boolean {
    return this.rowCount > this.minRowCount;
  }
  /**
   * Creates and add a new row.
   */
  public addRow() {
    if (!this.canAddRow) return;
    var prevRowCount = this.rowCount;
    this.rowCount = this.rowCount + 1;
    if (this.data) {
      this.runCellsCondition(this.data.getAllValues());
    }
    if (this.survey) {
      if (prevRowCount + 1 == this.rowCount) this.survey.matrixRowAdded(this);
    }
  }
  /**
   * Removes a row by it's index. If confirmDelete is true, show a confirmation dialog
   * @param index a row index, from 0 to rowCount - 1
   * @see removeRow
   * @see confirmDelete
   */
  public removeRowUI(value: any) {
    if (!this.confirmDelete || confirm(this.confirmDeleteText)) {
      this.removeRow(value);
    }
  }
  /**
   * Removes a row by it's index.
   * @param index a row index, from 0 to rowCount - 1
   */
  public removeRow(index: number) {
    if (!this.canRemoveRow) return;
    if (index < 0 || index >= this.rowCount) return;
    if (this.survey) {
      var row = this.generatedVisibleRows
        ? this.generatedVisibleRows[index]
        : null;
      this.survey.matrixRowRemoved(this, index, row);
    }
    if (this.generatedVisibleRows && index < this.generatedVisibleRows.length) {
      this.generatedVisibleRows.splice(index, 1);
    }
    if (this.value) {
      var val = this.createNewValue(this.value);
      val.splice(index, 1);
      val = this.deleteRowValue(val, null);
      this.value = val;
    }
    this.rowCountValue--;
    this.fireCallback(this.rowCountChangedCallback);
  }
  /**
   * Use this property to change the default text showing in the confirmation delete dialog on removing a row.
   */
  public get confirmDeleteText() {
    return this.getLocalizableStringText(
      "confirmDeleteText",
      surveyLocalization.getString("confirmDelete")
    );
  }
  public set confirmDeleteText(val: string) {
    this.setLocalizableStringText("confirmDeleteText", val);
  }
  get locConfirmDeleteText() {
    return this.getLocalizableString("confirmDeleteText");
  }

  /**
   * The duplication value error text. Set it to show the text different from the default.
   * @see keyName
   */
  public get keyDuplicationError() {
    return this.getLocalizableStringText(
      "keyDuplicationError",
      surveyLocalization.getString("keyDuplicationError")
    );
  }
  public set keyDuplicationError(val: string) {
    this.setLocalizableStringText("keyDuplicationError", val);
  }
  get locKeyDuplicationError() {
    return this.getLocalizableString("keyDuplicationError");
  }
  /**
   * Use this property to change the default value of add row button text.
   */
  public get addRowText() {
    return this.getLocalizableStringText(
      "addRowText",
      surveyLocalization.getString("addRow")
    );
  }
  public set addRowText(val: string) {
    this.setLocalizableStringText("addRowText", val);
  }
  get locAddRowText() {
    return this.getLocalizableString("addRowText");
  }
  /**
   * Use this property to change the default value of remove row button text.
   */
  public get removeRowText() {
    return this.getLocalizableStringText(
      "removeRowText",
      surveyLocalization.getString("removeRow")
    );
  }
  public set removeRowText(val: string) {
    this.setLocalizableStringText("removeRowText", val);
  }
  get locRemoveRowText() {
    return this.getLocalizableString("removeRowText");
  }
  public get displayValue(): any {
    var values = this.value;
    if (!values) return values;
    var rows = this.visibleRows;
    for (var i = 0; i < rows.length && i < values.length; i++) {
      var val = values[i];
      if (!val) continue;
      values[i] = this.getRowDisplayValue(rows[i], val);
    }
    return values;
  }
  public addConditionNames(names: Array<string>) {
    for (var i = 0; i < this.columns.length; i++) {
      names.push(this.name + "[0]." + this.columns[i].name);
    }
  }
  public supportGoNextPageAutomatic() {
    return false;
  }
  protected onCheckForErrors(errors: Array<SurveyError>) {
    super.onCheckForErrors(errors);
    if (this.hasErrorInRows()) {
      errors.push(
        new CustomError(
          surveyLocalization
            .getString("minRowCountError")
            ["format"](this.minRowCount)
        )
      );
    }
  }
  public hasErrors(fireCallback: boolean = true): boolean {
    var prevValue = super.hasErrors(fireCallback);
    return this.isValueDuplicated() || prevValue;
  }
  private hasErrorInRows(): boolean {
    if (this.minRowCount <= 0 || !this.generatedVisibleRows) return false;
    var res = false;
    var setRowCount = 0;
    for (
      var rowIndex = 0;
      rowIndex < this.generatedVisibleRows.length;
      rowIndex++
    ) {
      var row = this.generatedVisibleRows[rowIndex];
      if (!row.isEmpty) setRowCount++;
    }
    return setRowCount < this.minRowCount;
  }
  private isValueDuplicated(): boolean {
    if (!this.keyName || !this.generatedVisibleRows) return false;
    var column = this.getColumnByName(this.keyName);
    if (!column) return false;
    var keyValues = [];
    var res = false;
    for (var i = 0; i < this.generatedVisibleRows.length; i++) {
      res =
        this.isValueDuplicatedInRow(
          this.generatedVisibleRows[i],
          column,
          keyValues
        ) || res;
    }
    return res;
  }
  private isValueDuplicatedInRow(
    row: MatrixDropdownRowModelBase,
    column: MatrixDropdownColumn,
    keyValues: Array<any>
  ): boolean {
    var question = row.getQuestionByColumn(column);
    if (!question || question.isEmpty()) return false;
    var value = question.value;
    for (var i = 0; i < keyValues.length; i++) {
      if (value == keyValues[i]) {
        question.addError(new CustomError(this.keyDuplicationError));
        return true;
      }
    }
    keyValues.push(value);
    return false;
  }
  protected generateRows(): Array<MatrixDynamicRowModel> {
    var result = new Array<MatrixDynamicRowModel>();
    if (this.rowCount === 0) return result;
    var val = this.createNewValue(this.value);
    for (var i = 0; i < this.rowCount; i++) {
      result.push(this.createMatrixRow(this.getRowValueByIndex(val, i)));
    }
    return result;
  }
  protected createMatrixRow(value: any): MatrixDynamicRowModel {
    var row = new MatrixDynamicRowModel(this.rowCounter++, this, value);
    this.onMatrixRowCreated(row);
    return row;
  }
  protected onBeforeValueChanged(val: any) {
    var newRowCount = val && Array.isArray(val) ? val.length : 0;
    if (newRowCount <= this.rowCount) return;
    this.rowCountValue = newRowCount;
    if (this.generatedVisibleRows) {
      this.generatedVisibleRows = null;
      this.generatedVisibleRows = this.visibleRows;
    }
  }
  protected createNewValue(curValue: any): any {
    var result = curValue;
    if (!result || !Array.isArray(result)) result = [];
    var r = [];
    if (result.length > this.rowCount) result.splice(this.rowCount - 1);
    for (var i = result.length; i < this.rowCount; i++) {
      result.push({});
    }
    return result;
  }
  protected deleteRowValue(
    newValue: any,
    row: MatrixDropdownRowModelBase
  ): any {
    var isEmpty = true;
    for (var i = 0; i < newValue.length; i++) {
      if (Object.keys(newValue[i]).length > 0) {
        isEmpty = false;
        break;
      }
    }
    return isEmpty ? null : newValue;
  }

  private getRowValueByIndex(questionValue: any, index: number): any {
    return index >= 0 && index < questionValue.length
      ? questionValue[index]
      : null;
  }
  protected getRowValueCore(
    row: MatrixDropdownRowModelBase,
    questionValue: any,
    create: boolean = false
  ): any {
    if (!this.generatedVisibleRows) return {};
    return this.getRowValueByIndex(
      questionValue,
      this.generatedVisibleRows.indexOf(row)
    );
  }
}

JsonObject.metaData.addClass(
  "matrixdynamic",
  [
    { name: "rowCount:number", default: 2 },
    { name: "minRowCount:number", default: 0 },
    {
      name: "maxRowCount:number",
      default: QuestionMatrixDynamicModel.MaxRowCount
    },
    { name: "keyName" },
    {
      name: "keyDuplicationError",
      serializationProperty: "locKeyDuplicationError"
    },
    { name: "confirmDelete:boolean" },
    {
      name: "confirmDeleteText",
      serializationProperty: "locConfirmDeleteText"
    },
    { name: "addRowText", serializationProperty: "locAddRowText" },
    { name: "removeRowText", serializationProperty: "locRemoveRowText" }
  ],
  function() {
    return new QuestionMatrixDynamicModel("");
  },
  "matrixdropdownbase"
);

QuestionFactory.Instance.registerQuestion("matrixdynamic", name => {
  var q = new QuestionMatrixDynamicModel(name);
  q.choices = [1, 2, 3, 4, 5];
  QuestionMatrixDropdownModelBase.addDefaultColumns(q);
  return q;
});
