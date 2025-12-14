const mongoose = require('mongoose');
const Sweet = require('../models/Sweet');
const User = require('../models/User');

describe('Sweet Model', () => {
  let testUser;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await Sweet.deleteMany({});
    await User.deleteMany({});
    
    testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });
  });

  describe('Schema Validation', () => {
    it('should create a valid sweet', async () => {
      const sweetData = {
        name: 'Test Sweet',
        description: 'A delicious test sweet',
        category: 'Chocolate',
        price: 2.99,
        quantity: 50,
        createdBy: testUser._id
      };

      const sweet = new Sweet(sweetData);
      const savedSweet = await sweet.save();

      expect(savedSweet._id).toBeDefined();
      expect(savedSweet.name).toBe(sweetData.name);
      expect(savedSweet.category).toBe(sweetData.category);
      expect(savedSweet.price).toBe(sweetData.price);
      expect(savedSweet.quantity).toBe(sweetData.quantity);
      expect(savedSweet.imageUrl).toContain('placeholder.com');
      expect(savedSweet.createdAt).toBeDefined();
    });

    it('should require name', async () => {
      const sweet = new Sweet({
        category: 'Chocolate',
        price: 2.99,
        createdBy: testUser._id
      });

      await expect(sweet.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should enforce name length limit', async () => {
      const longName = 'a'.repeat(101);
      const sweet = new Sweet({
        name: longName,
        category: 'Chocolate',
        price: 2.99,
        createdBy: testUser._id
      });

      await expect(sweet.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should enforce description length limit', async () => {
      const longDescription = 'a'.repeat(501);
      const sweet = new Sweet({
        name: 'Test Sweet',
        description: longDescription,
        category: 'Chocolate',
        price: 2.99,
        createdBy: testUser._id
      });

      await expect(sweet.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should require valid category enum', async () => {
      const sweet = new Sweet({
        name: 'Test Sweet',
        category: 'InvalidCategory',
        price: 2.99,
        createdBy: testUser._id
      });

      await expect(sweet.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should require price within limits', async () => {
      const sweet = new Sweet({
        name: 'Test Sweet',
        category: 'Chocolate',
        price: -1,
        createdBy: testUser._id
      });

      await expect(sweet.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should require price not exceeding max limit', async () => {
      const sweet = new Sweet({
        name: 'Test Sweet',
        category: 'Chocolate',
        price: 1001,
        createdBy: testUser._id
      });

      await expect(sweet.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should require non-negative quantity', async () => {
      const sweet = new Sweet({
        name: 'Test Sweet',
        category: 'Chocolate',
        price: 2.99,
        quantity: -1,
        createdBy: testUser._id
      });

      await expect(sweet.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should require createdBy reference', async () => {
      const sweet = new Sweet({
        name: 'Test Sweet',
        category: 'Chocolate',
        price: 2.99
      });

      await expect(sweet.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });
  });

  describe('Default Values', () => {
    it('should default quantity to 0', async () => {
      const sweetData = {
        name: 'Test Sweet',
        category: 'Chocolate',
        price: 2.99,
        createdBy: testUser._id
      };

      const sweet = new Sweet(sweetData);
      const savedSweet = await sweet.save();

      expect(savedSweet.quantity).toBe(0);
    });

    it('should default imageUrl to placeholder', async () => {
      const sweetData = {
        name: 'Test Sweet',
        category: 'Chocolate',
        price: 2.99,
        createdBy: testUser._id
      };

      const sweet = new Sweet(sweetData);
      const savedSweet = await sweet.save();

      expect(savedSweet.imageUrl).toContain('placeholder.com');
    });

    it('should set createdAt timestamp', async () => {
      const sweetData = {
        name: 'Test Sweet',
        category: 'Chocolate',
        price: 2.99,
        createdBy: testUser._id
      };

      const sweet = new Sweet(sweetData);
      const savedSweet = await sweet.save();

      expect(savedSweet.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('Text Index', () => {
    it('should create text index for name and category', async () => {
      const indexes = await Sweet.collection.getIndexes();
      const textIndex = Object.values(indexes).find(index => 
        index.weights && (index.weights.name || index.weights.category)
      );
      
      expect(textIndex).toBeDefined();
    });

    it('should support text search', async () => {
      await Sweet.create([
        {
          name: 'Chocolate Bar',
          category: 'Chocolate',
          price: 2.99,
          createdBy: testUser._id
        },
        {
          name: 'Chocolate Cake',
          category: 'Cake',
          price: 19.99,
          createdBy: testUser._id
        },
        {
          name: 'Vanilla Candy',
          category: 'Candy',
          price: 1.99,
          createdBy: testUser._id
        }
      ]);

      const results = await Sweet.find({ $text: { $search: 'chocolate' } });
      expect(results).toHaveLength(2);
    });
  });

  describe('Populate Reference', () => {
    it('should populate createdBy field', async () => {
      const sweet = await Sweet.create({
        name: 'Test Sweet',
        category: 'Chocolate',
        price: 2.99,
        createdBy: testUser._id
      });

      const populatedSweet = await Sweet.findById(sweet._id)
        .populate('createdBy', 'username email');

      expect(populatedSweet.createdBy).toBeDefined();
      expect(populatedSweet.createdBy.username).toBe(testUser.username);
      expect(populatedSweet.createdBy.email).toBe(testUser.email);
    });
  });
});