import {ScopeInterface, Method, Scope, Handler} from './scope';

export class ProxyScope implements ScopeInterface{
  [key: string]: any
  private _proxied: {[index: string]: string};
  private _inversedProxied: {[index: string]: string};
  private _scope: Scope;
  private _handlersMap: {[index: string]: Handler[]};
  private _handler: Handler;

  constructor(proxied: {[index: string]: string}, scope: ScopeInterface){
    Object.defineProperty(this, '_proxied', {enumerable: false, writable: false, value: proxied});
    Object.defineProperty(this, '_scope', {enumerable: false, writable: false, value: scope});
    Object.defineProperty(this, '_handlersMap', {enumerable: false, writable: false, value: {}});
    Object.defineProperty(this, '_inversedProxied', {enumerable: false, writable: false, value: {}});
    Object.defineProperty(this, '_handler', {enumerable: false, writable: false, value: new Handler()});

    let properties = Object.keys(proxied);
    var that = this;
    Object.keys(scope).forEach(key =>{
      if(properties.indexOf(key) != -1) return;
      Object.defineProperty(this, key, {enumerable: true,
        get: () => this._scope[key],
        set: (value: any) => this._scope[key]=value
      });
    });

    this._handler.handle = function(path, data, meta){
      let model = that._inversedProxied[path];
      if(model){
        (that._handlersMap[model] || []).forEach(handler => handler.handle(model, data, meta));
      }
    };

    properties.forEach(key => {
      let path = this._proxied[key];
      this._inversedProxied[path] = key;
      Object.defineProperty(this, key, {
        enumerable: true,
        get: () => this._scope.getByPath(path),
        set: (value: any) => this._scope.setByPath(path, value)
      });
      this._scope.subscribe(path, this._handler);
    });
  }

  public subscribe(path: string, handler: Handler){
    if(this._proxied[path]){
      this._handlersMap[path] = this._handlersMap[path] || [];
      this._handlersMap[path].push(handler);
      return;
    }

    this._scope.subscribe(path, handler);
  }

  public unSubscribe(path: string, handler: Handler){
    if(this._proxied[path]){
      this._handlersMap[path] = this._handlersMap[path].filter(h => h!== handler);
      return;
    }

    this._scope.unSubscribe(path, handler);
  }

  public getByPath(path: string): any{
    return path.split('.').reduce((o,i)=> !o ? undefined : o[i], this);
  }

  public setByPath(path: string, value: any){
    let arrayPath = path.split('.');
    let prop = arrayPath.pop();
    let obj: any = arrayPath.reduce((o,i)=> !o ? undefined : o[i], this);
    if(prop === undefined) return;
    if(obj){
      obj[prop] = value;
    }
  }


}
