import {Binding} from './binding';
import {ScopeInterface, Method, Handler} from '../scope/scope';
import {ProxyScope} from '../scope/proxyScope';
import {Binder} from '../binder';

export class BindingEach extends Binding{
  protected static REGEX_PARAM = /(.*)? +in +(.*)?/g;
  private baseHTML: string;

  constructor(private binder: Binder){
    super('each');
  }

  private storeBaseElement(element: HTMLElement){
    this.getBindingDataNode(element)['baseElement'] = element.firstElementChild;
  }

  private getBaseElement(element: any): HTMLElement{
    return (this.getBindingDataNode(element)['baseElement'] as HTMLElement);
  }

  private fillElement(element: HTMLElement, scope: ScopeInterface, modelName: string, pathArray: string){
    let dataArray = scope.getByPath(pathArray) as any[];
    let base = this.getBaseElement(element);
    this.binder.disconnect();
    
    dataArray.forEach((data, index) => {
      let newElem = base.cloneNode(true) as HTMLElement;
      let proxyParam: any = {};
      proxyParam[modelName] = pathArray + '.' + index;
      let proxyScope = new ProxyScope(proxyParam, scope);
      this.binder.processTree(newElem, proxyScope);
      element.appendChild(newElem);
    });
    this.binder.observe();
  }

  public bind(element: HTMLElement , scope: ScopeInterface): boolean{
    let bindingData = this.getBindingDataNode(element);
    let result = BindingEach.REGEX_PARAM.exec(this.getParam(element) as string);
    this.storeBaseElement(element);
    element.innerHTML = "";

    if(result === null){
      console.error("Parametro no valido: " + this.getParam(element));
      return false;
    }
    let model = result[1].trim();
    let path = result[2].trim();


    let handler = this.createHandler(element);
    handler.data.observedPath = path;

    handler.handle = (path, data, meta) => {
      if(meta && meta.method === Method.set)
        this.fillElement(element, scope, model, path);
    };
    scope.subscribe(path, handler);
    return false;
  }

  public unbind(element: HTMLElement){
    let scope = this.getScope(element);
    this.getBindingDataNode(element).handlers.forEach((handler: Handler) => scope.unSubscribe(handler.data.observedPath, handler));
    this.deleteBindingDataNode(element);
    return true;
  }
}
