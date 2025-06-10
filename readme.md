# Frontend code challenge

This is a WebRTC showcase project which shows real-time video streaming & recording
with possibility of applying filters to the input stream.

## Setup

To run the project in dev mode, you need to execute these commands:

- ``npm i``
- ``npm run build``
- ``npm run dev``

Otherwise, just open ``dist/index.html`` in the browser.

## Technical decisions & architecture

Project is a vanilla TS/SCSS implementation with [Vite](https://vite.dev/) used for project
building and live reload.

Project structure:

- ``Camera`` is a class responsible for camera initialization
- ``FilterManager`` is a class responsible for loading filters and is called from within
  ``Camera`` to separate filtering logic. Manager subsequently calls upon filters from
  ``/filters`` directory to have a clear separation of concerns

Filters are implemented for the most part as a pixel manipulation algorithm due to its
simplicity. Only exception is ``Blur`` which has a horrible performance using such approach,
so that part is done using WebGL instead.

My initial idea was to have checkboxes for each of the filters, however those became obsolete
when sliders were implemented, so I got rid of them completely. To turn on a filter, it is
enough to increase the slider above 0.

## Known Limitations & Browser Compatibility Notes

Minimum browser versions required:

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+
