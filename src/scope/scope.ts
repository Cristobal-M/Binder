import {Globals} from '../globals';

let PRIV_PREFIX = Globals.PREFIX;
let Debug = Globals.Debug;//console.log;

export enum Method {
  set = 'SET',
  push = 'PUSH',
  pop = 'POP'
}

export class Handler{
  handle: (path: string, data: any, metaData?: {method: Method})=> void;
  onUnSubscribe: (path: string) => void;
  data: any;

  constructor(){
    this.data = {};
  }
}

export interface ScopeInterface{
  getByPath(path: string): any;
  setByPath(path: string, value: any): void;
  subscribe(path: string, handler: Handler): void;
  unSubscribe(path: string, handler: Handler): void;
}

function getMeta(obj: any): any{
  return obj[PRIV_PREFIX];
}

function setMeta(obj: any, data = {}){
  Object.defineProperty(obj, PRIV_PREFIX, {enumerable: false, writable: false, value: data});
}

export class Scope implements ScopeInterface{
  [key: string]: any
  //Se basa en dos "arboles", tenemos la jerarquia de objetos normal de nuestro scope y
  // un estrucutra que mantiene los nombres de las propiedades que se observan
  //Cuando se quiere observar una propiedad a traves de una ruta se genera una rama
  //en observed, entonces se recorre el scope nivel a nivel hasta llegar al ultimo
  //elemento que pueda usarse para definir propiedades (type object), ya que Cuando
  //queremos observar un cambio es posible que no pueda alcanzarse el objetivo.
  //Se define la propiedad correspondiente al path sobre ese ultimo objeto de
  //forma que podamos observar un set, y cuando se asigne
  //un objeto se comprobara si tiene propiedades a observar de a acuerdo al objeto observed

  private _observed: any;
  private _events: {[index: string]: Handler[]};

  constructor(){
    Object.defineProperty(this, '_observed', {enumerable: false, writable: false, value:{}});
    Object.defineProperty(this, '_events', {enumerable: false, writable: false, value:[]});
    setMeta(this, {prefix: ''});
  }

  private _genPath(parent: any, prop: string){
    return parent === this ? prop : getMeta(parent).prefix + '.' + prop;
  }

  private _observeProp(parent:any, prop: string){
    let that = this;
    let value = parent[prop];
    let path = this._genPath(parent, prop);

    if(Array.isArray(value)){
      that._observeArray(value);
    }

    Debug("definiendo propiedad para observar: "+path);
    Object.defineProperty(parent, prop,{
      get: function(){
        return value;
      },
      set: function(newValue){
        if(typeof newValue === 'object'){
          Debug("Objeto en set, se recorrera");
          that._setObserverObject(parent, newValue, prop, true);
        }
        if(Array.isArray(newValue)){
          that._observeArray(newValue);
        }
        value = newValue;
        that._emit(path, value);
        return true;
      },
      configurable: true,
      enumerable: true
    });
    this._emit(path, value);
  }


  private _setObserverObject(parent: any, child: any, name: string, childIsObserved = false, observed = null){
    let prefix = parent === this ? null : getMeta(parent).prefix;
    //Podemos recibir un nivel de observed al que corresponde o obtenerlo a partir del prefix del padre
    let obLevel = observed || this._getObservedLevel(prefix);
    //Es posible que ya tenga metadatos, si no tiene se crean y se vuelven a obtener
    let metaDataObj = getMeta(child) || setMeta(child) || getMeta(child);
    metaDataObj.prefix = !prefix ? name : prefix + '.' + name;

    //Observamos el primero de esta rama si esta registrado como observado
    if(obLevel && obLevel[name] && !childIsObserved){
      this._observeProp(parent, name);
    }
    //Si tiene hijos a los que observar... observeProp se ocupara de llamar a setObserverObject
    if(obLevel[name]){
      let properties = Object.keys(obLevel[name]);
      properties.forEach(prop => {
        Debug("--" + prop);
        if( this._canObserve(child[prop]) ){
          Debug("Rama");
          this._setObserverObject(child, child[prop], prop, false, obLevel[name]);
        } else{
          Debug("Propiedad");
          this._observeProp(child, prop);
        }
      });
    }
  }

  private _canObserve(data: any): boolean{
    return typeof data === 'object';
  }

  private _observeArray(array: any){
    let functions: string[] = ['push', 'pop'];
    let that = this;
    let path = getMeta(array).prefix;

    functions.forEach((func: string)=>{
      array[func] = function(){
        let res = Array.prototype[<any>func].apply(this, arguments);
        that._emit(path, this, Method[func as keyof typeof Method]);//.......
        return res;
      }
    });
  }

  public subscribe(path: string, handler: Handler){
    let lastObserved: any = this;
    let lastPropName: string|undefined = undefined;
    path.split('.').reduce( (prevValue, index) =>{
      if( prevValue[index] && typeof lastObserved[index] === 'object' && !lastPropName){
        lastObserved = lastObserved[index];
      }
      else if( !lastPropName ){
        lastPropName = index;
      }
      //Lo añadimos como observado si no existe, despues se comprobara
      if(!prevValue[index]) prevValue[index] = {};
      return prevValue[index];
    }, this._observed);
    Debug('################');
    Debug(lastPropName);
    Debug(JSON.stringify(lastObserved));
    if(lastPropName){
      this._observeProp(lastObserved, lastPropName);
    }
    //Asignamos el handler al path
    this._events[path] = this._events[path] || [];
    this._events[path].push(handler);
  }

  public unSubscribe(path: string, handler: Handler){
    //if(this.events[eventName] === undefined && checkError) throw `There is no event ${eventName}`;
    this._events[path] = (this._events[path] || []).filter((obj: Handler)=>{
      if(obj !== handler && handler.onUnSubscribe){
        handler.onUnSubscribe(path);
      }
      return obj !== handler;
    } );
  }

  public getByPath(path: string): any{
    return path.split('.').reduce((o,i)=> !o ? undefined : o[i], this as any);
  }

  public setByPath(path: string, value: any){
    let arrayPath = path.split('.');
    let prop = arrayPath.pop();
    if(prop === undefined) return;
    let obj = arrayPath.reduce((o,i)=> !o ? undefined : o[i], this as any);
    if(obj){
      obj[prop] = value;
    }
  }

  private _emit(path: string, data: any, method = Method.set){
    Debug(path + '=>' + JSON.stringify(data));
    (this._events[path] || []).forEach((h: Handler)=> h.handle(path, data, {'method': method}));
  }

  /*
  *Obtenemos un nivel de observed en base a una ruta
  */
  private _getObservedLevel(path: string): any{
    //Si es vacia o undefined|null el primer nivel
    if(!path || path === '') return this._observed;
    //Dividimos la ruta en un array y con reduce vamos recorriendolo,
    //si no existe devolvemos null
    return (path.split('.') as any[]).reduce( (prevValue, index) =>{
      if(prevValue !== null) return prevValue[index] || null;
    }, this._observed);
  }

}
