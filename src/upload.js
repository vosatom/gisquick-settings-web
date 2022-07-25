
export function createUpload (ws, files, project) {

  const info = {
    files: {},
    totalProgress: 0
  }
  files.forEach(f => {
    info.files[f.path] = {
      size: f.size,
      progress: 0
    }
  })

  let task
  function onProgressMessage(msg) {
    const { total, files } = msg.data

    Object.entries(files).forEach(([file, progress]) => {
      const fileUpload = info.files[file]
      if (fileUpload) {
        fileUpload.progress = progress
      }
    })
    info.totalProgress = total

    const finished = info.totalProgress === 100
    if (task && task.onProgress) {
      task.onProgress(info)
    }
    if (finished) {
      ws.unbind('UploadProgress', onProgressMessage)
      task.resolve()
      task = null
    }
  }

  function onErrorMessage (msg) {
    task.reject(new Error(JSON.parse(msg.data)?.message))
  }

  return {
    info,
    start (onProgress) {
      return new Promise((resolve, reject) => {
        ws.bind('UploadProgress', onProgressMessage)
        ws.bind('UploadError', onErrorMessage)
        ws.send('UploadFiles', { files, project })
        task = {
          resolve,
          reject,
          onProgress
        }
      })
    },
    abort () {
      if (task) {
        ws.unbind('UploadProgress', onProgressMessage)
        ws.unbind('UploadError', onErrorMessage)
        task.reject('aborted')
        ws.send('AbortUpload', { project })
        task = null
      }
    }
  }
}