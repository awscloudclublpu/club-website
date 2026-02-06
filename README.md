# Horizon

Official landing page for **Horizon** – A flagship overnight technical event series organized by AWS Cloud Club at Lovely Professional University.

## About the Event

**Horizon** is a unique blend of hands-on workshops, an overnight hackathon, and a competitive Capture The Flag (CTF) challenge. Designed for students and tech enthusiasts of all skill levels, Horizon promotes learning, innovation, and collaboration through real-world problem statements and immersive experiences.

### Event Highlights

- **Hands-On Learning**: Workshops and guided sessions led by industry professionals
- **Overnight Hackathon**: Build innovative solutions in an intensive overnight challenge
- **Capture The Flag (CTF)**: Compete in real-world cybersecurity scenarios
- **Team Collaboration**: Work in teams to brainstorm, build, and solve technical problems
- **AWS-Powered Experience**: Explore cloud computing and security with AWS technologies
- **Networking**: Connect with 900+ active members and industry experts

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Font**: Custom Hacker.ttf
- **Icons**: Font Awesome 6.5.1
- **Theme**: Red & Black Cybersecurity Aesthetic


## Prerequisites

- Node.js 18.x or higher
- npm, yarn, pnpm, or bun


## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/awscloudclublpu/horizon_frontend.git
   cd horizon_frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

5. **Build for production**
   ```bash
   npm run build
   npm start
   ```


## Project Structure

```
horizon_frontend/
├── app/
│   ├── globals.css          # Global styles & animations
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Main landing page
│   └── auth/                # Other pages as per requirement
├── components/
│   ├── Navigation.tsx       # Header navigation
│   └── ui/                  # UI Components
├── public/
│   ├── font/
│   │   └── Hacker.ttf       # Custom hacker font
│   ├── image/
│   │   └── logo/
│   └── video/
│       └── background.mp4   # Hero background video
└── lib/
   └── utils.ts
```

## Contact

- **Email**: club@awslpu.in
- **Website**: [awslpu.in](https://awslpu.in)
- **Social Media**: Follow AWS Cloud Club LPU on [LinkedIn](https://www.linkedin.com/company/aws-cloud-community-lpu), [Instagram](https://instagram.com/awscloudcommunity.lpu)


## License

© Horizon. All rights reserved. Powered by AWS Cloud Club LPU.

---

**Ready to learn, build, and compete?** Join us for an unforgettable overnight experience at Horizon! 🔴⚫
