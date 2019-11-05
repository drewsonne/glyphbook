class EventHandler {
  constructor () {
    this.events = {}
  }

  on (event_name, callback) {
    this.events[event_name] = callback
    return this
  }

  fire (event_name) {
    this.events[event_name]()
  }
}

class GBCartesianPoint {
  constructor (x, y) {
    this.x = x
    this.y = y
  }

  toPaperPoint () {
    return new paper.Point(
      this.x + paper.view.bounds.width / 2,
      this.y + paper.view.bounds.height / 2,
    )
  }

  toCartesian (point) {
    return new GBCartesianPoint(
      point.x - paper.view.bounds.width / 2,
      point.y - paper.view.bounds.height / 2,
    )
  }
}

class GBGrid extends EventHandler {
  constructor () {
    super()
    this.gridItems = {
      'x': [],
      'y': [],
    }
    this.firstDraw = false
  }

  draw (paperjs_view) {
    console.log('grid: draw')
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
    if (!this.firstDraw) {
      this.firstDraw = true
      this.fire('first-draw')
    }
  }

}

class GBArtifact extends EventHandler {
  constructor () {
    super()
    this.raster = undefined
    this.scaleFactor = undefined
    this.img_tag = $('<img class="hidden" id="artifact"></img>')
    $('html').append(this.img_tag)
    this.loaded = false

    this.firstFitToView = false
    this.firstDraw = false
    this.firstDrawFired = false
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
    console.log('artifact: draw')

    if (this.loaded) {
      this.raster.position = paperjs_view.center
      this.raster.bringToFront()
    }
    this.firstDraw = true
    this.fireFirstDraw()
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
    this.firstFitToView = true
    this.fireFirstDraw()
  }

  fireFirstDraw () {
    if (this.firstDraw && this.firstFitToView) {
      if (!this.firstDrawFired) {
        this.fire('first-draw')
        this.firstDrawFired = true
      }
    }
  }
}

const TOP_LEFT = 1
const TOP_RIGHT = 2
const BOTTOM_RIGHT = 3
const BOTTOM_LEFT = 4

class GBAnnotation {
  constructor (point) {
    this.topLeft = point
    this.rect = new Rectangle(this.topLeft, new Size(1, 1))
  }

  include (point) {
    this.rect = new Rectangle(this.topLeft, point)
  }

  flush () {
    if (this.rectangle !== undefined) {
      this.rectangle.remove()
    }
    this.rectangle = new Path.Rectangle(this.rect)
    this.rectangle.bringToFront()
    this.rectangle.strokeWidth = 2
    this.rectangle.strokeColor = 'red'
    let that = this
    this.rectangle.on('click', function (event) {
      that.handleClick(event)
    })
  }

  handleClick (event) {
    this.rectangle.selected = true
    this.categoriseClickPoint(event.point)
  }

  categoriseClickPoint (point) {
    if (this.getDistanceToPoint('bottomRight', point)) {
      debugger
    } else if (this.getDistanceToPoint('bottomLeft', point)) {
      debugger
    } else if (this.getDistanceToPoint('topRight', point)) {
      debugger
    } else if (this.getDistanceToPoint('topLeft', point)) {
      debugger
    }
  }

  getDistanceToPoint (corner, point) {
    return this.rectangle.bounds[corner].subtract(point).length < 4
  }
}

class GBAnnotations {
  constructor () {
    this.annotations = []
    this.rect = new GBAnnotation()
  }

  handleMouseDown (event) {
    this.rect = new GBAnnotation(event.point)
    this.rect.include(event.point)
  }

  handleMouseDrag (event) {
    if (this.rect !== undefined) {
      this.rect.include(event.point)
      this.rect.flush()
    }
  }

  handleMouseUp (event) {
    this.rect.include(event.point)
    this.rect.flush()

    this.annotations.push(this.rect)
    this.rect = undefined
  }
}
