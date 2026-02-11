// C# example with various syntax elements
using System;
using System.Collections.Generic;
using System.Linq;

namespace UserManagement
{
    public class UserService
    {
        private readonly IDatabase _database;
        private List<User> _users;

        public UserService(IDatabase database)
        {
            _database = database;
            _users = new List<User>();
        }

        public async Task<User> CreateUser(string name, string email)
        {
            var user = new User
            {
                Id = Guid.NewGuid(),
                Name = name,
                Email = email,
                CreatedAt = DateTime.UtcNow
            };

            _users.Add(user);
            await _database.SaveAsync(user);
            return user;
        }

        public User FindByEmail(string email)
        {
            return _users.FirstOrDefault(u => u.Email == email);
        }
    }
}
