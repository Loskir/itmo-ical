import {ServerResponse} from 'node:http'

export class ExpectedError extends Error {
  name: ERROR
  constructor(name: ERROR) {
    super(name)
    this.name = name
  }
}

export enum ERROR {
  BAD_REQUEST = 'BAD_REQUEST'
}

export const ERROR_CODES = {
  [ERROR.BAD_REQUEST]: 400
}

export const errorHandler = (res: ServerResponse) => (error: unknown) => {
  let status = 500
  let message = 'SERVER_ERROR'
  if (error instanceof ExpectedError) {
    status = ERROR_CODES[error.name] || 500
    message = error.name
  } else {
    console.error(error)
  }
  console.error(status, message)
  res.writeHead(status)
  res.end(message)
}
