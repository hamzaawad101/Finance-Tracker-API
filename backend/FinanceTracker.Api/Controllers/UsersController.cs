using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System;
using MongoDB.Driver;
using BCrypt.Net;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;

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

      [HttpPost("login")]
public ActionResult Login([FromBody] LoginRequest request)
{
    var user = _mongoService.Users
        .Find(u => u.Email == request.Email)
        .FirstOrDefault();

    
    if (user == null ||
    string.IsNullOrEmpty(request.Password) ||
    string.IsNullOrEmpty(user.Password) ||
    !BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
    {
        return Unauthorized(new { message = "Invalid email or password" });
    }

    var jwtKey = HttpContext.RequestServices
    .GetRequiredService<IConfiguration>()["Jwt:Key"];

    if (string.IsNullOrEmpty(jwtKey))
    {
        throw new InvalidOperationException("JWT Key is missing");
    }

    var key = Encoding.UTF8.GetBytes(jwtKey);


    var tokenDescriptor = new SecurityTokenDescriptor
    {
        Subject = new ClaimsIdentity(new[]
        {
            new Claim("id", user.Id),
            new Claim(ClaimTypes.Email, user.Email)
        }),
        Expires = DateTime.UtcNow.AddMinutes(60),
        SigningCredentials = new SigningCredentials(
            new SymmetricSecurityKey(key),
            SecurityAlgorithms.HmacSha256Signature
        )
    };

    var tokenHandler = new JwtSecurityTokenHandler();
    var token = tokenHandler.CreateToken(tokenDescriptor);

    return Ok(new
    {
        message = "Login successful",
        token = tokenHandler.WriteToken(token)
    });
}

         [HttpPost("signup")]
        public ActionResult<User> CreateUser([FromBody] User newUser)
        {
            // Check if email already exists
            var existingUser = _mongoService.Users.Find(u => u.Email == newUser.Email).FirstOrDefault();
            if (existingUser != null)
            {
                return Conflict(new { message = "Email already in use" });
            }

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
