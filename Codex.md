# Pages

/ = landing page for marketing the features
/budget = home page for a logged in user, summary of their current month finances. Users will only look at one month/year while on this page. A budget consists of many budgetItems. These budgetItems are grouped in order to align all of them on the UI. A user's expected income and expenses should be calculated by adding all of the budgetItems for each month from their respective categories. Users should be able to get a good overview of their overall health for the month (am i spending too much on one category?) and also adjust the values of each budget item inline. They should also be able to add new budgetItems and categories on this page.
/transactions = page where a user is able to add/view transactions in their account across multiple months
/accounts = page where a user can add/view the accounts that are connected to their financial transactions
/chat = page where a user can talk to a helpful chat bot about their finances

# Unauthenticated Experience

If a user is not logged in then they should see an auth layout for /login and /register and a landing page.

# Authenticated Experience

The user will have a sidebar layout with the 4 pages above. 

# Tools

This project heavily uses the Tanstack libraries for front-end development.
Routing library is Tanstack Router.
Local-first experience is powered by Tanstack DB and Tanstack Query.
Headless forms are built with Tanstack Form.
State across the app is managed by Tanstack Store.

Styling is done with Tailwind and a set of Tailwind components /src/components/ui

# Collections

All of the business logic that is non-crud will be driven through tanstack db and the collections to make this a 
local-first app. 

Most of these collections can use simple CRUD operations and that's it, but some will require multi collection updates.

## Non-crud examples

Now lets build the transactions page, a user should be able to create a new transactions and view all of their transactions on a sophisticated table built with Tanstack Table. Please consider the business logic below related to creating a new transaction.

New Transaction: A transaction will always be associated with a budgetItem, if a transaction is added it needs to affect the actualAmount value on that budget item. This app should do the math on the client, update both collections locally and send the updated down to the API with an optimistic UI.

Delete BudgetItem: If a budgetItem is deleted we do not want to delete all of the associated transactions. Therefore all of the transactions need to be updated to a misc/uncategorized category which should exist on every budget