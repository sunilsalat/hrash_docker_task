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

app.post('/result', async (req, res) => {
  const payload = req.body;
  const filePath = path.join(__dirname, `../../data/${payload.file}`);
  let isCSV = true;
  let result = 0 

  const readStream = fs.createReadStream(filePath, { encoding: 'utf8' });
  readStream.on('error', (err) => {
    console.error('Error reading file:', err);
    res.status(500).json({ error: 'Error reading the file' });
  });

   readStream.pipe(csv())
    .on('error', (err) => {
      console.error('Error parsing CSV:', err);
      isCSV = false;
    })
    .on("data", (data)=>{
      const trimmedData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key.trim(), value])
      );
      if(trimmedData.product && trimmedData.amount){
        if(trimmedData.product.toLowerCase()===payload.product.trim().toLowerCase()){
          // result.push({product:trimmedData.product, amount:Number(trimmedData.amount)})
          result += Number(trimmedData.amount)
        }
      }
    })
    .on('end', () => {
      if (isCSV && result) {
        console.log('CSV found');
        return res.status(200).json({ message: `File ${payload.file} parsed successfully`, result });
      } else {
        console.error('Invalid CSV file');
        return res.status(400).json({ error: 'Invalid CSV file' });
      }
    });

});


app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`)
})
