const Serialiaze = require('./Serialize');
const serial = new Serialiaze();

const obj = {
  field: 'value',
  subObject: {
    arr: [7, 35, 234],
    fn: function anObject(){
      let x = 1;
      let y = [1,2];
      let z = {"name": "test"};
      this.test = function(){return x;};
    }
  }
};

function anObject(xk, h){
  let x = 1;
  let y = [1,2];
  let z = {"name": "test"};
  this.test = function(){return x;};
}

console.log(serial.customSerialize(anObject));
