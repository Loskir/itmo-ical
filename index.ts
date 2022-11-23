import 'dotenv/config'
import './utils/checkDotenv'
import ical from 'ical-generator'
import http from 'node:http'
import {DateTime} from 'luxon'
import {config} from './core/config'
// import LruCache from 'lru-cache'

import {errorHandler} from './lib/errors'
import {getTimetable} from './lib/itmo'

// const cache = new LruCache<number, ICalCalendar>({
//   maxAge: 1000 * 60 * 60, // 1h
//   max: 10,
// })

async function createCalendar(isuId: number) {
  // const cached = cache.get(isuId)
  // if (cached) {
  //   console.log(isuId, 'returned from cache')
  //   return cached
  // }
  const calendar = ical({name: `Расписание · ${isuId}`})
  const start = DateTime.now().startOf('week')
  const lessons = await getTimetable(isuId, start, start.plus({weeks: 2}))
  for (const lesson of lessons) {
    calendar.createEvent({
      start: new Date(lesson.timeStart),
      end: new Date(lesson.timeEnd),
      summary: `${lesson.subjectName} · ${lesson.subjectKind}`,
      description: `Преподаватель: ${lesson.teacher}`,
      ...lesson.place && {
        location: {
          title: lesson.place,
        },
      },
    })
  }
  // cache.set(isuId, calendar)
  return calendar
}

http.createServer(async (req, res) => {
  const isuId = req.url && Number(decodeURIComponent(req.url.slice(1)))
  console.log(isuId)
  if (!isuId) {
    res.writeHead(400)
    return res.end('BAD_REQUEST')
  }
  return createCalendar(isuId)
    .then((calendar) => calendar.serve(res, `${isuId}.ics`))
    .catch(errorHandler(res))
})
  .listen(config.port, () => {
    console.log(`Server running at http://127.0.0.1:${config.port}/`)
  })
