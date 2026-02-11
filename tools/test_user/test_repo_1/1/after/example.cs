// C# example with various syntax elements
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace UserManagement
{
    public class UserService
    {
        private readonly IDatabase _database;
        private readonly ILogger _logger;
        private List<User> _users;

        public UserService(IDatabase database, ILogger logger)
        {
            _database = database;
            _logger = logger;
            _users = new List<User>();
        }

        public async Task<User> CreateUser(string name, string email)
        {
            // Validate inputs
            if (string.IsNullOrWhiteSpace(name) || string.IsNullOrWhiteSpace(email))
            {
                throw new ArgumentException("Name and email are required");
            }

            var user = new User
            {
                Id = Guid.NewGuid(),
                Name = name,
                Email = email,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            _users.Add(user);
            await _database.SaveAsync(user);
            
            _logger.LogInformation($"User created: {email}");
            return user;
        }

        public User FindByEmail(string email)
        {
            return _users.FirstOrDefault(u => u.Email == email);
        }
    }
}
