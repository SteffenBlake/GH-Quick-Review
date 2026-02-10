// JavaScript example with various syntax elements
class UserManager {
  constructor(database, logger) {
    this.db = database;
    this.logger = logger;
    this.users = [];
    this.cache = new Map();
  }

  async addUser(name, email) {
    // Validate inputs
    if (!name || !email) {
      throw new Error('Name and email are required');
    }

    const user = {
      id: this.generateId(),
      name: name,
      email: email,
      created: new Date(),
      active: true
    };
    
    this.users.push(user);
    this.cache.set(email, user);
    await this.db.save(user);
    
    this.logger.info(`User created: ${email}`);
    return user;
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }

  findUserByEmail(email) {
    // Check cache first
    if (this.cache.has(email)) {
      return this.cache.get(email);
    }
    return this.users.find(u => u.email === email);
  }
}

export default UserManager;
