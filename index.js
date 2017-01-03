'use strict'

const Parser = require('./lib/Parser')

class Filter {
  constructor () {
    this.inPlace = false
    this.dirty = false
  }

  process (data) {
    let rootDirectories = Parser.parse(data)
    let rawDirectory = rootDirectories[0].getDirectoryBySubfileType(0)

    return rawDirectory.readImage()
  }
}

module.exports = Filter
