'use strict'

const Types = require('./Types')

class Property {
  constructor (dataStream, tag, type, count, valueOffset) {
    this.dataStream = dataStream
    this.tag = tag
    this.type = type
    this.count = count
    this.valueOffset = valueOffset
  }

  values () {
    let values = []

    this.dataStream.seek(this.valueOffset)

    if (this.type === Types.ASCII) {
      values.push(Types.uint8ArrayToAscii(this.dataStream.readUint8Array(this.count)))
    } else if (this.type === Types.UNDEFINED) {
      values.push(this.dataStream.readUint8Array(this.count))
    } else if (this.type === Types.BYTE) {
      values.push(this.dataStream.readUint8Array(this.count))
    } else {
      for (let i = 0; i < this.count; i++) {
        switch (this.type) {
          case Types.SHORT:
            values.push(this.dataStream.readUint16())
            break
          case Types.LONG:
            values.push(this.dataStream.readUint32())
            break
          case Types.RATIONAL:
            values.push({n: this.dataStream.readUint32(), d: this.dataStream.readUint32()})
            break
          case Types.SBYTE:
            values.push(this.dataStream.readInt16())
            break
          case Types.SSHORT:
            values.push(this.dataStream.readInt16())
            break
          case Types.SLONG:
            values.push(this.dataStream.readInt32())
            break
          case Types.SRATIONAL:
            values.push({n: this.dataStream.readInt32(), d: this.dataStream.readInt32()})
            break
          case Types.FLOAT:
            values.push(this.dataStream.readFloat32())
            break
          case Types.DOUBLE:
            values.push(this.dataStream.readFloat64())
            break
        }
      }
    }

    return values
  }

  value () {
    return this.values()[0]
  }
}

Property.TAG_NEW_SUBFILE_TYPE = 0xfe
Property.TAG_IMAGE_WIDHT = 0x100
Property.TAG_IMAGE_LENGTH = 0x101
Property.TAG_BITS_PER_SAMPLE = 0x102
Property.TAG_COMPRESSION = 0x0103
Property.TAG_STRIP_OFFSET = 0x111
Property.TAG_SAMPLE_PER_PIXEL = 0x115
Property.TAG_STRIP_BYTE_COUNTS = 0x117
Property.TAG_TILE_WIDTH = 0x142
Property.TAG_TILE_LENGTH = 0x143
Property.TAG_TILE_OFFSETS = 0x144
Property.TAG_TILE_BYTE_COUNTS = 0x145
Property.TAG_SUB_IFDS = 0x14a

module.exports = Property
