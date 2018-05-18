import { HashTable, Helpers } from "./helpers";
import { ConditionsParser } from "./conditionsParser";
import { FunctionFactory } from "./functionsfactory";
import { ProcessValue } from "./conditionProcessValue";

export class Operand {
  constructor(public origionalValue: any) {}
  public getValue(processValue: ProcessValue): any {
    if (Array.isArray(this.origionalValue)) {
      let res = [];
      for (let i = 0; i < this.origionalValue.length; i++) {
        let val = new Operand(this.origionalValue[i]);
        res.push(val.getValue(processValue));
      }
      return res;
    }
    var res = this.getSimpleValue(this.origionalValue);
    if (res.isSimple) return res.value;
    var val = this.removeQuotesAndEscapes(this.origionalValue);
    if (processValue) {
      var name = this.getValueName(val);
      if (name) {
        if (!processValue.hasValue(name)) return null;
        val = processValue.getValue(name);
        return this.getSimpleValue(val).value;
      }
    }
    return val;
  }
  public get isBoolean() {
    return this.isBooleanValue(this.origionalValue);
  }
  public toString(): string {
    var val = this.origionalValue;
    if (val && (!this.isNumeric(val) && !this.isBooleanValue(val)))
      val = "'" + val + "'";
    return val;
  }
  private removeQuotesAndEscapes(val: string): string {
    if (val.length > 0 && (val[0] == "'" || val[0] == '"')) val = val.substr(1);
    var len = val.length;
    if (len > 0 && (val[len - 1] == "'" || val[len - 1] == '"'))
      val = val.substr(0, len - 1);
    if (val) {
      val = val.replace("\\'", "'");
      val = val.replace('\\"', '"');
    }
    return val;
  }
  private getValueName(val: any) {
    if (val.length < 3 || val[0] != "{" || val[val.length - 1] != "}")
      return null;
    return val.substr(1, val.length - 2);
  }
  private isBooleanValue(value: string): boolean {
    return (
      value &&
      (value.toLowerCase() === "true" || value.toLowerCase() === "false")
    );
  }
  private isNumeric(value: string): boolean {
    if (
      value &&
      (value.indexOf("-") > -1 ||
        value.indexOf("+") > 1 ||
        value.indexOf("*") > -1 ||
        value.indexOf("/") > -1 ||
        value.indexOf("%") > -1)
    )
      return false;
    var val = Number(value);
    if (isNaN(val)) return false;
    return isFinite(val);
  }
  private getSimpleValue(val: any): any {
    var res = { isSimple: false, value: val };
    if (val === undefined || val === "undefined") {
      res.value = null;
      res.isSimple = true;
      return res;
    }
    if (!val || typeof val != "string") {
      res.isSimple = true;
      return res;
    }
    if (this.isNumeric(val)) {
      res.isSimple = true;
      res.value = parseFloat(val);
      return res;
    }
    if (this.isBooleanValue(val)) {
      res.value = val.toLowerCase() == "true";
      res.isSimple = true;
      return res;
    }
    return res;
  }
}
export class FunctionOperand extends Operand {
  public parameters: Array<Operand> = new Array<Operand>();
  constructor(public origionalValue: any) {
    super(origionalValue);
  }
  public getValue(processValue: ProcessValue) {
    var paramValues = [];
    for (var i = 0; i < this.parameters.length; i++) {
      paramValues.push(this.parameters[i].getValue(processValue));
    }
    return FunctionFactory.Instance.run(this.origionalValue, paramValues);
  }
  public toString() {
    var res = this.origionalValue + "(";
    for (var i = 0; i < this.parameters.length; i++) {
      if (i > 0) res += ", ";
      res += this.parameters[i].toString();
    }
    return res;
  }
}
export class ExpressionOperand extends Operand {
  public left: Operand;
  public right: Operand;
  public operator: string;
  constructor() {
    super(null);
  }
  public getValue(processValue: ProcessValue): any {
    if (!this.left || !this.right) return null;
    var l = this.left.getValue(processValue);
    var r = this.right.getValue(processValue);
    if (this.operator == "+") {
      return l + r;
    }
    if (this.operator == "-") {
      return l - r;
    }
    if (this.operator == "*") {
      return l * r;
    }
    if (this.operator == "/") {
      if (!r) return null;
      return l / r;
    }
    if (this.operator == "%") {
      if (!r) return null;
      return l % r;
    }
    return null;
  }
  public toString() {
    var res = this.left ? this.left.toString() : "";
    res += " " + this.operator + " ";
    if (this.right) res += this.right.toString();
    return res;
  }
}
export class ConditionOperand extends Operand {
  public root: ConditionNode;
  private processValue: ProcessValue;
  constructor(root: ConditionNode = null) {
    super(null);
    if (root) this.root = root;
  }
  public getValue(processValue: ProcessValue): any {
    if (!this.root) return false;
    this.processValue = processValue;
    return this.runNode(this.root);
  }
  public toString(): string {
    return this.root ? this.root.toString() : "";
  }
  private runNode(node: ConditionNode): boolean {
    var onFirstFail = node.connective == "and";
    for (var i = 0; i < node.children.length; i++) {
      var res = this.runNodeCondition(node.children[i]);
      if (!res && onFirstFail) return false;
      if (res && !onFirstFail) return true;
    }
    return onFirstFail;
  }
  private runNodeCondition(value: any): boolean {
    if (value["children"]) return this.runNode(value);
    if (value["left"]) return this.runCondition(value);
    return false;
  }
  private runCondition(condition: Condition): boolean {
    return condition.performExplicit(
      condition.left,
      condition.right,
      this.processValue
    );
  }
}

