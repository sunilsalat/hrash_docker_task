const express = require('express')
const fs = require('fs')
const path = require('path')
const csv = require('csv-parser')
const PORT = 8000

const app = express()
app.use(express.json())

app.get('/test', async res => {
  return res.status(200).json({ msg: 'Test passed' })
})

app.post('/result', async (req, res) => {
  const payload = req.body
  const filePath = path.join(__dirname, `../../data/${payload.file}`)
  let isCSV = true
  let totalAmount = 0
  let result = []

  if (path.extname(filePath).toLowerCase() !== '.csv') {
    return res
      .status(200)
      .json({ file: payload.file, error: 'Input file not in CSV format.' })
  }

  try {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('error', () => {
        isCSV = false
        return res
          .status(200)
          .json({ file: payload.file, error: 'Input file not in CSV format.' })
      })
      .on('data', item => {
        result.push(item)
      })
      .on('end', () => {
        console.log('csv found')
        console.log(result)
        let sum = 0

        if (result.length > 0) {
          for (let i = 0; i < result.length; i++) {
            const { product, amount } = result[i]
            if (payload.product === product) {
              console.log(product, amount)
              sum += Number(amount)
            }
          }
          return res.status(200).json({ file: `${payload.file}`, sum: sum })
        } else {
          return res.status(200).json({
            file: `${payload.file}`,
            error: 'Input file not in CSV format.'
          })
        }
      })
  } catch (error) {
    console.log({ error })
    res.status(200).json({
      file: `${payload.file}`,
      error: 'Input file not in CSV format.'
    })
  }
})

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`)
})
