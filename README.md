# ![Logo](./assets/img/logo.png) Pinger

**Check if your systems are reachable.**

Pinger make a simple ICMP request that check if your systems are reachable or not and notify you only at first time that your sistem is offline or online.

## How to

To clone and run this repository you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer. From your command line:

```bash
# Clone this repository
git clone https://github.com/git-yuritancredi/Pinger
# Go into the repository
cd Pinger
# Install dependencies
npm install
# Run the app
npm start
```

#### Portable app (All platforms)

If you use a Mac and want to export for other OS, you must install [wine](https://wiki.winehq.org/MacOS) for build portable app

```bash
# Clone this repository
git clone https://github.com/git-yuritancredi/Pinger
# Go into the repository
cd Pinger
# Install dependencies
npm install

# Build app only Linux
npm run-script build-lnx

# Build app only Mac
npm run-script build-mac

# Build app only Windows
npm run-script build-win

# Build app for all platforms
npm run-script build-all
```