'use strict'

class Types {
  static size (type) {
    switch (type) {
      case Types.BYTE:
      case Types.ASCII:
      case Types.SBYTE:
      case Types.UNDEFINED:
        return 1
      case Types.SHORT:
      case Types.SSHORT:
        return 2
      case Types.LONG:
      case Types.SLONG:
      case Types.FLOAT:
        return 4
      case Types.RATIONAL:
      case Types.SRATIONAL:
      case Types.DOUBLE:
        return 8
      default:
        return 1
    }
  }

  static uint8ArrayToAscii (uint8array) {
    let string = ''

    for (let i = 0; i < uint8array.length; i++) {
      if (uint8array[i] === 0) {
        break
      }

      string += String.fromCharCode(uint8array[i])
    }

    return string
  }
}

Types.BYTE = 1
Types.ASCII = 2
Types.SHORT = 3
Types.LONG = 4
Types.RATIONAL = 5
Types.SBYTE = 6
Types.UNDEFINED = 7
Types.SSHORT = 8
Types.SLONG = 9
Types.SRATIONAL = 10
Types.FLOAT = 11
Types.DOUBLE = 12

module.exports = Types
