class API {
  constructor () {
    this.urlPrefix = '/glyphbook/api/v1'
  }

  artifact (id) {
    return new Artifact(this, id)
  }

  buildUrl (suffix) {
    return `${this.urlPrefix}/${suffix}`
  }
}

class Model {
  constructor (api) {
    this.api = api
    this.successCallback = undefined
    this.errorCallback = undefined
  }

  success (callback) {
    this.successCallback = callback
    return this
  }

  error (callback) {
    this.errorCallback = callback
    return this
  }

  get url () {
    throw 'Unimplemented'
  }

  get () {
    let that = this
    $.ajax(
      this.url,
      {
        success: function (data, status) {
          console.log('ajax: success')
          that.successCallback(data)
        },
        error: function (data, status) {
          console.log('ajax: error')
          that.errorCallback(data)
        },
      },
    )
  }
}

class Artifact extends Model {
  constructor (api, id) {
    super(api)
    this.id = id
  }

  get url () {
    return this.api.buildUrl(`artifact/${this.id}.json`)
  }
}
