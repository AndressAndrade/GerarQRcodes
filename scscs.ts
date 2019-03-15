import * as QRCode from 'qrcode';
import * as text2png from 'text2png';
import * as fs from 'fs';
import * as temp from 'fs-temp/promise';
import * as Jimp from 'jimp';
import * as archiver from 'archiver';

let files = '/tmp/qrcode';
let texto = '/tmp/texto.png';

let output = fs.createWriteStream(__dirname + '/example.zip');
let archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
});

// listen for all archive data to be written
// 'close' event is fired only when a file descriptor is involved
output.on('close', function() {
    console.log(archive.pointer() + ' total bytes');
    console.log(
        'archiver has been finalized and the output file descriptor has closed.'
    );
});

// This event is fired when the data source is drained no matter what was the data source.
// It is not part of this library but rather from the NodeJS Stream API.
// @see: https://nodejs.org/api/stream.html#stream_event_end
output.on('end', function() {
    console.log('Data has been drained');
});

// good practice to catch warnings (ie stat failures and other non-blocking errors)
archive.on('warning', function(err) {
    if (err.code === 'ENOENT') {
        // log warning
    } else {
        // throw error
        throw err;
    }
});

// good practice to catch this error explicitly
archive.on('error', function(err) {
    throw err;
});

// pipe archive data to the file
archive.pipe(output);

for (let i = 0; i < 4; i++) {
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
        text2png('2Vz5d', {
            font: '160px FiraMono',
            localFontPath: 'font/FiraMono-Regular.ttf',
            localFontName: 'FiraMono',
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
                    })

                    //catch errors
                    .catch(err => {
                        console.error(err);
                    })
            );
    });

    let indiceName = 'out_' + i + '.png';
    // append a file
    archive.file('tmp/out.png', { name: indiceName });
}

archive.finalize();
