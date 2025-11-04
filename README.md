# Synapse Portfolio

A modern, AI-powered personal portfolio application built with Next.js, Firebase, and Google's Genkit AI. This portfolio showcases projects, experience, and skills while featuring an intelligent resume pitch generator and job application tracker.

## 🚀 Features

### Core Portfolio Features
- **Personal Introduction**: Dynamic personal information display with contact links
- **Project Showcase**: Interactive project gallery with tech stack visualization
- **Experience Timeline**: Professional and educational background with timeline view
- **Skills Dashboard**: Categorized skills with proficiency levels and visual indicators
- **Contact Integration**: Multiple social media and professional platform links

### AI-Powered Features
- **Resume Pitch Generator**: AI-generated resume summaries tailored for different specializations
- **Job Application Tracker**: Smart application management with AI-powered matching scores
- **Tailored Resume Generation**: Automatically generates resumes optimized for specific job descriptions
- **Cover Letter Generation**: AI-created cover letters matching job requirements
- **Skills Gap Analysis**: Identifies matching and lacking skills for job applications

### Admin Features
- **Admin Mode**: Toggle between public and admin views
- **Networking Section**: Professional networking contact management
- **Real-time Data Management**: Firebase-powered data persistence
- **Authentication**: Google OAuth integration

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.2.3** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **React Hook Form** - Form management
- **Recharts** - Data visualization

### Backend & AI
- **Firebase** - Backend-as-a-Service
  - Authentication (Google OAuth)
  - Firestore Database
  - Hosting
- **Google Genkit** - AI framework
- **Gemini 2.0 Flash** - Large Language Model
- **React Query** - Server state management

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Turbopack** - Fast bundler (dev mode)

## 📁 Project Structure

```
src/
├── ai/                     # AI integration and flows
│   ├── flows/             # Genkit AI flows
│   ├── schemas/           # AI data schemas
│   ├── genkit.ts          # AI configuration
│   └── dev.ts             # Development AI server
├── app/                   # Next.js App Router
│   ├── application-tracker/ # Job application tracking
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── admin/             # Admin-only components
│   ├── home/              # Portfolio sections
│   ├── layout/            # Layout components
│   └── ui/                # Reusable UI components
├── context/               # React Context providers
├── data/                  # Static data and types
├── firebase/              # Firebase utilities
├── hooks/                 # Custom React hooks
└── lib/                   # Utility functions
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Firebase project with Firestore enabled
- Google AI API key for Genkit

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd synapse-portfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Update `src/lib/firebase.ts` with your Firebase config
   - Ensure Firestore rules are deployed from `firestore.rules`

4. **Set up AI integration**
   - Configure Google AI API key for Genkit
   - Update `src/ai/genkit.ts` if needed

5. **Start development servers**
   ```bash
   # Start Next.js development server
   npm run dev

   # Start AI development server (separate terminal)
   npm run genkit:dev
   ```

6. **Access the application**
   - Portfolio: http://localhost:9002
   - AI Dashboard: http://localhost:4000 (Genkit dev UI)

## 🎨 Customization

### Personal Data
Update your personal information in `src/data/portfolio-data.ts`:
- Personal info and contact details
- Projects with descriptions and tech stacks
- Work and education experience
- Skills organized by categories
- Resume summaries for different specializations

### Styling
The application uses a professional color scheme:
- **Primary**: Dark navy blue (#24292F)
- **Secondary**: Light gray (#E5E5E5)
- **Accent**: Soft orange gradient (#FFA07A to #FFDAB9)

Customize colors in `tailwind.config.ts` and component styles.

### AI Behavior
Modify AI flows in `src/ai/flows/` to customize:
- Resume generation logic
- Cover letter templates
- Skills matching algorithms
- Job description analysis

## 🔐 Security & Privacy

### Firestore Security Rules
```javascript
// Users can only access their own data
match /users/{userId} {
  allow read, write: if request.auth.uid == userId;
  
  match /applications/{applicationId} {
    allow read, write: if request.auth.uid == userId;
  }
}
```

### Data Protection
- All user data is scoped to authenticated users
- No PII is sent to AI models without user consent
- Firebase handles authentication and data encryption

## 📱 Responsive Design

The portfolio is fully responsive with:
- Mobile-first design approach
- Smooth scrolling navigation
- Touch-friendly interactions
- Optimized images and performance

## 🚀 Deployment

### Firebase Hosting
```bash
# Build the application
npm run build

# Deploy to Firebase
firebase deploy
```

### Environment Variables
Set up the following in your deployment environment:
- Firebase configuration
- Google AI API keys
- Any custom environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Firebase](https://firebase.google.com/)
- AI capabilities by [Google Genkit](https://firebase.google.com/docs/genkit)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Icons by [Lucide](https://lucide.dev/)
