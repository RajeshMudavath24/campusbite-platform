// Utility to seed menu items in Firestore
import { db } from '../firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

export const seedMenuItems = async () => {
  const menuItems = [
    {
      name: 'Chicken Biryani',
      description: 'Fragrant basmati rice with tender chicken pieces and aromatic spices',
      price: 180,
      category: 'Main Course',
      isAvailable: true,
      image: 'https://images.unsplash.com/photo-1563379091339-03246963d2d4?w=400&h=300&fit=crop'
    },
    {
      name: 'Veg Fried Rice',
      description: 'Stir-fried rice with fresh vegetables and soy sauce',
      price: 120,
      category: 'Main Course',
      isAvailable: true,
      image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop'
    },
    {
      name: 'Chicken Curry',
      description: 'Spicy chicken curry with onions, tomatoes and traditional spices',
      price: 150,
      category: 'Main Course',
      isAvailable: true,
      image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop'
    },
    {
      name: 'Dal Tadka',
      description: 'Yellow lentils tempered with spices and herbs',
      price: 80,
      category: 'Main Course',
      isAvailable: true,
      image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop'
    },
    {
      name: 'Chicken Sandwich',
      description: 'Grilled chicken with fresh vegetables and mayo on whole wheat bread',
      price: 90,
      category: 'Snacks',
      isAvailable: true,
      image: 'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=400&h=300&fit=crop'
    },
    {
      name: 'Veg Burger',
      description: 'Vegetarian patty with lettuce, tomato, and special sauce',
      price: 75,
      category: 'Snacks',
      isAvailable: true,
      image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop'
    },
    {
      name: 'Chicken Noodles',
      description: 'Stir-fried noodles with chicken and mixed vegetables',
      price: 110,
      category: 'Main Course',
      isAvailable: true,
      image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop'
    },
    {
      name: 'Mango Lassi',
      description: 'Refreshing yogurt drink with mango pulp',
      price: 50,
      category: 'Beverages',
      isAvailable: true,
      image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=300&fit=crop'
    },
    {
      name: 'Masala Chai',
      description: 'Traditional spiced tea with milk',
      price: 25,
      category: 'Beverages',
      isAvailable: true,
      image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop'
    },
    {
      name: 'Chocolate Cake',
      description: 'Rich chocolate cake with chocolate frosting',
      price: 60,
      category: 'Desserts',
      isAvailable: true,
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop'
    }
  ];

  try {
    const menuRef = collection(db, 'menu');
    for (const item of menuItems) {
      await addDoc(menuRef, item);
      console.log('Added menu item:', item.name);
    }
    console.log('Menu seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding menu items:', error);
  }
};

// Function to check if menu items exist
export const checkMenuItems = async () => {
  try {
    const menuRef = collection(db, 'menu');
    const snapshot = await getDocs(menuRef);
    console.log('Number of menu items:', snapshot.size);
    return snapshot.size > 0;
  } catch (error) {
    console.error('Error checking menu items:', error);
    return false;
  }
};
