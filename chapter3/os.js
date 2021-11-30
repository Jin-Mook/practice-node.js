import * as os from 'os'
import * as path from 'path'
console.log(os.arch())
console.log(os.hostname())
console.log(os.homedir())

console.log(path.sep)
console.log(path.dirname("nodejs-textbook"))
console.log(path.parse("nodejs-textbook"))