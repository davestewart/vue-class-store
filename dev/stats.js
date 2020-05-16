const { exec } = require('child_process')
const fs = require('fs')

const path = 'src/demo/examples'
const folders = fs.readdirSync(path)

folders.forEach(folder => {
  const command = `node_modules/.bin/sloc ${path}/${folder} --details --format cli-table --keys total,source,comment`
  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error(err)
    } else {
      console.log(stdout)
    }
  })
})
