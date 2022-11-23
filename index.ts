import 'dotenv/config'
import './utils/checkDotenv'
import {app} from './server'
import {config} from './core/config'

app.listen(config.port, () => {
  console.log(`Listening on port ${config.port}`)
})
