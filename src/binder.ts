import {Scope, ScopeInterface} from './scope/scope';
import {Binding} from './bindings/binding';
import {generateBindings} from './bindings/bindingsGenerator';
import {Globals} from './globals';

export class Binder{

  private scope: Scope;
  private bindings: { [key: string]: Binding };
  private rootObserver: MutationObserver;
  private parentNode: Node;

  constructor(node: any){
    this.scope = new Scope();
    this.bindings = {};
    generateBindings(this);

    this.parentNode = node;
    this.prepareObserver();
    this.iterateTree();
    this.observe();
  }

  public addBinding(binding: Binding){
    this.bindings[binding.getName()] = binding;
  }

  public getScope(): Scope{
    return this.scope;
  }

  private bind(node: any, scope: ScopeInterface){
    let attrs = node.attributes;
    let res = true;
    for(var i = attrs.length - 1; i >= 0; i--){
      let attr = attrs[i];
      let binding = this.bindings[attr.name];
      if(binding && !binding.isBinded(node) && !this.bindings[attr.name].bind(node, scope)){
        res = false;
      }
    }
    return res;
  }

  private unbind(node: any){
    let attrs = node.attributes;
    let res = true;
    for(var i = attrs.length - 1; i >= 0; i--){
      let attr = attrs[i];
      let binding = this.bindings[attr.name];
      if(binding && binding.isBinded(node) && !this.bindings[attr.name].unbind(node)){
        res = false;
      }
    }
    return res;
  }

  public processTree(node: any, scope: ScopeInterface = this.scope){
    this.iterateTree(node, scope);
  }

  public iterateTree(node = this.parentNode, scope: ScopeInterface = this.scope){
    let ch = node as any;
    let loopChilds: boolean = true;
    mainloop :
    while (ch) {
      if( ch.nodeType === 1 ){
        loopChilds = this.bind(ch, scope);
      }
      //if node has children, get the first child
      if (loopChilds && ch.children.length > 0) {
          ch = ch.firstElementChild;

      //if node has silbing, get the sibling
      } else if (ch.nextElementSibling) {
          ch = ch.nextElementSibling;

      //if it has neither, crawl up the dom until you find a node that has a sibling and get that sibling
      } else {
          do {
              ch = ch.parentNode;
              //if we are back at document.body, return!
              if (ch === null || ch === node) {
                  break mainloop;
              }
          } while (!ch.nextElementSibling)
          ch = ch.nextElementSibling;
      }

    }
  }

  private prepareObserver(){
    let that = this;
    this.rootObserver = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        switch (mutation.type) {
          case 'attributes':
            if(mutation.attributeName === null) return;
            //Name es el nombre del atributo y oldValue sera el valor anterior, si es nuevo sera null
            let name = mutation.attributeName;
            let oldValue = mutation.oldValue;
            if( that.bindings[name] ){
              if(oldValue !== null){
                that.bindings[name].unbind(mutation.target as HTMLElement);
              }
              if( (mutation.target as HTMLElement).getAttribute(name) !==null ){
                that.bindings[name].bind(mutation.target as HTMLElement, that.scope);
              }
            }
          break;
          case 'childList':
            Array.prototype.forEach.call(mutation.addedNodes, function(node: any){
              if(node.nodeType === 1){
                that.bind(node, that.scope);
              }
            });
            Array.prototype.forEach.call(mutation.removedNodes, function(node: any){
              if(node.nodeType === 1){
                that.unbind(node);
              }
            });
          break;

        }
        Globals.Debug("Nueva mutacion: " + mutation.type);
        Globals.Debug( mutation.target );
        Globals.Debug( mutation);
      });
    });

  }

  public observe(){
    this.rootObserver.observe(this.parentNode, { attributes: true,
      childList: true,
      subtree: true,
      attributeOldValue: true,
      attributeFilter: Object.keys(this.bindings)
    });
  }

  public disconnect(){
    this.rootObserver.disconnect();
  }
}
