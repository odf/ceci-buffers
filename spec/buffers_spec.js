'use strict';

require('comfychair/jasmine');
var comfy = require('comfychair');
var cb = require('../index');


describe('a ring buffer with an appropriate model', function() {
  var rb = {
    _data: new cb.impl.RingBuffer(0),

    reset: function() {
      this._data = new cb.impl.RingBuffer(0);
    },

    apply: function(command, args) {
      return this._data[command].apply(this._data, args);
    }
  };

  var model = {
    _transitions: {
      capacity: function(state) {
        return {
          state : state,
          output: state.capacity
        };
      },
      count: function(state) {
        return {
          state : state,
          output: state.data.length
        };
      },
      isEmpty: function(state) {
        return {
          state : state,
          output: state.data.length == 0
        };
      },
      isFull: function(state) {
        return {
          state : state,
          output: state.data.length >= state.capacity
        };
      },
      write: function(state, val) {
        var t = state.data.slice();
        t.push(val);
        while (t.length > state.capacity)
          t.shift();

        return {
          state: {
            data    : t,
            capacity: state.capacity
          }
        }
      },
      read: function(state) {
        var t = state.data.slice();
        var output = t.length > 0 ? t.shift() : undefined;

        return {
          state: {
            data    : t,
            capacity: state.capacity
          },
          output: output
        }
      },
      resize: function(state, n) {
        var t = state.data.slice();
        if (n < t.length)
          t.splice(0, t.length - n);

        return {
          state: {
            data:     t,
            capacity: n
          }
        }
      }
    },

    commands: function() {
      return Object.keys(this._transitions);
    },

    randomArgs: function(command, size) {
      if (command == 'write' || command == 'resize')
        return [comfy.randomInt(0, size)];
      else
        return [];
    },

    initial: function() {
      return {
        data    : [],
        capacity: 0
      }
    },

    apply: function(state, command, args) {
      return this._transitions[command].apply(null, [state].concat(args));
    }
  };

  it('conforms to the model', function() {
    expect(rb).toConformTo(model);
  });
});
