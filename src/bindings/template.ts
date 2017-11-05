import {Scope, Handler, ScopeInterface} from '../scope/scope';
import {Globals} from '../globals';
import {Expression} from './expression';
import {Binder} from '../binder';

let Debug = Globals.Debug;

export class Template{
  public static DELIMITERS = ['{{{','}}}'];
  private static REGEX_EXP = new RegExp(Template.DELIMITERS[0] + '.*?' + Template.DELIMITERS[1], "g");
  private static REGEX_CLEAN = new RegExp(Template.DELIMITERS[0] + '|' + Template.DELIMITERS[1], "g");

  //Caracteres para escapar texto a introducir en rodeado por html
  private static ESCAPE_MAP: { [index:string] : string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };
  private static REGEX_ESCAPE = new RegExp(Object.keys(Template.ESCAPE_MAP).join('|'), 'g');
  private static ESCAPE_CHAR = function(c: string){
    return Template.ESCAPE_MAP[c];
  };

  //private models: { [index:string] : {handler: Handler, lastValue: any, expression: string, regexReplace: RegExp} };

  private expressions: Expression[];
  private values: any[];

  public justApplied: boolean;

  private templateComponents: string[];
  private element: HTMLElement;
  private checkApplyAsync: boolean;

  constructor(private template: string, private scope: ScopeInterface, private binder: Binder){
    this.justApplied = false;
    this.expressions = [];
    this.templateComponents = [];
  }

  public escapeForHTML(data=''): string{
    switch(typeof data){
      case 'string':
        return data.replace(Template.REGEX_ESCAPE, Template.ESCAPE_CHAR);
      case 'object':
        return JSON.stringify(data);
      default:
        return (data + "").replace(Template.REGEX_ESCAPE, Template.ESCAPE_CHAR);
    }
  }

  public prepare(element: HTMLElement){
    this.element = element;
    this.element.innerHTML ='';
    let that = this;
    let regex = Template.REGEX_EXP, matches;
    let lastIndex = 0;
    while( (matches = regex.exec(this.template)) ){
      let expString = matches[0];
      let index = matches.index;

      this.templateComponents.push(this.template.slice(lastIndex, index));
      lastIndex = index + expString.length;

      let expression = new Expression(expString.replace(Template.REGEX_CLEAN, ''), this.scope);
      this.expressions.push(expression);
      this.templateComponents.push( that.escapeForHTML(expression.exec()) );
      let expIndexInComp = this.templateComponents.length -1;
      expression.onExec = function(value: any){
        let aux = window as any;
        aux.prueba = aux.prueba || 0;
        that.templateComponents[expIndexInComp] = that.escapeForHTML(value);
        that.applyTemplate();
      }
    }
    this.templateComponents.push(this.template.slice(lastIndex));
  }

  /*
  * Con esta funcion evitamos que se ejecute varias veces seguidas la aplicacion de una plantilla en el DOM
  * por ejemplo puede haber varias expresiones que observen la misma propiedad por lo que se ejecutara applyTemplate
  * x numero de veces incluyendo la desconexion del observer del Binder
  * applyTemplate se ejecutara de manera asincrona la primera vez
  */
  public applyTemplate(){
    this.checkApplyAsync = true;
    setTimeout(()=> {
      if(!this.checkApplyAsync) return;
      this._applyTemplateForAsync();
      this.checkApplyAsync = false;
    });
  }

  public _applyTemplateForAsync(): any{
    let newHtml = this.templateComponents.join('');

    Debug(this.templateComponents);

    this.binder.disconnect();
    this.element.innerHTML = newHtml;
    console.log(this.element);
    console.log("ssssssssssssss");
    this.binder.processTree(this.element);
    this.binder.observe();
  }

  public unSubscribe(): any{
    this.expressions.forEach(exp => exp.unSubscribe());
  }

  public getTemplate(): string{
    return this.template;
  }
}
