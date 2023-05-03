const fs = require('fs');

const jsonExtract = (entry) => {
  fs.writeFileSync('./extract.json', JSON.stringify(entry, null, 2), (err) => {
    if(err) {
      console.log("Error occured");
      return;
    }
    console.log('Data written successfully to extract.json');
  })
}

module.exports = jsonExtract;