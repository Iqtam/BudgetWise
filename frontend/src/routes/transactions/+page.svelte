<script>
  let transactions = [];

  // Form inputs
  let description = '';
  //let category_id = '';
  let amount = '';
  let type = 'expense';

  async function addTransaction() {
    const newTx = {
      user_id: '4be7b2a2-1ca3-46d8-9a5c-9fba68afeda1', 
      amount: parseFloat(amount),
      description,
      type
    };

    try {
      const response = await fetch('http://localhost:5000/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTx)
      });

      if (!response.ok) {
  const text = await response.text(); // fallback to show HTML/error
  throw new Error(text);
}

      const result = await response.json();

      if (response.ok) {
        // @ts-ignore
        transactions = [...transactions, result.data];
        // Clear form
        description = '';
        amount = '';
        type = 'expense';
      } else {
        alert(result.message || 'Something went wrong');
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  }
</script>

<main>
  <h1>💸 Add a Transaction</h1>

  <form on:submit|preventDefault={addTransaction}>
    <input
      type="number"
      placeholder="Amount"
      bind:value={amount}
      step="0.01"
      required
    />
    <input
      type="text"
      placeholder="Description"
      bind:value={description}
      required
    />
    
    <select bind:value={type}>
      <option value="income">Income</option>
      <option value="expense">Expense</option>
    </select>
    <button type="submit">➕ Add Transaction</button>
  </form>

  <ul>
    {#each transactions as tx}
      <li class:income={tx.amount > 0} class:expense={tx.amount < 0}>
        {tx.description}: ${tx.amount}
      </li>
    {/each}
  </ul>
</main>

<style>
  main {
    max-width: 600px;
    margin: 2rem auto;
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #f9f9f9;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 2rem;
  }

  input, select {
    padding: 10px;
    border-radius: 4px;
    border: 1px solid #ccc;
  }

  ul {
    list-style: none;
    padding: 0;
  }

  li {
    padding: 10px;
    margin: 5px 0;
    background-color: #eee;
    border-radius: 4px;
  }

  .income {
    color: green;
  }

  .expense {
    color: red;
  }

  button {
    padding: 10px;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  button:hover {
    background-color: #45a049;
  }
</style>
