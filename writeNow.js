
const fs = require('fs');

let size = 172002560
// open the file in writing mode, adding a callback function where we do the actual writing
createFile(size)
//writeParts();
function createFile(size){
    let pwr = 10485760;
    let path = 'file.tst'
    let toLimit = Math.ceil(size / pwr)
    console.log(toLimit);
    fs.truncate(path, 0, function(){
        let finished = 0;
        const BinaryFile = require('binary-file');
        const myBinaryFile = new BinaryFile('file.tst', 'w+');
        myBinaryFile.open().then(function () {
            for (var index = 0; index < toLimit + 1; index++) {
                if (finished >= parseInt(size)){
                    myBinaryFile.close();
                    console.log("sync done")
                    break;
                }else{
                    
                    myBinaryFile.write(new Buffer(pwr), pwr * index)
                    console.log('File written');
                    finished+= pwr;
                    
                        
                }
            }
            
        });
    })

}

function writeParts(){
    var buf = new Buffer("50");
    let path = 'file.tst'
//     const BinaryFile = require('binary-file');
    
//    const myBinaryFile = new BinaryFile(path, 'r');
//     myBinaryFile.write(buf, 10)
    const BinaryFile = require('binary-file');

    const myBinaryFile = new BinaryFile('file.tst', 'r+');
    myBinaryFile.open().then(function () {
        myBinaryFile.write(buf, 180)
        console.log('File opened');
    });
}