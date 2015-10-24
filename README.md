### For Alex

I added some todos in the API section, line 42
The basics are there, I just need you to add the class initialization for what's needed where.
I don't have a league or Teams table yet in the DB, they would be helpful in case the server crashes, but I can add them, it's a nice to have.
The ideal would be to have the classes initialize with values from the db. See what I did in line 40 and 41. That was a big breakthrough, getting the data from the db before I initialized the classes.

If you go to
`localhost:3000/league`
You'll see the league stats.

If you go to
`localhost:3000/players`
You'll see the total playerpool.

Currently, these are almost the same, because there are no teams, right. For testing I'll add some teams etc.

Also, you'll need to checkout line 357, this was erroring out because of the assignment in the function initialization. I removed the assignment, but I haven't used the add_player_to_team method yet, so it might be broken.






You'll need node.js installed on your box.
When you have it installed, run `node app.js` to start the app. I don't have gulp installed or anything, but that might be helpful.

Development strategy:
You can build modules in the `./modules` directory. The modules can load other modules. To create functions that can be exported to other modules or the main app, use the syntax below:

```
exports.functionName = function() {
  some code here
  return something
};
```

You can call these functions in other modules by requiring the module and calling the function like below. If the module was installed by npm, you can just call it by name. If the module was written by us, you'll need to reference it's file path relative to the file you are in.

`moduleName.functinName();`

Modules installed from npm are stored in the node_modules folder.

Some notes for Alex. When I started this, I decided to scrape a bunch of historical stats and store them in a mongodb. If you want to have the draft data persist, it would be trivial to add in mongo hooks, because it is already integrated. I thought about this, and it might be worthwhile if the server crashes in between rounds or if we want to audit the draft data after the fact.

Anywho, that can be a stretch goal, and it would be trivial to switch to postgres.
