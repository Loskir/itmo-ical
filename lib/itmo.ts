import got, {HTTPError} from 'got'
import {DateTime} from 'luxon'
import {ERROR, ExpectedError} from './errors'

interface Lesson {
  timeStart: string
  timeEnd: string
  place: string
  subjectName: string
  subjectKind: string
  teacher: string
}

type TimetableResponse = Lesson[]

function toTimestamp(date: Date | DateTime) {
  const luxonDate = (date instanceof Date) ? DateTime.fromJSDate(date) : date
  return luxonDate.toSeconds()
}

export const getTimetable = async (isuId: number, startDate: Date | DateTime, endDate: Date | DateTime) => {
  const start = Date.now()
  const url = `https://sigkill.ru/api/schedule/student/${isuId}?start=${toTimestamp(startDate)}&end=${toTimestamp(endDate)}`
  return got.get<TimetableResponse>(url, {
    headers: {
      'Accept-Language': 'ru-RU, ru;q=0.9, en-US;q=0.8, en;q=0.7',
      'User-Agent': 'itmo-ical@1.0.0',
    },
    responseType: 'json',
  }).then((v) => {
    console.log(`getTimetable took ${Date.now() - start}ms, ${url}`)
    return v.body
  }).catch((error) => {
    if (error instanceof HTTPError) {
      console.log(error.response.statusCode, error.response.body)
      if (error.response.statusCode === 400) {
        throw new ExpectedError(ERROR.BAD_REQUEST)
      }
    }
    throw error
  })
}
