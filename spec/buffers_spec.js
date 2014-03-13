'use strict';

require('comfychair/jasmine');
var comfy = require('comfychair');
var cb = require('../index');


describe('a ring buffer with an appropriate model', function() {
  var rb = {
    apply: function(command, args) {
      if (command == 'init')
        this._data = new cb.impl.RingBuffer(args[0]);
      else
        return this._data[command].apply(this._data, args);
    }
  };

  var model = {
    _transitions: {
      init: function(state, n) {
        return {
          state: {
            data    : [],
            capacity: n || 0
          }
        };
      },
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

    _hasArgument: function(command) {
      return ['init', 'write', 'resize'].indexOf(command) >= 0;
    },

    commands: function() {
      var cmds = Object.keys(this._transitions).slice();
      cmds.splice(cmds.indexOf('init'), 1);
      return cmds;
    },
    randomArgs: function(command, size) {
      if (this._hasArgument(command))
        return [comfy.randomInt(0, size)];
      else
        return [];
    },

    shrinkArgs: function(command, args) {
      if (this._hasArgument(command) && args[0] > 0)
        return [[args[0] - 1]];
      else
        return [];
    },

    apply: function(state, command, args) {
      return this._transitions[command].apply(null, [state].concat(args));
    }
  };

  it('conforms to the model', function() {
    expect(rb).toConformTo(model);
  });
});