export class Condition {
  static operatorsValue: HashTable<Function> = null;
  static get operators() {
    if (Condition.operatorsValue != null) return Condition.operatorsValue;
    Condition.operatorsValue = {
      empty: function(left, right) {
        if (left == null) return true;
        return !left;
      },
      notempty: function(left, right) {
        if (left == null) return false;
        return !!left;
      },
      equal: function(left, right) {
        return Helpers.isTwoValueEquals(left, right, true);
      },
      notequal: function(left, right) {
        return !Helpers.isTwoValueEquals(left, right, true);
      },
      contains: function(left, right) {
        return Condition.operatorsValue.containsCore(left, right, true);
      },
      notcontains: function(left, right) {
        return Condition.operatorsValue.containsCore(left, right, false);
      },
      containsCore: function(left, right, isContains) {
        if (!left) return false;
        if (!left.length) {
          left = left.toString();
        }
        if (typeof left === "string" || left instanceof String) {
          if (!right) return false;
          right = right.toString();
          var found = left.indexOf(right) > -1;
          return isContains ? found : !found;
        }
        for (var i = 0; i < left.length; i++) {
          if (left[i] == right) return isContains;
        }
        return !isContains;
      },
      greater: function(left, right) {
        if (left == null || right == null) return false;
        return left > right;
      },
      less: function(left, right) {
        if (left == null || right == null) return false;
        return left < right;
      },
      greaterorequal: function(left, right) {
        if (left == null || right == null) return false;
        return left >= right;
      },
      lessorequal: function(left, right) {
        if (left == null || right == null) return false;
        return left <= right;
      }
    };
    return Condition.operatorsValue;
  }
  public static getOperator(opName: string): any {
    return Condition.operators[opName];
  }
  public static setOperator(
    opName: string,
    func: (left: any, right: any) => boolean
  ) {
    Condition.operators[opName] = func;
  }
  public static isCorrectOperator(opName: string): boolean {
    if (!opName) return false;
    opName = opName.toLowerCase();
    return Condition.operators[opName] != undefined;
  }
  public static isNoRightOperation(op: string) {
    return op == "empty" || op == "notempty";
  }
  private opValue: string = "equal";
  private leftValue: Operand = null;
  private rightValue: Operand = null;
  public get left(): Operand {
    return this.leftValue;
  }
  public set left(val: Operand) {
    this.leftValue = val;
  }
  public get right(): Operand {
    return this.rightValue;
  }
  public set right(val: Operand) {
    this.rightValue = val;
  }
  public get operator(): string {
    return this.opValue;
  }
  public set operator(value: string) {
    if (!value) return;
    value = value.toLowerCase();
    if (!Condition.operators[value]) return;
    this.opValue = value;
  }
  public perform(
    left: any = null,
    right: any = null,
    processValue: ProcessValue = null
  ): boolean {
    if (!left) left = this.left;
    if (!right) right = this.right;
    return this.performExplicit(left, right, processValue);
  }
  public performExplicit(
    left: any,
    right: any,
    processValue: ProcessValue
  ): boolean {
    var leftValue = left ? left.getValue(processValue) : null;
    if (!right && (leftValue === true || leftValue === false)) return leftValue;
    var rightValue = right ? right.getValue(processValue) : null;
    return Condition.operators[this.operator](leftValue, rightValue);
  }
  public toString(): string {
    if (!this.right || !this.operator) return "";
    var left = this.left.toString();
    var res = left + " " + this.operationToString();
    if (Condition.isNoRightOperation(this.operator)) return res;
    var right = this.right.toString();
    return res + " " + right;
  }
  private operationToString(): string {
    var op = this.operator;
    if (op == "equal") return "=";
    if (op == "notequal") return "!=";
    if (op == "greater") return ">";
    if (op == "less") return "<";
    if (op == "greaterorequal") return ">=";
    if (op == "lessorequal") return "<=";
    return op;
  }
}
export class ConditionNode {
  private connectiveValue: string = "and";
  public children: Array<any> = [];
  public constructor() {}
  public get connective(): string {
    return this.connectiveValue;
  }
  public set connective(value: string) {
    if (!value) return;
    value = value.toLowerCase();
    if (value == "&" || value == "&&") value = "and";
    if (value == "|" || value == "||") value = "or";
    if (value != "and" && value != "or") return;
    this.connectiveValue = value;
  }
  public get isEmpty() {
    return this.children.length == 0;
  }
  public clear() {
    this.children = [];
    this.connective = "and";
  }
  public toString(): string {
    if (this.isEmpty) return "";
    var res = "";
    for (var i = 0; i < this.children.length; i++) {
      var child = this.children[i];
      var nodeText = child.toString();
      if (child.children && child.children.length > 0) {
        nodeText = "(" + nodeText + ")";
      }
      if (nodeText) {
        if (res) res += " " + this.connective + " ";
        res += nodeText;
      }
    }
    return res;
  }
}
export class ExpressionRunner {
  private expressionValue: string;
  private processValue: ProcessValue;
  private operand: Operand;
  public constructor(expression: string) {
    this.expression = expression;
    this.processValue = new ProcessValue();
  }
  public get expression(): string {
    return this.expressionValue;
  }
  public set expression(value: string) {
    if (this.expression == value) return;
    this.expressionValue = value;
    this.operand = new ConditionsParser().parseExpression(this.expressionValue);
  }
  public run(values: HashTable<any>): any {
    if (!this.operand) return null;
    this.processValue.values = values;
    return this.operand.getValue(this.processValue);
  }
}
export class ConditionRunner {
  private expressionValue: string;
  private root: ConditionNode;
  public constructor(expression: string) {
    this.root = new ConditionNode();
    this.expression = expression;
  }
  public get expression(): string {
    return this.expressionValue;
  }
  public set expression(value: string) {
    if (this.expression == value) return;
    this.expressionValue = value;
    new ConditionsParser().parse(this.expressionValue, this.root);
  }
  public run(values: HashTable<any>): boolean {
    var condition = new ConditionOperand(this.root);
    var processValue = new ProcessValue();
    processValue.values = values;
    return <boolean>condition.getValue(processValue);
  }
}
