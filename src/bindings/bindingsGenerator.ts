import {Binder} from '../binder';
import {Scope, Handler, ScopeInterface} from '../scope/scope';
import {Template} from './template';
import {Globals} from '../globals';
import {BindingEach} from './bindingEach';
import {Binding} from './binding';

let Debug = Globals.Debug;

function getInputBinding(): Binding{
  let res = new Binding('bind-input');

  res.bindFn = function(element: HTMLInputElement, scope: ScopeInterface){
    let path = this.getParam(element);
    if(path === null) throw "Path is null";

    //Handler se ocupara del evento, se guarda en la informacion del nodo
    let handler = this.createHandler(element);
    handler.handle = function(event, data){
      element.value = data === undefined ? '' : data;
    };
    handler.onUnSubscribe = function(){
      ( this.data.element as HTMLInputElement).removeEventListener('change', this.data.changeListener);
    }
    handler.data.element = element;
    handler.data.changeListener = function(evt: Event){
      let element = evt.target as HTMLInputElement;
      let value:any = element.value;
      switch( (element.getAttribute('type') || 'none').toLowerCase() ){
        case 'number':
          value = parseInt(value);
      }
      Debug(evt.target);
      if( path !== null) scope.setByPath(path, value);
    };
    handler.data.eventName = path;
    scope.subscribe(path, handler);

    element.addEventListener('change', handler.data.changeListener);
    element.value = scope.getByPath(path) || element.value;
    return true;
  };

  res.unbindFn = function(element: HTMLInputElement, scope: ScopeInterface){
    this.getBindingDataNode(element).handlers.forEach((handler: Handler) => scope.unSubscribe(handler.data.eventName, handler));
    return true;
  }

  return res;
}

function getAttrBinding(attrName: string){
  let res = new Binding('bind-' + attrName);

  res.bindFn = function(element: HTMLInputElement, scope: ScopeInterface){
    let path = this.getParam(element);
    if(path === null) throw "Path is null";

    //Handler se ocupara del evento, se guarda en la informacion del nodo
    let handler = this.createHandler(element);
    handler.handle = function(event, data){
      element.setAttribute(attrName, data);
    };
    handler.onUnSubscribe = function(){};

    handler.data.element = element;

    handler.data.eventName = path;
    scope.subscribe(path, handler);

    element.setAttribute(attrName, scope.getByPath(path));
    return true;
  };

  res.unbindFn = function(element: HTMLInputElement, scope: ScopeInterface){
    this.getBindingDataNode(element).handlers.forEach((handler: Handler) => scope.unSubscribe(handler.data.eventName, handler));
    return true;
  }

  return res;
}

function getTemplateBinding(binder: Binder){
  let res = new Binding('template');

  res.bindFn = function(element: HTMLInputElement, scope: ScopeInterface){
    Debug("Iniciando bind template");
    let data = this.getBindingDataNode(element);
    let template = data.template = new Template(element.innerHTML, scope, binder);

    template.prepare(element);
    template.applyTemplate();
    return false;
  };

  res.unbindFn = function(element: HTMLInputElement){
    let template = this.getBindingDataNode(element).template as Template;

    template.unSubscribe();
    element.innerHTML = template.getTemplate();
    return true;
  }

  return res;
}
/**
 * Funcion que genera una serie de objetos Binding y los añade a un objeto.
 * Son Bindings relacionados a una serie de atributos ({prefix}-{atributo})
 * @param {any} obj un nodo del DOM.
 * @param {Scope} scope el scope.
 * @param {Broadcaster} broadcaster el broadcaster con el que subscribirse.
 * @param {string[]} attributes atributos
 */

export function generateBindingsAttr(binder: Binder, attributes = ['title', 'href', 'src', 'name', 'type']){
  attributes.forEach( value =>{
   let aux = getAttrBinding(value);
   binder.addBinding(aux);
  } );
}

export function generateBindings(binder: Binder){
  let  aux = getInputBinding();
  binder.addBinding(aux);

  aux = getTemplateBinding(binder);
  binder.addBinding(aux);

  binder.addBinding(new BindingEach(binder));

  generateBindingsAttr(binder);
}
