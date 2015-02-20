(function () {
  'use strict';

  describe('window global objects count', function () {
    it('shouldnt have any new global properties created', function () {
      $.ajax({
        url: '../dist/blocks.js',
        async: false,
        complete: function (code) {
          var iframe = document.createElement('iframe');
          var iframeDocument;
          //iframe.innerHTML = '<html><body>asd</body></html>';
          document.body.appendChild(iframe);


          if (iframe.contentDocument) { // DOM
            iframeDocument = iframe.contentDocument;
          }
          else if (iframe.contentWindow) { // IE win
            iframeDocument = iframe.contentWindow.document;
          }
          iframeDocument.write('<head></head><body></body>');

          var countGlobalObjectsScriptBefore = document.createElement('script');
          countGlobalObjectsScriptBefore.text = '' +
              'var objectsCount = { before: 0, beforeKeys: {}, newKeys: {}, after: 0 };' +
              'for (var key in window) { objectsCount.beforeKeys[key] = true; objectsCount.before++; }';
          iframeDocument.body.appendChild(countGlobalObjectsScriptBefore);

          var blocksScript = document.createElement('script');
          blocksScript.text = code.responseText;
          iframeDocument.body.appendChild(blocksScript);

          var countGlobalObjectsScriptAfter = document.createElement('script');
          countGlobalObjectsScriptAfter.text = '' +
              'for (var key in window) { if (!objectsCount.beforeKeys[key] && key != "blocks") { objectsCount.newKeys[key] = true; } objectsCount.after++; }';
          iframeDocument.body.appendChild(countGlobalObjectsScriptAfter);

          expect(iframe.contentWindow.objectsCount.newKeys).toEqual({});

          document.body.removeChild(iframe);
        }
      });
    });
  });

  describe('blocks.extend()', function () {
    it('can extend an object with the attributes of another', function () {
      expect(blocks.extend({}, {
        a: 'b'
      }).a).toBe('b');
    });

    it('properties in source override destination', function () {
      expect(blocks.extend({
        a: 'x'
      }, {
        a: 'b'
      }).a).toBe('b');
    });

    it('properties not in source dont get overriden', function () {
      expect(blocks.extend({
        x: 'x'
      }, {
        a: 'b'
      }).x).toBe('x');
    });

    it('can extend from multiple source objects', function () {
      var result = blocks.extend({
        x: 'x'
      }, {
        a: 'a'
      }, {
        b: 'b'
      });
      expect(result).toEqual({
        x: 'x',
        a: 'a',
        b: 'b'
      });
    });

    it('extending from multiple source objects last property trumps', function () {
      var result = blocks.extend({
        x: 'x'
      }, {
        a: 'a',
        x: 2
      }, {
        a: 'b'
      });
      expect(result).toEqual({
        x: 2,
        a: 'b'
      });
    });

    // NOTE: Interesting case here.
    // Underscore.js extend will leave key 'a' to be part of the extended result
    // However jQuery extend will not
    // I am making it the jQuery way
    it('extend does copies undefined values', function () {
      var result = blocks.extend({}, {
        a: void 0,
        b: null
      });
      expect(result.hasOwnProperty('a')).toBe(true);
      expect(result.hasOwnProperty('b')).toBe(true);
    });

    it('should not error on null or undefined values', function () {
      var result = {};
      blocks.extend(result, null, undefined, {
        a: 1
      });
      expect(result.a).toBe(1);
    });
  });

  describe('blocks.toArray([])', function () {
    it('arguments object converted into array', function () {
      expect(blocks.isArray(arguments)).toBe(false);
      expect(blocks.isArray(blocks.toArray(arguments))).toBe(true);
    });

    it('array is not cloned', function () {
      var a = [1, 2, 3];
      expect(blocks.toArray(a)).toBe(a);
    });

    it('when passing undefined converts it to an array with undefined value', function () {
      var a;
      var array = blocks.toArray(a);
      expect(array.length).toBe(1);
      expect(array[0]).toBe(undefined);
    });

    // NOTE: Test in IE < 9
    it('should not throw error when converting a node list', function () {
      var actual;
      try {
        actual = blocks.toArray(document.childNodes);
      } catch (ex) { }

      expect(blocks.isArray(actual)).toBe(true);
    });

    it('converts primitive to an array', function () {
      expect(blocks.toArray(2)).toEqual([2]);
    });
  });

  describe('blocks.isArguments', function () {
    var args = (function () { return arguments; })(1, 2, 3);

    it('a string is not an arguments object', function () {
      expect(blocks.isArguments('string')).toBe(false);
    });

    it('a function is not an arguments object', function () {
      expect(blocks.isArguments(blocks.isArguments)).toBe(false);
    });

    it('arguments object is arbuments object', function () {
      expect(blocks.isArguments(args)).toBe(true);
    });

    it('arguments object converted to array is no longer arguments object', function () {
      expect(blocks.isArguments(blocks.toArray(args))).toBe(false);
    });

    it('an array is not an arguments object', function () {
      expect(blocks.isArguments([1, 2, 3])).toBe(false);
    });
  });

  describe('blocks.isElement()', function () {
    it('strings are not DOM elements', function () {
      expect(blocks.isElement('div')).toBe(false);
    });

    it('the html tag is a DOM element', function () {
      expect(blocks.isElement(document.createElement('div'))).toBe(true);
    });
  });

  describe('blocks.isElements()', function () {
    it('specifying undefined returns false', function () {
      expect(blocks.isElements(undefined)).toBe(false);
    });
  });

  describe('blocks.isObject', function () {

    it('the arguments object is object', function () {
      var args = (function () { return arguments; })(1, 2, 3);
      expect(blocks.isObject(args)).toBe(true);
    });

    it('arrays are objects', function () {
      expect(blocks.isObject([1, 2, 3])).toBe(true);
    });

    it('DOM elements are objects', function () {
      expect(blocks.isObject(document.createElement('div'))).toBe(true);
    });

    it('functions are objects', function () {
      expect(blocks.isObject(function () { })).toBe(true);
    });

    it('new String() object is an object', function () {
      expect(blocks.isObject(new String('string'))).toBe(true);
    });

    it('new Number() object is an object', function () {
      expect(blocks.isObject(new Number(123))).toBe(true);
    });

    it('new Boolean() object is an object', function () {
      expect(blocks.isObject(new Boolean(false))).toBe(true);
    });

    it('null is not an object', function () {
      expect(blocks.isObject(null)).toBe(false);
    });

    it('undefined is not an object', function () {
      expect(blocks.isObject(undefined)).toBe(false);
    });

    it('string is not an object', function () {
      expect(blocks.isObject('string')).toBe(false);
    });

    it('number is not an object', function () {
      expect(blocks.isObject(123)).toBe(false);
    });

    it('boolean is not an object', function () {
      expect(blocks.isObject(true)).toBe(false);
    });
  });

  describe('blocks.isArray()', function () {
    it('array is an array', function () {
      expect(blocks.isArray([1, 2, 3])).toBe(true);
    });

    it('new Array() object is an array', function () {
      expect(blocks.isArray(new Array(1, 2, 3))).toBe(true);
    });

    it('undefined is not an array', function () {
      expect(blocks.isArray(undefined)).toBe(false);
    });

    it('null is not an array', function () {
      expect(blocks.isArray(null)).toBe(false);
    });

    it('arguments object is not an array', function () {
      var args = (function () { return arguments; })(1, 2, 3);
      expect(blocks.isArray(args)).toBe(false);
    });

    it('object with length and splice properties is not an array', function () {
      expect(blocks.isArray({
        length: 2,
        splice: function () {

        }
      })).toBe(false);
    });
  });

  describe('blocks.isString()', function () {
    it('string is a string', function () {
      expect(blocks.isString('string')).toBe(true);
    });

    it('new String() object is a string', function () {
      expect(blocks.isString(new String('string'))).toBe(true);
    });

    it('the document body is not a string', function () {
      expect(blocks.isString(document.body)).toBe(false);
    });

    it('object with length and charAt properties is not a string', function () {
      expect(blocks.isString({
        length: 3,
        charAt: function () {

        }
      })).toBe(false);
    });

    it('null is not a string', function () {
      expect(blocks.isString(null)).toBe(false);
    });

    it('undefined is not a string', function () {
      expect(blocks.isString(undefined)).toBe(false);
    });

    it('array is not a string', function () {
      expect(blocks.isString([1, 2, 3])).toBe(false);
    });
  });

  describe('blocks.isNumber()', function () {
    it('number is a number', function () {
      expect(blocks.isNumber(0)).toBe(true);
    });

    it('new Number() object is a number', function () {
      expect(blocks.isNumber(new Number(0))).toBe(true);
    });

    it('NaN is a number', function () {
      expect(blocks.isNumber(NaN)).toBe(true);
    });

    it('Infinity is a number', function () {
      expect(blocks.isNumber(Infinity)).toBe(true);
    });

    it('-Infinity is a number', function () {
      expect(blocks.isNumber(Number.NEGATIVE_INFINITY)).toBe(true);
    });

    it('string number is not a number', function () {
      expect(blocks.isString('3')).toBe(true);
    });

    it('undefined is not a number', function () {
      expect(blocks.isNumber(undefined)).toBe(false);
    });

    it('null is not a number', function () {
      expect(blocks.isNumber(undefined)).toBe(false);
    });

    if (window.ActiveXObject) {
      it('IE host object is not a number', function () {
        var xml = new ActiveXObject('Msxml2.DOMDocument.3.0');
        expect(blocks.isNumber(xml)).toBe(false);
      });
    }
  });

  describe('blocks.isBoolean()', function () {
    it('true is a boolean', function () {
      expect(blocks.isBoolean(true)).toBe(true);
    });

    it('false is a boolean', function () {
      expect(blocks.isBoolean(false)).toBe(true);
    });

    it('new Boolean() object is a boolean', function () {
      expect(blocks.isBoolean(new Boolean(false))).toBe(true);
    });

    it('undefined is not a boolean', function () {
      expect(blocks.isBoolean(undefined)).toBe(false);
    });

    it('null is not a boolean', function () {
      expect(blocks.isBoolean(null)).toBe(false);
    });

    it('NaN is not a boolean', function () {
      expect(blocks.isBoolean(NaN)).toBe(false);
    });

    it('string "true" is not a boolean', function () {
      expect(blocks.isBoolean('true')).toBe(false);
    });

    if (window.ActiveXObject) {
      it('IE host object is not boolean', function () {
        var xml = new ActiveXObject('Msxml2.DOMDocument.3.0');
        expect(blocks.isBoolean(xml)).toBe(false);
      });
    }
  });

  describe('blocks.isFunction()', function () {
    it('function is a fuction', function () {
      expect(blocks.isFunction(function () { })).toBe(true);
    });

    it('blocks.isFunction is a function', function () {
      expect(blocks.isFunction(blocks.isFunction)).toBe(true);
    });

    it('undefined is not a function', function () {
      expect(blocks.isFunction(undefined)).toBe(false);
    });

    it('null is not a function', function () {
      expect(blocks.isFunction(null)).toBe(false);
    });

    it('object with call and apply properties is not a function', function () {
      expect(blocks.isFunction({
        call: function () {

        },

        apply: function () {

        }
      })).toBe(false);
    });

    it('array is not a function', function () {
      expect(blocks.isFunction([])).toBe(false);
    });

    if (window.ActiveXObject) {
      it('IE host object is not a function', function () {
        var xml = new ActiveXObject('Msxml2.DOMDocument.3.0');
        expect(blocks.isFunction(xml)).toBe(false);
      });
    }
  });

  describe('blocks.isDate()', function () {
    it('new Date() object is a date', function () {
      expect(blocks.isDate(new Date())).toBe(true);
    });

    it('Date.Now is a date', function () {
      expect(blocks.isDate(Date.now())).toBe(false);
    });

    it('object is not a Date', function () {
      expect(blocks.isDate({})).toBe(false);
    });

    it('undefined is not a date', function () {
      expect(blocks.isDate(undefined)).toBe(false);
    });

    it('null is not a date', function () {
      expect(blocks.isDate(null)).toBe(false);
    });

    it('number is not a date', function () {
      expect(blocks.isDate(13)).toBe(false);
    });
  });

  describe('blocks.isRegExp()', function () {
    it('/regexp/ is a regexp', function () {
      expect(blocks.isRegExp(/regexp/)).toBe(true);
    });

    it('new RegExp() object is a regexp', function () {
      expect(blocks.isRegExp(new RegExp('asd', 'g'))).toBe(true);
    });

    it('function is not a regexp', function () {
      expect(blocks.isRegExp(blocks.noop)).toBe(false);
    });

    it('object is not a regexp', function () {
      expect(blocks.isRegExp({
        test: function () {

        },

        match: function () {

        }
      })).toBe(false);
    });

    it('string is not a regxp', function () {
      expect(blocks.isRegExp('regexp')).toBe(false);
    });

    it('undefined is not a regexp', function () {
      expect(blocks.isRegExp(undefined)).toBe(false);
    });

    it('null is not a regexp', function () {
      expect(blocks.isRegExp(null)).toBe(false);
    });
  });

  describe('blocks.isFinite()', function () {
    it('number is finite', function () {
      expect(blocks.isFinite(0)).toBe(true);
    });

    it('new Number() object is finite', function () {
      expect(blocks.isFinite(new Number(1))).toBe(true);
    });

    it('numeric strings are finite', function () {
      expect(blocks.isFinite('0')).toBe(true);
    });

    it('non numeric strings are not finite', function () {
      expect(blocks.isFinite('1a')).toBe(false);
    });

    it('empty strings are not finite', function () {
      expect(blocks.isFinite('')).toBe(false);
    });

    it('Infinity is not finite', function () {
      expect(blocks.isFinite(Infinity)).toBe(false);
    });

    it('-Intinify is not finite', function () {
      expect(blocks.isFinite(-Infinity)).toBe(false);
    });

    it('undefined is not finite', function () {
      expect(blocks.isFinite(undefined)).toBe(false);
    });

    it('null is not finite', function () {
      expect(blocks.isFinite(null)).toBe(false);
    });
  });

  describe('blocks.isNaN()', function () {
    it('NaN is NaN', function () {
      expect(blocks.isNaN(NaN)).toBe(true);
    });

    it('wrapped NaN is still NaN', function () {
      expect(blocks.isNaN(new Number(NaN))).toBe(true);
    });

    it('number is not NaN', function () {
      expect(blocks.isNaN(0)).toBe(false);
    });

    it('string is not NaN', function () {
      expect(blocks.isNaN('NaN')).toBe(false);
    });

    it('object is not NaN', function () {
      expect(blocks.isNaN({})).toBe(false);
    });

    it('undefined is not NaN', function () {
      expect(blocks.isNaN(undefined)).toBe(false);
    });

    it('null is not NaN', function () {
      expect(blocks.isNaN(null)).toBe(false);
    });

    if (window.ActiveXObject) {
      it('IE host object is not NaN', function () {
        var xml = new ActiveXObject('Msxml2.DOMDocument.3.0');
        expect(blocks.isNaN(xml)).toBe(false);
      });
    }
  });

  describe('blocks.isNull()', function () {
    it('null is null', function () {
      expect(blocks.isNull(null)).toBe(true);
    });

    it('undefined is not null', function () {
      expect(blocks.isNull(undefined)).toBe(false);
    });

    it('object is not null', function () {
      expect(blocks.isNull({})).toBe(false);
    });

    it('passing no arguments returns false', function () {
      expect(blocks.isNull()).toBe(false);
    });

    it('blocks.isNull is not null', function () {
      expect(blocks.isNull(blocks.isNull)).toBe(false);
    });

    if (window.ActiveXObject) {
      it('IE host object is not null', function () {
        var xml = new ActiveXObject('Msxml2.DOMDocument.3.0');
        expect(blocks.isNull(xml)).toBe(false);
      });
    }
  });

  describe('blocks.isUndefined()', function () {
    it('undefined is undefined', function () {
      expect(blocks.isUndefined(undefined)).toBe(true);
    });

    it('not passing an argument returns true', function () {
      expect(blocks.isUndefined()).toBe(true);
    });

    it('null is not undefined', function () {
      expect(blocks.isUndefined(null)).toBe(false);
    });

    it('0 is not undefined', function () {
      expect(blocks.isUndefined(0)).toBe(false);
    });

    it('object is not undefined', function () {
      expect(blocks.isUndefined({})).toBe(false);
    });

    it('NaN is not undefined', function () {
      expect(blocks.isUndefined(NaN)).toBe(false);
    });

    if (window.ActiveXObject) {
      it('IE host object is not defined', function () {
        var xml = new ActiveXObject('Msxml2.DOMDocument.3.0');
        expect(blocks.isUndefined(xml)).toBe(false);
      });
    }
  });

  describe('blocks.has()', function () {
    var obj = {
      property: false,
      func: function () {

      }
    };

    it('checks if object has a certain property', function () {
      expect(blocks.has(obj, 'property')).toBe(true);
    });

    it('works for function type of property', function () {
      expect(blocks.has(obj, 'func')).toBe(true);
    });

    it('works event hasOwnProperty has a null value', function () {
      expect(blocks.has(obj, 'property')).toBe(true);
    });

    it('returns false if the object does have the property', function () {
      expect(blocks.has(obj, 'propertyThatDoesNotExist')).toBe(false);
    });

    it('does not check the prototype chain for a property', function () {
      obj.prototype = {
        'prototypeProperty': true
      };
      expect(blocks.has(obj, 'prototypeProperty')).toBe(false);
    });
  });
})();
