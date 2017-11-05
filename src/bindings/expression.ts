import {Scope, Handler, ScopeInterface} from '../scope/scope';
import {Globals} from '../globals';

let Debug = Globals.Debug;

export class Expression{
  public static VARIABLE_SYMBOL = '%%';
  private static REGEX_VAR = new RegExp(Expression.VARIABLE_SYMBOL + '[a-zA-Z0-9_\\-\\.]{1,}', "g");
  private static REGEX_CLEAN = new RegExp(Expression.VARIABLE_SYMBOL + '|\\ ', "g");
  private static REGEX_ESCAPE = /[-[\]{}()*+?.,\\^$|#\s]/g;

  private models: { [index:string] : {paramName: string, paramIndexes: number[], regexReplace: RegExp} } ;
  private expParams: any[] ;

  private funcExp: Function;
  public onExec: Function;

  private _handler: Handler;
  private getHandler(): Handler{
    if( !this._handler){
      this._handler = new Handler();
      let that = this;
      this._handler.handle =  function(evt, data){
        that.models[evt].paramIndexes.forEach(i => that.expParams[i] = data);
        that.exec();
      };
    }
    return this._handler;
  }

  constructor(private origExpression: string, private scope: ScopeInterface){
    let expression = origExpression;
    this.models = {};
    this.expParams = [];
    let regex = Expression.REGEX_VAR, matches;
    let index = -1;
    let args = [];
    while( (matches = regex.exec(this.origExpression)) ){
      index++;
      var model = matches[0].replace(Expression.REGEX_CLEAN, '');
      this.expParams[index] = this.scope.getByPath(model);
      if( this.models[model] ){
        this.models[model].paramIndexes.push(index);
        continue;
      }
      let aux = this.models[model] = {
        //El nombre del parametro dentro de la funcion reultante de la expresion
        paramName: 'p' + index,
        //Los indices para pasar como argumento a la funcion
        paramIndexes: [index],
        //Expresion regular para sustituir la cadena por su valor
        regexReplace: new RegExp(this.escape(matches[0]), 'g')
      };
      expression = expression.replace(aux.regexReplace, aux.paramName);
      args.push(aux.paramName);
      this.scope.subscribe(model, this.getHandler());
    }
    args.push('return (' + expression + ');');
    Debug(args);
    this.funcExp = Function.apply({}, args);

  }

  public escape(text: string): string{
    return text.replace(Expression.REGEX_ESCAPE, '\\$&');
  }

  public exec(context = {}): any{
    let value = undefined;
    try {
      value = this.funcExp.apply(context, this.expParams);
    }
    catch(err) {
        console.error(err.message);
    }
    if(this.onExec) this.onExec(value);
    return value;
  }

  public unSubscribe(): any{
    let keys = Object.keys(this.models);
    let handler = this.getHandler();
    for(let i = keys.length - 1; i >= 0; i--){
      this.scope.unSubscribe(keys[i], handler);
    }
  }
}
