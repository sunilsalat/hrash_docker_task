const { error } = require('console')
const express = require('express')
const fs = require('fs')
const path = require('path')
// const csv = require('csv-parser')
const PORT = 8000

const app = express()
app.use(express.json())

app.get('/test', async res => {
  return res.status(200).json({ msg: 'Test passed' })
})

app.post('/result', async (req, res) => {
  const payload = req.body
  const filePath = path.join(__dirname, `../../data/${payload.file}`)
  // let isCSV = true
  let totalAmount = 0

  try {
    const data = fs.readFileSync(filePath, 'utf-8')

    if (!data) {
      return res
        .status(200)
        .json({ file: payload.file, error: 'Input file not in CSV format.' })
    }

    const lines = data.split('\n')
    const headers = lines[0].split(',')
    const parsedData = lines.slice(1).map(line => {
      const fields = line.split(',')
      let obj = {}
      headers.forEach((header, index) => {
        obj[header.trim()] = fields[index].trim()
      })
      return obj
    })

    if (parsedData.length === 0) {
      return res
        .status(200)
        .json({ file: payload.file, error: 'Input file not in CSV format.' })
    }

    for (let i = 0; i < parsedData.length; i++) {
      console.log(parsedData[i])
      let { product, amount } = parsedData[i]
      console.log(product, amount)
      if (product.toLowerCase() == payload.product.toLowerCase()) {
        totalAmount += Number(amount)
      }
    }

    // fs.createReadStream(filePath)
    //   .pipe(csv())
    //   .on('error', () => {
    //     isCSV = false
    //   })
    //   .on('end', () => {
    //     if (isCSV) {
    //       console.log('csv dound')
    //       res
    //         .status(200)
    //         .json({ message: `File ${data.file} parsed successfully` })
    //     } else {
    //       res.status(400).json({ error: 'Invalid CSV file' })
    //     }
    //   })

    return res.status(200).json({
      file: `${payload.file}`,
      sum: totalAmount
    })
  } catch (error) {
    res
      .status(200)
      .json({ file: `${payload.file}`, error: 'Input file not in CSV format.' })
  }
})

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`)
})
