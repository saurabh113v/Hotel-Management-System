const mongoose = require('mongoose');
const User = require('./models/User');
const Room = require('./models/Room');

const seedData = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Seeding initial database data...');

      // Seed Users
      await User.create({
        name: 'System Admin',
        email: 'admin@hotel.com',
        password: 'admin123',
        role: 'admin'
      });

      await User.create({
        name: 'John Doe',
        email: 'user@hotel.com',
        password: 'user123',
        role: 'user'
      });

      console.log('Test accounts seeded: admin@hotel.com (admin) and user@hotel.com (user) - password is "admin123" / "user123"');

      // Seed Rooms
      const rooms = [
        {
          name: 'Himalayan Retreat — Shimla',
          type: 'single',
          price: 3499,
          capacity: 1,
          description: 'A cozy mountain lodge escape nestled in the serene hills of Shimla. Complete with a heating fireplace, plush single bed, study desk, and panoramic view of snow-capped mountains.',
          image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80',
          images: [
            'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&q=80'
          ],
          location: 'Shimla',
          lat: 31.1048,
          lng: 77.1734,
          amenities: ['Heater', 'Workspace', 'Free Wi-Fi', 'Mountain View']
        },
        {
          name: 'Munnar Mist Valley Cottage — Kerala',
          type: 'single',
          price: 4999,
          capacity: 1,
          description: 'Enjoy absolute tranquility inside a luxury cottage overlooking the vast tea gardens of Munnar. Includes fresh organic herbal teas, high-speed Wi-Fi, and open deck.',
          image: 'https://images.unsplash.com/photo-1611891487122-2075b96244e1?auto=format&fit=crop&w=800&q=80',
          images: [
            'https://images.unsplash.com/photo-1611891487122-2075b96244e1?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1620626011761-996317b6979a?auto=format&fit=crop&w=800&q=80'
          ],
          location: 'Kerala',
          lat: 10.0889,
          lng: 77.0595,
          amenities: ['Tea Deck', 'Free Wi-Fi', 'Spa Access', 'Breakfast Included']
        },
        {
          name: 'Taj View Heritage Suite — Agra',
          type: 'couple',
          price: 12499,
          capacity: 2,
          description: 'Experience pure romance with direct window sights of the iconic Taj Mahal. Features a grand king-size bed, authentic Mughal vintage architecture, custom marble bath, and private butler.',
          image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
          images: [
            'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'
          ],
          location: 'Agra',
          lat: 27.1767,
          lng: 78.0081,
          amenities: ['Taj Mahal View', 'King Bed', 'Butler Service', 'Custom Bath']
        },
        {
          name: 'Goa beachfront Cabana — Goa',
          type: 'couple',
          price: 8999,
          capacity: 2,
          description: 'A beautiful beachside cabana right on the golden sands of Goa. Listen to the waves from your private sunset balcony. Comes with local wines and complimentary beach beds.',
          image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80',
          images: [
            'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=800&q=80'
          ],
          location: 'Goa',
          lat: 15.2993,
          lng: 74.1240,
          amenities: ['Beach Access', 'Balcony', 'Sunset View', 'Free Wi-Fi']
        },
        {
          name: 'Jaipur Royal Haveli Palace — Jaipur',
          type: 'family',
          price: 18499,
          capacity: 4,
          description: 'Live like royalty in a historic family Haveli in the heart of the Pink City. Features two massive bedrooms, hand-painted heritage walls, courtyard view, and private cultural tour guides.',
          image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
          images: [
            'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=800&q=80'
          ],
          location: 'Jaipur',
          lat: 26.9124,
          lng: 75.7873,
          amenities: ['Heritage Courtyard', 'Kitchenette', 'Cultural Tour Guide', '2 Bedrooms']
        },
        {
          name: 'Udaipur Lake Palace Penthouse — Udaipur',
          type: 'suite',
          price: 38999,
          capacity: 6,
          description: 'The pinnacle of luxury overlooking the tranquil waters of Lake Pichola. Features 3 master royal suites, a private rooftop plunge pool, dedicated luxury car service, home theater, and scenic sky decks.',
          image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
          images: [
            'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80'
          ],
          location: 'Udaipur',
          lat: 24.5854,
          lng: 73.7125,
          amenities: ['Lake View', 'Rooftop Plunge Pool', 'Chauffeur Service', 'Sky Deck']
        }
      ];

      await Room.create(rooms);
      console.log('Sample hotel rooms seeded successfully!');
    }
  } catch (err) {
    console.error('Database seeding failed:', err);
  }
};

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    console.log('Using existing MongoDB connection');
    return;
  }
  const connString = process.env.MONGO_URI || 'mongodb://localhost:27017/hotel-booking';
  mongoose.set('strictQuery', false);

  try {
    console.log(`Connecting to primary MongoDB: ${connString}`);
    await mongoose.connect(connString, {
      serverSelectionTimeoutMS: 2000
    });
    console.log('MongoDB Connected Successfully.');
    await seedData();
  } catch (err) {
    console.warn(`Primary Database connection failed (${err.message}). Trying In-Memory Fallback...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const memoryUri = mongoServer.getUri();
      console.log(`In-memory MongoDB started at: ${memoryUri}`);

      await mongoose.connect(memoryUri);
      console.log('In-Memory MongoDB Connected Successfully.');
      await seedData();
    } catch (memErr) {
      console.error('Fatal Database connection error:', memErr);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
