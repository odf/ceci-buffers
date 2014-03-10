'use strict';


function RingBuffer(size) {
  this.size = size;
  this.data_start = 0;
  this.data_count = 0;
  this.data = new Array(size);
};


RingBuffer.prototype.capacity = function() {
  return this.size;
};

RingBuffer.prototype.count = function() {
  return this.data_count;
};

RingBuffer.prototype.isEmpty = function() {
  return this.data_count == 0;
};

RingBuffer.prototype.isFull = function() {
  return this.data_count == this.size;
};

RingBuffer.prototype.write = function(val) {
  var pos = (this.data_start + this.data_count) % this.size;
  this.data[pos] = val;
  if (this.data_count < this.size)
    this.data_count += 1;
  else
    this.data_start = (this.data_start + 1) % this.size;
};

RingBuffer.prototype.read = function() {
  if (this.data_count > 0) {
    var val = this.data[this.data_start];
    this.data_start = (this.data_start + 1) % this.size;
    this.data_count = Math.max(this.data_count - 1, 0);
    return val;
  }
};

RingBuffer.prototype.resize = function(n) {
  var new_data = new Array(n);
  if (n < this.data_count) {
    var base = this.data_start + this.data_count - n;
    for (var i = 0; i < n; ++i)
      new_data[i] = this.data[(base + i) % this.size];
  }
  else
    for (var i = 0; i < this.data_count; ++i)
      new_data[i] = this.data[(this.data_start + i) % this.size];
  this.size = n;
  this.data_start = 0;
  this.data_count = Math.min(this.data_count, this.size);
  this.data = new_data;
};


var pull = function() {
  return this.buffer.isEmpty() ? [] : [this.buffer.read()];
};


function Buffer(size) {
  this.buffer = new RingBuffer(size || 1);
};

Buffer.prototype.canFail = function() {
  return true;
};

Buffer.prototype.push = function(val) {
  if (this.buffer.isFull())
    return false;
  else {
    this.buffer.write(val);
    return true;
  }
};

Buffer.prototype.pull = pull;


function DroppingBuffer(size) {
  this.buffer = new RingBuffer(size || 1);
};

DroppingBuffer.prototype.canFail = function() {
  return false;
};

DroppingBuffer.prototype.push = function(val) {
  if (!this.buffer.isFull())
    this.buffer.write(val);
  return true;
};

DroppingBuffer.prototype.pull = pull;


function SlidingBuffer(size) {
  this.buffer = new RingBuffer(size || 1);
};

SlidingBuffer.prototype.canFail = function() {
  return false;
};

SlidingBuffer.prototype.push = function(val) {
  this.buffer.write(val);
  return true;
};

SlidingBuffer.prototype.pull = pull;


module.exports = {
  Buffer        : Buffer,
  DroppingBuffer: DroppingBuffer,
  SlidingBuffer : SlidingBuffer,
  impl: {
    RingBuffer  : RingBuffer
  }
};
