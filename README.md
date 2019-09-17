# Sonification of Income Inequality on the NYC Subway

A web app for kiosk display of videos generated from [this repository](https://github.com/beefoo/subway-inequality).

## To Run

This must be run on some kind of web server (i.e. not from a file path like `file://...`) due to [CORS policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS/Errors/CORSRequestNotHttp) for streaming audio from non-http protocol. This repository includes an express server using [Node.js](https://nodejs.org/en/)

```
npm install
node server.js 1234
```

Will make the app available at [localhost:1234](http://localhost:1234).

## Notes

Some technical and usability notes.

- You must click anywhere to start playing. This is because most browsers [require user interaction before it plays audio](https://developers.google.com/web/updates/2017/09/autoplay-policy-changes); autoplaying the videos may result in muted videos.
- Only works on browsers that [support WebM](https://caniuse.com/#feat=webm) video format (the latest Chrome, Firefox, Android Browser should work).  I encoded the videos in [WebM](https://www.webmproject.org/) format because it works better with browsers.
- It is designed to be viewed full-screen on a screen with a 16:9 ratio (the videos are 3840 × 2160)
