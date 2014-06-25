'use strict';


function RingBuffer(size) {
  var size = size;
  var data_start = 0;
  var data_count = 0;
  var data = new Array(size);

  function capacity() {
    return size;
  };

  function count() {
    return data_count;
  };

  function isEmpty() {
    return data_count == 0;
  };

  function isFull() {
    return data_count == size;
  };

  function write(val) {
    var pos = (data_start + data_count) % size;
    data[pos] = val;
    if (data_count < size)
      data_count += 1;
    else
      data_start = (data_start + 1) % size;
  };

  function read() {
    if (data_count > 0) {
      var val = data[data_start];
      data_start = (data_start + 1) % size;
      data_count = Math.max(data_count - 1, 0);
      return val;
    }
  };

  function resize(n) {
    var new_data = new Array(n);
    if (n < data_count) {
      var base = data_start + data_count - n;
      for (var i = 0; i < n; ++i)
        new_data[i] = data[(base + i) % size];
    }
    else
      for (var i = 0; i < data_count; ++i)
        new_data[i] = data[(data_start + i) % size];
    size = n;
    data_start = 0;
    data_count = Math.min(data_count, size);
    data = new_data;
  };

  return {
    capacity: capacity,
    count   : count,
    isEmpty : isEmpty,
    isFull  : isFull,
    write   : write,
    read    : read,
    resize  : resize
  };
};


var CHECKED  = 0;
var DROPPING = 1;
var SLIDING  = 2;


function makeBuffer(size, type) {
  var _buffer = RingBuffer(size || 1);
  var _type = type || CHECKED;

  function canFail() {
    return _type == CHECKED;
  };

  function push(val) {
    if (!_buffer.isFull() || _type == SLIDING)
      _buffer.write(val);
    else if (_type == CHECKED)
      return false;
    return true;
  };

  function pull() {
    return _buffer.isEmpty() ? [] : [_buffer.read()];
  };

  return {
    canFail: canFail,
    push   : push,
    pull   : pull
  };
};


function Buffer(size) {
  return makeBuffer(size, CHECKED);
};


function DroppingBuffer(size) {
  return makeBuffer(size, DROPPING);
};


function SlidingBuffer(size) {
  return makeBuffer(size, SLIDING);
};


module.exports = {
  Buffer        : Buffer,
  DroppingBuffer: DroppingBuffer,
  SlidingBuffer : SlidingBuffer,
  impl: {
    RingBuffer  : RingBuffer
  }
};
