import express from 'express'
import {errorHandler} from './lib/errors'
import ical from 'ical-generator'
import {DateTime} from 'luxon'
import {getTimetable} from './lib/itmo'

async function createCalendar(isuId: number) {
  const calendar = ical({name: `Расписание · ${isuId}`})
  const start = DateTime.now().startOf('week')
  const lessons = await getTimetable(isuId, start, start.plus({weeks: 2}))
  for (const lesson of lessons) {
    calendar.createEvent({
      start: lesson.timeStart,
      end: lesson.timeEnd,
      summary: `${lesson.subjectName} · ${lesson.subjectKind}`,
      description: `Преподаватель: ${lesson.teacher}`,
      ...lesson.place && {
        location: {
          title: lesson.place,
        },
      },
    })
  }
  return calendar
}

export const app = express()
app.all('/', (req, res) => {
  res.json({hello: 'world'})
})
app.get('/:id', (req, res) => {
  const isuId = Number(req.params.id)
  if (!isuId) {
    res.writeHead(400)
    return res.end('BAD_REQUEST')
  }
  return createCalendar(isuId)
    .then((calendar) => calendar.serve(res, `${isuId}.ics`))
    .catch(errorHandler(res))

})
