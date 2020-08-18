var sh = require('shelljs');

const currentLoc = sh.pwd();
const mkv = sh.ls("*.mkv");

const downloadSub = () => {
    const video = sh.ls('.').filter(function(file) { return file.match(/\.(mkv|avi|mp4)$/); });
    if (!video) return sh.echo('There is no other video files!');
    console.log(video);
    video.forEach(vid=>{
        sh.exec(`${__dirname}/OpenSubtitlesDownload.py --cli --auto --lang pol ${vid}`, {async: true});
    });
}

sh.echo('Current localization: ', currentLoc);

if (!mkv.stdout) downloadSub();

sh.echo('Find files: ', mkv);

mkv.forEach(file => {
    const child = sh.exec(`mkvmerge -J ${file}`, { silent:true, async: true });
    child.stdout.on('data', function (data) {
        const json = JSON.parse(data);
        const track = json.tracks.filter(el => el.properties.language == 'pol');
        if (!track.length) {
            sh.echo('There is no POL subtitles in .mkv!');
            sh.echo('Trying download from OpenSubtitles...');
            downloadSub();
            return;
        } else {
            sh.echo('Track: ', track);
            sh.exec(`mkvextract tracks ${file} ${track[0].id}:${json.file_name.replace(/.mkv/,'')}.srt`, (code, stdout, stderr) =>{
                sh.echo('Code: ', code);
                sh.echo('Out: ', stdout);
                sh.echo('Err: ', stderr);
            });
        }
    });
});