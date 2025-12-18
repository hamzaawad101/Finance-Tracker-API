using MongoDB.Driver;
using Microsoft.Extensions.Options;
using FinanceTracker.Api.Models;
using FinanceTracker.Api.Services;   // for MongoDbService
using FinanceTracker.Api.Middleware; // for TransactionAuthMiddleware

namespace FinanceTracker.Api.Services
{
    public class MongoDbService
    {
        private readonly IMongoDatabase _database;

       public MongoDbService(IOptions<MongoDBSettings> settings)
        {
            Console.WriteLine("ConnectionString: " + settings.Value.ConnectionString);
            var client = new MongoClient(settings.Value.ConnectionString);
            _database = client.GetDatabase(settings.Value.DatabaseName);
        }


        public IMongoCollection<User> Users => _database.GetCollection<User>("Users");
        public IMongoCollection<Transaction> Transactions => _database.GetCollection<Transaction>("Transactions");
    }

    public class MongoDBSettings
    {
        public string ConnectionString { get; set; } = string.Empty;
        public string DatabaseName { get; set; } = string.Empty;
    }
}

