var Binder =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 5);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Globals = (function () {
    function Globals() {
    }
    Globals.PREFIX = 'ie';
    Globals.PRIV_PROP = '_' + Globals.PREFIX;
    Globals.Debug = function (aux) { }; //console.log;//
    return Globals;
}());
exports.Globals = Globals;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var globals_1 = __webpack_require__(0);
var PRIV_PREFIX = globals_1.Globals.PREFIX;
var Debug = globals_1.Globals.Debug; //console.log;
var Method;
(function (Method) {
    Method["set"] = "SET";
    Method["push"] = "PUSH";
    Method["pop"] = "POP";
})(Method = exports.Method || (exports.Method = {}));
var Handler = (function () {
    function Handler() {
        this.data = {};
    }
    return Handler;
}());
exports.Handler = Handler;
function getMeta(obj) {
    return obj[PRIV_PREFIX];
}
function setMeta(obj, data) {
    if (data === void 0) { data = {}; }
    Object.defineProperty(obj, PRIV_PREFIX, { enumerable: false, writable: false, value: data });
}
var Scope = (function () {
    function Scope() {
        Object.defineProperty(this, '_observed', { enumerable: false, writable: false, value: {} });
        Object.defineProperty(this, '_events', { enumerable: false, writable: false, value: [] });
        setMeta(this, { prefix: '' });
    }
    Scope.prototype._genPath = function (parent, prop) {
        return parent === this ? prop : getMeta(parent).prefix + '.' + prop;
    };
    Scope.prototype._observeProp = function (parent, prop) {
        var that = this;
        var value = parent[prop];
        var path = this._genPath(parent, prop);
        if (Array.isArray(value)) {
            that._observeArray(value);
        }
        Debug("definiendo propiedad para observar: " + path);
        Object.defineProperty(parent, prop, {
            get: function () {
                return value;
            },
            set: function (newValue) {
                if (typeof newValue === 'object') {
                    Debug("Objeto en set, se recorrera");
                    that._setObserverObject(parent, newValue, prop, true);
                }
                if (Array.isArray(newValue)) {
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
    };
    Scope.prototype._setObserverObject = function (parent, child, name, childIsObserved, observed) {
        var _this = this;
        if (childIsObserved === void 0) { childIsObserved = false; }
        if (observed === void 0) { observed = null; }
        var prefix = parent === this ? null : getMeta(parent).prefix;
        //Podemos recibir un nivel de observed al que corresponde o obtenerlo a partir del prefix del padre
        var obLevel = observed || this._getObservedLevel(prefix);
        //Es posible que ya tenga metadatos, si no tiene se crean y se vuelven a obtener
        var metaDataObj = getMeta(child) || setMeta(child) || getMeta(child);
        metaDataObj.prefix = !prefix ? name : prefix + '.' + name;
        //Observamos el primero de esta rama si esta registrado como observado
        if (obLevel && obLevel[name] && !childIsObserved) {
            this._observeProp(parent, name);
        }
        //Si tiene hijos a los que observar... observeProp se ocupara de llamar a setObserverObject
        if (obLevel[name]) {
            var properties = Object.keys(obLevel[name]);
            properties.forEach(function (prop) {
                Debug("--" + prop);
                if (_this._canObserve(child[prop])) {
                    Debug("Rama");
                    _this._setObserverObject(child, child[prop], prop, false, obLevel[name]);
                }
                else {
                    Debug("Propiedad");
                    _this._observeProp(child, prop);
                }
            });
        }
    };
    Scope.prototype._canObserve = function (data) {
        return typeof data === 'object';
    };
    Scope.prototype._observeArray = function (array) {
        var functions = ['push', 'pop'];
        var that = this;
        var path = getMeta(array).prefix;
        functions.forEach(function (func) {
            array[func] = function () {
                var res = Array.prototype[func].apply(this, arguments);
                that._emit(path, this, Method[func]); //.......
                return res;
            };
        });
    };
    Scope.prototype.subscribe = function (path, handler) {
        var lastObserved = this;
        var lastPropName = undefined;
        path.split('.').reduce(function (prevValue, index) {
            if (prevValue[index] && typeof lastObserved[index] === 'object' && !lastPropName) {
                lastObserved = lastObserved[index];
            }
            else if (!lastPropName) {
                lastPropName = index;
            }
            //Lo añadimos como observado si no existe, despues se comprobara
            if (!prevValue[index])
                prevValue[index] = {};
            return prevValue[index];
        }, this._observed);
        Debug('################');
        Debug(lastPropName);
        Debug(JSON.stringify(lastObserved));
        if (lastPropName) {
            this._observeProp(lastObserved, lastPropName);
        }
        //Asignamos el handler al path
        this._events[path] = this._events[path] || [];
        this._events[path].push(handler);
    };
    Scope.prototype.unSubscribe = function (path, handler) {
        //if(this.events[eventName] === undefined && checkError) throw `There is no event ${eventName}`;
        this._events[path] = (this._events[path] || []).filter(function (obj) {
            if (obj !== handler && handler.onUnSubscribe) {
                handler.onUnSubscribe(path);
            }
            return obj !== handler;
        });
    };
    Scope.prototype.getByPath = function (path) {
        return path.split('.').reduce(function (o, i) { return !o ? undefined : o[i]; }, this);
    };
    Scope.prototype.setByPath = function (path, value) {
        var arrayPath = path.split('.');
        var prop = arrayPath.pop();
        if (prop === undefined)
            return;
        var obj = arrayPath.reduce(function (o, i) { return !o ? undefined : o[i]; }, this);
        if (obj) {
            obj[prop] = value;
        }
    };
    Scope.prototype._emit = function (path, data, method) {
        if (method === void 0) { method = Method.set; }
        Debug(path + '=>' + JSON.stringify(data));
        (this._events[path] || []).forEach(function (h) { return h.handle(path, data, { 'method': method }); });
    };
    /*
    *Obtenemos un nivel de observed en base a una ruta
    */
    Scope.prototype._getObservedLevel = function (path) {
        //Si es vacia o undefined|null el primer nivel
        if (!path || path === '')
            return this._observed;
        //Dividimos la ruta en un array y con reduce vamos recorriendolo,
        //si no existe devolvemos null
        return path.split('.').reduce(function (prevValue, index) {
            if (prevValue !== null)
                return prevValue[index] || null;
        }, this._observed);
    };
    return Scope;
}());
exports.Scope = Scope;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var globals_1 = __webpack_require__(0);
var expression_1 = __webpack_require__(3);
var Debug = globals_1.Globals.Debug;
var Template = (function () {
    function Template(template, scope, binder) {
        this.template = template;
        this.scope = scope;
        this.binder = binder;
        this.justApplied = false;
        this.expressions = [];
        this.templateComponents = [];
    }
    Template.prototype.escapeForHTML = function (data) {
        if (data === void 0) { data = ''; }
        switch (typeof data) {
            case 'string':
                return data.replace(Template.REGEX_ESCAPE, Template.ESCAPE_CHAR);
            case 'object':
                return JSON.stringify(data);
            default:
                return (data + "").replace(Template.REGEX_ESCAPE, Template.ESCAPE_CHAR);
        }
    };
    Template.prototype.prepare = function (element) {
        this.element = element;
        this.element.innerHTML = '';
        var that = this;
        var regex = Template.REGEX_EXP, matches;
        var lastIndex = 0;
        var _loop_1 = function () {
            var expString = matches[0];
            var index = matches.index;
            this_1.templateComponents.push(this_1.template.slice(lastIndex, index));
            lastIndex = index + expString.length;
            var expression = new expression_1.Expression(expString.replace(Template.REGEX_CLEAN, ''), this_1.scope);
            this_1.expressions.push(expression);
            this_1.templateComponents.push(that.escapeForHTML(expression.exec()));
            var expIndexInComp = this_1.templateComponents.length - 1;
            expression.onExec = function (value) {
                var aux = window;
                aux.prueba = aux.prueba || 0;
                that.templateComponents[expIndexInComp] = that.escapeForHTML(value);
                that.applyTemplate();
            };
        };
        var this_1 = this;
        while ((matches = regex.exec(this.template))) {
            _loop_1();
        }
        this.templateComponents.push(this.template.slice(lastIndex));
    };
    /*
    * Con esta funcion evitamos que se ejecute varias veces seguidas la aplicacion de una plantilla en el DOM
    * por ejemplo puede haber varias expresiones que observen la misma propiedad por lo que se ejecutara applyTemplate
    * x numero de veces incluyendo la desconexion del observer del Binder
    * applyTemplate se ejecutara de manera asincrona la primera vez
    */
    Template.prototype.applyTemplate = function () {
        var _this = this;
        this.checkApplyAsync = true;
        setTimeout(function () {
            if (!_this.checkApplyAsync)
                return;
            _this._applyTemplateForAsync();
            _this.checkApplyAsync = false;
        });
    };
    Template.prototype._applyTemplateForAsync = function () {
        var newHtml = this.templateComponents.join('');
        Debug(this.templateComponents);
        this.binder.disconnect();
        this.element.innerHTML = newHtml;
        console.log(this.element);
        console.log("ssssssssssssss");
        this.binder.processTree(this.element);
        this.binder.observe();
    };
    Template.prototype.unSubscribe = function () {
        this.expressions.forEach(function (exp) { return exp.unSubscribe(); });
    };
    Template.prototype.getTemplate = function () {
        return this.template;
    };
    Template.DELIMITERS = ['{{{', '}}}'];
    Template.REGEX_EXP = new RegExp(Template.DELIMITERS[0] + '.*?' + Template.DELIMITERS[1], "g");
    Template.REGEX_CLEAN = new RegExp(Template.DELIMITERS[0] + '|' + Template.DELIMITERS[1], "g");
    //Caracteres para escapar texto a introducir en rodeado por html
    Template.ESCAPE_MAP = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;'
    };
    Template.REGEX_ESCAPE = new RegExp(Object.keys(Template.ESCAPE_MAP).join('|'), 'g');
    Template.ESCAPE_CHAR = function (c) {
        return Template.ESCAPE_MAP[c];
    };
    return Template;
}());
exports.Template = Template;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var scope_1 = __webpack_require__(1);
var globals_1 = __webpack_require__(0);
var Debug = globals_1.Globals.Debug;
var Expression = (function () {
    function Expression(origExpression, scope) {
        this.origExpression = origExpression;
        this.scope = scope;
        var expression = origExpression;
        this.models = {};
        this.expParams = [];
        var regex = Expression.REGEX_VAR, matches;
        var index = -1;
        var args = [];
        while ((matches = regex.exec(this.origExpression))) {
            index++;
            var model = matches[0].replace(Expression.REGEX_CLEAN, '');
            this.expParams[index] = this.scope.getByPath(model);
            if (this.models[model]) {
                this.models[model].paramIndexes.push(index);
                continue;
            }
            var aux = this.models[model] = {
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
    Expression.prototype.getHandler = function () {
        if (!this._handler) {
            this._handler = new scope_1.Handler();
            var that_1 = this;
            this._handler.handle = function (evt, data) {
                that_1.models[evt].paramIndexes.forEach(function (i) { return that_1.expParams[i] = data; });
                that_1.exec();
            };
        }
        return this._handler;
    };
    Expression.prototype.escape = function (text) {
        return text.replace(Expression.REGEX_ESCAPE, '\\$&');
    };
    Expression.prototype.exec = function (context) {
        if (context === void 0) { context = {}; }
        var value = undefined;
        try {
            value = this.funcExp.apply(context, this.expParams);
        }
        catch (err) {
            console.error(err.message);
        }
        if (this.onExec)
            this.onExec(value);
        return value;
    };
    Expression.prototype.unSubscribe = function () {
        var keys = Object.keys(this.models);
        var handler = this.getHandler();
        for (var i = keys.length - 1; i >= 0; i--) {
            this.scope.unSubscribe(keys[i], handler);
        }
    };
    Expression.VARIABLE_SYMBOL = '%%';
    Expression.REGEX_VAR = new RegExp(Expression.VARIABLE_SYMBOL + '[a-zA-Z0-9_\\-\\.]{1,}', "g");
    Expression.REGEX_CLEAN = new RegExp(Expression.VARIABLE_SYMBOL + '|\\ ', "g");
    Expression.REGEX_ESCAPE = /[-[\]{}()*+?.,\\^$|#\s]/g;
    return Expression;
}());
exports.Expression = Expression;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var scope_1 = __webpack_require__(1);
var globals_1 = __webpack_require__(0);
var Debug = globals_1.Globals.Debug;
var Binding = (function () {
    function Binding(name) {
        this.name = 'ie' + '-' + name;
    }
    Binding.prototype.bind = function (element, scope) {
        this.setScope(element, scope);
        return this.bindFn(element, scope);
    };
    Binding.prototype.unbind = function (element) {
        var res = this.unbindFn(element, this.getScope(element));
        this.deleteBindingDataNode(element);
        return res;
    };
    Binding.prototype.isBinded = function (element) {
        return Binding.NODES[Binding.GetNodeId(element)] && !!Binding.NODES[Binding.GetNodeId(element)].bindingsData[this.name];
    };
    /**
     * Obtener la id correspondiente a un nodo del DOM.
     * Si no tiene se le asigna a partir de un contador
     * @param {any} node un nodo del DOM.
     * @return {number} la id del nodo.
     */
    Binding.GetNodeId = function (node) {
        var data = node[Binding.PRIV_PROP] = node[Binding.PRIV_PROP] || {};
        data.id = data.id || Binding.NODE_COUNT++;
        Debug("Nueva id para un nodo " + data.id);
        return data.id;
    };
    /**
     * Obtener un objeto con los datos relativos a un nodo, sobre todos sus bindings.
     * @param {any} node un nodo del DOM.
     * @return {any} objeto.
     */
    Binding.GetDataNode = function (node) {
        var id = Binding.GetNodeId(node);
        Binding.NODES[id] = Binding.NODES[id] || { bindingsData: {} };
        return Binding.NODES[id];
    };
    /**
     * Obtener un objeto con los datos relativos a un nodo, sobre el binding actual del objeto.
     * @param {any} node un nodo del DOM.
     * @return {any} objeto.
     */
    Binding.prototype.getBindingDataNode = function (node) {
        var data = Binding.GetDataNode(node);
        data.bindingsData[this.name] = data.bindingsData[this.name] || { handlers: [] };
        return data.bindingsData[this.name];
    };
    /**
     * Obtener el scope para un binding concreto de un nodo
     * @param {any} node un nodo del DOM.
     * @return {ScopeInterface} el objeto scope.
     */
    Binding.prototype.getScope = function (node) {
        return this.getBindingDataNode(node).scope;
    };
    /**
     * Establecer el scope para un binding concreto de un nodo
     * @param {any} node un nodo del DOM.
     * @return {ScopeInterface} el objeto scope.
     */
    Binding.prototype.setScope = function (node, scope) {
        this.getBindingDataNode(node).scope = scope;
    };
    Binding.prototype.deleteBindingDataNode = function (node) {
        var data = Binding.GetDataNode(node);
        delete data.bindingsData[this.name];
    };
    Binding.prototype.storeHandler = function (node, handler) {
        var data = this.getBindingDataNode(node);
        data.handlers.push(handler);
    };
    Binding.prototype.retrieveHandlers = function (node) {
        return this.getBindingDataNode(node).handlers;
    };
    Binding.prototype.createHandler = function (node) {
        var res = new scope_1.Handler();
        this.getBindingDataNode(node).handlers.push(res);
        return res;
    };
    Binding.prototype.getName = function () {
        return this.name;
    };
    /**
     * Contenido del atributo del binding
     * @param {HTMLElement} element el elemento HTML.
     * @return {string|null} contenido del atributo.
     */
    Binding.prototype.getParam = function (element) {
        return element.getAttribute(this.getName());
    };
    Binding.NODES = [];
    Binding.NODE_COUNT = 1;
    Binding.PRIV_PROP = '_' + 'ie';
    return Binding;
}());
exports.Binding = Binding;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var binder_1 = __webpack_require__(6);
exports.Binder = binder_1.Binder;
var expression_1 = __webpack_require__(3);
exports.Expression = expression_1.Expression;
var template_1 = __webpack_require__(2);
exports.Template = template_1.Template;


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var scope_1 = __webpack_require__(1);
var bindingsGenerator_1 = __webpack_require__(7);
var globals_1 = __webpack_require__(0);
var Binder = (function () {
    function Binder(node) {
        this.scope = new scope_1.Scope();
        this.bindings = {};
        bindingsGenerator_1.generateBindings(this);
        this.parentNode = node;
        this.prepareObserver();
        this.iterateTree();
        this.observe();
    }
    Binder.prototype.addBinding = function (binding) {
        this.bindings[binding.getName()] = binding;
    };
    Binder.prototype.getScope = function () {
        return this.scope;
    };
    Binder.prototype.bind = function (node, scope) {
        var attrs = node.attributes;
        var res = true;
        for (var i = attrs.length - 1; i >= 0; i--) {
            var attr = attrs[i];
            var binding = this.bindings[attr.name];
            if (binding && !binding.isBinded(node) && !this.bindings[attr.name].bind(node, scope)) {
                res = false;
            }
        }
        return res;
    };
    Binder.prototype.unbind = function (node) {
        var attrs = node.attributes;
        var res = true;
        for (var i = attrs.length - 1; i >= 0; i--) {
            var attr = attrs[i];
            var binding = this.bindings[attr.name];
            if (binding && binding.isBinded(node) && !this.bindings[attr.name].unbind(node)) {
                res = false;
            }
        }
        return res;
    };
    Binder.prototype.processTree = function (node, scope) {
        if (scope === void 0) { scope = this.scope; }
        this.iterateTree(node, scope);
    };
    Binder.prototype.iterateTree = function (node, scope) {
        if (node === void 0) { node = this.parentNode; }
        if (scope === void 0) { scope = this.scope; }
        var ch = node;
        var loopChilds = true;
        mainloop: while (ch) {
            if (ch.nodeType === 1) {
                loopChilds = this.bind(ch, scope);
            }
            //if node has children, get the first child
            if (loopChilds && ch.children.length > 0) {
                ch = ch.firstElementChild;
                //if node has silbing, get the sibling
            }
            else if (ch.nextElementSibling) {
                ch = ch.nextElementSibling;
                //if it has neither, crawl up the dom until you find a node that has a sibling and get that sibling
            }
            else {
                do {
                    ch = ch.parentNode;
                    //if we are back at document.body, return!
                    if (ch === null || ch === node) {
                        break mainloop;
                    }
                } while (!ch.nextElementSibling);
                ch = ch.nextElementSibling;
            }
        }
    };
    Binder.prototype.prepareObserver = function () {
        var that = this;
        this.rootObserver = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                switch (mutation.type) {
                    case 'attributes':
                        if (mutation.attributeName === null)
                            return;
                        //Name es el nombre del atributo y oldValue sera el valor anterior, si es nuevo sera null
                        var name = mutation.attributeName;
                        var oldValue = mutation.oldValue;
                        if (that.bindings[name]) {
                            if (oldValue !== null) {
                                that.bindings[name].unbind(mutation.target);
                            }
                            if (mutation.target.getAttribute(name) !== null) {
                                that.bindings[name].bind(mutation.target, that.scope);
                            }
                        }
                        break;
                    case 'childList':
                        Array.prototype.forEach.call(mutation.addedNodes, function (node) {
                            if (node.nodeType === 1) {
                                that.bind(node, that.scope);
                            }
                        });
                        Array.prototype.forEach.call(mutation.removedNodes, function (node) {
                            if (node.nodeType === 1) {
                                that.unbind(node);
                            }
                        });
                        break;
                }
                globals_1.Globals.Debug("Nueva mutacion: " + mutation.type);
                globals_1.Globals.Debug(mutation.target);
                globals_1.Globals.Debug(mutation);
            });
        });
    };
    Binder.prototype.observe = function () {
        this.rootObserver.observe(this.parentNode, { attributes: true,
            childList: true,
            subtree: true,
            attributeOldValue: true,
            attributeFilter: Object.keys(this.bindings)
        });
    };
    Binder.prototype.disconnect = function () {
        this.rootObserver.disconnect();
    };
    return Binder;
}());
exports.Binder = Binder;


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var template_1 = __webpack_require__(2);
var globals_1 = __webpack_require__(0);
var bindingEach_1 = __webpack_require__(8);
var binding_1 = __webpack_require__(4);
var Debug = globals_1.Globals.Debug;
function getInputBinding() {
    var res = new binding_1.Binding('bind-input');
    res.bindFn = function (element, scope) {
        var path = this.getParam(element);
        if (path === null)
            throw "Path is null";
        //Handler se ocupara del evento, se guarda en la informacion del nodo
        var handler = this.createHandler(element);
        handler.handle = function (event, data) {
            element.value = data === undefined ? '' : data;
        };
        handler.onUnSubscribe = function () {
            this.data.element.removeEventListener('change', this.data.changeListener);
        };
        handler.data.element = element;
        handler.data.changeListener = function (evt) {
            var element = evt.target;
            var value = element.value;
            switch ((element.getAttribute('type') || 'none').toLowerCase()) {
                case 'number':
                    value = parseInt(value);
            }
            Debug(evt.target);
            if (path !== null)
                scope.setByPath(path, value);
        };
        handler.data.eventName = path;
        scope.subscribe(path, handler);
        element.addEventListener('change', handler.data.changeListener);
        element.value = scope.getByPath(path) || element.value;
        return true;
    };
    res.unbindFn = function (element, scope) {
        this.getBindingDataNode(element).handlers.forEach(function (handler) { return scope.unSubscribe(handler.data.eventName, handler); });
        return true;
    };
    return res;
}
function getAttrBinding(attrName) {
    var res = new binding_1.Binding('bind-' + attrName);
    res.bindFn = function (element, scope) {
        var path = this.getParam(element);
        if (path === null)
            throw "Path is null";
        //Handler se ocupara del evento, se guarda en la informacion del nodo
        var handler = this.createHandler(element);
        handler.handle = function (event, data) {
            element.setAttribute(attrName, data);
        };
        handler.onUnSubscribe = function () { };
        handler.data.element = element;
        handler.data.eventName = path;
        scope.subscribe(path, handler);
        element.setAttribute(attrName, scope.getByPath(path));
        return true;
    };
    res.unbindFn = function (element, scope) {
        this.getBindingDataNode(element).handlers.forEach(function (handler) { return scope.unSubscribe(handler.data.eventName, handler); });
        return true;
    };
    return res;
}
function getTemplateBinding(binder) {
    var res = new binding_1.Binding('template');
    res.bindFn = function (element, scope) {
        Debug("Iniciando bind template");
        var data = this.getBindingDataNode(element);
        var template = data.template = new template_1.Template(element.innerHTML, scope, binder);
        template.prepare(element);
        template.applyTemplate();
        return false;
    };
    res.unbindFn = function (element) {
        var template = this.getBindingDataNode(element).template;
        template.unSubscribe();
        element.innerHTML = template.getTemplate();
        return true;
    };
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
function generateBindingsAttr(binder, attributes) {
    if (attributes === void 0) { attributes = ['title', 'href', 'src', 'name', 'type']; }
    attributes.forEach(function (value) {
        var aux = getAttrBinding(value);
        binder.addBinding(aux);
    });
}
exports.generateBindingsAttr = generateBindingsAttr;
function generateBindings(binder) {
    var aux = getInputBinding();
    binder.addBinding(aux);
    aux = getTemplateBinding(binder);
    binder.addBinding(aux);
    binder.addBinding(new bindingEach_1.BindingEach(binder));
    generateBindingsAttr(binder);
}
exports.generateBindings = generateBindings;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var binding_1 = __webpack_require__(4);
var scope_1 = __webpack_require__(1);
var proxyScope_1 = __webpack_require__(9);
var BindingEach = (function (_super) {
    __extends(BindingEach, _super);
    function BindingEach(binder) {
        var _this = _super.call(this, 'each') || this;
        _this.binder = binder;
        return _this;
    }
    BindingEach.prototype.storeBaseElement = function (element) {
        this.getBindingDataNode(element)['baseElement'] = element.firstElementChild;
    };
    BindingEach.prototype.getBaseElement = function (element) {
        return this.getBindingDataNode(element)['baseElement'];
    };
    BindingEach.prototype.fillElement = function (element, scope, modelName, pathArray) {
        var _this = this;
        var dataArray = scope.getByPath(pathArray);
        var base = this.getBaseElement(element);
        this.binder.disconnect();
        dataArray.forEach(function (data, index) {
            var newElem = base.cloneNode(true);
            var proxyParam = {};
            proxyParam[modelName] = pathArray + '.' + index;
            var proxyScope = new proxyScope_1.ProxyScope(proxyParam, scope);
            _this.binder.processTree(newElem, proxyScope);
            element.appendChild(newElem);
        });
        this.binder.observe();
    };
    BindingEach.prototype.bind = function (element, scope) {
        var _this = this;
        var bindingData = this.getBindingDataNode(element);
        var result = BindingEach.REGEX_PARAM.exec(this.getParam(element));
        this.storeBaseElement(element);
        element.innerHTML = "";
        if (result === null) {
            console.error("Parametro no valido: " + this.getParam(element));
            return false;
        }
        var model = result[1].trim();
        var path = result[2].trim();
        var handler = this.createHandler(element);
        handler.data.observedPath = path;
        handler.handle = function (path, data, meta) {
            if (meta && meta.method === scope_1.Method.set)
                _this.fillElement(element, scope, model, path);
        };
        scope.subscribe(path, handler);
        return false;
    };
    BindingEach.prototype.unbind = function (element) {
        var scope = this.getScope(element);
        this.getBindingDataNode(element).handlers.forEach(function (handler) { return scope.unSubscribe(handler.data.observedPath, handler); });
        this.deleteBindingDataNode(element);
        return true;
    };
    BindingEach.REGEX_PARAM = /(.*)? +in +(.*)?/g;
    return BindingEach;
}(binding_1.Binding));
exports.BindingEach = BindingEach;


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var scope_1 = __webpack_require__(1);
var ProxyScope = (function () {
    function ProxyScope(proxied, scope) {
        var _this = this;
        Object.defineProperty(this, '_proxied', { enumerable: false, writable: false, value: proxied });
        Object.defineProperty(this, '_scope', { enumerable: false, writable: false, value: scope });
        Object.defineProperty(this, '_handlersMap', { enumerable: false, writable: false, value: {} });
        Object.defineProperty(this, '_inversedProxied', { enumerable: false, writable: false, value: {} });
        Object.defineProperty(this, '_handler', { enumerable: false, writable: false, value: new scope_1.Handler() });
        var properties = Object.keys(proxied);
        var that = this;
        Object.keys(scope).forEach(function (key) {
            if (properties.indexOf(key) != -1)
                return;
            Object.defineProperty(_this, key, { enumerable: true,
                get: function () { return _this._scope[key]; },
                set: function (value) { return _this._scope[key] = value; }
            });
        });
        this._handler.handle = function (path, data, meta) {
            var model = that._inversedProxied[path];
            if (model) {
                (that._handlersMap[model] || []).forEach(function (handler) { return handler.handle(model, data, meta); });
            }
        };
        properties.forEach(function (key) {
            var path = _this._proxied[key];
            _this._inversedProxied[path] = key;
            Object.defineProperty(_this, key, {
                enumerable: true,
                get: function () { return _this._scope.getByPath(path); },
                set: function (value) { return _this._scope.setByPath(path, value); }
            });
            _this._scope.subscribe(path, _this._handler);
        });
    }
    ProxyScope.prototype.subscribe = function (path, handler) {
        if (this._proxied[path]) {
            this._handlersMap[path] = this._handlersMap[path] || [];
            this._handlersMap[path].push(handler);
            return;
        }
        this._scope.subscribe(path, handler);
    };
    ProxyScope.prototype.unSubscribe = function (path, handler) {
        if (this._proxied[path]) {
            this._handlersMap[path] = this._handlersMap[path].filter(function (h) { return h !== handler; });
            return;
        }
        this._scope.unSubscribe(path, handler);
    };
    ProxyScope.prototype.getByPath = function (path) {
        return path.split('.').reduce(function (o, i) { return !o ? undefined : o[i]; }, this);
    };
    ProxyScope.prototype.setByPath = function (path, value) {
        var arrayPath = path.split('.');
        var prop = arrayPath.pop();
        var obj = arrayPath.reduce(function (o, i) { return !o ? undefined : o[i]; }, this);
        if (prop === undefined)
            return;
        if (obj) {
            obj[prop] = value;
        }
    };
    return ProxyScope;
}());
exports.ProxyScope = ProxyScope;


/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgOTY1OGY3MjAyMmY0ODI2NWQ1YTMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2dsb2JhbHMudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3Njb3BlL3Njb3BlLnRzIiwid2VicGFjazovLy8uL3NyYy9iaW5kaW5ncy90ZW1wbGF0ZS50cyIsIndlYnBhY2s6Ly8vLi9zcmMvYmluZGluZ3MvZXhwcmVzc2lvbi50cyIsIndlYnBhY2s6Ly8vLi9zcmMvYmluZGluZ3MvYmluZGluZy50cyIsIndlYnBhY2s6Ly8vLi9zcmMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2JpbmRlci50cyIsIndlYnBhY2s6Ly8vLi9zcmMvYmluZGluZ3MvYmluZGluZ3NHZW5lcmF0b3IudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2JpbmRpbmdzL2JpbmRpbmdFYWNoLnRzIiwid2VicGFjazovLy8uL3NyYy9zY29wZS9wcm94eVNjb3BlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7QUM3REE7SUFBQTtJQUlBLENBQUM7SUFIZSxjQUFNLEdBQUcsSUFBSSxDQUFDO0lBQ2QsaUJBQVMsR0FBRyxHQUFHLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQztJQUNqQyxhQUFLLEdB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QyxNQUFNLENBQUM7UUFDOUIsRUFBRSxFQUFDLEdBQUcsQ0FBQyxFQUFDO1lBQ04sR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQztRQUNwQixDQUFDO0lBQ0gsQ0FBQztJQUdILGlCQUFDO0FBQUQsQ0FBQztBQTlFWSxnQ0FBVSIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSA1KTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCA5NjU4ZjcyMDIyZjQ4MjY1ZDVhMyIsImV4cG9ydCBjbGFzcyBHbG9iYWxze1xuICBwdWJsaWMgc3RhdGljIFBSRUZJWCA9ICdpZSc7XG4gIHB1YmxpYyBzdGF0aWMgUFJJVl9QUk9QID0gJ18nICsgR2xvYmFscy5QUkVGSVg7XG4gIHB1YmxpYyBzdGF0aWMgRGVidWcgPSBmdW5jdGlvbihhdXg6IGFueSl7fTsvL2NvbnNvbGUubG9nOy8vXG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvZ2xvYmFscy50cyIsImltcG9ydCB7R2xvYmFsc30gZnJvbSAnLi4vZ2xvYmFscyc7XG5cbmxldCBQUklWX1BSRUZJWCA9IEdsb2JhbHMuUFJFRklYO1xubGV0IERlYnVnID0gR2xvYmFscy5EZWJ1ZzsvL2NvbnNvbGUubG9nO1xuXG5leHBvcnQgZW51bSBNZXRob2Qge1xuICBzZXQgPSAnU0VUJyxcbiAgcHVzaCA9ICdQVVNIJyxcbiAgcG9wID0gJ1BPUCdcbn1cblxuZXhwb3J0IGNsYXNzIEhhbmRsZXJ7XG4gIGhhbmRsZTogKHBhdGg6IHN0cmluZywgZGF0YTogYW55LCBtZXRhRGF0YT86IHttZXRob2Q6IE1ldGhvZH0pPT4gdm9pZDtcbiAgb25VblN1YnNjcmliZTogKHBhdGg6IHN0cmluZykgPT4gdm9pZDtcbiAgZGF0YTogYW55O1xuXG4gIGNvbnN0cnVjdG9yKCl7XG4gICAgdGhpcy5kYXRhID0ge307XG4gIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBTY29wZUludGVyZmFjZXtcbiAgZ2V0QnlQYXRoKHBhdGg6IHN0cmluZyk6IGFueTtcbiAgc2V0QnlQYXRoKHBhdGg6IHN0cmluZywgdmFsdWU6IGFueSk6IHZvaWQ7XG4gIHN1YnNjcmliZShwYXRoOiBzdHJpbmcsIGhhbmRsZXI6IEhhbmRsZXIpOiB2b2lkO1xuICB1blN1YnNjcmliZShwYXRoOiBzdHJpbmcsIGhhbmRsZXI6IEhhbmRsZXIpOiB2b2lkO1xufVxuXG5mdW5jdGlvbiBnZXRNZXRhKG9iajogYW55KTogYW55e1xuICByZXR1cm4gb2JqW1BSSVZfUFJFRklYXTtcbn1cblxuZnVuY3Rpb24gc2V0TWV0YShvYmo6IGFueSwgZGF0YSA9IHt9KXtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwgUFJJVl9QUkVGSVgsIHtlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IGZhbHNlLCB2YWx1ZTogZGF0YX0pO1xufVxuXG5leHBvcnQgY2xhc3MgU2NvcGUgaW1wbGVtZW50cyBTY29wZUludGVyZmFjZXtcbiAgW2tleTogc3RyaW5nXTogYW55XG4gIC8vU2UgYmFzYSBlbiBkb3MgXCJhcmJvbGVzXCIsIHRlbmVtb3MgbGEgamVyYXJxdWlhIGRlIG9iamV0b3Mgbm9ybWFsIGRlIG51ZXN0cm8gc2NvcGUgeVxuICAvLyB1biBlc3RydWN1dHJhIHF1ZSBtYW50aWVuZSBsb3Mgbm9tYnJlcyBkZSBsYXMgcHJvcGllZGFkZXMgcXVlIHNlIG9ic2VydmFuXG4gIC8vQ3VhbmRvIHNlIHF1aWVyZSBvYnNlcnZhciB1bmEgcHJvcGllZGFkIGEgdHJhdmVzIGRlIHVuYSBydXRhIHNlIGdlbmVyYSB1bmEgcmFtYVxuICAvL2VuIG9ic2VydmVkLCBlbnRvbmNlcyBzZSByZWNvcnJlIGVsIHNjb3BlIG5pdmVsIGEgbml2ZWwgaGFzdGEgbGxlZ2FyIGFsIHVsdGltb1xuICAvL2VsZW1lbnRvIHF1ZSBwdWVkYSB1c2Fyc2UgcGFyYSBkZWZpbmlyIHByb3BpZWRhZGVzICh0eXBlIG9iamVjdCksIHlhIHF1ZSBDdWFuZG9cbiAgLy9xdWVyZW1vcyBvYnNlcnZhciB1biBjYW1iaW8gZXMgcG9zaWJsZSBxdWUgbm8gcHVlZGEgYWxjYW56YXJzZSBlbCBvYmpldGl2by5cbiAgLy9TZSBkZWZpbmUgbGEgcHJvcGllZGFkIGNvcnJlc3BvbmRpZW50ZSBhbCBwYXRoIHNvYnJlIGVzZSB1bHRpbW8gb2JqZXRvIGRlXG4gIC8vZm9ybWEgcXVlIHBvZGFtb3Mgb2JzZXJ2YXIgdW4gc2V0LCB5IGN1YW5kbyBzZSBhc2lnbmVcbiAgLy91biBvYmpldG8gc2UgY29tcHJvYmFyYSBzaSB0aWVuZSBwcm9waWVkYWRlcyBhIG9ic2VydmFyIGRlIGEgYWN1ZXJkbyBhbCBvYmpldG8gb2JzZXJ2ZWRcblxuICBwcml2YXRlIF9vYnNlcnZlZDogYW55O1xuICBwcml2YXRlIF9ldmVudHM6IHtbaW5kZXg6IHN0cmluZ106IEhhbmRsZXJbXX07XG5cbiAgY29uc3RydWN0b3IoKXtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ19vYnNlcnZlZCcsIHtlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IGZhbHNlLCB2YWx1ZTp7fX0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnX2V2ZW50cycsIHtlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IGZhbHNlLCB2YWx1ZTpbXX0pO1xuICAgIHNldE1ldGEodGhpcywge3ByZWZpeDogJyd9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2dlblBhdGgocGFyZW50OiBhbnksIHByb3A6IHN0cmluZyl7XG4gICAgcmV0dXJuIHBhcmVudCA9PT0gdGhpcyA/IHByb3AgOiBnZXRNZXRhKHBhcmVudCkucHJlZml4ICsgJy4nICsgcHJvcDtcbiAgfVxuXG4gIHByaXZhdGUgX29ic2VydmVQcm9wKHBhcmVudDphbnksIHByb3A6IHN0cmluZyl7XG4gICAgbGV0IHRoYXQgPSB0aGlzO1xuICAgIGxldCB2YWx1ZSA9IHBhcmVudFtwcm9wXTtcbiAgICBsZXQgcGF0aCA9IHRoaXMuX2dlblBhdGgocGFyZW50LCBwcm9wKTtcblxuICAgIGlmKEFycmF5LmlzQXJyYXkodmFsdWUpKXtcbiAgICAgIHRoYXQuX29ic2VydmVBcnJheSh2YWx1ZSk7XG4gICAgfVxuXG4gICAgRGVidWcoXCJkZWZpbmllbmRvIHByb3BpZWRhZCBwYXJhIG9ic2VydmFyOiBcIitwYXRoKTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkocGFyZW50LCBwcm9wLHtcbiAgICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgfSxcbiAgICAgIHNldDogZnVuY3Rpb24obmV3VmFsdWUpe1xuICAgICAgICBpZih0eXBlb2YgbmV3VmFsdWUgPT09ICdvYmplY3QnKXtcbiAgICAgICAgICBEZWJ1ZyhcIk9iamV0byBlbiBzZXQsIHNlIHJlY29ycmVyYVwiKTtcbiAgICAgICAgICB0aGF0Ll9zZXRPYnNlcnZlck9iamVjdChwYXJlbnQsIG5ld1ZhbHVlLCBwcm9wLCB0cnVlKTtcbiAgICAgICAgfVxuICAgICAgICBpZihBcnJheS5pc0FycmF5KG5ld1ZhbHVlKSl7XG4gICAgICAgICAgdGhhdC5fb2JzZXJ2ZUFycmF5KG5ld1ZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICB2YWx1ZSA9IG5ld1ZhbHVlO1xuICAgICAgICB0aGF0Ll9lbWl0KHBhdGgsIHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9LFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgZW51bWVyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIHRoaXMuX2VtaXQocGF0aCwgdmFsdWUpO1xuICB9XG5cblxuICBwcml2YXRlIF9zZXRPYnNlcnZlck9iamVjdChwYXJlbnQ6IGFueSwgY2hpbGQ6IGFueSwgbmFtZTogc3RyaW5nLCBjaGlsZElzT2JzZXJ2ZWQgPSBmYWxzZSwgb2JzZXJ2ZWQgPSBudWxsKXtcbiAgICBsZXQgcHJlZml4ID0gcGFyZW50ID09PSB0aGlzID8gbnVsbCA6IGdldE1ldGEocGFyZW50KS5wcmVmaXg7XG4gICAgLy9Qb2RlbW9zIHJlY2liaXIgdW4gbml2ZWwgZGUgb2JzZXJ2ZWQgYWwgcXVlIGNvcnJlc3BvbmRlIG8gb2J0ZW5lcmxvIGEgcGFydGlyIGRlbCBwcmVmaXggZGVsIHBhZHJlXG4gICAgbGV0IG9iTGV2ZWwgPSBvYnNlcnZlZCB8fCB0aGlzLl9nZXRPYnNlcnZlZExldmVsKHByZWZpeCk7XG4gICAgLy9FcyBwb3NpYmxlIHF1ZSB5YSB0ZW5nYSBtZXRhZGF0b3MsIHNpIG5vIHRpZW5lIHNlIGNyZWFuIHkgc2UgdnVlbHZlbiBhIG9idGVuZXJcbiAgICBsZXQgbWV0YURhdGFPYmogPSBnZXRNZXRhKGNoaWxkKSB8fCBzZXRNZXRhKGNoaWxkKSB8fCBnZXRNZXRhKGNoaWxkKTtcbiAgICBtZXRhRGF0YU9iai5wcmVmaXggPSAhcHJlZml4ID8gbmFtZSA6IHByZWZpeCArICcuJyArIG5hbWU7XG5cbiAgICAvL09ic2VydmFtb3MgZWwgcHJpbWVybyBkZSBlc3RhIHJhbWEgc2kgZXN0YSByZWdpc3RyYWRvIGNvbW8gb2JzZXJ2YWRvXG4gICAgaWYob2JMZXZlbCAmJiBvYkxldmVsW25hbWVdICYmICFjaGlsZElzT2JzZXJ2ZWQpe1xuICAgICAgdGhpcy5fb2JzZXJ2ZVByb3AocGFyZW50LCBuYW1lKTtcbiAgICB9XG4gICAgLy9TaSB0aWVuZSBoaWpvcyBhIGxvcyBxdWUgb2JzZXJ2YXIuLi4gb2JzZXJ2ZVByb3Agc2Ugb2N1cGFyYSBkZSBsbGFtYXIgYSBzZXRPYnNlcnZlck9iamVjdFxuICAgIGlmKG9iTGV2ZWxbbmFtZV0pe1xuICAgICAgbGV0IHByb3BlcnRpZXMgPSBPYmplY3Qua2V5cyhvYkxldmVsW25hbWVdKTtcbiAgICAgIHByb3BlcnRpZXMuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgICAgRGVidWcoXCItLVwiICsgcHJvcCk7XG4gICAgICAgIGlmKCB0aGlzLl9jYW5PYnNlcnZlKGNoaWxkW3Byb3BdKSApe1xuICAgICAgICAgIERlYnVnKFwiUmFtYVwiKTtcbiAgICAgICAgICB0aGlzLl9zZXRPYnNlcnZlck9iamVjdChjaGlsZCwgY2hpbGRbcHJvcF0sIHByb3AsIGZhbHNlLCBvYkxldmVsW25hbWVdKTtcbiAgICAgICAgfSBlbHNle1xuICAgICAgICAgIERlYnVnKFwiUHJvcGllZGFkXCIpO1xuICAgICAgICAgIHRoaXMuX29ic2VydmVQcm9wKGNoaWxkLCBwcm9wKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfY2FuT2JzZXJ2ZShkYXRhOiBhbnkpOiBib29sZWFue1xuICAgIHJldHVybiB0eXBlb2YgZGF0YSA9PT0gJ29iamVjdCc7XG4gIH1cblxuICBwcml2YXRlIF9vYnNlcnZlQXJyYXkoYXJyYXk6IGFueSl7XG4gICAgbGV0IGZ1bmN0aW9uczogc3RyaW5nW10gPSBbJ3B1c2gnLCAncG9wJ107XG4gICAgbGV0IHRoYXQgPSB0aGlzO1xuICAgIGxldCBwYXRoID0gZ2V0TWV0YShhcnJheSkucHJlZml4O1xuXG4gICAgZnVuY3Rpb25zLmZvckVhY2goKGZ1bmM6IHN0cmluZyk9PntcbiAgICAgIGFycmF5W2Z1bmNdID0gZnVuY3Rpb24oKXtcbiAgICAgICAgbGV0IHJlcyA9IEFycmF5LnByb3RvdHlwZVs8YW55PmZ1bmNdLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIHRoYXQuX2VtaXQocGF0aCwgdGhpcywgTWV0aG9kW2Z1bmMgYXMga2V5b2YgdHlwZW9mIE1ldGhvZF0pOy8vLi4uLi4uLlxuICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHVibGljIHN1YnNjcmliZShwYXRoOiBzdHJpbmcsIGhhbmRsZXI6IEhhbmRsZXIpe1xuICAgIGxldCBsYXN0T2JzZXJ2ZWQ6IGFueSA9IHRoaXM7XG4gICAgbGV0IGxhc3RQcm9wTmFtZTogc3RyaW5nfHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBwYXRoLnNwbGl0KCcuJykucmVkdWNlKCAocHJldlZhbHVlLCBpbmRleCkgPT57XG4gICAgICBpZiggcHJldlZhbHVlW2luZGV4XSAmJiB0eXBlb2YgbGFzdE9ic2VydmVkW2luZGV4XSA9PT0gJ29iamVjdCcgJiYgIWxhc3RQcm9wTmFtZSl7XG4gICAgICAgIGxhc3RPYnNlcnZlZCA9IGxhc3RPYnNlcnZlZFtpbmRleF07XG4gICAgICB9XG4gICAgICBlbHNlIGlmKCAhbGFzdFByb3BOYW1lICl7XG4gICAgICAgIGxhc3RQcm9wTmFtZSA9IGluZGV4O1xuICAgICAgfVxuICAgICAgLy9MbyBhw7FhZGltb3MgY29tbyBvYnNlcnZhZG8gc2kgbm8gZXhpc3RlLCBkZXNwdWVzIHNlIGNvbXByb2JhcmFcbiAgICAgIGlmKCFwcmV2VmFsdWVbaW5kZXhdKSBwcmV2VmFsdWVbaW5kZXhdID0ge307XG4gICAgICByZXR1cm4gcHJldlZhbHVlW2luZGV4XTtcbiAgICB9LCB0aGlzLl9vYnNlcnZlZCk7XG4gICAgRGVidWcoJyMjIyMjIyMjIyMjIyMjIyMnKTtcbiAgICBEZWJ1ZyhsYXN0UHJvcE5hbWUpO1xuICAgIERlYnVnKEpTT04uc3RyaW5naWZ5KGxhc3RPYnNlcnZlZCkpO1xuICAgIGlmKGxhc3RQcm9wTmFtZSl7XG4gICAgICB0aGlzLl9vYnNlcnZlUHJvcChsYXN0T2JzZXJ2ZWQsIGxhc3RQcm9wTmFtZSk7XG4gICAgfVxuICAgIC8vQXNpZ25hbW9zIGVsIGhhbmRsZXIgYWwgcGF0aFxuICAgIHRoaXMuX2V2ZW50c1twYXRoXSA9IHRoaXMuX2V2ZW50c1twYXRoXSB8fCBbXTtcbiAgICB0aGlzLl9ldmVudHNbcGF0aF0ucHVzaChoYW5kbGVyKTtcbiAgfVxuXG4gIHB1YmxpYyB1blN1YnNjcmliZShwYXRoOiBzdHJpbmcsIGhhbmRsZXI6IEhhbmRsZXIpe1xuICAgIC8vaWYodGhpcy5ldmVudHNbZXZlbnROYW1lXSA9PT0gdW5kZWZpbmVkICYmIGNoZWNrRXJyb3IpIHRocm93IGBUaGVyZSBpcyBubyBldmVudCAke2V2ZW50TmFtZX1gO1xuICAgIHRoaXMuX2V2ZW50c1twYXRoXSA9ICh0aGlzLl9ldmVudHNbcGF0aF0gfHwgW10pLmZpbHRlcigob2JqOiBIYW5kbGVyKT0+e1xuICAgICAgaWYob2JqICE9PSBoYW5kbGVyICYmIGhhbmRsZXIub25VblN1YnNjcmliZSl7XG4gICAgICAgIGhhbmRsZXIub25VblN1YnNjcmliZShwYXRoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBvYmogIT09IGhhbmRsZXI7XG4gICAgfSApO1xuICB9XG5cbiAgcHVibGljIGdldEJ5UGF0aChwYXRoOiBzdHJpbmcpOiBhbnl7XG4gICAgcmV0dXJuIHBhdGguc3BsaXQoJy4nKS5yZWR1Y2UoKG8saSk9PiAhbyA/IHVuZGVmaW5lZCA6IG9baV0sIHRoaXMgYXMgYW55KTtcbiAgfVxuXG4gIHB1YmxpYyBzZXRCeVBhdGgocGF0aDogc3RyaW5nLCB2YWx1ZTogYW55KXtcbiAgICBsZXQgYXJyYXlQYXRoID0gcGF0aC5zcGxpdCgnLicpO1xuICAgIGxldCBwcm9wID0gYXJyYXlQYXRoLnBvcCgpO1xuICAgIGlmKHByb3AgPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xuICAgIGxldCBvYmogPSBhcnJheVBhdGgucmVkdWNlKChvLGkpPT4gIW8gPyB1bmRlZmluZWQgOiBvW2ldLCB0aGlzIGFzIGFueSk7XG4gICAgaWYob2JqKXtcbiAgICAgIG9ialtwcm9wXSA9IHZhbHVlO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2VtaXQocGF0aDogc3RyaW5nLCBkYXRhOiBhbnksIG1ldGhvZCA9IE1ldGhvZC5zZXQpe1xuICAgIERlYnVnKHBhdGggKyAnPT4nICsgSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xuICAgICh0aGlzLl9ldmVudHNbcGF0aF0gfHwgW10pLmZvckVhY2goKGg6IEhhbmRsZXIpPT4gaC5oYW5kbGUocGF0aCwgZGF0YSwgeydtZXRob2QnOiBtZXRob2R9KSk7XG4gIH1cblxuICAvKlxuICAqT2J0ZW5lbW9zIHVuIG5pdmVsIGRlIG9ic2VydmVkIGVuIGJhc2UgYSB1bmEgcnV0YVxuICAqL1xuICBwcml2YXRlIF9nZXRPYnNlcnZlZExldmVsKHBhdGg6IHN0cmluZyk6IGFueXtcbiAgICAvL1NpIGVzIHZhY2lhIG8gdW5kZWZpbmVkfG51bGwgZWwgcHJpbWVyIG5pdmVsXG4gICAgaWYoIXBhdGggfHwgcGF0aCA9PT0gJycpIHJldHVybiB0aGlzLl9vYnNlcnZlZDtcbiAgICAvL0RpdmlkaW1vcyBsYSBydXRhIGVuIHVuIGFycmF5IHkgY29uIHJlZHVjZSB2YW1vcyByZWNvcnJpZW5kb2xvLFxuICAgIC8vc2kgbm8gZXhpc3RlIGRldm9sdmVtb3MgbnVsbFxuICAgIHJldHVybiAocGF0aC5zcGxpdCgnLicpIGFzIGFueVtdKS5yZWR1Y2UoIChwcmV2VmFsdWUsIGluZGV4KSA9PntcbiAgICAgIGlmKHByZXZWYWx1ZSAhPT0gbnVsbCkgcmV0dXJuIHByZXZWYWx1ZVtpbmRleF0gfHwgbnVsbDtcbiAgICB9LCB0aGlzLl9vYnNlcnZlZCk7XG4gIH1cblxufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3Njb3BlL3Njb3BlLnRzIiwiaW1wb3J0IHtTY29wZSwgSGFuZGxlciwgU2NvcGVJbnRlcmZhY2V9IGZyb20gJy4uL3Njb3BlL3Njb3BlJztcbmltcG9ydCB7R2xvYmFsc30gZnJvbSAnLi4vZ2xvYmFscyc7XG5pbXBvcnQge0V4cHJlc3Npb259IGZyb20gJy4vZXhwcmVzc2lvbic7XG5pbXBvcnQge0JpbmRlcn0gZnJvbSAnLi4vYmluZGVyJztcblxubGV0IERlYnVnID0gR2xvYmFscy5EZWJ1ZztcblxuZXhwb3J0IGNsYXNzIFRlbXBsYXRle1xuICBwdWJsaWMgc3RhdGljIERFTElNSVRFUlMgPSBbJ3t7eycsJ319fSddO1xuICBwcml2YXRlIHN0YXRpYyBSRUdFWF9FWFAgPSBuZXcgUmVnRXhwKFRlbXBsYXRlLkRFTElNSVRFUlNbMF0gKyAnLio/JyArIFRlbXBsYXRlLkRFTElNSVRFUlNbMV0sIFwiZ1wiKTtcbiAgcHJpdmF0ZSBzdGF0aWMgUkVHRVhfQ0xFQU4gPSBuZXcgUmVnRXhwKFRlbXBsYXRlLkRFTElNSVRFUlNbMF0gKyAnfCcgKyBUZW1wbGF0ZS5ERUxJTUlURVJTWzFdLCBcImdcIik7XG5cbiAgLy9DYXJhY3RlcmVzIHBhcmEgZXNjYXBhciB0ZXh0byBhIGludHJvZHVjaXIgZW4gcm9kZWFkbyBwb3IgaHRtbFxuICBwcml2YXRlIHN0YXRpYyBFU0NBUEVfTUFQOiB7IFtpbmRleDpzdHJpbmddIDogc3RyaW5nIH0gPSB7XG4gICAgJyYnOiAnJmFtcDsnLFxuICAgICc8JzogJyZsdDsnLFxuICAgICc+JzogJyZndDsnLFxuICAgICdcIic6ICcmcXVvdDsnLFxuICAgIFwiJ1wiOiAnJiMzOTsnLFxuICAgICcvJzogJyYjeDJGOycsXG4gICAgJ2AnOiAnJiN4NjA7JyxcbiAgICAnPSc6ICcmI3gzRDsnXG4gIH07XG4gIHByaXZhdGUgc3RhdGljIFJFR0VYX0VTQ0FQRSA9IG5ldyBSZWdFeHAoT2JqZWN0LmtleXMoVGVtcGxhdGUuRVNDQVBFX01BUCkuam9pbignfCcpLCAnZycpO1xuICBwcml2YXRlIHN0YXRpYyBFU0NBUEVfQ0hBUiA9IGZ1bmN0aW9uKGM6IHN0cmluZyl7XG4gICAgcmV0dXJuIFRlbXBsYXRlLkVTQ0FQRV9NQVBbY107XG4gIH07XG5cbiAgLy9wcml2YXRlIG1vZGVsczogeyBbaW5kZXg6c3RyaW5nXSA6IHtoYW5kbGVyOiBIYW5kbGVyLCBsYXN0VmFsdWU6IGFueSwgZXhwcmVzc2lvbjogc3RyaW5nLCByZWdleFJlcGxhY2U6IFJlZ0V4cH0gfTtcblxuICBwcml2YXRlIGV4cHJlc3Npb25zOiBFeHByZXNzaW9uW107XG4gIHByaXZhdGUgdmFsdWVzOiBhbnlbXTtcblxuICBwdWJsaWMganVzdEFwcGxpZWQ6IGJvb2xlYW47XG5cbiAgcHJpdmF0ZSB0ZW1wbGF0ZUNvbXBvbmVudHM6IHN0cmluZ1tdO1xuICBwcml2YXRlIGVsZW1lbnQ6IEhUTUxFbGVtZW50O1xuICBwcml2YXRlIGNoZWNrQXBwbHlBc3luYzogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHRlbXBsYXRlOiBzdHJpbmcsIHByaXZhdGUgc2NvcGU6IFNjb3BlSW50ZXJmYWNlLCBwcml2YXRlIGJpbmRlcjogQmluZGVyKXtcbiAgICB0aGlzLmp1c3RBcHBsaWVkID0gZmFsc2U7XG4gICAgdGhpcy5leHByZXNzaW9ucyA9IFtdO1xuICAgIHRoaXMudGVtcGxhdGVDb21wb25lbnRzID0gW107XG4gIH1cblxuICBwdWJsaWMgZXNjYXBlRm9ySFRNTChkYXRhPScnKTogc3RyaW5ne1xuICAgIHN3aXRjaCh0eXBlb2YgZGF0YSl7XG4gICAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgICByZXR1cm4gZGF0YS5yZXBsYWNlKFRlbXBsYXRlLlJFR0VYX0VTQ0FQRSwgVGVtcGxhdGUuRVNDQVBFX0NIQVIpO1xuICAgICAgY2FzZSAnb2JqZWN0JzpcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGRhdGEpO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIChkYXRhICsgXCJcIikucmVwbGFjZShUZW1wbGF0ZS5SRUdFWF9FU0NBUEUsIFRlbXBsYXRlLkVTQ0FQRV9DSEFSKTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgcHJlcGFyZShlbGVtZW50OiBIVE1MRWxlbWVudCl7XG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICB0aGlzLmVsZW1lbnQuaW5uZXJIVE1MID0nJztcbiAgICBsZXQgdGhhdCA9IHRoaXM7XG4gICAgbGV0IHJlZ2V4ID0gVGVtcGxhdGUuUkVHRVhfRVhQLCBtYXRjaGVzO1xuICAgIGxldCBsYXN0SW5kZXggPSAwO1xuICAgIHdoaWxlKCAobWF0Y2hlcyA9IHJlZ2V4LmV4ZWModGhpcy50ZW1wbGF0ZSkpICl7XG4gICAgICBsZXQgZXhwU3RyaW5nID0gbWF0Y2hlc1swXTtcbiAgICAgIGxldCBpbmRleCA9IG1hdGNoZXMuaW5kZXg7XG5cbiAgICAgIHRoaXMudGVtcGxhdGVDb21wb25lbnRzLnB1c2godGhpcy50ZW1wbGF0ZS5zbGljZShsYXN0SW5kZXgsIGluZGV4KSk7XG4gICAgICBsYXN0SW5kZXggPSBpbmRleCArIGV4cFN0cmluZy5sZW5ndGg7XG5cbiAgICAgIGxldCBleHByZXNzaW9uID0gbmV3IEV4cHJlc3Npb24oZXhwU3RyaW5nLnJlcGxhY2UoVGVtcGxhdGUuUkVHRVhfQ0xFQU4sICcnKSwgdGhpcy5zY29wZSk7XG4gICAgICB0aGlzLmV4cHJlc3Npb25zLnB1c2goZXhwcmVzc2lvbik7XG4gICAgICB0aGlzLnRlbXBsYXRlQ29tcG9uZW50cy5wdXNoKCB0aGF0LmVzY2FwZUZvckhUTUwoZXhwcmVzc2lvbi5leGVjKCkpICk7XG4gICAgICBsZXQgZXhwSW5kZXhJbkNvbXAgPSB0aGlzLnRlbXBsYXRlQ29tcG9uZW50cy5sZW5ndGggLTE7XG4gICAgICBleHByZXNzaW9uLm9uRXhlYyA9IGZ1bmN0aW9uKHZhbHVlOiBhbnkpe1xuICAgICAgICBsZXQgYXV4ID0gd2luZG93IGFzIGFueTtcbiAgICAgICAgYXV4LnBydWViYSA9IGF1eC5wcnVlYmEgfHwgMDtcbiAgICAgICAgdGhhdC50ZW1wbGF0ZUNvbXBvbmVudHNbZXhwSW5kZXhJbkNvbXBdID0gdGhhdC5lc2NhcGVGb3JIVE1MKHZhbHVlKTtcbiAgICAgICAgdGhhdC5hcHBseVRlbXBsYXRlKCk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMudGVtcGxhdGVDb21wb25lbnRzLnB1c2godGhpcy50ZW1wbGF0ZS5zbGljZShsYXN0SW5kZXgpKTtcbiAgfVxuXG4gIC8qXG4gICogQ29uIGVzdGEgZnVuY2lvbiBldml0YW1vcyBxdWUgc2UgZWplY3V0ZSB2YXJpYXMgdmVjZXMgc2VndWlkYXMgbGEgYXBsaWNhY2lvbiBkZSB1bmEgcGxhbnRpbGxhIGVuIGVsIERPTVxuICAqIHBvciBlamVtcGxvIHB1ZWRlIGhhYmVyIHZhcmlhcyBleHByZXNpb25lcyBxdWUgb2JzZXJ2ZW4gbGEgbWlzbWEgcHJvcGllZGFkIHBvciBsbyBxdWUgc2UgZWplY3V0YXJhIGFwcGx5VGVtcGxhdGVcbiAgKiB4IG51bWVybyBkZSB2ZWNlcyBpbmNsdXllbmRvIGxhIGRlc2NvbmV4aW9uIGRlbCBvYnNlcnZlciBkZWwgQmluZGVyXG4gICogYXBwbHlUZW1wbGF0ZSBzZSBlamVjdXRhcmEgZGUgbWFuZXJhIGFzaW5jcm9uYSBsYSBwcmltZXJhIHZlelxuICAqL1xuICBwdWJsaWMgYXBwbHlUZW1wbGF0ZSgpe1xuICAgIHRoaXMuY2hlY2tBcHBseUFzeW5jID0gdHJ1ZTtcbiAgICBzZXRUaW1lb3V0KCgpPT4ge1xuICAgICAgaWYoIXRoaXMuY2hlY2tBcHBseUFzeW5jKSByZXR1cm47XG4gICAgICB0aGlzLl9hcHBseVRlbXBsYXRlRm9yQXN5bmMoKTtcbiAgICAgIHRoaXMuY2hlY2tBcHBseUFzeW5jID0gZmFsc2U7XG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgX2FwcGx5VGVtcGxhdGVGb3JBc3luYygpOiBhbnl7XG4gICAgbGV0IG5ld0h0bWwgPSB0aGlzLnRlbXBsYXRlQ29tcG9uZW50cy5qb2luKCcnKTtcblxuICAgIERlYnVnKHRoaXMudGVtcGxhdGVDb21wb25lbnRzKTtcblxuICAgIHRoaXMuYmluZGVyLmRpc2Nvbm5lY3QoKTtcbiAgICB0aGlzLmVsZW1lbnQuaW5uZXJIVE1MID0gbmV3SHRtbDtcbiAgICBjb25zb2xlLmxvZyh0aGlzLmVsZW1lbnQpO1xuICAgIGNvbnNvbGUubG9nKFwic3Nzc3Nzc3Nzc3Nzc3NcIik7XG4gICAgdGhpcy5iaW5kZXIucHJvY2Vzc1RyZWUodGhpcy5lbGVtZW50KTtcbiAgICB0aGlzLmJpbmRlci5vYnNlcnZlKCk7XG4gIH1cblxuICBwdWJsaWMgdW5TdWJzY3JpYmUoKTogYW55e1xuICAgIHRoaXMuZXhwcmVzc2lvbnMuZm9yRWFjaChleHAgPT4gZXhwLnVuU3Vic2NyaWJlKCkpO1xuICB9XG5cbiAgcHVibGljIGdldFRlbXBsYXRlKCk6IHN0cmluZ3tcbiAgICByZXR1cm4gdGhpcy50ZW1wbGF0ZTtcbiAgfVxufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2JpbmRpbmdzL3RlbXBsYXRlLnRzIiwiaW1wb3J0IHtTY29wZSwgSGFuZGxlciwgU2NvcGVJbnRlcmZhY2V9IGZyb20gJy4uL3Njb3BlL3Njb3BlJztcbmltcG9ydCB7R2xvYmFsc30gZnJvbSAnLi4vZ2xvYmFscyc7XG5cbmxldCBEZWJ1ZyA9IEdsb2JhbHMuRGVidWc7XG5cbmV4cG9ydCBjbGFzcyBFeHByZXNzaW9ue1xuICBwdWJsaWMgc3RhdGljIFZBUklBQkxFX1NZTUJPTCA9ICclJSc7XG4gIHByaXZhdGUgc3RhdGljIFJFR0VYX1ZBUiA9IG5ldyBSZWdFeHAoRXhwcmVzc2lvbi5WQVJJQUJMRV9TWU1CT0wgKyAnW2EtekEtWjAtOV9cXFxcLVxcXFwuXXsxLH0nLCBcImdcIik7XG4gIHByaXZhdGUgc3RhdGljIFJFR0VYX0NMRUFOID0gbmV3IFJlZ0V4cChFeHByZXNzaW9uLlZBUklBQkxFX1NZTUJPTCArICd8XFxcXCAnLCBcImdcIik7XG4gIHByaXZhdGUgc3RhdGljIFJFR0VYX0VTQ0FQRSA9IC9bLVtcXF17fSgpKis/LixcXFxcXiR8I1xcc10vZztcblxuICBwcml2YXRlIG1vZGVsczogeyBbaW5kZXg6c3RyaW5nXSA6IHtwYXJhbU5hbWU6IHN0cmluZywgcGFyYW1JbmRleGVzOiBudW1iZXJbXSwgcmVnZXhSZXBsYWNlOiBSZWdFeHB9IH0gO1xuICBwcml2YXRlIGV4cFBhcmFtczogYW55W10gO1xuXG4gIHByaXZhdGUgZnVuY0V4cDogRnVuY3Rpb247XG4gIHB1YmxpYyBvbkV4ZWM6IEZ1bmN0aW9uO1xuXG4gIHByaXZhdGUgX2hhbmRsZXI6IEhhbmRsZXI7XG4gIHByaXZhdGUgZ2V0SGFuZGxlcigpOiBIYW5kbGVye1xuICAgIGlmKCAhdGhpcy5faGFuZGxlcil7XG4gICAgICB0aGlzLl9oYW5kbGVyID0gbmV3IEhhbmRsZXIoKTtcbiAgICAgIGxldCB0aGF0ID0gdGhpcztcbiAgICAgIHRoaXMuX2hhbmRsZXIuaGFuZGxlID0gIGZ1bmN0aW9uKGV2dCwgZGF0YSl7XG4gICAgICAgIHRoYXQubW9kZWxzW2V2dF0ucGFyYW1JbmRleGVzLmZvckVhY2goaSA9PiB0aGF0LmV4cFBhcmFtc1tpXSA9IGRhdGEpO1xuICAgICAgICB0aGF0LmV4ZWMoKTtcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9oYW5kbGVyO1xuICB9XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBvcmlnRXhwcmVzc2lvbjogc3RyaW5nLCBwcml2YXRlIHNjb3BlOiBTY29wZUludGVyZmFjZSl7XG4gICAgbGV0IGV4cHJlc3Npb24gPSBvcmlnRXhwcmVzc2lvbjtcbiAgICB0aGlzLm1vZGVscyA9IHt9O1xuICAgIHRoaXMuZXhwUGFyYW1zID0gW107XG4gICAgbGV0IHJlZ2V4ID0gRXhwcmVzc2lvbi5SRUdFWF9WQVIsIG1hdGNoZXM7XG4gICAgbGV0IGluZGV4ID0gLTE7XG4gICAgbGV0IGFyZ3MgPSBbXTtcbiAgICB3aGlsZSggKG1hdGNoZXMgPSByZWdleC5leGVjKHRoaXMub3JpZ0V4cHJlc3Npb24pKSApe1xuICAgICAgaW5kZXgrKztcbiAgICAgIHZhciBtb2RlbCA9IG1hdGNoZXNbMF0ucmVwbGFjZShFeHByZXNzaW9uLlJFR0VYX0NMRUFOLCAnJyk7XG4gICAgICB0aGlzLmV4cFBhcmFtc1tpbmRleF0gPSB0aGlzLnNjb3BlLmdldEJ5UGF0aChtb2RlbCk7XG4gICAgICBpZiggdGhpcy5tb2RlbHNbbW9kZWxdICl7XG4gICAgICAgIHRoaXMubW9kZWxzW21vZGVsXS5wYXJhbUluZGV4ZXMucHVzaChpbmRleCk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgbGV0IGF1eCA9IHRoaXMubW9kZWxzW21vZGVsXSA9IHtcbiAgICAgICAgLy9FbCBub21icmUgZGVsIHBhcmFtZXRybyBkZW50cm8gZGUgbGEgZnVuY2lvbiByZXVsdGFudGUgZGUgbGEgZXhwcmVzaW9uXG4gICAgICAgIHBhcmFtTmFtZTogJ3AnICsgaW5kZXgsXG4gICAgICAgIC8vTG9zIGluZGljZXMgcGFyYSBwYXNhciBjb21vIGFyZ3VtZW50byBhIGxhIGZ1bmNpb25cbiAgICAgICAgcGFyYW1JbmRleGVzOiBbaW5kZXhdLFxuICAgICAgICAvL0V4cHJlc2lvbiByZWd1bGFyIHBhcmEgc3VzdGl0dWlyIGxhIGNhZGVuYSBwb3Igc3UgdmFsb3JcbiAgICAgICAgcmVnZXhSZXBsYWNlOiBuZXcgUmVnRXhwKHRoaXMuZXNjYXBlKG1hdGNoZXNbMF0pLCAnZycpXG4gICAgICB9O1xuICAgICAgZXhwcmVzc2lvbiA9IGV4cHJlc3Npb24ucmVwbGFjZShhdXgucmVnZXhSZXBsYWNlLCBhdXgucGFyYW1OYW1lKTtcbiAgICAgIGFyZ3MucHVzaChhdXgucGFyYW1OYW1lKTtcbiAgICAgIHRoaXMuc2NvcGUuc3Vic2NyaWJlKG1vZGVsLCB0aGlzLmdldEhhbmRsZXIoKSk7XG4gICAgfVxuICAgIGFyZ3MucHVzaCgncmV0dXJuICgnICsgZXhwcmVzc2lvbiArICcpOycpO1xuICAgIERlYnVnKGFyZ3MpO1xuICAgIHRoaXMuZnVuY0V4cCA9IEZ1bmN0aW9uLmFwcGx5KHt9LCBhcmdzKTtcblxuICB9XG5cbiAgcHVibGljIGVzY2FwZSh0ZXh0OiBzdHJpbmcpOiBzdHJpbmd7XG4gICAgcmV0dXJuIHRleHQucmVwbGFjZShFeHByZXNzaW9uLlJFR0VYX0VTQ0FQRSwgJ1xcXFwkJicpO1xuICB9XG5cbiAgcHVibGljIGV4ZWMoY29udGV4dCA9IHt9KTogYW55e1xuICAgIGxldCB2YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICB0cnkge1xuICAgICAgdmFsdWUgPSB0aGlzLmZ1bmNFeHAuYXBwbHkoY29udGV4dCwgdGhpcy5leHBQYXJhbXMpO1xuICAgIH1cbiAgICBjYXRjaChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihlcnIubWVzc2FnZSk7XG4gICAgfVxuICAgIGlmKHRoaXMub25FeGVjKSB0aGlzLm9uRXhlYyh2YWx1ZSk7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG5cbiAgcHVibGljIHVuU3Vic2NyaWJlKCk6IGFueXtcbiAgICBsZXQga2V5cyA9IE9iamVjdC5rZXlzKHRoaXMubW9kZWxzKTtcbiAgICBsZXQgaGFuZGxlciA9IHRoaXMuZ2V0SGFuZGxlcigpO1xuICAgIGZvcihsZXQgaSA9IGtleXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pe1xuICAgICAgdGhpcy5zY29wZS51blN1YnNjcmliZShrZXlzW2ldLCBoYW5kbGVyKTtcbiAgICB9XG4gIH1cbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9iaW5kaW5ncy9leHByZXNzaW9uLnRzIiwiaW1wb3J0IHtCaW5kZXJ9IGZyb20gJy4uL2JpbmRlcic7XG5pbXBvcnQge1Njb3BlLCBIYW5kbGVyLCBTY29wZUludGVyZmFjZX0gZnJvbSAnLi4vc2NvcGUvc2NvcGUnO1xuaW1wb3J0IHtUZW1wbGF0ZX0gZnJvbSAnLi90ZW1wbGF0ZSc7XG5pbXBvcnQge0dsb2JhbHN9IGZyb20gJy4uL2dsb2JhbHMnO1xuaW1wb3J0IHtCaW5kaW5nRWFjaH0gZnJvbSAnLi9iaW5kaW5nRWFjaCc7XG5cbmxldCBEZWJ1ZyA9IEdsb2JhbHMuRGVidWc7XG5cbmV4cG9ydCB0eXBlIEJpbmRGbiA9IChlbGVtZW50OiBIVE1MRWxlbWVudHxIVE1MSW5wdXRFbGVtZW50LCBzY29wZTogU2NvcGVJbnRlcmZhY2UpID0+IGJvb2xlYW47XG5cblxuZXhwb3J0IGNsYXNzIEJpbmRpbmd7XG4gIHByaXZhdGUgc3RhdGljIE5PREVTOiBhbnlbXSA9IFtdO1xuICBwcml2YXRlIHN0YXRpYyBOT0RFX0NPVU5UID0gMTtcbiAgcHJpdmF0ZSBzdGF0aWMgUFJJVl9QUk9QID0gJ18nICsgJ2llJztcbiAgcHVibGljIGJpbmRGbjogQmluZEZuO1xuICBwdWJsaWMgdW5iaW5kRm46IEJpbmRGbjtcbiAgcHJpdmF0ZSBuYW1lOnN0cmluZztcblxuICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcpe1xuICAgIHRoaXMubmFtZSA9ICdpZScgKyAnLScgKyBuYW1lO1xuICB9XG5cbiAgcHVibGljIGJpbmQoZWxlbWVudDogSFRNTEVsZW1lbnR8SFRNTElucHV0RWxlbWVudCwgc2NvcGU6IFNjb3BlSW50ZXJmYWNlKTogYm9vbGVhbntcbiAgICB0aGlzLnNldFNjb3BlKGVsZW1lbnQsIHNjb3BlKTtcbiAgICByZXR1cm4gdGhpcy5iaW5kRm4oZWxlbWVudCwgc2NvcGUpO1xuICB9XG5cbiAgcHVibGljIHVuYmluZChlbGVtZW50OiBIVE1MRWxlbWVudHxIVE1MSW5wdXRFbGVtZW50KTogYm9vbGVhbntcbiAgICBsZXQgcmVzID0gdGhpcy51bmJpbmRGbihlbGVtZW50LCB0aGlzLmdldFNjb3BlKGVsZW1lbnQpKTtcbiAgICB0aGlzLmRlbGV0ZUJpbmRpbmdEYXRhTm9kZShlbGVtZW50KTtcbiAgICByZXR1cm4gcmVzO1xuXG4gIH1cblxuICBwdWJsaWMgaXNCaW5kZWQoZWxlbWVudDogSFRNTEVsZW1lbnR8SFRNTElucHV0RWxlbWVudCk6IGJvb2xlYW57XG4gICAgcmV0dXJuIEJpbmRpbmcuTk9ERVNbQmluZGluZy5HZXROb2RlSWQoZWxlbWVudCldICYmICEhQmluZGluZy5OT0RFU1tCaW5kaW5nLkdldE5vZGVJZChlbGVtZW50KV0uYmluZGluZ3NEYXRhW3RoaXMubmFtZV07XG4gIH1cblxuICAvKipcbiAgICogT2J0ZW5lciBsYSBpZCBjb3JyZXNwb25kaWVudGUgYSB1biBub2RvIGRlbCBET00uXG4gICAqIFNpIG5vIHRpZW5lIHNlIGxlIGFzaWduYSBhIHBhcnRpciBkZSB1biBjb250YWRvclxuICAgKiBAcGFyYW0ge2FueX0gbm9kZSB1biBub2RvIGRlbCBET00uXG4gICAqIEByZXR1cm4ge251bWJlcn0gbGEgaWQgZGVsIG5vZG8uXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIEdldE5vZGVJZChub2RlOmFueSk6IG51bWJlcntcbiAgICBsZXQgZGF0YSA9IG5vZGVbQmluZGluZy5QUklWX1BST1BdID0gbm9kZVtCaW5kaW5nLlBSSVZfUFJPUF0gfHwge307XG4gICAgZGF0YS5pZCA9IGRhdGEuaWQgfHwgQmluZGluZy5OT0RFX0NPVU5UKys7XG4gICAgRGVidWcoXCJOdWV2YSBpZCBwYXJhIHVuIG5vZG8gXCIrIGRhdGEuaWQpO1xuICAgIHJldHVybiBkYXRhLmlkO1xuICB9XG4gIC8qKlxuICAgKiBPYnRlbmVyIHVuIG9iamV0byBjb24gbG9zIGRhdG9zIHJlbGF0aXZvcyBhIHVuIG5vZG8sIHNvYnJlIHRvZG9zIHN1cyBiaW5kaW5ncy5cbiAgICogQHBhcmFtIHthbnl9IG5vZGUgdW4gbm9kbyBkZWwgRE9NLlxuICAgKiBAcmV0dXJuIHthbnl9IG9iamV0by5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgR2V0RGF0YU5vZGUobm9kZTogYW55KTogYW55e1xuICAgIGxldCBpZCA9IEJpbmRpbmcuR2V0Tm9kZUlkKG5vZGUpO1xuICAgIEJpbmRpbmcuTk9ERVNbaWRdID0gQmluZGluZy5OT0RFU1tpZF0gfHwge2JpbmRpbmdzRGF0YToge319O1xuICAgIHJldHVybiBCaW5kaW5nLk5PREVTW2lkXTtcbiAgfVxuICAvKipcbiAgICogT2J0ZW5lciB1biBvYmpldG8gY29uIGxvcyBkYXRvcyByZWxhdGl2b3MgYSB1biBub2RvLCBzb2JyZSBlbCBiaW5kaW5nIGFjdHVhbCBkZWwgb2JqZXRvLlxuICAgKiBAcGFyYW0ge2FueX0gbm9kZSB1biBub2RvIGRlbCBET00uXG4gICAqIEByZXR1cm4ge2FueX0gb2JqZXRvLlxuICAgKi9cbiAgcHVibGljIGdldEJpbmRpbmdEYXRhTm9kZShub2RlOiBhbnkpOiBhbnl7XG4gICAgbGV0IGRhdGEgPSBCaW5kaW5nLkdldERhdGFOb2RlKG5vZGUpO1xuICAgIGRhdGEuYmluZGluZ3NEYXRhW3RoaXMubmFtZV0gPSBkYXRhLmJpbmRpbmdzRGF0YVt0aGlzLm5hbWVdIHx8IHtoYW5kbGVyczogW119O1xuICAgIHJldHVybiBkYXRhLmJpbmRpbmdzRGF0YVt0aGlzLm5hbWVdO1xuICB9XG5cbiAgLyoqXG4gICAqIE9idGVuZXIgZWwgc2NvcGUgcGFyYSB1biBiaW5kaW5nIGNvbmNyZXRvIGRlIHVuIG5vZG9cbiAgICogQHBhcmFtIHthbnl9IG5vZGUgdW4gbm9kbyBkZWwgRE9NLlxuICAgKiBAcmV0dXJuIHtTY29wZUludGVyZmFjZX0gZWwgb2JqZXRvIHNjb3BlLlxuICAgKi9cbiAgcHVibGljIGdldFNjb3BlKG5vZGU6YW55KTogU2NvcGVJbnRlcmZhY2V7XG4gICAgcmV0dXJuIHRoaXMuZ2V0QmluZGluZ0RhdGFOb2RlKG5vZGUpLnNjb3BlO1xuICB9XG5cbiAgLyoqXG4gICAqIEVzdGFibGVjZXIgZWwgc2NvcGUgcGFyYSB1biBiaW5kaW5nIGNvbmNyZXRvIGRlIHVuIG5vZG9cbiAgICogQHBhcmFtIHthbnl9IG5vZGUgdW4gbm9kbyBkZWwgRE9NLlxuICAgKiBAcmV0dXJuIHtTY29wZUludGVyZmFjZX0gZWwgb2JqZXRvIHNjb3BlLlxuICAgKi9cbiAgcHVibGljIHNldFNjb3BlKG5vZGU6IGFueSwgc2NvcGU6IFNjb3BlSW50ZXJmYWNlKTogdm9pZHtcbiAgICB0aGlzLmdldEJpbmRpbmdEYXRhTm9kZShub2RlKS5zY29wZSA9IHNjb3BlO1xuICB9XG5cbiAgcHVibGljIGRlbGV0ZUJpbmRpbmdEYXRhTm9kZShub2RlOiBhbnkpOiBhbnl7XG4gICAgbGV0IGRhdGEgPSBCaW5kaW5nLkdldERhdGFOb2RlKG5vZGUpO1xuICAgIGRlbGV0ZSBkYXRhLmJpbmRpbmdzRGF0YVt0aGlzLm5hbWVdO1xuICB9XG5cbiAgcHVibGljIHN0b3JlSGFuZGxlcihub2RlOiBhbnksIGhhbmRsZXI6IEhhbmRsZXIpe1xuICAgIGxldCBkYXRhID0gdGhpcy5nZXRCaW5kaW5nRGF0YU5vZGUobm9kZSk7XG4gICAgZGF0YS5oYW5kbGVycy5wdXNoKGhhbmRsZXIpO1xuICB9XG5cbiAgcHVibGljIHJldHJpZXZlSGFuZGxlcnMobm9kZTogYW55KXtcbiAgICByZXR1cm4gdGhpcy5nZXRCaW5kaW5nRGF0YU5vZGUobm9kZSkuaGFuZGxlcnM7XG4gIH1cblxuICBwdWJsaWMgY3JlYXRlSGFuZGxlcihub2RlOmFueSk6IEhhbmRsZXJ7XG4gICAgbGV0IHJlcyA9IG5ldyBIYW5kbGVyKCk7XG4gICAgdGhpcy5nZXRCaW5kaW5nRGF0YU5vZGUobm9kZSkuaGFuZGxlcnMucHVzaChyZXMpO1xuICAgIHJldHVybiByZXM7XG4gIH1cblxuICBwdWJsaWMgZ2V0TmFtZSgpOiBzdHJpbmd7XG4gICAgcmV0dXJuIHRoaXMubmFtZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb250ZW5pZG8gZGVsIGF0cmlidXRvIGRlbCBiaW5kaW5nXG4gICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgZWwgZWxlbWVudG8gSFRNTC5cbiAgICogQHJldHVybiB7c3RyaW5nfG51bGx9IGNvbnRlbmlkbyBkZWwgYXRyaWJ1dG8uXG4gICAqL1xuICBwdWJsaWMgZ2V0UGFyYW0oZWxlbWVudDogSFRNTEVsZW1lbnQpOiBzdHJpbmd8bnVsbHtcbiAgICByZXR1cm4gZWxlbWVudC5nZXRBdHRyaWJ1dGUodGhpcy5nZXROYW1lKCkpO1xuICB9XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvYmluZGluZ3MvYmluZGluZy50cyIsImV4cG9ydCB7QmluZGVyfSBmcm9tICcuL2JpbmRlcic7XG5leHBvcnQge0V4cHJlc3Npb259IGZyb20gJy4vYmluZGluZ3MvZXhwcmVzc2lvbic7XG5leHBvcnQge1RlbXBsYXRlfSBmcm9tICcuL2JpbmRpbmdzL3RlbXBsYXRlJztcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9pbmRleC50cyIsImltcG9ydCB7U2NvcGUsIFNjb3BlSW50ZXJmYWNlfSBmcm9tICcuL3Njb3BlL3Njb3BlJztcbmltcG9ydCB7QmluZGluZ30gZnJvbSAnLi9iaW5kaW5ncy9iaW5kaW5nJztcbmltcG9ydCB7Z2VuZXJhdGVCaW5kaW5nc30gZnJvbSAnLi9iaW5kaW5ncy9iaW5kaW5nc0dlbmVyYXRvcic7XG5pbXBvcnQge0dsb2JhbHN9IGZyb20gJy4vZ2xvYmFscyc7XG5cbmV4cG9ydCBjbGFzcyBCaW5kZXJ7XG5cbiAgcHJpdmF0ZSBzY29wZTogU2NvcGU7XG4gIHByaXZhdGUgYmluZGluZ3M6IHsgW2tleTogc3RyaW5nXTogQmluZGluZyB9O1xuICBwcml2YXRlIHJvb3RPYnNlcnZlcjogTXV0YXRpb25PYnNlcnZlcjtcbiAgcHJpdmF0ZSBwYXJlbnROb2RlOiBOb2RlO1xuXG4gIGNvbnN0cnVjdG9yKG5vZGU6IGFueSl7XG4gICAgdGhpcy5zY29wZSA9IG5ldyBTY29wZSgpO1xuICAgIHRoaXMuYmluZGluZ3MgPSB7fTtcbiAgICBnZW5lcmF0ZUJpbmRpbmdzKHRoaXMpO1xuXG4gICAgdGhpcy5wYXJlbnROb2RlID0gbm9kZTtcbiAgICB0aGlzLnByZXBhcmVPYnNlcnZlcigpO1xuICAgIHRoaXMuaXRlcmF0ZVRyZWUoKTtcbiAgICB0aGlzLm9ic2VydmUoKTtcbiAgfVxuXG4gIHB1YmxpYyBhZGRCaW5kaW5nKGJpbmRpbmc6IEJpbmRpbmcpe1xuICAgIHRoaXMuYmluZGluZ3NbYmluZGluZy5nZXROYW1lKCldID0gYmluZGluZztcbiAgfVxuXG4gIHB1YmxpYyBnZXRTY29wZSgpOiBTY29wZXtcbiAgICByZXR1cm4gdGhpcy5zY29wZTtcbiAgfVxuXG4gIHByaXZhdGUgYmluZChub2RlOiBhbnksIHNjb3BlOiBTY29wZUludGVyZmFjZSl7XG4gICAgbGV0IGF0dHJzID0gbm9kZS5hdHRyaWJ1dGVzO1xuICAgIGxldCByZXMgPSB0cnVlO1xuICAgIGZvcih2YXIgaSA9IGF0dHJzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKXtcbiAgICAgIGxldCBhdHRyID0gYXR0cnNbaV07XG4gICAgICBsZXQgYmluZGluZyA9IHRoaXMuYmluZGluZ3NbYXR0ci5uYW1lXTtcbiAgICAgIGlmKGJpbmRpbmcgJiYgIWJpbmRpbmcuaXNCaW5kZWQobm9kZSkgJiYgIXRoaXMuYmluZGluZ3NbYXR0ci5uYW1lXS5iaW5kKG5vZGUsIHNjb3BlKSl7XG4gICAgICAgIHJlcyA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG5cbiAgcHJpdmF0ZSB1bmJpbmQobm9kZTogYW55KXtcbiAgICBsZXQgYXR0cnMgPSBub2RlLmF0dHJpYnV0ZXM7XG4gICAgbGV0IHJlcyA9IHRydWU7XG4gICAgZm9yKHZhciBpID0gYXR0cnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pe1xuICAgICAgbGV0IGF0dHIgPSBhdHRyc1tpXTtcbiAgICAgIGxldCBiaW5kaW5nID0gdGhpcy5iaW5kaW5nc1thdHRyLm5hbWVdO1xuICAgICAgaWYoYmluZGluZyAmJiBiaW5kaW5nLmlzQmluZGVkKG5vZGUpICYmICF0aGlzLmJpbmRpbmdzW2F0dHIubmFtZV0udW5iaW5kKG5vZGUpKXtcbiAgICAgICAgcmVzID0gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cblxuICBwdWJsaWMgcHJvY2Vzc1RyZWUobm9kZTogYW55LCBzY29wZTogU2NvcGVJbnRlcmZhY2UgPSB0aGlzLnNjb3BlKXtcbiAgICB0aGlzLml0ZXJhdGVUcmVlKG5vZGUsIHNjb3BlKTtcbiAgfVxuXG4gIHB1YmxpYyBpdGVyYXRlVHJlZShub2RlID0gdGhpcy5wYXJlbnROb2RlLCBzY29wZTogU2NvcGVJbnRlcmZhY2UgPSB0aGlzLnNjb3BlKXtcbiAgICBsZXQgY2ggPSBub2RlIGFzIGFueTtcbiAgICBsZXQgbG9vcENoaWxkczogYm9vbGVhbiA9IHRydWU7XG4gICAgbWFpbmxvb3AgOlxuICAgIHdoaWxlIChjaCkge1xuICAgICAgaWYoIGNoLm5vZGVUeXBlID09PSAxICl7XG4gICAgICAgIGxvb3BDaGlsZHMgPSB0aGlzLmJpbmQoY2gsIHNjb3BlKTtcbiAgICAgIH1cbiAgICAgIC8vaWYgbm9kZSBoYXMgY2hpbGRyZW4sIGdldCB0aGUgZmlyc3QgY2hpbGRcbiAgICAgIGlmIChsb29wQ2hpbGRzICYmIGNoLmNoaWxkcmVuLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBjaCA9IGNoLmZpcnN0RWxlbWVudENoaWxkO1xuXG4gICAgICAvL2lmIG5vZGUgaGFzIHNpbGJpbmcsIGdldCB0aGUgc2libGluZ1xuICAgICAgfSBlbHNlIGlmIChjaC5uZXh0RWxlbWVudFNpYmxpbmcpIHtcbiAgICAgICAgICBjaCA9IGNoLm5leHRFbGVtZW50U2libGluZztcblxuICAgICAgLy9pZiBpdCBoYXMgbmVpdGhlciwgY3Jhd2wgdXAgdGhlIGRvbSB1bnRpbCB5b3UgZmluZCBhIG5vZGUgdGhhdCBoYXMgYSBzaWJsaW5nIGFuZCBnZXQgdGhhdCBzaWJsaW5nXG4gICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRvIHtcbiAgICAgICAgICAgICAgY2ggPSBjaC5wYXJlbnROb2RlO1xuICAgICAgICAgICAgICAvL2lmIHdlIGFyZSBiYWNrIGF0IGRvY3VtZW50LmJvZHksIHJldHVybiFcbiAgICAgICAgICAgICAgaWYgKGNoID09PSBudWxsIHx8IGNoID09PSBub2RlKSB7XG4gICAgICAgICAgICAgICAgICBicmVhayBtYWlubG9vcDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgIH0gd2hpbGUgKCFjaC5uZXh0RWxlbWVudFNpYmxpbmcpXG4gICAgICAgICAgY2ggPSBjaC5uZXh0RWxlbWVudFNpYmxpbmc7XG4gICAgICB9XG5cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHByZXBhcmVPYnNlcnZlcigpe1xuICAgIGxldCB0aGF0ID0gdGhpcztcbiAgICB0aGlzLnJvb3RPYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKGZ1bmN0aW9uKG11dGF0aW9ucykge1xuICAgICAgbXV0YXRpb25zLmZvckVhY2goZnVuY3Rpb24obXV0YXRpb24pIHtcbiAgICAgICAgc3dpdGNoIChtdXRhdGlvbi50eXBlKSB7XG4gICAgICAgICAgY2FzZSAnYXR0cmlidXRlcyc6XG4gICAgICAgICAgICBpZihtdXRhdGlvbi5hdHRyaWJ1dGVOYW1lID09PSBudWxsKSByZXR1cm47XG4gICAgICAgICAgICAvL05hbWUgZXMgZWwgbm9tYnJlIGRlbCBhdHJpYnV0byB5IG9sZFZhbHVlIHNlcmEgZWwgdmFsb3IgYW50ZXJpb3IsIHNpIGVzIG51ZXZvIHNlcmEgbnVsbFxuICAgICAgICAgICAgbGV0IG5hbWUgPSBtdXRhdGlvbi5hdHRyaWJ1dGVOYW1lO1xuICAgICAgICAgICAgbGV0IG9sZFZhbHVlID0gbXV0YXRpb24ub2xkVmFsdWU7XG4gICAgICAgICAgICBpZiggdGhhdC5iaW5kaW5nc1tuYW1lXSApe1xuICAgICAgICAgICAgICBpZihvbGRWYWx1ZSAhPT0gbnVsbCl7XG4gICAgICAgICAgICAgICAgdGhhdC5iaW5kaW5nc1tuYW1lXS51bmJpbmQobXV0YXRpb24udGFyZ2V0IGFzIEhUTUxFbGVtZW50KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiggKG11dGF0aW9uLnRhcmdldCBhcyBIVE1MRWxlbWVudCkuZ2V0QXR0cmlidXRlKG5hbWUpICE9PW51bGwgKXtcbiAgICAgICAgICAgICAgICB0aGF0LmJpbmRpbmdzW25hbWVdLmJpbmQobXV0YXRpb24udGFyZ2V0IGFzIEhUTUxFbGVtZW50LCB0aGF0LnNjb3BlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2NoaWxkTGlzdCc6XG4gICAgICAgICAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKG11dGF0aW9uLmFkZGVkTm9kZXMsIGZ1bmN0aW9uKG5vZGU6IGFueSl7XG4gICAgICAgICAgICAgIGlmKG5vZGUubm9kZVR5cGUgPT09IDEpe1xuICAgICAgICAgICAgICAgIHRoYXQuYmluZChub2RlLCB0aGF0LnNjb3BlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKG11dGF0aW9uLnJlbW92ZWROb2RlcywgZnVuY3Rpb24obm9kZTogYW55KXtcbiAgICAgICAgICAgICAgaWYobm9kZS5ub2RlVHlwZSA9PT0gMSl7XG4gICAgICAgICAgICAgICAgdGhhdC51bmJpbmQobm9kZSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIH1cbiAgICAgICAgR2xvYmFscy5EZWJ1ZyhcIk51ZXZhIG11dGFjaW9uOiBcIiArIG11dGF0aW9uLnR5cGUpO1xuICAgICAgICBHbG9iYWxzLkRlYnVnKCBtdXRhdGlvbi50YXJnZXQgKTtcbiAgICAgICAgR2xvYmFscy5EZWJ1ZyggbXV0YXRpb24pO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgfVxuXG4gIHB1YmxpYyBvYnNlcnZlKCl7XG4gICAgdGhpcy5yb290T2JzZXJ2ZXIub2JzZXJ2ZSh0aGlzLnBhcmVudE5vZGUsIHsgYXR0cmlidXRlczogdHJ1ZSxcbiAgICAgIGNoaWxkTGlzdDogdHJ1ZSxcbiAgICAgIHN1YnRyZWU6IHRydWUsXG4gICAgICBhdHRyaWJ1dGVPbGRWYWx1ZTogdHJ1ZSxcbiAgICAgIGF0dHJpYnV0ZUZpbHRlcjogT2JqZWN0LmtleXModGhpcy5iaW5kaW5ncylcbiAgICB9KTtcbiAgfVxuXG4gIHB1YmxpYyBkaXNjb25uZWN0KCl7XG4gICAgdGhpcy5yb290T2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICB9XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvYmluZGVyLnRzIiwiaW1wb3J0IHtCaW5kZXJ9IGZyb20gJy4uL2JpbmRlcic7XG5pbXBvcnQge1Njb3BlLCBIYW5kbGVyLCBTY29wZUludGVyZmFjZX0gZnJvbSAnLi4vc2NvcGUvc2NvcGUnO1xuaW1wb3J0IHtUZW1wbGF0ZX0gZnJvbSAnLi90ZW1wbGF0ZSc7XG5pbXBvcnQge0dsb2JhbHN9IGZyb20gJy4uL2dsb2JhbHMnO1xuaW1wb3J0IHtCaW5kaW5nRWFjaH0gZnJvbSAnLi9iaW5kaW5nRWFjaCc7XG5pbXBvcnQge0JpbmRpbmd9IGZyb20gJy4vYmluZGluZyc7XG5cbmxldCBEZWJ1ZyA9IEdsb2JhbHMuRGVidWc7XG5cbmZ1bmN0aW9uIGdldElucHV0QmluZGluZygpOiBCaW5kaW5ne1xuICBsZXQgcmVzID0gbmV3IEJpbmRpbmcoJ2JpbmQtaW5wdXQnKTtcblxuICByZXMuYmluZEZuID0gZnVuY3Rpb24oZWxlbWVudDogSFRNTElucHV0RWxlbWVudCwgc2NvcGU6IFNjb3BlSW50ZXJmYWNlKXtcbiAgICBsZXQgcGF0aCA9IHRoaXMuZ2V0UGFyYW0oZWxlbWVudCk7XG4gICAgaWYocGF0aCA9PT0gbnVsbCkgdGhyb3cgXCJQYXRoIGlzIG51bGxcIjtcblxuICAgIC8vSGFuZGxlciBzZSBvY3VwYXJhIGRlbCBldmVudG8sIHNlIGd1YXJkYSBlbiBsYSBpbmZvcm1hY2lvbiBkZWwgbm9kb1xuICAgIGxldCBoYW5kbGVyID0gdGhpcy5jcmVhdGVIYW5kbGVyKGVsZW1lbnQpO1xuICAgIGhhbmRsZXIuaGFuZGxlID0gZnVuY3Rpb24oZXZlbnQsIGRhdGEpe1xuICAgICAgZWxlbWVudC52YWx1ZSA9IGRhdGEgPT09IHVuZGVmaW5lZCA/ICcnIDogZGF0YTtcbiAgICB9O1xuICAgIGhhbmRsZXIub25VblN1YnNjcmliZSA9IGZ1bmN0aW9uKCl7XG4gICAgICAoIHRoaXMuZGF0YS5lbGVtZW50IGFzIEhUTUxJbnB1dEVsZW1lbnQpLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIHRoaXMuZGF0YS5jaGFuZ2VMaXN0ZW5lcik7XG4gICAgfVxuICAgIGhhbmRsZXIuZGF0YS5lbGVtZW50ID0gZWxlbWVudDtcbiAgICBoYW5kbGVyLmRhdGEuY2hhbmdlTGlzdGVuZXIgPSBmdW5jdGlvbihldnQ6IEV2ZW50KXtcbiAgICAgIGxldCBlbGVtZW50ID0gZXZ0LnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50O1xuICAgICAgbGV0IHZhbHVlOmFueSA9IGVsZW1lbnQudmFsdWU7XG4gICAgICBzd2l0Y2goIChlbGVtZW50LmdldEF0dHJpYnV0ZSgndHlwZScpIHx8ICdub25lJykudG9Mb3dlckNhc2UoKSApe1xuICAgICAgICBjYXNlICdudW1iZXInOlxuICAgICAgICAgIHZhbHVlID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgfVxuICAgICAgRGVidWcoZXZ0LnRhcmdldCk7XG4gICAgICBpZiggcGF0aCAhPT0gbnVsbCkgc2NvcGUuc2V0QnlQYXRoKHBhdGgsIHZhbHVlKTtcbiAgICB9O1xuICAgIGhhbmRsZXIuZGF0YS5ldmVudE5hbWUgPSBwYXRoO1xuICAgIHNjb3BlLnN1YnNjcmliZShwYXRoLCBoYW5kbGVyKTtcblxuICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgaGFuZGxlci5kYXRhLmNoYW5nZUxpc3RlbmVyKTtcbiAgICBlbGVtZW50LnZhbHVlID0gc2NvcGUuZ2V0QnlQYXRoKHBhdGgpIHx8IGVsZW1lbnQudmFsdWU7XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cbiAgcmVzLnVuYmluZEZuID0gZnVuY3Rpb24oZWxlbWVudDogSFRNTElucHV0RWxlbWVudCwgc2NvcGU6IFNjb3BlSW50ZXJmYWNlKXtcbiAgICB0aGlzLmdldEJpbmRpbmdEYXRhTm9kZShlbGVtZW50KS5oYW5kbGVycy5mb3JFYWNoKChoYW5kbGVyOiBIYW5kbGVyKSA9PiBzY29wZS51blN1YnNjcmliZShoYW5kbGVyLmRhdGEuZXZlbnROYW1lLCBoYW5kbGVyKSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZXR1cm4gcmVzO1xufVxuXG5mdW5jdGlvbiBnZXRBdHRyQmluZGluZyhhdHRyTmFtZTogc3RyaW5nKXtcbiAgbGV0IHJlcyA9IG5ldyBCaW5kaW5nKCdiaW5kLScgKyBhdHRyTmFtZSk7XG5cbiAgcmVzLmJpbmRGbiA9IGZ1bmN0aW9uKGVsZW1lbnQ6IEhUTUxJbnB1dEVsZW1lbnQsIHNjb3BlOiBTY29wZUludGVyZmFjZSl7XG4gICAgbGV0IHBhdGggPSB0aGlzLmdldFBhcmFtKGVsZW1lbnQpO1xuICAgIGlmKHBhdGggPT09IG51bGwpIHRocm93IFwiUGF0aCBpcyBudWxsXCI7XG5cbiAgICAvL0hhbmRsZXIgc2Ugb2N1cGFyYSBkZWwgZXZlbnRvLCBzZSBndWFyZGEgZW4gbGEgaW5mb3JtYWNpb24gZGVsIG5vZG9cbiAgICBsZXQgaGFuZGxlciA9IHRoaXMuY3JlYXRlSGFuZGxlcihlbGVtZW50KTtcbiAgICBoYW5kbGVyLmhhbmRsZSA9IGZ1bmN0aW9uKGV2ZW50LCBkYXRhKXtcbiAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKGF0dHJOYW1lLCBkYXRhKTtcbiAgICB9O1xuICAgIGhhbmRsZXIub25VblN1YnNjcmliZSA9IGZ1bmN0aW9uKCl7fTtcblxuICAgIGhhbmRsZXIuZGF0YS5lbGVtZW50ID0gZWxlbWVudDtcblxuICAgIGhhbmRsZXIuZGF0YS5ldmVudE5hbWUgPSBwYXRoO1xuICAgIHNjb3BlLnN1YnNjcmliZShwYXRoLCBoYW5kbGVyKTtcblxuICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKGF0dHJOYW1lLCBzY29wZS5nZXRCeVBhdGgocGF0aCkpO1xuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIHJlcy51bmJpbmRGbiA9IGZ1bmN0aW9uKGVsZW1lbnQ6IEhUTUxJbnB1dEVsZW1lbnQsIHNjb3BlOiBTY29wZUludGVyZmFjZSl7XG4gICAgdGhpcy5nZXRCaW5kaW5nRGF0YU5vZGUoZWxlbWVudCkuaGFuZGxlcnMuZm9yRWFjaCgoaGFuZGxlcjogSGFuZGxlcikgPT4gc2NvcGUudW5TdWJzY3JpYmUoaGFuZGxlci5kYXRhLmV2ZW50TmFtZSwgaGFuZGxlcikpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIHJlcztcbn1cblxuZnVuY3Rpb24gZ2V0VGVtcGxhdGVCaW5kaW5nKGJpbmRlcjogQmluZGVyKXtcbiAgbGV0IHJlcyA9IG5ldyBCaW5kaW5nKCd0ZW1wbGF0ZScpO1xuXG4gIHJlcy5iaW5kRm4gPSBmdW5jdGlvbihlbGVtZW50OiBIVE1MSW5wdXRFbGVtZW50LCBzY29wZTogU2NvcGVJbnRlcmZhY2Upe1xuICAgIERlYnVnKFwiSW5pY2lhbmRvIGJpbmQgdGVtcGxhdGVcIik7XG4gICAgbGV0IGRhdGEgPSB0aGlzLmdldEJpbmRpbmdEYXRhTm9kZShlbGVtZW50KTtcbiAgICBsZXQgdGVtcGxhdGUgPSBkYXRhLnRlbXBsYXRlID0gbmV3IFRlbXBsYXRlKGVsZW1lbnQuaW5uZXJIVE1MLCBzY29wZSwgYmluZGVyKTtcblxuICAgIHRlbXBsYXRlLnByZXBhcmUoZWxlbWVudCk7XG4gICAgdGVtcGxhdGUuYXBwbHlUZW1wbGF0ZSgpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcblxuICByZXMudW5iaW5kRm4gPSBmdW5jdGlvbihlbGVtZW50OiBIVE1MSW5wdXRFbGVtZW50KXtcbiAgICBsZXQgdGVtcGxhdGUgPSB0aGlzLmdldEJpbmRpbmdEYXRhTm9kZShlbGVtZW50KS50ZW1wbGF0ZSBhcyBUZW1wbGF0ZTtcblxuICAgIHRlbXBsYXRlLnVuU3Vic2NyaWJlKCk7XG4gICAgZWxlbWVudC5pbm5lckhUTUwgPSB0ZW1wbGF0ZS5nZXRUZW1wbGF0ZSgpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIHJlcztcbn1cbi8qKlxuICogRnVuY2lvbiBxdWUgZ2VuZXJhIHVuYSBzZXJpZSBkZSBvYmpldG9zIEJpbmRpbmcgeSBsb3MgYcOxYWRlIGEgdW4gb2JqZXRvLlxuICogU29uIEJpbmRpbmdzIHJlbGFjaW9uYWRvcyBhIHVuYSBzZXJpZSBkZSBhdHJpYnV0b3MgKHtwcmVmaXh9LXthdHJpYnV0b30pXG4gKiBAcGFyYW0ge2FueX0gb2JqIHVuIG5vZG8gZGVsIERPTS5cbiAqIEBwYXJhbSB7U2NvcGV9IHNjb3BlIGVsIHNjb3BlLlxuICogQHBhcmFtIHtCcm9hZGNhc3Rlcn0gYnJvYWRjYXN0ZXIgZWwgYnJvYWRjYXN0ZXIgY29uIGVsIHF1ZSBzdWJzY3JpYmlyc2UuXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSBhdHRyaWJ1dGVzIGF0cmlidXRvc1xuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZUJpbmRpbmdzQXR0cihiaW5kZXI6IEJpbmRlciwgYXR0cmlidXRlcyA9IFsndGl0bGUnLCAnaHJlZicsICdzcmMnLCAnbmFtZScsICd0eXBlJ10pe1xuICBhdHRyaWJ1dGVzLmZvckVhY2goIHZhbHVlID0+e1xuICAgbGV0IGF1eCA9IGdldEF0dHJCaW5kaW5nKHZhbHVlKTtcbiAgIGJpbmRlci5hZGRCaW5kaW5nKGF1eCk7XG4gIH0gKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlQmluZGluZ3MoYmluZGVyOiBCaW5kZXIpe1xuICBsZXQgIGF1eCA9IGdldElucHV0QmluZGluZygpO1xuICBiaW5kZXIuYWRkQmluZGluZyhhdXgpO1xuXG4gIGF1eCA9IGdldFRlbXBsYXRlQmluZGluZyhiaW5kZXIpO1xuICBiaW5kZXIuYWRkQmluZGluZyhhdXgpO1xuXG4gIGJpbmRlci5hZGRCaW5kaW5nKG5ldyBCaW5kaW5nRWFjaChiaW5kZXIpKTtcblxuICBnZW5lcmF0ZUJpbmRpbmdzQXR0cihiaW5kZXIpO1xufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2JpbmRpbmdzL2JpbmRpbmdzR2VuZXJhdG9yLnRzIiwiaW1wb3J0IHtCaW5kaW5nfSBmcm9tICcuL2JpbmRpbmcnO1xuaW1wb3J0IHtTY29wZUludGVyZmFjZSwgTWV0aG9kLCBIYW5kbGVyfSBmcm9tICcuLi9zY29wZS9zY29wZSc7XG5pbXBvcnQge1Byb3h5U2NvcGV9IGZyb20gJy4uL3Njb3BlL3Byb3h5U2NvcGUnO1xuaW1wb3J0IHtCaW5kZXJ9IGZyb20gJy4uL2JpbmRlcic7XG5cbmV4cG9ydCBjbGFzcyBCaW5kaW5nRWFjaCBleHRlbmRzIEJpbmRpbmd7XG4gIHByb3RlY3RlZCBzdGF0aWMgUkVHRVhfUEFSQU0gPSAvKC4qKT8gK2luICsoLiopPy9nO1xuICBwcml2YXRlIGJhc2VIVE1MOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBiaW5kZXI6IEJpbmRlcil7XG4gICAgc3VwZXIoJ2VhY2gnKTtcbiAgfVxuXG4gIHByaXZhdGUgc3RvcmVCYXNlRWxlbWVudChlbGVtZW50OiBIVE1MRWxlbWVudCl7XG4gICAgdGhpcy5nZXRCaW5kaW5nRGF0YU5vZGUoZWxlbWVudClbJ2Jhc2VFbGVtZW50J10gPSBlbGVtZW50LmZpcnN0RWxlbWVudENoaWxkO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRCYXNlRWxlbWVudChlbGVtZW50OiBhbnkpOiBIVE1MRWxlbWVudHtcbiAgICByZXR1cm4gKHRoaXMuZ2V0QmluZGluZ0RhdGFOb2RlKGVsZW1lbnQpWydiYXNlRWxlbWVudCddIGFzIEhUTUxFbGVtZW50KTtcbiAgfVxuXG4gIHByaXZhdGUgZmlsbEVsZW1lbnQoZWxlbWVudDogSFRNTEVsZW1lbnQsIHNjb3BlOiBTY29wZUludGVyZmFjZSwgbW9kZWxOYW1lOiBzdHJpbmcsIHBhdGhBcnJheTogc3RyaW5nKXtcbiAgICBsZXQgZGF0YUFycmF5ID0gc2NvcGUuZ2V0QnlQYXRoKHBhdGhBcnJheSkgYXMgYW55W107XG4gICAgbGV0IGJhc2UgPSB0aGlzLmdldEJhc2VFbGVtZW50KGVsZW1lbnQpO1xuICAgIHRoaXMuYmluZGVyLmRpc2Nvbm5lY3QoKTtcbiAgICBcbiAgICBkYXRhQXJyYXkuZm9yRWFjaCgoZGF0YSwgaW5kZXgpID0+IHtcbiAgICAgIGxldCBuZXdFbGVtID0gYmFzZS5jbG9uZU5vZGUodHJ1ZSkgYXMgSFRNTEVsZW1lbnQ7XG4gICAgICBsZXQgcHJveHlQYXJhbTogYW55ID0ge307XG4gICAgICBwcm94eVBhcmFtW21vZGVsTmFtZV0gPSBwYXRoQXJyYXkgKyAnLicgKyBpbmRleDtcbiAgICAgIGxldCBwcm94eVNjb3BlID0gbmV3IFByb3h5U2NvcGUocHJveHlQYXJhbSwgc2NvcGUpO1xuICAgICAgdGhpcy5iaW5kZXIucHJvY2Vzc1RyZWUobmV3RWxlbSwgcHJveHlTY29wZSk7XG4gICAgICBlbGVtZW50LmFwcGVuZENoaWxkKG5ld0VsZW0pO1xuICAgIH0pO1xuICAgIHRoaXMuYmluZGVyLm9ic2VydmUoKTtcbiAgfVxuXG4gIHB1YmxpYyBiaW5kKGVsZW1lbnQ6IEhUTUxFbGVtZW50ICwgc2NvcGU6IFNjb3BlSW50ZXJmYWNlKTogYm9vbGVhbntcbiAgICBsZXQgYmluZGluZ0RhdGEgPSB0aGlzLmdldEJpbmRpbmdEYXRhTm9kZShlbGVtZW50KTtcbiAgICBsZXQgcmVzdWx0ID0gQmluZGluZ0VhY2guUkVHRVhfUEFSQU0uZXhlYyh0aGlzLmdldFBhcmFtKGVsZW1lbnQpIGFzIHN0cmluZyk7XG4gICAgdGhpcy5zdG9yZUJhc2VFbGVtZW50KGVsZW1lbnQpO1xuICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gXCJcIjtcblxuICAgIGlmKHJlc3VsdCA9PT0gbnVsbCl7XG4gICAgICBjb25zb2xlLmVycm9yKFwiUGFyYW1ldHJvIG5vIHZhbGlkbzogXCIgKyB0aGlzLmdldFBhcmFtKGVsZW1lbnQpKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgbGV0IG1vZGVsID0gcmVzdWx0WzFdLnRyaW0oKTtcbiAgICBsZXQgcGF0aCA9IHJlc3VsdFsyXS50cmltKCk7XG5cblxuICAgIGxldCBoYW5kbGVyID0gdGhpcy5jcmVhdGVIYW5kbGVyKGVsZW1lbnQpO1xuICAgIGhhbmRsZXIuZGF0YS5vYnNlcnZlZFBhdGggPSBwYXRoO1xuXG4gICAgaGFuZGxlci5oYW5kbGUgPSAocGF0aCwgZGF0YSwgbWV0YSkgPT4ge1xuICAgICAgaWYobWV0YSAmJiBtZXRhLm1ldGhvZCA9PT0gTWV0aG9kLnNldClcbiAgICAgICAgdGhpcy5maWxsRWxlbWVudChlbGVtZW50LCBzY29wZSwgbW9kZWwsIHBhdGgpO1xuICAgIH07XG4gICAgc2NvcGUuc3Vic2NyaWJlKHBhdGgsIGhhbmRsZXIpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHB1YmxpYyB1bmJpbmQoZWxlbWVudDogSFRNTEVsZW1lbnQpe1xuICAgIGxldCBzY29wZSA9IHRoaXMuZ2V0U2NvcGUoZWxlbWVudCk7XG4gICAgdGhpcy5nZXRCaW5kaW5nRGF0YU5vZGUoZWxlbWVudCkuaGFuZGxlcnMuZm9yRWFjaCgoaGFuZGxlcjogSGFuZGxlcikgPT4gc2NvcGUudW5TdWJzY3JpYmUoaGFuZGxlci5kYXRhLm9ic2VydmVkUGF0aCwgaGFuZGxlcikpO1xuICAgIHRoaXMuZGVsZXRlQmluZGluZ0RhdGFOb2RlKGVsZW1lbnQpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvYmluZGluZ3MvYmluZGluZ0VhY2gudHMiLCJpbXBvcnQge1Njb3BlSW50ZXJmYWNlLCBNZXRob2QsIFNjb3BlLCBIYW5kbGVyfSBmcm9tICcuL3Njb3BlJztcblxuZXhwb3J0IGNsYXNzIFByb3h5U2NvcGUgaW1wbGVtZW50cyBTY29wZUludGVyZmFjZXtcbiAgW2tleTogc3RyaW5nXTogYW55XG4gIHByaXZhdGUgX3Byb3hpZWQ6IHtbaW5kZXg6IHN0cmluZ106IHN0cmluZ307XG4gIHByaXZhdGUgX2ludmVyc2VkUHJveGllZDoge1tpbmRleDogc3RyaW5nXTogc3RyaW5nfTtcbiAgcHJpdmF0ZSBfc2NvcGU6IFNjb3BlO1xuICBwcml2YXRlIF9oYW5kbGVyc01hcDoge1tpbmRleDogc3RyaW5nXTogSGFuZGxlcltdfTtcbiAgcHJpdmF0ZSBfaGFuZGxlcjogSGFuZGxlcjtcblxuICBjb25zdHJ1Y3Rvcihwcm94aWVkOiB7W2luZGV4OiBzdHJpbmddOiBzdHJpbmd9LCBzY29wZTogU2NvcGVJbnRlcmZhY2Upe1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnX3Byb3hpZWQnLCB7ZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiBmYWxzZSwgdmFsdWU6IHByb3hpZWR9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ19zY29wZScsIHtlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IGZhbHNlLCB2YWx1ZTogc2NvcGV9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ19oYW5kbGVyc01hcCcsIHtlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IGZhbHNlLCB2YWx1ZToge319KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ19pbnZlcnNlZFByb3hpZWQnLCB7ZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiBmYWxzZSwgdmFsdWU6IHt9fSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdfaGFuZGxlcicsIHtlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IGZhbHNlLCB2YWx1ZTogbmV3IEhhbmRsZXIoKX0pO1xuXG4gICAgbGV0IHByb3BlcnRpZXMgPSBPYmplY3Qua2V5cyhwcm94aWVkKTtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgT2JqZWN0LmtleXMoc2NvcGUpLmZvckVhY2goa2V5ID0+e1xuICAgICAgaWYocHJvcGVydGllcy5pbmRleE9mKGtleSkgIT0gLTEpIHJldHVybjtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBrZXksIHtlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICBnZXQ6ICgpID0+IHRoaXMuX3Njb3BlW2tleV0sXG4gICAgICAgIHNldDogKHZhbHVlOiBhbnkpID0+IHRoaXMuX3Njb3BlW2tleV09dmFsdWVcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgdGhpcy5faGFuZGxlci5oYW5kbGUgPSBmdW5jdGlvbihwYXRoLCBkYXRhLCBtZXRhKXtcbiAgICAgIGxldCBtb2RlbCA9IHRoYXQuX2ludmVyc2VkUHJveGllZFtwYXRoXTtcbiAgICAgIGlmKG1vZGVsKXtcbiAgICAgICAgKHRoYXQuX2hhbmRsZXJzTWFwW21vZGVsXSB8fCBbXSkuZm9yRWFjaChoYW5kbGVyID0+IGhhbmRsZXIuaGFuZGxlKG1vZGVsLCBkYXRhLCBtZXRhKSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHByb3BlcnRpZXMuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgbGV0IHBhdGggPSB0aGlzLl9wcm94aWVkW2tleV07XG4gICAgICB0aGlzLl9pbnZlcnNlZFByb3hpZWRbcGF0aF0gPSBrZXk7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywga2V5LCB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGdldDogKCkgPT4gdGhpcy5fc2NvcGUuZ2V0QnlQYXRoKHBhdGgpLFxuICAgICAgICBzZXQ6ICh2YWx1ZTogYW55KSA9PiB0aGlzLl9zY29wZS5zZXRCeVBhdGgocGF0aCwgdmFsdWUpXG4gICAgICB9KTtcbiAgICAgIHRoaXMuX3Njb3BlLnN1YnNjcmliZShwYXRoLCB0aGlzLl9oYW5kbGVyKTtcbiAgICB9KTtcbiAgfVxuXG4gIHB1YmxpYyBzdWJzY3JpYmUocGF0aDogc3RyaW5nLCBoYW5kbGVyOiBIYW5kbGVyKXtcbiAgICBpZih0aGlzLl9wcm94aWVkW3BhdGhdKXtcbiAgICAgIHRoaXMuX2hhbmRsZXJzTWFwW3BhdGhdID0gdGhpcy5faGFuZGxlcnNNYXBbcGF0aF0gfHwgW107XG4gICAgICB0aGlzLl9oYW5kbGVyc01hcFtwYXRoXS5wdXNoKGhhbmRsZXIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX3Njb3BlLnN1YnNjcmliZShwYXRoLCBoYW5kbGVyKTtcbiAgfVxuXG4gIHB1YmxpYyB1blN1YnNjcmliZShwYXRoOiBzdHJpbmcsIGhhbmRsZXI6IEhhbmRsZXIpe1xuICAgIGlmKHRoaXMuX3Byb3hpZWRbcGF0aF0pe1xuICAgICAgdGhpcy5faGFuZGxlcnNNYXBbcGF0aF0gPSB0aGlzLl9oYW5kbGVyc01hcFtwYXRoXS5maWx0ZXIoaCA9PiBoIT09IGhhbmRsZXIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX3Njb3BlLnVuU3Vic2NyaWJlKHBhdGgsIGhhbmRsZXIpO1xuICB9XG5cbiAgcHVibGljIGdldEJ5UGF0aChwYXRoOiBzdHJpbmcpOiBhbnl7XG4gICAgcmV0dXJuIHBhdGguc3BsaXQoJy4nKS5yZWR1Y2UoKG8saSk9PiAhbyA/IHVuZGVmaW5lZCA6IG9baV0sIHRoaXMpO1xuICB9XG5cbiAgcHVibGljIHNldEJ5UGF0aChwYXRoOiBzdHJpbmcsIHZhbHVlOiBhbnkpe1xuICAgIGxldCBhcnJheVBhdGggPSBwYXRoLnNwbGl0KCcuJyk7XG4gICAgbGV0IHByb3AgPSBhcnJheVBhdGgucG9wKCk7XG4gICAgbGV0IG9iajogYW55ID0gYXJyYXlQYXRoLnJlZHVjZSgobyxpKT0+ICFvID8gdW5kZWZpbmVkIDogb1tpXSwgdGhpcyk7XG4gICAgaWYocHJvcCA9PT0gdW5kZWZpbmVkKSByZXR1cm47XG4gICAgaWYob2JqKXtcbiAgICAgIG9ialtwcm9wXSA9IHZhbHVlO1xuICAgIH1cbiAgfVxuXG5cbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9zY29wZS9wcm94eVNjb3BlLnRzIl0sInNvdXJjZVJvb3QiOiIifQ==