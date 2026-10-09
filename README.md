# MY DAILYPULS APPLICATION

DailyPulse is a calm, offline-first mobile app for planning today, building
small habits, checking in with your mood, learning one useful idea, and
reflecting without pressure.

## What it includes

- A daily focus list with task editing, completion, time, priority, and deletion
- Flexible habits with daily, weekday, or weekly schedules
- Private mood check-ins and a transparent Day Score
- A monthly calendar and simple weekly progress view
- One short learning card each day, with save and learned states
- Optional daily device reminders
- Light, dark, or system appearance
- Local reflections, with a control to clear all saved data

All personal data is stored on the device with AsyncStorage. The app does not
need an account, server, or internet connection for its core features. The
optional reminder is a local device notification and is off until enabled.

## Run the app

Requirements:

- Node.js 20.19.4 or newer
- npm
- Expo Go on an iOS or Android device

On Windows, run `install-dependencies.bat` from the project folder. On macOS or
Linux, run:

```sh
npm install
npm start
```

Open the QR code in Expo Go to use the app on a phone. `npm run typecheck`
checks the TypeScript source.

## Privacy and reminders

Tasks, habits, moods, reflections, appearance, and reminder settings stay on
the device. Clearing app data removes them. Daily reminders require notification
permission on iOS or Android and can be turned off in Settings.
