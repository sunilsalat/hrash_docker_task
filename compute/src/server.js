const express = require('express')
const fs = require('fs')
const path = require('path')
const csv = require('csv-parser')
const PORT = 8000

const app = express()
app.use(express.json())

app.get('/test', async (req, res) => {
  return res.status(200).json({ msg: 'Test passed' })
})

app.post('/result',async(req, res) => {
  const data = req.body

  const filePath = path.join(__dirname, `../../data/${data.file}`)
  console.log(__dirname, filePath, 'requset came form container 1')
  let isCSV = true

  try {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('error', () => {
        isCSV = false
      })
      .on('end', () => {
        if (isCSV) {
          console.log('csv dound')
          res
            .status(200)
            .json({ message: `File ${data.file} parsed successfully` })
        } else {
          res.status(400).json({ error: 'Invalid CSV file' })
        }
      })
  } catch (error) {
    res.status(500).json({ error: 'Error reading the file' })
  }
})

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`)
})
