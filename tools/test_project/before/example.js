// JavaScript example with various syntax elements
class UserManager {
  constructor(database) {
    this.db = database;
    this.users = [];
  }

  async addUser(name, email) {
    const user = {
      id: this.generateId(),
      name: name,
      email: email,
      created: new Date()
    };
    
    this.users.push(user);
    await this.db.save(user);
    return user;
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }

  findUserByEmail(email) {
    return this.users.find(u => u.email === email);
  }
}

module.exports = UserManager;
