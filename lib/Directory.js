'use strict'

const Promise = require('bluebird')
const LosslessJpegDecoder = require('lossless-jpeg-decoder')
const Image = require('rawdevjs-image')
const Property = require('./Property')

class Directory {
  constructor (dataStream, properties) {
    this.dataStream = dataStream
    this.properties = properties
  }

  readImage () {
    let compression = this.properties[Property.TAG_COMPRESSION].value()

    if (compression === 7) {
      if (this.properties[Property.TAG_TILE_OFFSETS]) {
        return this.readJpegImageTiled()
      } else {
        return this.readJpegImagePlain()
      }
    }
  }

  readJpegImageTiled () {
    let width = this.properties[Property.TAG_IMAGE_WIDHT].value()
    let height = this.properties[Property.TAG_IMAGE_LENGTH].value()
    let tileWidth = this.properties[Property.TAG_TILE_WIDTH].value()
    let tilesPerLine = Math.floor((width + tileWidth - 1) / tileWidth)
    let fullWidth = tilesPerLine * tileWidth
    let tileHeight = this.properties[Property.TAG_TILE_LENGTH].value()
    let tilesPerColumn = Math.floor((height + tileHeight - 1) / tileHeight)
    let fullHeight = tilesPerColumn * tileHeight
    let tileOffsets = this.properties[Property.TAG_TILE_OFFSETS].values()
    let tileLengths = this.properties[Property.TAG_TILE_BYTE_COUNTS].values()
    let image = new Image(Image.Types.BAYER16, {width: fullWidth, height: fullHeight})

    image.width = width
    image.height = height

    let decodeTile = (tileNumber) => {
      let x = tileNumber % tilesPerLine
      let y = Math.floor(tileNumber / tilesPerLine)

      this.dataStream.seek(tileOffsets[tileNumber])

      let inputBuffer = this.dataStream.readUint8Array(tileLengths[tileNumber])
      let imageOffset = x * tileWidth + y * tileHeight * image.bufferWidth
      let decoder = new LosslessJpegDecoder()

      return decoder.decode(inputBuffer, image.buffer.subarray(imageOffset), image.bufferWidth)
    }

    return Promise.map(tileOffsets, (tileOffset, tileNumber) => {
      return decodeTile(tileNumber)
    }, {concurrency: 4}).then(() => {
      return image
    })
  }

  readJpegImagePlain () {
    return Promise.reject(new Error('not implemented'))
  }

  getSubDirectories () {
    if (this.properties[Property.TAG_SUB_IFDS]) {
      return this.properties[Property.TAG_SUB_IFDS].directories
    }
  }

  getSubDirectory (index) {
    if (this.properties[Property.TAG_SUB_IFDS]) {
      return this.properties[Property.TAG_SUB_IFDS].directories[index]
    }
  }

  getDirectoryBySubfileType (value) {
    if (this.properties[Property.TAG_NEW_SUBFILE_TYPE] && this.properties[Property.TAG_NEW_SUBFILE_TYPE].value() === value) {
      return this
    }

    if (this.properties[Property.TAG_SUB_IFDS]) {
      for (let i = 0; i < this.properties[Property.TAG_SUB_IFDS].directories.length; i++) {
        let directory = this.properties[Property.TAG_SUB_IFDS].directories[i].getDirectoryBySubfileType(value)

        if (directory) {
          return directory
        }
      }
    }
  }
}

module.exports = Directory
