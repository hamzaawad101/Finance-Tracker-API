using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System;
using MongoDB.Driver;
using FinanceTracker.Api.Models;
using FinanceTracker.Api.Services;

namespace FinanceTracker.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TransactionsController : ControllerBase
    {
        private readonly MongoDbService _mongoService;

        public TransactionsController(MongoDbService mongoService)
        {
            _mongoService = mongoService;
        }

        [HttpGet]
        public ActionResult<List<Transaction>> GetAllTransactions()
        {
            return _mongoService.Transactions.Find(_ => true).ToList();
        }

        [HttpGet("{id}")]
        public ActionResult<Transaction> GetTransactionById(string id)
        {
            var transaction = _mongoService.Transactions.Find(t => t.Id == id).FirstOrDefault();
            if (transaction == null) return NotFound();
            return transaction;
        }

        [HttpPost]
        public ActionResult<Transaction> CreateTransaction([FromBody] Transaction newTransaction)
        {
            newTransaction.Id = Guid.NewGuid().ToString();
            _mongoService.Transactions.InsertOne(newTransaction);
            return CreatedAtAction(nameof(GetTransactionById), new { id = newTransaction.Id }, newTransaction);
        }

        [HttpPatch("{id}")]
        public ActionResult<Transaction> UpdateTransaction(string id, [FromBody] Transaction updatedTransaction)
        {
            var current = _mongoService.Transactions.Find(t => t.Id == id).FirstOrDefault();
            if (current == null) return NotFound();

            var update = Builders<Transaction>.Update;
            var updates = new List<UpdateDefinition<Transaction>>();

            if (updatedTransaction.Type != default)
                updates.Add(update.Set(t => t.Type, updatedTransaction.Type));

            if (updatedTransaction.Date != default)
                updates.Add(update.Set(t => t.Date, updatedTransaction.Date));

            if (updatedTransaction.Amount != 0)
                updates.Add(update.Set(t => t.Amount, updatedTransaction.Amount));

            if (updates.Count > 0)
                _mongoService.Transactions.UpdateOne(t => t.Id == id, update.Combine(updates));

            var transactionAfterUpdate = _mongoService.Transactions.Find(t => t.Id == id).FirstOrDefault();
            return Ok(transactionAfterUpdate);
        }


        [HttpDelete("{id}")]
        public ActionResult DeleteTransaction(string id)
        {
            var transactionToRemove = _mongoService.Transactions.Find(t => t.Id == id).FirstOrDefault();
            if (transactionToRemove == null) return NotFound();

            _mongoService.Transactions.DeleteOne(t => t.Id == id);
            return NoContent();
        }
    }
}
