
export function TaskState () {
  return {
    error: '',
    success: false,
    pending: false,
    data: null
  }
}

function axiosErrorHandler (err, state) {
  const { response } = err
  // if (response.hasOwnProperty('data')) {
  //   state.data = response.data
  // }
  const message = response.data?.message || err.message
  return {
    message,
    response,
    status: response?.status,
    toString: () => message
  }
}

export async function watchTask (task, state, opts) {
  state.pending = true
  try {
    const resp = await task
    state.error = ''
    state.success = true
    if (resp?.hasOwnProperty('data')) {
      state.data = resp.data
    }
    return resp
  } catch (err) {
    state.success = false
    const handler = opts?.errorHandler || (err.isAxiosError && axiosErrorHandler)
    state.error = handler ? handler(err, state) : err
    return state
  } finally {
    state.pending = false
  }
}

export function watchTask2 (task, state, opts = {}) {
  return new Promise(async (resolve, reject) => {
    state.pending = true
    try {
      const resp = await task
      state.error = ''
      state.success = true
      if (resp?.hasOwnProperty('data')) {
        state.data = resp.data
      }
      resolve(resp)
    } catch (err) {
      const handler = opts?.errorHandler || (err.isAxiosError && axiosErrorHandler)
      state.error = handler ? handler(err) : err
      state.success = false
      // reject(state.error)
    } finally {
      state.pending = false
    }
  })
}
