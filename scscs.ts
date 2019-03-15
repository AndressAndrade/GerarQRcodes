import * as QRCode from 'qrcode';
import * as text2png from 'text2png';
import * as fs from 'fs';
import * as temp from 'fs-temp/promise';
import * as Zip from 'node-zip';
import * as Jimp from 'jimp';

let files = '/tmp/qrcode';
let texto = './texto.png';
let zip = new Zip();

QRCode.toFile(
    files,
    'Some text',
    {
        scale: 1,
        width: 600
    },

    function(err) {
        if (err) throw err;
        console.log('done');
    }
);

temp.writeFile(
    text2png('1Ed6s', {
        font: '160px Futura',
        color: 'black',
        backgroundColor: 'white',
        lineSpacing: 10,
        paddingBottom: 50,
        paddingTop: 600,
        paddingLeft: 150,
        paddingRight: 150
    })
).then(path => {
    // `path` now holds the path to a file with the specified `data`
    Jimp.read(path)

        //combine logo into image
        .then(tpl =>
            Jimp.read(files)
                .then(logoTpl => {
                    return tpl.composite(logoTpl, 100, 2);
                })

                //export image
                .then(tpl => {
                    tpl.quality(100).write('tmp/out.png');
                    //zip.file('ousdt', tpl['data']);
                    console.log(Jimp['data']);
                })

                //catch errors
                .catch(err => {
                    console.error(err);
                })
        );
});

//dsssssssssssssssssssssssssssssss

//read template & clone raw image

// const data = zip.generate({ base64: false, compression: 'DEFLATE' });
// fs.writeFileSync('test.zip', data, 'binary');
