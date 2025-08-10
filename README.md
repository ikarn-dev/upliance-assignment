# Upliance Assignment - Dynamic Form Builder

A powerful, intuitive dynamic form builder application built with React, TypeScript, and Material-UI. Create, customize, and manage forms with advanced validation, drag-and-drop functionality, and real-time preview capabilities.


**DEMO**

<img width="1917" height="858" alt="1" src="https://github.com/user-attachments/assets/16f39a59-d0eb-4c1a-859f-bff8b4a7db30" />
<img width="1919" height="860" alt="2" src="https://github.com/user-attachments/assets/8a8bd20e-2d78-4abe-850b-9c11bc70a77c" />
<img width="1919" height="862" alt="3" src="https://github.com/user-attachments/assets/f445b5b2-9a93-4fde-86ce-0672476d954f" />
<img width="1919" height="869" alt="4-1" src="https://github.com/user-attachments/assets/56b355a5-372a-4725-9c51-90b748390e8d" />
<img width="1919" height="860" alt="4-2" src="https://github.com/user-attachments/assets/8ff714d0-751c-457a-8c5d-68427607ed03" />
<img width="1905" height="863" alt="5-1" src="https://github.com/user-attachments/assets/9561789d-c515-4e6a-b6fa-fbaf735143a6" />
<img width="1915" height="860" alt="5-2" src="https://github.com/user-attachments/assets/37b604b7-3041-4d75-8828-84be6109996e" />
<img width="1916" height="860" alt="6" src="https://github.com/user-attachments/assets/12c2bef7-4a50-488f-90fc-3ea4ffb48c37" />


## 🚀 Features

### Core Functionality
- **Multiple Field Types**: Text, number, textarea, select, radio, checkbox, and date fields
- **Advanced Validation**: Built-in validation rules with custom error messages
- **Derived Fields**: Create calculated fields based on other field values
- **Real-time Preview**: Instant form preview with live validation feedback
- **Form Management**: Save, edit, and delete forms with local storage persistence

### User Experience
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Material-UI Components**: Modern, accessible interface with consistent styling
- **Error Handling**: Comprehensive error boundaries and user-friendly error messages
- **Loading States**: Visual feedback during operations
- **Notifications**: Toast notifications for user actions and system feedback

### Technical Features
- **TypeScript**: Full type safety and enhanced developer experience
- **Local Storage**: Persistent form storage without backend dependency
- **Routing**: Client-side routing with React Router v6
- **Testing**: Comprehensive test suite with Vitest and Testing Library
- **Performance**: Optimized rendering and efficient state management

## 🛠️ Tech Stack

- **Frontend Framework**: React 19.1.1
- **Language**: TypeScript 5.8.3
- **Build Tool**: Vite 7.1.0
- **UI Library**: Material-UI (MUI) 7.3.1
- **Routing**: React Router DOM 7.8.0
- **Drag & Drop**: @dnd-kit/core 6.3.1
- **Testing**: Vitest 3.2.4 + Testing Library
- **Linting**: ESLint 9.32.0

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (version 18.0.0 or higher)
- **npm** (version 8.0.0 or higher) or **yarn**

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone <repository-url>
cd dynamic-form-builder
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Start Development Server
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

### 4. Build for Production
```bash
npm run build
# or
yarn build
```

### 5. Preview Production Build
```bash
npm run preview
# or
yarn preview
```

## 📱 Application Structure

### Pages
- **Create Page** (`/create`): Main form builder interface
- **Preview Page** (`/preview`): Form testing and preview
- **My Forms Page** (`/myforms`): Saved forms management

### Key Components
- **FormBuilder**: Drag-and-drop form creation interface
- **FormPreview**: Real-time form preview with validation
- **FieldEditor**: Individual field configuration
- **ValidationEngine**: Advanced validation system
- **LocalStorageService**: Persistent data management

## 🎯 Usage Guide

### Creating a Form
1. Navigate to the **Create** page
2. Click **"Add Field"** to add form fields
3. Configure each field's properties:
   - Field type (text, number, select, etc.)
   - Label and placeholder text
   - Validation rules
   - Default values
4. Drag and drop to reorder fields
5. Save your form with a descriptive name

### Field Types Available
- **Text**: Single-line text input
- **Number**: Numeric input with validation
- **Textarea**: Multi-line text input
- **Select**: Dropdown selection
- **Radio**: Single choice from options
- **Checkbox**: Multiple selections
- **Date**: Date picker input

### Validation Rules
- **Required**: Field must have a value
- **Min/Max Length**: Character count limits
- **Email**: Valid email format
- **Custom Password**: Complex password requirements

### Derived Fields
Create calculated fields that automatically update based on other field values using JavaScript expressions.

### Form Management
- **Save Forms**: Store forms locally for future use
- **Edit Forms**: Modify existing form configurations
- **Delete Forms**: Remove unwanted forms
- **Preview Forms**: Test forms before deployment


### Run Tests
```bash
npm run test
# or
yarn test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
# or
yarn test:watch
```

### Run Tests with UI
```bash
npm run test:ui
# or
yarn test:ui
```

## 🔧 Development

### Code Quality
```bash
# Run linting
npm run lint
# or
yarn lint
```

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── FormBuilder/    # Form creation components
│   ├── FormPreview/    # Form preview components
│   ├── FormManager/    # Form management components
│   └── common/         # Shared components
├── contexts/           # React contexts for state management
├── hooks/              # Custom React hooks
├── pages/              # Main application pages
├── services/           # Business logic and utilities
├── types/              # TypeScript type definitions
├── theme/              # Material-UI theme configuration
└── utils/              # Helper functions
```

## 🌟 Key Features Explained

### Drag and Drop
Built with @dnd-kit for smooth, accessible drag-and-drop functionality. Reorder form fields intuitively.

### Validation Engine
Comprehensive validation system supporting:
- Built-in validation types
- Custom error messages
- Real-time validation feedback
- Enhanced error messages with suggestions

### Local Storage
Persistent form storage using browser localStorage with:
- Error handling for storage limitations
- Data corruption recovery
- Version management
- Storage quota monitoring

### Responsive Design
Mobile-first design approach ensuring optimal experience across all devices.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is part of the Upliance assignment and is intended for evaluation purposes.

## 🐛 Troubleshooting

### Common Issues

**Build Errors**: Ensure all dependencies are installed with `npm install`

**TypeScript Errors**: Check that your Node.js version is 18.0.0 or higher

**Storage Issues**: Clear browser localStorage if experiencing data corruption

**Performance Issues**: Check browser console for errors and ensure adequate system resources

