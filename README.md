# StudyPad Web

A modern, self-hosted AI learning platform frontend built with Next.js 14, designed for businesses and organizations that need to keep their data private while leveraging AI capabilities.

## 📦 Related Repositories

- **Backend API**: [studypad-backend](https://github.com/qvidal01/studypadlm) - Python FastAPI backend
- **Mobile App**: [studypad-mobile](https://github.com/qvidal01/studypad-mobile) - Flutter iOS/Android app
- **API Documentation**: See backend repo's [API_ENDPOINTS.md](https://github.com/qvidal01/studypadlm/blob/main/API_ENDPOINTS.md)

## 🌟 Features

- **Document Management**: Upload and manage PDF documents with drag-and-drop support
- **AI-Powered Chat**: Ask questions about your documents with RAG (Retrieval-Augmented Generation)
- **Studio Features**: Generate audio, video, briefings, and study guides from your documents
- **Source Citations**: See which parts of your documents were used to answer questions
- **Offline-First**: Designed to work with self-hosted LLMs and embedding models
- **Modern UI**: Beautiful, responsive interface built with shadcn/ui components

## 🛠️ Tech Stack

### Core
- **Next.js 14** (App Router) - React framework with server components
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality, accessible component library

### State Management
- **Zustand** - Lightweight state management for chat and studio features
- **Tanstack Query** - Server state management with caching and automatic refetching

### API & Forms
- **Axios** - HTTP client for API calls
- **React Hook Form** - Performant form handling
- **Zod** - Schema validation

### Utilities
- **date-fns** - Date formatting
- **lucide-react** - Beautiful icons
- **sonner** - Toast notifications

## 📁 Project Structure

```
frontend-next/
├── app/                    # Next.js 14 app directory
│   ├── page.tsx           # Chat interface (home page)
│   ├── upload/            # Document upload page
│   ├── documents/         # Document management page
│   ├── studio/            # Content generation studio
│   └── layout.tsx         # Root layout with providers
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── features/          # Feature-specific components
│   └── shared/            # Shared components (Navigation, AppLayout)
├── lib/
│   ├── api/               # API client and React Query provider
│   └── utils.ts           # Utility functions
├── hooks/                 # Custom React hooks
│   └── use-documents.ts   # Document query hooks
├── stores/                # Zustand stores
│   ├── chat-store.ts      # Chat state management
│   └── studio-store.ts    # Studio job management
├── types/                 # TypeScript type definitions
│   ├── api.ts             # API response types
│   └── index.ts           # Frontend types
└── .env.local             # Environment variables
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running (see main project README)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_APP_NAME=StudyPad
   NEXT_PUBLIC_MAX_UPLOAD_SIZE=10485760
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## 📖 Usage

### 1. Upload Documents

- Navigate to the **Upload** page
- Drag and drop PDF files or click to browse
- Wait for processing to complete
- Documents are automatically chunked and embedded

### 2. Chat with Documents

- Go to the **Chat** page
- Type your question in the input box
- Press Enter to send (Shift+Enter for new line)
- View AI-generated answers with source citations

### 3. Manage Documents

- Visit the **Documents** page
- View all uploaded documents with metadata
- Delete documents you no longer need

### 4. Generate Content (Studio)

- Open the **Studio** page
- Select a document from the dropdown
- Choose a generation type:
  - **Audio**: Create audio summaries or podcasts
  - **Video**: Generate video presentations
  - **Briefing**: Create concise briefing documents
  - **Study Guide**: Generate comprehensive study materials
- View generation history and download results

## 🔧 Configuration

### API Client

The API client is configured in `lib/api/client.ts`:

```typescript
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 60000,
});
```

### State Management

**Zustand Stores:**
- `chat-store.ts` - Manages chat messages and current document
- `studio-store.ts` - Tracks content generation jobs

**React Query:**
- Configured in `lib/api/query-provider.tsx`
- Automatic refetching and caching
- Custom hooks in `hooks/use-documents.ts`

## 🎨 Customization

### Adding New Components

1. **shadcn/ui components:**
   ```bash
   npx shadcn@latest add [component-name]
   ```

2. **Custom components:**
   - Place in `components/features/` for feature-specific components
   - Place in `components/shared/` for reusable components

### Theming

Edit `app/globals.css` to customize the color scheme:

```css
@layer base {
  :root {
    --primary: 222.2 47.4% 11.2%;
    --secondary: 210 40% 96.1%;
    /* ... more variables */
  }
}
```

## 🔌 API Integration

### Backend Endpoints

The frontend expects these API endpoints:

- `POST /api/v1/upload` - Upload document
- `GET /api/v1/documents` - List documents
- `DELETE /api/v1/documents/:id` - Delete document
- `POST /api/v1/query` - Query documents
- `POST /api/v1/studio` - Generate content

### Adding New API Methods

1. Add types to `types/api.ts`
2. Add method to `lib/api/client.ts`
3. Create custom hook in `hooks/`
4. Use in components

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Commit with descriptive messages:**
   ```bash
   git commit -m "Add amazing feature"
   ```
5. **Push to your branch:**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### Contribution Guidelines

- Follow TypeScript best practices
- Use shadcn/ui components when possible
- Write meaningful commit messages
- Update documentation for new features
- Test your changes thoroughly

## 📝 Development Tips

### Hot Module Replacement

Next.js 14 with Turbopack provides fast HMR. Changes are reflected instantly.

### Type Safety

Always define TypeScript types for:
- API responses (`types/api.ts`)
- Component props
- Store state (`stores/`)

### Code Organization

- Keep components small and focused
- Use custom hooks for reusable logic
- Separate business logic from UI components
- Use TypeScript strict mode

## 🐛 Troubleshooting

### Common Issues

**Port already in use:**
```bash
kill -9 $(lsof -ti:3000)
npm run dev
```

**API connection errors:**
- Ensure backend is running on the configured port
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Verify CORS is enabled on the backend

**Build errors:**
```bash
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [TailwindCSS](https://tailwindcss.com/docs)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [Tanstack Query](https://tanstack.com/query/latest)

## 📄 License

This project is part of StudyPad. See the main repository for license information.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Inspired by NotebookLM

---

**Made with ❤️ for open-source and privacy-focused AI learning**
