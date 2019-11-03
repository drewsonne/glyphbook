class GBGrid {
  constructor () {
    this.gridItems = {
      'x': [],
      'y': [],
    }
  }

  draw (paperjs_view) {
    for (var xPos = 0; xPos < paperjs_view.bounds.width; xPos += 20) {
      if (xPos in this.gridItems.x) {
        this.gridItems.x[xPos].remove()
      }
      this.gridItems.x[xPos] = new paper.Path.Line(
        [xPos + 1, paperjs_view.bounds.top],
        [xPos + 1, paperjs_view.bounds.bottom],
      )
      this.gridItems.x[xPos].strokeColor = new Color(
        (xPos % 100) === 0 ? 0.5 : 0.9)
    }

    for (var yPos = 0; yPos < paperjs_view.bounds.bottom; yPos += 20) {
      if (yPos in this.gridItems.y) {
        this.gridItems.y[yPos].remove()
      }
      this.gridItems.y[yPos] = new paper.Path.Line(
        [paperjs_view.bounds.left, yPos + 1],
        [paperjs_view.bounds.right, yPos + 1],
      )
      this.gridItems.y[yPos].strokeColor = new Color(
        (yPos % 100) === 0 ? 0.5 : 0.9)
    }
  }
}

class GBArtifact {
  constructor () {
    this.raster = undefined
    this.scaleFactor = undefined
    this.img_tag = $('<img class="hidden" id="artifact"></img>')
    $('html').append(this.img_tag)
    this.loaded = false
  }

  set_href (new_href, paperjs_view) {
    $(this.img_tag).attr('src', new_href)
    this.raster = new Raster('artifact')
    var that = this
    this.raster.on('load', function () {
      that.loaded = true

      that.draw(paperjs_view)
      that.fitToView(paperjs_view)
    })

  }

  draw (paperjs_view) {
    if (this.loaded) {
      this.raster.position = paperjs_view.center
      this.raster.bringToFront()
    }
  }

  fitToView (paperjs_view) {
    if (this.loaded) {
      if (this.scaleFactor !== undefined) {
        this.raster.scale(1 / this.scaleFactor)
      }
      let xScaleFactor = undefined
      let yScaleFactor = undefined
      if (this.raster.height > paperjs_view.bounds.height) {
        let targetHeight = paperjs_view.bounds.height * 0.9
        yScaleFactor = targetHeight / this.raster.height
      }

      if (this.raster.width > paperjs_view.bounds.width) {
        let targetWidth = paperjs_view.bounds.width * 0.9
        xScaleFactor = targetWidth / this.raster.width
      }

      this.scaleFactor = Math.min(yScaleFactor, xScaleFactor)
      this.raster.scale(this.scaleFactor)
    }
  }
}

// class GBUIDelay {
//   constructor () {
//     this.delays = {}
//     this.timers = {}
//   }
//
//   setDelayHandler (delay_name, callback) {
//     this.delays[delay_name] = callback
//     this.timers[delay_name] = setInterval(function() {
//
//     })
//   }
// }
