class Serialize {

  constructor() {
  }

  serializers = {
    string: s => `'${s}'`,
    number: n => n.toString(),
    boolean: b => b.toString(),
    function: f =>  {
      let possibleSerializator = this.makeSerializable(f);
      return possibleSerializator.serialize();
    },
    object: o => {
      if (Array.isArray(o))
        return '[' + o + ']';
      if (o == null)
        return 'null'
      let s = '{';
      for (const key in o) {
        const value = o[key];
        if (s.length > 1)
          s += ',';

        s += key + ':' + this.customSerialize(value)
      }
      s += '}';
      return s
    }
  }

  customSerialize(obj) {
    const type = typeof obj;
    const serial = this.serializers[type];
    return serial(obj);
  }

  construct(constructor, args, vars) {
    function Obj() {

      return constructor.apply(this, args);
    }
    Obj.prototype = constructor.prototype;
    return new Obj();
  }

  addFunc(anObject, aFunction, variables) {
    let objectSource = anObject.toString();
    let functionSource = aFunction.toString();
    objectSource = objectSource.substring(0, objectSource.length - 1);
    let functionName = functionSource.substring(9, functionSource.indexOf('('));
    let functionArgs = functionSource.substring(functionSource.indexOf('('), functionSource.indexOf('{') + 1);
    let functionBody = functionSource.substring(functionSource.indexOf('{') + 1, functionSource.length);
    return objectSource + "this." + functionName + " = function" +
      functionArgs + "var variables = " + variables + ";\n" + functionBody + "}";
  }

  makeSerializable(object) {
    let obj = JSON.stringify(object, (key, val) => ((typeof val === 'function') ? val + '' : val));
    let variables = [];
    while (obj.indexOf('let') > -1) {
      let subString = obj.substring(obj.indexOf('let') + 3, obj.length - 1);
      while (subString[0] === ' ') {
        subString = subString.replace(' ', '');
      }
      let endIndex = Math.min(subString.indexOf(' '), subString.indexOf(';'));
      let name = subString.substring(0, endIndex);
      variables.push(name);
      obj = obj.replace('let', '');
    }

    let objectSource = this.addFunc(object, function serialize() {
      let vars = [];
      variables.forEach((variable) => {
        vars += JSON.stringify([variable, eval(variable)]);
      });

      let serialized = [];
      serialized.push(vars);
      for (let func in this) {
        if (func !== 'serialize') {
          serialized.push([func, this[func].toString()]);
        }
      }
      return JSON.stringify(serialized);
    }, JSON.stringify(variables));

    object = Function("return " + objectSource)();

    let params = Array.prototype.slice.call(arguments);
    params.shift();

    return this.construct(object, params, variables);
  }
}

module.exports = Serialize;