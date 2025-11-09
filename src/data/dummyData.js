// Dummy data for CampusBite platform
export const menuItems = [
  {
    id: 1,
    name: "Chicken Biryani",
    description: "Fragrant basmati rice cooked with tender chicken pieces and aromatic spices",
    price: 120,
    category: "Main Course",
    image: "https://images.unsplash.com/photo-1599043513900-ed6fe01d3833?w=400&h=300&fit=crop",
    available: true,
    preparationTime: 15
  },
  {
    id: 2,
    name: "Paneer Butter Masala",
    description: "Soft paneer cubes in rich tomato and cream gravy",
    price: 100,
    category: "Main Course",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop",
    available: true,
    preparationTime: 12
  },
  {
    id: 3,
    name: "Masala Dosa",
    description: "Crispy dosa filled with spiced potato mixture",
    price: 80,
    category: "South Indian",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop",
    available: true,
    preparationTime: 8
  },
  {
    id: 4,
    name: "Chicken Tikka",
    description: "Grilled chicken pieces marinated in yogurt and spices",
    price: 90,
    category: "Starter",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop",
    available: true,
    preparationTime: 10
  },
  {
    id: 5,
    name: "Dal Makhani",
    description: "Creamy black lentils slow-cooked with butter and cream",
    price: 85,
    category: "Main Course",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop",
    available: true,
    preparationTime: 20
  },
  {
    id: 6,
    name: "Samosa",
    description: "Crispy fried pastry filled with spiced potato mixture",
    price: 25,
    category: "Snack",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop",
    available: true,
    preparationTime: 5
  },
  {
    id: 7,
    name: "Mango Lassi",
    description: "Refreshing yogurt drink with mango pulp",
    price: 40,
    category: "Beverage",
    image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop",
    available: true,
    preparationTime: 3
  },
  {
    id: 8,
    name: "Gulab Jamun",
    description: "Soft milk dumplings in rose-flavored syrup",
    price: 35,
    category: "Dessert",
    image: "https://images.unsplash.com/photo-1563805042-7684c019e4cb?w=400&h=300&fit=crop",
    available: true,
    preparationTime: 5
  }
];

export const categories = [
  "All",
  "Main Course",
  "South Indian",
  "Starter",
  "Snack",
  "Beverage",
  "Dessert"
];

export const orderStatuses = [
  "Pending",
  "Preparing",
  "Ready",
  "Completed",
  "Cancelled"
];

export const dummyOrders = [
  {
    id: 1,
    studentId: "student1",
    studentName: "John Doe",
    studentEmail: "john.doe@hitam.org",
    items: [
      { id: 1, name: "Chicken Biryani", quantity: 1, price: 120 },
      { id: 6, name: "Samosa", quantity: 2, price: 25 }
    ],
    totalAmount: 170,
    status: "Preparing",
    orderTime: "2024-01-15T10:30:00Z",
    requiredByTime: "2024-01-15T12:00:00Z",
    paymentStatus: "Paid"
  },
  {
    id: 2,
    studentId: "student2",
    studentName: "Jane Smith",
    studentEmail: "jane.smith@hitam.org",
    items: [
      { id: 2, name: "Paneer Butter Masala", quantity: 1, price: 100 },
      { id: 7, name: "Mango Lassi", quantity: 1, price: 40 }
    ],
    totalAmount: 140,
    status: "Ready",
    orderTime: "2024-01-15T09:45:00Z",
    requiredByTime: "2024-01-15T11:30:00Z",
    paymentStatus: "Paid"
  },
  {
    id: 3,
    studentId: "student3",
    studentName: "Mike Johnson",
    studentEmail: "mike.johnson@hitam.org",
    items: [
      { id: 3, name: "Masala Dosa", quantity: 2, price: 80 }
    ],
    totalAmount: 160,
    status: "Completed",
    orderTime: "2024-01-15T08:15:00Z",
    requiredByTime: "2024-01-15T10:00:00Z",
    paymentStatus: "Paid"
  }
];

export const analyticsData = {
  popularItems: [
    { name: "Chicken Biryani", orders: 45 },
    { name: "Masala Dosa", orders: 38 },
    { name: "Paneer Butter Masala", orders: 32 },
    { name: "Samosa", orders: 28 },
    { name: "Mango Lassi", orders: 25 }
  ],
  peakHours: [
    { hour: "12:00", orders: 15 },
    { hour: "13:00", orders: 22 },
    { hour: "14:00", orders: 18 },
    { hour: "19:00", orders: 12 },
    { hour: "20:00", orders: 8 }
  ],
  dailyRevenue: [
    { day: "Monday", revenue: 2500 },
    { day: "Tuesday", revenue: 3200 },
    { day: "Wednesday", revenue: 2800 },
    { day: "Thursday", revenue: 3500 },
    { day: "Friday", revenue: 4000 },
    { day: "Saturday", revenue: 1800 },
    { day: "Sunday", revenue: 1200 }
  ]
};

export const notifications = [
  {
    id: 1,
    type: "order_update",
    title: "Order Status Update",
    message: "Your order #001 is now ready for pickup!",
    timestamp: "2024-01-15T11:30:00Z",
    read: false
  },
  {
    id: 2,
    type: "payment_success",
    title: "Payment Confirmed",
    message: "Payment of ₹170 has been successfully processed for order #001",
    timestamp: "2024-01-15T10:35:00Z",
    read: true
  },
  {
    id: 3,
    type: "order_update",
    title: "Order Status Update",
    message: "Your order #002 is being prepared",
    timestamp: "2024-01-15T10:00:00Z",
    read: false
  }
];
