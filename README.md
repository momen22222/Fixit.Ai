# Women's Health App

This folder contains the new web app version of the women's health product so you can build and test it on Windows.

## What is here

- `src/app/page.tsx`: the first mobile-first product landing page
- `src/app/layout.tsx`: root layout and fonts
- `src/app/globals.css`: visual system and responsive styling
- `package.json`: Next.js app scripts and dependencies

## Before you run it

This environment does not currently have Node.js installed, so I scaffolded the project files by hand.

Install Node.js 20.9 or later on your Windows machine, then run:

```powershell
cd "C:\Users\Admin\Documents\New project\womens health app"
npm install
npm run dev
```

Then open:

```text
http://localhost:3000
```

## What to test first

- Is the overall style right for a women-centered health product?
- Does the onboarding flow ask the right personalization questions?
- Do the in-app pages feel clear and useful enough to keep building?
- Which area should get the most depth next: dashboard, nutrition, workouts, or AI coach?

## Current routes

- `/`: marketing entry
- `/onboarding`: first-run setup flow
- `/app/dashboard`: daily personalized dashboard
- `/app/nutrition`: food guidance
- `/app/workouts`: movement planning
- `/app/coach`: AI coach experience

## Best next build options

1. Make onboarding interactive and save responses
2. Add real charts, check-ins, and daily tracking to the dashboard
3. Expand nutrition into meal planning and grocery support
4. Turn the AI coach into a true chat workflow
