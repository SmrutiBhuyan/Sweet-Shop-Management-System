const mongoose = require('mongoose');
const { connectDB, disconnectDB, clearDB } = require('../config/database');
const Sweet = require('../models/Sweet');

/**
 * Test Suite: Sweet Model
 * Following TDD approach: Red -> Green -> Refactor
 */
describe('Sweet Model Tests', () => {
  
  // Connect to test database before all tests
  beforeAll(async () => {
    await connectDB();
  });

  // Clear database before each test
  beforeEach(async () => {
    await clearDB();
  });

  // Disconnect from database after all tests
  afterAll(async () => {
    await disconnectDB();
  });

  /**
   * Test 1: Create a valid sweet
   */
  describe('Creating a new sweet', () => {
    
    it('should create a sweet successfully with valid data', async () => {
      // Arrange: Prepare test data
      const sweetData = {
        name: 'Chocolate Truffle',
        description: 'Rich dark chocolate truffle with cocoa dusting',
        category: 'Chocolates',
        price: 25.50,
        quantityInStock: 100,
        imageUrl: 'https://example.com/chocolate-truffle.jpg'
      };

      // Act: Create the sweet
      const sweet = new Sweet(sweetData);
      const savedSweet = await sweet.save();

      // Assert: Verify the sweet was created correctly
      expect(savedSweet._id).toBeDefined();
      expect(savedSweet.name).toBe(sweetData.name);
      expect(savedSweet.description).toBe(sweetData.description);
      expect(savedSweet.category).toBe(sweetData.category);
      expect(savedSweet.price).toBe(sweetData.price);
      expect(savedSweet.quantityInStock).toBe(sweetData.quantityInStock);
      expect(savedSweet.imageUrl).toBe(sweetData.imageUrl);
      expect(savedSweet.createdAt).toBeDefined();
      expect(savedSweet.updatedAt).toBeDefined();
    });

    /**
     * Test 2: Sweet name validation
     */
    it('should fail when name is missing', async () => {
      // Arrange: Prepare invalid data (no name)
      const sweetData = {
        description: 'Rich dark chocolate truffle',
        category: 'Chocolates',
        price: 25.50,
        quantityInStock: 100
      };

      // Act & Assert: Should throw validation error
      const sweet = new Sweet(sweetData);
      let error;
      try {
        await sweet.save();
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(error.errors.name).toBeDefined();
    });

    /**
     * Test 3: Sweet name should be unique
     */
    it('should not allow duplicate sweet names', async () => {
      // Arrange: Create first sweet
      const sweetData = {
        name: 'Unique Chocolate Bar',
        description: 'A unique chocolate bar',
        category: 'Chocolates',
        price: 20,
        quantityInStock: 50
      };

      const firstSweet = new Sweet(sweetData);
      await firstSweet.save();
// Wait a bit for index to be created
      await new Promise(resolve => setTimeout(resolve, 100));

      // Act & Assert: Try to create second sweet with same name
      const secondSweet = new Sweet(sweetData);
      let error;
      try {
        await secondSweet.save();
      } catch (err) {
        error = err;
      }
      expect(error).toBeDefined();
         expect(error.name).toBe('MongoServerError'); // Changed from error.code
      expect(error.code).toBe(11000); // MongoDB duplicate key error
    });

    /**
     * Test 4: Price validation
     */
    it('should fail when price is negative', async () => {
      // Arrange: Prepare invalid data (negative price)
      const sweetData = {
        name: 'Chocolate Bar',
        description: 'A chocolate bar',
        category: 'Chocolates',
        price: -10, // Invalid: negative price
        quantityInStock: 50
      };

      // Act & Assert
      const sweet = new Sweet(sweetData);
      let error;
      try {
        await sweet.save();
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(error.errors.price).toBeDefined();
    });

    /**
     * Test 5: Category validation
     */
    it('should fail with invalid category', async () => {
      // Arrange: Prepare invalid data (wrong category)
      const sweetData = {
        name: 'Test Sweet',
        description: 'A test sweet',
        category: 'InvalidCategory', // Not in enum
        price: 20,
        quantityInStock: 50
      };

      // Act & Assert
      const sweet = new Sweet(sweetData);
      let error;
      try {
        await sweet.save();
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(error.errors.category).toBeDefined();
    });

    /**
     * Test 6: Quantity validation
     */
    it('should fail when quantity is negative', async () => {
      // Arrange: Prepare invalid data (negative quantity)
      const sweetData = {
        name: 'Chocolate Bar',
        description: 'A chocolate bar',
        category: 'Chocolates',
        price: 20,
        quantityInStock: -5 // Invalid: negative quantity
      };

      // Act & Assert
      const sweet = new Sweet(sweetData);
      let error;
      try {
        await sweet.save();
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(error.errors.quantityInStock).toBeDefined();
    });
  });

  /**
   * Test 7: Virtual property - isInStock
   */
  describe('Virtual Properties', () => {
    
    it('should return true for isInStock when quantity > 0', async () => {
      // Arrange: Create sweet with stock
      const sweet = await Sweet.create({
        name: 'In Stock Sweet',
        description: 'A sweet that is in stock',
        category: 'Chocolates',
        price: 20,
        quantityInStock: 10
      });

      // Assert
      expect(sweet.isInStock).toBe(true);
    });

    it('should return false for isInStock when quantity is 0', async () => {
      // Arrange: Create sweet without stock
      const sweet = await Sweet.create({
        name: 'Out of Stock Sweet',
        description: 'A sweet that is out of stock',
        category: 'Chocolates',
        price: 20,
        quantityInStock: 0
      });

      // Assert
      expect(sweet.isInStock).toBe(false);
    });

    /**
     * Test 8: Virtual property - formattedPrice
     */
    it('should format price correctly', async () => {
      // Arrange: Create sweet
      const sweet = await Sweet.create({
        name: 'Price Test Sweet',
        description: 'Testing price formatting',
        category: 'Chocolates',
        price: 25.5,
        quantityInStock: 10
      });

      // Assert
      expect(sweet.formattedPrice).toBe('₹25.50');
    });
  });

  /**
   * Test 9: Instance method - purchase
   */
  describe('Instance Methods', () => {
    
    it('should reduce quantity when purchasing', async () => {
      // Arrange: Create sweet with initial stock
      const sweet = await Sweet.create({
        name: 'Purchase Test Sweet',
        description: 'Testing purchase method',
        category: 'Chocolates',
        price: 20,
        quantityInStock: 100
      });

      // Act: Purchase 30 items
      await sweet.purchase(30);

      // Assert: Stock should be reduced
      expect(sweet.quantityInStock).toBe(70);
    });

    it('should throw error when purchasing more than available', async () => {
      // Arrange: Create sweet with limited stock
      const sweet = await Sweet.create({
        name: 'Limited Stock Sweet',
        description: 'Testing purchase limits',
        category: 'Chocolates',
        price: 20,
        quantityInStock: 5
      });

      // Act & Assert: Try to purchase more than available
      try {
        await sweet.purchase(10);
        // If we reach here, test should fail
        expect(true).toBe(false);
      } catch (error) {
        expect(error.message).toContain('Not enough stock');
      }
    });

    /**
     * Test 10: Instance method - restock
     */
    it('should increase quantity when restocking', async () => {
      // Arrange: Create sweet
      const sweet = await Sweet.create({
        name: 'Restock Test Sweet',
        description: 'Testing restock method',
        category: 'Chocolates',
        price: 20,
        quantityInStock: 50
      });

      // Act: Restock 25 items
      await sweet.restock(25);

      // Assert: Stock should be increased
      expect(sweet.quantityInStock).toBe(75);
    });

    it('should throw error when restocking with negative quantity', async () => {
      // Arrange: Create sweet
      const sweet = await Sweet.create({
        name: 'Restock Error Sweet',
        description: 'Testing restock errors',
        category: 'Chocolates',
        price: 20,
        quantityInStock: 50
      });

      // Act & Assert: Try to restock negative quantity
      try {
        await sweet.restock(-5);
        // If we reach here, test should fail
        expect(true).toBe(false);
      } catch (error) {
        expect(error.message).toContain('Restock quantity must be greater than 0');
      }
    });
  });

  /**
   * Test 11: Static method - findLowStock
   */
  describe('Static Methods', () => {
    
    beforeEach(async () => {
      // Create test sweets with different stock levels
       await Sweet.create({
          name: 'Low Stock Sweet 1',
          description: 'Very low stock',
          category: 'Chocolates',
          price: 20,
          quantityInStock: 5 // Low stock (< 10, < 20)
        });
        
        await Sweet.create({
          name: 'Low Stock Sweet 2',
          description: 'Also low stock',
          category: 'Cakes',
          price: 30,
          quantityInStock: 8 // Low stock (< 10, < 20)
        });
        
        await Sweet.create({
          name: 'High Stock Sweet',
          description: 'Plenty in stock',
          category: 'Cookies',
          price: 15,
          quantityInStock: 50 // High stock (NOT < 20)
        });
    });

    it('should find sweets with stock below threshold', async () => {
      // Act: Find low stock sweets (default threshold: 10)
      const lowStockSweets = await Sweet.findLowStock();

      // Assert: Should find 2 sweets
      expect(lowStockSweets).toHaveLength(2);
      expect(lowStockSweets[0].name).toBe('Low Stock Sweet 1');
      expect(lowStockSweets[1].name).toBe('Low Stock Sweet 2');
    });

        it('should find sweets with custom threshold', async () => {
        // Act: Find sweets with stock less than 20
        const lowStockSweets = await Sweet.findLowStock(20);

        // Assert: Should find 2 sweets (5 < 20 and 8 < 20, 50 is NOT < 20)
        expect(lowStockSweets).toHaveLength(2);
        expect(lowStockSweets[0].name).toBe('Low Stock Sweet 1');
        expect(lowStockSweets[1].name).toBe('Low Stock Sweet 2');
      });

    /**
     * Test 12: Static method - findByCategory
     */
    it('should find sweets by category (case insensitive)', async () => {
      // Act: Find all chocolates
      const chocolates = await Sweet.findByCategory('chocolates'); // lowercase

      // Assert: Should find 1 sweet
      expect(chocolates).toHaveLength(1);
      expect(chocolates[0].category).toBe('Chocolates');
    });
  });

  /**
   * Test 13: Update timestamp middleware
   */
  describe('Middleware', () => {
    
    it('should update updatedAt timestamp when saving', async () => {
      // Arrange: Create sweet
      const sweet = await Sweet.create({
        name: 'Timestamp Test Sweet',
        description: 'Testing timestamp updates',
        category: 'Chocolates',
        price: 20,
        quantityInStock: 50
      });

      const originalUpdatedAt = sweet.updatedAt;

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 10));

      // Act: Update the sweet
      sweet.description = 'Updated description';
      await sweet.save();

      // Assert: updatedAt should be newer
      expect(sweet.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });
});