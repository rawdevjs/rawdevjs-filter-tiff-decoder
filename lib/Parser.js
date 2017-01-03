'use strict'

const DataStream = require('datastream.js')
const Directory = require('./Directory')
const Property = require('./Property')
const Types = require('./Types')

class Parser {
  constructor (data) {
    this.dataStream = new DataStream(data)
  }

  parse () {
    // detect byte order
    let tiffByteOrder = this.dataStream.readUint16()

    if (tiffByteOrder === 0x4949) {
      this.dataStream.endianness = DataStream.LITTLE_ENDIAN
    } else if (tiffByteOrder === 0x4d4d) {
      this.dataStream.endianness = DataStream.BIG_ENDIAN
    } else {
      throw new Error('unknown byte order')
    }

    return this.parseDirectories(4)
  }

  parseDirectories (offset) {
    if (offset) {
      this.dataStream.seek(offset)
    }

    let directoryOffset = this.dataStream.readUint32()
    let directories = []

    while (directoryOffset !== 0) {
      this.dataStream.seek(directoryOffset)
      let directorySize = this.dataStream.readUint16()
      directories.push(this.parseDirectory(directoryOffset))
      this.dataStream.seek(directoryOffset + directorySize * 12 + 2)
      directoryOffset = this.dataStream.readUint32()
    }

    return directories
  }

  parseDirectory (offset) {
    this.dataStream.seek(offset)
    let directorySize = this.dataStream.readUint16()
    let properties = {}

    for (let i = 0; i < directorySize; i++) {
      let property = this.parseProperty(offset + 2 + i * 12)

      properties[property.tag] = property
    }

    return new Directory(this.dataStream, properties)
  }

  parseProperty (offset) {
    this.dataStream.seek(offset)

    let property = new Property(this.dataStream, this.dataStream.readUint16(), this.dataStream.readUint16(), this.dataStream.readUint32(), offset + 8)
    let dataSize = Types.size(property.type) * property.count

    if (dataSize > 4) {
      property.valueOffset = this.dataStream.readUint32()
    }

    if (property.tag === Property.TAG_SUB_IFDS) {
      property.directories = this.parseDirectories()
    }

    return property
  }

  static parse (data) {
    return new Parser(data).parse()
  }
}

module.exports = Parser
