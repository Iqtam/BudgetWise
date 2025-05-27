<script>
  import { onMount } from "svelte";

  let transactions = [];

  let description = "";
  let amount = "";
  let type = "expense";
  let category_id = "";
  let newCategory = "";
  let date = "";

  let categories = [];

  // onMount(async () => {
  //   try {
  //     const res = await fetch("http://localhost:5000/api/categories");
  //     categories = await res.json();
  //   } catch (err) {
  //     console.error("Failed to load categories", err);
  //   }
  // });

  onMount(async () => {
    try {
      const [catRes, txRes] = await Promise.all([
        fetch("http://localhost:5000/api/categories"),
        fetch("http://localhost:5000/api/transactions"),
      ]);

      categories = await catRes.json();
      transactions = await txRes.json();
    } catch (err) {
      console.error("Failed to load data", err);
    }
  });

  function getCategoryName(id) {
    const cat = categories.find((c) => c.id === id);
    return cat ? cat.name : "Unknown";
  }

  async function createCategory() {
    if (!newCategory.trim()) return;

    try {
      const res = await fetch("http://localhost:5000/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategory, type }),
      });

      const created = await res.json();
      categories = [...categories, created];
      category_id = created.id;
      newCategory = "";
    } catch (err) {
      console.error("Error creating category:", err);
    }
  }

  async function addTransaction() {
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Amount must be a positive number!");
      return;
    }
    const newTx = {
      user_id: "4be7b2a2-1ca3-46d8-9a5c-9fba68afeda1",
      amount: parsedAmount,
      description,
      type,
      date,
      category_id,
    };

    try {
      const response = await fetch("http://localhost:5000/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTx),
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
        description = "";
        amount = "";
        type = "expense";
        category_id = "";
        date = "";
      } else {
        alert(result.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  }

  async function deleteTransaction(id) {
  if (!confirm('Are you sure you want to delete this transaction?')) return;

  try {
    const res = await fetch(`http://localhost:5000/api/transactions/${id}`, {
      method: 'DELETE'
    });

    if (!res.ok) throw new Error('Delete failed');

    // Remove from local array
    transactions = transactions.filter(tx => tx.id !== id);
  } catch (err) {
    console.error('Delete error:', err);
    alert('Could not delete transaction');
  }
}

</script>

<main>
  <h1>💸 Add a Transaction</h1>

  <form on:submit|preventDefault={addTransaction}>
    <select bind:value={type}>
      <option value="income">Income</option>
      <option value="expense">Expense</option>
    </select>

    <select bind:value={category_id} required>
      <option value="" disabled selected>Select a Category</option>
      {#each categories.filter((c) => c.type === type) as c}
        <option value={c.id}>{c.name}</option>
      {/each}
    </select>

    <div style="display: flex; gap: 10px">
      <input
        type="text"
        placeholder="Or add new category"
        bind:value={newCategory}
      />
      <button type="button" on:click={createCategory}>➕ Add</button>
    </div>

    <input
      type="number"
      placeholder="Amount"
      bind:value={amount}
      step="0.01"
      required
    />

    <input type="date" placeholder="Date" bind:value={date} />

    <input type="text" placeholder="Description" bind:value={description} />

    <button type="submit">➕ Add Transaction</button>
  </form>

  <!-- <ul>
    {#each transactions as tx}
      <li class:income={tx.amount > 0} class:expense={tx.amount < 0}>
        {getCategoryName(tx.category_id)}: ${tx.amount}
      </li>
    {/each}
  </ul> -->
  <table>
  <thead>
    <tr>
      <th>Category</th>
      <th>Type</th>
      <th>Amount</th>
      <th>Date</th>
      <th>Action</th>
    </tr>
  </thead>
  <tbody>
    {#each transactions as tx}
      <tr class:income={tx.amount > 0} class:expense={tx.amount < 0}>
        <td>{getCategoryName(tx.category_id)}</td>
        <td>{tx.type}</td>
        <td>${parseFloat(tx.amount).toFixed(2)}</td>
        <td>{tx.date}</td>
        <td>
          <button class="delete" on:click={() => deleteTransaction(tx.id)}>🗑 Delete</button>
        </td>
      </tr>
    {/each}
  </tbody>
</table>

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

  input,
  select {
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

  table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1.5rem;
}

th, td {
  padding: 10px;
  border: 1px solid #ccc;
  text-align: center;
}

.income {
  color: green;
}

.expense {
  color: red;
}

button.delete {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}

button.delete:hover {
  background-color: #c0392b;
}

</style>
