# Welcome to Bank App(WIP)👋
This is a demo project for a banking application.  
It includes:  
- A **mobile app** built with **Expo (React Native)**  
- A **backend** built with **Deno** and **PostgreSQL** powered by docker
  
⚠️ ⚠️ ⚠️  **This app required backend for running, please check the /backend/readme.md to setup backend**⚠️ ⚠️ ⚠️ 

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. clone .env.example to .env and update it(if needed)
```bash
cp .env.example .env
```

3. Start the app

   ```bash
   npx expo start

   or 

   npm run android
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Feature List

### ✅ Completed Features

**Authentication & Security**
- User login
- Biometric authentication setup (Face ID / Touch ID / Fingerprint)
- Biometric authentication for payment transfers
- Password fallback for devices without biometric capabilities
- JWT token-based authentication
- Secure token storage

**Account Management**
- Account overview and balance display
- Multiple account support
- Account selection for transfers
- Real-time balance updates after transfers

**Payment Transfer System**
- User-friendly transfer interface
- Recipient selection via contacts or manual input
- Amount input with quick selection options
- Optional transfer notes
- Balance validation and insufficient funds handling
- Transfer via DuitNow or bank account
- Transaction processing with API simulation
- Transfer confirmation screens
- Error handling for various scenarios

**Contact Integration**
- Access to device contact list
- Contact selection for quick transfers
- Recent transfer history per contact
- Auto-fill amounts from previous transfers

**Transaction History**
- Transaction listing and filtering
- Transfer status tracking
- Transaction details display

### 🔄 In Progress / Todo Features

**User Features**
- User Registration
- Account creation

**Enhanced Features**
- Push notifications for transactions
- Multi-currency support
- Scheduled/recurring transfers
- Transfer templates for frequent recipients

**UI/UX Improvements**
- Dark mode support
- Enhanced accessibility features
- Improved error handling and user feedback
- Loading states and animations

**Testing & Quality**
- Unit and integration tests
- End-to-end testing
- Performance testing
- Security audit and penetration testing
