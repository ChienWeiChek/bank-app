# Welcome to Bank App(WIP)👋
This is a demo project for a banking application.  
It includes:  
- A **mobile app** built with **Expo (React Native)**  
- A **backend** built with **Deno** and **PostgreSQL** powered by docker
  
⚠️⚠️**This app required backend for running, please check the /backend/readme.md to setup backend** ⚠️⚠️

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

## DEMO Video

Demo videos showcasing the app features can be found in the `demo/` directory:
 
- `first_login.mp4` - Initial login process

https://github.com/user-attachments/assets/5fe81c98-ce17-4cc8-a3e6-e3621de51425

- `view_demo.mp4` - General app overview and features

https://github.com/user-attachments/assets/81ee8a86-1a56-4837-ac9e-818dc3baa44e

- `biometric_login.mp4` - Biometric authentication for login

https://github.com/user-attachments/assets/cb0fabcb-5f73-465c-b506-8f93bb461441

- `setup_biometric.mp4` - Biometric authentication setup

https://github.com/user-attachments/assets/06475014-a932-43a9-82b4-769867e97daa

- `contact_list_transfer.mp4` - Transfer using contact list

https://github.com/user-attachments/assets/e6b4f6b3-0f5c-435e-84e2-4d648e2ae147

- `password_transfer.mp4` - Password-based transfer authentication

https://github.com/user-attachments/assets/e26b7358-1ff0-4de2-ae3a-ef5ebde12e05

- `save_last_transfer_in_contact.mp4` - Saving last transfer amounts per contact
  
https://github.com/user-attachments/assets/9b8ab0f7-8e15-4882-8694-da50f46b80db

- `history_list_infinite_scroll.mp4` - Transaction history with infinite scroll

https://github.com/user-attachments/assets/9d79335a-43a0-40e2-8a3d-f14e803378f8
  
- `history_list_switch_tab.mp4` - Switching between history tabs

https://github.com/user-attachments/assets/02b0d5b8-b7f5-42ad-9e4f-ae43bb85760d

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
