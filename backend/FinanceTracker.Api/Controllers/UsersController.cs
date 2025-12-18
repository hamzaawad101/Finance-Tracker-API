using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System;
using MongoDB.Driver;
using BCrypt.Net;

using FinanceTracker.Api.Models;
using FinanceTracker.Api.Services;

namespace FinanceTracker.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly MongoDbService _mongoService;

        public UserController(MongoDbService mongoService)
        {
            _mongoService = mongoService;
        }

        [HttpGet]
        public ActionResult<List<User>> GetAllUsers()
        {
            return _mongoService.Users.Find(_ => true).ToList();
        }

        [HttpGet("{id}")]
        public ActionResult<User> GetUserById(string id)
        {
            var user = _mongoService.Users.Find(u => u.Id == id).FirstOrDefault();
            if (user == null)
            {   
             return NotFound();
            }
            return Ok(user);
        }

        [HttpPost]
        public ActionResult<User> CreateUser([FromBody] User newUser)
        {
            newUser.Id = Guid.NewGuid().ToString();
             newUser.Password = BCrypt.Net.BCrypt.HashPassword(newUser.Password);
            _mongoService.Users.InsertOne(newUser);
            return CreatedAtAction(nameof(GetUserById), new { id = newUser.Id }, newUser);
        }
        [HttpPatch("{id}")]
        public ActionResult<User> UpdateUser(string id, [FromBody] User updatedUser)
        {
            var existingUser = _mongoService.Users.Find(u => u.Id == id).FirstOrDefault();
            if (existingUser == null) return NotFound();

            var update = Builders<User>.Update;
            var updates = new List<UpdateDefinition<User>>();

            if (!string.IsNullOrEmpty(updatedUser.Name))
                updates.Add(update.Set(u => u.Name, updatedUser.Name));

            if (!string.IsNullOrEmpty(updatedUser.Email))
                updates.Add(update.Set(u => u.Email, updatedUser.Email));

            if (!string.IsNullOrEmpty(updatedUser.Password))
                updates.Add(update.Set(u => u.Password, BCrypt.Net.BCrypt.HashPassword(updatedUser.Password)));

            if (updates.Count > 0)
                _mongoService.Users.UpdateOne(u => u.Id == id, update.Combine(updates));

            var userAfterUpdate = _mongoService.Users.Find(u => u.Id == id).FirstOrDefault();
            return Ok(userAfterUpdate);
        }

         [HttpDelete("{id}")]
           public ActionResult<User> DeleteUser(string id)
        {
            var UserToDelete=_mongoService.Users.Find(u=>u.Id==id).FirstOrDefault();
            if (UserToDelete == null)
            {
                return NotFound();
            }
            _mongoService.Users.DeleteOne(u=>u.Id==id);
            return Ok(UserToDelete);
        }

    }
}
