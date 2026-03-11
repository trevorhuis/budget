import express from 'express'
import { accountRouter } from './api/account.router.js';
const port = 3000

const app = express()
app.use(express.json());

app.get('/health', (req, res, next) => { res.send('OK') })
app.use('/account', accountRouter)

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
