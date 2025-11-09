# CampusBite - Frontend-Only Campus Canteen Ordering System

A modern, responsive React.js frontend application for campus canteen ordering with separate interfaces for students and administrators. This is a **frontend-only** application that uses local data storage and simulated functionality.

## 🚀 Features

### Student Features
- **Menu Browsing**: Browse food items with images, descriptions, and prices
- **Shopping Cart**: Add items to cart with quantity controls
- **Order Management**: Set required pickup time and track order status
- **Payment Integration**: Secure payment processing (dummy implementation)
- **Order History**: View past orders and their status
- **Notifications**: Real-time order status updates
- **Multi-language Support**: English, Telugu, and Hindi

### Admin Features
- **Dashboard**: Overview of all orders with urgency indicators
- **Order Management**: Update order status and track progress
- **Menu Management**: Add, edit, and delete menu items
- **Analytics**: View popular items, peak hours, and revenue trends
- **Digital Receipts**: Generate PDF reports (placeholder)

### Technical Features
- **Frontend-Only**: No backend required - runs entirely in the browser
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Authentication**: Role-based access control (Student/Admin) using localStorage
- **State Management**: React Context for auth, cart, and language
- **Local Data Storage**: All data stored in browser localStorage
- **Animations**: Smooth transitions and loading states
- **Multi-language Support**: English, Telugu, and Hindi

## 🛠️ Tech Stack

- **Frontend**: React.js 18
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **State Management**: React Context API
- **Build Tool**: Create React App

## 📁 Project Structure

```
src/
├── components/          # Shared components
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   ├── Button.jsx
│   ├── Modal.jsx
│   ├── LoadingSpinner.jsx
│   └── LanguageSelector.jsx
├── contexts/           # React Context providers
│   ├── AuthContext.jsx
│   ├── CartContext.jsx
│   └── LanguageContext.jsx
├── student/            # Student-specific pages
│   ├── MenuPage.jsx
│   ├── CartPage.jsx
│   ├── OrdersPage.jsx
│   └── NotificationsPage.jsx
├── admin/              # Admin-specific pages
│   ├── DashboardPage.jsx
│   ├── MenuManagementPage.jsx
│   └── AnalyticsPage.jsx
├── pages/              # General pages
│   └── Login.jsx
├── utils/              # Utility functions
│   ├── api.js          # Dummy API layer
│   ├── helpers.js      # Helper functions
│   └── languages.js    # Multi-language support
├── data/               # Dummy data
│   └── dummyData.js
└── App.js              # Main app component
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd campusbite-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔐 Demo Credentials

### Student Login
- **Email**: `student@hitam.org`
- **Password**: `password123`

### Admin Login
- **Email**: `admin@hitam.org`
- **Password**: `password123`

## 📱 Usage

### For Students
1. **Login** with student credentials
2. **Browse Menu** to see available food items
3. **Add to Cart** with desired quantities
4. **Set Required Time** for pickup
5. **Proceed to Payment** (dummy payment)
6. **Track Orders** in order history
7. **Receive Notifications** for status updates

### For Admins
1. **Login** with admin credentials
2. **View Dashboard** for order overview
3. **Update Order Status** as orders progress
4. **Manage Menu** items (add/edit/delete)
5. **View Analytics** for business insights
6. **Generate Reports** (placeholder)

## 🌐 Multi-language Support

The application supports three languages:
- **English** (en) - Default
- **Telugu** (te) - తెలుగు
- **Hindi** (hi) - हिन्दी

Language can be changed using the language selector in the navbar.

## 🔧 Data Management

The application uses local data management (`src/utils/api.js`) that works entirely in the browser:

- **Menu Items**: Stored in `src/data/dummyData.js`
- **Orders**: Managed in memory and localStorage
- **Authentication**: Uses browser localStorage
- **No Backend Required**: Everything runs client-side

### Data Structure
```javascript
// Menu items are stored in dummyData.js
export const menuItems = [
  {
    id: 1,
    name: "Chicken Biryani",
    description: "Fragrant basmati rice...",
    price: 120,
    category: "Main Course",
    // ... other properties
  }
];

// API functions provide direct access
export const menuAPI = {
  getMenuItems: () => menuItems,
  addMenuItem: (itemData) => { /* add logic */ },
  // ... other functions
};
```

## 🎨 Customization

### Styling
- Modify `tailwind.config.js` for theme customization
- Update `src/index.css` for global styles
- Component-specific styles use Tailwind classes

### Adding New Features
1. **Create components** in appropriate folders
2. **Add routes** in `App.js`
3. **Update navigation** in `Navbar.jsx`
4. **Add translations** in `languages.js`

## 📦 Build for Production

```bash
npm run build
```

This creates a `build` folder with optimized production files.

## 🧪 Testing

```bash
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔮 Future Enhancements

- [ ] Backend integration (Firebase/Node.js/Express)
- [ ] Real database (MongoDB/PostgreSQL)
- [ ] Push notifications
- [ ] Real payment gateway integration
- [ ] Advanced analytics and reporting
- [ ] Inventory management
- [ ] Staff management
- [ ] Customer reviews and ratings
- [ ] Loyalty program
- [ ] Mobile app (React Native)
- [ ] PWA (Progressive Web App) features

## 📞 Support

For support or questions, please contact:
- **Email**: support@campusbite.com
- **Documentation**: [Project Wiki](link-to-wiki)

---

**CampusBite** - Making campus dining simple and efficient! 🍽️