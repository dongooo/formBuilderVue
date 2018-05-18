import { HashTable } from "./helpers";

export class FunctionFactory {
  public static Instance: FunctionFactory = new FunctionFactory();
  private functionHash: HashTable<(params: any[]) => any> = {};

  public register(name: string, func: (params: any[]) => any) {
    this.functionHash[name] = func;
  }
  public clear() {
    this.functionHash = {};
  }
  public getAll(): Array<string> {
    var result = [];
    for (var key in this.functionHash) {
      result.push(key);
    }
    return result.sort();
  }
  public run(name: string, params: any[]): any {
    var func = this.functionHash[name];
    if (!func) return null;
    return func(params);
  }
}

function sum(params: any[]): any {
  var res = 0;
  for (var i = 0; i < params.length; i++) {
    res += params[i];
  }
  return res;
}
FunctionFactory.Instance.register("sum", sum);

function avg(params: any[]): any {
  var res = 0;
  for (var i = 0; i < params.length; i++) {
    res += params[i];
  }
  return params.length > 0 ? res / params.length : 0;
}
FunctionFactory.Instance.register("avg", avg);

function sumInArray(params: any[]): any {
  if (params.length != 2) return 0;
  var arr = params[0];
  if (!Array.isArray(arr)) return;
  var name = params[1];
  if (typeof name !== "string" && !(name instanceof String)) return 0;
  var res = 0;
  for (var i = 0; i < arr.length; i++) {
    var item = arr[i];
    if (item && item[<string>name]) {
      res += item[<string>name];
    }
  }
  return res;
}
FunctionFactory.Instance.register("sumInArray", sumInArray);

function iif(params: any[]): any {
  if (!params && params.length !== 3) return "";
  return params[0] ? params[1] : params[2];
}
FunctionFactory.Instance.register("iif", iif);

function age(params: any[]): any {
  if (!params && params.length < 1) return null;
  if (!params[0]) return null;
  var birthDay = new Date(params[0]);
  var ageDifMs = Date.now() - birthDay.getTime();
  var ageDate = new Date(ageDifMs); // miliseconds from epoch
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}
FunctionFactory.Instance.register("age", age);
