import {Binder} from '../binder';
import {Scope, Handler, ScopeInterface} from '../scope/scope';
import {Template} from './template';
import {Globals} from '../globals';
import {BindingEach} from './bindingEach';

let Debug = Globals.Debug;

export type BindFn = (element: HTMLElement|HTMLInputElement, scope: ScopeInterface) => boolean;


export class Binding{
  private static NODES: any[] = [];
  private static NODE_COUNT = 1;
  private static PRIV_PROP = '_' + 'ie';
  public bindFn: BindFn;
  public unbindFn: BindFn;
  private name:string;

  constructor(name: string){
    this.name = 'ie' + '-' + name;
  }

  public bind(element: HTMLElement|HTMLInputElement, scope: ScopeInterface): boolean{
    this.setScope(element, scope);
    return this.bindFn(element, scope);
  }

  public unbind(element: HTMLElement|HTMLInputElement): boolean{
    let res = this.unbindFn(element, this.getScope(element));
    this.deleteBindingDataNode(element);
    return res;

  }

  public isBinded(element: HTMLElement|HTMLInputElement): boolean{
    return Binding.NODES[Binding.GetNodeId(element)] && !!Binding.NODES[Binding.GetNodeId(element)].bindingsData[this.name];
  }

  /**
   * Obtener la id correspondiente a un nodo del DOM.
   * Si no tiene se le asigna a partir de un contador
   * @param {any} node un nodo del DOM.
   * @return {number} la id del nodo.
   */
  public static GetNodeId(node:any): number{
    let data = node[Binding.PRIV_PROP] = node[Binding.PRIV_PROP] || {};
    data.id = data.id || Binding.NODE_COUNT++;
    Debug("Nueva id para un nodo "+ data.id);
    return data.id;
  }
  /**
   * Obtener un objeto con los datos relativos a un nodo, sobre todos sus bindings.
   * @param {any} node un nodo del DOM.
   * @return {any} objeto.
   */
  public static GetDataNode(node: any): any{
    let id = Binding.GetNodeId(node);
    Binding.NODES[id] = Binding.NODES[id] || {bindingsData: {}};
    return Binding.NODES[id];
  }
  /**
   * Obtener un objeto con los datos relativos a un nodo, sobre el binding actual del objeto.
   * @param {any} node un nodo del DOM.
   * @return {any} objeto.
   */
  public getBindingDataNode(node: any): any{
    let data = Binding.GetDataNode(node);
    data.bindingsData[this.name] = data.bindingsData[this.name] || {handlers: []};
    return data.bindingsData[this.name];
  }

  /**
   * Obtener el scope para un binding concreto de un nodo
   * @param {any} node un nodo del DOM.
   * @return {ScopeInterface} el objeto scope.
   */
  public getScope(node:any): ScopeInterface{
    return this.getBindingDataNode(node).scope;
  }

  /**
   * Establecer el scope para un binding concreto de un nodo
   * @param {any} node un nodo del DOM.
   * @return {ScopeInterface} el objeto scope.
   */
  public setScope(node: any, scope: ScopeInterface): void{
    this.getBindingDataNode(node).scope = scope;
  }

  public deleteBindingDataNode(node: any): any{
    let data = Binding.GetDataNode(node);
    delete data.bindingsData[this.name];
  }

  public storeHandler(node: any, handler: Handler){
    let data = this.getBindingDataNode(node);
    data.handlers.push(handler);
  }

  public retrieveHandlers(node: any){
    return this.getBindingDataNode(node).handlers;
  }

  public createHandler(node:any): Handler{
    let res = new Handler();
    this.getBindingDataNode(node).handlers.push(res);
    return res;
  }

  public getName(): string{
    return this.name;
  }

  /**
   * Contenido del atributo del binding
   * @param {HTMLElement} element el elemento HTML.
   * @return {string|null} contenido del atributo.
   */
  public getParam(element: HTMLElement): string|null{
    return element.getAttribute(this.getName());
  }
}
