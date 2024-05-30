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
        const { product, amount } = item
        if (product.trim() === payload.product.trim()) {
          totalAmount += Number(amount)
        }
      })
      .on('end', () => {
        if (isCSV) {
          console.log('csv found')

          res.status(200).json({ file: `${payload.file}`, sum: totalAmount })
        } else {
          res.status(400).json({ error: 'Invalid CSV file' })
        }
      })
  } catch (error) {
    res.status(200).json({
      file: `${payload.file}`,
      error: 'Input file not in CSV format.'
    })
  }
})

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`)
})
